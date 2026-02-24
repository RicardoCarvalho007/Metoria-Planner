"use client";

import { useState, useTransition } from "react";
import {
  ChevronRight, ChevronDown, ChevronUp, Calendar, Clock,
  CheckCircle2, Sparkles, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COURSE_LABELS, CHAPTERS, type Course,
  getTopicsForCourse, getChapterForTopic,
} from "@/data/syllabus";
import { createStudyPlan } from "@/actions/plan";

type Step = "welcome" | "course" | "topics" | "examdate" | "availability" | "reveal";

const COURSE_OPTIONS: { course: Course; label: string; sublabel: string; icon: string }[] = [
  { course: "AA_HL", label: "Math AA HL", sublabel: "Analysis & Approaches Higher Level", icon: "∫" },
  { course: "AA_SL", label: "Math AA SL", sublabel: "Analysis & Approaches Standard Level", icon: "f(x)" },
  { course: "AI_HL", label: "Math AI HL", sublabel: "Applications & Interpretation Higher Level", icon: "∑" },
  { course: "AI_SL", label: "Math AI SL", sublabel: "Applications & Interpretation Standard Level", icon: "π" },
];

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_LABELS: Record<string, string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
};

type TimeSlot = { start: string; end: string };
function slotMinutes(slot: TimeSlot): number {
  const [sh, sm] = slot.start.split(":").map(Number);
  const [eh, em] = slot.end.split(":").map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}
function slotsToWeeklyHours(slots: Record<string, TimeSlot[]>): number {
  return DAYS.reduce(
    (sum, day) =>
      sum + (slots[day] ?? []).reduce((s, slot) => s + slotMinutes(slot) / 60, 0),
    0
  );
}
function slotsToDailyHours(slots: Record<string, TimeSlot[]>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const day of DAYS) {
    const list = slots[day] ?? [];
    out[day] = Math.round(list.reduce((s, slot) => s + slotMinutes(slot) / 60, 0) * 10) / 10;
  }
  return out;
}

interface PlanRevealData {
  totalSessions: number;
  totalTopicHours: number;
  hasCapacityWarning: boolean;
  studyDaysCount: number;
  topicsPerDay: number;
  firstWeekPreview: { date: string; topics: { name: string; minutes: number }[] }[];
}

export default function OnboardingFlow() {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>("welcome");
  const [course, setCourse] = useState<Course | null>(null);
  const [examDate, setExamDate] = useState("");
  const defaultSlots: Record<string, TimeSlot[]> = {
    mon: [{ start: "09:00", end: "11:00" }],
    tue: [{ start: "09:00", end: "11:00" }],
    wed: [],
    thu: [{ start: "09:00", end: "11:00" }],
    fri: [{ start: "09:00", end: "11:00" }],
    sat: [{ start: "09:00", end: "13:00" }],
    sun: [],
  };
  const [dailySlots, setDailySlots] = useState<Record<string, TimeSlot[]>>(defaultSlots);
  type TopicConfidence = "known" | "needs_work" | "new";
  const [topicAssessments, setTopicAssessments] = useState<Record<string, TopicConfidence>>({});
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [revealData, setRevealData] = useState<PlanRevealData | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const daysUntilExam = examDate
    ? Math.max(0, Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000))
    : 0;
  const totalWeeklyHours = slotsToWeeklyHours(dailySlots);
  const dailyHoursFromSlots = slotsToDailyHours(dailySlots);

  const courseTopics = course ? getTopicsForCourse(course) : [];
  const activeTopicCount = courseTopics.filter((t) => (topicAssessments[t.id] ?? "new") !== "known").length;

  const toggleDay = (day: string) => {
    setDailySlots((prev) => {
      const list = prev[day] ?? [];
      if (list.length > 0) return { ...prev, [day]: [] };
      return { ...prev, [day]: [{ start: "09:00", end: "11:00" }] };
    });
  };

  const addSlot = (day: string) => {
    setDailySlots((prev) => ({
      ...prev,
      [day]: [...(prev[day] ?? []), { start: "14:00", end: "16:00" }],
    }));
  };

  const removeSlot = (day: string, index: number) => {
    setDailySlots((prev) => {
      const list = [...(prev[day] ?? [])];
      list.splice(index, 1);
      return { ...prev, [day]: list };
    });
  };

  const setSlotTime = (day: string, index: number, field: "start" | "end", value: string) => {
    setDailySlots((prev) => {
      const list = [...(prev[day] ?? [])];
      if (!list[index]) return prev;
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [day]: list };
    });
  };

  const setTopicConfidence = (topicId: string, confidence: TopicConfidence) => {
    setTopicAssessments((prev) => ({ ...prev, [topicId]: confidence }));
  };

  const toggleChapter = (chKey: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chKey)) next.delete(chKey);
      else next.add(chKey);
      return next;
    });
  };

  const setChapterAllConfidence = (chKey: string, confidence: TopicConfidence) => {
    const chTopics = courseTopics.filter((t) => getChapterForTopic(t.id) === chKey);
    setTopicAssessments((prev) => {
      const next = { ...prev };
      for (const t of chTopics) next[t.id] = confidence;
      return next;
    });
  };

  const handleGeneratePlan = () => {
    if (!course || !examDate) return;
    if (new Date(examDate) <= new Date()) {
      setError("Exam date must be in the future.");
      return;
    }
    if (totalWeeklyHours === 0) {
      setError("Set at least one study day with hours > 0.");
      return;
    }
    const withKnown = courseTopics.filter((t) => (topicAssessments[t.id] ?? "new") === "known").length;
    if (withKnown >= courseTopics.length) {
      setError("You can't mark all topics as known. Keep at least one to study.");
      return;
    }
    setError(null);

    const assessments: Record<string, string> = {};
    courseTopics.forEach((t) => {
      assessments[t.id] = topicAssessments[t.id] ?? "new";
    });

    startTransition(async () => {
      const result = await createStudyPlan({
        course,
        examDate,
        dailyHours: dailyHoursFromSlots,
        dailySlots,
        topicAssessments: assessments,
      });
      if ("error" in result) {
        setError(result.error as string);
        return;
      }
      setRevealData({
        totalSessions: result.totalSessions as number,
        totalTopicHours: result.totalTopicHours as number,
        hasCapacityWarning: result.hasCapacityWarning as boolean,
        studyDaysCount: result.studyDaysCount as number,
        topicsPerDay: result.topicsPerDay as number,
        firstWeekPreview: result.firstWeekPreview as PlanRevealData["firstWeekPreview"],
      });
      setStep("reveal");
    });
  };

  const handleFinish = () => {
    window.location.href = "/";
  };

  const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const progressSteps: Step[] = ["course", "topics", "examdate", "availability"];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center page-padding py-8 animate-fade-up">
      <div className="mobile-container w-full">
        {/* Progress dots */}
        {!["welcome", "reveal"].includes(step) && (
          <div className="mb-8 flex justify-center gap-2">
            {progressSteps.map((s) => (
              <div
                key={s}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  step === s ? "w-8 bg-primary" : "w-2 bg-muted"
                )}
              />
            ))}
          </div>
        )}

        {/* ── Welcome ── */}
        {step === "welcome" && (
          <div className="space-y-8 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-black">Metoria Planner</h1>
              <p className="text-lg font-medium text-muted-foreground">
                Plan your IB Math. Study smarter.
              </p>
            </div>
            <div className="space-y-4 text-left">
              {[
                { icon: "📅", text: "Auto-generates your study schedule" },
                { icon: "🎯", text: "Tracks every topic in the IB syllabus" },
                { icon: "🏆", text: "Earn XP and compete on the leaderboard" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-card">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
            <button
              className="w-full rounded-xl gradient-primary py-4 text-base font-bold text-white glow-primary"
              onClick={() => setStep("course")}
            >
              Get Started <ChevronRight className="ml-1 inline h-5 w-5" />
            </button>
          </div>
        )}

        {/* ── Course Selection ── */}
        {step === "course" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">Choose your course</h2>
              <p className="text-sm text-muted-foreground">Select your IB Mathematics course</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {COURSE_OPTIONS.map((opt) => (
                <button
                  key={opt.course}
                  onClick={() => { setCourse(opt.course); setTopicAssessments({}); }}
                  className={cn(
                    "rounded-xl border-2 p-4 text-left transition-all",
                    course === opt.course
                      ? "border-primary bg-primary/10 glow-primary"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <div className="mb-2 text-2xl font-black text-primary">{opt.icon}</div>
                  <div className="text-sm font-bold">{opt.label}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{opt.sublabel}</div>
                  {course === opt.course && <CheckCircle2 className="mt-2 h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
            <button
              className="w-full rounded-xl gradient-primary py-4 text-base font-bold text-white disabled:opacity-50"
              disabled={!course}
              onClick={() => setStep("topics")}
            >
              Continue <ChevronRight className="ml-1 inline h-5 w-5" />
            </button>
          </div>
        )}

        {/* ── Topic Self-Assessment ── */}
        {step === "topics" && course && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">Rate your topics</h2>
              <p className="text-sm text-muted-foreground">
                Already know it = skip. Need work = 50% time. Haven&apos;t started = full time.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-card px-4 py-3 shadow-card">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{activeTopicCount}</span> topics to study
              </span>
            </div>
            <div className="flex gap-2 rounded-xl bg-muted/50 px-3 py-2 text-xs">
              <span className="flex items-center gap-1"><span className="rounded bg-success/20 px-1.5 py-0.5 text-success">✓ Known</span> skip</span>
              <span className="flex items-center gap-1"><span className="rounded bg-warning/20 px-1.5 py-0.5 text-warning">📖 Need work</span> 50%</span>
              <span className="flex items-center gap-1"><span className="rounded bg-destructive/20 px-1.5 py-0.5 text-destructive">🔴 New</span> full</span>
            </div>

            <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
              {Object.entries(CHAPTERS).map(([chKey, chLabel]) => {
                const chTopics = courseTopics.filter((t) => getChapterForTopic(t.id) === chKey);
                if (chTopics.length === 0) return null;
                const knownCount = chTopics.filter((t) => (topicAssessments[t.id] ?? "new") === "known").length;
                const isExpanded = expandedChapters.has(chKey);

                return (
                  <div key={chKey} className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3">
                      <button
                        className="flex flex-1 items-center justify-between"
                        onClick={() => toggleChapter(chKey)}
                      >
                        <span className="text-sm font-bold">
                          {chKey}. {chLabel}
                          {knownCount > 0 && (
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                              {knownCount} known
                            </span>
                          )}
                        </span>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </button>
                      {isExpanded && (
                        <div className="flex gap-1">
                          {(["new", "needs_work", "known"] as const).map((conf) => (
                            <button
                              key={conf}
                              onClick={() => setChapterAllConfidence(chKey, conf)}
                              className={cn(
                                "rounded px-2 py-0.5 text-[10px] font-medium",
                                conf === "known" && "bg-success/20 text-success",
                                conf === "needs_work" && "bg-warning/20 text-warning",
                                conf === "new" && "bg-destructive/20 text-destructive"
                              )}
                            >
                              {conf === "known" ? "✓" : conf === "needs_work" ? "📖" : "🔴"} All
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {isExpanded && (
                      <div className="border-t border-border px-4 py-2 space-y-1">
                        {chTopics.map((t) => {
                          const conf = topicAssessments[t.id] ?? "new";
                          return (
                            <div
                              key={t.id}
                              className="flex w-full items-center gap-2 rounded-lg px-2 py-2"
                            >
                              <span className={cn(
                                "text-xs min-w-0 flex-1 truncate",
                                conf === "known" && "text-muted-foreground line-through"
                              )}>
                                {t.name}
                              </span>
                              <div className="flex gap-0.5 flex-shrink-0">
                                {(["new", "needs_work", "known"] as const).map((c) => (
                                  <button
                                    key={c}
                                    onClick={() => setTopicConfidence(t.id, c)}
                                    title={c === "known" ? "Already know it" : c === "needs_work" ? "Need work" : "Haven't started"}
                                    className={cn(
                                      "rounded p-1.5 text-sm transition-all",
                                      conf === c
                                        ? c === "known"
                                          ? "bg-success text-white"
                                          : c === "needs_work"
                                          ? "bg-warning text-white"
                                          : "bg-destructive text-white"
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                    )}
                                  >
                                    {c === "known" ? "✓" : c === "needs_work" ? "📖" : "🔴"}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              className="w-full rounded-xl gradient-primary py-4 text-base font-bold text-white"
              onClick={() => setStep("examdate")}
            >
              Continue <ChevronRight className="ml-1 inline h-5 w-5" />
            </button>
          </div>
        )}

        {/* ── Exam Date ── */}
        {step === "examdate" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">When is your exam?</h2>
              <p className="text-sm text-muted-foreground">
                {course && COURSE_LABELS[course]} — {activeTopicCount} topics to cover
              </p>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-primary" /> Exam date
              </label>
              <input
                type="date"
                min={today}
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
              />
              {examDate && (
                <p className="text-sm font-medium text-primary">
                  📅 {daysUntilExam} days until your exam
                </p>
              )}
            </div>
            <button
              className="w-full rounded-xl gradient-primary py-4 text-base font-bold text-white disabled:opacity-50"
              disabled={!examDate}
              onClick={() => setStep("availability")}
            >
              Continue <ChevronRight className="ml-1 inline h-5 w-5" />
            </button>
          </div>
        )}

        {/* ── Weekly Availability (time slots per day) ── */}
        {step === "availability" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">When can you study?</h2>
              <p className="text-sm text-muted-foreground">
                Pick each day you’re free, then set the exact time window (e.g. 9:00–11:00).
              </p>
            </div>
            <div className="space-y-3">
              {DAYS.map((day) => {
                const slots = dailySlots[day] ?? [];
                const isActive = slots.length > 0;
                return (
                  <div
                    key={day}
                    className={cn(
                      "overflow-hidden rounded-xl border transition-all",
                      isActive ? "border-primary bg-primary/5" : "border-border bg-card"
                    )}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-4 py-3"
                      onClick={() => toggleDay(day)}
                    >
                      <span className={cn("font-semibold", !isActive && "text-muted-foreground")}>
                        {DAY_LABELS[day]}
                      </span>
                      <div
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                          isActive ? "border-primary bg-primary" : "border-muted"
                        )}
                      >
                        {isActive && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                    </button>
                    {isActive && (
                      <div className="space-y-2 px-4 pb-3">
                        {slots.map((slot, idx) => (
                          <div
                            key={`${day}-${idx}`}
                            className="flex flex-wrap items-center gap-2 rounded-lg bg-card/80 p-2"
                          >
                            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              From
                              <input
                                type="time"
                                value={slot.start}
                                onChange={(e) => setSlotTime(day, idx, "start", e.target.value)}
                                className="rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground"
                              />
                            </label>
                            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              To
                              <input
                                type="time"
                                value={slot.end}
                                onChange={(e) => setSlotTime(day, idx, "end", e.target.value)}
                                className="rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground"
                              />
                            </label>
                            {slots.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSlot(day, idx)}
                                className="rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addSlot(day)}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          + Add another time block
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-card px-4 py-3">
              <Clock className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{totalWeeklyHours.toFixed(1)}h</span> per week
                <span className="ml-2 text-xs">(50min study + 10min break per hour)</span>
              </span>
            </div>
            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <button
              className="w-full rounded-xl gradient-primary py-4 text-base font-bold text-white glow-primary disabled:opacity-50"
              disabled={isPending || totalWeeklyHours === 0}
              onClick={handleGeneratePlan}
            >
              {isPending ? "Generating plan..." : "Generate My Plan"}
              {!isPending && <ChevronRight className="ml-1 inline h-5 w-5" />}
            </button>
          </div>
        )}

        {/* ── Plan Reveal ── */}
        {step === "reveal" && revealData && (
          <div className="space-y-6 animate-fade-up">
            <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/20 via-card to-card p-6 text-center shadow-card">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
              <div className="absolute -left-6 -bottom-6 h-20 w-20 rounded-full bg-warning/10 blur-2xl" />
              <div className="relative space-y-3">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary glow-primary">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-black">Your plan is ready!</h2>
                <p className="text-muted-foreground">
                  We&apos;ve built a personalized schedule for your{" "}
                  <span className="font-semibold text-foreground">{course && COURSE_LABELS[course]}</span> exam.
                </p>
              </div>
            </div>

            {revealData.hasCapacityWarning && (
              <div className="rounded-xl bg-warning/10 border border-warning/30 px-4 py-3 text-sm text-warning">
                ⚠️ You may not have enough time to cover all topics. Consider adding more study days.
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "📅", value: `${daysUntilExam}`, label: "Days to exam" },
                { icon: "📚", value: `${activeTopicCount}`, label: "Topics to cover" },
                { icon: "⚡", value: `${revealData.totalSessions}`, label: "Sessions planned" },
                { icon: "📊", value: `~${revealData.topicsPerDay}`, label: "Topics/study day" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-card p-4 text-center shadow-card">
                  <div className="text-2xl">{stat.icon}</div>
                  <div className="mt-1 text-2xl font-black">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            {courseTopics.filter((t) => (topicAssessments[t.id] ?? "new") === "known").length > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>
                  {courseTopics.filter((t) => (topicAssessments[t.id] ?? "new") === "known").length} topic
                  {courseTopics.filter((t) => (topicAssessments[t.id] ?? "new") === "known").length > 1 ? "s" : ""} marked as known
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-card">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-bold">{revealData.totalTopicHours}h total study time</div>
                <div className="text-xs text-muted-foreground">
                  Spread across {revealData.studyDaysCount} study days (50min sessions with breaks)
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-secondary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  First week preview
                </h3>
              </div>
              {revealData.firstWeekPreview.slice(0, 5).map((day) => (
                <div key={day.date} className="rounded-xl border border-border bg-card p-3 shadow-card">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">{formatDateShort(day.date)}</span>
                    <span className="text-xs text-muted-foreground">
                      {day.topics.reduce((s, t) => s + t.minutes, 0)} min
                    </span>
                  </div>
                  <div className="space-y-1">
                    {day.topics.map((t, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="truncate pr-2 text-muted-foreground">{t.name}</span>
                        <span className="flex-shrink-0 font-medium">{t.minutes}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              className="w-full rounded-xl gradient-primary py-4 text-base font-bold text-white glow-primary"
              onClick={handleFinish}
            >
              Let&apos;s Go! 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

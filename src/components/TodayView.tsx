"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PlayCircle, CheckCircle2, Clock, Flame, Zap,
  ChevronDown, ChevronUp, HelpCircle, Brain, PenTool, Target, GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SYLLABUS, getSessionGuide, CHAPTERS, getChapterForTopic, getTopicsForCourse, COURSE_LABELS } from "@/data/syllabus";
import type { ScheduledSession, Profile, DailySlot } from "@/types/database";
import type { Course } from "@/data/syllabus";
import { toggleTutorHelp } from "@/actions/tutor";
import { activateBusyWeek } from "@/actions/plan";
import TimerModal from "./TimerModal";

interface PlanStats {
  total: number;
  completed: number;
  missed: number;
  pending: number;
  examDate: string;
}

interface WeekSession {
  scheduled_date: string;
  estimated_minutes: number;
  status: string;
}

interface Props {
  profile: Pick<Profile, "full_name" | "total_xp" | "current_streak" | "last_study_date" | "avatar_url">;
  sessions: ScheduledSession[];
  upcomingSessions: ScheduledSession[];
  completedTopicCount: number;
  completedTopicIds?: string[];
  planStats: PlanStats;
  course?: Course;
  dailyHours?: Record<string, number>;
  dailySlots?: Record<string, DailySlot[]>;
  weekSessions?: WeekSession[];
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function TodayView({
  profile,
  sessions: initial,
  upcomingSessions,
  completedTopicCount,
  completedTopicIds = [],
  planStats,
  course,
  dailySlots,
  weekSessions = [],
}: Props) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initial);
  const [upcoming, setUpcoming] = useState(upcomingSessions);
  const [activeSession, setActiveSession] = useState<ScheduledSession | null>(null);
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null);
  const [showBusyWeekSheet, setShowBusyWeekSheet] = useState(false);
  const [busyWeekPending, setBusyWeekPending] = useState(false);
  const [, startTransition] = useTransition();

  const completed = sessions.filter((s) => s.status === "completed").length;
  const total = sessions.length;
  const pct = total > 0 ? (completed / total) * 100 : 0;
  const remainingMinutesToday = sessions
    .filter((s) => s.status === "pending")
    .reduce((sum, s) => sum + s.estimated_minutes, 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = (profile.full_name || "Student").split(" ")[0];
  const studiedToday = profile.last_study_date === new Date().toISOString().split("T")[0];
  const motivationalSubtitle =
    profile.current_streak === 0
      ? "Start strong today"
      : studiedToday
      ? "You're on fire today 🔥"
      : "Keep the streak alive 🔥";

  const daysUntilExam = Math.max(
    0,
    Math.ceil((new Date(planStats.examDate).getTime() - Date.now()) / 86400000)
  );
  const examPassed = new Date(planStats.examDate).getTime() < Date.now();
  const todayStr = new Date().toISOString().split("T")[0];

  const handleComplete = () => {
    if (activeSession) {
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSession.id ? { ...s, status: "completed" as const } : s))
      );
      setUpcoming((prev) => prev.filter((s) => s.id !== activeSession.id));
    }
    setActiveSession(null);
    router.refresh();
  };

  const handleTutorToggle = (sessionId: string, current: boolean) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, needs_tutor_help: !current } : s))
    );
    startTransition(async () => {
      const res = await toggleTutorHelp(sessionId, current);
      if (res && "error" in res) {
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, needs_tutor_help: current } : s))
        );
      }
    });
  };

  const diffBadge = (d: number) => {
    if (d === 1) return <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs font-medium text-success">Easy</span>;
    if (d === 2) return <span className="rounded-full bg-warning/20 px-2 py-0.5 text-xs font-medium text-warning">Medium</span>;
    return <span className="rounded-full bg-destructive/20 px-2 py-0.5 text-xs font-medium text-destructive">Hard</span>;
  };

  const getDifficulty = (topicId: string): number => {
    const topic = SYLLABUS.find((t) => t.id === topicId);
    return topic?.difficulty ?? 2;
  };

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = weekEnd.toISOString().split("T")[0];
  const thisWeekPendingSessions = [
    ...sessions.filter((s) => s.status === "pending"),
    ...upcoming.filter((s) => s.scheduled_date >= weekStartStr && s.scheduled_date <= weekEndStr),
  ];
  const thisWeekPendingMinutes = thisWeekPendingSessions.reduce((sum, s) => sum + s.estimated_minutes, 0);

  const completedSet = new Set(completedTopicIds);
  const topicsForCourse = course ? getTopicsForCourse(course) : [];
  const chapterCompletion = Object.keys(CHAPTERS).map((chKey) => {
    const chTopics = topicsForCourse.filter((t) => getChapterForTopic(t.id) === chKey);
    const done = chTopics.filter((t) => completedSet.has(t.id)).length;
    return { chKey, label: CHAPTERS[chKey], pct: chTopics.length > 0 ? Math.round((done / chTopics.length) * 100) : 0 };
  });

  const tomorrowStr = new Date(now.getTime() + 86400000).toISOString().split("T")[0];
  const tomorrowSessions = upcoming.filter((s) => s.scheduled_date === tomorrowStr).slice(0, 3);

  const weeklyMinutesByDay: Record<string, number> = {};
  DAY_LABELS.forEach((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    weeklyMinutesByDay[dateStr] = weekSessions
      .filter((s) => s.scheduled_date === dateStr)
      .reduce((sum, s) => sum + s.estimated_minutes, 0);
  });
  const maxWeekMinutes = Math.max(1, ...Object.values(weeklyMinutesByDay));

  const DAY_MAP = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const todayDayName = DAY_MAP[new Date().getDay()];
  const todaySlots = dailySlots?.[todayDayName];
  const firstSlotStart = todaySlots?.[0]?.start ?? "08:00";
  const [startHour, startMinute] = firstSlotStart.split(":").map(Number);
  let min = startHour * 60 + startMinute;
  const BREAK_MINUTES = 10;
  const pendingOrdered = sessions.filter((s) => s.status === "pending");
  const deepWorkSlots: { start: string; end: string; session: ScheduledSession }[] = [];
  for (const session of pendingOrdered) {
    const duration = session.estimated_minutes;
    const startH = Math.floor(min / 60);
    const startM = min % 60;
    const endMin = min + duration;
    const endH = Math.floor(endMin / 60);
    const endM = endMin % 60;
    deepWorkSlots.push({
      start: `${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}`,
      end: `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`,
      session,
    });
    min = endMin + BREAK_MINUTES;
  }

  const courseLabel = course ? COURSE_LABELS[course].replace(/ /g, " ").toUpperCase() : "MATH";

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      <div className="mobile-container w-full">
        {/* ── Header: top bar ── */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0A0F1E]/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-black text-[#F97316]">Metoria</span>
              <span className="text-xl font-bold text-white">Planner</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="hidden text-sm font-medium text-white sm:inline">{firstName}</span>
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full border-2 border-white/20 object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111827] text-sm font-bold text-[#F97316]">
                  {(firstName || "U").charAt(0)}
                </div>
              )}
            </div>
          </div>
          <div className="px-4 pb-4">
            <p className="text-sm text-muted-foreground">{greeting}, {firstName}</p>
            <p className="mt-0.5 text-base font-semibold text-white">{motivationalSubtitle}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#111827] px-3 py-1 text-xs font-semibold text-white">
                <Flame className="h-3.5 w-3.5 text-[#F97316]" />
                {profile.current_streak} day{profile.current_streak !== 1 ? "s" : ""}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#111827] px-3 py-1 text-xs font-semibold text-white">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                {profile.total_xp.toLocaleString()} XP
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#111827] px-3 py-1 text-xs font-semibold text-white">
                {completedTopicCount} topics
              </span>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-6 p-4 md:grid md:grid-cols-[1fr,320px] md:gap-8">
          {/* ── Left column: main content ── */}
          <div className="flex flex-col gap-6">
            {/* Today's Focus Card (hero) */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#F97316]/20 via-[#111827] to-[#0A0F1E] border border-[#F97316]/20 p-6">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#F97316]/10 blur-3xl" />
              <h2 className="text-lg font-bold text-white">Today&apos;s Study Focus</h2>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-2xl font-black text-white">{remainingMinutesToday}</p>
                  <p className="text-xs text-muted-foreground">min scheduled</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{total - completed}</p>
                  <p className="text-xs text-muted-foreground">sessions remaining</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#F97316] transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {completed}/{total} sessions completed today
                </p>
              </div>
              {thisWeekPendingMinutes > 0 && (
                <button
                  onClick={() => { setShowBusyWeekSheet(true); setBusyWeekPending(false); }}
                  className="mt-4 rounded-xl border border-[#F97316]/50 bg-[#F97316]/10 px-4 py-2 text-sm font-semibold text-[#F97316]"
                >
                  Busy week? Reduce load
                </button>
              )}
            </div>

            {/* IB Math Overview pills */}
            {course && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">IB Math Overview</h3>
                <div className="flex flex-wrap gap-2">
                  {chapterCompletion.map(({ chKey, label, pct }) => (
                    <Link
                      key={chKey}
                      href={`/topics#chapter-${chKey}`}
                      className="rounded-full border border-white/20 bg-[#111827] px-4 py-2 text-xs font-medium text-white transition-colors hover:border-[#F97316]/50 hover:bg-[#111827]/90"
                    >
                      {label}
                      <span className="ml-1.5 text-muted-foreground">({pct}%)</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Priority Sessions */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Priority Sessions</h3>
              {sessions.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-[#111827] p-8 text-center">
                  <p className="text-4xl">🎉</p>
                  <p className="mt-2 font-semibold text-white">Rest day!</p>
                  <p className="text-sm text-muted-foreground">No sessions scheduled today.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((s) => {
                    const difficulty = getDifficulty(s.topic_id);
                    const needsHelp = s.needs_tutor_help;
                    const isReview = s.session_type === "review" || s.session_type === "recovery";
                    const isCompleted = s.status === "completed";
                    return (
                      <div
                        key={s.id}
                        className={cn(
                          "rounded-xl border bg-[#111827] p-4 transition-all",
                          needsHelp && "border-destructive/40 bg-destructive/5",
                          isCompleted && "border-white/5 opacity-80",
                          !isCompleted && isReview && "border-[#3B82F6]/30",
                          !isCompleted && !needsHelp && !isReview && "border-white/10"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex shrink-0 items-center gap-1 text-muted-foreground">
                            <GripVertical className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {courseLabel}
                            </span>
                            <p className={cn(
                              "mt-0.5 text-sm font-semibold leading-tight",
                              isCompleted && "text-muted-foreground line-through"
                            )}>
                              {s.topic_name}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {s.estimated_minutes} min
                              </span>
                              {isReview && (
                                <span className="rounded-full bg-[#3B82F6]/20 px-2 py-0.5 text-xs font-medium text-[#3B82F6]">
                                  {s.session_type === "recovery" ? "Recovery" : "Review"}
                                </span>
                              )}
                              {!isReview && diffBadge(difficulty)}
                              {needsHelp && (
                                <span className="rounded-full bg-destructive/20 px-2 py-0.5 text-xs font-medium text-destructive">
                                  Needs help
                                </span>
                              )}
                              {isCompleted && s.xp_earned > 0 && (
                                <span className="text-xs font-medium text-amber-400">+{s.xp_earned} XP</span>
                              )}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {!isCompleted && (
                              <button
                                onClick={() => handleTutorToggle(s.id, !!needsHelp)}
                                className={cn(
                                  "rounded-lg p-2 transition-all",
                                  needsHelp ? "bg-destructive/20 text-destructive" : "text-muted-foreground hover:text-amber-500"
                                )}
                                title={needsHelp ? "Remove tutor help flag" : "Flag for tutor help"}
                              >
                                <HelpCircle className="h-4 w-4" />
                              </button>
                            )}
                            {isCompleted ? (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </div>
                            ) : (
                              <button
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-transparent"
                                aria-label="Mark complete"
                              />
                            )}
                          </div>
                        </div>

                        {/* Session Guide (expandable) */}
                        <div className="mt-3 border-t border-white/10 pt-3">
                          <button
                            onClick={() => setExpandedGuideId(expandedGuideId === s.id ? null : s.id)}
                            className="flex w-full items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-white/10"
                          >
                            <span>Session Guide</span>
                            {expandedGuideId === s.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                          {expandedGuideId === s.id && (() => {
                            const guide = getSessionGuide(s.topic_id);
                            if (!guide) return null;
                            return (
                              <div className="mt-2 space-y-3 rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-xs">
                                <div>
                                  <div className="mb-1 flex items-center gap-1.5 font-semibold text-white">
                                    <Brain className="h-3.5 w-3.5 text-[#F97316]" /> Key concepts
                                  </div>
                                  <ul className="list-inside list-disc space-y-0.5 text-muted-foreground">
                                    {guide.key_concepts.map((c, i) => <li key={i}>{c}</li>)}
                                  </ul>
                                </div>
                                <div>
                                  <div className="mb-1 flex items-center gap-1.5 font-semibold text-white">
                                    <PenTool className="h-3.5 w-3.5 text-[#3B82F6]" /> Practice
                                  </div>
                                  <ul className="list-inside list-disc space-y-0.5 text-muted-foreground">
                                    {guide.practice_tasks.map((t, i) => <li key={i}>{t}</li>)}
                                  </ul>
                                </div>
                                <div>
                                  <div className="mb-1 flex items-center gap-1.5 font-semibold text-white">
                                    <HelpCircle className="h-3.5 w-3.5 text-amber-400" /> Self-check
                                  </div>
                                  <ul className="list-inside list-disc space-y-0.5 text-muted-foreground">
                                    {guide.self_check.map((q, i) => <li key={i}>{q}</li>)}
                                  </ul>
                                </div>
                                <div>
                                  <div className="mb-1 flex items-center gap-1.5 font-semibold text-white">
                                    <Target className="h-3.5 w-3.5 text-green-500" /> IB exam tips
                                  </div>
                                  <ul className="list-inside list-disc space-y-0.5 text-muted-foreground">
                                    {guide.ib_exam_tips.map((t, i) => <li key={i}>{t}</li>)}
                                  </ul>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {s.status === "pending" && (
                          <button
                            className="mt-3 w-full rounded-xl bg-[#F97316] py-2.5 text-sm font-bold text-white hover:bg-[#F97316]/90"
                            onClick={() => setActiveSession(s)}
                          >
                            <PlayCircle className="mr-1.5 inline h-4 w-4" /> Start Session
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Right column: sidebar (hidden on mobile) ── */}
          <aside className="hidden flex-col gap-6 md:flex">
            {/* Deep Work Blocks */}
            <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
              <h3 className="text-sm font-bold text-white">Deep Work Blocks</h3>
              <p className="mt-1 text-xs text-muted-foreground">Today&apos;s schedule</p>
              {deepWorkSlots.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">No sessions planned for today.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {deepWorkSlots.map((slot) => (
                    <div key={slot.session.id} className="flex items-center gap-3">
                      <div className="w-14 shrink-0 text-xs font-medium text-muted-foreground">
                        {slot.start} – {slot.end}
                      </div>
                      <div className="flex-1 rounded-lg bg-[#F97316]/20 px-3 py-2 text-xs font-medium text-[#F97316]">
                        {slot.session.topic_name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Milestones */}
            <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
              <h3 className="text-sm font-bold text-white">Upcoming Milestones</h3>
              <div className="mt-4 space-y-3">
                <div className="rounded-lg bg-[#F97316]/10 p-3">
                  <p className="text-xs font-semibold text-[#F97316]">Exam countdown</p>
                  <p className="text-2xl font-black text-white">
                    {examPassed ? "Done" : `${daysUntilExam} days`}
                  </p>
                  {!examPassed && (
                    <p className="text-xs text-muted-foreground">
                      to {new Date(planStats.examDate).toLocaleDateString("en-US", { dateStyle: "long" })}
                    </p>
                  )}
                </div>
                {tomorrowSessions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Tomorrow</p>
                    <ul className="mt-2 space-y-1">
                      {tomorrowSessions.map((s) => (
                        <li key={s.id} className="truncate text-sm text-white">
                          {s.topic_name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Progress */}
            <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
              <h3 className="text-sm font-bold text-white">Weekly Progress</h3>
              <p className="mt-1 text-xs text-muted-foreground">Study minutes this week</p>
              <div className="mt-4 flex items-end justify-between gap-1">
                {Array.from({ length: 7 }).map((_, i) => {
                  const d = new Date(weekStart);
                  d.setDate(weekStart.getDate() + i);
                  const dateStr = d.toISOString().split("T")[0];
                  const mins = weeklyMinutesByDay[dateStr] ?? 0;
                  const isToday = dateStr === todayStr;
                  return (
                    <div key={dateStr} className="flex flex-1 flex-col items-center">
                      <div
                        className={cn(
                          "w-full min-h-[4px] rounded-t transition-all",
                          isToday ? "bg-[#F97316]" : "bg-white/20"
                        )}
                        style={{ height: `${Math.max(4, (mins / maxWeekMinutes) * 80)}px` }}
                      />
                      <span className="mt-2 text-[10px] font-medium text-muted-foreground">
                        {DAY_LABELS[i]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Busy Week sheet */}
      {showBusyWeekSheet && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 pb-20" onClick={() => setShowBusyWeekSheet(false)}>
          <div
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl border border-white/10 bg-[#111827] p-4 pb-8 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Busy week</h3>
              <button onClick={() => setShowBusyWeekSheet(false)} className="p-1 text-muted-foreground hover:text-white">×</button>
            </div>
            <p className="text-sm text-muted-foreground">
              This week you have <span className="font-semibold text-white">{thisWeekPendingMinutes} min</span> of study planned.
              We can reduce it by 50% and spread the rest to later weeks.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              You&apos;ll keep ~{Math.round(thisWeekPendingMinutes * 0.5)} min this week; ~{Math.round(thisWeekPendingMinutes * 0.5)} min will be rescheduled.
            </p>
            <button
              onClick={() => {
                setBusyWeekPending(true);
                startTransition(async () => {
                  const res = await activateBusyWeek();
                  if (res && "error" in res) {
                    setBusyWeekPending(false);
                    return;
                  }
                  setShowBusyWeekSheet(false);
                  setBusyWeekPending(false);
                  router.refresh();
                });
              }}
              disabled={busyWeekPending}
              className="mt-4 w-full rounded-xl bg-[#F97316] py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {busyWeekPending ? "Applying..." : "Reduce by 50%"}
            </button>
          </div>
        </div>
      )}

      {activeSession && (
        <TimerModal
          session={activeSession}
          onClose={() => setActiveSession(null)}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}

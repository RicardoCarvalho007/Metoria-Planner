"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { AlertTriangle, Calendar, List, Clock, HelpCircle, ChevronDown, Brain, PenTool, Target, ChevronUp, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHAPTERS, getChapterForTopic, getSubTopicsForTopic, getSessionGuide } from "@/data/syllabus";
import { rescheduleAllMissed, smartRecovery, saveWeekOverride, reorderSession } from "@/actions/plan";
import { toggleTutorHelp } from "@/actions/tutor";
import type { ScheduledSession } from "@/types/database";

const STATUS_CONFIG = {
  pending: { icon: "🟡", label: "Scheduled", cls: "text-warning bg-warning/10" },
  completed: { icon: "✅", label: "Done", cls: "text-success bg-success/10" },
  missed: { icon: "❌", label: "Missed", cls: "text-destructive bg-destructive/10" },
  rescheduled: { icon: "🔄", label: "Rescheduled", cls: "text-secondary bg-secondary/10" },
} as const;

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_LABELS: Record<string, string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
};

function DroppableDay({
  id,
  children,
  className,
}: { id: string; children: React.ReactNode; className?: string }) {
  const { isOver, setNodeRef } = useDroppable({ id, data: { date: id } });
  return (
    <div ref={setNodeRef} className={cn(className, isOver && "ring-2 ring-primary rounded-lg")}>
      {children}
    </div>
  );
}

function DraggableSessionCard({
  sessionId,
  children,
}: { sessionId: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: sessionId,
    data: { sessionId },
  });
  return (
    <div ref={setNodeRef} className={cn("flex items-stretch gap-1", isDragging && "opacity-50")}>
      <div {...listeners} {...attributes} className="touch-none cursor-grab active:cursor-grabbing flex items-center p-1 rounded shrink-0">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

interface Props {
  sessions: ScheduledSession[];
  completedCount: number;
  totalTopicCount: number;
  examDate: string;
  planId?: string;
  dailyHours?: Record<string, number>;
  weekOverride?: Record<string, number>;
}

export default function PlanView({
  sessions: initialSessions,
  completedCount,
  totalTopicCount,
  examDate,
  planId,
  dailyHours = { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
  weekOverride,
}: Props) {
  const router = useRouter();
  const [view, setView] = useState<"calendar" | "list">("list");
  const [isPending, startTransition] = useTransition();
  const [sessions, setSessions] = useState(initialSessions);

  const missedCount = sessions.filter((s) => s.status === "missed").length;
  const progressPct = totalTopicCount > 0 ? Math.round((completedCount / totalTopicCount) * 100) : 0;
  const daysUntilExam = Math.max(0, Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000));
  const examPassed = new Date(examDate).getTime() < Date.now();
  const circumference = 2 * Math.PI * 40;

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null);
  const [showRecoverySheet, setShowRecoverySheet] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [showWeekOverrideSheet, setShowWeekOverrideSheet] = useState(false);
  const [weekHours, setWeekHours] = useState<Record<string, number>>(() => weekOverride ?? dailyHours);
  const [overrideSaveError, setOverrideSaveError] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const newDate = over.id as string;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) return;
    const sessionId = active.id as string;
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, scheduled_date: newDate } : s))
    );
    startTransition(async () => {
      await reorderSession(sessionId, newDate);
      router.refresh();
    });
  };

  const calendarDays = (() => {
    const days: Date[] = [];
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1 - 7);
    for (let i = 0; i < 35; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  })();

  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const handleReschedule = () => {
    setRescheduleError(null);
    startTransition(async () => {
      const res = await rescheduleAllMissed();
      if (res && "error" in res) {
        setRescheduleError(res.error as string);
      }
      router.refresh();
    });
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

  const chapters = Object.entries(CHAPTERS);

  const handleOpenWeekOverride = () => {
    setWeekHours(weekOverride ?? dailyHours);
    setOverrideSaveError(null);
    setShowWeekOverrideSheet(true);
  };

  const handleSaveWeekOverride = () => {
    if (!planId) return;
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const weekStart = monday.toISOString().split("T")[0];
    startTransition(async () => {
      const res = await saveWeekOverride(planId, weekStart, weekHours);
      if (res && "error" in res) setOverrideSaveError(res.error as string);
      else { setShowWeekOverrideSheet(false); router.refresh(); }
    });
  };

  return (
    <div className="flex flex-col gap-4 page-padding py-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Study Plan</h1>
        {planId && (
          <button
            onClick={handleOpenWeekOverride}
            className="rounded-lg border border-primary/50 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
          >
            This Week
          </button>
        )}
      </div>

      {/* Progress ring */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="relative h-24 w-24 flex-shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
              strokeLinecap="round" strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progressPct / 100)}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-black">{progressPct}%</span>
          </div>
        </div>
        <div>
          <div className="text-base font-bold">Syllabus Progress</div>
          <div className="text-sm text-muted-foreground">{completedCount} of {totalTopicCount} topics</div>
          <div className="mt-1.5 flex items-center gap-1 text-sm">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">
              {examPassed
                ? <span className="font-semibold text-warning">Exam date passed</span>
                : <>Exam in <span className="font-semibold text-foreground">{daysUntilExam} days</span></>
              }
            </span>
          </div>
        </div>
      </div>

      {/* Missed banner */}
      {missedCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm font-semibold text-warning">{missedCount} missed session{missedCount > 1 ? "s" : ""}</span>
            </div>
            {missedCount >= 3 ? (
              <button
                onClick={() => { setShowRecoverySheet(true); setRecoveryError(null); setRescheduleError(null); }}
                disabled={isPending || examPassed}
                className="rounded-lg bg-warning px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
              >
                Recovery Options
              </button>
            ) : (
              <button
                onClick={handleReschedule}
                disabled={isPending || examPassed}
                className="rounded-lg bg-warning px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
              >
                {isPending ? "..." : "Reschedule"}
              </button>
            )}
          </div>
          {(rescheduleError || recoveryError) && (
            <p className="text-xs text-destructive px-1">{rescheduleError ?? recoveryError}</p>
          )}
          {/* Recovery options bottom sheet */}
          {showRecoverySheet && (
            <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50" onClick={() => setShowRecoverySheet(false)}>
              <div className="w-full max-w-lg rounded-t-2xl border border-border bg-card p-4 shadow-lg animate-fade-up" onClick={(e) => e.stopPropagation()}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-bold">How do you want to catch up?</h3>
                  <button onClick={() => setShowRecoverySheet(false)} className="p-1 text-muted-foreground hover:text-foreground">×</button>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">{missedCount} missed sessions will be rescheduled.</p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setRecoveryError(null);
                      startTransition(async () => {
                        const res = await smartRecovery("gradual");
                        if (res && "error" in res) setRecoveryError(res.error as string);
                        else { setShowRecoverySheet(false); router.refresh(); }
                      });
                    }}
                    disabled={isPending || examPassed}
                    className="w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 disabled:opacity-50"
                  >
                    <p className="font-semibold">Catch up gradually</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Spread over the next 2 weeks. Steady pace.</p>
                  </button>
                  <button
                    onClick={() => {
                      setRecoveryError(null);
                      startTransition(async () => {
                        const res = await smartRecovery("weekend");
                        if (res && "error" in res) setRecoveryError(res.error as string);
                        else { setShowRecoverySheet(false); router.refresh(); }
                      });
                    }}
                    disabled={isPending || examPassed}
                    className="w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 disabled:opacity-50"
                  >
                    <p className="font-semibold">Intensive weekend</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Pack all into the next Saturday & Sunday.</p>
                  </button>
                  <button
                    onClick={() => {
                      setRecoveryError(null);
                      startTransition(async () => {
                        const res = await smartRecovery("skip");
                        if (res && "error" in res) setRecoveryError(res.error as string);
                        else { setShowRecoverySheet(false); router.refresh(); }
                      });
                    }}
                    disabled={isPending || examPassed}
                    className="w-full rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-left transition-all hover:border-destructive/50 disabled:opacity-50"
                  >
                    <p className="font-semibold text-destructive">Skip and move on</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Mark as rescheduled. No new sessions added.</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View toggle */}
      <div className="flex gap-2 rounded-xl bg-muted p-1">
        {(["calendar", "list"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all",
              view === v ? "gradient-primary text-white" : "text-muted-foreground"
            )}
          >
            {v === "calendar" ? <Calendar className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* Calendar view */}
      {view === "calendar" && (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="mb-2 grid grid-cols-7 gap-1 text-center">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <div key={i} className="py-1 text-xs font-semibold text-muted-foreground">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((d, i) => {
                  const dateStr = d.toISOString().split("T")[0];
                  const daySessions = sessions.filter((s) => s.scheduled_date === dateStr);
                  const hasSession = daySessions.length > 0;
                  const isToday = dateStr === todayStr;
                  const isPast = dateStr < todayStr;
                  const isSelected = dateStr === selectedDate;
                  const hasCompleted = daySessions.some((s) => s.status === "completed");
                  const hasMissed = daySessions.some((s) => s.status === "missed");
                  return (
                    <DroppableDay key={i} id={dateStr}>
                      <button
                        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                        className={cn(
                          "w-full relative flex aspect-square flex-col items-center justify-center rounded-lg text-xs font-medium transition-all",
                          isToday && !isSelected && "bg-primary text-white",
                          isSelected && "ring-2 ring-primary bg-primary/20 text-primary font-bold",
                          !isToday && !isSelected && isPast && "text-muted-foreground",
                          hasSession && !isToday && !isSelected && "hover:bg-muted",
                        )}
                      >
                        {d.getDate()}
                        {hasSession && !isToday && (
                          <div className={cn(
                            "absolute bottom-1 h-1.5 w-1.5 rounded-full",
                            hasCompleted ? "bg-success" : hasMissed ? "bg-destructive" : isPast ? "bg-muted-foreground" : "bg-primary",
                          )} />
                        )}
                      </button>
                    </DroppableDay>
                  );
                })}
              </div>
            </div>

          {/* Selected day detail */}
          {selectedDate && (() => {
            const daySessions = sessions.filter((s) => s.scheduled_date === selectedDate);
            const dateObj = new Date(selectedDate + "T12:00:00");
            const dateLabel = selectedDate === todayStr
              ? "Today"
              : dateObj.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
            const totalMin = daySessions.reduce((sum, s) => sum + s.estimated_minutes, 0);

            return (
              <div className="rounded-xl border border-border bg-card p-4 shadow-card animate-fade-up">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold">{dateLabel}</h3>
                  <span className="text-xs text-muted-foreground">
                    {daySessions.length} session{daySessions.length !== 1 ? "s" : ""} · {totalMin} min total
                  </span>
                </div>
                {daySessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sessions scheduled.</p>
                ) : (
                  <div className="space-y-2">
                    {daySessions.map((s) => {
                      const cfg = STATUS_CONFIG[s.status];
                      const isExpanded = expandedSession === s.id;
                      const subTopics = getSubTopicsForTopic(s.topic_id);
                      return (
                        <div key={s.id} className="space-y-0">
                          <DraggableSessionCard sessionId={s.id}>
                            <button
                              onClick={() => setExpandedSession(isExpanded ? null : s.id)}
                              className={cn(
                              "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all",
                              s.status === "completed" ? "border-success/30 bg-success/5" :
                              s.status === "missed" ? "border-destructive/30 bg-destructive/5" :
                              "border-border bg-muted/30",
                              isExpanded && "rounded-b-none",
                            )}
                          >
                            <span className="text-base flex-shrink-0">{cfg.icon}</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium leading-tight">{s.topic_name}</p>
                              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{s.estimated_minutes} min</span>
                                <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold", cfg.cls)}>
                                  {cfg.label}
                                </span>
                                {(s.session_type === "review" || s.session_type === "recovery") && (
                                  <span className="rounded-full bg-secondary/20 px-1.5 py-0.5 text-[10px] font-semibold text-secondary">
                                    {s.session_type === "recovery" ? "Recovery" : "Review"}
                                  </span>
                                )}
                                {s.xp_earned > 0 && (
                                  <span className="font-medium text-warning">+{s.xp_earned} XP</span>
                                )}
                              </div>
                            </div>
                            {subTopics.length > 0 && (
                              <ChevronDown className={cn(
                                "h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform",
                                isExpanded && "rotate-180"
                              )} />
                            )}
                          </button>
                          {isExpanded && subTopics.length > 0 && (
                            <div className="rounded-b-lg border border-t-0 border-border bg-card px-4 py-3 space-y-2.5">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Sub-topics covered
                              </p>
                              {subTopics.map((st) => (
                                <div key={st.id} className="space-y-1">
                                  <p className="text-xs font-semibold">{st.name}</p>
                                  <ul className="space-y-0.5 pl-3">
                                    {st.learningObjectives.map((obj, i) => (
                                      <li key={i} className="text-[11px] text-muted-foreground leading-snug flex gap-1.5">
                                        <span className="text-primary mt-px">•</span>
                                        <span>{obj}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          )}
                          {/* Session Guide */}
                          <div className="mt-2">
                            <button
                              onClick={() => setExpandedGuideId(expandedGuideId === s.id ? null : s.id)}
                              className="flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-1.5 text-left text-xs font-medium text-muted-foreground hover:bg-muted"
                            >
                              <span>Session Guide</span>
                              {expandedGuideId === s.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                            {expandedGuideId === s.id && (() => {
                              const guide = getSessionGuide(s.topic_id);
                              if (!guide) return null;
                              return (
                                <div className="mt-1.5 space-y-2 rounded-lg border border-border bg-card/50 px-3 py-2 text-[11px]">
                                  <div><span className="font-semibold text-foreground flex items-center gap-1"><Brain className="h-3 text-primary" />Key concepts</span><ul className="list-disc list-inside mt-0.5 text-muted-foreground">{guide.key_concepts.slice(0, 3).map((c, i) => <li key={i}>{c}</li>)}</ul></div>
                                  <div><span className="font-semibold text-foreground flex items-center gap-1"><PenTool className="h-3 text-secondary" />Practice</span><ul className="list-disc list-inside mt-0.5 text-muted-foreground">{guide.practice_tasks.slice(0, 2).map((t, i) => <li key={i}>{t}</li>)}</ul></div>
                                  <div><span className="font-semibold text-foreground flex items-center gap-1"><Target className="h-3 text-success" />IB tips</span><ul className="list-disc list-inside mt-0.5 text-muted-foreground">{guide.ib_exam_tips.slice(0, 2).map((t, i) => <li key={i}>{t}</li>)}</ul></div>
                                </div>
                              );
                            })()}
                          </div>
                          </DraggableSessionCard>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
        </DndContext>
      )}

      {/* List view */}
      {view === "list" && (
        <div className="space-y-4">
          {chapters.map(([key, label]) => {
            const chapterSessions = sessions.filter((s) => getChapterForTopic(s.topic_id) === key);
            if (chapterSessions.length === 0) return null;
            return (
              <div key={key} className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Topic {key}: {label}
                </h3>
                {chapterSessions.map((s) => {
                  const cfg = STATUS_CONFIG[s.status];
                  const needsHelp = s.needs_tutor_help;
                  const guideOpen = expandedGuideId === s.id;
                  const guide = getSessionGuide(s.topic_id);
                  return (
                    <div
                      key={s.id}
                      className={cn(
                        "rounded-xl border bg-card shadow-card overflow-hidden",
                        needsHelp ? "border-destructive/40 bg-destructive/5" : "border-border"
                      )}
                    >
                      <div className="flex items-center gap-3 px-4 py-3">
                        <span className="text-lg">{cfg.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium leading-tight">{s.topic_name}</p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{s.estimated_minutes}min</span>
                            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", cfg.cls)}>{cfg.label}</span>
                            {(s.session_type === "review" || s.session_type === "recovery") && (
                              <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-xs font-medium text-secondary">
                                {s.session_type === "recovery" ? "Recovery" : "Review"}
                              </span>
                            )}
                            {needsHelp && (
                              <span className="rounded-full bg-destructive/20 px-2 py-0.5 text-xs font-medium text-destructive">
                                Needs help
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleTutorToggle(s.id, !!needsHelp)}
                          className={cn(
                            "flex-shrink-0 rounded-lg p-2 transition-all",
                            needsHelp
                              ? "bg-destructive/20 text-destructive"
                              : "bg-muted text-muted-foreground hover:text-warning"
                          )}
                          title={needsHelp ? "Remove tutor help flag" : "Flag for tutor help"}
                        >
                          <HelpCircle className="h-4 w-4" />
                        </button>
                      </div>
                      {guide && (
                        <div className="border-t border-border px-4 pb-2">
                          <button
                            onClick={() => setExpandedGuideId(guideOpen ? null : s.id)}
                            className="flex w-full items-center justify-between py-2 text-left text-xs font-medium text-muted-foreground hover:text-foreground"
                          >
                            <span>Session Guide</span>
                            {guideOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>
                          {guideOpen && (
                            <div className="space-y-2 rounded-lg bg-muted/30 px-3 py-2 text-[11px]">
                              <div><span className="font-semibold flex items-center gap-1"><Brain className="h-3 text-primary" />Key concepts</span><ul className="list-disc list-inside mt-0.5 text-muted-foreground">{guide.key_concepts.slice(0, 3).map((c, i) => <li key={i}>{c}</li>)}</ul></div>
                              <div><span className="font-semibold flex items-center gap-1"><PenTool className="h-3 text-secondary" />Practice</span><ul className="list-disc list-inside mt-0.5 text-muted-foreground">{guide.practice_tasks.slice(0, 2).map((t, i) => <li key={i}>{t}</li>)}</ul></div>
                              <div><span className="font-semibold flex items-center gap-1"><Target className="h-3 text-success" />IB tips</span><ul className="list-disc list-inside mt-0.5 text-muted-foreground">{guide.ib_exam_tips.slice(0, 2).map((t, i) => <li key={i}>{t}</li>)}</ul></div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Weekly override bottom sheet */}
      {showWeekOverrideSheet && planId && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50" onClick={() => setShowWeekOverrideSheet(false)}>
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl border border-border bg-card p-4 shadow-lg animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold">This week&apos;s hours</h3>
              <button onClick={() => setShowWeekOverrideSheet(false)} className="p-1 text-muted-foreground hover:text-foreground">×</button>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">Override your usual availability for this week only.</p>
            <div className="space-y-3">
              {DAYS.map((day) => (
                <div key={day} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                  <span className="font-medium">{DAY_LABELS[day]}</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((h) => (
                      <button
                        key={h}
                        onClick={() => setWeekHours((prev) => ({ ...prev, [day]: h }))}
                        className={cn(
                          "rounded-lg px-3 py-1 text-sm font-medium transition-all",
                          (weekHours[day] ?? 0) === h ? "gradient-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {overrideSaveError && <p className="mt-2 text-sm text-destructive">{overrideSaveError}</p>}
            <button
              onClick={handleSaveWeekOverride}
              disabled={isPending}
              className="mt-4 w-full rounded-xl gradient-primary py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

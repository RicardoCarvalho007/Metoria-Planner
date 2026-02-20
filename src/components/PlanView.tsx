"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Calendar, List, Clock, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHAPTERS, getChapterForTopic } from "@/data/syllabus";
import { rescheduleAllMissed } from "@/actions/plan";
import { toggleTutorHelp } from "@/actions/tutor";
import type { ScheduledSession } from "@/types/database";

const STATUS_CONFIG = {
  pending: { icon: "🟡", label: "Scheduled", cls: "text-warning bg-warning/10" },
  completed: { icon: "✅", label: "Done", cls: "text-success bg-success/10" },
  missed: { icon: "❌", label: "Missed", cls: "text-destructive bg-destructive/10" },
  rescheduled: { icon: "🔄", label: "Rescheduled", cls: "text-secondary bg-secondary/10" },
} as const;

interface Props {
  sessions: ScheduledSession[];
  completedCount: number;
  totalTopicCount: number;
  examDate: string;
}

export default function PlanView({ sessions: initialSessions, completedCount, totalTopicCount, examDate }: Props) {
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

  return (
    <div className="flex flex-col gap-4 page-padding py-5 animate-fade-up">
      <h1 className="text-2xl font-black">Study Plan</h1>

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
            <button
              onClick={handleReschedule}
              disabled={isPending || examPassed}
              className="rounded-lg bg-warning px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
            >
              {isPending ? "..." : "Reschedule"}
            </button>
          </div>
          {rescheduleError && (
            <p className="text-xs text-destructive px-1">{rescheduleError}</p>
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
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <div className="mb-2 grid grid-cols-7 gap-1 text-center">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="py-1 text-xs font-semibold text-muted-foreground">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((d, i) => {
              const dateStr = d.toISOString().split("T")[0];
              const hasSession = sessions.some((s) => s.scheduled_date === dateStr);
              const isToday = dateStr === todayStr;
              const isPast = dateStr < todayStr;
              return (
                <div
                  key={i}
                  className={cn(
                    "relative flex aspect-square flex-col items-center justify-center rounded-lg text-xs font-medium",
                    isToday && "bg-primary text-white",
                    !isToday && isPast && "text-muted-foreground",
                  )}
                >
                  {d.getDate()}
                  {hasSession && !isToday && (
                    <div className={cn("absolute bottom-1 h-1.5 w-1.5 rounded-full", isPast ? "bg-muted-foreground" : "bg-primary")} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
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
                  return (
                    <div
                      key={s.id}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-card",
                        needsHelp ? "border-destructive/40 bg-destructive/5" : "border-border"
                      )}
                    >
                      <span className="text-lg">{cfg.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium leading-tight">{s.topic_name}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{s.estimated_minutes}min</span>
                          <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", cfg.cls)}>{cfg.label}</span>
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
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

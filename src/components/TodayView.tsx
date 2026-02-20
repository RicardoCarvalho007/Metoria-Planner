"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  PlayCircle, CheckCircle2, Clock, Flame, Zap, BookOpen,
  CalendarDays, ChevronDown, ChevronUp, HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SYLLABUS } from "@/data/syllabus";
import type { ScheduledSession, Profile } from "@/types/database";
import { toggleTutorHelp } from "@/actions/tutor";
import TimerModal from "./TimerModal";

interface PlanStats {
  total: number;
  completed: number;
  missed: number;
  pending: number;
  examDate: string;
}

interface Props {
  profile: Pick<Profile, "full_name" | "total_xp" | "current_streak" | "last_study_date">;
  sessions: ScheduledSession[];
  upcomingSessions: ScheduledSession[];
  completedTopicCount: number;
  planStats: PlanStats;
}

export default function TodayView({
  profile,
  sessions: initial,
  upcomingSessions,
  completedTopicCount,
  planStats,
}: Props) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initial);
  const [upcoming, setUpcoming] = useState(upcomingSessions);
  const [activeSession, setActiveSession] = useState<ScheduledSession | null>(null);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [, startTransition] = useTransition();

  const completed = sessions.filter((s) => s.status === "completed").length;
  const total = sessions.length;
  const pct = total > 0 ? (completed / total) * 100 : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = (profile.full_name || "Student").split(" ")[0];

  const overallPct = planStats.total > 0 ? Math.round((planStats.completed / planStats.total) * 100) : 0;
  const daysUntilExam = Math.max(0, Math.ceil(
    (new Date(planStats.examDate).getTime() - Date.now()) / 86400000
  ));
  const examPassed = new Date(planStats.examDate).getTime() < Date.now();

  const todayStr = new Date().toISOString().split("T")[0];
  const studiedToday = profile.last_study_date === todayStr;

  const handleComplete = () => {
    if (activeSession) {
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSession.id ? { ...s, status: "completed" as const } : s))
      );
      // Remove from upcoming if it was there (same topic_id across days)
      setUpcoming((prev) =>
        prev.filter((s) => s.id !== activeSession.id)
      );
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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00");
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateStr === today.toISOString().split("T")[0]) return "Today";
    if (dateStr === tomorrow.toISOString().split("T")[0]) return "Tomorrow";
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const groupedUpcoming = upcoming.reduce<Record<string, ScheduledSession[]>>(
    (acc, s) => {
      (acc[s.scheduled_date] ??= []).push(s);
      return acc;
    },
    {}
  );
  const upcomingDates = Object.keys(groupedUpcoming).sort();
  const visibleDates = showAllUpcoming ? upcomingDates : upcomingDates.slice(0, 3);

  return (
    <div className="flex flex-col gap-4 page-padding py-5 animate-fade-up">
      {/* Header + greeting */}
      <div>
        <p className="text-sm text-muted-foreground">{greeting},</p>
        <h1 className="text-2xl font-black">{firstName} 👋</h1>
      </div>

      {/* ── Feature 4: Prominent Streak Hero ── */}
      <div className={cn(
        "relative overflow-hidden rounded-2xl border p-5 text-center shadow-card",
        profile.current_streak > 0
          ? "border-warning/30 bg-gradient-to-br from-warning/15 via-card to-card"
          : "border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card"
      )}>
        <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-warning/10 blur-2xl" />
        <div className="text-5xl">🔥</div>
        <div className={cn(
          "mt-2 text-4xl font-black tabular-nums",
          profile.current_streak > 0 ? "text-warning" : "text-primary"
        )}>
          {profile.current_streak} {profile.current_streak === 1 ? "day" : "days"}
        </div>
        <div className="mt-1 text-sm font-semibold text-muted-foreground">
          {profile.current_streak === 0 && (
            <span className="text-warning">Start your streak today!</span>
          )}
          {profile.current_streak > 0 && !studiedToday && (
            <span className="text-warning">Don&apos;t break your streak! Study today.</span>
          )}
          {profile.current_streak > 0 && studiedToday && (
            <span className="text-success">Streak secured for today ✓</span>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: <Zap className="h-4 w-4 text-warning" />, label: "Total XP", value: profile.total_xp.toLocaleString() },
          { icon: <Flame className="h-4 w-4 text-primary" />, label: "Streak", value: `${profile.current_streak}d` },
          { icon: <BookOpen className="h-4 w-4 text-success" />, label: "Topics", value: completedTopicCount },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-3 text-center shadow-card">
            <div className="mb-1 flex justify-center">{s.icon}</div>
            <div className="text-base font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Overall plan progress */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold">Overall Plan</span>
          <span className="text-xs text-muted-foreground">
            {examPassed ? "Exam passed" : `${daysUntilExam} days to exam`}
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full gradient-primary transition-all duration-500" style={{ width: `${overallPct}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span><span className="font-semibold text-success">{planStats.completed}</span> done</span>
          <span><span className="font-semibold text-foreground">{planStats.pending}</span> remaining</span>
          {planStats.missed > 0 && (
            <span><span className="font-semibold text-destructive">{planStats.missed}</span> missed</span>
          )}
        </div>
      </div>

      {/* Today's progress */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold">Today&apos;s Progress <span className="text-[9px] text-muted-foreground/50">v2</span></span>
          <span className="text-sm font-bold text-primary">{completed}/{total}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full gradient-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">{total - completed} sessions remaining today</p>
      </div>

      {/* Today's Sessions */}
      <div className="space-y-3">
        <h2 className="text-base font-bold">Today&apos;s Sessions</h2>
        {sessions.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
            <div className="mb-2 text-4xl">🎉</div>
            <p className="font-semibold">Rest day!</p>
            <p className="text-sm text-muted-foreground">No sessions scheduled today.</p>
          </div>
        ) : (
          sessions.map((s) => {
            const difficulty = getDifficulty(s.topic_id);
            const needsHelp = s.needs_tutor_help;
            return (
              <div
                key={s.id}
                className={cn(
                  "rounded-xl border bg-card p-4 shadow-card transition-all",
                  needsHelp && "border-destructive/40 bg-destructive/5",
                  !needsHelp && s.status === "completed" && "border-success/30 bg-success/5",
                  !needsHelp && s.status !== "completed" && "border-border hover:border-primary/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("mt-0.5 flex-shrink-0 rounded-full p-1.5", s.status === "completed" ? "bg-success/20" : "bg-muted")}>
                    {s.status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm font-semibold leading-tight", s.status === "completed" && "text-muted-foreground line-through")}>
                      {s.topic_name}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />{s.estimated_minutes}min
                      </div>
                      {diffBadge(difficulty)}
                      {needsHelp && (
                        <span className="rounded-full bg-destructive/20 px-2 py-0.5 text-xs font-medium text-destructive">
                          Needs help
                        </span>
                      )}
                      {s.status === "completed" && s.xp_earned > 0 && (
                        <span className="text-xs font-medium text-warning">+{s.xp_earned} XP</span>
                      )}
                    </div>
                  </div>
                  {/* Tutor help toggle */}
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
                {s.status === "pending" && (
                  <button
                    className="mt-3 w-full rounded-lg gradient-primary py-2.5 text-sm font-semibold text-white"
                    onClick={() => setActiveSession(s)}
                  >
                    <PlayCircle className="mr-1.5 inline h-4 w-4" />Start Session
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Upcoming Schedule */}
      {upcomingDates.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-secondary" />
            <h2 className="text-base font-bold">Upcoming Schedule</h2>
          </div>

          {visibleDates.map((date) => (
            <div key={date} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {formatDate(date)}
                </span>
                <span className="text-xs text-muted-foreground">
                  · {groupedUpcoming[date].reduce((sum, s) => sum + s.estimated_minutes, 0)} min
                </span>
              </div>
              {groupedUpcoming[date].map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-card"
                >
                  <div className="flex-shrink-0 rounded-full bg-muted p-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.topic_name}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />{s.estimated_minutes}min
                      </span>
                      {diffBadge(getDifficulty(s.topic_id))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {upcomingDates.length > 3 && (
            <button
              onClick={() => setShowAllUpcoming((v) => !v)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
            >
              {showAllUpcoming ? (
                <>Show less <ChevronUp className="h-4 w-4" /></>
              ) : (
                <>Show {upcomingDates.length - 3} more days <ChevronDown className="h-4 w-4" /></>
              )}
            </button>
          )}
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

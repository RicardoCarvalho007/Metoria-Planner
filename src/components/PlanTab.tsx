import { useState } from "react";
import { MOCK_TODAY_SESSIONS, MOCK_UPCOMING_SESSIONS, MOCK_PROFILE } from "@/data/mockData";
import { SessionStatus } from "@/types/app";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Clock, XCircle, Calendar, List } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_CONFIG: Record<SessionStatus, { icon: string; label: string; className: string }> = {
  pending: { icon: "🟡", label: "Scheduled", className: "text-warning bg-warning/10" },
  completed: { icon: "✅", label: "Done", className: "text-success bg-success/10" },
  missed: { icon: "❌", label: "Missed", className: "text-destructive bg-destructive/10" },
  rescheduled: { icon: "🔄", label: "Rescheduled", className: "text-primary bg-primary/10" },
};

const CHAPTERS = [
  { key: "1", label: "Number & Algebra" },
  { key: "2", label: "Functions" },
  { key: "3", label: "Geometry & Trig" },
  { key: "4", label: "Statistics & Probability" },
  { key: "5", label: "Calculus" },
];

const CALENDAR_DAYS = Array.from({ length: 35 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1 + i - 7);
  return d;
});

export default function PlanTab() {
  const [view, setView] = useState<"calendar" | "list">("list");
  const allSessions = [...MOCK_TODAY_SESSIONS, ...MOCK_UPCOMING_SESSIONS];
  const missedCount = allSessions.filter((s) => s.status === "missed").length;
  const profile = MOCK_PROFILE;

  const completedTopics = 8;
  const totalTopics = 27;
  const progressPct = Math.round((completedTopics / totalTopics) * 100);
  const circumference = 2 * Math.PI * 40;

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col gap-4 page-padding py-5 animate-fade-up">
      {/* Header */}
      <h1 className="text-2xl font-black">Study Plan</h1>

      {/* Progress ring */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-4">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="40"
              fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progressPct / 100)}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black">{progressPct}%</span>
          </div>
        </div>
        <div>
          <div className="font-bold text-base">Syllabus Progress</div>
          <div className="text-muted-foreground text-sm">{completedTopics} of {totalTopics} topics completed</div>
          <div className="flex items-center gap-1 mt-1.5 text-sm">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Exam in <span className="text-foreground font-semibold">47 days</span></span>
          </div>
        </div>
      </div>

      {/* Missed sessions banner */}
      {missedCount > 0 && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm font-semibold text-warning">
              {missedCount} missed session{missedCount > 1 ? "s" : ""}
            </span>
          </div>
          <Button size="sm" className="text-xs gradient-warning text-warning-foreground rounded-lg font-semibold">
            Reschedule
          </Button>
        </div>
      )}

      {/* View toggle */}
      <div className="flex gap-2 bg-secondary rounded-xl p-1">
        {(["calendar", "list"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5",
              view === v ? "gradient-primary text-primary-foreground" : "text-muted-foreground"
            )}
          >
            {v === "calendar" ? <Calendar className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* Calendar view */}
      {view === "calendar" && (
        <div className="bg-card rounded-xl p-4 border border-border shadow-card">
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="text-xs text-muted-foreground font-semibold py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {CALENDAR_DAYS.map((d, i) => {
              const dateStr = d.toISOString().split("T")[0];
              const hasSession = allSessions.some((s) => s.scheduledDate === dateStr);
              const isToday = dateStr === todayStr;
              const isPast = dateStr < todayStr;
              return (
                <div
                  key={i}
                  className={cn(
                    "aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium relative",
                    isToday && "bg-primary text-primary-foreground",
                    !isToday && isPast && "text-muted-foreground",
                    !isToday && !isPast && "text-foreground"
                  )}
                >
                  {d.getDate()}
                  {hasSession && !isToday && (
                    <div className={cn(
                      "absolute bottom-1 w-1.5 h-1.5 rounded-full",
                      isPast ? "bg-muted-foreground" : "bg-primary"
                    )} />
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
          {CHAPTERS.map((chapter) => {
            const chapterSessions = allSessions.filter((s) => s.topicId.includes(`_${chapter.key}_`));
            if (chapterSessions.length === 0) return null;
            return (
              <div key={chapter.key} className="space-y-2">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">
                  Topic {chapter.key}: {chapter.label}
                </h3>
                {chapterSessions.map((session) => {
                  const config = STATUS_CONFIG[session.status];
                  return (
                    <div key={session.id} className="bg-card rounded-xl px-4 py-3 border border-border shadow-card flex items-center gap-3">
                      <span className="text-lg">{config.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight truncate">{session.topicName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{session.estimatedMinutes}min</span>
                          <span className={cn("text-xs rounded-full px-2 py-0.5 font-medium", config.className)}>
                            {config.label}
                          </span>
                        </div>
                      </div>
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

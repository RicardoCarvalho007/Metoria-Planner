import { useState } from "react";
import { ScheduledSession, UserProfile } from "@/types/app";
import { MOCK_TODAY_SESSIONS, MOCK_PROFILE } from "@/data/mockData";
import TimerModal from "@/components/TimerModal";
import { cn } from "@/lib/utils";
import { PlayCircle, CheckCircle2, Clock, Flame, Zap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TodayTabProps {
  profile: UserProfile;
  onXpEarned: (xp: number) => void;
}

export default function TodayTab({ profile, onXpEarned }: TodayTabProps) {
  const [sessions, setSessions] = useState<ScheduledSession[]>(MOCK_TODAY_SESSIONS);
  const [activeSession, setActiveSession] = useState<ScheduledSession | null>(null);

  const completed = sessions.filter((s) => s.status === "completed").length;
  const total = sessions.length;
  const progressPct = total > 0 ? (completed / total) * 100 : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const handleComplete = (sessionId: string, minutes: number, xp: number) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, status: "completed", xpEarned: xp } : s
      )
    );
    onXpEarned(xp);
    setActiveSession(null);
  };

  const getDifficultyBadge = (d: 1 | 2 | 3) => {
    if (d === 1) return <span className="text-xs bg-success/20 text-success rounded-full px-2 py-0.5 font-medium">Easy</span>;
    if (d === 2) return <span className="text-xs bg-warning/20 text-warning rounded-full px-2 py-0.5 font-medium">Medium</span>;
    return <span className="text-xs bg-destructive/20 text-destructive rounded-full px-2 py-0.5 font-medium">Hard</span>;
  };

  return (
    <div className="flex flex-col gap-4 page-padding py-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{greeting},</p>
          <h1 className="text-2xl font-black">{profile.fullName.split(" ")[0]} 👋</h1>
        </div>
        <div className="flex items-center gap-1.5 bg-warning/10 border border-warning/30 rounded-full px-3 py-1.5">
          <Flame className="h-4 w-4 text-warning" />
          <span className="text-warning font-bold text-sm">{profile.currentStreak} days</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: <Zap className="h-4 w-4 text-warning" />, label: "Total XP", value: profile.totalXp.toLocaleString() },
          { icon: <Flame className="h-4 w-4 text-primary" />, label: "Streak", value: `${profile.currentStreak}d` },
          { icon: <BookOpen className="h-4 w-4 text-success" />, label: "Topics done", value: profile.topicsCompleted },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl p-3 text-center shadow-card border border-border">
            <div className="flex justify-center mb-1">{stat.icon}</div>
            <div className="font-bold text-base">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="bg-card rounded-xl p-4 shadow-card border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">Today's progress</span>
          <span className="text-sm font-bold text-primary">{completed}/{total}</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          {total - completed} sessions remaining
        </p>
      </div>

      {/* Session cards */}
      <div className="space-y-3">
        <h2 className="font-bold text-base">Today's Sessions</h2>
        {sessions.length === 0 ? (
          <div className="bg-card rounded-xl p-8 text-center shadow-card border border-border">
            <div className="text-4xl mb-2">🎉</div>
            <p className="font-semibold">Rest day!</p>
            <p className="text-muted-foreground text-sm">You have no sessions scheduled today.</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                "bg-card rounded-xl p-4 shadow-card border transition-all",
                session.status === "completed"
                  ? "border-success/30 bg-success/5"
                  : "border-border hover:border-primary/30"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "mt-0.5 rounded-full p-1.5 flex-shrink-0",
                  session.status === "completed" ? "bg-success/20" : "bg-muted"
                )}>
                  {session.status === "completed"
                    ? <CheckCircle2 className="h-4 w-4 text-success" />
                    : <BookOpen className="h-4 w-4 text-muted-foreground" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-semibold text-sm leading-tight",
                    session.status === "completed" && "line-through text-muted-foreground"
                  )}>
                    {session.topicName}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {session.estimatedMinutes}min
                    </div>
                    {getDifficultyBadge(session.difficulty)}
                    {session.status === "completed" && (
                      <span className="text-xs text-warning font-medium">+{session.xpEarned} XP</span>
                    )}
                  </div>
                </div>
              </div>
              {session.status === "pending" && (
                <Button
                  className="w-full gradient-primary text-primary-foreground font-semibold py-2.5 rounded-lg mt-3 text-sm"
                  onClick={() => setActiveSession(session)}
                >
                  <PlayCircle className="h-4 w-4 mr-1.5" />
                  Start Session
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Timer modal */}
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

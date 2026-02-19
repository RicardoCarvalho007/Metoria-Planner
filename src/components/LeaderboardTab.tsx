import { useState } from "react";
import { MOCK_LEADERBOARD, MOCK_WEEKLY_LEADERBOARD } from "@/data/mockData";
import { COURSE_LABELS } from "@/data/syllabus";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

export default function LeaderboardTab() {
  const [period, setPeriod] = useState<"week" | "alltime">("week");
  const entries = period === "week" ? MOCK_WEEKLY_LEADERBOARD : MOCK_LEADERBOARD;

  const MEDAL = ["🥇", "🥈", "🥉"];

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const AVATAR_COLORS = [
    "bg-primary", "bg-success", "bg-warning", "bg-destructive",
    "from-primary to-purple-500", "from-success to-teal-500"
  ];

  return (
    <div className="flex flex-col gap-4 page-padding py-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Trophy className="h-6 w-6 text-warning" />
        <h1 className="text-2xl font-black">Leaderboard</h1>
      </div>

      {/* Period toggle */}
      <div className="flex gap-2 bg-secondary rounded-xl p-1">
        {(["week", "alltime"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
              period === p ? "gradient-primary text-primary-foreground" : "text-muted-foreground"
            )}
          >
            {p === "week" ? "This Week" : "All Time"}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-card">
        <div className="flex items-end justify-center gap-4">
          {entries.slice(0, 3).map((entry, i) => {
            const orderIndex = [1, 0, 2][i]; // second, first, third positions
            const orderedEntry = entries[orderIndex];
            const heights = ["h-16", "h-20", "h-12"];
            return (
              <div key={orderedEntry.userId} className="flex flex-col items-center gap-2 flex-1">
                <div className="text-2xl">{MEDAL[orderIndex]}</div>
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm",
                  orderedEntry.isCurrentUser ? "gradient-primary text-primary-foreground ring-2 ring-primary glow-primary" : "bg-muted text-muted-foreground"
                )}>
                  {getInitials(orderedEntry.name)}
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold truncate max-w-[70px]">{orderedEntry.name.split(" ")[0]}</div>
                  <div className="text-xs text-primary font-bold">{orderedEntry.xp.toLocaleString()} XP</div>
                </div>
                <div className={cn(
                  "w-full rounded-t-lg gradient-primary opacity-80",
                  heights[orderIndex]
                )} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Full list */}
      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.userId}
            className={cn(
              "bg-card rounded-xl px-4 py-3 border flex items-center gap-3 shadow-card transition-all",
              entry.isCurrentUser ? "border-primary/50 bg-primary/5 glow-primary" : "border-border"
            )}
          >
            <div className={cn(
              "w-7 text-center font-bold text-sm",
              entry.rank <= 3 ? "text-warning" : "text-muted-foreground"
            )}>
              {entry.rank <= 3 ? MEDAL[entry.rank - 1] : `#${entry.rank}`}
            </div>
            <div className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0",
              entry.isCurrentUser ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {getInitials(entry.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm flex items-center gap-1.5">
                {entry.name}
                {entry.isCurrentUser && <span className="text-xs bg-primary/20 text-primary rounded-full px-1.5 py-0.5">You</span>}
              </div>
              <div className="text-xs text-muted-foreground">{COURSE_LABELS[entry.course]}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-sm">{entry.xp.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">XP</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

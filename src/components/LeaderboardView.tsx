"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { COURSE_LABELS, type Course } from "@/data/syllabus";
import type { LeaderboardEntry } from "@/types/database";

interface Props {
  allTimeEntries: LeaderboardEntry[];
  weeklyEntries: LeaderboardEntry[];
  currentUserId: string;
}

const MEDAL = ["🥇", "🥈", "🥉"];

function getInitials(name: string) {
  if (!name?.trim()) return "?";
  return name.trim().split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function LeaderboardView({ allTimeEntries, weeklyEntries, currentUserId }: Props) {
  const [period, setPeriod] = useState<"week" | "alltime">("week");
  const entries = period === "week" ? weeklyEntries : allTimeEntries;

  return (
    <div className="flex flex-col gap-4 page-padding py-5 animate-fade-up">
      <div className="flex items-center gap-2">
        <Trophy className="h-6 w-6 text-warning" />
        <h1 className="text-2xl font-black">Leaderboard</h1>
      </div>

      {/* Toggle */}
      <div className="flex gap-2 rounded-xl bg-muted p-1">
        {(["week", "alltime"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-semibold transition-all",
              period === p ? "gradient-primary text-white" : "text-muted-foreground"
            )}
          >
            {p === "week" ? "This Week" : "All Time"}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
          <div className="mb-2 text-4xl">🏆</div>
          <p className="font-semibold">No rankings yet</p>
          <p className="text-sm text-muted-foreground">
            {period === "week" ? "Complete sessions this week to appear here." : "Start studying to earn XP!"}
          </p>
        </div>
      ) : (
        <>
          {/* Podium */}
          {entries.length >= 3 && (
            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-end justify-center gap-4">
                {[1, 0, 2].map((orderIdx) => {
                  const entry = entries[orderIdx];
                  if (!entry) return null;
                  const heights = ["h-20", "h-16", "h-12"];
                  const isCurrent = entry.user_id === currentUserId;
                  return (
                    <div key={entry.user_id} className="flex flex-1 flex-col items-center gap-2">
                      <div className="text-2xl">{MEDAL[orderIdx]}</div>
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold",
                          isCurrent
                            ? "gradient-primary text-white ring-2 ring-primary glow-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {getInitials(entry.full_name)}
                      </div>
                      <div className="text-center">
                        <div className="max-w-[70px] truncate text-xs font-semibold">
                          {entry.full_name.split(" ")[0]}
                        </div>
                        <div className="text-xs font-bold text-primary">
                          {entry.total_xp.toLocaleString()} XP
                        </div>
                      </div>
                      <div className={cn("w-full rounded-t-lg gradient-primary opacity-80", heights[orderIdx])} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* List */}
          <div className="space-y-2">
            {entries.map((entry, idx) => {
              const rank = idx + 1;
              const isCurrent = entry.user_id === currentUserId;
              return (
                <div
                  key={entry.user_id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-card transition-all",
                    isCurrent ? "border-primary/50 bg-primary/5 glow-primary" : "border-border"
                  )}
                >
                  <div className={cn("w-7 text-center text-sm font-bold", rank <= 3 ? "text-warning" : "text-muted-foreground")}>
                    {rank <= 3 ? MEDAL[rank - 1] : `#${rank}`}
                  </div>
                  <div
                    className={cn(
                      "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      isCurrent ? "gradient-primary text-white" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {getInitials(entry.full_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                      {entry.full_name}
                      {isCurrent && (
                        <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-xs text-primary">You</span>
                      )}
                    </div>
                    {entry.course && (
                      <div className="text-xs text-muted-foreground">
                        {COURSE_LABELS[entry.course as Course] ?? entry.course}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{entry.total_xp.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">XP</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

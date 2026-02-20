"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Calendar, Flame, Zap, BookOpen, Trophy, LogOut,
  RotateCcw, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { COURSE_LABELS, type Course } from "@/data/syllabus";
import { deactivateCurrentPlan } from "@/actions/plan";
import type { Profile, StudyPlan, BadgeDefinition, UserBadge } from "@/types/database";

const BADGE_EMOJIS: Record<string, string> = {
  first_step: "🌱",
  on_fire: "🔥",
  week_warrior: "⚔️",
  consistent: "🏅",
  topic_master: "📚",
  halfway: "🏁",
  full_coverage: "🎓",
  early_bird: "🌅",
  night_owl: "🦉",
};

interface Props {
  profile: Profile;
  plan: StudyPlan | null;
  badges: UserBadge[];
  badgeDefinitions: BadgeDefinition[];
  completedTopicCount: number;
  totalTopicCount: number;
  totalStudyMinutes: number;
}

function getInitials(name: string) {
  if (!name?.trim()) return "?";
  return name.trim().split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function ProfileView({
  profile, plan, badges, badgeDefinitions,
  completedTopicCount, totalTopicCount, totalStudyMinutes,
}: Props) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const [resetting, setResetting] = useState(false);

  const handleResetPlan = async () => {
    setResetting(true);
    const res = await deactivateCurrentPlan();
    if (res && "error" in res) {
      setResetting(false);
      return;
    }
    window.location.href = "/onboarding";
  };

  const daysUntilExam = plan
    ? Math.max(0, Math.ceil((new Date(plan.exam_date).getTime() - Date.now()) / 86400000))
    : 0;
  const examPassed = plan ? new Date(plan.exam_date).getTime() < Date.now() : false;

  const earnedBadgeIds = new Set(badges.map((b) => b.badge_id));
  const studyHours = Math.round(totalStudyMinutes / 60);

  return (
    <div className="flex flex-col gap-4 page-padding py-5 animate-fade-up">
      {/* Profile header */}
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-primary text-2xl font-black text-white glow-primary">
          {getInitials(profile.full_name)}
        </div>
        <div className="text-center">
          <h1 className="text-xl font-black">{profile.full_name}</h1>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
        </div>
        {plan && (
          <div className="flex items-center gap-2">
            <span className="rounded-full gradient-primary px-3 py-1 text-xs font-semibold text-white">
              {COURSE_LABELS[plan.course as Course] ?? plan.course}
            </span>
          </div>
        )}
      </div>

      {/* Exam countdown */}
      {plan && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-base font-bold">{examPassed ? "Passed" : `${daysUntilExam} days`}</div>
              <div className="text-xs text-muted-foreground">{examPassed ? "Exam date passed" : "until your exam"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: <Zap className="h-5 w-5 text-warning" />, label: "Total XP", value: profile.total_xp.toLocaleString(), bg: "bg-warning/10" },
          { icon: <Flame className="h-5 w-5 text-primary" />, label: "Best Streak", value: `${profile.longest_streak} days`, bg: "bg-primary/10" },
          { icon: <BookOpen className="h-5 w-5 text-success" />, label: "Topics Done", value: `${completedTopicCount}/${totalTopicCount}`, bg: "bg-success/10" },
          { icon: <Clock className="h-5 w-5 text-secondary" />, label: "Study Time", value: `${studyHours}h`, bg: "bg-secondary/10" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className={cn("mb-2 flex h-9 w-9 items-center justify-center rounded-xl", s.bg)}>
              {s.icon}
            </div>
            <div className="text-lg font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-warning" />
          <h2 className="text-base font-bold">Badges</h2>
          <span className="ml-auto text-sm text-muted-foreground">
            {badges.length}/{badgeDefinitions.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {badgeDefinitions.map((bd) => {
            const earned = earnedBadgeIds.has(bd.id);
            return (
              <div
                key={bd.id}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition-all",
                  earned ? "bg-primary/10 border border-primary/30" : "bg-muted/50 opacity-50"
                )}
              >
                <span className="text-2xl">{BADGE_EMOJIS[bd.id] ?? bd.emoji}</span>
                <span className="text-xs font-semibold leading-tight">{bd.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-2">
        <button
          onClick={handleResetPlan}
          disabled={resetting}
          className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-left text-sm font-medium shadow-card transition-all hover:border-primary/30 disabled:opacity-50"
        >
          <RotateCcw className={cn("h-4 w-4 text-muted-foreground", resetting && "animate-spin")} />
          <span>{resetting ? "Resetting..." : "New Study Plan"}</span>
        </button>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl border border-destructive/30 bg-card px-4 py-3.5 text-left text-sm font-medium text-destructive shadow-card transition-all hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

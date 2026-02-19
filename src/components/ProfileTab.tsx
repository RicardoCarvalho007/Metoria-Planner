import { MOCK_PROFILE, MOCK_BADGES } from "@/data/mockData";
import { COURSE_LABELS } from "@/data/syllabus";
import { UserProfile } from "@/types/app";
import { cn } from "@/lib/utils";
import { Calendar, Flame, Zap, BookOpen, Clock, Settings, ChevronRight, LogOut } from "lucide-react";

interface ProfileTabProps {
  profile: UserProfile;
}

export default function ProfileTab({ profile }: ProfileTabProps) {
  const examDate = new Date(profile.examDate);
  const daysUntilExam = Math.ceil((examDate.getTime() - Date.now()) / 86400000);
  const initials = profile.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const progressPct = Math.round((profile.topicsCompleted / profile.totalTopics) * 100);

  return (
    <div className="flex flex-col gap-4 page-padding py-5 animate-fade-up pb-24">
      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-2xl font-black text-primary-foreground glow-primary">
          {initials}
        </div>
        <div className="text-center">
          <h1 className="text-xl font-black">{profile.fullName}</h1>
          {profile.school && <p className="text-muted-foreground text-sm">{profile.school}</p>}
          <span className="inline-block mt-1.5 text-xs bg-primary/20 text-primary rounded-full px-3 py-1 font-semibold">
            {COURSE_LABELS[profile.course]}
          </span>
        </div>
      </div>

      {/* Exam countdown */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">IB Exam countdown</p>
          <p className="font-bold">📅 <span className="text-primary">{daysUntilExam} days</span> until your exam</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-card">
        <h2 className="font-bold mb-3">Your Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <Zap className="h-4 w-4 text-warning" />, label: "Total XP", value: profile.totalXp.toLocaleString() },
            { icon: <BookOpen className="h-4 w-4 text-success" />, label: "Topics completed", value: `${profile.topicsCompleted}/${profile.totalTopics}` },
            { icon: <Clock className="h-4 w-4 text-primary" />, label: "Study hours", value: `${profile.studyHours}h` },
            { icon: <Flame className="h-4 w-4 text-warning" />, label: "Longest streak", value: `${profile.longestStreak} days` },
          ].map((stat) => (
            <div key={stat.label} className="bg-muted rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                {stat.icon}
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <div className="font-bold text-lg">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Syllabus coverage</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-card">
        <h2 className="font-bold mb-3">Badges</h2>
        <div className="grid grid-cols-3 gap-3">
          {MOCK_BADGES.map((badge) => (
            <div
              key={badge.id}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition-all",
                badge.earned ? "bg-primary/10 border border-primary/20" : "bg-muted opacity-40"
              )}
            >
              <span className="text-2xl">{badge.emoji}</span>
              <span className="text-xs font-semibold leading-tight">{badge.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <h2 className="font-bold px-4 pt-4 pb-2">Settings</h2>
        {[
          { label: "Edit profile", icon: null },
          { label: "Change availability", icon: null },
          { label: "Notifications", icon: null },
        ].map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors border-t border-border"
          >
            <span className="text-sm font-medium">{item.label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
        <button className="w-full flex items-center gap-2 px-4 py-3 hover:bg-destructive/5 transition-colors border-t border-border text-destructive">
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </div>
    </div>
  );
}

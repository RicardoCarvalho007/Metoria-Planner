import { AppTab } from "@/types/app";
import { cn } from "@/lib/utils";
import { Home, BookOpen, Trophy, User } from "lucide-react";

interface BottomNavProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}

const TABS: { id: AppTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "today", label: "Today", icon: Home },
  { id: "plan", label: "Plan", icon: BookOpen },
  { id: "leaderboard", label: "Rank", icon: Trophy },
  { id: "profile", label: "Profile", icon: User },
];

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center">
      <div className="mobile-container w-full bg-card border-t border-border backdrop-blur-md bg-opacity-95">
        <div className="flex items-center justify-around px-2 py-2 pb-safe">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200 flex-1"
              >
                <div className={cn(
                  "p-2 rounded-xl transition-all duration-200",
                  isActive ? "gradient-primary glow-primary" : "text-muted-foreground"
                )}>
                  <Icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  )} />
                </div>
                <span className={cn(
                  "text-[10px] font-semibold transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

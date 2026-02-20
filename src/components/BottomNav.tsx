"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, BookOpen, FolderOpen, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Today", icon: Home },
  { href: "/plan", label: "Plan", icon: BookOpen },
  { href: "/topics", label: "Topics", icon: FolderOpen },
  { href: "/leaderboard", label: "Board", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center">
      <div className="mobile-container w-full border-t border-border bg-card/95 backdrop-blur-md">
        <div className="flex items-center justify-around px-2 py-2 pb-[env(safe-area-inset-bottom,8px)]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-all"
              >
                <div
                  className={cn(
                    "rounded-xl p-2 transition-all",
                    isActive && "gradient-primary glow-primary"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-white" : "text-muted-foreground"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

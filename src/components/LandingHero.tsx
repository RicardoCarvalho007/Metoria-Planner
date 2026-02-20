"use client";

import Link from "next/link";
import { BookOpen, Trophy, Flame, Calendar, ChevronRight, Sparkles } from "lucide-react";

const FEATURES = [
  {
    icon: <Calendar className="h-6 w-6 text-primary" />,
    title: "Smart Scheduling",
    description: "Auto-generates a personalized study plan based on your exam date and availability.",
  },
  {
    icon: <BookOpen className="h-6 w-6 text-secondary" />,
    title: "Full IB Syllabus",
    description: "Every topic from AA & AI, SL & HL — tracked and organized for you.",
  },
  {
    icon: <Flame className="h-6 w-6 text-warning" />,
    title: "Streaks & XP",
    description: "Earn XP for every session, build streaks, and unlock achievement badges.",
  },
  {
    icon: <Trophy className="h-6 w-6 text-warning" />,
    title: "Leaderboard",
    description: "Compete with classmates and climb the weekly rankings.",
  },
];

export default function LandingHero() {
  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="mobile-container w-full flex flex-col min-h-screen page-padding">
        {/* Hero section */}
        <div className="flex-1 flex flex-col justify-center py-12">
          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">IB Math Study Planner</span>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-black leading-tight tracking-tight">
              Study smarter.
              <br />
              <span className="bg-gradient-to-r from-primary to-warning bg-clip-text text-transparent">
                Score higher.
              </span>
            </h1>
            <p className="mx-auto max-w-xs text-base text-muted-foreground">
              The study planner built for IB Math students. Plan every topic, track your progress, and stay motivated.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="mt-8 space-y-3">
            <Link
              href="/signup"
              className="flex w-full items-center justify-center gap-2 rounded-xl gradient-primary py-4 text-base font-bold text-white glow-primary transition-all active:scale-[0.98]"
            >
              Get Started — It&apos;s Free
              <ChevronRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-xl border border-border bg-card py-4 text-base font-semibold transition-all hover:border-primary/50 hover:bg-card/80 active:scale-[0.98]"
            >
              I already have an account
            </Link>
          </div>

          {/* Social proof hint */}
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Join students preparing for IB exams worldwide
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 pb-10">
          <h2 className="text-center text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Everything you need
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-card p-4 shadow-card transition-all"
              >
                <div className="mb-2.5">{f.icon}</div>
                <div className="text-sm font-bold leading-tight">{f.title}</div>
                <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {f.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

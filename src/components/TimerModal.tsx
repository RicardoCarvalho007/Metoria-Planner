"use client";

import { useState, useEffect, useRef } from "react";
import { X, Pause, Play, StopCircle, Flame, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScheduledSession } from "@/types/database";
import { completeSession } from "@/actions/session";

interface Props {
  session: ScheduledSession;
  onClose: () => void;
  onComplete: (result: {
    xpEarned: number;
    baseXp: number;
    onTimeBonus: number;
    streakBonus: number;
    isReview: boolean;
    newBadges: string[];
    newStreak: number;
  }) => void;
}

type TimerMode = "countdown" | "free";

function formatTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

const CONFETTI_COLORS = [
  "hsl(25 95% 53%)",
  "hsl(38 93% 50%)",
  "hsl(217 91% 60%)",
  "hsl(160 84% 39%)",
  "hsl(0 0% 100%)",
];

function ConfettiPiece({ index }: { index: number }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 0.8;
  const duration = 1.5 + Math.random() * 1.5;
  const size = 6 + Math.random() * 6;
  const rotation = Math.random() * 360;
  const drift = (Math.random() - 0.5) * 60;

  return (
    <div
      className="confetti-piece"
      style={{
        position: "absolute",
        left: `${left}%`,
        top: "-10px",
        width: `${size}px`,
        height: `${size * 0.6}px`,
        backgroundColor: color,
        borderRadius: "2px",
        opacity: 0,
        transform: `rotate(${rotation}deg)`,
        animation: `confetti-fall ${duration}s ease-out ${delay}s forwards`,
        // @ts-expect-error CSS custom property
        "--confetti-drift": `${drift}px`,
      }}
    />
  );
}

function AnimatedXP({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<ReturnType<typeof requestAnimationFrame>>();

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);

    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [target]);

  return <>{count}</>;
}

export default function TimerModal({ session, onClose, onComplete }: Props) {
  const sessionSeconds = session.estimated_minutes * 60;

  const [mode, setMode] = useState<TimerMode>("countdown");
  const [started, setStarted] = useState(false);
  const [seconds, setSeconds] = useState(sessionSeconds);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    xpEarned: number;
    baseXp: number;
    onTimeBonus: number;
    streakBonus: number;
    isReview: boolean;
    newStreak: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerFinishedRef = useRef(false);
  const elapsedRef = useRef(0);
  const completingRef = useRef(false);

  const circumference = 2 * Math.PI * 90;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
        setSeconds((prev) => {
          if (mode === "countdown") {
            if (prev <= 1) {
              if (!timerFinishedRef.current) {
                timerFinishedRef.current = true;
                setRunning(false);
                handleTimerComplete();
              }
              return 0;
            }
            return prev - 1;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode]);

  const handleStart = () => {
    setStarted(true);
    elapsedRef.current = 0;
    setElapsed(0);
    if (mode === "countdown") setSeconds(sessionSeconds);
    else setSeconds(0);
    setRunning(true);
  };

  const handleTimerComplete = async () => {
    if (completingRef.current) return;
    completingRef.current = true;
    setSubmitting(true);
    const mins = Math.max(1, Math.ceil(elapsedRef.current / 60));
    const result = await completeSession(session.id, mins);

    if ("error" in result) {
      setSubmitting(false);
      return;
    }

    setSummaryData({
      xpEarned: result.xpEarned,
      baseXp: result.baseXp,
      onTimeBonus: result.onTimeBonus,
      streakBonus: result.streakBonus,
      isReview: result.isReview,
      newStreak: result.newStreak,
    });
    setShowSummary(true);
    setSubmitting(false);
  };

  const handleEndEarly = () => {
    setRunning(false);
    if (mode === "free" || timerFinishedRef.current) {
      handleTimerComplete();
    } else {
      setShowQuitConfirm(true);
    }
  };

  const handleConfirmQuit = () => {
    setShowQuitConfirm(false);
    onClose();
  };

  const handleCancelQuit = () => {
    setShowQuitConfirm(false);
    setRunning(true);
  };

  const handleClaim = () => {
    if (summaryData) {
      onComplete({ ...summaryData, newBadges: [] });
    }
    onClose();
  };

  const progress =
    mode === "countdown"
      ? started ? 1 - seconds / sessionSeconds : 0
      : Math.min(elapsed / sessionSeconds, 1);

  const MOTIVATIONAL = [
    "You're crushing it!",
    "Knowledge is power!",
    "One step closer to acing that exam!",
    "Consistency is the key to mastery!",
    "Your future self will thank you!",
  ];
  const motivationalIdxRef = useRef(Math.floor(Math.random() * MOTIVATIONAL.length));
  const motivationalMsg = MOTIVATIONAL[motivationalIdxRef.current];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm animate-fade-up">
      <div className="mobile-container flex w-full flex-1 flex-col page-padding py-6">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <h2 className="truncate pr-4 text-lg font-bold">{session.topic_name}</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            Session: <span className="font-semibold text-foreground">{session.estimated_minutes} min</span>
          </span>
        </div>

        {/* ── Quit Confirmation Overlay ── */}
        {showQuitConfirm && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/90 backdrop-blur-sm px-6">
            <div className="w-full max-w-sm space-y-5 rounded-2xl border border-warning/30 bg-card p-6 text-center shadow-card">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warning/20">
                  <AlertTriangle className="h-7 w-7 text-warning" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black">Are you sure?</h3>
                <p className="text-sm text-muted-foreground">
                  The timer hasn&apos;t finished yet. If you leave now, you&apos;ll{" "}
                  <span className="font-semibold text-destructive">lose all XP</span> and the session won&apos;t count as completed.
                </p>
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleCancelQuit}
                  className="w-full rounded-xl gradient-primary py-3.5 text-sm font-bold text-white glow-primary"
                >
                  Keep Studying
                </button>
                <button
                  onClick={handleConfirmQuit}
                  className="w-full rounded-xl border border-destructive/30 py-3.5 text-sm font-semibold text-destructive transition-all hover:bg-destructive/10"
                >
                  Quit — No XP
                </button>
              </div>
            </div>
          </div>
        )}

        {!showSummary ? (
          <>
            {!started && (
              <div className="mb-6 flex gap-2 rounded-xl bg-muted p-1">
                {(["countdown", "free"] as TimerMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMode(m);
                      setSeconds(m === "countdown" ? sessionSeconds : 0);
                    }}
                    className={cn(
                      "flex-1 rounded-lg py-2 text-sm font-semibold transition-all",
                      mode === m ? "gradient-primary text-white" : "text-muted-foreground"
                    )}
                  >
                    {m === "countdown" ? `⏱ ${session.estimated_minutes}min` : "🔓 Free Timer"}
                  </button>
                ))}
              </div>
            )}

            {started && (
              <div className="mb-4 self-center rounded-full bg-primary/20 px-4 py-1.5 text-center text-sm font-semibold text-primary">
                {mode === "countdown"
                  ? `🧠 Focus · ${session.estimated_minutes} min session`
                  : "🧠 Focus · Free timer"}
              </div>
            )}

            <div className="flex flex-1 items-center justify-center">
              <div className="relative h-56 w-56">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle
                    cx="100" cy="100" r="90" fill="none" stroke="hsl(var(--primary))"
                    strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progress)}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={cn("text-5xl font-black tabular-nums", running && "animate-timer-tick")}>
                    {formatTime(seconds)}
                  </div>
                  {started && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {mode === "countdown" ? "remaining" : "elapsed"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 pb-4">
              {!started ? (
                <button className="w-full rounded-xl gradient-primary py-4 text-base font-bold text-white glow-primary" onClick={handleStart}>
                  Start Session ▶
                </button>
              ) : (
                <>
                  <button className="w-full rounded-xl border border-border py-4 font-semibold" onClick={() => setRunning((r) => !r)}>
                    {running ? <><Pause className="mr-2 inline h-4 w-4" />Pause</> : <><Play className="mr-2 inline h-4 w-4" />Resume</>}
                  </button>
                  <button
                    className="w-full rounded-xl gradient-primary py-4 font-bold text-white disabled:opacity-50"
                    onClick={handleEndEarly} disabled={submitting}
                  >
                    <StopCircle className="mr-2 inline h-4 w-4" />
                    {submitting ? "Saving..." : "End Session"}
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          /* ── Celebration Summary ── */
          <div className="relative flex flex-1 flex-col items-center justify-center space-y-6 text-center overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
              {Array.from({ length: 40 }).map((_, i) => (
                <ConfettiPiece key={i} index={i} />
              ))}
            </div>

            <div className="relative space-y-2">
              <div className="text-6xl">🎉</div>
              <h3 className="text-3xl font-black">Topic Complete!</h3>
              <p className="text-sm italic text-muted-foreground">&ldquo;{motivationalMsg}&rdquo;</p>
              <p className="text-muted-foreground">
                You studied for <span className="font-bold text-foreground">{Math.max(1, Math.ceil(elapsed / 60))} minutes</span>
              </p>
            </div>

            <div className="relative w-full space-y-4 rounded-2xl bg-card p-6 shadow-card">
              <div className="text-5xl font-black text-primary">
                +<AnimatedXP target={summaryData?.xpEarned ?? 0} /> XP
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-xl bg-muted p-3">
                  <div className="text-muted-foreground">Base</div>
                  <div className="text-lg font-bold">{summaryData?.baseXp}</div>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <div className="text-muted-foreground">On-time</div>
                  <div className="text-lg font-bold text-warning">+{summaryData?.onTimeBonus}</div>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <div className="text-muted-foreground">Streak</div>
                  <div className="text-lg font-bold text-primary">+{summaryData?.streakBonus}</div>
                </div>
              </div>
            </div>

            {summaryData && summaryData.newStreak > 0 && (
              <div className="flex items-center gap-2 rounded-full border border-warning/40 bg-warning/10 px-5 py-2.5 animate-xp-bounce">
                <Flame className="h-5 w-5 text-warning" />
                <span className="text-base font-bold text-warning">
                  {summaryData.newStreak} day streak!
                </span>
                <Flame className="h-5 w-5 text-warning" />
              </div>
            )}

            <button className="relative w-full rounded-xl gradient-primary py-4 text-base font-bold text-white glow-primary" onClick={handleClaim}>
              Claim XP 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

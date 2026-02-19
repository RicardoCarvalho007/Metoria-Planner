import { useState, useEffect, useRef } from "react";
import { ScheduledSession } from "@/types/app";
import { XP_FOR_DIFFICULTY } from "@/data/syllabus";
import { X, Pause, Play, StopCircle, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimerModalProps {
  session: ScheduledSession;
  onClose: () => void;
  onComplete: (sessionId: string, minutes: number, xp: number) => void;
}

type TimerMode = "pomodoro" | "free";
type TimerPhase = "focus" | "break" | "idle";

const POMODORO_FOCUS = 25;
const POMODORO_BREAK = 5;
const POMODORO_CYCLE = POMODORO_FOCUS + POMODORO_BREAK; // 30 min per cycle

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TimerModal({ session, onClose, onComplete }: TimerModalProps) {
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [phase, setPhase] = useState<TimerPhase>("idle");
  const [seconds, setSeconds] = useState(POMODORO_FOCUS * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  const sessionMinutes = session.estimatedMinutes;
  // How many full pomodoros fit in the session duration
  const totalPomodoros = Math.max(1, Math.round(sessionMinutes / POMODORO_FOCUS));

  const xpEarned = XP_FOR_DIFFICULTY[session.difficulty] + 50;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (mode === "pomodoro" && prev <= 1) {
            if (phase === "focus") {
              const nextCount = pomodoroCount + 1;
              setPomodoroCount(nextCount);
              // If all pomodoros done, go to summary
              if (nextCount >= totalPomodoros) {
                setIsRunning(false);
                setShowSummary(true);
                return 0;
              }
              setPhase("break");
              return POMODORO_BREAK * 60;
            } else {
              setPhase("focus");
              return POMODORO_FOCUS * 60;
            }
          }
          return mode === "pomodoro" ? prev - 1 : prev + 1;
        });
        elapsedRef.current += 1;
        setElapsedSeconds((e) => e + 1);
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, mode, phase, pomodoroCount, totalPomodoros]);

  const handleStart = () => {
    setPhase("focus");
    if (mode === "pomodoro") setSeconds(POMODORO_FOCUS * 60);
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning((p) => !p);

  const handleEnd = () => {
    setIsRunning(false);
    setShowSummary(true);
  };

  const handleConfirmComplete = () => {
    const mins = Math.ceil(elapsedSeconds / 60);
    onComplete(session.id, mins, xpEarned);
  };

  // Overall session progress (elapsed vs total session time)
  const overallProgress = Math.min(elapsedSeconds / (sessionMinutes * 60), 1);

  // Current pomodoro/break segment progress
  const segmentProgress = mode === "pomodoro"
    ? phase === "focus"
      ? 1 - seconds / (POMODORO_FOCUS * 60)
      : 1 - seconds / (POMODORO_BREAK * 60)
    : Math.min(elapsedSeconds / (sessionMinutes * 60), 1);

  const circumference = 2 * Math.PI * 90;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col animate-fade-up">
      <div className="mobile-container w-full flex flex-col flex-1 page-padding py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-lg truncate pr-4">{session.topicName}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Session duration info */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-muted-foreground">
            Session: <span className="text-foreground font-semibold">{sessionMinutes} min</span>
          </span>
          {mode === "pomodoro" && (
            <span className="text-xs text-muted-foreground">
              · <span className="text-foreground font-semibold">{totalPomodoros}</span> pomodoros
            </span>
          )}
        </div>

        {!showSummary ? (
          <>
            {/* Mode selector */}
            {phase === "idle" && (
              <div className="flex gap-2 bg-secondary rounded-xl p-1 mb-6">
                {(["pomodoro", "free"] as TimerMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMode(m);
                      setSeconds(m === "pomodoro" ? POMODORO_FOCUS * 60 : 0);
                    }}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
                      mode === m ? "gradient-primary text-primary-foreground" : "text-muted-foreground"
                    )}
                  >
                    {m === "pomodoro" ? `🍅 Pomodoro (25min)` : "⏱ Free Timer"}
                  </button>
                ))}
              </div>
            )}

            {/* Phase badge */}
            {phase !== "idle" && (
              <div className={cn(
                "text-center text-sm font-semibold px-4 py-1.5 rounded-full mb-4 self-center",
                phase === "focus" ? "bg-primary/20 text-primary" : "bg-success/20 text-success"
              )}>
                {phase === "focus"
                  ? `🧠 Focus · ${pomodoroCount + 1} of ${totalPomodoros}`
                  : "☕ Break time"}
              </div>
            )}

            {/* Timer circle */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-56 h-56">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  {/* Outer ring: overall session progress */}
                  <circle
                    cx="100" cy="100" r="90"
                    fill="none"
                    stroke="hsl(var(--primary) / 0.2)"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - overallProgress)}
                    className="transition-all duration-1000"
                  />
                  {/* Inner ring: current segment progress */}
                  <circle
                    cx="100" cy="100" r="90"
                    fill="none"
                    stroke={phase === "break" ? "hsl(var(--success))" : "hsl(var(--primary))"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - segmentProgress)}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={cn("text-5xl font-black tabular-nums", isRunning && "animate-timer-tick")}>
                    {formatTime(seconds)}
                  </div>
                  {phase !== "idle" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.max(0, sessionMinutes - Math.floor(elapsedSeconds / 60))}min left
                    </p>
                  )}
                  {pomodoroCount > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: pomodoroCount }).map((_, i) => (
                        <Flame key={i} className="h-3.5 w-3.5 text-warning" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Overall session progress bar */}
            {phase !== "idle" && (
              <div className="mb-2 px-1">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Session progress</span>
                  <span className="font-semibold text-foreground">{Math.round(overallProgress * 100)}% · {sessionMinutes}min total</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-primary rounded-full transition-all duration-1000"
                    style={{ width: `${overallProgress * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3 pb-4">
              {phase === "idle" ? (
                <Button
                  className="w-full gradient-primary text-primary-foreground font-bold py-4 text-base rounded-xl glow-primary"
                  onClick={handleStart}
                >
                  Start Session ▶
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full py-4 rounded-xl border-border font-semibold"
                    onClick={handlePause}
                  >
                    {isRunning ? <><Pause className="h-4 w-4 mr-2" /> Pause</> : <><Play className="h-4 w-4 mr-2" /> Resume</>}
                  </Button>
                  <Button
                    className="w-full gradient-primary text-primary-foreground font-bold py-4 rounded-xl"
                    onClick={handleEnd}
                  >
                    <StopCircle className="h-4 w-4 mr-2" /> End Session
                  </Button>
                </>
              )}
            </div>
          </>
        ) : (
          /* Summary */
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="text-6xl">🎉</div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black">Session Complete!</h3>
              <p className="text-muted-foreground">You studied for {Math.max(1, Math.ceil(elapsedSeconds / 60))} minutes</p>
            </div>
            <div className="bg-card rounded-2xl p-6 w-full space-y-4 shadow-card">
              <div className="text-4xl font-black text-primary">+{xpEarned} XP</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted rounded-xl p-3">
                  <div className="text-muted-foreground">Base XP</div>
                  <div className="font-bold text-lg">{XP_FOR_DIFFICULTY[session.difficulty]}</div>
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <div className="text-muted-foreground">On-time bonus</div>
                  <div className="font-bold text-lg text-warning">+50</div>
                </div>
              </div>
            </div>
            <Button
              className="w-full gradient-primary text-primary-foreground font-bold py-4 text-base rounded-xl glow-primary"
              onClick={handleConfirmComplete}
            >
              Claim XP 🚀
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

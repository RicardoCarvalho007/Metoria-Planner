import { useState } from "react";
import { Course, COURSE_LABELS } from "@/data/syllabus";
import { OnboardingStep } from "@/types/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, BookOpen, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingProps {
  onComplete: (name: string, course: Course, examDate: string) => void;
}

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_LABELS: Record<string, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
const HOUR_OPTIONS = [1, 2, 3, 4];

const COURSE_OPTIONS: { course: Course; label: string; sublabel: string; icon: string }[] = [
  { course: "AA_HL", label: "Math AA HL", sublabel: "Analysis & Approaches Higher Level", icon: "∫" },
  { course: "AA_SL", label: "Math AA SL", sublabel: "Analysis & Approaches Standard Level", icon: "f(x)" },
  { course: "AI_HL", label: "Math AI HL", sublabel: "Applications & Interpretation Higher Level", icon: "∑" },
  { course: "AI_SL", label: "Math AI SL", sublabel: "Applications & Interpretation Standard Level", icon: "π" },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [course, setCourse] = useState<Course | null>(null);
  const [examDate, setExamDate] = useState("");
  const [availability, setAvailability] = useState<Record<string, number>>({
    mon: 2, tue: 2, wed: 0, thu: 2, fri: 1, sat: 3, sun: 0,
  });

  const today = new Date().toISOString().split("T")[0];

  const toggleDay = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day] > 0 ? 0 : 2,
    }));
  };

  const setHours = (day: string, hours: number) => {
    setAvailability((prev) => ({ ...prev, [day]: hours }));
  };

  const totalWeeklyHours = Object.values(availability).reduce((a, b) => a + b, 0);
  const daysUntilExam = examDate
    ? Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000)
    : 0;

  const handleFinish = () => {
    if (course && examDate && name) {
      onComplete(name, course, examDate);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center page-padding py-8 animate-fade-up">
      <div className="mobile-container w-full">
        {/* Progress dots */}
        {step !== "welcome" && step !== "ready" && (
          <div className="flex gap-2 justify-center mb-8">
            {(["course", "examdate", "availability"] as OnboardingStep[]).map((s) => (
              <div
                key={s}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  step === s ? "w-8 bg-primary" : "w-2 bg-muted"
                )}
              />
            ))}
          </div>
        )}

        {/* Welcome */}
        {step === "welcome" && (
          <div className="text-center space-y-8">
            <div className="space-y-2">
              <div className="text-7xl mb-4">📐</div>
              <h1 className="text-4xl font-black tracking-tight">
                <span className="gradient-primary bg-clip-text text-transparent" style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Metoria
                </span>
              </h1>
              <p className="text-lg text-muted-foreground font-medium">Plan your IB Math. Study smarter.</p>
            </div>
            <div className="space-y-4 text-left">
              {[
                { icon: "📅", text: "Auto-generates your study schedule" },
                { icon: "🎯", text: "Tracks every topic in the IB syllabus" },
                { icon: "🏆", text: "Earn XP and compete on the leaderboard" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 shadow-card">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
            <Button
              className="w-full gradient-primary text-primary-foreground font-bold py-4 text-base rounded-xl glow-primary"
              onClick={() => setStep("course")}
            >
              Get Started <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Account creation */}
        {step === "course" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">Create your account</h2>
              <p className="text-muted-foreground text-sm">Your personal study hub awaits</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)}
                  className="bg-secondary border-border h-12 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary border-border h-12 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary border-border h-12 rounded-xl" />
              </div>
            </div>
            <Button
              className="w-full gradient-primary text-primary-foreground font-bold py-4 text-base rounded-xl"
              disabled={!name || !email || !password}
              onClick={() => setStep("examdate")}
            >
              Continue <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Course selection */}
        {step === "examdate" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">Choose your course</h2>
              <p className="text-muted-foreground text-sm">Select your IB Mathematics course</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {COURSE_OPTIONS.map((opt) => (
                <button
                  key={opt.course}
                  onClick={() => setCourse(opt.course)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all duration-200",
                    course === opt.course
                      ? "border-primary bg-primary/10 glow-primary"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <div className="text-2xl font-black text-primary mb-2">{opt.icon}</div>
                  <div className="font-bold text-sm">{opt.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{opt.sublabel}</div>
                  {course === opt.course && (
                    <CheckCircle2 className="h-4 w-4 text-primary mt-2" />
                  )}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Exam date
              </Label>
              <Input
                type="date"
                min={today}
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="bg-secondary border-border h-12 rounded-xl"
              />
              {examDate && (
                <p className="text-sm text-primary font-medium">📅 {daysUntilExam} days until your exam</p>
              )}
            </div>
            <Button
              className="w-full gradient-primary text-primary-foreground font-bold py-4 text-base rounded-xl"
              disabled={!course || !examDate}
              onClick={() => setStep("availability")}
            >
              Continue <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Weekly availability */}
        {step === "availability" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">Weekly availability</h2>
              <p className="text-muted-foreground text-sm">Tap a day to toggle it, then set hours</p>
            </div>
            <div className="space-y-3">
              {DAYS.map((day) => {
                const isActive = availability[day] > 0;
                return (
                  <div key={day} className={cn(
                    "rounded-xl border transition-all duration-200 overflow-hidden",
                    isActive ? "border-primary bg-primary/5" : "border-border bg-card"
                  )}>
                    <button
                      className="w-full flex items-center justify-between px-4 py-3"
                      onClick={() => toggleDay(day)}
                    >
                      <span className={cn("font-semibold", isActive ? "text-foreground" : "text-muted-foreground")}>
                        {DAY_LABELS[day]}
                      </span>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                        isActive ? "border-primary bg-primary" : "border-muted"
                      )}>
                        {isActive && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                      </div>
                    </button>
                    {isActive && (
                      <div className="px-4 pb-3 flex gap-2">
                        {HOUR_OPTIONS.map((h) => (
                          <button
                            key={h}
                            onClick={() => setHours(day, h)}
                            className={cn(
                              "flex-1 py-1.5 rounded-lg text-sm font-medium transition-all",
                              availability[day] === h
                                ? "gradient-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-secondary"
                            )}
                          >
                            {h}h
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="bg-card rounded-xl px-4 py-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">{totalWeeklyHours}h</span> per week scheduled
              </span>
            </div>
            <Button
              className="w-full gradient-primary text-primary-foreground font-bold py-4 text-base rounded-xl"
              onClick={() => setStep("ready")}
            >
              Generate My Plan <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Plan ready */}
        {step === "ready" && (
          <div className="text-center space-y-8">
            <div className="space-y-3">
              <div className="text-6xl">🎉</div>
              <h2 className="text-3xl font-black">Your plan is ready!</h2>
              <p className="text-muted-foreground">
                You have <span className="text-foreground font-bold">{daysUntilExam} days</span> and{" "}
                <span className="text-foreground font-bold">27 topics</span> to cover.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { icon: "📅", label: "Sessions scheduled", value: "47 days of study" },
                { icon: "⚡", label: "Total study time", value: `${totalWeeklyHours * Math.ceil(daysUntilExam / 7)}h planned` },
                { icon: "🎯", label: "XP available", value: "8,500 XP to earn" },
              ].map((item) => (
                <div key={item.label} className="bg-card rounded-xl px-4 py-3 flex items-center gap-3 text-left shadow-card">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                    <div className="font-semibold">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              className="w-full gradient-primary text-primary-foreground font-bold py-4 text-base rounded-xl glow-primary"
              onClick={handleFinish}
            >
              Let's Go! 🚀
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

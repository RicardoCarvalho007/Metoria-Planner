"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Network error: ${err.message}`
          : "An unexpected error occurred. Please try again."
      );
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center page-padding">
        <div className="mobile-container w-full space-y-6 text-center animate-fade-up">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-2xl font-black">Password updated!</h2>
          <p className="text-muted-foreground">Redirecting you to the app…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center page-padding py-8">
      <div className="mobile-container w-full space-y-8 animate-fade-up">
        <div className="space-y-2">
          <h1 className="text-3xl font-black">Set new password</h1>
          <p className="text-muted-foreground">Choose a strong password for your account.</p>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-card py-3.5 pl-11 pr-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-card py-3.5 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl gradient-primary py-3.5 text-sm font-bold text-white glow-primary transition-all disabled:opacity-50"
          >
            {loading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

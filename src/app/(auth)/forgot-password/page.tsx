"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Network error: ${err.message}`
          : "An unexpected error occurred. Please try again."
      );
    } finally {
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
          <h2 className="text-2xl font-black">Check your email</h2>
          <p className="text-muted-foreground">
            We sent a password reset link to{" "}
            <span className="font-semibold text-foreground">{email}</span>.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold transition-all hover:border-primary/50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center page-padding py-8">
      <div className="mobile-container w-full space-y-8 animate-fade-up">
        <div className="space-y-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
          <h1 className="text-3xl font-black">Forgot password?</h1>
          <p className="text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-card py-3.5 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl gradient-primary py-3.5 text-sm font-bold text-white glow-primary transition-all disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { markMissedSessions } from "@/actions/session";
import BottomNav from "@/components/BottomNav";
import TodayView from "@/components/TodayView";
import LandingHero from "@/components/LandingHero";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return <LandingHero />;
  }

  const userId = session.user.id;

  const { data: plan } = await supabase
    .from("study_plans")
    .select("id, exam_date")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!plan) redirect("/onboarding");

  await markMissedSessions();

  const today = new Date().toISOString().split("T")[0];

  const [sessionsRes, upcomingRes, profileRes, completedRes, allSessionsRes] =
    await Promise.all([
      supabase
        .from("scheduled_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("scheduled_date", today)
        .order("created_at"),
      supabase
        .from("scheduled_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("plan_id", plan.id)
        .gt("scheduled_date", today)
        .eq("status", "pending")
        .order("scheduled_date")
        .limit(20),
    supabase
      .from("profiles")
      .select("full_name, total_xp, current_streak, last_study_date")
      .eq("id", userId)
      .single(),
      supabase
        .from("scheduled_sessions")
        .select("topic_id")
        .eq("user_id", userId)
        .eq("status", "completed"),
      supabase
        .from("scheduled_sessions")
        .select("status")
        .eq("plan_id", plan.id),
    ]);

  const profile = profileRes.data;
  if (!profile) redirect("/login");

  const uniqueTopics = new Set(completedRes.data?.map((s) => s.topic_id));

  const allSessions = allSessionsRes.data ?? [];
  const planStats = {
    total: allSessions.length,
    completed: allSessions.filter((s) => s.status === "completed").length,
    missed: allSessions.filter((s) => s.status === "missed").length,
    pending: allSessions.filter((s) => s.status === "pending").length,
    examDate: plan.exam_date,
  };

  return (
    <div className="min-h-screen flex justify-center">
      <div className="mobile-container w-full relative">
        <div className="min-h-screen pb-24">
          <TodayView
            profile={profile}
            sessions={sessionsRes.data ?? []}
            upcomingSessions={upcomingRes.data ?? []}
            completedTopicCount={uniqueTopics.size}
            planStats={planStats}
          />
        </div>
        <BottomNav />
      </div>
    </div>
  );
}

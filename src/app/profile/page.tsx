import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTopicsForCourse, type Course } from "@/data/syllabus";
import BottomNav from "@/components/BottomNav";
import ProfileView from "@/components/ProfileView";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");
  const userId = session.user.id;

  const [profileRes, planRes, badgesRes, defsRes, completedRes, studyTimeRes] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase
        .from("study_plans")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .maybeSingle(),
      supabase.from("user_badges").select("*").eq("user_id", userId),
      supabase.from("badge_definitions").select("*"),
      supabase
        .from("scheduled_sessions")
        .select("topic_id, plan_id")
        .eq("user_id", userId)
        .eq("status", "completed"),
      supabase
        .from("study_sessions")
        .select("duration_minutes")
        .eq("user_id", userId),
    ]);

  const plan = planRes.data;
  const completedData = (completedRes.data ?? []) as { topic_id: string; plan_id: string }[];
  const completedForPlan = plan ? completedData.filter((s) => s.plan_id === plan.id) : completedData;
  const uniqueCompleted = new Set(completedForPlan.map((s) => s.topic_id));
  const totalTopics = plan
    ? getTopicsForCourse(plan.course as Course).length
    : 0;

  let totalMinutes = (studyTimeRes.data ?? []).reduce(
    (sum: number, s: { duration_minutes: number }) => sum + s.duration_minutes,
    0
  );
  if (plan) {
    const { data: completedSessionRows } = await supabase
      .from("scheduled_sessions")
      .select("id")
      .eq("plan_id", plan.id)
      .eq("status", "completed");
    const completedIds = (completedSessionRows ?? []).map((r: { id: string }) => r.id);
    if (completedIds.length > 0) {
      const { data: sessionsForPlan } = await supabase
        .from("study_sessions")
        .select("duration_minutes")
        .in("scheduled_session_id", completedIds);
      totalMinutes = (sessionsForPlan ?? []).reduce(
        (sum: number, s: { duration_minutes: number }) => sum + s.duration_minutes,
        0
      );
    } else {
      totalMinutes = 0;
    }
  }

  const profile = profileRes.data;
  if (!profile) redirect("/login");

  return (
    <div className="min-h-screen flex justify-center">
      <div className="mobile-container w-full relative">
        <div className="min-h-screen pb-24">
          <ProfileView
            profile={profile}
            plan={plan}
            badges={badgesRes.data ?? []}
            badgeDefinitions={defsRes.data ?? []}
            completedTopicCount={uniqueCompleted.size}
            totalTopicCount={totalTopics}
            totalStudyMinutes={totalMinutes}
          />
        </div>
        <BottomNav />
      </div>
    </div>
  );
}

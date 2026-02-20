import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTopicsForCourse, type Course } from "@/data/syllabus";
import BottomNav from "@/components/BottomNav";
import PlanView from "@/components/PlanView";

export default async function PlanPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");
  const userId = session.user.id;

  const { data: plan } = await supabase
    .from("study_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!plan) redirect("/onboarding");

  const [sessionsRes, completedRes] = await Promise.all([
    supabase
      .from("scheduled_sessions")
      .select("*")
      .eq("plan_id", plan.id)
      .order("scheduled_date"),
    supabase
      .from("scheduled_sessions")
      .select("topic_id")
      .eq("user_id", userId)
      .eq("status", "completed"),
  ]);

  const uniqueCompleted = new Set(completedRes.data?.map((s) => s.topic_id));
  const totalTopics = getTopicsForCourse(plan.course as Course).length;

  return (
    <div className="min-h-screen flex justify-center">
      <div className="mobile-container w-full relative">
        <div className="min-h-screen pb-24">
          <PlanView
            sessions={sessionsRes.data ?? []}
            completedCount={uniqueCompleted.size}
            totalTopicCount={totalTopics}
            examDate={plan.exam_date}
          />
        </div>
        <BottomNav />
      </div>
    </div>
  );
}

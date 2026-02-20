import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTopicsForCourse, type Course } from "@/data/syllabus";
import BottomNav from "@/components/BottomNav";
import TopicsView from "@/components/TopicsView";

export default async function TopicsPage() {
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

  const courseTopics = getTopicsForCourse(plan.course as Course);

  const [completedRes, notesRes, uploadsRes] = await Promise.all([
    supabase
      .from("scheduled_sessions")
      .select("topic_id")
      .eq("user_id", userId)
      .eq("status", "completed"),
    supabase
      .from("topic_notes")
      .select("*")
      .eq("user_id", userId),
    supabase
      .from("topic_uploads")
      .select("*")
      .eq("user_id", userId),
  ]);

  const completedTopicIds = Array.from(
    new Set(completedRes.data?.map((s) => s.topic_id) ?? [])
  );

  return (
    <div className="min-h-screen flex justify-center">
      <div className="mobile-container w-full relative">
        <div className="min-h-screen pb-24">
          <TopicsView
            topics={courseTopics}
            completedTopicIds={completedTopicIds}
            notes={notesRes.data ?? []}
            uploads={uploadsRes.data ?? []}
          />
        </div>
        <BottomNav />
      </div>
    </div>
  );
}

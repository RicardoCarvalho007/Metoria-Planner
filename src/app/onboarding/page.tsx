import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OnboardingFlow from "@/components/OnboardingFlow";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  // If user already has an active plan, skip onboarding
  const { data: plan } = await supabase
    .from("study_plans")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (plan) redirect("/");

  return <OnboardingFlow />;
}

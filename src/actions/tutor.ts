"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleTutorHelp(sessionId: string, currentValue: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("scheduled_sessions")
    .update({ needs_tutor_help: !currentValue })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/plan");
  return { needs_tutor_help: !currentValue };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { generateSchedule, redistributeMissedSessions } from "@/lib/schedule";
import type { Course } from "@/data/syllabus";
import { revalidatePath } from "next/cache";

export async function createStudyPlan(data: {
  course: Course;
  examDate: string;
  dailyHours: Record<string, number>;
  skippedTopicIds?: string[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  await supabase
    .from("study_plans")
    .update({ is_active: false })
    .eq("user_id", user.id)
    .eq("is_active", true);

  const insertPayload: Record<string, unknown> = {
    user_id: user.id,
    course: data.course,
    exam_date: data.examDate,
    daily_hours: data.dailyHours,
    is_active: true,
  };

  if (data.skippedTopicIds && data.skippedTopicIds.length > 0) {
    insertPayload.skipped_topic_ids = data.skippedTopicIds;
  }

  let { data: plan, error: planError } = await supabase
    .from("study_plans")
    .insert(insertPayload)
    .select()
    .single();

  // Retry without skipped_topic_ids if column doesn't exist yet
  if (planError?.message?.includes("skipped_topic_ids")) {
    delete insertPayload.skipped_topic_ids;
    const retry = await supabase
      .from("study_plans")
      .insert(insertPayload)
      .select()
      .single();
    plan = retry.data;
    planError = retry.error;
  }

  if (planError || !plan) {
    return { error: planError?.message ?? "Failed to create plan" };
  }

  const result = generateSchedule({
    userId: user.id,
    planId: plan.id,
    course: data.course,
    examDate: data.examDate,
    dailyHours: data.dailyHours,
    skippedTopicIds: data.skippedTopicIds,
  });

  if (result.sessions.length > 0) {
    const { error: sessError } = await supabase
      .from("scheduled_sessions")
      .insert(result.sessions);

    if (sessError) {
      return { error: sessError.message };
    }
  }

  // Build first-week preview grouped by date
  const firstWeekPreview: { date: string; topics: { name: string; minutes: number }[] }[] = [];
  const dateMap = new Map<string, { name: string; minutes: number }[]>();

  for (const s of result.sessions) {
    if (!dateMap.has(s.scheduled_date)) dateMap.set(s.scheduled_date, []);
    dateMap.get(s.scheduled_date)!.push({ name: s.topic_name, minutes: s.estimated_minutes });
  }

  const sortedDates = Array.from(dateMap.keys()).sort();
  for (const date of sortedDates.slice(0, 7)) {
    firstWeekPreview.push({ date, topics: dateMap.get(date)! });
  }

  const studyDaysCount = dateMap.size;
  const topicsPerDay =
    studyDaysCount > 0
      ? Math.round((result.sessions.length / studyDaysCount) * 10) / 10
      : 0;

  revalidatePath("/");
  return {
    planId: plan.id,
    totalSessions: result.sessions.length,
    totalTopicHours: result.totalTopicHours,
    totalAvailableHours: result.totalAvailableHours,
    hasCapacityWarning: result.hasCapacityWarning,
    studyDaysCount,
    topicsPerDay,
    firstWeekPreview,
  };
}

export async function deactivateCurrentPlan() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("study_plans")
    .update({ is_active: false })
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/onboarding");
  revalidatePath("/plan");
  return { success: true };
}

export async function rescheduleAllMissed() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: plan } = await supabase
    .from("study_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!plan) return { error: "No active plan" };

  const today = new Date().toISOString().split("T")[0];

  const { data: missed } = await supabase
    .from("scheduled_sessions")
    .select("id, topic_id, topic_name, estimated_minutes")
    .eq("plan_id", plan.id)
    .eq("status", "missed");

  if (!missed || missed.length === 0) return { rescheduled: 0 };

  const { data: futurePending } = await supabase
    .from("scheduled_sessions")
    .select("scheduled_date, estimated_minutes")
    .eq("plan_id", plan.id)
    .eq("status", "pending")
    .gte("scheduled_date", today);

  const newSessions = redistributeMissedSessions(
    missed,
    futurePending ?? [],
    plan.daily_hours as Record<string, number>,
    plan.exam_date,
    user.id,
    plan.id
  );

  await supabase
    .from("scheduled_sessions")
    .update({ status: "rescheduled" })
    .in(
      "id",
      missed.map((m) => m.id)
    );

  if (newSessions.length > 0) {
    await supabase.from("scheduled_sessions").insert(newSessions);
  }

  revalidatePath("/");
  revalidatePath("/plan");
  return { rescheduled: newSessions.length };
}

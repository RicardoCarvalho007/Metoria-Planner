"use server";

import { createClient } from "@/lib/supabase/server";
import { generateSchedule, redistributeMissedSessions, redistributeGradual, redistributeWeekend } from "@/lib/schedule";
import type { Course } from "@/data/syllabus";
import { revalidatePath } from "next/cache";

function slotsToDailyHours(slots: Record<string, { start: string; end: string }[]>): Record<string, number> {
  const dayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const hours: Record<string, number> = {};
  for (const day of dayKeys) {
    const list = slots[day] ?? [];
    let totalMins = 0;
    for (const slot of list) {
      const [sh, sm] = slot.start.split(":").map(Number);
      const [eh, em] = slot.end.split(":").map(Number);
      totalMins += (eh * 60 + em) - (sh * 60 + sm);
    }
    hours[day] = Math.round((totalMins / 60) * 10) / 10;
  }
  return hours;
}

export async function createStudyPlan(data: {
  course: Course;
  examDate: string;
  dailyHours: Record<string, number>;
  dailySlots?: Record<string, { start: string; end: string }[]>;
  skippedTopicIds?: string[];
  topicAssessments?: Record<string, string>;
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

  const dailyHours =
    data.dailySlots && Object.keys(data.dailySlots).length > 0
      ? slotsToDailyHours(data.dailySlots)
      : data.dailyHours;

  const insertPayload: Record<string, unknown> = {
    user_id: user.id,
    course: data.course,
    exam_date: data.examDate,
    daily_hours: dailyHours,
    is_active: true,
  };
  if (data.dailySlots && Object.keys(data.dailySlots).length > 0) {
    insertPayload.daily_slots = data.dailySlots;
  }

  if (data.skippedTopicIds && data.skippedTopicIds.length > 0) {
    insertPayload.skipped_topic_ids = data.skippedTopicIds;
  }

  let { data: plan, error: planError } = await supabase
    .from("study_plans")
    .insert(insertPayload)
    .select()
    .single();

  // Retry without optional columns if migration not applied yet
  if (planError?.message?.includes("skipped_topic_ids") || planError?.message?.includes("daily_slots")) {
    delete insertPayload.skipped_topic_ids;
    delete insertPayload.daily_slots;
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

  const assessments = data.topicAssessments as Record<string, "known" | "needs_work" | "new"> | undefined;
  const result = generateSchedule({
    userId: user.id,
    planId: plan.id,
    course: data.course,
    examDate: data.examDate,
    dailyHours,
    skippedTopicIds: data.skippedTopicIds,
    topicAssessments: assessments,
  });

  if (assessments && Object.keys(assessments).length > 0) {
    const rows = Object.entries(assessments).map(([topic_id, confidence]) => ({
      user_id: user.id,
      plan_id: plan.id,
      topic_id,
      confidence,
    }));
    await supabase.from("topic_assessments").insert(rows);
  }

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
  revalidatePath("/", "layout");
  revalidatePath("/plan");
  revalidatePath("/plan", "layout");
  revalidatePath("/profile");
  revalidatePath("/profile", "layout");
  revalidatePath("/onboarding");
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
  revalidatePath("/", "layout");
  revalidatePath("/onboarding");
  revalidatePath("/plan");
  revalidatePath("/plan", "layout");
  revalidatePath("/profile");
  revalidatePath("/profile", "layout");
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

export async function saveWeekOverride(
  planId: string,
  weekStart: string,
  dailyHours: Record<string, number>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("weekly_overrides").upsert(
    {
      user_id: user.id,
      plan_id: planId,
      week_start: weekStart,
      daily_hours: dailyHours,
    },
    { onConflict: "plan_id,week_start" }
  );

  if (error) return { error: error.message };
  revalidatePath("/plan");
  return { success: true };
}

export async function activateBusyWeek() {
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

  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekStart = monday.toISOString().split("T")[0];
  const weekEnd = sunday.toISOString().split("T")[0];
  const today = new Date().toISOString().split("T")[0];

  const { data: weekSessions } = await supabase
    .from("scheduled_sessions")
    .select("id, topic_id, topic_name, estimated_minutes, scheduled_date")
    .eq("plan_id", plan.id)
    .eq("status", "pending")
    .gte("scheduled_date", weekStart)
    .lte("scheduled_date", weekEnd)
    .order("scheduled_date");

  if (!weekSessions || weekSessions.length === 0) return { error: "No pending sessions this week", reduced: 0 };

  const totalMinutes = weekSessions.reduce((s, x) => s + x.estimated_minutes, 0);
  const targetKeep = Math.round(totalMinutes * 0.5);
  let kept = 0;
  const toKeepIds: string[] = [];
  const toRedistribute: { topic_id: string; topic_name: string; estimated_minutes: number }[] = [];
  for (const sess of weekSessions) {
    if (kept < targetKeep) {
      toKeepIds.push(sess.id);
      kept += sess.estimated_minutes;
    } else {
      toRedistribute.push({
        topic_id: sess.topic_id,
        topic_name: sess.topic_name,
        estimated_minutes: sess.estimated_minutes,
      });
    }
  }

  const toRedistributeIds = weekSessions.filter((s) => !toKeepIds.includes(s.id)).map((s) => s.id);
  if (toRedistributeIds.length === 0) return { reduced: 0 };

  const { data: futurePending } = await supabase
    .from("scheduled_sessions")
    .select("scheduled_date, estimated_minutes")
    .eq("plan_id", plan.id)
    .eq("status", "pending")
    .gte("scheduled_date", today);

  const newSessions = redistributeMissedSessions(
    toRedistribute,
    futurePending ?? [],
    plan.daily_hours as Record<string, number>,
    plan.exam_date,
    user.id,
    plan.id
  );

  await supabase
    .from("scheduled_sessions")
    .update({ status: "rescheduled" })
    .in("id", toRedistributeIds);

  if (newSessions.length > 0) {
    await supabase.from("scheduled_sessions").insert(newSessions);
  }

  revalidatePath("/");
  revalidatePath("/plan");
  return { reduced: toRedistribute.reduce((s, x) => s + x.estimated_minutes, 0) };
}

export async function reorderSession(sessionId: string, newDate: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("scheduled_sessions")
    .update({ scheduled_date: newDate })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/plan");
  return { success: true };
}

export type SmartRecoveryMode = "gradual" | "weekend" | "skip";

export async function smartRecovery(mode: SmartRecoveryMode) {
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

  const dailyHours = plan.daily_hours as Record<string, number>;
  let newSessions: { plan_id: string; user_id: string; topic_id: string; topic_name: string; scheduled_date: string; estimated_minutes: number; status: "pending"; xp_earned: number }[] = [];

  if (mode === "gradual") {
    newSessions = redistributeGradual(missed, futurePending ?? [], dailyHours, plan.exam_date, user.id, plan.id);
  } else if (mode === "weekend") {
    newSessions = redistributeWeekend(missed, futurePending ?? [], dailyHours, plan.exam_date, user.id, plan.id);
  }
  // skip: no new sessions

  await supabase
    .from("scheduled_sessions")
    .update({ status: "rescheduled" })
    .in("id", missed.map((m) => m.id));

  if (newSessions.length > 0) {
    await supabase.from("scheduled_sessions").insert(newSessions);
  }

  revalidatePath("/");
  revalidatePath("/plan");
  return { rescheduled: newSessions.length };
}

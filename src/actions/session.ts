"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateXp, calculateStreak, getNewBadges } from "@/lib/xp";
import { getTopicsForCourse, type Course } from "@/data/syllabus";
import { revalidatePath } from "next/cache";

export async function completeSession(
  scheduledSessionId: string,
  durationMinutes: number
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Fetch the scheduled session
  const { data: session } = await supabase
    .from("scheduled_sessions")
    .select("*")
    .eq("id", scheduledSessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) return { error: "Session not found" };
  if (session.status === "completed") return { error: "Already completed" };

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return { error: "Profile not found" };

  const today = new Date().toISOString().split("T")[0];
  const isOnTime = session.scheduled_date === today;
  const now = new Date();

  // Check if this topic was previously completed (review)
  const { data: prevCompleted } = await supabase
    .from("scheduled_sessions")
    .select("id")
    .eq("user_id", user.id)
    .eq("topic_id", session.topic_id)
    .eq("status", "completed")
    .limit(1);

  const isReview = (prevCompleted?.length ?? 0) > 0;

  // Calculate XP
  const xp = calculateXp({
    topicId: session.topic_id,
    isOnTime,
    currentStreak: profile.current_streak,
    isReview,
  });

  // Calculate streak
  const streak = calculateStreak(
    profile.last_study_date,
    today,
    profile.current_streak
  );

  const newLongestStreak = Math.max(profile.longest_streak, streak.newStreak);

  // Update scheduled session
  const { error: updateError } = await supabase
    .from("scheduled_sessions")
    .update({
      status: "completed",
      completed_at: now.toISOString(),
      xp_earned: xp.total,
    })
    .eq("id", scheduledSessionId);

  if (updateError) return { error: "Failed to save session. Please try again." };

  // Create study session
  await supabase.from("study_sessions").insert({
    user_id: user.id,
    scheduled_session_id: scheduledSessionId,
    duration_minutes: durationMinutes,
    started_at: new Date(now.getTime() - durationMinutes * 60000).toISOString(),
    ended_at: now.toISOString(),
    xp_earned: xp.total,
  });

  // Update profile
  await supabase
    .from("profiles")
    .update({
      total_xp: profile.total_xp + xp.total,
      current_streak: streak.newStreak,
      longest_streak: newLongestStreak,
      last_study_date: today,
    })
    .eq("id", user.id);

  // Check badges
  const { data: existingBadges } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", user.id);

  const { data: allCompleted } = await supabase
    .from("scheduled_sessions")
    .select("topic_id")
    .eq("user_id", user.id)
    .eq("status", "completed");

  const uniqueTopics = new Set(allCompleted?.map((s) => s.topic_id));

  const { data: activePlan } = await supabase
    .from("study_plans")
    .select("course")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  const totalTopicsInCourse = activePlan
    ? getTopicsForCourse(activePlan.course as Course).length
    : 0;

  const newBadges = getNewBadges(
    {
      streak: streak.newStreak,
      uniqueCompletedTopics: uniqueTopics.size,
      totalTopicsInCourse,
      sessionHour: now.getHours(),
    },
    existingBadges?.map((b) => b.badge_id) ?? []
  );

  if (newBadges.length > 0) {
    await supabase
      .from("user_badges")
      .insert(newBadges.map((badgeId) => ({ user_id: user.id, badge_id: badgeId })));
  }

  revalidatePath("/");
  revalidatePath("/plan");
  revalidatePath("/profile");

  return {
    xpEarned: xp.total,
    baseXp: xp.base,
    onTimeBonus: xp.onTimeBonus,
    streakBonus: xp.streakBonus,
    isReview,
    newStreak: streak.newStreak,
    newBadges,
  };
}

export async function markMissedSessions() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: plan } = await supabase
    .from("study_plans")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!plan) return;

  const today = new Date().toISOString().split("T")[0];

  await supabase
    .from("scheduled_sessions")
    .update({ status: "missed" })
    .eq("user_id", user.id)
    .eq("plan_id", plan.id)
    .eq("status", "pending")
    .lt("scheduled_date", today);
}

import { SYLLABUS, XP_FOR_DIFFICULTY } from "@/data/syllabus";

export function calculateXp(opts: {
  topicId: string;
  isOnTime: boolean;
  currentStreak: number;
  isReview: boolean;
}): { total: number; base: number; onTimeBonus: number; streakBonus: number } {
  if (opts.isReview) {
    return { total: 25, base: 25, onTimeBonus: 0, streakBonus: 0 };
  }

  const topic = SYLLABUS.find((t) => t.id === opts.topicId);
  const base = topic ? XP_FOR_DIFFICULTY[topic.difficulty] : 100;
  const onTimeBonus = opts.isOnTime ? 50 : 0;
  const streakBonus = opts.currentStreak * 10;

  return {
    total: base + onTimeBonus + streakBonus,
    base,
    onTimeBonus,
    streakBonus,
  };
}

export function calculateStreak(
  lastStudyDate: string | null,
  today: string,
  currentStreak: number
): { newStreak: number; longestUpdate: boolean } {
  if (!lastStudyDate) {
    return { newStreak: 1, longestUpdate: true };
  }

  if (lastStudyDate === today) {
    return { newStreak: currentStreak, longestUpdate: false };
  }

  const last = new Date(lastStudyDate);
  const now = new Date(today);
  const diffDays = Math.floor(
    (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 1) {
    return { newStreak: currentStreak + 1, longestUpdate: true };
  }

  return { newStreak: 1, longestUpdate: true };
}

export const BADGE_CHECKS: {
  id: string;
  check: (ctx: BadgeContext) => boolean;
}[] = [
  { id: "first_step", check: () => true },
  { id: "on_fire", check: (ctx) => ctx.streak >= 3 },
  { id: "week_warrior", check: (ctx) => ctx.streak >= 7 },
  { id: "consistent", check: (ctx) => ctx.streak >= 30 },
  { id: "topic_master", check: (ctx) => ctx.uniqueCompletedTopics >= 10 },
  {
    id: "halfway",
    check: (ctx) =>
      ctx.totalTopicsInCourse > 0 &&
      ctx.uniqueCompletedTopics / ctx.totalTopicsInCourse >= 0.5,
  },
  {
    id: "full_coverage",
    check: (ctx) =>
      ctx.totalTopicsInCourse > 0 &&
      ctx.uniqueCompletedTopics >= ctx.totalTopicsInCourse,
  },
  { id: "early_bird", check: (ctx) => ctx.sessionHour < 9 },
  { id: "night_owl", check: (ctx) => ctx.sessionHour >= 21 },
];

interface BadgeContext {
  streak: number;
  uniqueCompletedTopics: number;
  totalTopicsInCourse: number;
  sessionHour: number;
}

export function getNewBadges(
  ctx: BadgeContext,
  existingBadgeIds: string[]
): string[] {
  return BADGE_CHECKS.filter(
    (b) => !existingBadgeIds.includes(b.id) && b.check(ctx)
  ).map((b) => b.id);
}

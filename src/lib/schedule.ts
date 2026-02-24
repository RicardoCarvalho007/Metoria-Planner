import { getTopicsForCourse, type Course } from "@/data/syllabus";

const DAY_MAP = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const MAX_SESSION_MINUTES = 50;
const BREAK_MINUTES = 10;
const BLOCK_MINUTES = MAX_SESSION_MINUTES + BREAK_MINUTES; // 60min per block

export type TopicAssessmentConfidence = "known" | "needs_work" | "new";

interface ScheduleInput {
  userId: string;
  planId: string;
  course: Course;
  examDate: string;
  dailyHours: Record<string, number>;
  /** @deprecated use topicAssessments instead */
  skippedTopicIds?: string[];
  /** Per-topic confidence: known = skip, needs_work = 50% hours, new = full hours */
  topicAssessments?: Record<string, TopicAssessmentConfidence>;
}

interface SessionInsert {
  plan_id: string;
  user_id: string;
  topic_id: string;
  topic_name: string;
  scheduled_date: string;
  estimated_minutes: number;
  status: "pending";
  xp_earned: number;
}

interface ScheduleResult {
  sessions: SessionInsert[];
  totalTopicHours: number;
  totalAvailableHours: number;
  hasCapacityWarning: boolean;
}

export function generateSchedule(input: ScheduleInput): ScheduleResult {
  const { userId, planId, course, examDate, dailyHours, skippedTopicIds = [], topicAssessments } = input;

  const allTopics = getTopicsForCourse(course);
  const topics: { id: string; name: string; hours: number }[] = [];
  let totalTopicHours = 0;

  if (topicAssessments) {
    for (const t of allTopics) {
      const conf = topicAssessments[t.id] ?? "new";
      if (conf === "known") continue;
      const multiplier = conf === "needs_work" ? 0.5 : 1;
      const effectiveHours = t.hours * multiplier;
      if (effectiveHours > 0) {
        topics.push({ ...t, hours: effectiveHours });
        totalTopicHours += effectiveHours;
      }
    }
  } else {
    const skippedSet = new Set(skippedTopicIds);
    const filtered = allTopics.filter((t) => !skippedSet.has(t.id));
    for (const t of filtered) {
      topics.push({ ...t, hours: t.hours });
      totalTopicHours += t.hours;
    }
  }

  const availableDays = buildAvailableDays(dailyHours, examDate);
  // Effective study minutes per day accounts for breaks within each hour
  const totalAvailableMinutes = availableDays.reduce(
    (sum, d) => sum + effectiveStudyMinutes(d.hours),
    0
  );
  const totalAvailableHours = Math.round((totalAvailableMinutes / 60) * 10) / 10;
  const hasCapacityWarning = totalAvailableHours < totalTopicHours;

  const dayCapacity = availableDays.map((d) => effectiveStudyMinutes(d.hours));
  const sessions: SessionInsert[] = [];
  let dayIdx = 0;

  for (const topic of topics) {
    let remaining = topic.hours * 60;
    let partNum = 0;
    const totalParts = Math.ceil(remaining / MAX_SESSION_MINUTES);

    while (remaining > 0 && dayIdx < availableDays.length) {
      if (dayCapacity[dayIdx] <= 0) {
        dayIdx++;
        continue;
      }

      const sessionTime = Math.min(remaining, MAX_SESSION_MINUTES, dayCapacity[dayIdx]);
      partNum++;

      const suffix = totalParts > 1 ? ` (Part ${partNum}/${totalParts})` : "";

      sessions.push({
        plan_id: planId,
        user_id: userId,
        topic_id: topic.id,
        topic_name: topic.name + suffix,
        scheduled_date: availableDays[dayIdx].date,
        estimated_minutes: sessionTime,
        status: "pending",
        xp_earned: 0,
      });

      dayCapacity[dayIdx] -= sessionTime;
      // Deduct break time if there's still capacity left for another session
      if (dayCapacity[dayIdx] > 0) {
        dayCapacity[dayIdx] = Math.max(0, dayCapacity[dayIdx] - BREAK_MINUTES);
      }
      remaining -= sessionTime;

      if (dayCapacity[dayIdx] <= 0) dayIdx++;
    }
  }

  return { sessions, totalTopicHours, totalAvailableHours, hasCapacityWarning };
}

/** Calculate effective study minutes accounting for 10min break per 50min block */
function effectiveStudyMinutes(hours: number): number {
  const totalMinutes = hours * 60;
  const fullBlocks = Math.floor(totalMinutes / BLOCK_MINUTES);
  const leftover = totalMinutes - fullBlocks * BLOCK_MINUTES;
  // Each full block gives MAX_SESSION_MINUTES of study, leftover is pure study
  return fullBlocks * MAX_SESSION_MINUTES + Math.min(leftover, MAX_SESSION_MINUTES);
}

function buildAvailableDays(
  dailyHours: Record<string, number>,
  examDate: string
): { date: string; hours: number }[] {
  const days: { date: string; hours: number }[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(examDate + "T23:59:59");

  if (end < start) return days;

  const d = new Date(start.getTime());
  const MAX_DAYS = 365;
  let count = 0;
  while (d <= end && count < MAX_DAYS) {
    const dayName = DAY_MAP[d.getDay()];
    const hours = dailyHours[dayName] ?? 0;
    if (hours > 0) {
      days.push({
        date: d.toISOString().split("T")[0],
        hours,
      });
    }
    d.setDate(d.getDate() + 1);
    count++;
  }

  return days;
}

/** Find the first available study day on or after (fromDate + daysAhead). */
export function findNextAvailableDate(
  dailyHours: Record<string, number>,
  examDate: string,
  fromDate: string,
  daysAhead: number
): string | null {
  const from = new Date(fromDate + "T12:00:00");
  const target = new Date(from);
  target.setDate(target.getDate() + daysAhead);
  const targetStr = target.toISOString().split("T")[0];
  const availableDays = buildAvailableDays(dailyHours, examDate);
  const today = new Date().toISOString().split("T")[0];
  const futureDays = availableDays.filter((d) => d.date >= today && d.date >= targetStr);
  return futureDays.length > 0 ? futureDays[0].date : null;
}

export function redistributeMissedSessions(
  missedSessions: { topic_id: string; topic_name: string; estimated_minutes: number }[],
  futurePendingSessions: { scheduled_date: string; estimated_minutes: number }[],
  dailyHours: Record<string, number>,
  examDate: string,
  userId: string,
  planId: string
): SessionInsert[] {
  const availableDays = buildAvailableDays(dailyHours, examDate);
  const today = new Date().toISOString().split("T")[0];
  const futureDays = availableDays.filter((d) => d.date > today);

  const usedMinutes: Record<string, number> = {};
  for (const s of futurePendingSessions) {
    usedMinutes[s.scheduled_date] = (usedMinutes[s.scheduled_date] ?? 0) + s.estimated_minutes;
  }

  const newSessions: SessionInsert[] = [];
  let dayIdx = 0;

  for (const missed of missedSessions) {
    let remaining = missed.estimated_minutes;

    while (remaining > 0 && dayIdx < futureDays.length) {
      const day = futureDays[dayIdx];
      const used = usedMinutes[day.date] ?? 0;
      const capacity = effectiveStudyMinutes(day.hours) - used;

      if (capacity <= 0) {
        dayIdx++;
        continue;
      }

      const allocated = Math.min(remaining, MAX_SESSION_MINUTES, capacity);
      newSessions.push({
        plan_id: planId,
        user_id: userId,
        topic_id: missed.topic_id,
        topic_name: missed.topic_name,
        scheduled_date: day.date,
        estimated_minutes: allocated,
        status: "pending",
        xp_earned: 0,
      });

      usedMinutes[day.date] = used + allocated;
      remaining -= allocated;

      if (used + allocated >= effectiveStudyMinutes(day.hours)) dayIdx++;
    }
  }

  return newSessions;
}

/** Spread missed sessions over the next 14 study days (gradual catch-up). */
export function redistributeGradual(
  missedSessions: { topic_id: string; topic_name: string; estimated_minutes: number }[],
  futurePendingSessions: { scheduled_date: string; estimated_minutes: number }[],
  dailyHours: Record<string, number>,
  examDate: string,
  userId: string,
  planId: string
): SessionInsert[] {
  const availableDays = buildAvailableDays(dailyHours, examDate);
  const today = new Date().toISOString().split("T")[0];
  const futureDays = availableDays.filter((d) => d.date > today).slice(0, 14);
  const usedMinutes: Record<string, number> = {};
  for (const s of futurePendingSessions) {
    usedMinutes[s.scheduled_date] = (usedMinutes[s.scheduled_date] ?? 0) + s.estimated_minutes;
  }
  const newSessions: SessionInsert[] = [];
  let dayIdx = 0;
  for (const missed of missedSessions) {
    let remaining = missed.estimated_minutes;
    while (remaining > 0 && dayIdx < futureDays.length) {
      const day = futureDays[dayIdx];
      const used = usedMinutes[day.date] ?? 0;
      const capacity = effectiveStudyMinutes(day.hours) - used;
      if (capacity <= 0) {
        dayIdx++;
        continue;
      }
      const allocated = Math.min(remaining, MAX_SESSION_MINUTES, capacity);
      newSessions.push({
        plan_id: planId,
        user_id: userId,
        topic_id: missed.topic_id,
        topic_name: missed.topic_name,
        scheduled_date: day.date,
        estimated_minutes: allocated,
        status: "pending",
        xp_earned: 0,
      });
      usedMinutes[day.date] = used + allocated;
      remaining -= allocated;
      if (used + allocated >= effectiveStudyMinutes(day.hours)) dayIdx++;
    }
  }
  return newSessions;
}

/** Put all missed sessions on the next weekend (Sat + Sun) only. */
export function redistributeWeekend(
  missedSessions: { topic_id: string; topic_name: string; estimated_minutes: number }[],
  futurePendingSessions: { scheduled_date: string; estimated_minutes: number }[],
  dailyHours: Record<string, number>,
  examDate: string,
  userId: string,
  planId: string
): SessionInsert[] {
  const availableDays = buildAvailableDays(dailyHours, examDate);
  const today = new Date().toISOString().split("T")[0];
  const weekendDays = availableDays.filter((d) => {
    const dayNum = new Date(d.date + "T12:00:00").getDay();
    return d.date > today && (dayNum === 6 || dayNum === 0);
  }).slice(0, 2);
  const usedMinutes: Record<string, number> = {};
  for (const s of futurePendingSessions) {
    usedMinutes[s.scheduled_date] = (usedMinutes[s.scheduled_date] ?? 0) + s.estimated_minutes;
  }
  const newSessions: SessionInsert[] = [];
  let dayIdx = 0;
  for (const missed of missedSessions) {
    let remaining = missed.estimated_minutes;
    while (remaining > 0 && dayIdx < weekendDays.length) {
      const day = weekendDays[dayIdx];
      const used = usedMinutes[day.date] ?? 0;
      const capacity = effectiveStudyMinutes(day.hours) - used;
      if (capacity <= 0) {
        dayIdx++;
        continue;
      }
      const allocated = Math.min(remaining, MAX_SESSION_MINUTES, capacity);
      newSessions.push({
        plan_id: planId,
        user_id: userId,
        topic_id: missed.topic_id,
        topic_name: missed.topic_name,
        scheduled_date: day.date,
        estimated_minutes: allocated,
        status: "pending",
        xp_earned: 0,
      });
      usedMinutes[day.date] = used + allocated;
      remaining -= allocated;
      if (used + allocated >= effectiveStudyMinutes(day.hours)) dayIdx++;
    }
  }
  return newSessions;
}

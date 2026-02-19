import { ScheduledSession, UserProfile, LeaderboardEntry, Badge, StudyPlan } from "@/types/app";

const today = new Date().toISOString().split("T")[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

export const MOCK_PROFILE: UserProfile = {
  id: "user-1",
  fullName: "Alex Chen",
  email: "alex@school.com",
  school: "International School of Geneva",
  totalXp: 2450,
  currentStreak: 5,
  longestStreak: 12,
  course: "AA_HL",
  examDate: new Date(Date.now() + 47 * 86400000).toISOString().split("T")[0],
  topicsCompleted: 8,
  totalTopics: 27,
  studyHours: 14,
};

export const MOCK_PLAN: StudyPlan = {
  id: "plan-1",
  course: "AA_HL",
  examDate: MOCK_PROFILE.examDate,
  dailyHours: { mon: 2, tue: 2, wed: 0, thu: 2, fri: 1, sat: 3, sun: 0 },
};

export const MOCK_TODAY_SESSIONS: ScheduledSession[] = [
  {
    id: "s1",
    topicId: "aa_3_5",
    topicName: "Trigonometric Identities — Pythagorean & Compound Angles",
    scheduledDate: today,
    estimatedMinutes: 90,
    status: "pending",
    xpEarned: 0,
    difficulty: 3,
  },
  {
    id: "s2",
    topicId: "aa_5_3",
    topicName: "Differentiation — Rules (Power, Product, Quotient, Chain)",
    scheduledDate: today,
    estimatedMinutes: 60,
    status: "completed",
    xpEarned: 250,
    difficulty: 2,
  },
  {
    id: "s3",
    topicId: "aa_4_10",
    topicName: "Distributions — Normal Distribution",
    scheduledDate: today,
    estimatedMinutes: 75,
    status: "pending",
    xpEarned: 0,
    difficulty: 2,
  },
];

export const MOCK_UPCOMING_SESSIONS: ScheduledSession[] = [
  {
    id: "s4",
    topicId: "aa_5_7",
    topicName: "Applications of Differentiation — Optimization",
    scheduledDate: tomorrow,
    estimatedMinutes: 90,
    status: "pending",
    xpEarned: 0,
    difficulty: 3,
  },
  {
    id: "s5",
    topicId: "aa_1_8",
    topicName: "Complex Numbers — Introduction & Cartesian Form",
    scheduledDate: yesterday,
    estimatedMinutes: 60,
    status: "missed",
    xpEarned: 0,
    difficulty: 2,
  },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: "u1", name: "Sofia Müller", xp: 4800, course: "AA_HL" },
  { rank: 2, userId: "u2", name: "James Park", xp: 3950, course: "AI_HL" },
  { rank: 3, userId: "u3", name: "Priya Sharma", xp: 3200, course: "AA_SL" },
  { rank: 4, userId: "u4", name: "Lucas Fernández", xp: 2900, course: "AI_SL" },
  { rank: 5, userId: "user-1", name: "Alex Chen", xp: 2450, course: "AA_HL", isCurrentUser: true },
  { rank: 6, userId: "u6", name: "Emma Johansson", xp: 2100, course: "AA_HL" },
  { rank: 7, userId: "u7", name: "Ryo Tanaka", xp: 1850, course: "AI_HL" },
  { rank: 8, userId: "u8", name: "Aisha Okonkwo", xp: 1600, course: "AA_SL" },
];

export const MOCK_WEEKLY_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: "user-1", name: "Alex Chen", xp: 850, course: "AA_HL", isCurrentUser: true },
  { rank: 2, userId: "u2", name: "James Park", xp: 720, course: "AI_HL" },
  { rank: 3, userId: "u3", name: "Priya Sharma", xp: 650, course: "AA_SL" },
  { rank: 4, userId: "u1", name: "Sofia Müller", xp: 580, course: "AA_HL" },
  { rank: 5, userId: "u6", name: "Emma Johansson", xp: 490, course: "AA_HL" },
];

export const MOCK_BADGES: Badge[] = [
  { id: "first_step", emoji: "🚀", name: "First Step", condition: "Complete first session", earned: true },
  { id: "on_fire", emoji: "🔥", name: "On Fire", condition: "3-day streak", earned: true },
  { id: "week_warrior", emoji: "⚡", name: "Week Warrior", condition: "7-day streak", earned: false },
  { id: "consistent", emoji: "💎", name: "Consistent", condition: "30-day streak", earned: false },
  { id: "topic_master", emoji: "📚", name: "Topic Master", condition: "Complete 10 topics", earned: false },
  { id: "halfway", emoji: "🏆", name: "Halfway There", condition: "Complete 50% of syllabus", earned: false },
  { id: "full_coverage", emoji: "🎯", name: "Full Coverage", condition: "Complete 100% of syllabus", earned: false },
  { id: "early_bird", emoji: "⏰", name: "Early Bird", condition: "Study before 9am", earned: true },
  { id: "night_owl", emoji: "🌙", name: "Night Owl", condition: "Study after 9pm", earned: false },
];

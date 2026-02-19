import { Course } from "@/data/syllabus";

export type SessionStatus = "pending" | "completed" | "missed" | "rescheduled";

export interface ScheduledSession {
  id: string;
  topicId: string;
  topicName: string;
  scheduledDate: string; // YYYY-MM-DD
  estimatedMinutes: number;
  status: SessionStatus;
  xpEarned: number;
  difficulty: 1 | 2 | 3;
}

export interface StudyPlan {
  id: string;
  course: Course;
  examDate: string;
  dailyHours: Record<string, number>; // mon, tue, wed, thu, fri, sat, sun
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  school?: string;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  course: Course;
  examDate: string;
  topicsCompleted: number;
  totalTopics: number;
  studyHours: number;
}

export interface Badge {
  id: string;
  emoji: string;
  name: string;
  condition: string;
  earned: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  course: Course;
  isCurrentUser?: boolean;
}

export type AppTab = "today" | "plan" | "leaderboard" | "profile";
export type OnboardingStep = "welcome" | "course" | "examdate" | "availability" | "ready";

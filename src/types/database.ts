import type { Course } from "@/data/syllabus";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  school: string | null;
  avatar_url: string | null;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  created_at: string;
}

export interface DailySlot {
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
}

export interface StudyPlan {
  id: string;
  user_id: string;
  course: Course;
  exam_date: string;
  daily_hours: Record<string, number>;
  daily_slots?: Record<string, DailySlot[]> | null;
  is_active: boolean;
  created_at: string;
}

export interface ScheduledSession {
  id: string;
  plan_id: string;
  user_id: string;
  topic_id: string;
  topic_name: string;
  scheduled_date: string;
  estimated_minutes: number;
  status: "pending" | "completed" | "missed" | "rescheduled";
  completed_at: string | null;
  xp_earned: number;
  needs_tutor_help: boolean;
  session_type?: "study" | "review" | "recovery";
  created_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  scheduled_session_id: string | null;
  duration_minutes: number;
  started_at: string;
  ended_at: string;
  xp_earned: number;
  session_confidence?: "low" | "medium" | "high" | null;
  created_at: string;
}

export interface BadgeDefinition {
  id: string;
  emoji: string;
  name: string;
  condition: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface TopicNote {
  id: string;
  user_id: string;
  topic_id: string;
  subtopic_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface TopicUpload {
  id: string;
  user_id: string;
  topic_id: string;
  subtopic_id: string | null;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_xp: number;
  course: Course | null;
}

export type TopicConfidence = "known" | "needs_work" | "new";

export interface TopicAssessment {
  id: string;
  user_id: string;
  plan_id: string;
  topic_id: string;
  confidence: TopicConfidence;
  created_at: string;
  updated_at: string;
}

export interface WeeklyOverride {
  id: string;
  user_id: string;
  plan_id: string;
  week_start: string;
  daily_hours: Record<string, number>;
  created_at: string;
}

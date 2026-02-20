-- Metoria Planner: Initial database schema (PRD)
-- Tables: profiles, study_plans, scheduled_sessions, study_sessions, badge_definitions, user_badges

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- PROFILES
-- id matches Supabase auth.users.id
-- =============================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  school TEXT,
  avatar_url TEXT,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_study_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- STUDY_PLANS
-- One active plan per user (enforced by partial unique index)
-- =============================================================================
CREATE TABLE public.study_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course TEXT NOT NULL CHECK (course IN ('AA_HL', 'AA_SL', 'AI_HL', 'AI_SL')),
  exam_date DATE NOT NULL,
  daily_hours JSONB NOT NULL DEFAULT '{"mon":0,"tue":0,"wed":0,"thu":0,"fri":0,"sat":0,"sun":0}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only one active plan per user
CREATE UNIQUE INDEX study_plans_one_active_per_user
  ON public.study_plans (user_id) WHERE is_active = true;

CREATE INDEX idx_study_plans_user_id ON public.study_plans(user_id);

-- =============================================================================
-- SCHEDULED_SESSIONS
-- =============================================================================
CREATE TABLE public.scheduled_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES public.study_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  topic_name TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  estimated_minutes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed', 'rescheduled')),
  completed_at TIMESTAMPTZ,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scheduled_sessions_plan_id ON public.scheduled_sessions(plan_id);
CREATE INDEX idx_scheduled_sessions_user_id ON public.scheduled_sessions(user_id);
CREATE INDEX idx_scheduled_sessions_user_date ON public.scheduled_sessions(user_id, scheduled_date);
CREATE INDEX idx_scheduled_sessions_status ON public.scheduled_sessions(status);

-- =============================================================================
-- STUDY_SESSIONS
-- Actual study time logged (links to scheduled_session when completing one)
-- =============================================================================
CREATE TABLE public.study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_session_id UUID REFERENCES public.scheduled_sessions(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  xp_earned INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX idx_study_sessions_scheduled_id ON public.study_sessions(scheduled_session_id);
CREATE INDEX idx_study_sessions_started_at ON public.study_sessions(started_at);

-- =============================================================================
-- BADGES
-- badge_definitions: static badge definitions
-- user_badges: which users have earned which badges
-- =============================================================================
CREATE TABLE public.badge_definitions (
  id TEXT PRIMARY KEY,
  emoji TEXT NOT NULL,
  name TEXT NOT NULL,
  condition TEXT NOT NULL
);

CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES public.badge_definitions(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);

-- Seed badge definitions (from PRD)
INSERT INTO public.badge_definitions (id, emoji, name, condition) VALUES
  ('first_step', '🚀', 'First Step', 'Complete first session'),
  ('on_fire', '🔥', 'On Fire', '3-day streak'),
  ('week_warrior', '⚡', 'Week Warrior', '7-day streak'),
  ('consistent', '💎', 'Consistent', '30-day streak'),
  ('topic_master', '📚', 'Topic Master', 'Complete 10 topics'),
  ('halfway', '🏆', 'Halfway There', 'Complete 50% of syllabus'),
  ('full_coverage', '🎯', 'Full Coverage', 'Complete 100% of syllabus'),
  ('early_bird', '⏰', 'Early Bird', 'Study before 9am'),
  ('night_owl', '🌙', 'Night Owl', 'Study after 9pm');

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own; insert via trigger on auth signup
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Study plans: users can CRUD their own
CREATE POLICY "Users can view own study plans"
  ON public.study_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study plans"
  ON public.study_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study plans"
  ON public.study_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own study plans"
  ON public.study_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Scheduled sessions: users can CRUD their own
CREATE POLICY "Users can view own scheduled sessions"
  ON public.scheduled_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled sessions"
  ON public.scheduled_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled sessions"
  ON public.scheduled_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled sessions"
  ON public.scheduled_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Study sessions: users can CRUD their own
CREATE POLICY "Users can view own study sessions"
  ON public.study_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions"
  ON public.study_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study sessions"
  ON public.study_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own study sessions"
  ON public.study_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Badge definitions: public read (all users can see badge definitions)
CREATE POLICY "Anyone can view badge definitions"
  ON public.badge_definitions FOR SELECT
  TO authenticated
  USING (true);

-- User badges: all authenticated can read (for leaderboard); users can insert own
CREATE POLICY "Authenticated users can view all user badges"
  ON public.user_badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Leaderboard: profiles readable by all authenticated users
CREATE POLICY "Authenticated users can view profiles for leaderboard"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- =============================================================================
-- TRIGGER: Create profile on signup
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

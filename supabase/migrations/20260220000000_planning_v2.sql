-- ============================================================
-- Migration: Planning v2 — topic_assessments, weekly_overrides,
-- session_confidence, session_type
-- ============================================================

-- 1. topic_assessments: stores onboarding self-assessment per topic per plan
CREATE TABLE IF NOT EXISTS public.topic_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.study_plans(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('known', 'needs_work', 'new')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (plan_id, topic_id)
);

CREATE INDEX idx_topic_assessments_plan_id ON public.topic_assessments(plan_id);
CREATE INDEX idx_topic_assessments_user_id ON public.topic_assessments(user_id);

ALTER TABLE public.topic_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own topic assessments"
  ON public.topic_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own topic assessments"
  ON public.topic_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own topic assessments"
  ON public.topic_assessments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own topic assessments"
  ON public.topic_assessments FOR DELETE
  USING (auth.uid() = user_id);

-- 2. weekly_overrides: temporary weekly availability overrides
CREATE TABLE IF NOT EXISTS public.weekly_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.study_plans(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  daily_hours JSONB NOT NULL DEFAULT '{"mon":0,"tue":0,"wed":0,"thu":0,"fri":0,"sat":0,"sun":0}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (plan_id, week_start)
);

CREATE INDEX idx_weekly_overrides_plan_id ON public.weekly_overrides(plan_id);
CREATE INDEX idx_weekly_overrides_user_id ON public.weekly_overrides(user_id);

ALTER TABLE public.weekly_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weekly overrides"
  ON public.weekly_overrides FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly overrides"
  ON public.weekly_overrides FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly overrides"
  ON public.weekly_overrides FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly overrides"
  ON public.weekly_overrides FOR DELETE
  USING (auth.uid() = user_id);

-- 3. session_confidence on study_sessions (post-session rating)
ALTER TABLE public.study_sessions
ADD COLUMN IF NOT EXISTS session_confidence TEXT CHECK (session_confidence IN ('low', 'medium', 'high'));

-- 4. session_type on scheduled_sessions (study | review | recovery)
ALTER TABLE public.scheduled_sessions
ADD COLUMN IF NOT EXISTS session_type TEXT NOT NULL DEFAULT 'study' CHECK (session_type IN ('study', 'review', 'recovery'));

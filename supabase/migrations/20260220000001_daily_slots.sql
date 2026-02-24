-- Add daily_slots to study_plans for exact time windows per day.
-- Format: {"mon":[{"start":"09:00","end":"11:00"}],"tue":[],...}
-- When set, daily_hours can be derived from slot lengths for scheduling.
ALTER TABLE public.study_plans
  ADD COLUMN IF NOT EXISTS daily_slots JSONB DEFAULT NULL;

COMMENT ON COLUMN public.study_plans.daily_slots IS 'Optional. Per-day array of {start, end} in HH:mm. e.g. {"mon":[{"start":"09:00","end":"11:00"}]}. When null, use daily_hours.';

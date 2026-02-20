-- Add needs_tutor_help flag to scheduled_sessions
ALTER TABLE public.scheduled_sessions
ADD COLUMN IF NOT EXISTS needs_tutor_help BOOLEAN NOT NULL DEFAULT false;

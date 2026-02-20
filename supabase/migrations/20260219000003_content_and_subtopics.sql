-- ============================================================
-- Migration: topic_notes, topic_uploads, skipped_topic_ids
-- ============================================================

-- 1. Add skipped_topic_ids to study_plans
ALTER TABLE public.study_plans
ADD COLUMN IF NOT EXISTS skipped_topic_ids TEXT[] NOT NULL DEFAULT '{}';

-- 2. Topic notes table
CREATE TABLE IF NOT EXISTS public.topic_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  subtopic_id TEXT,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic_id, subtopic_id)
);

ALTER TABLE public.topic_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes"
  ON public.topic_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON public.topic_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON public.topic_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON public.topic_notes FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Topic uploads table
CREATE TABLE IF NOT EXISTS public.topic_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  subtopic_id TEXT,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.topic_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own uploads"
  ON public.topic_uploads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own uploads"
  ON public.topic_uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own uploads"
  ON public.topic_uploads FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Create storage bucket for topic files
-- NOTE: Run this in the Supabase Dashboard → Storage → Create bucket:
--   Name: topic-files
--   Public: false
--   File size limit: 10MB
--   Allowed MIME types: application/pdf, image/png, image/jpeg, image/webp
--
-- Then add these storage policies:
--   SELECT: (auth.uid()::text = (storage.foldername(name))[1])
--   INSERT: (auth.uid()::text = (storage.foldername(name))[1])
--   DELETE: (auth.uid()::text = (storage.foldername(name))[1])

-- ============================================================
-- Seed script: Insert 8 fake students for leaderboard testing
-- ============================================================
-- HOW TO RUN: Go to your Supabase Dashboard → SQL Editor,
-- paste this entire file, and click "Run".
-- These are not real login-able accounts — they only
-- populate the leaderboard.
-- ============================================================

-- Step 1: Create fake entries in auth.users (required by FK)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('a1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emma.r@school.edu',   crypt('fakepw123!', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"full_name":"Emma Rodriguez"}'),
  ('a1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'james.c@school.edu',  crypt('fakepw123!', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"full_name":"James Chen"}'),
  ('a1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sofia.n@school.edu',  crypt('fakepw123!', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"full_name":"Sofia Nakamura"}'),
  ('a1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'liam.o@school.edu',   crypt('fakepw123!', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"full_name":"Liam O''Brien"}'),
  ('a1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aisha.p@school.edu',  crypt('fakepw123!', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"full_name":"Aisha Patel"}'),
  ('a1000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'noah.k@school.edu',   crypt('fakepw123!', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"full_name":"Noah Kim"}'),
  ('a1000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mia.j@school.edu',    crypt('fakepw123!', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"full_name":"Mia Johansson"}'),
  ('a1000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'carlos.f@school.edu', crypt('fakepw123!', gen_salt('bf')), now(), now(), now(), '', '{"provider":"email","providers":["email"]}', '{"full_name":"Carlos Fernandez"}')
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create profiles
INSERT INTO public.profiles (id, full_name, email, total_xp, current_streak, longest_streak, last_study_date)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Emma Rodriguez',   'emma.r@school.edu',   7420, 12, 18, CURRENT_DATE - INTERVAL '1 day'),
  ('a1000000-0000-0000-0000-000000000002', 'James Chen',       'james.c@school.edu',  5890, 8,  14, CURRENT_DATE - INTERVAL '2 days'),
  ('a1000000-0000-0000-0000-000000000003', 'Sofia Nakamura',   'sofia.n@school.edu',  4210, 5,  9,  CURRENT_DATE - INTERVAL '1 day'),
  ('a1000000-0000-0000-0000-000000000004', 'Liam O''Brien',    'liam.o@school.edu',   3750, 3,  7,  CURRENT_DATE),
  ('a1000000-0000-0000-0000-000000000005', 'Aisha Patel',      'aisha.p@school.edu',  2980, 6,  11, CURRENT_DATE - INTERVAL '3 days'),
  ('a1000000-0000-0000-0000-000000000006', 'Noah Kim',         'noah.k@school.edu',   1640, 2,  5,  CURRENT_DATE - INTERVAL '1 day'),
  ('a1000000-0000-0000-0000-000000000007', 'Mia Johansson',    'mia.j@school.edu',    920,  1,  3,  CURRENT_DATE - INTERVAL '4 days'),
  ('a1000000-0000-0000-0000-000000000008', 'Carlos Fernandez', 'carlos.f@school.edu', 580,  0,  2,  NULL)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Give each fake student an active study plan so courses show on leaderboard
INSERT INTO public.study_plans (user_id, course, exam_date, daily_hours, is_active)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'AA_HL', '2026-05-15', '{"mon":3,"tue":2,"wed":3,"thu":2,"fri":1,"sat":4,"sun":0}', true),
  ('a1000000-0000-0000-0000-000000000002', 'AI_HL', '2026-05-15', '{"mon":2,"tue":2,"wed":2,"thu":2,"fri":1,"sat":3,"sun":0}', true),
  ('a1000000-0000-0000-0000-000000000003', 'AA_SL', '2026-05-15', '{"mon":2,"tue":1,"wed":2,"thu":1,"fri":1,"sat":2,"sun":0}', true),
  ('a1000000-0000-0000-0000-000000000004', 'AI_SL', '2026-05-15', '{"mon":2,"tue":2,"wed":0,"thu":2,"fri":1,"sat":2,"sun":0}', true),
  ('a1000000-0000-0000-0000-000000000005', 'AA_HL', '2026-05-15', '{"mon":1,"tue":2,"wed":1,"thu":2,"fri":1,"sat":3,"sun":0}', true),
  ('a1000000-0000-0000-0000-000000000006', 'AI_HL', '2026-05-15', '{"mon":1,"tue":1,"wed":1,"thu":1,"fri":1,"sat":2,"sun":0}', true),
  ('a1000000-0000-0000-0000-000000000007', 'AA_SL', '2026-05-15', '{"mon":1,"tue":0,"wed":1,"thu":0,"fri":1,"sat":2,"sun":0}', true),
  ('a1000000-0000-0000-0000-000000000008', 'AI_SL', '2026-05-15', '{"mon":1,"tue":1,"wed":0,"thu":1,"fri":0,"sat":1,"sun":0}', true)
ON CONFLICT DO NOTHING;

-- Leaderboard RPC (bypasses per-user RLS on study_plans to show course badges)
CREATE OR REPLACE FUNCTION public.get_leaderboard(time_period TEXT DEFAULT 'all_time')
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  total_xp BIGINT,
  course TEXT
) AS $$
BEGIN
  IF time_period = 'weekly' THEN
    RETURN QUERY
    SELECT
      p.id AS user_id,
      p.full_name,
      p.avatar_url,
      COALESCE(SUM(ss.xp_earned), 0)::BIGINT AS total_xp,
      sp.course
    FROM public.profiles p
    LEFT JOIN public.study_sessions ss
      ON ss.user_id = p.id AND ss.started_at >= NOW() - INTERVAL '7 days'
    LEFT JOIN public.study_plans sp
      ON sp.user_id = p.id AND sp.is_active = true
    GROUP BY p.id, p.full_name, p.avatar_url, sp.course
    HAVING COALESCE(SUM(ss.xp_earned), 0) > 0
    ORDER BY total_xp DESC
    LIMIT 50;
  ELSE
    RETURN QUERY
    SELECT
      p.id AS user_id,
      p.full_name,
      p.avatar_url,
      p.total_xp::BIGINT,
      sp.course
    FROM public.profiles p
    LEFT JOIN public.study_plans sp
      ON sp.user_id = p.id AND sp.is_active = true
    ORDER BY p.total_xp DESC
    LIMIT 50;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

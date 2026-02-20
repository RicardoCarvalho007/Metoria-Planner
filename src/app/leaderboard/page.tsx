import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import LeaderboardView from "@/components/LeaderboardView";
import type { LeaderboardEntry } from "@/types/database";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  // Fetch both leaderboards in parallel using the RPC
  const [allTimeRes, weeklyRes] = await Promise.all([
    supabase.rpc("get_leaderboard", { time_period: "all_time" }),
    supabase.rpc("get_leaderboard", { time_period: "weekly" }),
  ]);

  return (
    <div className="min-h-screen flex justify-center">
      <div className="mobile-container w-full relative">
        <div className="min-h-screen pb-24">
          <LeaderboardView
            allTimeEntries={(allTimeRes.data as LeaderboardEntry[]) ?? []}
            weeklyEntries={(weeklyRes.data as LeaderboardEntry[]) ?? []}
            currentUserId={session.user.id}
          />
        </div>
        <BottomNav />
      </div>
    </div>
  );
}

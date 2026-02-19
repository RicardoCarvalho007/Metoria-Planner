import { useState } from "react";
import { AppTab } from "@/types/app";
import { Course } from "@/data/syllabus";
import { MOCK_PROFILE } from "@/data/mockData";
import Onboarding from "@/components/Onboarding";
import TodayTab from "@/components/TodayTab";
import PlanTab from "@/components/PlanTab";
import LeaderboardTab from "@/components/LeaderboardTab";
import ProfileTab from "@/components/ProfileTab";
import BottomNav from "@/components/BottomNav";

const Index = () => {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>("today");
  const [profile, setProfile] = useState(MOCK_PROFILE);

  const handleOnboardingComplete = (name: string, course: Course, examDate: string) => {
    setProfile((prev) => ({ ...prev, fullName: name, course, examDate }));
    setIsOnboarded(true);
  };

  const handleXpEarned = (xp: number) => {
    setProfile((prev) => ({ ...prev, totalXp: prev.totalXp + xp }));
  };

  if (!isOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="mobile-container w-full relative">
        <div className="pb-24 min-h-screen overflow-y-auto">
          {activeTab === "today" && <TodayTab profile={profile} onXpEarned={handleXpEarned} />}
          {activeTab === "plan" && <PlanTab />}
          {activeTab === "leaderboard" && <LeaderboardTab />}
          {activeTab === "profile" && <ProfileTab profile={profile} />}
        </div>
        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
    </div>
  );
};

export default Index;

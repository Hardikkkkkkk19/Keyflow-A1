import React, { useState, useEffect } from "react";
import { PageTransition } from "../components/common/PageTransition";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../components/common/ScrollReveal";
import { ProgressBar } from "../components/common/ProgressBar";
import { useAuth } from "../context/AuthContext";
import { RoutePath, UserRankSummary } from "../types";
import { calculateLevelInfo } from "../utils/gamification";
import { fetchUserRankSummary } from "../utils/leaderboardUtils";
import {
  User,
  Award,
  Flame,
  Zap,
  Target,
  Clock,
  Calendar,
  LogOut,
  Mail,
  Keyboard,
  Sparkles,
  History,
  CheckCircle2,
  Lock,
  Trophy,
  ArrowRight,
} from "lucide-react";

interface ProfilePageProps {
  onNavigate: (path: RoutePath) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, profile, userStatsProfile, signOut } = useAuth();

  const displayName =
    profile?.display_name || userStatsProfile.name || user?.email?.split("@")[0] || "Champ";
  const email = user?.email || profile?.email || "user@example.com";
  const initial = displayName.charAt(0).toUpperCase();

  const levelInfo = calculateLevelInfo(userStatsProfile.currentXp || 0);

  const [rankSummary, setRankSummary] = useState<UserRankSummary | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (user?.id) {
      fetchUserRankSummary(user.id, userStatsProfile).then((summary) => {
        if (isMounted) setRankSummary(summary);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [user?.id, userStatsProfile]);

  const handleLogOut = async () => {
    await signOut();
    onNavigate("/login");
  };

  return (
    <PageTransition>
      <div className="py-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Card Header */}
        <ScrollReveal className="p-6 sm:p-8 bg-[#151515] rounded-2xl border border-[#262626] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#18C69A] text-[#0A0A0A] flex items-center justify-center font-bold font-serif text-2xl sm:text-3xl shadow-lg shrink-0">
              {initial}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-serif text-[#F5F5F5]">{displayName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#18C69A]/15 text-[#18C69A] text-xs font-bold border border-[#18C69A]/30 font-mono">
                  Level {levelInfo.level} Typist
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#A0A0A0] font-mono">
                <Mail className="w-3.5 h-3.5 text-[#666666]" />
                <span>{email}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Level & XP Progress */}
            <div className="w-full sm:w-72 bg-[#111111] p-4 rounded-xl border border-[#262626] space-y-2">
              <div className="flex justify-between items-center text-xs font-bold font-mono">
                <span className="text-[#18C69A]">Level {levelInfo.level}</span>
                <span className="text-[#A0A0A0]">
                  {levelInfo.totalXp} / {levelInfo.xpForNextLevelTotal} XP
                </span>
              </div>
              <ProgressBar progress={levelInfo.progressPercent} height="h-2.5" />
              <div className="text-[10px] text-right text-[#18C69A] font-bold font-mono">
                {levelInfo.remainingXpForNextLevel} XP to Level {levelInfo.level + 1}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogOut}
              className="w-full sm:w-auto px-4 py-3 bg-[#181818] border border-[#F05A9D]/30 text-[#F05A9D] font-bold text-xs rounded-xl hover:bg-[#F05A9D]/15 transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </ScrollReveal>

        {/* Lifetime Stats Cards */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StaggerItem className="p-5 bg-[#151515] rounded-2xl border border-[#262626] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#666666] mb-1 font-mono uppercase font-bold">
              <span>Highest Speed</span>
              <Zap className="w-4 h-4 text-[#45D6E8]" />
            </div>
            <div className="text-3xl font-extrabold text-[#45D6E8] font-mono">
              {userStatsProfile.highestWpm}{" "}
              <span className="text-sm font-sans font-normal text-[#A0A0A0]">WPM</span>
            </div>
          </StaggerItem>

          <StaggerItem className="p-5 bg-[#151515] rounded-2xl border border-[#262626] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#666666] mb-1 font-mono uppercase font-bold">
              <span>Avg Accuracy</span>
              <Target className="w-4 h-4 text-[#79D88B]" />
            </div>
            <div className="text-3xl font-extrabold text-[#79D88B] font-mono">
              {userStatsProfile.avgAccuracy}%
            </div>
          </StaggerItem>

          <StaggerItem className="p-5 bg-[#151515] rounded-2xl border border-[#262626] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#666666] mb-1 font-mono uppercase font-bold">
              <span>Day Streak</span>
              <Flame className="w-4 h-4 text-[#F4D35E]" />
            </div>
            <div className="text-3xl font-extrabold text-[#F4D35E] font-mono">
              {userStatsProfile.streakDays}{" "}
              <span className="text-sm font-sans font-normal text-[#A0A0A0]">Days</span>
            </div>
          </StaggerItem>

          <StaggerItem className="p-5 bg-[#151515] rounded-2xl border border-[#262626] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#666666] mb-1 font-mono uppercase font-bold">
              <span>Tests Completed</span>
              <Clock className="w-4 h-4 text-[#45D6E8]" />
            </div>
            <div className="text-3xl font-extrabold text-[#F5F5F5] font-mono">
              {userStatsProfile.totalTestsCompleted}
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Competitive Standings & Leaderboard Summary Card */}
        <ScrollReveal className="p-6 sm:p-8 bg-[#151515] text-white rounded-2xl border border-[#262626] shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#262626] pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F4D35E]/10 border border-[#F4D35E]/30 text-[#F4D35E] text-xs font-bold font-mono">
                <Trophy className="w-3.5 h-3.5 text-[#F4D35E]" />
                <span>Competitive Rank Overview</span>
              </div>
              <h2 className="text-2xl font-serif text-[#F5F5F5]">Public Leaderboard Status</h2>
            </div>

            <button
              onClick={() => onNavigate("/leaderboard")}
              className="px-4 py-2 bg-[#18C69A] hover:bg-[#14A782] text-[#0A0A0A] font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>View Global Leaderboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="p-4 bg-[#181818] rounded-xl border border-[#262626] space-y-1">
              <span className="text-[10px] text-[#666666] font-mono uppercase block">
                Overall Rank
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#F4D35E] font-mono">
                {rankSummary?.overallRank ? `#${rankSummary.overallRank}` : "Unranked"}
              </div>
              <span className="text-[10px] text-[#666666] block font-mono">
                {rankSummary?.overallScore || 0} pts
              </span>
            </div>

            <div className="p-4 bg-[#181818] rounded-xl border border-[#262626] space-y-1">
              <span className="text-[10px] text-[#666666] font-mono uppercase block">
                Speed Rank
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#18C69A] font-mono">
                {rankSummary?.speedRank ? `#${rankSummary.speedRank}` : "Unranked"}
              </div>
              <span className="text-[10px] text-[#666666] block font-mono">
                {userStatsProfile.highestWpm} Max WPM
              </span>
            </div>

            <div className="p-4 bg-[#181818] rounded-xl border border-[#262626] space-y-1">
              <span className="text-[10px] text-[#666666] font-mono uppercase block">
                Accuracy Rank
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#79D88B] font-mono">
                {rankSummary?.accuracyRank ? `#${rankSummary.accuracyRank}` : "Unranked"}
              </div>
              <span className="text-[10px] text-[#666666] block font-mono">
                {userStatsProfile.avgAccuracy}% Avg
              </span>
            </div>

            <div className="p-4 bg-[#181818] rounded-xl border border-[#262626] space-y-1">
              <span className="text-[10px] text-[#666666] font-mono uppercase block">
                Coding Rank
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#45D6E8] font-mono">
                {rankSummary?.codingRank ? `#${rankSummary.codingRank}` : "Unranked"}
              </div>
              <span className="text-[10px] text-[#666666] block font-mono">
                {rankSummary?.bestCodeWpm || 0} Code WPM
              </span>
            </div>

            <div className="p-4 bg-[#181818] rounded-xl border border-[#262626] space-y-1">
              <span className="text-[10px] text-[#666666] font-mono uppercase block">
                Streak Rank
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#B85CFF] font-mono">
                {rankSummary?.streakRank ? `#${rankSummary.streakRank}` : "Unranked"}
              </div>
              <span className="text-[10px] text-[#666666] block font-mono">
                {userStatsProfile.streakDays} Days
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* XP Activity Feed & Achievements Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Achievements / Badges Grid */}
          <div className="lg:col-span-2 bg-[#151515] p-6 sm:p-8 rounded-2xl border border-[#262626] shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif text-[#F5F5F5] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#18C69A]" />
                Mastery Badges
              </h2>
              <span className="text-xs font-mono text-[#666666]">
                {userStatsProfile.badges?.filter((b) => b.isUnlocked).length || 0} /{" "}
                {userStatsProfile.badges?.length || 0} Unlocked
              </span>
            </div>

            {userStatsProfile.badges && userStatsProfile.badges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userStatsProfile.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${
                      badge.isUnlocked
                        ? "bg-[#181818] border-[#18C69A]/30 shadow-xs"
                        : "bg-[#111111] border-[#262626] opacity-60"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        badge.isUnlocked
                          ? "bg-[#18C69A] text-[#0A0A0A] shadow-md"
                          : "bg-[#181818] text-[#666666] border border-[#262626]"
                      }`}
                    >
                      {badge.isUnlocked ? (
                        <Award className="w-6 h-6" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-sm text-[#F5F5F5]">{badge.title}</h3>
                        {badge.isUnlocked && (
                          <span className="text-[10px] font-bold text-[#18C69A] flex items-center gap-0.5 font-mono">
                            <CheckCircle2 className="w-3 h-3" /> Unlocked
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#A0A0A0] leading-tight">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#666666] text-xs font-medium space-y-2">
                <Award className="w-8 h-8 text-[#666666] mx-auto opacity-60" />
                <p>Complete tests and drills to earn speed and precision badges.</p>
              </div>
            )}
          </div>

          {/* XP History Activity Feed */}
          <div className="bg-[#151515] p-6 sm:p-8 rounded-2xl border border-[#262626] shadow-sm space-y-4">
            <h2 className="text-xl font-serif text-[#F5F5F5] flex items-center gap-2">
              <History className="w-5 h-5 text-[#F4D35E]" />
              XP Activity Feed
            </h2>

            {userStatsProfile.xpHistory && userStatsProfile.xpHistory.length > 0 ? (
              <div className="space-y-3 font-mono text-xs">
                {userStatsProfile.xpHistory.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#181818] rounded-xl border border-[#262626] flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-[#F5F5F5]">{item.title}</div>
                      <div className="text-[10px] text-[#666666]">{item.timestamp}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-[#F4D35E]/10 border border-[#F4D35E]/30 text-[#F4D35E] font-extrabold shrink-0">
                      +{item.xpAmount} XP
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#666666] text-xs font-medium space-y-2">
                <Sparkles className="w-8 h-8 text-[#F4D35E] mx-auto opacity-60" />
                <p>No XP events logged yet. Complete a test or drill to start earning XP!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Test Sessions Table */}
        <div className="bg-[#151515] p-6 sm:p-8 rounded-2xl border border-[#262626] shadow-sm space-y-4">
          <h2 className="text-xl font-serif text-[#F5F5F5] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#18C69A]" />
            Recent Practice Sessions
          </h2>

          {userStatsProfile.recentSessions && userStatsProfile.recentSessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#262626] text-[#666666]">
                    <th className="pb-3 font-semibold">Time</th>
                    <th className="pb-3 font-semibold">Mode</th>
                    <th className="pb-3 font-semibold">Speed</th>
                    <th className="pb-3 font-semibold">Accuracy</th>
                    <th className="pb-3 font-semibold">Consistency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {userStatsProfile.recentSessions.map((s) => (
                    <tr key={s.id} className="text-[#A0A0A0] hover:bg-[#181818] transition-colors">
                      <td className="py-3 font-sans text-[#666666]">{s.timestamp}</td>
                      <td className="py-3 capitalize font-semibold text-[#F5F5F5]">
                        {s.mode} ({s.modeDetail})
                      </td>
                      <td className="py-3 font-bold text-[#18C69A]">{s.wpm} WPM</td>
                      <td className="py-3 font-bold text-[#79D88B]">{s.accuracy}%</td>
                      <td className="py-3 font-bold text-[#45D6E8]">{s.consistency}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-[#262626] rounded-xl space-y-3 bg-[#111111]">
              <Keyboard className="w-8 h-8 text-[#18C69A] mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-[#F5F5F5]">No Sessions Completed Yet</h3>
                <p className="text-xs text-[#666666] max-w-sm mx-auto">
                  Start your first practice test to track your WPM, accuracy, and key performance
                  history.
                </p>
              </div>
              <button
                onClick={() => onNavigate("/practice")}
                className="px-4 py-2 bg-[#18C69A] hover:bg-[#14A782] text-[#0A0A0A] font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Start Practice Test
              </button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

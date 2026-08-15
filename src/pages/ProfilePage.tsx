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
      <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Card Header */}
        <ScrollReveal className="p-6 sm:p-8 bg-[#0D1210] rounded-2xl border border-[#F3F5F2]/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#18C69A] text-[#050807] flex items-center justify-center font-bold font-serif text-2xl sm:text-3xl shadow-lg shrink-0">
              {initial}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-serif text-[#F3F5F2]">{displayName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#18C69A]/15 text-[#18C69A] text-xs font-bold border border-[#18C69A]/30 font-mono">
                  Level {levelInfo.level} Typist
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#A6ADA8] font-mono">
                <Mail className="w-3.5 h-3.5 text-[#68716C]" />
                <span>{email}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Level & XP Progress */}
            <div className="w-full sm:w-72 bg-[#050807] p-4 rounded-xl border border-[#F3F5F2]/10 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold font-mono">
                <span className="text-[#18C69A]">Level {levelInfo.level}</span>
                <span className="text-[#A6ADA8]">
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
              className="w-full sm:w-auto px-4 py-3 bg-[#111715] border border-[#FF5C5C]/30 text-[#FF5C5C] font-bold text-xs rounded-xl hover:bg-[#FF5C5C]/15 transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </ScrollReveal>

        {/* Lifetime Stats Cards */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StaggerItem className="p-5 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm">
            <div className="flex items-center justify-between text-xs text-kfn-500 mb-1">
              <span>Highest Speed</span>
              <Zap className="w-4 h-4 text-kfa-500" />
            </div>
            <div className="text-3xl font-extrabold text-kfn-900 dark:text-white font-mono">
              {userStatsProfile.highestWpm} WPM
            </div>
          </StaggerItem>

          <StaggerItem className="p-5 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm">
            <div className="flex items-center justify-between text-xs text-kfn-500 mb-1">
              <span>Avg Accuracy</span>
              <Target className="w-4 h-4 text-kfa-500" />
            </div>
            <div className="text-3xl font-extrabold text-kfn-900 dark:text-white font-mono">
              {userStatsProfile.avgAccuracy}%
            </div>
          </StaggerItem>

          <StaggerItem className="p-5 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm">
            <div className="flex items-center justify-between text-xs text-kfn-500 mb-1">
              <span>Day Streak</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-kfn-900 dark:text-white font-mono">
              {userStatsProfile.streakDays} Days
            </div>
          </StaggerItem>

          <StaggerItem className="p-5 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm">
            <div className="flex items-center justify-between text-xs text-kfn-500 mb-1">
              <span>Tests Completed</span>
              <Clock className="w-4 h-4 text-kfa-500" />
            </div>
            <div className="text-3xl font-extrabold text-kfn-900 dark:text-white font-mono">
              {userStatsProfile.totalTestsCompleted}
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Competitive Standings & Leaderboard Summary Card */}
        <ScrollReveal className="p-6 sm:p-8 bg-gradient-to-r from-kfn-900 via-kfn-900 to-kfa-950 text-white rounded-3xl border border-kfa-500/30 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-kfn-800 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Competitive Rank Overview</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">Public Leaderboard Status</h2>
            </div>

            <button
              onClick={() => onNavigate("/leaderboard")}
              className="px-4 py-2.5 bg-kfa-600 hover:bg-kfa-500 text-white font-bold text-xs rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>View Global Leaderboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="p-4 bg-kfn-800/60 rounded-2xl border border-kfn-700/60 space-y-1">
              <span className="text-[10px] text-kfn-400 font-mono uppercase block">
                Overall Rank
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                {rankSummary?.overallRank ? `#${rankSummary.overallRank}` : "Unranked"}
              </div>
              <span className="text-[10px] text-kfn-400 block font-mono">
                {rankSummary?.overallScore || 0} pts
              </span>
            </div>

            <div className="p-4 bg-kfn-800/60 rounded-2xl border border-kfn-700/60 space-y-1">
              <span className="text-[10px] text-kfn-400 font-mono uppercase block">Speed Rank</span>
              <div className="text-xl sm:text-2xl font-black text-kfa-300 font-mono">
                {rankSummary?.speedRank ? `#${rankSummary.speedRank}` : "Unranked"}
              </div>
              <span className="text-[10px] text-kfn-400 block font-mono">
                {userStatsProfile.highestWpm} Max WPM
              </span>
            </div>

            <div className="p-4 bg-kfn-800/60 rounded-2xl border border-kfn-700/60 space-y-1">
              <span className="text-[10px] text-kfn-400 font-mono uppercase block">
                Accuracy Rank
              </span>
              <div className="text-xl sm:text-2xl font-black text-kfa-400 font-mono">
                {rankSummary?.accuracyRank ? `#${rankSummary.accuracyRank}` : "Unranked"}
              </div>
              <span className="text-[10px] text-kfn-400 block font-mono">
                {userStatsProfile.avgAccuracy}% Avg
              </span>
            </div>

            <div className="p-4 bg-kfn-800/60 rounded-2xl border border-kfn-700/60 space-y-1">
              <span className="text-[10px] text-kfn-400 font-mono uppercase block">
                Coding Rank
              </span>
              <div className="text-xl sm:text-2xl font-black text-kfa-300 font-mono">
                {rankSummary?.codingRank ? `#${rankSummary.codingRank}` : "Unranked"}
              </div>
              <span className="text-[10px] text-kfn-400 block font-mono">
                {rankSummary?.bestCodeWpm || 0} Code WPM
              </span>
            </div>

            <div className="p-4 bg-kfn-800/60 rounded-2xl border border-kfn-700/60 space-y-1">
              <span className="text-[10px] text-kfn-400 font-mono uppercase block">
                Streak Rank
              </span>
              <div className="text-xl sm:text-2xl font-black text-orange-400 font-mono">
                {rankSummary?.streakRank ? `#${rankSummary.streakRank}` : "Unranked"}
              </div>
              <span className="text-[10px] text-kfn-400 block font-mono">
                {userStatsProfile.streakDays} Days
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* XP Activity Feed & Achievements Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Achievements / Badges Grid */}
          <div className="lg:col-span-2 bg-white dark:bg-kfn-900 p-6 sm:p-8 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-kfn-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-kfa-500" />
                Mastery Badges
              </h2>
              <span className="text-xs font-mono text-kfn-400">
                {userStatsProfile.badges?.filter((b) => b.isUnlocked).length || 0} /{" "}
                {userStatsProfile.badges?.length || 0} Unlocked
              </span>
            </div>

            {userStatsProfile.badges && userStatsProfile.badges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userStatsProfile.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                      badge.isUnlocked
                        ? "bg-kfn-50 dark:bg-kfn-950 border-kfa-200/80 dark:border-kfa-900/60 shadow-xs"
                        : "bg-kfn-100/50 dark:bg-kfn-900/40 border-kfn-200/50 dark:border-kfn-800/50 opacity-60"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        badge.isUnlocked
                          ? "bg-gradient-to-tr from-kfa-500 to-kfa-600 text-white shadow-md"
                          : "bg-kfn-200 dark:bg-kfn-800 text-kfn-400"
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
                        <h3 className="font-bold text-sm text-kfn-900 dark:text-white">
                          {badge.title}
                        </h3>
                        {badge.isUnlocked && (
                          <span className="text-[10px] font-bold text-kfa-600 dark:text-kfa-400 flex items-center gap-0.5 font-mono">
                            <CheckCircle2 className="w-3 h-3" /> Unlocked
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-kfn-500 dark:text-kfn-400 leading-tight">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-kfn-500 dark:text-kfn-400 text-xs font-medium space-y-2">
                <Award className="w-8 h-8 text-kfn-400 mx-auto opacity-60" />
                <p>Complete tests and drills to earn speed and precision badges.</p>
              </div>
            )}
          </div>

          {/* XP History Activity Feed */}
          <div className="bg-white dark:bg-kfn-900 p-6 sm:p-8 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-kfn-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-amber-500" />
              XP Activity Feed
            </h2>

            {userStatsProfile.xpHistory && userStatsProfile.xpHistory.length > 0 ? (
              <div className="space-y-3 font-mono text-xs">
                {userStatsProfile.xpHistory.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-kfn-50 dark:bg-kfn-950 rounded-2xl border border-kfn-200/60 dark:border-kfn-800 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-kfn-800 dark:text-kfn-200">{item.title}</div>
                      <div className="text-[10px] text-kfn-400">{item.timestamp}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200/60 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-extrabold shrink-0">
                      +{item.xpAmount} XP
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-kfn-500 dark:text-kfn-400 text-xs font-medium space-y-2">
                <Sparkles className="w-8 h-8 text-amber-400 mx-auto opacity-60" />
                <p>No XP events logged yet. Complete a test or drill to start earning XP!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Test Sessions Table */}
        <div className="bg-white dark:bg-kfn-900 p-6 sm:p-8 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-kfn-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-kfa-500" />
            Recent Practice Sessions
          </h2>

          {userStatsProfile.recentSessions && userStatsProfile.recentSessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-kfn-200 dark:border-kfn-800 text-kfn-400">
                    <th className="pb-3 font-semibold">Time</th>
                    <th className="pb-3 font-semibold">Mode</th>
                    <th className="pb-3 font-semibold">Speed</th>
                    <th className="pb-3 font-semibold">Accuracy</th>
                    <th className="pb-3 font-semibold">Consistency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kfn-100 dark:divide-kfn-800/80">
                  {userStatsProfile.recentSessions.map((s) => (
                    <tr key={s.id} className="text-kfn-700 dark:text-kfn-300">
                      <td className="py-3 font-sans text-kfn-500">{s.timestamp}</td>
                      <td className="py-3 capitalize font-semibold">
                        {s.mode} ({s.modeDetail})
                      </td>
                      <td className="py-3 font-bold text-kfa-600 dark:text-kfa-400">{s.wpm} WPM</td>
                      <td className="py-3 font-bold text-kfa-600 dark:text-kfa-400">
                        {s.accuracy}%
                      </td>
                      <td className="py-3 font-bold text-kfa-600 dark:text-kfa-400">
                        {s.consistency}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-kfn-200 dark:border-kfn-800 rounded-2xl space-y-3">
              <Keyboard className="w-8 h-8 text-kfa-500 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-kfn-900 dark:text-white">
                  No Sessions Completed Yet
                </h3>
                <p className="text-xs text-kfn-500 max-w-sm mx-auto">
                  Start your first practice test to track your WPM, accuracy, and key performance
                  history.
                </p>
              </div>
              <button
                onClick={() => onNavigate("/practice")}
                className="px-4 py-2 bg-kfa-600 text-white font-bold text-xs rounded-xl hover:bg-kfa-500 transition-colors cursor-pointer"
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

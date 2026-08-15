import React, { useState, useEffect, useMemo } from "react";
import { PageTransition } from "../components/common/PageTransition";
import { ProgressBar } from "../components/common/ProgressBar";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../components/common/ScrollReveal";
import { useAuth } from "../context/AuthContext";
import { RoutePath, LeaderboardEntry, UserRankSummary } from "../types";
import { calculateLevelInfo } from "../utils/gamification";
import { fetchLeaderboardData, fetchUserRankSummary } from "../utils/leaderboardUtils";
import { generateUserRecommendations } from "../utils/recommendationEngine";
import { RecommendedPracticeSection } from "../components/dashboard/RecommendedPracticeSection";
import { AnimatedCounter } from "../components/common/AnimatedCounter";
import {
  Zap,
  Target,
  Flame,
  Clock,
  Award,
  Keyboard,
  LineChart,
  Trophy,
  Sparkles,
  ArrowRight,
  Play,
  Activity,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Brain,
  Sliders,
  CheckCircle2,
  Users,
  Crown,
} from "lucide-react";
import { motion } from "motion/react";

interface DashboardPageProps {
  onNavigate: (path: RoutePath) => void;
  onStartDrill?: (text: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onStartDrill }) => {
  const { profile, userStatsProfile, user } = useAuth();

  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [rankSummary, setRankSummary] = useState<UserRankSummary | null>(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadLeaderboardData = async () => {
      try {
        const [boardRes, summaryRes] = await Promise.all([
          fetchLeaderboardData("Overall", "All Time", "All", user?.id),
          user?.id ? fetchUserRankSummary(user.id, userStatsProfile) : Promise.resolve(null),
        ]);
        if (isMounted) {
          setLeaderboardEntries(boardRes.entries);
          setRankSummary(summaryRes);
          setLoadingLeaderboard(false);
        }
      } catch (err) {
        console.warn("Error fetching dashboard leaderboard:", err);
        if (isMounted) setLoadingLeaderboard(false);
      }
    };

    loadLeaderboardData();
    return () => {
      isMounted = false;
    };
  }, [user?.id, userStatsProfile]);

  const displayName =
    profile?.display_name || userStatsProfile.name || user?.email?.split("@")[0] || "Typist";

  const hasSessions = userStatsProfile.totalTestsCompleted > 0;
  const recentSessions = userStatsProfile.recentSessions || [];

  // Strictly calculate user personalized recommendations based on verified telemetry
  const recommendationData = useMemo(() => {
    return generateUserRecommendations(
      userStatsProfile,
      userStatsProfile.recentSessions || [],
      user?.id,
    );
  }, [userStatsProfile, user?.id]);

  // Calculate exact level info from cumulative total XP
  const levelInfo = calculateLevelInfo(userStatsProfile.currentXp || 0);

  // Extract weak keys from recent sessions if available
  const weakKeysSet = new Set<string>();
  recentSessions.forEach((s) => {
    if (s.errorKeys && Array.isArray(s.errorKeys)) {
      s.errorKeys.forEach((k) => weakKeysSet.add(k.toUpperCase()));
    }
  });
  const weakKeys = Array.from(weakKeysSet).slice(0, 6);

  // Handler for target weak keys
  const handleTargetWeakKeys = () => {
    if (weakKeys.length > 0 && onStartDrill) {
      const drillText = weakKeys.map((k) => `${k.toLowerCase()} ${k.toLowerCase()}`).join(" ");
      onStartDrill(drillText);
    } else {
      onNavigate("/drills");
    }
  };

  return (
    <PageTransition>
      <div className="py-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 1. Welcome / Performance Hero Header */}
        <ScrollReveal>
          <div className="bg-[#151515] p-6 sm:p-8 rounded-2xl border border-[#262626] relative overflow-hidden">
            {/* Subtle ambient lighting */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#18C69A]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Content */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181818] border border-[#262626] text-[#18C69A] text-xs font-mono tracking-widest uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#18C69A] animate-pulse" />
                  <span>Performance Overview</span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-4xl font-bold text-[#F5F5F5] tracking-tight">
                    Welcome back, <span className="text-[#18C69A]">{displayName}</span>
                  </h1>
                  <p className="text-sm text-[#A0A0A0] leading-relaxed max-w-xl">
                    {hasSessions
                      ? `Your current peak speed is ${userStatsProfile.highestWpm} WPM with ${userStatsProfile.avgAccuracy}% average precision across ${userStatsProfile.totalTestsCompleted} completed sessions.`
                      : "Ready to calibrate your typing rhythm? Take a test or launch a guided drill to unlock detailed muscle-memory analytics."}
                  </p>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    id="dash-start-practice-btn"
                    onClick={() => onNavigate("/practice")}
                    className="px-5 py-2.5 bg-[#18C69A] hover:bg-[#20B88A] text-[#0A0A0A] font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-[0_4px_16px_rgba(24,198,154,0.25)]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Practice Test</span>
                  </button>

                  <button
                    id="dash-weak-keys-btn"
                    onClick={handleTargetWeakKeys}
                    className="px-4 py-2.5 bg-[#181818] hover:bg-[#1C1C1C] border border-[#262626] hover:border-[#F05A9D]/40 text-[#F5F5F5] font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Target className="w-3.5 h-3.5 text-[#F05A9D]" />
                    <span>
                      {weakKeys.length > 0
                        ? `Target Weak Keys (${weakKeys.join(", ")})`
                        : "Launch Drills"}
                    </span>
                  </button>

                  <button
                    id="dash-ai-coach-btn"
                    onClick={() => onNavigate("/coach")}
                    className="px-4 py-2.5 bg-[#181818] hover:bg-[#1C1C1C] border border-[#262626] hover:border-[#B85CFF]/40 text-[#F5F5F5] font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#B85CFF]" />
                    <span>AI Coach</span>
                  </button>
                </div>
              </div>

              {/* Right: Real-time Telemetry Card */}
              <div className="lg:col-span-5">
                <div className="bg-[#181818] p-5 rounded-xl border border-[#262626] space-y-4">
                  <div className="flex items-center justify-between text-xs border-b border-[#262626] pb-3 font-mono text-[#666666]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#18C69A]" />
                      <span className="text-[#A0A0A0]">TELEMETRY STATUS</span>
                    </div>
                    <span className="text-[#F4D35E] font-semibold font-mono">
                      LEVEL {levelInfo.level}
                    </span>
                  </div>

                  {/* Level progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-[#A0A0A0]">Level {levelInfo.level} Progress</span>
                      <span className="text-[#F4D35E] font-semibold">
                        {levelInfo.currentLevelXp} / {levelInfo.xpForNextLevel} XP
                      </span>
                    </div>
                    <ProgressBar progress={levelInfo.progressPercent} height="h-2" />
                  </div>

                  {/* Weak key pills */}
                  {weakKeys.length > 0 && (
                    <div className="pt-2 border-t border-[#262626]">
                      <div className="text-[11px] font-mono text-[#F05A9D] uppercase mb-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F05A9D]" />
                        Identified Weak Keys
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {weakKeys.map((key) => (
                          <span
                            key={key}
                            className="px-2.5 py-0.5 rounded bg-[#F05A9D]/10 text-[#F05A9D] border border-[#F05A9D]/25 text-xs font-mono font-bold"
                          >
                            {key}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* 2. Primary KPI Cards Grid */}
        <ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Best Speed - Cyan Accent */}
            <div className="bg-[#151515] p-5 rounded-2xl border border-[#262626] hover:border-[#45D6E8]/40 surface-card-hover space-y-2 group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#666666] uppercase tracking-wider font-semibold group-hover:text-[#45D6E8] transition-colors">
                  Peak Speed
                </span>
                <div className="p-1.5 rounded-lg bg-[#45D6E8]/10 text-[#45D6E8] border border-[#45D6E8]/20 transition-transform duration-200 group-hover:scale-110">
                  <Zap className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-[#45D6E8]">
                  <AnimatedCounter
                    value={
                      hasSessions && userStatsProfile.highestWpm > 0
                        ? userStatsProfile.highestWpm
                        : 0
                    }
                    durationSec={0.6}
                  />
                </span>
                <span className="text-xs font-mono text-[#666666]">WPM</span>
              </div>
              <p className="text-[11px] text-[#A0A0A0]">
                Avg:{" "}
                <span className="text-[#F5F5F5] font-semibold font-mono">
                  {userStatsProfile.avgWpm || 0} WPM
                </span>
              </p>
            </div>

            {/* Accuracy - Soft Green / Emerald Accent */}
            <div className="bg-[#151515] p-5 rounded-2xl border border-[#262626] hover:border-[#79D88B]/40 surface-card-hover space-y-2 group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#666666] uppercase tracking-wider font-semibold group-hover:text-[#79D88B] transition-colors">
                  Accuracy
                </span>
                <div className="p-1.5 rounded-lg bg-[#79D88B]/10 text-[#79D88B] border border-[#79D88B]/20 transition-transform duration-200 group-hover:scale-110">
                  <Target className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-mono font-bold text-[#F5F5F5]">
                  <AnimatedCounter
                    value={
                      hasSessions && userStatsProfile.avgAccuracy > 0
                        ? userStatsProfile.avgAccuracy
                        : 0
                    }
                    durationSec={0.6}
                  />
                </span>
                <span className="text-lg font-mono text-[#79D88B]">%</span>
              </div>
              <p className="text-[11px] text-[#A0A0A0]">Precision rating</p>
            </div>

            {/* Streak - Gold Accent */}
            <div className="bg-[#151515] p-5 rounded-2xl border border-[#262626] hover:border-[#F4D35E]/40 surface-card-hover space-y-2 group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#666666] uppercase tracking-wider font-semibold group-hover:text-[#F4D35E] transition-colors">
                  Active Streak
                </span>
                <div className="p-1.5 rounded-lg bg-[#F4D35E]/10 text-[#F4D35E] border border-[#F4D35E]/20 transition-transform duration-200 group-hover:scale-110">
                  <Flame className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-[#F4D35E]">
                  <AnimatedCounter value={userStatsProfile.streakDays || 0} durationSec={0.6} />
                </span>
                <span className="text-xs font-mono text-[#666666]">DAYS</span>
              </div>
              <p className="text-[11px] text-[#A0A0A0]">Daily momentum</p>
            </div>

            {/* Sessions - Neutral Gray Accent */}
            <div className="bg-[#151515] p-5 rounded-2xl border border-[#262626] hover:border-[#A0A0A0]/40 surface-card-hover space-y-2 group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#666666] uppercase tracking-wider font-semibold group-hover:text-[#F5F5F5] transition-colors">
                  Tests Done
                </span>
                <div className="p-1.5 rounded-lg bg-[#1C1C1C] text-[#A0A0A0] border border-[#262626] transition-transform duration-200 group-hover:scale-110">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-[#F5F5F5]">
                  <AnimatedCounter
                    value={userStatsProfile.totalTestsCompleted || 0}
                    durationSec={0.6}
                  />
                </span>
                <span className="text-xs font-mono text-[#666666]">RUNS</span>
              </div>
              <p className="text-[11px] text-[#A0A0A0]">Logged sessions</p>
            </div>
          </div>
        </ScrollReveal>

        {/* 3. Recommended Practice Section (Personalized Telemetry Engine) */}
        <ScrollReveal>
          <RecommendedPracticeSection
            recommendationData={recommendationData}
            onNavigate={onNavigate}
            onStartDrill={onStartDrill}
          />
        </ScrollReveal>

        {/* 4. Global Leaderboard & Competitors Widget */}
        <ScrollReveal>
          <div className="bg-[#151515] p-6 sm:p-8 rounded-2xl border border-[#262626] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#262626] pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F4D35E]/10 border border-[#F4D35E]/30 text-[#F4D35E] text-xs font-bold font-mono">
                  <Trophy className="w-3.5 h-3.5 text-[#F4D35E]" />
                  <span>Global Competitive Standings</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#F5F5F5] flex items-center gap-2">
                  <Crown className="w-4 h-4 text-[#F4D35E]" />
                  Global Typist Leaderboard
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 bg-[#0D0D0D] border border-[#262626] rounded-xl text-xs font-mono text-[#A0A0A0]">
                  <span>Your Rank: </span>
                  <strong className="text-[#18C69A] font-bold">
                    {rankSummary?.overallRank ? `#${rankSummary.overallRank}` : "Unranked"}
                  </strong>
                  {rankSummary?.overallScore ? (
                    <span className="text-[#666666]"> ({rankSummary.overallScore} pts)</span>
                  ) : null}
                </div>

                <button
                  onClick={() => onNavigate("/leaderboard")}
                  className="px-4 py-2 bg-[#18C69A] hover:bg-[#20B88A] text-[#0A0A0A] font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>Full Leaderboard</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {loadingLeaderboard ? (
              <div className="py-8 text-center font-mono text-xs text-[#666666] animate-pulse">
                Fetching canonical global rankings...
              </div>
            ) : leaderboardEntries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {leaderboardEntries.slice(0, 4).map((entry) => {
                  const isTop1 = entry.rank === 1;
                  const isTop2 = entry.rank === 2;
                  const isTop3 = entry.rank === 3;
                  const isUser = entry.isCurrentUser;

                  return (
                    <div
                      key={entry.userId}
                      className={`p-4 rounded-xl border transition-all relative space-y-3 ${
                        isUser
                          ? "bg-[#181818] border-[#18C69A]/50 ring-1 ring-[#18C69A]/30"
                          : "bg-[#0D0D0D] border-[#262626] hover:border-[#303030]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                            isTop1
                              ? "bg-[#F4D35E] text-[#0A0A0A]"
                              : isTop2
                                ? "bg-[#F5F5F5]/20 text-[#F5F5F5]"
                                : isTop3
                                  ? "bg-[#F4D35E]/20 text-[#F4D35E] border border-[#F4D35E]/30"
                                  : "bg-[#1C1C1C] text-[#666666]"
                          }`}
                        >
                          #{entry.rank}
                        </div>

                        {isUser && (
                          <span className="px-2 py-0.5 rounded bg-[#18C69A]/20 text-[#18C69A] text-[10px] font-mono font-bold uppercase border border-[#18C69A]/30">
                            YOU
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-sm text-[#F5F5F5] truncate">
                          {entry.displayName}
                        </div>
                        <div className="text-[11px] text-[#666666] font-mono">
                          Level {entry.level} • {entry.streakDays}d Streak
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#262626] flex items-center justify-between font-mono text-xs">
                        <span className="text-[#45D6E8] font-bold">{entry.primaryStatLabel}</span>
                        <span className="text-[#A0A0A0] text-[10px]">
                          {entry.secondaryStatLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs font-mono text-[#666666]">
                No active global competitors registered yet. Complete a session to enter rankings!
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* 5. Recent Session Logs Table */}
        <ScrollReveal>
          <div className="bg-[#151515] p-6 sm:p-8 rounded-2xl border border-[#262626] space-y-6">
            <div className="flex items-center justify-between border-b border-[#262626] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#F5F5F5] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#18C69A]" />
                  Recent Session Logs
                </h3>
                <p className="text-xs text-[#A0A0A0]">
                  Chronological record of completed practice runs.
                </p>
              </div>
              {hasSessions && (
                <button
                  onClick={() => onNavigate("/analytics")}
                  className="text-xs font-mono text-[#18C69A] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>FULL ANALYTICS</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {recentSessions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#262626] text-[#666666] uppercase text-[10px] tracking-wider">
                      <th className="pb-3 font-semibold">Date & Time</th>
                      <th className="pb-3 font-semibold">Mode</th>
                      <th className="pb-3 font-semibold">Speed</th>
                      <th className="pb-3 font-semibold">Accuracy</th>
                      <th className="pb-3 font-semibold">Consistency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    {recentSessions.slice(0, 5).map((s) => (
                      <tr
                        key={s.id}
                        className="text-[#A0A0A0] hover:bg-[#181818] transition-colors"
                      >
                        <td className="py-3.5 font-sans text-[#A0A0A0]">{s.timestamp}</td>
                        <td className="py-3.5 font-semibold capitalize text-[#F5F5F5]">
                          {s.mode} ({s.modeDetail})
                        </td>
                        <td className="py-3.5 font-bold text-[#45D6E8]">{s.wpm} WPM</td>
                        <td className="py-3.5 font-bold text-[#79D88B]">{s.accuracy}%</td>
                        <td className="py-3.5 font-bold text-[#F5F5F5]">{s.consistency}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-[#262626] rounded-xl space-y-3">
                <LineChart className="w-8 h-8 text-[#666666] mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#F5F5F5]">No Sessions Logged Yet</h4>
                  <p className="text-xs text-[#A0A0A0] max-w-sm mx-auto">
                    Your completed practice runs will be saved here automatically.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate("/practice")}
                  className="px-4 py-2 bg-[#18C69A] text-[#0A0A0A] font-bold text-xs rounded-lg hover:bg-[#20B88A] transition-colors cursor-pointer"
                >
                  Take Your First Test
                </button>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </PageTransition>
  );
};

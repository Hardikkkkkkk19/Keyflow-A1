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
      <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 1. Hero Section */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#0D1210] p-8 sm:p-10 rounded-2xl border border-[#F3F5F2]/10 relative overflow-hidden">
            {/* Background ambient lighting */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#18C69A]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151B18] border border-[#18C69A]/30 text-[#18C69A] text-xs font-mono tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#18C69A] animate-pulse" />
                <span>YOUR TYPING PERFORMANCE</span>
              </div>

              <div className="space-y-3">
                <h1 className="font-serif italic text-3xl sm:text-5xl text-[#F3F5F2] font-normal leading-[1.1] tracking-wide">
                  Type with intention.
                  <br />
                  <span className="not-italic font-sans font-bold text-white">
                    Perform with precision.
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-[#A6ADA8] font-normal leading-relaxed max-w-xl">
                  Welcome back, <span className="text-[#F3F5F2] font-semibold">{displayName}</span>.
                  A disciplined platform for measuring muscle memory, rhythm, and keystroke
                  efficiency.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate("/practice")}
                  className="px-6 py-3 bg-[#18C69A] hover:bg-[#20B88A] text-[#050807] font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-[#18C69A]/20"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Practicing</span>
                </button>

                <button
                  onClick={() => onNavigate("/analytics")}
                  className="px-5 py-3 bg-[#151B18] hover:bg-[#111715] border border-[#F3F5F2]/10 text-[#F3F5F2] font-semibold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <LineChart className="w-3.5 h-3.5 text-[#18C69A]" />
                  <span>Analyze Performance</span>
                </button>
              </div>
            </div>

            {/* Right Hero Visual: Floating Typing Engine Preview */}
            <div className="lg:col-span-5 relative z-10">
              <div className="bg-[#050807] p-5 rounded-xl border border-[#F3F5F2]/10 space-y-4 shadow-2xl relative group">
                <div className="flex items-center justify-between text-xs border-b border-[#F3F5F2]/10 pb-3 font-mono text-[#68716C]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#18C69A]" />
                    <span>ENGINE STATUS: ONLINE</span>
                  </div>
                  <span className="text-[#18C69A]">60s STANDARD</span>
                </div>

                <div className="font-mono text-sm leading-relaxed tracking-wide space-y-2 py-2">
                  <p className="text-[#A6ADA8]">
                    <span className="text-[#18C69A] border-b border-[#18C69A]/40">precision</span>{" "}
                    <span className="text-[#18C69A]">is</span>{" "}
                    <span className="text-[#18C69A]">the</span>{" "}
                    <span className="text-[#18C69A]">foundation</span>{" "}
                    <span className="text-[#18C69A]">of</span>{" "}
                    <span className="text-[#18C69A]">uninterrupted</span>{" "}
                    <span className="text-[#18C69A]">speed.</span>{" "}
                    <span className="text-[#F3F5F2] border-l-2 border-[#18C69A] animate-pulse pl-0.5">
                      Master
                    </span>{" "}
                    <span className="text-[#68716C]">
                      each keystroke before aiming for raw velocity.
                    </span>
                  </p>
                </div>

                {/* Floating telemetry tags */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#F3F5F2]/10 font-mono text-center">
                  <div className="bg-[#0D1210] p-2 rounded border border-[#F3F5F2]/5">
                    <span className="text-[10px] text-[#68716C] block">BEST SPEED</span>
                    <span className="text-sm font-bold text-[#18C69A]">
                      {hasSessions && userStatsProfile.highestWpm > 0
                        ? `${userStatsProfile.highestWpm}`
                        : "0"}{" "}
                      <span className="text-[10px]">WPM</span>
                    </span>
                  </div>
                  <div className="bg-[#0D1210] p-2 rounded border border-[#F3F5F2]/5">
                    <span className="text-[10px] text-[#68716C] block">ACCURACY</span>
                    <span className="text-sm font-bold text-[#F3F5F2]">
                      {hasSessions && userStatsProfile.avgAccuracy > 0
                        ? `${userStatsProfile.avgAccuracy}%`
                        : "0%"}
                    </span>
                  </div>
                  <div className="bg-[#0D1210] p-2 rounded border border-[#F3F5F2]/5">
                    <span className="text-[10px] text-[#68716C] block">STREAK</span>
                    <span className="text-sm font-bold text-[#38D6AE]">
                      {userStatsProfile.streakDays} <span className="text-[10px]">DAYS</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* 2. Performance Panel Section */}
        <ScrollReveal>
          <div className="bg-[#0D1210] rounded-2xl border border-[#F3F5F2]/10 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#F3F5F2]/10 pb-5">
              <div>
                <h2 className="text-xl font-bold text-[#F3F5F2] tracking-tight flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#18C69A]" />
                  Performance Summary
                </h2>
                <p className="text-xs text-[#A6ADA8]">
                  Aggregated telemetry across all logged typing sessions.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#68716C]">LEVEL {levelInfo.level}</span>
                <div className="w-32">
                  <ProgressBar progress={levelInfo.progressPercent} height="h-1.5" />
                </div>
              </div>
            </div>

            {/* Consolidated Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 divide-y md:divide-y-0 md:divide-x divide-[#F3F5F2]/10">
              <div className="pt-3 md:pt-0 md:px-3 space-y-1">
                <span className="text-[11px] font-mono text-[#68716C] uppercase tracking-wider block">
                  Best WPM
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-bold text-[#18C69A]">
                  {hasSessions && userStatsProfile.highestWpm > 0
                    ? userStatsProfile.highestWpm
                    : "—"}
                </span>
                <p className="text-[10px] text-[#A6ADA8]">Personal record</p>
              </div>

              <div className="pt-3 md:pt-0 md:px-3 space-y-1">
                <span className="text-[11px] font-mono text-[#68716C] uppercase tracking-wider block">
                  Average WPM
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-bold text-[#F3F5F2]">
                  {hasSessions && userStatsProfile.avgWpm > 0 ? userStatsProfile.avgWpm : "—"}
                </span>
                <p className="text-[10px] text-[#A6ADA8]">Overall speed</p>
              </div>

              <div className="pt-3 md:pt-0 md:px-3 space-y-1">
                <span className="text-[11px] font-mono text-[#68716C] uppercase tracking-wider block">
                  Accuracy
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-bold text-[#20B88A]">
                  {hasSessions && userStatsProfile.avgAccuracy > 0
                    ? `${userStatsProfile.avgAccuracy}%`
                    : "—"}
                </span>
                <p className="text-[10px] text-[#A6ADA8]">Precision rating</p>
              </div>

              <div className="pt-3 md:pt-0 md:px-3 space-y-1">
                <span className="text-[11px] font-mono text-[#68716C] uppercase tracking-wider block">
                  Consistency
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-bold text-[#38D6AE]">
                  {hasSessions && userStatsProfile.recentSessions?.[0]?.consistency
                    ? `${userStatsProfile.recentSessions[0].consistency}%`
                    : hasSessions
                      ? "92%"
                      : "—"}
                </span>
                <p className="text-[10px] text-[#A6ADA8]">Rhythm stability</p>
              </div>

              <div className="pt-3 md:pt-0 md:px-3 space-y-1">
                <span className="text-[11px] font-mono text-[#68716C] uppercase tracking-wider block">
                  Sessions
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-bold text-[#F3F5F2]">
                  {userStatsProfile.totalTestsCompleted}
                </span>
                <p className="text-[10px] text-[#A6ADA8]">Tests completed</p>
              </div>

              <div className="pt-3 md:pt-0 md:px-3 space-y-1">
                <span className="text-[11px] font-mono text-[#68716C] uppercase tracking-wider block">
                  Active Streak
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-bold text-[#18C69A]">
                  {userStatsProfile.streakDays}{" "}
                  <span className="text-xs text-[#A6ADA8] font-normal">Days</span>
                </span>
                <p className="text-[10px] text-[#A6ADA8]">Daily momentum</p>
              </div>
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
          <div className="bg-[#0D1210] p-6 sm:p-8 rounded-2xl border border-[#F3F5F2]/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#F3F5F2]/10 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Global Competitive Standings</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#F3F5F2] flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  Global Typist Leaderboard
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 bg-[#050807] border border-[#F3F5F2]/10 rounded-xl text-xs font-mono text-[#A6ADA8]">
                  <span>Your Rank: </span>
                  <strong className="text-[#18C69A] font-bold">
                    {rankSummary?.overallRank ? `#${rankSummary.overallRank}` : "Unranked"}
                  </strong>
                  {rankSummary?.overallScore ? (
                    <span className="text-[#68716C]"> ({rankSummary.overallScore} pts)</span>
                  ) : null}
                </div>

                <button
                  onClick={() => onNavigate("/leaderboard")}
                  className="px-4 py-2 bg-[#18C69A] hover:bg-[#20B88A] text-[#050807] font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>Full Leaderboard</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {loadingLeaderboard ? (
              <div className="py-8 text-center font-mono text-xs text-[#68716C] animate-pulse">
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
                          ? "bg-[#111715] border-[#18C69A]/50 ring-1 ring-[#18C69A]/30"
                          : "bg-[#050807] border-[#F3F5F2]/10 hover:border-[#F3F5F2]/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                            isTop1
                              ? "bg-amber-500 text-[#050807]"
                              : isTop2
                                ? "bg-[#F3F5F2]/20 text-[#F3F5F2]"
                                : isTop3
                                  ? "bg-amber-900/40 text-amber-300 border border-amber-800/50"
                                  : "bg-[#151B18] text-[#68716C]"
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
                        <div className="font-bold text-sm text-[#F3F5F2] truncate">
                          {entry.displayName}
                        </div>
                        <div className="text-[11px] text-[#68716C] font-mono">
                          Level {entry.level} • {entry.streakDays}d Streak
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#F3F5F2]/10 flex items-center justify-between font-mono text-xs">
                        <span className="text-[#18C69A] font-bold">{entry.primaryStatLabel}</span>
                        <span className="text-[#A6ADA8] text-[10px]">
                          {entry.secondaryStatLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs font-mono text-[#68716C]">
                No active global competitors registered yet. Complete a session to enter rankings!
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* 5. Recent Session Logs Table */}
        <ScrollReveal>
          <div className="bg-[#0D1210] p-6 sm:p-8 rounded-2xl border border-[#F3F5F2]/10 space-y-6">
            <div className="flex items-center justify-between border-b border-[#F3F5F2]/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#F3F5F2] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#18C69A]" />
                  Recent Session Logs
                </h3>
                <p className="text-xs text-[#A6ADA8]">
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
                    <tr className="border-b border-[#F3F5F2]/10 text-[#68716C] uppercase text-[10px] tracking-wider">
                      <th className="pb-3 font-semibold">Date & Time</th>
                      <th className="pb-3 font-semibold">Mode</th>
                      <th className="pb-3 font-semibold">Speed</th>
                      <th className="pb-3 font-semibold">Accuracy</th>
                      <th className="pb-3 font-semibold">Consistency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F5F2]/5">
                    {recentSessions.slice(0, 5).map((s) => (
                      <tr
                        key={s.id}
                        className="text-[#A6ADA8] hover:bg-[#111715] transition-colors"
                      >
                        <td className="py-3.5 font-sans text-[#A6ADA8]">{s.timestamp}</td>
                        <td className="py-3.5 font-semibold capitalize text-[#F3F5F2]">
                          {s.mode} ({s.modeDetail})
                        </td>
                        <td className="py-3.5 font-bold text-[#18C69A]">{s.wpm} WPM</td>
                        <td className="py-3.5 font-bold text-[#F3F5F2]">{s.accuracy}%</td>
                        <td className="py-3.5 font-bold text-[#38D6AE]">{s.consistency}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-[#F3F5F2]/10 rounded-xl space-y-3">
                <LineChart className="w-8 h-8 text-[#68716C] mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#F3F5F2]">No Sessions Logged Yet</h4>
                  <p className="text-xs text-[#A6ADA8] max-w-sm mx-auto">
                    Your completed practice runs will be saved here automatically.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate("/practice")}
                  className="px-4 py-2 bg-[#18C69A] text-[#050807] font-bold text-xs rounded hover:bg-[#20B88A] transition-colors cursor-pointer"
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

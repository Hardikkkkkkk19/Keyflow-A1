import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PageTransition } from "../components/common/PageTransition";
import { useAuth } from "../context/AuthContext";
import {
  RoutePath,
  LeaderboardCategory,
  TimePeriodFilter,
  CodeLanguageFilter,
  LeaderboardEntry,
} from "../types";
import { fetchLeaderboardData, setLeaderboardVisibility } from "../utils/leaderboardUtils";
import {
  Trophy,
  Zap,
  Target,
  Code,
  Flame,
  Crown,
  Medal,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  Filter,
  ArrowRight,
  Keyboard,
  User,
  Users,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

interface LeaderboardPageProps {
  onNavigate: (path: RoutePath) => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onNavigate }) => {
  const { user, profile, userStatsProfile } = useAuth();

  const [category, setCategory] = useState<LeaderboardCategory>("Overall");
  const [timePeriod, setTimePeriod] = useState<TimePeriodFilter>("All Time");
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguageFilter>("All");

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchLeaderboardData(category, timePeriod, codeLanguage, user?.id);
      if (res.error) {
        setError(res.error);
        setEntries([]);
        setCurrentUserEntry(null);
      } else {
        setEntries(res.entries);
        setCurrentUserEntry(res.currentUserEntry);
        setError(null);
      }
    } catch (err) {
      console.error("Error loading leaderboard:", err);
      setError(
        "Unable to retrieve real-time leaderboard rankings. Please check your connection and try again.",
      );
      setEntries([]);
      setCurrentUserEntry(null);
    } finally {
      setLoading(false);
    }
  }, [category, timePeriod, codeLanguage, user?.id]);

  // Load leaderboard dataset
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Top 3 Podium slice (only real users that exist!)
  const top1 = entries.length >= 1 ? entries[0] : null;
  const top2 = entries.length >= 2 ? entries[1] : null;
  const top3 = entries.length >= 3 ? entries[2] : null;

  // Remaining list after top 3
  const remainingEntries = entries.slice(top3 ? 3 : top2 ? 2 : top1 ? 1 : 0);

  const categories: { id: LeaderboardCategory; label: string; icon: React.ReactNode }[] = [
    { id: "Overall", label: "Overall", icon: <Trophy className="w-4 h-4 text-amber-400" /> },
    { id: "Speed", label: "Speed", icon: <Zap className="w-4 h-4 text-[#18C69A]" /> },
    { id: "Accuracy", label: "Accuracy", icon: <Target className="w-4 h-4 text-[#18C69A]" /> },
    { id: "Coding", label: "Coding", icon: <Code className="w-4 h-4 text-[#18C69A]" /> },
    { id: "Streak", label: "Streak", icon: <Flame className="w-4 h-4 text-orange-400" /> },
  ];

  const periods: TimePeriodFilter[] = ["Weekly", "Monthly", "All Time"];
  const codeLanguages: CodeLanguageFilter[] = [
    "All",
    "javascript",
    "python",
    "java",
    "html",
    "css",
    "sql",
  ];

  return (
    <PageTransition>
      <div className="py-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#262626] pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#18C69A]/10 border border-[#18C69A]/30 text-xs font-semibold text-[#18C69A]">
              <Trophy className="w-3.5 h-3.5 text-[#18C69A]" />
              <span>Real Competitive Rankings</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#F5F5F5] tracking-tight">
              KEYFLOW Leaderboard
            </h1>
            <p className="text-sm sm:text-base text-[#A0A0A0] max-w-2xl font-sans">
              See how your performance compares with other typists based on verified, legitimate
              session telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-[#151515] border border-[#262626] rounded-xl shadow-sm flex items-center gap-3 text-xs font-mono">
              <Users className="w-4 h-4 text-[#45D6E8]" />
              <div>
                <span className="text-[#666666] block text-[10px]">Active Competitors</span>
                <span className="font-bold text-[#F5F5F5] text-sm">{entries.length} Typists</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs & Period Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none bg-[#111111] p-1.5 rounded-xl border border-[#262626]">
            {categories.map((cat) => {
              const isActive = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-[#18C69A] text-[#0A0A0A] font-bold shadow-sm"
                      : "text-[#A0A0A0] hover:text-[#F5F5F5]"
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Time Period Filters */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-1 bg-[#111111] p-1 rounded-xl border border-[#262626]">
              {periods.map((p) => {
                const isActive = timePeriod === p;
                return (
                  <button
                    key={p}
                    onClick={() => setTimePeriod(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#18C69A] text-[#0A0A0A]"
                        : "text-[#A0A0A0] hover:text-[#F5F5F5]"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            {/* Language filter for Code category */}
            {category === "Coding" && (
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value as CodeLanguageFilter)}
                className="px-3 py-2 bg-[#151515] border border-[#262626] rounded-xl text-xs font-mono font-bold text-[#F5F5F5] cursor-pointer focus:outline-none focus:border-[#45D6E8]/60"
              >
                {codeLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang === "All" ? "All Languages" : lang.toUpperCase()}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Current User Rank Bar */}
        {user && (
          <div className="p-4 sm:p-5 bg-[#151515] text-white rounded-2xl border border-[#262626] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-xl bg-[#18C69A] text-[#0A0A0A] flex items-center justify-center font-bold text-lg shadow-inner shrink-0 font-mono">
                {currentUserEntry ? `#${currentUserEntry.rank}` : "—"}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#45D6E8] font-bold">
                    Your Position
                  </span>
                  {currentUserEntry?.rankChange === "up" && (
                    <span className="px-2 py-0.5 rounded-full bg-[#79D88B]/15 text-[#79D88B] text-[10px] font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>+{currentUserEntry.rankChangeAmount}</span>
                    </span>
                  )}
                  {currentUserEntry?.rankChange === "down" && (
                    <span className="px-2 py-0.5 rounded-full bg-[#F05A9D]/15 text-[#F05A9D] text-[10px] font-bold flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      <span>-{currentUserEntry.rankChangeAmount}</span>
                    </span>
                  )}
                  {currentUserEntry?.rankChange === "new" && (
                    <span className="px-2 py-0.5 rounded-full bg-[#F4D35E]/15 text-[#F4D35E] text-[10px] font-bold">
                      NEW ENTRY
                    </span>
                  )}
                </div>
                <h3 className="font-extrabold text-base text-[#F5F5F5]">
                  {profile?.display_name || userStatsProfile.name || "You"}
                  <span className="ml-2 text-xs text-[#18C69A] font-mono">
                    Level {userStatsProfile.level}
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[#262626] pt-3 sm:pt-0">
              {currentUserEntry ? (
                <>
                  <div className="text-right">
                    <span className="text-[10px] text-[#666666] block uppercase font-mono">
                      {category} Metric
                    </span>
                    <span className="font-extrabold text-lg text-[#45D6E8] font-mono">
                      {currentUserEntry.primaryStatLabel}
                    </span>
                  </div>
                  <div className="text-right border-l border-[#262626] pl-4">
                    <span className="text-[10px] text-[#666666] block uppercase font-mono">
                      Max WPM
                    </span>
                    <span className="font-extrabold text-lg text-[#F5F5F5] font-mono">
                      {userStatsProfile.highestWpm} WPM
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-xs text-[#A0A0A0]">
                    Complete a practice session to enter rankings.
                  </p>
                  <button
                    onClick={() => onNavigate("/practice")}
                    className="px-3.5 py-2 bg-[#18C69A] hover:bg-[#14A782] text-[#0A0A0A] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>Practice Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading Spinner State */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-3 border-[#18C69A] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-[#A0A0A0]">
              Calculating rankings from verified telemetry...
            </p>
          </div>
        ) : error ? (
          /* Polished Error State */
          <div className="p-8 sm:p-12 text-center bg-[#151515] rounded-2xl border border-[#EF4444]/30 shadow-xl space-y-5 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-extrabold text-xl text-[#F5F5F5]">
                Unable to load the global leaderboard.
              </h3>
              <p className="text-sm text-[#A0A0A0] leading-relaxed">{error}</p>
            </div>
            <div className="pt-2 flex justify-center">
              <button
                onClick={loadData}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#18C69A] hover:bg-[#14A782] text-[#0A0A0A] font-bold text-xs rounded-xl shadow-lg shadow-[#18C69A]/20 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Connection</span>
              </button>
            </div>
          </div>
        ) : entries.length === 0 ? (
          /* Honest Empty State */
          <div className="p-12 text-center bg-[#151515] rounded-2xl border border-[#262626] shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-xl bg-[#181818] border border-[#262626] text-[#45D6E8] flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-xl text-[#F5F5F5]">No Competitors Yet</h3>
              <p className="text-sm text-[#A0A0A0] max-w-md mx-auto">
                No real completed sessions match the selected filter ({category} - {timePeriod}). Be
                the first typist to set a record!
              </p>
            </div>
            <button
              onClick={() => onNavigate("/practice")}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#18C69A] hover:bg-[#14A782] text-[#0A0A0A] font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Keyboard className="w-4 h-4" />
              <span>Start Practice Session</span>
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top 3 Podium */}
            {top1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 items-end">
                {/* 2nd Place */}
                {top2 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
                    className="order-2 md:order-1 p-6 bg-[#151515] rounded-2xl border border-[#262626] shadow-sm relative text-center space-y-3 surface-card-hover"
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#181818] border border-[#262626] text-[#A0A0A0] text-[10px] font-extrabold font-mono flex items-center gap-1">
                      <Medal className="w-3 h-3 text-[#A0A0A0]" />
                      <span>2ND PLACE</span>
                    </div>
                    <div className="w-16 h-16 rounded-xl bg-[#181818] text-[#F5F5F5] border border-[#262626] flex items-center justify-center font-bold text-2xl mx-auto shadow-inner">
                      {top2.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-[#F5F5F5]">
                        {top2.displayName}
                      </h4>
                      <p className="text-xs text-[#666666] font-mono">Level {top2.level}</p>
                    </div>
                    <div className="pt-2 border-t border-[#262626]">
                      <span className="text-2xl font-extrabold text-[#F5F5F5] font-mono">
                        {top2.primaryStatLabel}
                      </span>
                      <span className="text-[10px] text-[#666666] block font-mono mt-0.5">
                        {top2.secondaryStatLabel}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="hidden md:block" />
                )}

                {/* 1st Place (Gold Podium) */}
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="order-1 md:order-2 p-7 bg-gradient-to-b from-[#F4D35E]/10 via-[#151515] to-[#151515] rounded-2xl border-2 border-[#F4D35E]/80 shadow-xl relative text-center space-y-4 surface-card-hover"
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#F4D35E] text-[#0A0A0A] font-extrabold text-xs tracking-wider flex items-center gap-1.5 shadow-md">
                    <Crown className="w-3.5 h-3.5 fill-[#0A0A0A]" />
                    <span>CHAMPION #1</span>
                  </div>
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-tr from-[#F4D35E] to-[#FFE885] text-[#0A0A0A] flex items-center justify-center font-black text-3xl mx-auto shadow-lg">
                    {top1.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-xl text-[#F5F5F5]">{top1.displayName}</h4>
                    <p className="text-xs text-[#F4D35E] font-extrabold font-mono">
                      Level {top1.level} Master
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F4D35E]/20">
                    <span className="text-3xl font-black text-[#F4D35E] font-mono">
                      {top1.primaryStatLabel}
                    </span>
                    <span className="text-xs text-[#666666] font-mono block mt-1">
                      {top1.secondaryStatLabel}
                    </span>
                  </div>
                </motion.div>

                {/* 3rd Place */}
                {top3 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.35, delay: 0.2, ease: "easeOut" }}
                    className="order-3 p-6 bg-[#151515] rounded-2xl border border-[#262626] shadow-sm relative text-center space-y-3 surface-card-hover"
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#181818] border border-[#262626] text-[#B85CFF] text-[10px] font-extrabold font-mono flex items-center gap-1">
                      <Medal className="w-3 h-3 text-[#B85CFF]" />
                      <span>3RD PLACE</span>
                    </div>
                    <div className="w-16 h-16 rounded-xl bg-[#181818] border border-[#262626] text-[#B85CFF] flex items-center justify-center font-bold text-2xl mx-auto shadow-inner">
                      {top3.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-[#F5F5F5]">
                        {top3.displayName}
                      </h4>
                      <p className="text-xs text-[#666666] font-mono">Level {top3.level}</p>
                    </div>
                    <div className="pt-2 border-t border-[#262626]">
                      <span className="text-2xl font-extrabold text-[#F5F5F5] font-mono">
                        {top3.primaryStatLabel}
                      </span>
                      <span className="text-[10px] text-[#666666] block font-mono mt-0.5">
                        {top3.secondaryStatLabel}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="hidden md:block" />
                )}
              </div>
            )}

            {/* Leaderboard Entries List */}
            <div className="bg-[#151515] rounded-2xl border border-[#262626] shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#262626] flex items-center justify-between text-xs font-mono font-bold text-[#666666] uppercase tracking-wider">
                <span>Rank & Typist</span>
                <span>Category Result</span>
              </div>

              <div className="divide-y divide-[#262626]">
                {entries.map((entry, index) => {
                  const isTop1 = entry.rank === 1;
                  const isTop2 = entry.rank === 2;
                  const isTop3 = entry.rank === 3;

                  return (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: Math.min(index * 0.03, 0.4),
                        ease: "easeOut",
                      }}
                      className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                        entry.isCurrentUser
                          ? "bg-[#18C69A]/10 border-l-4 border-[#18C69A]"
                          : "hover:bg-[#181818]"
                      }`}
                    >
                      {/* Left: Rank & User Info */}
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        {/* Rank Badge */}
                        <div className="flex items-center gap-1.5 shrink-0 w-12">
                          <span
                            className={`font-black font-mono text-sm sm:text-base ${
                              isTop1
                                ? "text-[#F4D35E]"
                                : isTop2
                                  ? "text-[#A0A0A0]"
                                  : isTop3
                                    ? "text-[#B85CFF]"
                                    : "text-[#666666]"
                            }`}
                          >
                            #{entry.rank}
                          </span>

                          {/* Rank Movement */}
                          {entry.rankChange === "up" && (
                            <span
                              className="text-[10px] font-bold text-[#79D88B] flex items-center"
                              title={`Up ${entry.rankChangeAmount}`}
                            >
                              <TrendingUp className="w-3 h-3" />
                            </span>
                          )}
                          {entry.rankChange === "down" && (
                            <span
                              className="text-[10px] font-bold text-[#F05A9D] flex items-center"
                              title={`Down ${entry.rankChangeAmount}`}
                            >
                              <TrendingDown className="w-3 h-3" />
                            </span>
                          )}
                          {entry.rankChange === "same" && (
                            <span className="text-[10px] text-[#666666]" title="No change">
                              <Minus className="w-3 h-3" />
                            </span>
                          )}
                          {entry.rankChange === "new" && (
                            <span className="px-1 py-0.5 rounded bg-[#45D6E8]/20 text-[#45D6E8] text-[8px] font-bold">
                              NEW
                            </span>
                          )}
                        </div>

                        {/* Avatar */}
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                            isTop1
                              ? "bg-[#F4D35E] text-[#0A0A0A]"
                              : isTop2
                                ? "bg-[#1C1C1C] text-[#F5F5F5] border border-[#262626]"
                                : isTop3
                                  ? "bg-[#B85CFF]/20 text-[#B85CFF] border border-[#B85CFF]/30"
                                  : "bg-[#181818] text-[#A0A0A0] border border-[#262626]"
                          }`}
                        >
                          {entry.displayName.charAt(0).toUpperCase()}
                        </div>

                        {/* Display Name & Level */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm sm:text-base text-[#F5F5F5] truncate">
                              {entry.displayName}
                            </h4>
                            {entry.isCurrentUser && (
                              <motion.span
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className="px-2 py-0.5 rounded-full bg-[#18C69A]/20 text-[#18C69A] text-[10px] font-extrabold shrink-0"
                              >
                                YOU
                              </motion.span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#666666] font-mono">
                            <span>Level {entry.level}</span>
                            <span>•</span>
                            <span>{entry.streakDays}d Streak</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Metrics */}
                      <div className="text-right shrink-0">
                        <div className="font-extrabold text-base sm:text-lg text-[#F5F5F5] font-mono">
                          {entry.primaryStatLabel}
                        </div>
                        <div className="text-xs text-[#666666] font-mono">
                          {entry.secondaryStatLabel}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

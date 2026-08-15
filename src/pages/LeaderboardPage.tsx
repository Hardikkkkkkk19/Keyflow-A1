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
    { id: "Overall", label: "Overall", icon: <Trophy className="w-4 h-4 text-amber-500" /> },
    { id: "Speed", label: "Speed", icon: <Zap className="w-4 h-4 text-kfa-500" /> },
    { id: "Accuracy", label: "Accuracy", icon: <Target className="w-4 h-4 text-kfa-500" /> },
    { id: "Coding", label: "Coding", icon: <Code className="w-4 h-4 text-kfa-500" /> },
    { id: "Streak", label: "Streak", icon: <Flame className="w-4 h-4 text-orange-500" /> },
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
      <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#F3F5F2]/10 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#18C69A]/10 border border-[#18C69A]/30 text-xs font-semibold text-[#18C69A]">
              <Trophy className="w-3.5 h-3.5 text-[#18C69A]" />
              <span>Real Competitive Rankings</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif text-[#F3F5F2] tracking-tight">
              KEYFLOW Leaderboard
            </h1>
            <p className="text-base text-[#A6ADA8] max-w-2xl font-sans">
              See how your performance compares with other typists based on verified, legitimate
              session telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-[#0D1210] border border-[#F3F5F2]/10 rounded-xl shadow-sm flex items-center gap-3 text-xs font-mono">
              <Users className="w-4 h-4 text-[#18C69A]" />
              <div>
                <span className="text-[#68716C] block text-[10px]">Active Competitors</span>
                <span className="font-bold text-[#F3F5F2] text-sm">{entries.length} Typists</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none bg-[#050807] p-1.5 rounded-xl border border-[#F3F5F2]/10">
            {categories.map((cat) => {
              const isActive = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-[#111715] text-[#18C69A] font-bold border border-[#18C69A]/40"
                      : "text-[#A6ADA8] hover:text-[#F3F5F2]"
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
            <div className="flex items-center gap-1 bg-kfn-100/80 dark:bg-kfn-900 p-1 rounded-xl border border-kfn-200/60 dark:border-kfn-800">
              {periods.map((p) => {
                const isActive = timePeriod === p;
                return (
                  <button
                    key={p}
                    onClick={() => setTimePeriod(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-kfa-600 text-white shadow-sm"
                        : "text-kfn-600 dark:text-kfn-400 hover:text-kfn-900 dark:hover:text-white"
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
                className="px-3 py-2 bg-white dark:bg-kfn-900 border border-kfn-200 dark:border-kfn-800 rounded-xl text-xs font-mono font-bold text-kfn-800 dark:text-kfn-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-kfa-500"
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
          <div className="p-4 sm:p-5 bg-gradient-to-r from-kfa-900/90 via-kfn-900 to-kfn-900 text-white rounded-3xl border border-kfa-500/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-kfa-600 flex items-center justify-center font-bold text-lg text-white shadow-inner shrink-0 font-mono">
                {currentUserEntry ? `#${currentUserEntry.rank}` : "—"}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-kfa-300 font-bold">
                    Your Position
                  </span>
                  {currentUserEntry?.rankChange === "up" && (
                    <span className="px-2 py-0.5 rounded-full bg-kfa-500/20 text-kfa-300 text-[10px] font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>+{currentUserEntry.rankChangeAmount}</span>
                    </span>
                  )}
                  {currentUserEntry?.rankChange === "down" && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      <span>-{currentUserEntry.rankChangeAmount}</span>
                    </span>
                  )}
                  {currentUserEntry?.rankChange === "new" && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      NEW ENTRY
                    </span>
                  )}
                </div>
                <h3 className="font-extrabold text-base text-white">
                  {profile?.display_name || userStatsProfile.name || "You"}
                  <span className="ml-2 text-xs text-kfa-300 font-mono">
                    Level {userStatsProfile.level}
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-kfn-800 pt-3 sm:pt-0">
              {currentUserEntry ? (
                <>
                  <div className="text-right">
                    <span className="text-[10px] text-kfn-400 block uppercase font-mono">
                      {category} Metric
                    </span>
                    <span className="font-extrabold text-lg text-kfa-400 font-mono">
                      {currentUserEntry.primaryStatLabel}
                    </span>
                  </div>
                  <div className="text-right border-l border-kfn-800 pl-4">
                    <span className="text-[10px] text-kfn-400 block uppercase font-mono">
                      Max WPM
                    </span>
                    <span className="font-extrabold text-lg text-white font-mono">
                      {userStatsProfile.highestWpm} WPM
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-xs text-kfn-300">
                    Complete a practice session to enter rankings.
                  </p>
                  <button
                    onClick={() => onNavigate("/practice")}
                    className="px-3.5 py-2 bg-kfa-600 hover:bg-kfa-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
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
            <div className="w-10 h-10 border-3 border-kfa-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-kfn-500">
              Calculating rankings from verified telemetry...
            </p>
          </div>
        ) : error ? (
          /* Polished Error State */
          <div className="p-8 sm:p-12 text-center bg-[#0D1210] rounded-3xl border border-rose-500/30 shadow-xl space-y-5 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-extrabold text-xl text-[#F3F5F2]">Leaderboard Unavailable</h3>
              <p className="text-sm text-[#A6ADA8] leading-relaxed">{error}</p>
            </div>
            <div className="pt-2 flex justify-center">
              <button
                onClick={loadData}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#18C69A] hover:bg-[#20B88A] text-[#050807] font-bold text-xs rounded-xl shadow-lg shadow-[#18C69A]/20 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Connection</span>
              </button>
            </div>
          </div>
        ) : entries.length === 0 ? (
          /* Honest Empty State */
          <div className="p-12 text-center bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-kfa-50 dark:bg-kfa-950/80 border border-kfa-200 dark:border-kfa-800 text-kfa-600 dark:text-kfa-400 flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-xl text-kfn-900 dark:text-white">
                No Competitors Yet
              </h3>
              <p className="text-sm text-kfn-500 dark:text-kfn-400 max-w-md mx-auto">
                No real completed sessions match the selected filter ({category} - {timePeriod}). Be
                the first typist to set a record!
              </p>
            </div>
            <button
              onClick={() => onNavigate("/practice")}
              className="inline-flex items-center gap-2 px-5 py-3 bg-kfa-600 hover:bg-kfa-500 text-white font-bold text-xs rounded-2xl shadow-md shadow-kfa-500/20 transition-all cursor-pointer"
            >
              <Keyboard className="w-4 h-4" />
              <span>Start Practice Session</span>
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top 3 Podium (ONLY render if real users exist!) */}
            {top1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 items-end">
                {/* 2nd Place */}
                {top2 ? (
                  <div className="order-2 md:order-1 p-6 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-300 dark:border-kfn-800 shadow-sm relative text-center space-y-3">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-kfn-200 dark:bg-kfn-800 border border-kfn-300 dark:border-kfn-700 text-kfn-700 dark:text-kfn-300 text-[10px] font-extrabold font-mono flex items-center gap-1">
                      <Medal className="w-3 h-3 text-kfn-400" />
                      <span>2ND PLACE</span>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-kfn-200 dark:bg-kfn-800 text-kfn-800 dark:text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-inner">
                      {top2.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-kfn-900 dark:text-white">
                        {top2.displayName}
                      </h4>
                      <p className="text-xs text-kfn-500 font-mono">Level {top2.level}</p>
                    </div>
                    <div className="pt-2 border-t border-kfn-100 dark:border-kfn-800">
                      <span className="text-2xl font-extrabold text-kfn-800 dark:text-kfn-200 font-mono">
                        {top2.primaryStatLabel}
                      </span>
                      <span className="text-[10px] text-kfn-400 block font-mono mt-0.5">
                        {top2.secondaryStatLabel}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="hidden md:block" />
                )}

                {/* 1st Place (Gold Podium) */}
                <div className="order-1 md:order-2 p-7 bg-gradient-to-b from-amber-500/10 via-white to-white dark:from-amber-500/15 dark:via-kfn-900 dark:to-kfn-900 rounded-3xl border-2 border-amber-400/80 dark:border-amber-500/50 shadow-xl relative text-center space-y-4">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500 text-kfn-950 font-extrabold text-xs tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/30">
                    <Crown className="w-3.5 h-3.5" />
                    <span>CHAMPION #1</span>
                  </div>
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-kfn-950 flex items-center justify-center font-black text-3xl mx-auto shadow-lg shadow-amber-500/30">
                    {top1.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-xl text-kfn-900 dark:text-white">
                      {top1.displayName}
                    </h4>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-extrabold font-mono">
                      Level {top1.level} Master
                    </p>
                  </div>
                  <div className="pt-3 border-t border-amber-200/50 dark:border-amber-500/20">
                    <span className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
                      {top1.primaryStatLabel}
                    </span>
                    <span className="text-xs text-kfn-500 font-mono block mt-1">
                      {top1.secondaryStatLabel}
                    </span>
                  </div>
                </div>

                {/* 3rd Place */}
                {top3 ? (
                  <div className="order-3 p-6 bg-white dark:bg-kfn-900 rounded-3xl border border-amber-800/30 dark:border-amber-900/30 shadow-sm relative text-center space-y-3">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-900/10 dark:bg-amber-900/30 border border-amber-800/30 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold font-mono flex items-center gap-1">
                      <Medal className="w-3 h-3 text-amber-600" />
                      <span>3RD PLACE</span>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 flex items-center justify-center font-bold text-2xl mx-auto shadow-inner">
                      {top3.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-kfn-900 dark:text-white">
                        {top3.displayName}
                      </h4>
                      <p className="text-xs text-kfn-500 font-mono">Level {top3.level}</p>
                    </div>
                    <div className="pt-2 border-t border-kfn-100 dark:border-kfn-800">
                      <span className="text-2xl font-extrabold text-kfn-800 dark:text-kfn-200 font-mono">
                        {top3.primaryStatLabel}
                      </span>
                      <span className="text-[10px] text-kfn-400 block font-mono mt-0.5">
                        {top3.secondaryStatLabel}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="hidden md:block" />
                )}
              </div>
            )}

            {/* Leaderboard Entries List */}
            <div className="bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-kfn-200/80 dark:border-kfn-800 flex items-center justify-between text-xs font-mono font-bold text-kfn-500 uppercase tracking-wider">
                <span>Rank & Typist</span>
                <span>Category Result</span>
              </div>

              <div className="divide-y divide-kfn-100 dark:divide-kfn-800/60">
                {entries.map((entry) => {
                  const isTop1 = entry.rank === 1;
                  const isTop2 = entry.rank === 2;
                  const isTop3 = entry.rank === 3;

                  return (
                    <div
                      key={entry.userId}
                      className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                        entry.isCurrentUser
                          ? "bg-kfa-50/70 dark:bg-kfa-950/40 border-l-4 border-kfa-600"
                          : "hover:bg-kfn-50/80 dark:hover:bg-kfn-800/40"
                      }`}
                    >
                      {/* Left: Rank & User Info */}
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        {/* Rank Badge */}
                        <div className="flex items-center gap-1.5 shrink-0 w-12">
                          <span
                            className={`font-black font-mono text-sm sm:text-base ${
                              isTop1
                                ? "text-amber-500"
                                : isTop2
                                  ? "text-kfn-400"
                                  : isTop3
                                    ? "text-amber-700 dark:text-amber-600"
                                    : "text-kfn-500"
                            }`}
                          >
                            #{entry.rank}
                          </span>

                          {/* Rank Movement */}
                          {entry.rankChange === "up" && (
                            <span
                              className="text-[10px] font-bold text-kfa-500 flex items-center"
                              title={`Up ${entry.rankChangeAmount}`}
                            >
                              <TrendingUp className="w-3 h-3" />
                            </span>
                          )}
                          {entry.rankChange === "down" && (
                            <span
                              className="text-[10px] font-bold text-rose-500 flex items-center"
                              title={`Down ${entry.rankChangeAmount}`}
                            >
                              <TrendingDown className="w-3 h-3" />
                            </span>
                          )}
                          {entry.rankChange === "same" && (
                            <span
                              className="text-[10px] text-kfn-300 dark:text-kfn-600"
                              title="No change"
                            >
                              <Minus className="w-3 h-3" />
                            </span>
                          )}
                          {entry.rankChange === "new" && (
                            <span className="px-1 py-0.5 rounded bg-kfa-500/20 text-kfa-400 text-[8px] font-bold">
                              NEW
                            </span>
                          )}
                        </div>

                        {/* Avatar */}
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                            isTop1
                              ? "bg-amber-500 text-kfn-950"
                              : isTop2
                                ? "bg-kfn-300 dark:bg-kfn-700 text-kfn-900 dark:text-white"
                                : isTop3
                                  ? "bg-amber-800 text-amber-100"
                                  : "bg-kfn-100 dark:bg-kfn-800 text-kfn-700 dark:text-kfn-300"
                          }`}
                        >
                          {entry.displayName.charAt(0).toUpperCase()}
                        </div>

                        {/* Display Name & Level */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm sm:text-base text-kfn-900 dark:text-white truncate">
                              {entry.displayName}
                            </h4>
                            {entry.isCurrentUser && (
                              <span className="px-2 py-0.5 rounded-full bg-kfa-100 dark:bg-kfa-900/80 text-kfa-700 dark:text-kfa-300 text-[10px] font-extrabold shrink-0">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-kfn-500 font-mono">
                            <span>Level {entry.level}</span>
                            <span>•</span>
                            <span>{entry.streakDays}d Streak</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Metrics */}
                      <div className="text-right shrink-0">
                        <div className="font-extrabold text-base sm:text-lg text-kfn-900 dark:text-white font-mono">
                          {entry.primaryStatLabel}
                        </div>
                        <div className="text-xs text-kfn-500 font-mono">
                          {entry.secondaryStatLabel}
                        </div>
                      </div>
                    </div>
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

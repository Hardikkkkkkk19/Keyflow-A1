import React, { useState } from "react";
import { motion } from "motion/react";
import { PageTransition } from "../components/common/PageTransition";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../components/common/ScrollReveal";
import { ProgressBar } from "../components/common/ProgressBar";
import { RoutePath } from "../types";
import { useAuth } from "../context/AuthContext";
import {
  ALL_CHALLENGES,
  ChallengeFilterCategory,
  ChallengeDefinition,
} from "../data/challengesData";
import {
  Trophy,
  Award,
  Zap,
  Play,
  CheckCircle2,
  Sparkles,
  Calendar,
  Flame,
  Code2,
  Crosshair,
  Timer,
  BarChart2,
  Layers,
  Search,
  AlertCircle,
  RotateCcw,
  RefreshCw,
} from "lucide-react";

interface ChallengesPageProps {
  onStartChallenge: (sampleText: string) => void;
  onNavigate: (path: RoutePath) => void;
}

export const ChallengesPage: React.FC<ChallengesPageProps> = ({ onStartChallenge, onNavigate }) => {
  const {
    userStatsProfile,
    recordChallengeCompletion,
    refreshProfile,
    loading: authLoading,
  } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<ChallengeFilterCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleRetrySync = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const res = await refreshProfile();
      if (res?.error) {
        setSyncError(
          "Unable to synchronize challenge progress. Please check your connection and try again.",
        );
      } else {
        setSyncError(null);
      }
    } catch (err) {
      setSyncError(
        "Unable to synchronize challenge progress. Please check your connection and try again.",
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const completedSet = new Set(userStatsProfile.completedChallenges || []);

  // Compute progress for each challenge
  const processedChallenges = ALL_CHALLENGES.map((chal) => {
    const rawProgress = chal.computeProgress(userStatsProfile);
    const progressValue = Math.min(chal.targetValue, Math.max(0, rawProgress));
    const isCompleted = completedSet.has(chal.id);
    const isTargetMet = progressValue >= chal.targetValue;
    const progressPercent = Math.min(100, (progressValue / chal.targetValue) * 100);

    return {
      ...chal,
      progressValue,
      isCompleted,
      isTargetMet,
      progressPercent,
    };
  });

  // Featured Daily Challenge (Daily Precision Sprint)
  const featuredDaily =
    processedChallenges.find((c) => c.id === "daily_precision_sprint") || processedChallenges[0];

  // Category list and counts
  const categories: { label: ChallengeFilterCategory; icon: React.ReactNode }[] = [
    { label: "All", icon: <Layers className="w-3.5 h-3.5" /> },
    { label: "Daily & Weekly", icon: <Calendar className="w-3.5 h-3.5" /> },
    { label: "Speed", icon: <Zap className="w-3.5 h-3.5" /> },
    { label: "Accuracy", icon: <Crosshair className="w-3.5 h-3.5" /> },
    { label: "Consistency", icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { label: "Endurance", icon: <Timer className="w-3.5 h-3.5" /> },
    { label: "Coding", icon: <Code2 className="w-3.5 h-3.5" /> },
    { label: "Skills", icon: <Award className="w-3.5 h-3.5" /> },
  ];

  // Filter challenges based on category tab & search query
  const filteredChallenges = processedChallenges.filter((chal) => {
    const matchesCategory =
      selectedCategory === "All" ||
      (selectedCategory === "Daily & Weekly" &&
        (chal.category === "Daily" || chal.category === "Weekly")) ||
      chal.filterCategory === selectedCategory;

    const matchesSearch =
      searchQuery.trim() === "" ||
      chal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chal.badgeName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Calculate summary metrics
  const totalCount = ALL_CHALLENGES.length;
  const completedCount = processedChallenges.filter((c) => c.isCompleted).length;
  const totalXpAvailable = ALL_CHALLENGES.reduce((acc, c) => acc + c.rewardXp, 0);
  const totalXpEarned = processedChallenges
    .filter((c) => c.isCompleted)
    .reduce((acc, c) => acc + c.rewardXp, 0);

  return (
    <PageTransition>
      <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <ScrollReveal className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#18C69A]/10 border border-[#18C69A]/30 text-xs font-semibold text-[#18C69A]">
                <Trophy className="w-3.5 h-3.5 text-[#18C69A]" />
                <span>Skill Benchmarks & XP Rewards</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif text-[#F3F5F2] tracking-tight">
                Typing Challenges & Mastery
              </h1>
              <p className="text-sm sm:text-base text-[#A6ADA8] max-w-2xl font-sans">
                Master 20+ specialized typing challenges across speed, accuracy, consistency,
                endurance, and live code syntax.
              </p>
            </div>

            {/* Quick Stats Pill & Sync Button */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 bg-[#0D1210] border border-[#F3F5F2]/10 p-3.5 rounded-2xl shrink-0">
                <div className="text-center px-3 border-r border-[#F3F5F2]/10">
                  <p className="text-xs text-[#A6ADA8] font-mono">Completed</p>
                  <p className="text-lg font-bold font-mono text-[#18C69A]">
                    {completedCount} <span className="text-xs text-[#68716C]">/ {totalCount}</span>
                  </p>
                </div>
                <div className="text-center px-3">
                  <p className="text-xs text-[#A6ADA8] font-mono">XP Earned</p>
                  <p className="text-lg font-bold font-mono text-amber-400">
                    {totalXpEarned}{" "}
                    <span className="text-xs text-[#68716C]">/ {totalXpAvailable}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={handleRetrySync}
                disabled={isSyncing}
                title="Sync Challenge Progress"
                className="p-3 bg-[#0D1210] border border-[#F3F5F2]/10 hover:border-[#18C69A]/40 text-[#A6ADA8] hover:text-[#18C69A] rounded-2xl transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isSyncing ? "animate-spin text-[#18C69A]" : ""}`}
                />
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Loading State */}
        {authLoading || isSyncing ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-3 border-[#18C69A] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-[#A6ADA8]">
              Synchronizing challenge benchmarks and progress...
            </p>
          </div>
        ) : syncError ? (
          /* Polished Error State */
          <div className="p-8 sm:p-12 text-center bg-[#0D1210] rounded-3xl border border-rose-500/30 shadow-xl space-y-5 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-extrabold text-xl text-[#F3F5F2]">Challenges Unavailable</h3>
              <p className="text-sm text-[#A6ADA8] leading-relaxed">{syncError}</p>
            </div>
            <div className="pt-2 flex justify-center">
              <button
                onClick={handleRetrySync}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#18C69A] hover:bg-[#20B88A] text-[#050807] font-bold text-xs rounded-xl shadow-lg shadow-[#18C69A]/20 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Connection</span>
              </button>
            </div>
          </div>
        ) : (
          /* Normal Content */
          <>
            {/* Featured Daily Challenge Spotlight Banner */}
            <ScrollReveal className="p-6 sm:p-8 bg-[#0D1210] border border-[#18C69A]/30 text-[#F3F5F2] rounded-2xl shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Sparkles className="w-56 h-56 text-[#18C69A]" />
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-3 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#18C69A]/15 text-[#18C69A] border border-[#18C69A]/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#18C69A]" /> Today's Featured Challenge
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/20">
                      +{featuredDaily.rewardXp} XP
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-serif text-[#F3F5F2]">
                    {featuredDaily.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#A6ADA8] leading-relaxed font-sans">
                    {featuredDaily.description}
                  </p>

                  {/* Progress */}
                  <div className="space-y-1.5 pt-2 max-w-md">
                    <div className="flex justify-between text-xs font-mono font-bold text-[#A6ADA8]">
                      <span>
                        Current: {featuredDaily.progressValue} {featuredDaily.unit}
                      </span>
                      <span>
                        Target: {featuredDaily.targetValue} {featuredDaily.unit}
                      </span>
                    </div>
                    <ProgressBar progress={featuredDaily.progressPercent} height="h-2.5" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 shrink-0">
                  {featuredDaily.isCompleted ? (
                    <div className="px-6 py-3.5 rounded-xl bg-[#18C69A]/15 border border-[#18C69A]/40 text-[#18C69A] font-bold text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#18C69A]" /> Challenge Completed!
                    </div>
                  ) : featuredDaily.isTargetMet ? (
                    <button
                      onClick={() =>
                        recordChallengeCompletion(
                          featuredDaily.id,
                          featuredDaily.title,
                          featuredDaily.rewardXp,
                        )
                      }
                      className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#050807] font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4 fill-[#050807]" /> Claim +{featuredDaily.rewardXp} XP
                      Reward
                    </button>
                  ) : (
                    <button
                      onClick={() => onStartChallenge(featuredDaily.sampleText)}
                      className="px-6 py-3.5 rounded-xl bg-[#18C69A] hover:bg-[#20B88A] text-[#050807] font-bold text-xs shadow-lg shadow-[#18C69A]/20 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Play className="w-4 h-4 fill-[#050807]" /> Start Daily Challenge
                    </button>
                  )}
                </div>
              </div>
            </ScrollReveal>

            {/* Search & Category Filter Navigation */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Search Input */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#68716C]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search challenges..."
                    className="w-full pl-9 pr-4 py-2.5 bg-[#0D1210] border border-[#F3F5F2]/10 rounded-xl text-xs text-[#F3F5F2] placeholder-[#68716C] focus:outline-none focus:border-[#18C69A]/60 transition-colors"
                  />
                </div>

                <p className="text-xs text-[#A6ADA8] font-mono">
                  Showing{" "}
                  <span className="text-[#18C69A] font-bold">{filteredChallenges.length}</span> of{" "}
                  {totalCount} challenges
                </p>
              </div>

              {/* Category Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat) => {
                  const count =
                    cat.label === "All"
                      ? processedChallenges.length
                      : cat.label === "Daily & Weekly"
                        ? processedChallenges.filter(
                            (c) => c.category === "Daily" || c.category === "Weekly",
                          ).length
                        : processedChallenges.filter((c) => c.filterCategory === cat.label).length;

                  const isSelected = selectedCategory === cat.label;

                  return (
                    <button
                      key={cat.label}
                      onClick={() => setSelectedCategory(cat.label)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
                        isSelected
                          ? "bg-[#151B18] text-[#F3F5F2] border-[#18C69A]/50 shadow-sm"
                          : "bg-[#0D1210] text-[#A6ADA8] border-[#F3F5F2]/10 hover:border-[#F3F5F2]/20 hover:text-[#F3F5F2]"
                      }`}
                    >
                      <span className={isSelected ? "text-[#18C69A]" : "text-[#68716C]"}>
                        {cat.icon}
                      </span>
                      <span>{cat.label}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${
                          isSelected
                            ? "bg-[#18C69A]/20 text-[#18C69A]"
                            : "bg-[#151B18] text-[#68716C]"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Challenge Cards Grid */}
            {filteredChallenges.length === 0 ? (
              <div className="text-center py-16 bg-[#0D1210] border border-[#F3F5F2]/10 rounded-2xl space-y-3">
                <Trophy className="w-10 h-10 text-[#68716C] mx-auto" />
                <p className="text-base text-[#F3F5F2] font-semibold">
                  No challenges match your criteria
                </p>
                <p className="text-xs text-[#A6ADA8]">
                  Try adjusting your search query or selecting a different category filter.
                </p>
              </div>
            ) : (
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredChallenges.map((chal) => {
                  return (
                    <StaggerItem key={chal.id}>
                      <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-[#0D1210] p-6 rounded-2xl border border-[#F3F5F2]/10 hover:border-[#18C69A]/30 transition-all shadow-md space-y-5 flex flex-col justify-between h-full relative overflow-hidden group"
                      >
                        <div className="space-y-4">
                          {/* Top Header: Category Tag & XP Badge */}
                          <div className="flex items-start justify-between gap-3">
                            <span className="px-2.5 py-1 rounded-md bg-[#151B18] border border-[#F3F5F2]/10 text-[#A6ADA8] text-[11px] font-semibold font-mono uppercase tracking-wider">
                              {chal.category}
                            </span>

                            <div className="px-2.5 py-1 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold font-mono shrink-0">
                              +{chal.rewardXp} XP
                            </div>
                          </div>

                          {/* Title & Description */}
                          <div className="space-y-1.5">
                            <h3 className="text-lg font-bold text-[#F3F5F2] group-hover:text-[#18C69A] transition-colors">
                              {chal.title}
                            </h3>
                            <p className="text-xs text-[#A6ADA8] leading-relaxed">
                              {chal.description}
                            </p>
                          </div>

                          {/* Progress Section */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex justify-between text-[11px] font-semibold text-[#A6ADA8] font-mono">
                              <span>
                                Progress: {chal.progressValue} / {chal.targetValue} {chal.unit}
                              </span>
                              <span>{Math.round(chal.progressPercent)}%</span>
                            </div>
                            <ProgressBar progress={chal.progressPercent} height="h-2" />
                          </div>
                        </div>

                        {/* Bottom Footer: Badge Reward & Action Button */}
                        <div className="pt-4 flex items-center justify-between border-t border-[#F3F5F2]/10 gap-2">
                          <span className="text-[11px] font-medium text-[#68716C] flex items-center gap-1.5 truncate max-w-[150px]">
                            <Award className="w-3.5 h-3.5 text-[#18C69A] shrink-0" />
                            <span className="truncate">{chal.badgeName}</span>
                          </span>

                          {chal.isCompleted ? (
                            <div className="text-xs font-bold text-[#18C69A] flex items-center gap-1 bg-[#18C69A]/10 px-3 py-1.5 rounded-lg border border-[#18C69A]/20">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                            </div>
                          ) : chal.isTargetMet ? (
                            <button
                              onClick={() =>
                                recordChallengeCompletion(chal.id, chal.title, chal.rewardXp)
                              }
                              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#050807] font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                            >
                              <Zap className="w-3.5 h-3.5 fill-[#050807]" /> Claim +{chal.rewardXp}{" "}
                              XP
                            </button>
                          ) : (
                            <button
                              onClick={() => onStartChallenge(chal.sampleText)}
                              className="px-3.5 py-1.5 rounded-lg bg-[#18C69A] hover:bg-[#20B88A] text-[#050807] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-[#050807]" /> Start
                            </button>
                          )}
                        </div>
                      </motion.div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
};

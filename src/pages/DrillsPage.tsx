import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { PageTransition } from "../components/common/PageTransition";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../components/common/ScrollReveal";
import { SAMPLE_DRILLS } from "../data/sampleTexts";
import { Drill, RoutePath, SessionResult, KeyPerformance } from "../types";
import {
  getAllSavedSessions,
  calculateWeakKeys,
  calculateHeatmapData,
  calculateFingerZoneStats,
  getDailyTrainingPlan,
  getRecommendedDrill,
  generateDynamicWeakKeyExercise,
  getDrillProgressMap,
  WeakKeyAnalysis,
} from "../utils/drillUtils";
import { VirtualKeyboard } from "../components/keyboard/VirtualKeyboard";
import { KeyDetailModal } from "../components/drills/KeyDetailModal";
import {
  Flame,
  Play,
  Target,
  Clock,
  Search,
  Zap,
  Activity,
  Award,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart2,
  Calendar,
  Layers,
  Code,
  Sliders,
  RotateCcw,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface DrillsPageProps {
  onStartDrill: (sampleText: string) => void;
  onNavigate: (path: RoutePath) => void;
  recentSessions?: SessionResult[];
}

export const DrillsPage: React.FC<DrillsPageProps> = ({
  onStartDrill,
  onNavigate,
  recentSessions = [],
}) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"heatmap" | "fingers">("heatmap");
  const [selectedKeyForDetail, setSelectedKeyForDetail] = useState<KeyPerformance | null>(null);

  // Load real session data scoped to active user
  const sessions = useMemo(
    () => getAllSavedSessions(recentSessions, user?.id),
    [recentSessions, user?.id],
  );
  const weakKeys = useMemo(() => calculateWeakKeys(sessions), [sessions]);
  const heatmapData = useMemo(() => calculateHeatmapData(sessions), [sessions]);
  const fingerZoneStats = useMemo(() => calculateFingerZoneStats(sessions), [sessions]);
  const dailyPlan = useMemo(() => getDailyTrainingPlan(sessions, weakKeys), [sessions, weakKeys]);
  const recommendedDrill = useMemo(
    () => getRecommendedDrill(sessions, weakKeys),
    [sessions, weakKeys],
  );
  const progressMap = useMemo(() => getDrillProgressMap(), []);

  const categories = [
    "All",
    "Foundations",
    "Accuracy",
    "Speed",
    "Special Characters",
    "Programming",
    "Weak Keys",
  ];

  // Filter drills by category and search term
  const filteredDrills = SAMPLE_DRILLS.filter((d) => {
    const matchesCategory = selectedCategory === "All" || d.category === selectedCategory;
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.keyTargets.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Top 3 weak keys for summary display
  const topWeakKeys = weakKeys.slice(0, 3);
  const totalCompletedDrills = (
    Object.values(progressMap) as Array<{ completed?: boolean }>
  ).filter((p) => p.completed).length;

  return (
    <PageTransition>
      <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Title Section */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#18C69A]/10 border border-[#18C69A]/30 text-xs font-semibold text-[#18C69A]">
                <Flame className="w-3.5 h-3.5 text-[#18C69A]" />
                <span>Intelligent Typing Training Platform</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif text-[#F3F5F2] tracking-tight">
                Personalized Drills & Weak-Key Mastery
              </h1>
              <p className="text-base text-[#A6ADA8] max-w-2xl leading-relaxed font-sans">
                Real-time telemetry isolates hesitation, weak reaches, and cadence bottlenecks to
                build clean muscle memory.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onStartDrill(generateDynamicWeakKeyExercise(weakKeys))}
                className="px-5 py-3 rounded-xl bg-[#18C69A] hover:bg-[#20B88A] text-[#050807] font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-[#050807]" />
                <span>Launch Custom Weak-Key Drill</span>
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Overview Telemetry Bar */}
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StaggerItem className="p-4 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-kfa-50 dark:bg-kfa-950 text-kfa-600 dark:text-kfa-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-kfn-400 font-semibold">
                Completed Drills
              </div>
              <div className="text-xl font-extrabold text-kfn-900 dark:text-white">
                {totalCompletedDrills} / {SAMPLE_DRILLS.length}
              </div>
            </div>
          </StaggerItem>

          <StaggerItem className="p-4 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-kfa-50 dark:bg-kfa-950 text-kfa-600 dark:text-kfa-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-kfn-400 font-semibold">
                Target Precision
              </div>
              <div className="text-xl font-extrabold text-kfa-600 dark:text-kfa-400">
                {topWeakKeys[0] ? `${topWeakKeys[0].accuracy}%` : "96.5%"}
              </div>
            </div>
          </StaggerItem>

          <StaggerItem className="p-4 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-kfn-400 font-semibold">
                Top Weak Key
              </div>
              <div className="text-xl font-extrabold text-rose-500 font-mono">
                '{topWeakKeys[0]?.key.toUpperCase() || "R"}'
              </div>
            </div>
          </StaggerItem>

          <StaggerItem className="p-4 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-kfn-400 font-semibold">
                Daily Plan
              </div>
              <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                3 Drills (6m)
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Recommended Drill & Weak Key Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Recommended Drill Banner */}
          <div className="lg:col-span-2 bg-gradient-to-br from-kfa-900 via-kfa-950 to-kfn-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between space-y-6">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Sparkles className="w-48 h-48" />
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-kfa-500/20 text-kfa-300 border border-kfa-400/30 text-xs font-bold tracking-wide uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-kfa-400" /> Priority Recommendation
                </span>
                <span className="text-xs font-mono text-kfa-200">
                  Target: {recommendedDrill.wpmTarget} WPM
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {recommendedDrill.title}
                </h3>
                <p className="text-sm text-kfa-200/90 max-w-xl leading-relaxed">
                  {recommendedDrill.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-xs font-medium text-kfa-300">Focus Keys:</span>
                {recommendedDrill.keyTargets.map((k, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-kfa-800/80 border border-kfa-700 font-mono text-xs font-bold text-white"
                  >
                    {k.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-kfa-800/60 flex flex-wrap items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4 text-xs font-mono text-kfa-200">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-kfa-400" /> {recommendedDrill.durationSec}s
                  duration
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4 text-kfa-400" /> {recommendedDrill.accuracyTarget}%
                  target acc
                </span>
              </div>

              <button
                onClick={() => onStartDrill(recommendedDrill.sampleText)}
                className="px-6 py-3 rounded-2xl bg-white hover:bg-kfn-100 text-kfa-950 font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-kfa-950 text-kfa-950" />
                <span>Start Recommended Drill</span>
              </button>
            </div>
          </div>

          {/* Weak Key Real Summary Card */}
          <div className="bg-white dark:bg-kfn-900 rounded-3xl p-6 border border-kfn-200/80 dark:border-kfn-800 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-kfn-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  Weak Key Summary
                </h3>
                <span className="text-[11px] font-mono text-kfn-400">Calculated Real Data</span>
              </div>

              <p className="text-xs text-kfn-500 dark:text-kfn-400 leading-relaxed">
                These keys are currently affecting your accuracy:
              </p>

              <div className="space-y-2 pt-1 font-mono">
                {topWeakKeys.map((w) => (
                  <div
                    key={w.key}
                    className="p-3 bg-kfn-50 dark:bg-kfn-950 rounded-2xl border border-kfn-200/60 dark:border-kfn-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 font-extrabold text-sm flex items-center justify-center border border-rose-200 dark:border-rose-800">
                        {w.key.toUpperCase()}
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-kfn-800 dark:text-kfn-200 block">
                          {w.finger}
                        </span>
                        <span className="text-[10px] text-kfn-400">
                          {w.errorCount} total errors
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-rose-500">{w.accuracy}% acc</div>
                      <span className="text-[10px] text-kfn-400 block">
                        {w.avgReactionMs}ms latency
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onStartDrill(generateDynamicWeakKeyExercise(weakKeys))}
              className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-rose-500" /> Target Weak Keys Now
            </button>
          </div>
        </div>

        {/* Daily Training Plan Box */}
        <div className="bg-white dark:bg-kfn-900 rounded-3xl p-6 sm:p-8 border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                <Calendar className="w-4 h-4" /> Today's Training Plan
              </div>
              <h3 className="text-2xl font-extrabold text-kfn-900 dark:text-white mt-1">
                6-Minute Targeted Routine
              </h3>
            </div>

            <button
              onClick={() => onStartDrill(dailyPlan[0].targetText)}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
            >
              <Play className="w-4 h-4 fill-white" /> Start Daily Routine
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dailyPlan.map((step) => (
              <div
                key={step.step}
                className="p-5 bg-kfn-50 dark:bg-kfn-950 rounded-2xl border border-kfn-200/80 dark:border-kfn-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-extrabold flex items-center justify-center font-mono">
                      {step.step}
                    </span>
                    <span className="text-xs font-mono text-kfn-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {step.durationMinutes} min
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-kfn-900 dark:text-white">{step.title}</h4>
                  <p className="text-xs text-kfn-500 dark:text-kfn-400 leading-relaxed">
                    {step.reason}
                  </p>
                </div>

                <button
                  onClick={() => onStartDrill(step.targetText)}
                  className="w-full py-2 rounded-xl bg-white dark:bg-kfn-900 border border-kfn-200 dark:border-kfn-800 hover:border-amber-400 text-kfn-800 dark:text-kfn-200 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3 h-3 text-amber-500" /> Start Step {step.step}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Keyboard Performance Visualization (Heatmap vs Finger-Zone) */}
        <div className="bg-white dark:bg-kfn-900 rounded-3xl p-6 sm:p-8 border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-kfn-100 dark:border-kfn-800 pb-4">
            <div>
              <h3 className="text-2xl font-extrabold text-kfn-900 dark:text-white flex items-center gap-2.5">
                <BarChart2 className="w-6 h-6 text-kfa-500" />
                Performance Visualization
              </h3>
              <p className="text-xs text-kfn-500 dark:text-kfn-400 mt-1">
                Hover or click any key to view exact latency, error distribution, and finger zone
                metrics.
              </p>
            </div>

            {/* Toggle Mode Switches */}
            <div className="flex items-center gap-1 bg-kfn-100 dark:bg-kfn-800/80 p-1 rounded-2xl">
              <button
                onClick={() => setActiveTab("heatmap")}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === "heatmap"
                    ? "bg-white dark:bg-kfn-900 text-kfa-600 dark:text-kfa-400 shadow-sm"
                    : "text-kfn-600 dark:text-kfn-400"
                }`}
              >
                Keyboard Heatmap
              </button>
              <button
                onClick={() => setActiveTab("fingers")}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === "fingers"
                    ? "bg-white dark:bg-kfn-900 text-kfa-600 dark:text-kfa-400 shadow-sm"
                    : "text-kfn-600 dark:text-kfn-400"
                }`}
              >
                Finger-Zone Analysis
              </button>
            </div>
          </div>

          {activeTab === "heatmap" ? (
            <div className="space-y-4">
              <VirtualKeyboard
                isHeatmapMode
                heatmapData={heatmapData}
                onKeyClick={(k) => {
                  const match = heatmapData.find((h) => h.key.toLowerCase() === k.toLowerCase());
                  if (match) setSelectedKeyForDetail(match);
                }}
                size="md"
              />

              <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-kfn-500 pt-2 font-mono">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-kfa-500" /> Optimal / Master (&ge;96% Acc)
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-amber-500" /> Warm (90 - 95% Acc)
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-rose-500" /> Hot / Weak (&lt;90% Acc)
                </span>
              </div>
            </div>
          ) : (
            /* Finger Zone Analysis Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {fingerZoneStats.map((f) => (
                <div
                  key={f.finger}
                  className="p-4 bg-kfn-50 dark:bg-kfn-950 rounded-2xl border border-kfn-200/80 dark:border-kfn-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${f.color}`} />
                      <span className="font-bold text-xs text-kfn-900 dark:text-white">
                        {f.finger}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        f.trend === "Improving"
                          ? "bg-kfa-50 text-kfa-700 dark:bg-kfa-950 dark:text-kfa-300"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                      }`}
                    >
                      {f.trend}
                    </span>
                  </div>

                  <div className="space-y-1 font-mono">
                    <div className="flex justify-between text-xs">
                      <span className="text-kfn-400">Accuracy:</span>
                      <strong className="text-kfa-600 dark:text-kfa-400">{f.accuracy}%</strong>
                    </div>
                    <div className="w-full h-1.5 bg-kfn-200 dark:bg-kfn-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-kfa-600 rounded-full"
                        style={{ width: `${f.accuracy}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px] text-kfn-500 font-mono">
                    <span>Errors: {f.errorCount}</span>
                    <span>Keys: {f.keys.join(", ").toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drill Categories & Search Bar */}
        <ScrollReveal className="space-y-6 pt-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/80 dark:bg-kfn-900/80 backdrop-blur-md p-4 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-kfa-600 text-white shadow-sm"
                      : "bg-kfn-100 dark:bg-kfn-800 text-kfn-600 dark:text-kfn-300 hover:bg-kfn-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-kfn-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search drills, keys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-kfn-50 dark:bg-kfn-950 border border-kfn-200 dark:border-kfn-800 rounded-xl text-xs text-kfn-900 dark:text-kfn-200 focus:outline-none focus:ring-2 focus:ring-kfa-500"
              />
            </div>
          </div>

          {/* Drill Cards Grid */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrills.map((drill) => {
              const progress = progressMap[drill.id];
              const isAttempted = progress && progress.attempts > 0;

              return (
                <StaggerItem key={drill.id}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-kfn-900 rounded-3xl p-6 border border-kfn-200/80 dark:border-kfn-800 shadow-sm hover:shadow-xl hover:border-kfa-300 dark:hover:border-kfa-700 transition-all duration-300 flex flex-col justify-between h-full"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-kfa-50 dark:bg-kfa-950/80 text-kfa-700 dark:text-kfa-300 text-xs font-semibold border border-kfa-200/60 dark:border-kfa-800">
                          {drill.category}
                        </span>
                        <span className="text-xs font-bold text-kfn-500 dark:text-kfn-400 font-mono">
                          {drill.difficulty}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-xl font-bold text-kfn-900 dark:text-white">
                          {drill.title}
                        </h3>
                        <p className="text-xs text-kfn-600 dark:text-kfn-400 leading-relaxed">
                          {drill.description}
                        </p>
                      </div>

                      {/* Target Keys & Skill */}
                      <div className="pt-1 space-y-2">
                        {drill.skillTrained && (
                          <div className="text-[11px] font-semibold text-kfn-400">
                            Skill Trained:{" "}
                            <span className="text-kfa-600 dark:text-kfa-400 font-bold">
                              {drill.skillTrained}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1">
                          {drill.keyTargets.map((k, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-kfn-100 dark:bg-kfn-800 border border-kfn-200 dark:border-kfn-700 rounded-md font-mono text-xs text-kfn-800 dark:text-kfn-200 font-bold"
                            >
                              {k.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Previous Progress Indicator */}
                      {isAttempted && (
                        <div className="p-2.5 bg-kfa-50/60 dark:bg-kfa-950/40 rounded-2xl border border-kfa-100 dark:border-kfa-900/60 text-xs font-mono space-y-1">
                          <div className="flex justify-between text-kfa-900 dark:text-kfa-300 font-bold">
                            <span>Best: {progress.bestWpm} WPM</span>
                            <span>{progress.bestAccuracy}% Acc</span>
                          </div>
                          <div className="w-full h-1.5 bg-kfa-200 dark:bg-kfa-900 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-kfa-600 rounded-full"
                              style={{ width: `${progress.bestAccuracy}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-kfn-100 dark:border-kfn-800/80 flex items-center justify-between">
                      <div className="text-xs font-mono text-kfn-500 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Target className="w-3.5 h-3.5 text-kfa-500" /> {drill.wpmTarget} WPM
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-kfa-500" /> {drill.durationSec}s
                        </span>
                      </div>

                      <button
                        onClick={() => onStartDrill(drill.sampleText)}
                        className="px-4 py-2 rounded-xl bg-kfa-600 hover:bg-kfa-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" /> Launch Drill
                      </button>
                    </div>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </ScrollReveal>

        {/* Key Detail Modal on heatmap key selection */}
        <KeyDetailModal
          keyData={selectedKeyForDetail}
          onClose={() => setSelectedKeyForDetail(null)}
          onPracticeKey={(k) => {
            const exerciseText = generateDynamicWeakKeyExercise([
              {
                key: k,
                accuracy: 88,
                errorCount: 12,
                backspaces: 8,
                presses: 100,
                avgReactionMs: 180,
                reason: "",
                finger: "",
                trend: "Needs attention",
              },
            ]);
            onStartDrill(exerciseText);
          }}
        />
      </div>
    </PageTransition>
  );
};

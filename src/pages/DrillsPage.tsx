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
      <div className="py-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Title Section */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#18C69A]/10 border border-[#18C69A]/30 text-xs font-semibold text-[#18C69A]">
                <Flame className="w-3.5 h-3.5 text-[#18C69A]" />
                <span>Intelligent Typing Training Platform</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif text-[#F5F5F5] tracking-tight">
                Personalized Drills & Weak-Key Mastery
              </h1>
              <p className="text-sm sm:text-base text-[#A0A0A0] max-w-2xl leading-relaxed font-sans">
                Real-time telemetry isolates hesitation, weak reaches, and cadence bottlenecks to
                build clean muscle memory.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onStartDrill(generateDynamicWeakKeyExercise(weakKeys))}
                className="px-5 py-3 rounded-xl bg-[#18C69A] hover:bg-[#14A782] text-[#0A0A0A] font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-[#0A0A0A]" />
                <span>Launch Custom Weak-Key Drill</span>
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Overview Telemetry Bar */}
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StaggerItem className="p-4 bg-[#151515] rounded-2xl border border-[#262626] shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#18C69A]/10 text-[#18C69A] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-[#666666] font-semibold">
                Completed Drills
              </div>
              <div className="text-xl font-extrabold text-[#F5F5F5]">
                {totalCompletedDrills} / {SAMPLE_DRILLS.length}
              </div>
            </div>
          </StaggerItem>

          <StaggerItem className="p-4 bg-[#151515] rounded-2xl border border-[#262626] shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#79D88B]/10 text-[#79D88B] flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-[#666666] font-semibold">
                Target Precision
              </div>
              <div className="text-xl font-extrabold text-[#79D88B]">
                {topWeakKeys[0] ? `${topWeakKeys[0].accuracy}%` : "96.5%"}
              </div>
            </div>
          </StaggerItem>

          <StaggerItem className="p-4 bg-[#151515] rounded-2xl border border-[#262626] shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F05A9D]/10 text-[#F05A9D] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-[#666666] font-semibold">
                Top Weak Key
              </div>
              <div className="text-xl font-extrabold text-[#F05A9D] font-mono">
                '{topWeakKeys[0]?.key.toUpperCase() || "R"}'
              </div>
            </div>
          </StaggerItem>

          <StaggerItem className="p-4 bg-[#151515] rounded-2xl border border-[#262626] shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F4D35E]/10 text-[#F4D35E] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-[#666666] font-semibold">
                Daily Plan
              </div>
              <div className="text-xl font-extrabold text-[#F4D35E]">3 Drills (6m)</div>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Recommended Drill & Weak Key Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Recommended Drill Banner */}
          <div className="lg:col-span-2 bg-[#151515] border border-[#18C69A]/30 rounded-2xl p-6 sm:p-8 text-[#F5F5F5] relative overflow-hidden shadow-2xl flex flex-col justify-between space-y-6">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Sparkles className="w-48 h-48 text-[#18C69A]" />
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#18C69A]/20 text-[#18C69A] border border-[#18C69A]/40 text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-[#18C69A]" /> Priority Recommendation
                </span>
                <span className="text-xs font-mono text-[#A0A0A0]">
                  Target: {recommendedDrill.wpmTarget} WPM
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F5F5]">
                  {recommendedDrill.title}
                </h3>
                <p className="text-sm text-[#A0A0A0] max-w-xl leading-relaxed">
                  {recommendedDrill.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-xs font-medium text-[#666666]">Focus Keys:</span>
                {recommendedDrill.keyTargets.map((k, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-lg bg-[#111111] border border-[#262626] font-mono text-xs font-bold text-[#18C69A]"
                  >
                    {k.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#262626] flex flex-wrap items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4 text-xs font-mono text-[#A0A0A0]">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-[#45D6E8]" /> {recommendedDrill.durationSec}s
                  duration
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4 text-[#79D88B]" /> {recommendedDrill.accuracyTarget}%
                  target acc
                </span>
              </div>

              <button
                onClick={() => onStartDrill(recommendedDrill.sampleText)}
                className="px-6 py-3 rounded-xl bg-[#18C69A] hover:bg-[#14A782] text-[#0A0A0A] font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-[#0A0A0A] text-[#0A0A0A]" />
                <span>Start Recommended Drill</span>
              </button>
            </div>
          </div>

          {/* Weak Key Real Summary Card */}
          <div className="bg-[#151515] rounded-2xl p-6 border border-[#262626] shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#F5F5F5] flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#F05A9D]" />
                  Weak Key Summary
                </h3>
                <span className="text-[11px] font-mono text-[#666666]">Telemetry</span>
              </div>

              <p className="text-xs text-[#A0A0A0] leading-relaxed">
                These keys are currently affecting your accuracy:
              </p>

              <div className="space-y-2 pt-1 font-mono">
                {topWeakKeys.map((w) => (
                  <div
                    key={w.key}
                    className="p-3 bg-[#111111] rounded-xl border border-[#262626] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F05A9D]/10 text-[#F05A9D] font-extrabold text-sm flex items-center justify-center border border-[#F05A9D]/20">
                        {w.key.toUpperCase()}
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-[#F5F5F5] block">{w.finger}</span>
                        <span className="text-[10px] text-[#666666]">
                          {w.errorCount} total errors
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-[#F05A9D]">{w.accuracy}% acc</div>
                      <span className="text-[10px] text-[#666666] block">
                        {w.avgReactionMs}ms latency
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onStartDrill(generateDynamicWeakKeyExercise(weakKeys))}
              className="w-full py-2.5 rounded-xl bg-[#F05A9D]/10 hover:bg-[#F05A9D]/20 text-[#F05A9D] font-bold text-xs border border-[#F05A9D]/30 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-[#F05A9D]" /> Target Weak Keys Now
            </button>
          </div>
        </div>

        {/* Daily Training Plan Box */}
        <div className="bg-[#151515] rounded-2xl p-6 sm:p-8 border border-[#262626] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#F4D35E] uppercase tracking-wide font-mono">
                <Calendar className="w-4 h-4" /> Today's Training Plan
              </div>
              <h3 className="text-2xl font-extrabold text-[#F5F5F5] mt-1">
                6-Minute Targeted Routine
              </h3>
            </div>

            <button
              onClick={() => onStartDrill(dailyPlan[0].targetText)}
              className="px-5 py-2.5 rounded-xl bg-[#F4D35E] hover:bg-[#E2C350] text-[#0A0A0A] font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
            >
              <Play className="w-4 h-4 fill-[#0A0A0A]" /> Start Daily Routine
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dailyPlan.map((step) => (
              <div
                key={step.step}
                className="p-5 bg-[#111111] rounded-xl border border-[#262626] space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#F4D35E]/20 text-[#F4D35E] text-xs font-extrabold flex items-center justify-center font-mono border border-[#F4D35E]/30">
                      {step.step}
                    </span>
                    <span className="text-xs font-mono text-[#666666] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {step.durationMinutes} min
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#F5F5F5]">{step.title}</h4>
                  <p className="text-xs text-[#A0A0A0] leading-relaxed">{step.reason}</p>
                </div>

                <button
                  onClick={() => onStartDrill(step.targetText)}
                  className="w-full py-2 rounded-xl bg-[#181818] hover:bg-[#1C1C1C] border border-[#262626] hover:border-[#F4D35E] text-[#F5F5F5] font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3 h-3 text-[#F4D35E]" /> Start Step {step.step}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Keyboard Performance Visualization (Heatmap vs Finger-Zone) */}
        <div className="bg-[#151515] rounded-2xl p-6 sm:p-8 border border-[#262626] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262626] pb-4">
            <div>
              <h3 className="text-2xl font-extrabold text-[#F5F5F5] flex items-center gap-2.5">
                <BarChart2 className="w-6 h-6 text-[#18C69A]" />
                Performance Visualization
              </h3>
              <p className="text-xs text-[#A0A0A0] mt-1">
                Hover or click any key to view exact latency, error distribution, and finger zone
                metrics.
              </p>
            </div>

            {/* Toggle Mode Switches */}
            <div className="flex items-center gap-1 bg-[#111111] p-1 rounded-xl border border-[#262626]">
              <button
                onClick={() => setActiveTab("heatmap")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === "heatmap"
                    ? "bg-[#18C69A] text-[#0A0A0A] shadow-sm"
                    : "text-[#A0A0A0] hover:text-[#F5F5F5]"
                }`}
              >
                Keyboard Heatmap
              </button>
              <button
                onClick={() => setActiveTab("fingers")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === "fingers"
                    ? "bg-[#18C69A] text-[#0A0A0A] shadow-sm"
                    : "text-[#A0A0A0] hover:text-[#F5F5F5]"
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

              <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#666666] pt-2 font-mono">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#79D88B]" /> Optimal / Master (&ge;96% Acc)
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#F4D35E]" /> Warm (90 - 95% Acc)
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#F05A9D]" /> Hot / Weak (&lt;90% Acc)
                </span>
              </div>
            </div>
          ) : (
            /* Finger Zone Analysis Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {fingerZoneStats.map((f) => (
                <div
                  key={f.finger}
                  className="p-4 bg-[#111111] rounded-xl border border-[#262626] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${f.color}`} />
                      <span className="font-bold text-xs text-[#F5F5F5]">{f.finger}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        f.trend === "Improving"
                          ? "bg-[#18C69A]/10 text-[#18C69A]"
                          : "bg-[#F05A9D]/10 text-[#F05A9D]"
                      }`}
                    >
                      {f.trend}
                    </span>
                  </div>

                  <div className="space-y-1 font-mono">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#666666]">Accuracy:</span>
                      <strong className="text-[#79D88B]">{f.accuracy}%</strong>
                    </div>
                    <div className="w-full h-1.5 bg-[#181818] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#18C69A] rounded-full"
                        style={{ width: `${f.accuracy}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px] text-[#666666] font-mono">
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#151515] p-4 rounded-2xl border border-[#262626] shadow-sm">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#18C69A] text-[#0A0A0A] font-bold shadow-sm"
                      : "bg-[#111111] text-[#A0A0A0] hover:text-[#F5F5F5] border border-[#262626]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search drills, keys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#111111] border border-[#262626] rounded-xl text-xs text-[#F5F5F5] placeholder-[#666666] focus:outline-none focus:ring-1 focus:ring-[#18C69A]"
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
                    whileHover={{ y: -4 }}
                    className="bg-[#151515] rounded-2xl p-6 border border-[#262626] shadow-sm hover:shadow-xl hover:border-[#18C69A]/40 transition-all duration-300 flex flex-col justify-between h-full"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg bg-[#18C69A]/10 text-[#18C69A] text-xs font-semibold border border-[#18C69A]/20 font-mono">
                          {drill.category}
                        </span>
                        <span className="text-xs font-bold text-[#666666] font-mono">
                          {drill.difficulty}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-xl font-bold text-[#F5F5F5]">{drill.title}</h3>
                        <p className="text-xs text-[#A0A0A0] leading-relaxed">
                          {drill.description}
                        </p>
                      </div>

                      {/* Target Keys & Skill */}
                      <div className="pt-1 space-y-2">
                        {drill.skillTrained && (
                          <div className="text-[11px] font-semibold text-[#666666]">
                            Skill Trained:{" "}
                            <span className="text-[#18C69A] font-bold">{drill.skillTrained}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1">
                          {drill.keyTargets.map((k, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-[#111111] border border-[#262626] rounded-md font-mono text-xs text-[#18C69A] font-bold"
                            >
                              {k.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Previous Progress Indicator */}
                      {isAttempted && (
                        <div className="p-2.5 bg-[#111111] rounded-xl border border-[#262626] text-xs font-mono space-y-1">
                          <div className="flex justify-between text-[#F5F5F5] font-bold">
                            <span>Best: {progress.bestWpm} WPM</span>
                            <span className="text-[#79D88B]">{progress.bestAccuracy}% Acc</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#181818] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#18C69A] rounded-full"
                              style={{ width: `${progress.bestAccuracy}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#262626] flex items-center justify-between">
                      <div className="text-xs font-mono text-[#666666] flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Target className="w-3.5 h-3.5 text-[#18C69A]" /> {drill.wpmTarget} WPM
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#45D6E8]" /> {drill.durationSec}s
                        </span>
                      </div>

                      <button
                        onClick={() => onStartDrill(drill.sampleText)}
                        className="px-4 py-2 rounded-xl bg-[#18C69A] hover:bg-[#14A782] text-[#0A0A0A] text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-[#0A0A0A]" /> Launch Drill
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

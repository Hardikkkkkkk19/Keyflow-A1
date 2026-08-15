import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RoutePath, SessionResult } from "../types";
import { PageTransition } from "../components/common/PageTransition";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../components/common/ScrollReveal";
import { VirtualKeyboard } from "../components/keyboard/VirtualKeyboard";
import { useAuth } from "../context/AuthContext";
import { fetchCanonicalSessions } from "../utils/sessionStorage";
import {
  getAllSavedSessions,
  calculateWeakKeys,
  calculateHeatmapData,
  calculateFingerZoneStats,
  WeakKeyAnalysis,
  FingerZoneStat,
} from "../utils/drillUtils";
import {
  TimeRange,
  filterSessionsByTimeRange,
  getPreviousPeriodSessions,
  calculateOverviewMetrics,
  calculateDailyActivity,
  calculateScatterInterpretation,
  calculateModePerformance,
  calculateCodingStats,
  calculatePersonalRecords,
  calculateDrillImpactStats,
  generatePerformanceInsights,
} from "../utils/analyticsUtils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ScatterChart,
  Scatter,
  Cell,
} from "recharts";
import {
  LineChart as LineChartIcon,
  Zap,
  Target,
  Clock,
  Award,
  Activity,
  Flame,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Calendar,
  Layers,
  Code,
  CheckCircle2,
  Filter,
  Eye,
  Sliders,
  X,
  Play,
  RotateCcw,
  Maximize2,
  ChevronRight,
  Info,
} from "lucide-react";

interface AnalyticsPageProps {
  onNavigate?: (path: RoutePath) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [dbSessions, setDbSessions] = useState<SessionResult[]>([]);

  // Asynchronously fetch canonical sessions strictly for the active user (or guest)
  useEffect(() => {
    let isMounted = true;
    setDbSessions([]); // Clear immediately on user change to prevent stale data leaks
    async function loadSessions() {
      const canonical = await fetchCanonicalSessions(user?.id);
      if (isMounted) {
        setDbSessions(canonical);
      }
    }
    loadSessions();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Scoped sessions strictly bound by user ownership
  const allSessions = useMemo(() => {
    return dbSessions;
  }, [dbSessions]);

  // Time Range Filter State
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  // Filtered Sessions for selected Time Range
  const filteredSessions = useMemo(() => {
    return filterSessionsByTimeRange(allSessions, timeRange);
  }, [allSessions, timeRange]);

  // Sessions from previous period for trend calculation
  const previousSessions = useMemo(() => {
    return getPreviousPeriodSessions(allSessions, timeRange);
  }, [allSessions, timeRange]);

  // Active Tab View: 'overview' | 'telemetry' | 'comparison' | 'records'
  const [activeTab, setActiveTab] = useState<"overview" | "telemetry" | "comparison" | "records">(
    "overview",
  );

  // Overview Metrics
  const metrics = useMemo(() => {
    return calculateOverviewMetrics(filteredSessions, previousSessions);
  }, [filteredSessions, previousSessions]);

  // Daily Activity Bar/Heatmap
  const dailyActivity = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 30;
    return calculateDailyActivity(filteredSessions, days);
  }, [filteredSessions, timeRange]);

  // Scatter Plot Data (Accuracy vs WPM)
  const scatterData = useMemo(() => {
    return filteredSessions.map((s, idx) => ({
      id: s.id || `sess-${idx}`,
      x: s.accuracy,
      y: s.wpm,
      date: new Date(s.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      mode: s.mode.toUpperCase(),
    }));
  }, [filteredSessions]);

  // Scatter Plot Interpretation
  const scatterInterpretation = useMemo(() => {
    return calculateScatterInterpretation(filteredSessions);
  }, [filteredSessions]);

  // Key & Finger Analysis
  const weakKeys = useMemo(() => calculateWeakKeys(filteredSessions), [filteredSessions]);
  const heatmapData = useMemo(() => calculateHeatmapData(filteredSessions), [filteredSessions]);
  const fingerStats = useMemo(() => calculateFingerZoneStats(filteredSessions), [filteredSessions]);

  // Mode Performance Breakdown
  const modeStats = useMemo(() => calculateModePerformance(filteredSessions), [filteredSessions]);

  // Coding Stats
  const codingStats = useMemo(() => calculateCodingStats(filteredSessions), [filteredSessions]);

  // Personal Records
  const personalRecords = useMemo(() => calculatePersonalRecords(allSessions), [allSessions]);

  // Drill Impact
  const drillImpact = useMemo(
    () => calculateDrillImpactStats(filteredSessions),
    [filteredSessions],
  );

  // Performance Insights
  const insights = useMemo(() => {
    return generatePerformanceInsights(filteredSessions, weakKeys, fingerStats);
  }, [filteredSessions, weakKeys, fingerStats]);

  // Session History Sort
  const [historySort, setHistorySort] = useState<"newest" | "fastest" | "accuracy">("newest");

  const sortedSessions = useMemo(() => {
    const list = [...filteredSessions];
    if (historySort === "newest") {
      return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else if (historySort === "fastest") {
      return list.sort((a, b) => b.wpm - a.wpm);
    } else if (historySort === "accuracy") {
      return list.sort((a, b) => b.accuracy - a.accuracy);
    }
    return list;
  }, [filteredSessions, historySort]);

  // Selected Session Modal for Inspection
  const [inspectSession, setInspectSession] = useState<SessionResult | null>(null);

  // Selected Key Modal for Inspection
  const [inspectKey, setInspectKey] = useState<WeakKeyAnalysis | null>(null);

  // Session Comparison Selector
  const [compareId1, setCompareId1] = useState<string>("");
  const [compareId2, setCompareId2] = useState<string>("");

  const session1 = useMemo(
    () => filteredSessions.find((s) => s.id === compareId1) || filteredSessions[0] || null,
    [filteredSessions, compareId1],
  );
  const session2 = useMemo(
    () => filteredSessions.find((s) => s.id === compareId2) || filteredSessions[1] || null,
    [filteredSessions, compareId2],
  );

  // Accuracy Trend Direction
  const accuracyTrendStatus = useMemo(() => {
    if (filteredSessions.length < 2) return "Stable";
    const half = Math.floor(filteredSessions.length / 2);
    const firstHalfAvg = filteredSessions.slice(0, half).reduce((a, b) => a + b.accuracy, 0) / half;
    const secondHalfAvg =
      filteredSessions.slice(half).reduce((a, b) => a + b.accuracy, 0) /
      (filteredSessions.length - half);
    if (secondHalfAvg - firstHalfAvg > 0.5) return "Improving";
    if (firstHalfAvg - secondHalfAvg > 0.5) return "Declining";
    return "Stable";
  }, [filteredSessions]);

  // Format total practice time cleanly
  const formattedPracticeTime = useMemo(() => {
    const totalSec = metrics.totalTimeSec;
    if (totalSec < 60) return `${totalSec}s`;
    const mins = Math.floor(totalSec / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins % 60}m`;
    }
    return `${mins}m`;
  }, [metrics.totalTimeSec]);

  // Chart Data for Speed Trend
  const speedChartData = useMemo(() => {
    return filteredSessions.map((s, idx) => ({
      index: idx + 1,
      date: new Date(s.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      wpm: s.wpm,
      rawWpm: s.rawWpm || s.wpm,
      accuracy: s.accuracy,
      mode: s.mode.toUpperCase(),
    }));
  }, [filteredSessions]);

  return (
    <PageTransition>
      <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <ScrollReveal className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#F3F5F2]/10 pb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#18C69A]/10 border border-[#18C69A]/30 text-xs font-semibold text-[#18C69A]">
              <LineChartIcon className="w-3.5 h-3.5 text-[#18C69A]" />
              <span>Performance Intelligence Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif text-[#F3F5F2] tracking-tight">
              Your performance, measured.
            </h1>
            <p className="text-base text-[#A6ADA8] max-w-2xl font-sans">
              See how your speed, accuracy, consistency, and practice habits are evolving.
            </p>
          </div>

          {/* Controls: Time-Range Selector & Section Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Time-Range Selector */}
            <div className="flex items-center bg-[#050807] p-1 rounded-xl border border-[#F3F5F2]/10">
              {(["7d", "30d", "90d", "all"] as TimeRange[]).map((range) => {
                const labelMap: Record<TimeRange, string> = {
                  "7d": "7 Days",
                  "30d": "30 Days",
                  "90d": "90 Days",
                  all: "All Time",
                };
                return (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      timeRange === range
                        ? "bg-[#18C69A] text-[#050807] font-bold shadow-sm"
                        : "text-[#A6ADA8] hover:text-[#F3F5F2]"
                    }`}
                  >
                    {labelMap[range]}
                  </button>
                );
              })}
            </div>

            {/* Nav Tabs */}
            <div className="flex items-center bg-[#050807] p-1 rounded-xl border border-[#F3F5F2]/10">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-[#111715] text-[#18C69A] font-bold border border-[#18C69A]/40"
                    : "text-[#A6ADA8] hover:text-[#F3F5F2]"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("telemetry")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "telemetry"
                    ? "bg-[#111715] text-[#18C69A] font-bold border border-[#18C69A]/40"
                    : "text-[#A6ADA8] hover:text-[#F3F5F2]"
                }`}
              >
                Telemetry
              </button>
              <button
                onClick={() => setActiveTab("comparison")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "comparison"
                    ? "bg-[#111715] text-[#18C69A] font-bold border border-[#18C69A]/40"
                    : "text-[#A6ADA8] hover:text-[#F3F5F2]"
                }`}
              >
                Comparison
              </button>
              <button
                onClick={() => setActiveTab("records")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "records"
                    ? "bg-[#111715] text-[#18C69A] font-bold border border-[#18C69A]/40"
                    : "text-[#A6ADA8] hover:text-[#F3F5F2]"
                }`}
              >
                Records
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Empty State Banner when 0 Total Sessions exist */}
        {allSessions.length === 0 && (
          <ScrollReveal className="bg-gradient-to-r from-kfa-900/80 via-kfn-900 to-kfa-950 p-8 rounded-3xl border border-kfa-500/30 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-kfa-600/30 border border-kfa-400/40 flex items-center justify-center mx-auto text-kfa-300">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Your first session will start your performance history
            </h2>
            <p className="text-sm text-kfa-200/80 max-w-xl mx-auto">
              Complete a few practice tests or code exercises to unlock real-time WPM speed curves,
              key error heatmaps, and finger latency analytics.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate && onNavigate("/practice")}
                className="px-6 py-3 bg-kfa-600 hover:bg-kfa-500 text-white rounded-2xl font-bold transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Practicing Now</span>
              </button>
            </div>
          </ScrollReveal>
        )}

        {/* 8 Overview Statistics Cards */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Average WPM */}
          <div className="p-5 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-kfn-500">
              <span>Average WPM</span>
              <Zap className="w-4 h-4 text-kfa-500" />
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold text-kfn-900 dark:text-white font-mono">
                {metrics.avgWpm > 0 ? metrics.avgWpm : "—"}
              </div>
            </div>
            <div className="text-xs font-semibold flex items-center gap-1">
              {metrics.trendWpm !== null ? (
                metrics.trendWpm >= 0 ? (
                  <span className="text-kfa-600 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +{metrics.trendWpm}% vs prev period
                  </span>
                ) : (
                  <span className="text-rose-500 flex items-center gap-0.5">
                    <ArrowDownRight className="w-3.5 h-3.5" /> {metrics.trendWpm}% vs prev period
                  </span>
                )
              ) : (
                <span className="text-kfn-400 font-normal">Not enough data yet</span>
              )}
            </div>
          </div>

          {/* Best WPM */}
          <div className="p-5 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-kfn-500">
              <span>Best WPM</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold text-kfn-900 dark:text-white font-mono">
                {metrics.bestWpm > 0 ? metrics.bestWpm : "—"}
              </div>
            </div>
            <div className="text-xs text-kfn-400">Personal Peak Velocity</div>
          </div>

          {/* Average Accuracy */}
          <div className="p-5 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-kfn-500">
              <span>Average Accuracy</span>
              <Target className="w-4 h-4 text-kfa-500" />
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold text-kfn-900 dark:text-white font-mono">
                {metrics.avgAccuracy > 0 ? `${metrics.avgAccuracy}%` : "—"}
              </div>
            </div>
            <div className="text-xs font-semibold">
              {metrics.trendAccuracy !== null ? (
                metrics.trendAccuracy >= 0 ? (
                  <span className="text-kfa-600 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +{metrics.trendAccuracy}% accuracy
                  </span>
                ) : (
                  <span className="text-rose-500 flex items-center gap-0.5">
                    <ArrowDownRight className="w-3.5 h-3.5" /> {metrics.trendAccuracy}% accuracy
                  </span>
                )
              ) : (
                <span className="text-kfn-400 font-normal">Not enough data yet</span>
              )}
            </div>
          </div>

          {/* Best Accuracy */}
          <div className="p-5 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-kfn-500">
              <span>Best Accuracy</span>
              <CheckCircle2 className="w-4 h-4 text-kfa-600" />
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold text-kfn-900 dark:text-white font-mono">
                {metrics.bestAccuracy > 0 ? `${metrics.bestAccuracy}%` : "—"}
              </div>
            </div>
            <div className="text-xs text-kfn-400">Top Precision Record</div>
          </div>

          {/* Average Consistency */}
          <div className="p-5 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-kfn-500">
              <span>Avg Consistency</span>
              <Activity className="w-4 h-4 text-kfa-500" />
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold text-kfn-900 dark:text-white font-mono">
                {metrics.avgConsistency > 0 ? `${metrics.avgConsistency}%` : "—"}
              </div>
            </div>
            <div className="text-xs text-kfn-400">Cadence Stability</div>
          </div>

          {/* Total Practice Time */}
          <div className="p-5 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-kfn-500">
              <span>Practice Time</span>
              <Clock className="w-4 h-4 text-kfa-500" />
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold text-kfn-900 dark:text-white font-mono">
                {formattedPracticeTime}
              </div>
            </div>
            <div className="text-xs text-kfn-400">Total Keyboard Time</div>
          </div>

          {/* Sessions Completed */}
          <div className="p-5 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-kfn-500">
              <span>Sessions</span>
              <Layers className="w-4 h-4 text-kfa-500" />
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold text-kfn-900 dark:text-white font-mono">
                {metrics.completedCount}
              </div>
            </div>
            <div className="text-xs text-kfn-400">Completed Practice Runs</div>
          </div>

          {/* Current Streak */}
          <div className="p-5 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-kfn-500">
              <span>Current Streak</span>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold text-kfn-900 dark:text-white font-mono">
                {metrics.currentStreak} {metrics.currentStreak === 1 ? "Day" : "Days"}
              </div>
            </div>
            <div className="text-xs text-orange-600 font-semibold">Active Daily Habit</div>
          </div>
        </StaggerContainer>

        {/* Tab 1: Overview Dashboard (Charts + Activity + Insights) */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* WPM Performance & Accuracy Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* WPM Trend Chart */}
              <div className="bg-white dark:bg-kfn-900 p-6 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-kfn-900 dark:text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-kfa-500" />
                      WPM Performance Curve
                    </h3>
                    <p className="text-xs text-kfn-500">Real session speed over selected period.</p>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-kfa-50 dark:bg-kfa-950 text-kfa-600 dark:text-kfa-300 font-semibold">
                    {filteredSessions.length} Sessions
                  </span>
                </div>

                {filteredSessions.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={speedChartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#18C69A" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#18C69A" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#20342D"
                          opacity={0.15}
                        />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "#68716C" }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "#68716C" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0D1210",
                            borderColor: "#20342D",
                            borderRadius: "12px",
                            color: "#FFF",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="wpm"
                          stroke="#18C69A"
                          strokeWidth={3}
                          fill="url(#wpmGradient)"
                          name="Net WPM"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-kfn-200 dark:border-kfn-800 rounded-2xl">
                    <Info className="w-8 h-8 text-kfn-400 mb-2" />
                    <p className="text-sm font-semibold text-kfn-700 dark:text-kfn-300">
                      No session data in this time range
                    </p>
                    <p className="text-xs text-kfn-500 mt-1">
                      Complete a typing test to unlock WPM speed curves.
                    </p>
                  </div>
                )}
              </div>

              {/* Accuracy Trend Chart */}
              <div className="bg-white dark:bg-kfn-900 p-6 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-kfn-900 dark:text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-kfa-500" />
                      Accuracy Trend
                    </h3>
                    <p className="text-xs text-kfn-500">Key precision stability across sessions.</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      accuracyTrendStatus === "Improving"
                        ? "bg-kfa-100 text-kfa-700 dark:bg-kfa-950 dark:text-kfa-300"
                        : accuracyTrendStatus === "Declining"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                          : "bg-kfn-100 text-kfn-700 dark:bg-kfn-800 dark:text-kfn-300"
                    }`}
                  >
                    Trend: {accuracyTrendStatus}
                  </span>
                </div>

                {filteredSessions.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={speedChartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="accGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#20B88A" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#20B88A" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#20342D"
                          opacity={0.15}
                        />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "#68716C" }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "#68716C" }}
                          domain={[80, 100]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0D1210",
                            borderColor: "#20342D",
                            borderRadius: "12px",
                            color: "#FFF",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="accuracy"
                          stroke="#20B88A"
                          strokeWidth={3}
                          fill="url(#accGradient)"
                          name="Accuracy %"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-kfn-200 dark:border-kfn-800 rounded-2xl">
                    <Info className="w-8 h-8 text-kfn-400 mb-2" />
                    <p className="text-sm font-semibold text-kfn-700 dark:text-kfn-300">
                      No session data in this time range
                    </p>
                    <p className="text-xs text-kfn-500 mt-1">
                      Complete practice tests to map precision trends.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Speed vs Accuracy Relationship Scatter Section */}
            <div className="bg-white dark:bg-kfn-900 p-6 sm:p-8 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg text-kfn-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-kfa-500" />
                    Speed vs. Accuracy Trade-off Scatter
                  </h3>
                  <p className="text-xs text-kfn-500">
                    Each dot represents an individual practice session. X = Accuracy %, Y = WPM.
                  </p>
                </div>
                <div className="p-3 bg-kfa-50/80 dark:bg-kfa-950/60 border border-kfa-200/60 dark:border-kfa-800 rounded-2xl text-xs text-kfa-900 dark:text-kfa-200 max-w-md">
                  <strong>Telemetry Insight:</strong> {scatterInterpretation}
                </div>
              </div>

              {filteredSessions.length >= 2 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#20342D" opacity={0.15} />
                      <XAxis
                        type="number"
                        dataKey="x"
                        name="Accuracy"
                        unit="%"
                        domain={[70, 100]}
                        tick={{ fontSize: 11, fill: "#68716C" }}
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        name="WPM"
                        unit=" WPM"
                        tick={{ fontSize: 11, fill: "#68716C" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0D1210",
                          borderColor: "#20342D",
                          borderRadius: "12px",
                          color: "#FFF",
                        }}
                      />
                      <Scatter name="Sessions" data={scatterData} fill="#18C69A">
                        {scatterData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.x >= 96 ? "#20B88A" : entry.x < 90 ? "#EF4444" : "#18C69A"}
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-kfn-200 dark:border-kfn-800 rounded-2xl text-kfn-500 text-xs">
                  <Info className="w-6 h-6 mb-1 text-kfn-400" />
                  <span>
                    Complete at least 2 sessions to populate the Speed vs Accuracy scatter graph.
                  </span>
                </div>
              )}
            </div>

            {/* Daily Practice Activity Bar Heatmap */}
            <div className="bg-white dark:bg-kfn-900 p-6 sm:p-8 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-kfn-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-kfa-500" />
                    Daily Practice Activity
                  </h3>
                  <p className="text-xs text-kfn-500">
                    Practice minutes and completed runs across the timeline.
                  </p>
                </div>
                <div className="text-xs font-mono text-kfn-400">
                  Total {metrics.completedCount} Runs in Filter
                </div>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyActivity}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#20342D"
                      opacity={0.15}
                    />
                    <XAxis
                      dataKey="displayDate"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#68716C" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#68716C" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0D1210",
                        borderColor: "#20342D",
                        borderRadius: "12px",
                        color: "#FFF",
                      }}
                      formatter={(value: any, name: any) => [
                        name === "minutes" ? `${value} min` : value,
                        name === "minutes" ? "Practice Time" : "Sessions",
                      ]}
                    />
                    <Bar
                      dataKey="minutes"
                      fill="#38D6AE"
                      radius={[6, 6, 0, 0]}
                      name="Practice Minutes"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance Insights Section */}
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-kfn-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-kfa-500" />
                Performance Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((ins) => (
                  <div
                    key={ins.id}
                    className={`p-5 rounded-3xl border transition-all ${
                      ins.type === "positive"
                        ? "bg-kfa-50/60 dark:bg-kfa-950/40 border-kfa-200/80 dark:border-kfa-800/60"
                        : ins.type === "warning"
                          ? "bg-amber-50/60 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/60"
                          : "bg-kfa-50/60 dark:bg-kfa-950/40 border-kfa-200/80 dark:border-kfa-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-kfn-900/80 shadow-xs">
                        {ins.badge}
                      </span>
                    </div>
                    <h4 className="font-bold text-kfn-900 dark:text-white text-base mb-1">
                      {ins.title}
                    </h4>
                    <p className="text-xs text-kfn-600 dark:text-kfn-300 leading-relaxed">
                      {ins.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mode Performance Breakdown Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xl text-kfn-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-kfa-500" />
                  Practice Mode Breakdown
                </h3>
                <span className="text-xs text-kfn-500">
                  Compare your typing speed across formats
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {modeStats.map((st) => (
                  <div
                    key={st.mode}
                    className="p-5 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="text-xs font-bold uppercase text-kfa-600 dark:text-kfa-400 mb-1">
                        {st.title}
                      </div>
                      <div className="text-2xl font-extrabold text-kfn-900 dark:text-white font-mono">
                        {st.sessions > 0 ? `${st.avgWpm} WPM` : "Unused"}
                      </div>
                    </div>

                    {st.sessions > 0 ? (
                      <div className="space-y-1 text-xs text-kfn-500 dark:text-kfn-400 font-mono">
                        <div>
                          Best: <strong>{st.bestWpm} WPM</strong>
                        </div>
                        <div>
                          Accuracy: <strong>{st.avgAccuracy}%</strong>
                        </div>
                        <div>
                          Sessions: <strong>{st.sessions}</strong>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-kfn-400 space-y-2">
                        <p>No practice runs recorded yet.</p>
                        <button
                          onClick={() => onNavigate && onNavigate("/practice")}
                          className="text-xs text-kfa-600 dark:text-kfa-400 font-bold hover:underline cursor-pointer"
                        >
                          Try {st.title} →
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Coding Performance Section */}
            <div className="bg-kfn-900 text-white p-6 sm:p-8 rounded-3xl border border-kfn-800 shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kfa-950 border border-kfa-700/60 text-xs font-semibold text-kfa-300">
                    <Code className="w-3.5 h-3.5 text-kfa-400" />
                    <span>Programming & Syntax Telemetry</span>
                  </div>
                  <h3 className="text-2xl font-bold">Coding Speed & Symbol Precision</h3>
                </div>
                {!codingStats.hasData && (
                  <button
                    onClick={() => onNavigate && onNavigate("/practice")}
                    className="px-4 py-2 bg-kfa-600 hover:bg-kfa-500 text-white rounded-xl font-bold text-xs cursor-pointer transition-colors"
                  >
                    Start Code Practice →
                  </button>
                )}
              </div>

              {codingStats.hasData ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-kfn-800/80 rounded-2xl border border-kfn-700/80">
                    <div className="text-xs text-kfn-400 mb-1">Code WPM</div>
                    <div className="text-2xl font-bold font-mono text-kfa-400">
                      {codingStats.codeWpm}
                    </div>
                  </div>
                  <div className="p-4 bg-kfn-800/80 rounded-2xl border border-kfn-700/80">
                    <div className="text-xs text-kfn-400 mb-1">Code Accuracy</div>
                    <div className="text-2xl font-bold font-mono text-kfa-400">
                      {codingStats.codeAccuracy}%
                    </div>
                  </div>
                  <div className="p-4 bg-kfn-800/80 rounded-2xl border border-kfn-700/80">
                    <div className="text-xs text-kfn-400 mb-1">Symbol Precision</div>
                    <div className="text-2xl font-bold font-mono text-kfa-400">
                      {codingStats.symbolAccuracy}%
                    </div>
                  </div>
                  <div className="p-4 bg-kfn-800/80 rounded-2xl border border-kfn-700/80">
                    <div className="text-xs text-kfn-400 mb-1">Bracket Match Acc</div>
                    <div className="text-2xl font-bold font-mono text-amber-400">
                      {codingStats.bracketAccuracy}%
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-kfn-800/40 rounded-2xl border border-dashed border-kfn-700 text-center space-y-2">
                  <p className="text-sm font-semibold text-kfn-300">
                    Complete a coding session to unlock coding insights.
                  </p>
                  <p className="text-xs text-kfn-400 max-w-md mx-auto">
                    Practice JavaScript, Python, Java, HTML, CSS, or SQL syntax to analyze symbol
                    reach latency and bracket placement accuracy.
                  </p>
                </div>
              )}
            </div>

            {/* Drill Impact Section */}
            <div className="bg-white dark:bg-kfn-900 p-6 sm:p-8 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl text-kfn-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Drill Impact & Weak Key Progress
                  </h3>
                  <p className="text-xs text-kfn-500">
                    How targeted practice drills correlate with key reach accuracy.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate && onNavigate("/drills")}
                  className="px-3.5 py-1.5 bg-kfa-50 dark:bg-kfa-950 text-kfa-600 dark:text-kfa-400 hover:bg-kfa-100 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                >
                  Go to Drills Studio →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 bg-kfn-50 dark:bg-kfn-800/60 rounded-2xl space-y-2 border border-kfn-200 dark:border-kfn-700">
                  <div className="text-xs text-kfn-500">Completed Drills</div>
                  <div className="text-3xl font-extrabold font-mono text-kfn-900 dark:text-white">
                    {drillImpact.drillsCompleted}
                  </div>
                  <div className="text-xs text-kfa-600 dark:text-kfa-400 font-semibold">
                    Most Practiced: {drillImpact.mostPracticedDrillTitle}
                  </div>
                </div>

                <div className="md:col-span-2 p-5 bg-kfn-50 dark:bg-kfn-800/60 rounded-2xl border border-kfn-200 dark:border-kfn-700 space-y-3">
                  <div className="text-xs font-bold uppercase text-kfn-500">
                    Key Accuracy Before vs After Drills
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {drillImpact.beforeAfterComparison.map((item) => (
                      <div
                        key={item.key}
                        className="p-3 bg-white dark:bg-kfn-900 rounded-xl border border-kfn-200 dark:border-kfn-800 space-y-1"
                      >
                        <div className="text-xs font-bold font-mono text-kfa-600 dark:text-kfa-400">
                          Key '{item.key}'
                        </div>
                        <div className="text-xs text-kfn-500">Before: {item.beforeAcc}%</div>
                        <div className="text-sm font-bold text-kfa-600">
                          After: {item.afterAcc}%
                        </div>
                        <div className="text-[10px] text-kfa-500 font-semibold">
                          +{item.improvement}% gain
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Session History Table */}
            <div className="bg-white dark:bg-kfn-900 p-6 sm:p-8 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-xl text-kfn-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-kfa-500" />
                    Session History
                  </h3>
                  <p className="text-xs text-kfn-500">Detailed list of recorded practice runs.</p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-kfn-500 font-medium">Sort by:</span>
                  <select
                    value={historySort}
                    onChange={(e) => setHistorySort(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl border border-kfn-200 dark:border-kfn-700 bg-kfn-50 dark:bg-kfn-800 text-kfn-900 dark:text-white font-semibold cursor-pointer outline-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="fastest">Fastest WPM</option>
                    <option value="accuracy">Highest Accuracy</option>
                  </select>
                </div>
              </div>

              {sortedSessions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-kfn-600 dark:text-kfn-300">
                    <thead className="bg-kfn-50 dark:bg-kfn-800/80 text-kfn-500 font-bold uppercase text-[10px] tracking-wider border-b border-kfn-200 dark:border-kfn-700">
                      <tr>
                        <th className="py-3 px-4 rounded-l-xl">Date & Time</th>
                        <th className="py-3 px-4">Format</th>
                        <th className="py-3 px-4">WPM</th>
                        <th className="py-3 px-4">Accuracy</th>
                        <th className="py-3 px-4">Consistency</th>
                        <th className="py-3 px-4">Duration</th>
                        <th className="py-3 px-4 text-right rounded-r-xl">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-kfn-100 dark:divide-kfn-800">
                      {sortedSessions.map((s, idx) => (
                        <tr
                          key={s.id || idx}
                          className="hover:bg-kfn-50/80 dark:hover:bg-kfn-800/40 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono font-medium text-kfn-900 dark:text-white">
                            {new Date(s.timestamp).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3 px-4 capitalize font-semibold text-kfa-600 dark:text-kfa-400">
                            {s.mode} {s.modeDetail ? `(${s.modeDetail})` : ""}
                          </td>
                          <td className="py-3 px-4 font-bold font-mono text-kfn-900 dark:text-white">
                            {s.wpm} WPM
                          </td>
                          <td className="py-3 px-4 font-semibold text-kfa-600 dark:text-kfa-400">
                            {s.accuracy}%
                          </td>
                          <td className="py-3 px-4 font-semibold text-kfa-600 dark:text-kfa-400">
                            {s.consistency || 92}%
                          </td>
                          <td className="py-3 px-4 font-mono">{s.timeSec || 30}s</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setInspectSession(s)}
                              className="px-2.5 py-1 bg-kfa-50 dark:bg-kfa-950 text-kfa-600 dark:text-kfa-300 hover:bg-kfa-100 rounded-lg font-bold transition-colors cursor-pointer"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-kfn-200 dark:border-kfn-800 rounded-2xl text-kfn-500 text-xs">
                  No sessions recorded in this time filter.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Key Telemetry (Virtual Keyboard Heatmap & Finger Analysis) */}
        {activeTab === "telemetry" && (
          <div className="space-y-8">
            {/* Interactive Heatmap Card */}
            <div className="bg-white dark:bg-kfn-900 p-6 sm:p-8 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl text-kfn-900 dark:text-white flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-500" />
                    Interactive Keyboard Heatmap
                  </h3>
                  <p className="text-xs text-kfn-500">
                    Color-coded accuracy and actuation latency for each individual key.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="flex items-center gap-1 text-kfa-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-kfa-500 inline-block"></span>{" "}
                    Optimal
                  </span>
                  <span className="flex items-center gap-1 text-amber-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>{" "}
                    Warm
                  </span>
                  <span className="flex items-center gap-1 text-rose-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>{" "}
                    Hotspot
                  </span>
                </div>
              </div>

              <VirtualKeyboard isHeatmapMode={true} heatmapData={heatmapData} size="md" />
            </div>

            {/* Key Breakdown Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weakest / Most Error-Prone Keys */}
              <div className="bg-white dark:bg-kfn-900 p-6 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-4">
                <h3 className="font-bold text-lg text-kfn-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  Weakest & Error-Prone Key Reaches
                </h3>
                <div className="space-y-2">
                  {weakKeys.slice(0, 5).map((w) => (
                    <div
                      key={w.key}
                      onClick={() => setInspectKey(w)}
                      className="p-3 bg-kfn-50 dark:bg-kfn-800/60 hover:bg-kfa-50 dark:hover:bg-kfa-950/60 rounded-2xl border border-kfn-200/80 dark:border-kfn-700 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-extrabold font-mono flex items-center justify-center text-lg">
                          {w.key.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-kfn-900 dark:text-white">
                            {w.finger} Zone
                          </div>
                          <div className="text-[11px] text-kfn-500">{w.reason}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-extrabold font-mono text-rose-600">
                          {w.accuracy}% Acc
                        </div>
                        <div className="text-[10px] text-kfn-400">{w.errorCount} Errors</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strongest Keys */}
              <div className="bg-white dark:bg-kfn-900 p-6 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-4">
                <h3 className="font-bold text-lg text-kfn-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-kfa-500" />
                  Strongest Key Reaches
                </h3>
                <div className="space-y-2">
                  {weakKeys
                    .slice(-5)
                    .reverse()
                    .map((w) => (
                      <div
                        key={w.key}
                        onClick={() => setInspectKey(w)}
                        className="p-3 bg-kfn-50 dark:bg-kfn-800/60 hover:bg-kfa-50 dark:hover:bg-kfa-950/60 rounded-2xl border border-kfn-200/80 dark:border-kfn-700 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-kfa-100 dark:bg-kfa-950 text-kfa-700 dark:text-kfa-300 font-extrabold font-mono flex items-center justify-center text-lg">
                            {w.key.toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-kfn-900 dark:text-white">
                              {w.finger} Zone
                            </div>
                            <div className="text-[11px] text-kfn-500">Fluid muscle memory</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-extrabold font-mono text-kfa-600">
                            {w.accuracy}% Acc
                          </div>
                          <div className="text-[10px] text-kfn-400">{w.presses} Presses</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Finger Zone Performance Grid */}
            <div className="bg-white dark:bg-kfn-900 p-6 sm:p-8 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-4">
              <h3 className="font-bold text-xl text-kfn-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-kfa-500" />
                8-Zone Finger Ergonomics & Workload
              </h3>
              <p className="text-xs text-kfn-500">
                Performance and accuracy broken down by finger placement.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {fingerStats.map((fz) => (
                  <div
                    key={fz.finger}
                    className="p-4 bg-kfn-50 dark:bg-kfn-800/60 rounded-2xl border border-kfn-200 dark:border-kfn-700 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-kfn-900 dark:text-white">
                        {fz.finger}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          fz.trend === "Improving"
                            ? "bg-kfa-100 text-kfa-700"
                            : "bg-kfn-200 text-kfn-700"
                        }`}
                      >
                        {fz.trend}
                      </span>
                    </div>
                    <div className="text-2xl font-extrabold font-mono text-kfa-600 dark:text-kfa-400">
                      {fz.accuracy}%
                    </div>
                    <div className="text-[11px] text-kfn-500">
                      Keys: {fz.keys.slice(0, 4).join(", ").toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Session Comparison & Drill Connect */}
        {activeTab === "comparison" && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-kfn-900 p-6 sm:p-8 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-6">
              <div>
                <h3 className="font-bold text-xl text-kfn-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-kfa-500" />
                  Side-by-Side Session Comparison Tool
                </h3>
                <p className="text-xs text-kfn-500">
                  Select two sessions to compare WPM, accuracy, consistency, and errors.
                </p>
              </div>

              {filteredSessions.length >= 2 ? (
                <div className="space-y-6">
                  {/* Selector Dropdowns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-kfn-50 dark:bg-kfn-800/60 rounded-2xl border border-kfn-200 dark:border-kfn-700 space-y-2">
                      <label className="text-xs font-bold text-kfn-700 dark:text-kfn-300">
                        Session 1 (Baseline)
                      </label>
                      <select
                        value={compareId1 || filteredSessions[0]?.id || ""}
                        onChange={(e) => setCompareId1(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-kfn-300 dark:border-kfn-600 bg-white dark:bg-kfn-900 text-xs font-semibold text-kfn-900 dark:text-white outline-none"
                      >
                        {filteredSessions.map((s, idx) => (
                          <option key={s.id || idx} value={s.id}>
                            {new Date(s.timestamp).toLocaleDateString()} - {s.mode.toUpperCase()} (
                            {s.wpm} WPM / {s.accuracy}%)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="p-4 bg-kfn-50 dark:bg-kfn-800/60 rounded-2xl border border-kfn-200 dark:border-kfn-700 space-y-2">
                      <label className="text-xs font-bold text-kfn-700 dark:text-kfn-300">
                        Session 2 (Comparison)
                      </label>
                      <select
                        value={compareId2 || filteredSessions[1]?.id || ""}
                        onChange={(e) => setCompareId2(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-kfn-300 dark:border-kfn-600 bg-white dark:bg-kfn-900 text-xs font-semibold text-kfn-900 dark:text-white outline-none"
                      >
                        {filteredSessions.map((s, idx) => (
                          <option key={s.id || idx} value={s.id}>
                            {new Date(s.timestamp).toLocaleDateString()} - {s.mode.toUpperCase()} (
                            {s.wpm} WPM / {s.accuracy}%)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Comparison Diff Table */}
                  {session1 && session2 && (
                    <div className="p-6 bg-kfn-50 dark:bg-kfn-800/40 rounded-2xl border border-kfn-200 dark:border-kfn-700 space-y-4">
                      <div className="grid grid-cols-3 text-center text-xs font-bold border-b border-kfn-200 dark:border-kfn-700 pb-3">
                        <div className="text-kfa-600 dark:text-kfa-400">Session 1</div>
                        <div className="text-kfn-500">Metric Delta</div>
                        <div className="text-kfa-600 dark:text-kfa-400">Session 2</div>
                      </div>

                      {/* WPM Diff */}
                      <div className="grid grid-cols-3 text-center items-center py-2 border-b border-kfn-100 dark:border-kfn-800">
                        <div className="font-extrabold font-mono text-lg">{session1.wpm} WPM</div>
                        <div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                              session2.wpm - session1.wpm >= 0
                                ? "bg-kfa-100 text-kfa-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {session2.wpm - session1.wpm >= 0
                              ? `+${session2.wpm - session1.wpm}`
                              : session2.wpm - session1.wpm}{" "}
                            WPM
                          </span>
                        </div>
                        <div className="font-extrabold font-mono text-lg">{session2.wpm} WPM</div>
                      </div>

                      {/* Accuracy Diff */}
                      <div className="grid grid-cols-3 text-center items-center py-2 border-b border-kfn-100 dark:border-kfn-800">
                        <div className="font-extrabold font-mono text-lg">{session1.accuracy}%</div>
                        <div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                              session2.accuracy - session1.accuracy >= 0
                                ? "bg-kfa-100 text-kfa-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {(session2.accuracy - session1.accuracy).toFixed(1)}% Acc
                          </span>
                        </div>
                        <div className="font-extrabold font-mono text-lg">{session2.accuracy}%</div>
                      </div>

                      {/* Consistency Diff */}
                      <div className="grid grid-cols-3 text-center items-center py-2">
                        <div className="font-extrabold font-mono text-lg">
                          {session1.consistency || 92}%
                        </div>
                        <div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-kfa-100 text-kfa-700">
                            {((session2.consistency || 92) - (session1.consistency || 92)).toFixed(
                              0,
                            )}
                            % Cons
                          </span>
                        </div>
                        <div className="font-extrabold font-mono text-lg">
                          {session2.consistency || 92}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-kfn-200 dark:border-kfn-800 rounded-2xl text-kfn-500 text-xs">
                  At least 2 practice sessions are required to run a side-by-side comparison.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Personal Records */}
        {activeTab === "records" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-2xl text-kfn-900 dark:text-white flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-500" />
                  Personal Records Hall of Fame
                </h3>
                <p className="text-xs text-kfn-500">
                  Milestones dynamically calculated from real practice history.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Fastest WPM */}
              <div className="p-6 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-3">
                <div className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400">
                  Fastest WPM
                </div>
                <div className="text-4xl font-extrabold font-mono text-kfn-900 dark:text-white">
                  {personalRecords.fastestWpm
                    ? `${personalRecords.fastestWpm.value} WPM`
                    : "Not set"}
                </div>
                {personalRecords.fastestWpm && (
                  <div className="text-xs text-kfn-400">
                    Achieved on {personalRecords.fastestWpm.date} ({personalRecords.fastestWpm.mode}{" "}
                    mode)
                  </div>
                )}
              </div>

              {/* Highest Accuracy */}
              <div className="p-6 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-3">
                <div className="text-xs font-bold uppercase text-kfa-600 dark:text-kfa-400">
                  Highest Accuracy
                </div>
                <div className="text-4xl font-extrabold font-mono text-kfn-900 dark:text-white">
                  {personalRecords.highestAccuracy
                    ? `${personalRecords.highestAccuracy.value}%`
                    : "Not set"}
                </div>
                {personalRecords.highestAccuracy && (
                  <div className="text-xs text-kfn-400">
                    Achieved on {personalRecords.highestAccuracy.date}
                  </div>
                )}
              </div>

              {/* Best Consistency */}
              <div className="p-6 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-3">
                <div className="text-xs font-bold uppercase text-kfa-600 dark:text-kfa-400">
                  Best Consistency
                </div>
                <div className="text-4xl font-extrabold font-mono text-kfn-900 dark:text-white">
                  {personalRecords.bestConsistency
                    ? `${personalRecords.bestConsistency.value}%`
                    : "Not set"}
                </div>
                {personalRecords.bestConsistency && (
                  <div className="text-xs text-kfn-400">
                    Achieved on {personalRecords.bestConsistency.date}
                  </div>
                )}
              </div>

              {/* Most Sessions in a Day */}
              <div className="p-6 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-3">
                <div className="text-xs font-bold uppercase text-kfa-600 dark:text-kfa-400">
                  Most Practice Sessions in a Day
                </div>
                <div className="text-4xl font-extrabold font-mono text-kfn-900 dark:text-white">
                  {personalRecords.mostSessionsInDay
                    ? personalRecords.mostSessionsInDay.count
                    : "0"}
                </div>
                {personalRecords.mostSessionsInDay && (
                  <div className="text-xs text-kfn-400">
                    Set on {personalRecords.mostSessionsInDay.date}
                  </div>
                )}
              </div>

              {/* Best Code WPM */}
              <div className="p-6 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-3">
                <div className="text-xs font-bold uppercase text-kfa-600 dark:text-kfa-400">
                  Best Code WPM
                </div>
                <div className="text-4xl font-extrabold font-mono text-kfn-900 dark:text-white">
                  {personalRecords.bestCodeWpm !== null
                    ? `${personalRecords.bestCodeWpm} WPM`
                    : "Not set"}
                </div>
                <div className="text-xs text-kfn-400">Programming syntax speed</div>
              </div>

              {/* Longest Streak */}
              <div className="p-6 bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-3">
                <div className="text-xs font-bold uppercase text-orange-600 dark:text-orange-400">
                  Longest Streak
                </div>
                <div className="text-4xl font-extrabold font-mono text-kfn-900 dark:text-white">
                  {personalRecords.longestStreak}{" "}
                  {personalRecords.longestStreak === 1 ? "Day" : "Days"}
                </div>
                <div className="text-xs text-kfn-400">Consecutive daily practice runs</div>
              </div>
            </div>
          </div>
        )}

        {/* Session Inspector Modal */}
        <AnimatePresence>
          {inspectSession && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-kfn-950/70 backdrop-blur-xs">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-kfn-900 p-6 sm:p-8 rounded-3xl border border-kfn-200 dark:border-kfn-800 max-w-xl w-full shadow-2xl space-y-6"
              >
                <div className="flex items-center justify-between border-b border-kfn-200 dark:border-kfn-800 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-kfn-900 dark:text-white">
                      Session Telemetry Details
                    </h3>
                    <p className="text-xs text-kfn-500">
                      {new Date(inspectSession.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setInspectSession(null)}
                    className="p-2 rounded-xl text-kfn-400 hover:text-kfn-900 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-kfa-50 dark:bg-kfa-950/60 rounded-2xl">
                    <div className="text-xs text-kfn-500">Speed</div>
                    <div className="text-2xl font-bold font-mono text-kfa-600 dark:text-kfa-400">
                      {inspectSession.wpm} WPM
                    </div>
                  </div>
                  <div className="p-4 bg-kfa-50 dark:bg-kfa-950/60 rounded-2xl">
                    <div className="text-xs text-kfn-500">Accuracy</div>
                    <div className="text-2xl font-bold font-mono text-kfa-600 dark:text-kfa-400">
                      {inspectSession.accuracy}%
                    </div>
                  </div>
                  <div className="p-4 bg-kfa-50 dark:bg-kfa-950/60 rounded-2xl">
                    <div className="text-xs text-kfn-500">Consistency</div>
                    <div className="text-2xl font-bold font-mono text-kfa-600 dark:text-kfa-400">
                      {inspectSession.consistency || 92}%
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-kfn-700 dark:text-kfn-300">
                    Snippet Typed:
                  </label>
                  <div className="p-3 bg-kfn-50 dark:bg-kfn-800/60 rounded-2xl font-mono text-xs text-kfn-800 dark:text-kfn-200 max-h-32 overflow-y-auto">
                    {inspectSession.snippet || "Practice snippet text unavailable."}
                  </div>
                </div>

                {inspectSession.errorKeys && inspectSession.errorKeys.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-rose-600">Keys with Mis-hits:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {inspectSession.errorKeys.map((k, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono text-xs rounded-lg font-bold"
                        >
                          {k.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setInspectSession(null)}
                  className="w-full py-3 bg-kfa-600 hover:bg-kfa-500 text-white font-bold rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  Close Inspection
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Key Inspection Modal */}
        <AnimatePresence>
          {inspectKey && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-kfn-950/70 backdrop-blur-xs">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-kfn-900 p-6 sm:p-8 rounded-3xl border border-kfn-200 dark:border-kfn-800 max-w-md w-full shadow-2xl space-y-6"
              >
                <div className="flex items-center justify-between border-b border-kfn-200 dark:border-kfn-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-kfa-600 text-white font-mono font-extrabold text-2xl flex items-center justify-center">
                      {inspectKey.key.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-kfn-900 dark:text-white">
                        Key Telemetry Breakdown
                      </h3>
                      <p className="text-xs text-kfn-500">{inspectKey.finger} Finger Zone</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectKey(null)}
                    className="p-2 rounded-xl text-kfn-400 hover:text-kfn-900 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-kfn-50 dark:bg-kfn-800/60 rounded-xl">
                    <div className="text-xs text-kfn-500">Accuracy</div>
                    <div className="text-xl font-bold font-mono text-kfa-600 dark:text-kfa-400">
                      {inspectKey.accuracy}%
                    </div>
                  </div>
                  <div className="p-3 bg-kfn-50 dark:bg-kfn-800/60 rounded-xl">
                    <div className="text-xs text-kfn-500">Errors</div>
                    <div className="text-xl font-bold font-mono text-rose-500">
                      {inspectKey.errorCount}
                    </div>
                  </div>
                  <div className="p-3 bg-kfn-50 dark:bg-kfn-800/60 rounded-xl">
                    <div className="text-xs text-kfn-500">Total Presses</div>
                    <div className="text-xl font-bold font-mono text-kfn-900 dark:text-white">
                      {inspectKey.presses}
                    </div>
                  </div>
                  <div className="p-3 bg-kfn-50 dark:bg-kfn-800/60 rounded-xl">
                    <div className="text-xs text-kfn-500 font-mono">Reaction Latency</div>
                    <div className="text-xl font-bold font-mono text-kfa-500">
                      {inspectKey.avgReactionMs}ms
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-kfa-50 dark:bg-kfa-950/60 rounded-xl text-xs text-kfa-900 dark:text-kfa-200">
                  <strong>Recommendation:</strong> {inspectKey.reason}
                </div>

                <button
                  onClick={() => setInspectKey(null)}
                  className="w-full py-3 bg-kfa-600 hover:bg-kfa-500 text-white font-bold rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  Close Key Analysis
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

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
      <div className="py-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <ScrollReveal className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#262626] pb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#18C69A]/10 border border-[#18C69A]/30 text-xs font-semibold text-[#18C69A]">
              <LineChartIcon className="w-3.5 h-3.5 text-[#18C69A]" />
              <span>Performance Intelligence Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#F5F5F5] tracking-tight">
              Your performance, measured.
            </h1>
            <p className="text-sm sm:text-base text-[#A0A0A0] max-w-2xl font-sans">
              See how your speed, accuracy, consistency, and practice habits are evolving.
            </p>
          </div>

          {/* Controls: Time-Range Selector & Section Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Time-Range Selector */}
            <div className="flex items-center bg-[#111111] p-1 rounded-xl border border-[#262626]">
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
                        ? "bg-[#18C69A] text-[#0A0A0A] font-bold shadow-sm"
                        : "text-[#A0A0A0] hover:text-[#F5F5F5]"
                    }`}
                  >
                    {labelMap[range]}
                  </button>
                );
              })}
            </div>

            {/* Nav Tabs */}
            <div className="flex items-center bg-[#111111] p-1 rounded-xl border border-[#262626]">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-[#18C69A] text-[#0A0A0A] font-bold"
                    : "text-[#A0A0A0] hover:text-[#F5F5F5]"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("telemetry")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "telemetry"
                    ? "bg-[#18C69A] text-[#0A0A0A] font-bold"
                    : "text-[#A0A0A0] hover:text-[#F5F5F5]"
                }`}
              >
                Telemetry
              </button>
              <button
                onClick={() => setActiveTab("comparison")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "comparison"
                    ? "bg-[#18C69A] text-[#0A0A0A] font-bold"
                    : "text-[#A0A0A0] hover:text-[#F5F5F5]"
                }`}
              >
                Comparison
              </button>
              <button
                onClick={() => setActiveTab("records")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "records"
                    ? "bg-[#18C69A] text-[#0A0A0A] font-bold"
                    : "text-[#A0A0A0] hover:text-[#F5F5F5]"
                }`}
              >
                Records
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Empty State Banner when 0 Total Sessions exist */}
        {allSessions.length === 0 && (
          <ScrollReveal className="bg-[#151515] p-8 rounded-3xl border border-[#262626] shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#18C69A]/10 border border-[#18C69A]/30 flex items-center justify-center mx-auto text-[#18C69A]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-[#F5F5F5]">
              Your first session will start your performance history
            </h2>
            <p className="text-sm text-[#A0A0A0] max-w-xl mx-auto">
              Complete a few practice tests or code exercises to unlock real-time WPM speed curves,
              key error heatmaps, and finger latency analytics.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate && onNavigate("/practice")}
                className="px-6 py-3 bg-[#18C69A] hover:bg-[#14A782] text-[#0A0A0A] rounded-2xl font-bold transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Practicing Now</span>
              </button>
            </div>
          </ScrollReveal>
        )}

        {/* 8 Overview Statistics Cards */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Average WPM - Cyan Accent */}
          <div className="p-5 bg-[#151515] rounded-2xl border border-[#262626] hover:border-[#45D6E8]/40 transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between text-xs text-[#A0A0A0] font-mono uppercase font-semibold group-hover:text-[#45D6E8] transition-colors">
              <span>Average WPM</span>
              <div className="p-1 rounded bg-[#45D6E8]/10 text-[#45D6E8] border border-[#45D6E8]/20">
                <Zap className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold text-[#45D6E8] font-mono">
                {metrics.avgWpm > 0 ? metrics.avgWpm : "—"}
              </div>
            </div>
            <div className="text-xs font-semibold flex items-center gap-1 font-mono">
              {metrics.trendWpm !== null ? (
                metrics.trendWpm >= 0 ? (
                  <span className="text-[#79D88B] flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +{metrics.trendWpm}% vs prev
                  </span>
                ) : (
                  <span className="text-[#F05A9D] flex items-center gap-0.5">
                    <ArrowDownRight className="w-3.5 h-3.5" /> {metrics.trendWpm}% vs prev
                  </span>
                )
              ) : (
                <span className="text-[#666666] font-normal">Need more data</span>
              )}
            </div>
          </div>

          {/* Best WPM - Cyan Accent */}
          <div className="p-5 bg-[#151515] rounded-2xl border border-[#262626] hover:border-[#45D6E8]/40 transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between text-xs text-[#A0A0A0] font-mono uppercase font-semibold group-hover:text-[#45D6E8] transition-colors">
              <span>Best WPM</span>
              <div className="p-1 rounded bg-[#45D6E8]/10 text-[#45D6E8] border border-[#45D6E8]/20">
                <Award className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold text-[#45D6E8] font-mono">
                {metrics.bestWpm > 0 ? metrics.bestWpm : "—"}
              </div>
            </div>
            <div className="text-xs text-[#A0A0A0]">Personal Peak Velocity</div>
          </div>

          {/* Average Accuracy - Soft Green Accent */}
          <div className="p-5 bg-[#151515] rounded-2xl border border-[#262626] hover:border-[#79D88B]/40 transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between text-xs text-[#A0A0A0] font-mono uppercase font-semibold group-hover:text-[#79D88B] transition-colors">
              <span>Average Accuracy</span>
              <div className="p-1 rounded bg-[#79D88B]/10 text-[#79D88B] border border-[#79D88B]/20">
                <Target className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold text-[#F5F5F5] font-mono">
                {metrics.avgAccuracy > 0 ? `${metrics.avgAccuracy}%` : "—"}
              </div>
            </div>
            <div className="text-xs font-semibold font-mono">
              {metrics.trendAccuracy !== null ? (
                metrics.trendAccuracy >= 0 ? (
                  <span className="text-[#79D88B] flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +{metrics.trendAccuracy}% accuracy
                  </span>
                ) : (
                  <span className="text-[#F05A9D] flex items-center gap-0.5">
                    <ArrowDownRight className="w-3.5 h-3.5" /> {metrics.trendAccuracy}% accuracy
                  </span>
                )
              ) : (
                <span className="text-[#666666] font-normal">Need more data</span>
              )}
            </div>
          </div>

          {/* Best Accuracy - Soft Green Accent */}
          <div className="p-5 bg-[#151515] rounded-2xl border border-[#262626] hover:border-[#79D88B]/40 transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between text-xs text-[#A0A0A0] font-mono uppercase font-semibold group-hover:text-[#79D88B] transition-colors">
              <span>Best Accuracy</span>
              <div className="p-1 rounded bg-[#79D88B]/10 text-[#79D88B] border border-[#79D88B]/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold text-[#79D88B] font-mono">
                {metrics.bestAccuracy > 0 ? `${metrics.bestAccuracy}%` : "—"}
              </div>
            </div>
            <div className="text-xs text-[#A0A0A0]">Top Precision Record</div>
          </div>

          {/* Average Consistency - Purple Accent */}
          <div className="p-5 bg-[#151515] rounded-2xl border border-[#262626] hover:border-[#B85CFF]/40 transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between text-xs text-[#A0A0A0] font-mono uppercase font-semibold group-hover:text-[#B85CFF] transition-colors">
              <span>Avg Consistency</span>
              <div className="p-1 rounded bg-[#B85CFF]/10 text-[#B85CFF] border border-[#B85CFF]/20">
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold text-[#B85CFF] font-mono">
                {metrics.avgConsistency > 0 ? `${metrics.avgConsistency}%` : "—"}
              </div>
            </div>
            <div className="text-xs text-[#A0A0A0]">Cadence Stability</div>
          </div>

          {/* Total Practice Time - Slate / Neutral Accent */}
          <div className="p-5 bg-[#151515] rounded-2xl border border-[#262626] hover:border-[#F5F5F5]/30 transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between text-xs text-[#A0A0A0] font-mono uppercase font-semibold group-hover:text-[#F5F5F5] transition-colors">
              <span>Practice Time</span>
              <div className="p-1 rounded bg-[#181818] text-[#A0A0A0] border border-[#262626]">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold text-[#F5F5F5] font-mono">
                {formattedPracticeTime}
              </div>
            </div>
            <div className="text-xs text-[#A0A0A0]">Total Keyboard Time</div>
          </div>

          {/* Sessions Completed - Cyan Accent */}
          <div className="p-5 bg-[#151515] rounded-2xl border border-[#262626] hover:border-[#45D6E8]/40 transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between text-xs text-[#A0A0A0] font-mono uppercase font-semibold group-hover:text-[#45D6E8] transition-colors">
              <span>Sessions</span>
              <div className="p-1 rounded bg-[#45D6E8]/10 text-[#45D6E8] border border-[#45D6E8]/20">
                <Layers className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold text-[#F5F5F5] font-mono">
                {metrics.completedCount}
              </div>
            </div>
            <div className="text-xs text-[#A0A0A0]">Completed Practice Runs</div>
          </div>

          {/* Current Streak - Gold Accent */}
          <div className="p-5 bg-[#151515] rounded-2xl border border-[#262626] hover:border-[#F4D35E]/40 transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between text-xs text-[#A0A0A0] font-mono uppercase font-semibold group-hover:text-[#F4D35E] transition-colors">
              <span>Current Streak</span>
              <div className="p-1 rounded bg-[#F4D35E]/10 text-[#F4D35E] border border-[#F4D35E]/20">
                <Flame className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold text-[#F4D35E] font-mono">
                {metrics.currentStreak} {metrics.currentStreak === 1 ? "Day" : "Days"}
              </div>
            </div>
            <div className="text-xs text-[#F4D35E]/80 font-semibold font-mono">
              Active Daily Habit
            </div>
          </div>
        </StaggerContainer>

        {/* Tab 1: Overview Dashboard (Charts + Activity + Insights) */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* WPM Performance & Accuracy Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* WPM Trend Chart */}
              <div className="bg-[#151515] p-6 rounded-2xl border border-[#262626] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-[#F5F5F5] flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#45D6E8]" />
                      WPM Performance Curve
                    </h3>
                    <p className="text-xs text-[#A0A0A0]">
                      Real session speed over selected period.
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#45D6E8]/10 text-[#45D6E8] font-semibold border border-[#45D6E8]/20">
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
                            <stop offset="5%" stopColor="#45D6E8" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#45D6E8" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#262626"
                          opacity={0.8}
                        />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "#666666" }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "#666666" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#181818",
                            borderColor: "#262626",
                            borderRadius: "12px",
                            color: "#F5F5F5",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="wpm"
                          stroke="#45D6E8"
                          strokeWidth={2.5}
                          fill="url(#wpmGradient)"
                          name="Net WPM"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#262626] rounded-2xl">
                    <Info className="w-8 h-8 text-[#666666] mb-2" />
                    <p className="text-sm font-semibold text-[#A0A0A0]">
                      No session data in this time range
                    </p>
                    <p className="text-xs text-[#666666] mt-1">
                      Complete a typing test to unlock WPM speed curves.
                    </p>
                  </div>
                )}
              </div>

              {/* Accuracy Trend Chart */}
              <div className="bg-[#151515] p-6 rounded-2xl border border-[#262626] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-[#F5F5F5] flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#79D88B]" />
                      Accuracy Trend
                    </h3>
                    <p className="text-xs text-[#A0A0A0]">
                      Key precision stability across sessions.
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full font-mono ${
                      accuracyTrendStatus === "Improving"
                        ? "bg-[#79D88B]/10 text-[#79D88B] border border-[#79D88B]/30"
                        : accuracyTrendStatus === "Declining"
                          ? "bg-[#F05A9D]/10 text-[#F05A9D] border border-[#F05A9D]/30"
                          : "bg-[#181818] text-[#A0A0A0] border border-[#262626]"
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
                            <stop offset="5%" stopColor="#79D88B" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#79D88B" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#262626"
                          opacity={0.8}
                        />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "#666666" }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "#666666" }}
                          domain={[80, 100]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#181818",
                            borderColor: "#262626",
                            borderRadius: "12px",
                            color: "#F5F5F5",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="accuracy"
                          stroke="#79D88B"
                          strokeWidth={2.5}
                          fill="url(#accGradient)"
                          name="Accuracy %"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#262626] rounded-2xl">
                    <Info className="w-8 h-8 text-[#666666] mb-2" />
                    <p className="text-sm font-semibold text-[#A0A0A0]">
                      No session data in this time range
                    </p>
                    <p className="text-xs text-[#666666] mt-1">
                      Complete practice tests to map precision trends.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Speed vs Accuracy Relationship Scatter Section */}
            <div className="bg-[#151515] p-6 sm:p-8 rounded-3xl border border-[#262626] shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg text-[#F5F5F5] flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#45D6E8]" />
                    Speed vs. Accuracy Trade-off Scatter
                  </h3>
                  <p className="text-xs text-[#A0A0A0]">
                    Each dot represents an individual practice session. X = Accuracy %, Y = WPM.
                  </p>
                </div>
                <div className="p-3 bg-[#111111] border border-[#262626] rounded-2xl text-xs text-[#A0A0A0] max-w-md">
                  <strong className="text-[#F5F5F5]">Telemetry Insight:</strong>{" "}
                  {scatterInterpretation}
                </div>
              </div>

              {filteredSessions.length >= 2 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" opacity={0.8} />
                      <XAxis
                        type="number"
                        dataKey="x"
                        name="Accuracy"
                        unit="%"
                        domain={[70, 100]}
                        tick={{ fontSize: 11, fill: "#666666" }}
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        name="WPM"
                        unit=" WPM"
                        tick={{ fontSize: 11, fill: "#666666" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#181818",
                          borderColor: "#262626",
                          borderRadius: "12px",
                          color: "#F5F5F5",
                        }}
                      />
                      <Scatter name="Sessions" data={scatterData} fill="#18C69A">
                        {scatterData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.x >= 96 ? "#79D88B" : entry.x < 90 ? "#F05A9D" : "#F4D35E"}
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#262626] rounded-2xl text-[#A0A0A0] text-xs">
                  <Info className="w-6 h-6 mb-1 text-[#666666]" />
                  <span>
                    Complete at least 2 sessions to populate the Speed vs Accuracy scatter graph.
                  </span>
                </div>
              )}
            </div>

            {/* Daily Practice Activity Bar Heatmap */}
            <div className="bg-[#151515] p-6 sm:p-8 rounded-3xl border border-[#262626] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#F5F5F5] flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#45D6E8]" />
                    Daily Practice Activity
                  </h3>
                  <p className="text-xs text-[#A0A0A0]">
                    Practice minutes and completed runs across the timeline.
                  </p>
                </div>
                <div className="text-xs font-mono text-[#A0A0A0]">
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
                      stroke="#262626"
                      opacity={0.8}
                    />
                    <XAxis
                      dataKey="displayDate"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#666666" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#666666" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#181818",
                        borderColor: "#262626",
                        borderRadius: "12px",
                        color: "#F5F5F5",
                      }}
                      formatter={(value: any, name: any) => [
                        name === "minutes" ? `${value} min` : value,
                        name === "minutes" ? "Practice Time" : "Sessions",
                      ]}
                    />
                    <Bar
                      dataKey="minutes"
                      fill="#45D6E8"
                      radius={[6, 6, 0, 0]}
                      name="Practice Minutes"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance Insights Section */}
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-[#F5F5F5] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#B85CFF]" />
                Performance Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((ins) => (
                  <div
                    key={ins.id}
                    className={`p-5 rounded-3xl border transition-all ${
                      ins.type === "positive"
                        ? "bg-[#181818] border-[#79D88B]/30"
                        : ins.type === "warning"
                          ? "bg-[#181818] border-[#F4D35E]/30"
                          : "bg-[#181818] border-[#45D6E8]/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#111111] text-[#A0A0A0] border border-[#262626] shadow-xs">
                        {ins.badge}
                      </span>
                    </div>
                    <h4 className="font-bold text-[#F5F5F5] text-base mb-1">{ins.title}</h4>
                    <p className="text-xs text-[#A0A0A0] leading-relaxed">{ins.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mode Performance Breakdown Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xl text-[#F5F5F5] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#45D6E8]" />
                  Practice Mode Breakdown
                </h3>
                <span className="text-xs text-[#A0A0A0]">
                  Compare your typing speed across formats
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {modeStats.map((st) => (
                  <div
                    key={st.mode}
                    className="p-5 bg-[#151515] rounded-3xl border border-[#262626] shadow-sm flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="text-xs font-bold uppercase text-[#45D6E8] mb-1">
                        {st.title}
                      </div>
                      <div className="text-2xl font-extrabold text-[#F5F5F5] font-mono">
                        {st.sessions > 0 ? `${st.avgWpm} WPM` : "Unused"}
                      </div>
                    </div>

                    {st.sessions > 0 ? (
                      <div className="space-y-1 text-xs text-[#A0A0A0] font-mono">
                        <div>
                          Best: <strong className="text-[#F5F5F5]">{st.bestWpm} WPM</strong>
                        </div>
                        <div>
                          Accuracy: <strong className="text-[#79D88B]">{st.avgAccuracy}%</strong>
                        </div>
                        <div>
                          Sessions: <strong className="text-[#F5F5F5]">{st.sessions}</strong>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-[#666666] space-y-2">
                        <p>No practice runs recorded yet.</p>
                        <button
                          onClick={() => onNavigate && onNavigate("/practice")}
                          className="text-xs text-[#18C69A] font-bold hover:underline cursor-pointer"
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
            <div className="bg-[#151515] text-[#F5F5F5] p-6 sm:p-8 rounded-3xl border border-[#262626] shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111111] border border-[#262626] text-xs font-semibold text-[#B85CFF]">
                    <Code className="w-3.5 h-3.5 text-[#B85CFF]" />
                    <span>Programming & Syntax Telemetry</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#F5F5F5]">
                    Coding Speed & Symbol Precision
                  </h3>
                </div>
                {!codingStats.hasData && (
                  <button
                    onClick={() => onNavigate && onNavigate("/practice")}
                    className="px-4 py-2 bg-[#18C69A] hover:bg-[#14A782] text-[#0A0A0A] rounded-xl font-bold text-xs cursor-pointer transition-colors"
                  >
                    Start Code Practice →
                  </button>
                )}
              </div>

              {codingStats.hasData ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-[#181818] rounded-2xl border border-[#262626]">
                    <div className="text-xs text-[#A0A0A0] mb-1">Code WPM</div>
                    <div className="text-2xl font-bold font-mono text-[#45D6E8]">
                      {codingStats.codeWpm}
                    </div>
                  </div>
                  <div className="p-4 bg-[#181818] rounded-2xl border border-[#262626]">
                    <div className="text-xs text-[#A0A0A0] mb-1">Code Accuracy</div>
                    <div className="text-2xl font-bold font-mono text-[#79D88B]">
                      {codingStats.codeAccuracy}%
                    </div>
                  </div>
                  <div className="p-4 bg-[#181818] rounded-2xl border border-[#262626]">
                    <div className="text-xs text-[#A0A0A0] mb-1">Symbol Precision</div>
                    <div className="text-2xl font-bold font-mono text-[#B85CFF]">
                      {codingStats.symbolAccuracy}%
                    </div>
                  </div>
                  <div className="p-4 bg-[#181818] rounded-2xl border border-[#262626]">
                    <div className="text-xs text-[#A0A0A0] mb-1">Bracket Match Acc</div>
                    <div className="text-2xl font-bold font-mono text-[#F4D35E]">
                      {codingStats.bracketAccuracy}%
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-[#181818]/60 rounded-2xl border border-dashed border-[#262626] text-center space-y-2">
                  <p className="text-sm font-semibold text-[#A0A0A0]">
                    Complete a coding session to unlock coding insights.
                  </p>
                  <p className="text-xs text-[#666666] max-w-md mx-auto">
                    Practice JavaScript, Python, Java, HTML, CSS, or SQL syntax to analyze symbol
                    reach latency and bracket placement accuracy.
                  </p>
                </div>
              )}
            </div>

            {/* Drill Impact Section */}
            <div className="bg-[#151515] p-6 sm:p-8 rounded-3xl border border-[#262626] shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl text-[#F5F5F5] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#F4D35E]" />
                    Drill Impact & Weak Key Progress
                  </h3>
                  <p className="text-xs text-[#A0A0A0]">
                    How targeted practice drills correlate with key reach accuracy.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate && onNavigate("/drills")}
                  className="px-3.5 py-1.5 bg-[#181818] text-[#18C69A] hover:bg-[#262626] rounded-xl font-bold text-xs cursor-pointer transition-colors border border-[#262626]"
                >
                  Go to Drills Studio →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 bg-[#181818] rounded-2xl space-y-2 border border-[#262626]">
                  <div className="text-xs text-[#A0A0A0]">Completed Drills</div>
                  <div className="text-3xl font-extrabold font-mono text-[#F5F5F5]">
                    {drillImpact.drillsCompleted}
                  </div>
                  <div className="text-xs text-[#79D88B] font-semibold">
                    Most Practiced: {drillImpact.mostPracticedDrillTitle}
                  </div>
                </div>

                <div className="md:col-span-2 p-5 bg-[#181818] rounded-2xl border border-[#262626] space-y-3">
                  <div className="text-xs font-bold uppercase text-[#A0A0A0]">
                    Key Accuracy Before vs After Drills
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {drillImpact.beforeAfterComparison.map((item) => (
                      <div
                        key={item.key}
                        className="p-3 bg-[#151515] rounded-xl border border-[#262626] space-y-1"
                      >
                        <div className="text-xs font-bold font-mono text-[#45D6E8]">
                          Key '{item.key}'
                        </div>
                        <div className="text-xs text-[#A0A0A0]">Before: {item.beforeAcc}%</div>
                        <div className="text-sm font-bold text-[#79D88B]">
                          After: {item.afterAcc}%
                        </div>
                        <div className="text-[10px] text-[#79D88B] font-semibold">
                          +{item.improvement}% gain
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Session History Table */}
            <div className="bg-[#151515] p-6 sm:p-8 rounded-3xl border border-[#262626] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-xl text-[#F5F5F5] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#45D6E8]" />
                    Session History
                  </h3>
                  <p className="text-xs text-[#A0A0A0]">Detailed list of recorded practice runs.</p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#A0A0A0] font-medium">Sort by:</span>
                  <select
                    value={historySort}
                    onChange={(e) => setHistorySort(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl border border-[#262626] bg-[#111111] text-[#F5F5F5] font-semibold cursor-pointer outline-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="fastest">Fastest WPM</option>
                    <option value="accuracy">Highest Accuracy</option>
                  </select>
                </div>
              </div>

              {sortedSessions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#A0A0A0]">
                    <thead className="bg-[#111111] text-[#A0A0A0] font-bold uppercase text-[10px] tracking-wider border-b border-[#262626]">
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
                    <tbody className="divide-y divide-[#262626]">
                      {sortedSessions.map((s, idx) => (
                        <tr key={s.id || idx} className="hover:bg-[#181818] transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-[#F5F5F5]">
                            {new Date(s.timestamp).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3 px-4 capitalize font-semibold text-[#45D6E8]">
                            {s.mode} {s.modeDetail ? `(${s.modeDetail})` : ""}
                          </td>
                          <td className="py-3 px-4 font-bold font-mono text-[#F5F5F5]">
                            {s.wpm} WPM
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#79D88B]">{s.accuracy}%</td>
                          <td className="py-3 px-4 font-semibold text-[#B85CFF]">
                            {s.consistency || 92}%
                          </td>
                          <td className="py-3 px-4 font-mono text-[#A0A0A0]">{s.timeSec || 30}s</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setInspectSession(s)}
                              className="px-2.5 py-1 bg-[#181818] text-[#18C69A] hover:bg-[#262626] border border-[#262626] rounded-lg font-bold transition-colors cursor-pointer"
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
                <div className="p-8 text-center border border-dashed border-[#262626] rounded-2xl text-[#666666] text-xs">
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
            <div className="bg-[#151515] p-6 sm:p-8 rounded-3xl border border-[#262626] shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl text-[#F5F5F5] flex items-center gap-2">
                    <Flame className="w-5 h-5 text-[#F4D35E]" />
                    Interactive Keyboard Heatmap
                  </h3>
                  <p className="text-xs text-[#A0A0A0]">
                    Color-coded accuracy and actuation latency for each individual key.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="flex items-center gap-1 text-[#79D88B]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#79D88B] inline-block"></span>{" "}
                    Optimal
                  </span>
                  <span className="flex items-center gap-1 text-[#F4D35E]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F4D35E] inline-block"></span>{" "}
                    Warm
                  </span>
                  <span className="flex items-center gap-1 text-[#F05A9D]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F05A9D] inline-block"></span>{" "}
                    Hotspot
                  </span>
                </div>
              </div>

              <VirtualKeyboard isHeatmapMode={true} heatmapData={heatmapData} size="md" />
            </div>

            {/* Key Breakdown Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weakest / Most Error-Prone Keys */}
              <div className="bg-[#151515] p-6 rounded-3xl border border-[#262626] shadow-sm space-y-4">
                <h3 className="font-bold text-lg text-[#F5F5F5] flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#F05A9D]" />
                  Weakest & Error-Prone Key Reaches
                </h3>
                <div className="space-y-2">
                  {weakKeys.slice(0, 5).map((w) => (
                    <div
                      key={w.key}
                      onClick={() => setInspectKey(w)}
                      className="p-3 bg-[#181818] hover:bg-[#1C1C1C] rounded-2xl border border-[#262626] flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#F05A9D]/15 border border-[#F05A9D]/30 text-[#F05A9D] font-extrabold font-mono flex items-center justify-center text-lg">
                          {w.key.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#F5F5F5]">{w.finger} Zone</div>
                          <div className="text-[11px] text-[#A0A0A0]">{w.reason}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-extrabold font-mono text-[#F05A9D]">
                          {w.accuracy}% Acc
                        </div>
                        <div className="text-[10px] text-[#666666]">{w.errorCount} Errors</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strongest Keys */}
              <div className="bg-[#151515] p-6 rounded-3xl border border-[#262626] shadow-sm space-y-4">
                <h3 className="font-bold text-lg text-[#F5F5F5] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#79D88B]" />
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
                        className="p-3 bg-[#181818] hover:bg-[#1C1C1C] rounded-2xl border border-[#262626] flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#79D88B]/15 border border-[#79D88B]/30 text-[#79D88B] font-extrabold font-mono flex items-center justify-center text-lg">
                            {w.key.toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#F5F5F5]">{w.finger} Zone</div>
                            <div className="text-[11px] text-[#A0A0A0]">Fluid muscle memory</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-extrabold font-mono text-[#79D88B]">
                            {w.accuracy}% Acc
                          </div>
                          <div className="text-[10px] text-[#666666]">{w.presses} Presses</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Finger Zone Performance Grid */}
            <div className="bg-[#151515] p-6 sm:p-8 rounded-3xl border border-[#262626] shadow-sm space-y-4">
              <h3 className="font-bold text-xl text-[#F5F5F5] flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#45D6E8]" />
                8-Zone Finger Ergonomics & Workload
              </h3>
              <p className="text-xs text-[#A0A0A0]">
                Performance and accuracy broken down by finger placement.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {fingerStats.map((fz) => (
                  <div
                    key={fz.finger}
                    className="p-4 bg-[#181818] rounded-2xl border border-[#262626] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#F5F5F5]">{fz.finger}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          fz.trend === "Improving"
                            ? "bg-[#79D88B]/10 text-[#79D88B] border border-[#79D88B]/20"
                            : "bg-[#111111] text-[#A0A0A0] border border-[#262626]"
                        }`}
                      >
                        {fz.trend}
                      </span>
                    </div>
                    <div className="text-2xl font-extrabold font-mono text-[#45D6E8]">
                      {fz.accuracy}%
                    </div>
                    <div className="text-[11px] text-[#A0A0A0]">
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
            <div className="bg-[#151515] p-6 sm:p-8 rounded-3xl border border-[#262626] shadow-sm space-y-6">
              <div>
                <h3 className="font-bold text-xl text-[#F5F5F5] flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#45D6E8]" />
                  Side-by-Side Session Comparison Tool
                </h3>
                <p className="text-xs text-[#A0A0A0]">
                  Select two sessions to compare WPM, accuracy, consistency, and errors.
                </p>
              </div>

              {filteredSessions.length >= 2 ? (
                <div className="space-y-6">
                  {/* Selector Dropdowns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#181818] rounded-2xl border border-[#262626] space-y-2">
                      <label className="text-xs font-bold text-[#F5F5F5]">
                        Session 1 (Baseline)
                      </label>
                      <select
                        value={compareId1 || filteredSessions[0]?.id || ""}
                        onChange={(e) => setCompareId1(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#262626] bg-[#111111] text-xs font-semibold text-[#F5F5F5] outline-none"
                      >
                        {filteredSessions.map((s, idx) => (
                          <option key={s.id || idx} value={s.id}>
                            {new Date(s.timestamp).toLocaleDateString()} - {s.mode.toUpperCase()} (
                            {s.wpm} WPM / {s.accuracy}%)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="p-4 bg-[#181818] rounded-2xl border border-[#262626] space-y-2">
                      <label className="text-xs font-bold text-[#F5F5F5]">
                        Session 2 (Comparison)
                      </label>
                      <select
                        value={compareId2 || filteredSessions[1]?.id || ""}
                        onChange={(e) => setCompareId2(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#262626] bg-[#111111] text-xs font-semibold text-[#F5F5F5] outline-none"
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
                    <div className="p-6 bg-[#111111] rounded-2xl border border-[#262626] space-y-4">
                      <div className="grid grid-cols-3 text-center text-xs font-bold border-b border-[#262626] pb-3">
                        <div className="text-[#45D6E8]">Session 1</div>
                        <div className="text-[#A0A0A0]">Metric Delta</div>
                        <div className="text-[#45D6E8]">Session 2</div>
                      </div>

                      {/* WPM Diff */}
                      <div className="grid grid-cols-3 text-center items-center py-2 border-b border-[#262626]">
                        <div className="font-extrabold font-mono text-lg text-[#F5F5F5]">
                          {session1.wpm} WPM
                        </div>
                        <div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                              session2.wpm - session1.wpm >= 0
                                ? "bg-[#79D88B]/15 text-[#79D88B] border border-[#79D88B]/30"
                                : "bg-[#F05A9D]/15 text-[#F05A9D] border border-[#F05A9D]/30"
                            }`}
                          >
                            {session2.wpm - session1.wpm >= 0
                              ? `+${session2.wpm - session1.wpm}`
                              : session2.wpm - session1.wpm}{" "}
                            WPM
                          </span>
                        </div>
                        <div className="font-extrabold font-mono text-lg text-[#F5F5F5]">
                          {session2.wpm} WPM
                        </div>
                      </div>

                      {/* Accuracy Diff */}
                      <div className="grid grid-cols-3 text-center items-center py-2 border-b border-[#262626]">
                        <div className="font-extrabold font-mono text-lg text-[#F5F5F5]">
                          {session1.accuracy}%
                        </div>
                        <div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                              session2.accuracy - session1.accuracy >= 0
                                ? "bg-[#79D88B]/15 text-[#79D88B] border border-[#79D88B]/30"
                                : "bg-[#F05A9D]/15 text-[#F05A9D] border border-[#F05A9D]/30"
                            }`}
                          >
                            {(session2.accuracy - session1.accuracy).toFixed(1)}% Acc
                          </span>
                        </div>
                        <div className="font-extrabold font-mono text-lg text-[#F5F5F5]">
                          {session2.accuracy}%
                        </div>
                      </div>

                      {/* Consistency Diff */}
                      <div className="grid grid-cols-3 text-center items-center py-2">
                        <div className="font-extrabold font-mono text-lg text-[#F5F5F5]">
                          {session1.consistency || 92}%
                        </div>
                        <div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#B85CFF]/15 text-[#B85CFF] border border-[#B85CFF]/30">
                            {((session2.consistency || 92) - (session1.consistency || 92)).toFixed(
                              0,
                            )}
                            % Cons
                          </span>
                        </div>
                        <div className="font-extrabold font-mono text-lg text-[#F5F5F5]">
                          {session2.consistency || 92}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-[#262626] rounded-2xl text-[#666666] text-xs">
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
                <h3 className="font-bold text-2xl text-[#F5F5F5] flex items-center gap-2">
                  <Award className="w-6 h-6 text-[#F4D35E]" />
                  Personal Records Hall of Fame
                </h3>
                <p className="text-xs text-[#A0A0A0]">
                  Milestones dynamically calculated from real practice history.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Fastest WPM */}
              <div className="p-6 bg-[#151515] rounded-3xl border border-[#262626] shadow-sm space-y-3">
                <div className="text-xs font-bold uppercase text-[#F4D35E]">Fastest WPM</div>
                <div className="text-4xl font-extrabold font-mono text-[#F5F5F5]">
                  {personalRecords.fastestWpm
                    ? `${personalRecords.fastestWpm.value} WPM`
                    : "Not set"}
                </div>
                {personalRecords.fastestWpm && (
                  <div className="text-xs text-[#A0A0A0]">
                    Achieved on {personalRecords.fastestWpm.date} ({personalRecords.fastestWpm.mode}{" "}
                    mode)
                  </div>
                )}
              </div>

              {/* Highest Accuracy */}
              <div className="p-6 bg-[#151515] rounded-3xl border border-[#262626] shadow-sm space-y-3">
                <div className="text-xs font-bold uppercase text-[#79D88B]">Highest Accuracy</div>
                <div className="text-4xl font-extrabold font-mono text-[#F5F5F5]">
                  {personalRecords.highestAccuracy
                    ? `${personalRecords.highestAccuracy.value}%`
                    : "Not set"}
                </div>
                {personalRecords.highestAccuracy && (
                  <div className="text-xs text-[#A0A0A0]">
                    Achieved on {personalRecords.highestAccuracy.date}
                  </div>
                )}
              </div>

              {/* Best Consistency */}
              <div className="p-6 bg-[#151515] rounded-3xl border border-[#262626] shadow-sm space-y-3">
                <div className="text-xs font-bold uppercase text-[#B85CFF]">Best Consistency</div>
                <div className="text-4xl font-extrabold font-mono text-[#F5F5F5]">
                  {personalRecords.bestConsistency
                    ? `${personalRecords.bestConsistency.value}%`
                    : "Not set"}
                </div>
                {personalRecords.bestConsistency && (
                  <div className="text-xs text-[#A0A0A0]">
                    Achieved on {personalRecords.bestConsistency.date}
                  </div>
                )}
              </div>

              {/* Most Sessions in a Day */}
              <div className="p-6 bg-[#151515] rounded-3xl border border-[#262626] shadow-sm space-y-3">
                <div className="text-xs font-bold uppercase text-[#45D6E8]">
                  Most Practice Sessions in a Day
                </div>
                <div className="text-4xl font-extrabold font-mono text-[#F5F5F5]">
                  {personalRecords.mostSessionsInDay
                    ? personalRecords.mostSessionsInDay.count
                    : "0"}
                </div>
                {personalRecords.mostSessionsInDay && (
                  <div className="text-xs text-[#A0A0A0]">
                    Set on {personalRecords.mostSessionsInDay.date}
                  </div>
                )}
              </div>

              {/* Best Code WPM */}
              <div className="p-6 bg-[#151515] rounded-3xl border border-[#262626] shadow-sm space-y-3">
                <div className="text-xs font-bold uppercase text-[#45D6E8]">Best Code WPM</div>
                <div className="text-4xl font-extrabold font-mono text-[#F5F5F5]">
                  {personalRecords.bestCodeWpm !== null
                    ? `${personalRecords.bestCodeWpm} WPM`
                    : "Not set"}
                </div>
                <div className="text-xs text-[#A0A0A0]">Programming syntax speed</div>
              </div>

              {/* Longest Streak */}
              <div className="p-6 bg-[#151515] rounded-3xl border border-[#262626] shadow-sm space-y-3">
                <div className="text-xs font-bold uppercase text-[#F4D35E]">Longest Streak</div>
                <div className="text-4xl font-extrabold font-mono text-[#F5F5F5]">
                  {personalRecords.longestStreak}{" "}
                  {personalRecords.longestStreak === 1 ? "Day" : "Days"}
                </div>
                <div className="text-xs text-[#A0A0A0]">Consecutive daily practice runs</div>
              </div>
            </div>
          </div>
        )}

        {/* Session Inspector Modal */}
        <AnimatePresence>
          {inspectSession && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/80 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#151515] p-6 sm:p-8 rounded-3xl border border-[#262626] max-w-xl w-full shadow-2xl space-y-6"
              >
                <div className="flex items-center justify-between border-b border-[#262626] pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#F5F5F5]">Session Telemetry Details</h3>
                    <p className="text-xs text-[#A0A0A0]">
                      {new Date(inspectSession.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setInspectSession(null)}
                    className="p-2 rounded-xl text-[#A0A0A0] hover:text-[#F5F5F5] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-[#181818] border border-[#262626] rounded-2xl">
                    <div className="text-xs text-[#A0A0A0]">Speed</div>
                    <div className="text-2xl font-bold font-mono text-[#45D6E8]">
                      {inspectSession.wpm} WPM
                    </div>
                  </div>
                  <div className="p-4 bg-[#181818] border border-[#262626] rounded-2xl">
                    <div className="text-xs text-[#A0A0A0]">Accuracy</div>
                    <div className="text-2xl font-bold font-mono text-[#79D88B]">
                      {inspectSession.accuracy}%
                    </div>
                  </div>
                  <div className="p-4 bg-[#181818] border border-[#262626] rounded-2xl">
                    <div className="text-xs text-[#A0A0A0]">Consistency</div>
                    <div className="text-2xl font-bold font-mono text-[#B85CFF]">
                      {inspectSession.consistency || 92}%
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#F5F5F5]">Snippet Typed:</label>
                  <div className="p-3 bg-[#111111] border border-[#262626] rounded-2xl font-mono text-xs text-[#A0A0A0] max-h-32 overflow-y-auto">
                    {inspectSession.snippet || "Practice snippet text unavailable."}
                  </div>
                </div>

                {inspectSession.errorKeys && inspectSession.errorKeys.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#F05A9D]">Keys with Mis-hits:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {inspectSession.errorKeys.map((k, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-[#F05A9D]/15 border border-[#F05A9D]/30 text-[#F05A9D] font-mono text-xs rounded-lg font-bold"
                        >
                          {k.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setInspectSession(null)}
                  className="w-full py-3 bg-[#18C69A] hover:bg-[#14A782] text-[#0A0A0A] font-bold rounded-2xl text-xs transition-colors cursor-pointer"
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/80 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#151515] p-6 sm:p-8 rounded-3xl border border-[#262626] max-w-md w-full shadow-2xl space-y-6"
              >
                <div className="flex items-center justify-between border-b border-[#262626] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#18C69A] text-[#0A0A0A] font-mono font-extrabold text-2xl flex items-center justify-center">
                      {inspectKey.key.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#F5F5F5]">Key Telemetry Breakdown</h3>
                      <p className="text-xs text-[#A0A0A0]">{inspectKey.finger} Finger Zone</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectKey(null)}
                    className="p-2 rounded-xl text-[#A0A0A0] hover:text-[#F5F5F5] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-[#181818] border border-[#262626] rounded-xl">
                    <div className="text-xs text-[#A0A0A0]">Accuracy</div>
                    <div className="text-xl font-bold font-mono text-[#79D88B]">
                      {inspectKey.accuracy}%
                    </div>
                  </div>
                  <div className="p-3 bg-[#181818] border border-[#262626] rounded-xl">
                    <div className="text-xs text-[#A0A0A0]">Errors</div>
                    <div className="text-xl font-bold font-mono text-[#F05A9D]">
                      {inspectKey.errorCount}
                    </div>
                  </div>
                  <div className="p-3 bg-[#181818] border border-[#262626] rounded-xl">
                    <div className="text-xs text-[#A0A0A0]">Total Presses</div>
                    <div className="text-xl font-bold font-mono text-[#F5F5F5]">
                      {inspectKey.presses}
                    </div>
                  </div>
                  <div className="p-3 bg-[#181818] border border-[#262626] rounded-xl">
                    <div className="text-xs text-[#A0A0A0] font-mono">Reaction Latency</div>
                    <div className="text-xl font-bold font-mono text-[#45D6E8]">
                      {inspectKey.avgReactionMs}ms
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#181818] border border-[#262626] rounded-xl text-xs text-[#A0A0A0]">
                  <strong className="text-[#F5F5F5]">Recommendation:</strong> {inspectKey.reason}
                </div>

                <button
                  onClick={() => setInspectKey(null)}
                  className="w-full py-3 bg-[#18C69A] hover:bg-[#14A782] text-[#0A0A0A] font-bold rounded-2xl text-xs transition-colors cursor-pointer"
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

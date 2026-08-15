import React, { useState } from "react";
import { motion } from "motion/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { AnimatedCounter } from "../common/AnimatedCounter";
import { RoutePath } from "../../types";
import { LineChart, Calendar, Clock, Award, Target, Zap, ArrowUpRight } from "lucide-react";

interface AnalyticsPreviewSectionProps {
  onNavigate: (path: RoutePath) => void;
}

const sampleData7Days = [
  { day: "Mon", wpm: 64, accuracy: 94.2, consistency: 85 },
  { day: "Tue", wpm: 68, accuracy: 95.1, consistency: 88 },
  { day: "Wed", wpm: 72, accuracy: 95.8, consistency: 89 },
  { day: "Thu", wpm: 71, accuracy: 96.0, consistency: 90 },
  { day: "Fri", wpm: 76, accuracy: 96.5, consistency: 91 },
  { day: "Sat", wpm: 79, accuracy: 97.2, consistency: 93 },
  { day: "Sun", wpm: 84, accuracy: 98.1, consistency: 94 },
];

const sampleData30Days = [
  { day: "W1", wpm: 58, accuracy: 92.5, consistency: 80 },
  { day: "W2", wpm: 65, accuracy: 94.8, consistency: 86 },
  { day: "W3", wpm: 74, accuracy: 96.2, consistency: 91 },
  { day: "W4", wpm: 84, accuracy: 98.1, consistency: 94 },
];

export const AnalyticsPreviewSection: React.FC<AnalyticsPreviewSectionProps> = ({ onNavigate }) => {
  const [range, setRange] = useState<"7d" | "30d">("7d");
  const chartData = range === "7d" ? sampleData7Days : sampleData30Days;

  const currentMaxWpm = range === "7d" ? 84 : 84;
  const currentAvgAcc = range === "7d" ? 98.1 : 98.1;
  const currentTotalTimeMin = range === "7d" ? 142 : 420;
  const currentConsistency = range === "7d" ? 94 : 94;

  return (
    <section className="py-20 md:py-28 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[#262626] text-xs font-semibold text-[#18C69A]">
              <LineChart className="w-3.5 h-3.5" />
              <span>Performance Insights</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F5F5F5] tracking-tight">
              Quantifiable progress in every session
            </h2>
            <p className="text-base text-[#A0A0A0]">
              Watch speed and accuracy compound over time with automated performance telemetry.
            </p>
          </div>

          {/* Time range toggle */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-[#151515] p-1.5 rounded-2xl border border-[#262626]">
            <button
              onClick={() => setRange("7d")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                range === "7d"
                  ? "bg-[#181818] text-[#18C69A] shadow-sm"
                  : "text-[#666666] hover:text-[#F5F5F5]"
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setRange("30d")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                range === "30d"
                  ? "bg-[#181818] text-[#18C69A] shadow-sm"
                  : "text-[#666666] hover:text-[#F5F5F5]"
              }`}
            >
              Last 30 Days
            </button>
          </div>
        </div>

        {/* Analytics Card Frame */}
        <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 border border-[#262626] shadow-xl space-y-8">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 bg-[#181818] rounded-2xl border border-[#262626] shadow-sm">
              <div className="flex items-center justify-between text-[#666666] text-xs font-medium mb-1">
                <span>Peak Speed</span>
                <Zap className="w-4 h-4 text-[#18C69A]" />
              </div>
              <div className="text-3xl font-extrabold text-[#F5F5F5] font-mono flex items-baseline gap-1">
                <AnimatedCounter value={currentMaxWpm} />
                <span className="text-xs text-[#666666] font-sans">WPM</span>
              </div>
              <span className="text-xs text-[#18C69A] font-semibold flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="w-3 h-3" /> +20 WPM this week
              </span>
            </div>

            <div className="p-5 bg-[#181818] rounded-2xl border border-[#262626] shadow-sm">
              <div className="flex items-center justify-between text-[#666666] text-xs font-medium mb-1">
                <span>Avg Accuracy</span>
                <Target className="w-4 h-4 text-[#45D6E8]" />
              </div>
              <div className="text-3xl font-extrabold text-[#F5F5F5] font-mono">
                <AnimatedCounter value={currentAvgAcc} decimals={1} suffix="%" />
              </div>
              <span className="text-xs text-[#45D6E8] font-semibold flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="w-3 h-3" /> +3.9% precision
              </span>
            </div>

            <div className="p-5 bg-[#181818] rounded-2xl border border-[#262626] shadow-sm">
              <div className="flex items-center justify-between text-[#666666] text-xs font-medium mb-1">
                <span>Practice Time</span>
                <Clock className="w-4 h-4 text-[#B85CFF]" />
              </div>
              <div className="text-3xl font-extrabold text-[#F5F5F5] font-mono flex items-baseline gap-1">
                <AnimatedCounter value={currentTotalTimeMin} />
                <span className="text-xs text-[#666666] font-sans">mins</span>
              </div>
              <span className="text-xs text-[#666666] font-medium mt-1">18 mins / day avg</span>
            </div>

            <div className="p-5 bg-[#181818] rounded-2xl border border-[#262626] shadow-sm">
              <div className="flex items-center justify-between text-[#666666] text-xs font-medium mb-1">
                <span>Flow Consistency</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-[#F5F5F5] font-mono">
                <AnimatedCounter value={currentConsistency} suffix="%" />
              </div>
              <span className="text-xs text-amber-400 font-semibold mt-1">
                High Cadence Stability
              </span>
            </div>
          </div>

          {/* Main Interactive Speed Curve Chart */}
          <div className="bg-[#181818] p-5 sm:p-6 rounded-2xl border border-[#262626]">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-sm font-bold text-[#F5F5F5] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#18C69A]" />
                Speed & Accuracy Progression Trend
              </h4>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-[#A0A0A0]">
                  <span className="w-3 h-1 bg-[#18C69A] rounded-full" /> Speed (WPM)
                </span>
                <span className="flex items-center gap-1.5 text-[#A0A0A0]">
                  <span className="w-3 h-1 bg-[#45D6E8] rounded-full" /> Accuracy (%)
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#18C69A" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#18C69A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="accGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#45D6E8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#45D6E8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#262626"
                    opacity={0.6}
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666666" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666666" }}
                    domain={[40, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#151515",
                      borderColor: "#262626",
                      borderRadius: "12px",
                      color: "#F5F5F5",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="wpm"
                    stroke="#18C69A"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#wpmGradient)"
                    name="WPM"
                  />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#45D6E8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#accGradient)"
                    name="Accuracy %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => onNavigate("/analytics")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#18C69A] hover:text-[#18C69A]/80 transition-colors cursor-pointer"
            >
              Open Full Analytics Dashboard <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

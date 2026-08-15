import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RoutePath } from "../../types";
import { Sparkles, Bot, ArrowRight, CheckCircle2, Play, RefreshCw, Zap } from "lucide-react";

interface CoachPreviewSectionProps {
  onNavigate: (path: RoutePath) => void;
}

const focusAreas = [
  {
    id: "pinky",
    label: "Fix Right Pinky Accuracy",
    keys: ["P", ";", "[", "'"],
    diagnosis:
      "Your right pinky finger slips when reaching for brackets and quotes, causing a 140ms latency stutter.",
    workoutText: "pop pipe paper pixel quiz quote prefix perplex",
    wpmBoost: "+8 WPM",
  },
  {
    id: "numbers",
    label: "Number Row Speed Burst",
    keys: ["1", "2", "3", "4", "8", "9", "0"],
    diagnosis:
      "You pause to look at the number row when typing statistics. Build blind top-row muscle memory.",
    workoutText: "101 item 202 score 305 total 409 rate 808 count",
    wpmBoost: "+12 WPM",
  },
  {
    id: "code",
    label: "Code Syntax & Brackets",
    keys: ["{", "}", "=>", ";", "<"],
    diagnosis:
      "Switching between shift symbols and alphanumeric characters breaks your typing rhythm.",
    workoutText: "const item = { id: 1, fn: () => true };",
    wpmBoost: "+15 WPM",
  },
];

export const CoachPreviewSection: React.FC<CoachPreviewSectionProps> = ({ onNavigate }) => {
  const [selectedFocus, setSelectedFocus] = useState(focusAreas[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSelectFocus = (focus: (typeof focusAreas)[0]) => {
    setIsGenerating(true);
    setSelectedFocus(focus);
    setTimeout(() => setIsGenerating(false), 500);
  };

  return (
    <section className="py-20 md:py-28 bg-[#0D0D0D] border-y border-[#262626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[#262626] text-xs font-semibold text-[#18C69A]">
            <Sparkles className="w-3.5 h-3.5 text-[#18C69A]" />
            <span>AI Typing Companion</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F5F5F5] tracking-tight">
            Personalized guidance that adapts to you
          </h2>

          <p className="text-base text-[#A0A0A0]">
            AI Coach analyzes your hesitation patterns and dynamically creates custom workouts to
            target your bottleneck keys.
          </p>
        </div>

        {/* AI Coach Studio Preview Frame */}
        <div className="max-w-4xl mx-auto bg-[#151515] rounded-3xl border border-[#262626] shadow-xl overflow-hidden">
          {/* Top Assistant Header */}
          <div className="p-4 sm:p-6 bg-[#181818] text-[#F5F5F5] flex items-center justify-between border-b border-[#262626]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#151515] border border-[#18C69A]/40 flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#18C69A]" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#F5F5F5]">KEYFLOW AI Coach</h3>
                <span className="text-xs text-[#18C69A] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#18C69A] animate-pulse" /> Active
                  Telemetry Monitor
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate("/coach")}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Open Full Studio
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Interactive Focus Selector */}
            <div>
              <label className="text-xs font-bold text-[#666666] uppercase tracking-wider block mb-3">
                Select Problem Area to Analyze:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {focusAreas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => handleSelectFocus(area)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedFocus.id === area.id
                        ? "bg-[#181818] border-[#18C69A] text-[#F5F5F5] shadow-sm"
                        : "bg-[#181818] border-[#262626] text-[#A0A0A0] hover:border-[#303030]"
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm mb-1">{area.label}</div>
                    <div className="text-[11px] text-[#666666] font-mono">
                      Keys: {area.keys.join(" ")}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Diagnosis Output Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedFocus.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="p-5 bg-[#181818] rounded-2xl border border-[#262626] space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#18C69A] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#18C69A]" />
                      Diagnostic Analysis
                    </span>
                    <p className="text-sm text-[#F5F5F5] leading-relaxed font-medium">
                      {selectedFocus.diagnosis}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-[#151515] text-[#18C69A] border border-[#18C69A]/30 text-xs font-bold rounded-lg shrink-0">
                    Expected {selectedFocus.wpmBoost}
                  </span>
                </div>

                {/* Generated Custom Workout Text */}
                <div className="pt-3 border-t border-[#262626]">
                  <span className="text-xs font-semibold text-[#666666] block mb-2">
                    Generated Micro-Workout:
                  </span>
                  <div className="p-3 bg-[#151515] rounded-xl border border-[#262626] font-mono text-sm sm:text-base text-[#18C69A] font-semibold tracking-wide">
                    {isGenerating ? (
                      <span className="flex items-center gap-2 text-[#666666]">
                        <RefreshCw className="w-4 h-4 animate-spin" /> Synthesizing custom drill...
                      </span>
                    ) : (
                      selectedFocus.workoutText
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Launch Action */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => onNavigate("/practice")}
                className="px-6 py-3 rounded-xl bg-[#18C69A] hover:bg-[#18C69A]/90 text-[#0A0A0A] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#18C69A]/20 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-[#0A0A0A]" /> Start AI Recommended Workout
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

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
    <section className="py-20 md:py-28 bg-kfn-50/80 dark:bg-kfn-900/40 border-y border-kfn-200/60 dark:border-kfn-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kfa-50 dark:bg-kfa-950/80 border border-kfa-200/60 dark:border-kfa-800 text-xs font-semibold text-kfa-700 dark:text-kfa-300">
            <Sparkles className="w-3.5 h-3.5 text-kfa-600 dark:text-kfa-400" />
            <span>AI Typing Companion</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-kfn-900 dark:text-white tracking-tight">
            Personalized guidance that adapts to you
          </h2>

          <p className="text-base text-kfn-600 dark:text-kfn-400">
            AI Coach analyzes your hesitation patterns and dynamically creates custom workouts to
            target your bottleneck keys.
          </p>
        </div>

        {/* AI Coach Studio Preview Frame */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-kfn-900 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-xl overflow-hidden">
          {/* Top Assistant Header */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-kfa-900 via-kfn-900 to-kfa-950 text-white flex items-center justify-between border-b border-kfa-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-kfa-600/30 border border-kfa-400/40 flex items-center justify-center">
                <Bot className="w-5 h-5 text-kfa-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">KEYFLOW AI Coach</h3>
                <span className="text-xs text-kfa-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-kfa-400 animate-pulse" /> Active
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
              <label className="text-xs font-bold text-kfn-500 dark:text-kfn-400 uppercase tracking-wider block mb-3">
                Select Problem Area to Analyze:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {focusAreas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => handleSelectFocus(area)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedFocus.id === area.id
                        ? "bg-kfa-50/90 dark:bg-kfa-950/80 border-kfa-500 text-kfa-950 dark:text-kfa-200 shadow-sm"
                        : "bg-kfn-50 dark:bg-kfn-800/50 border-kfn-200 dark:border-kfn-700 text-kfn-700 dark:text-kfn-300 hover:border-kfn-300"
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm mb-1">{area.label}</div>
                    <div className="text-[11px] text-kfn-500 dark:text-kfn-400 font-mono">
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
                className="p-5 bg-kfn-50 dark:bg-kfn-950 rounded-2xl border border-kfn-200/80 dark:border-kfn-800 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-kfa-600 dark:text-kfa-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-kfa-500" />
                      Diagnostic Analysis
                    </span>
                    <p className="text-sm text-kfn-800 dark:text-kfn-200 leading-relaxed font-medium">
                      {selectedFocus.diagnosis}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-kfa-50 dark:bg-kfa-950/80 text-kfa-700 dark:text-kfa-300 border border-kfa-200 dark:border-kfa-800 text-xs font-bold rounded-lg shrink-0">
                    Expected {selectedFocus.wpmBoost}
                  </span>
                </div>

                {/* Generated Custom Workout Text */}
                <div className="pt-3 border-t border-kfn-200/70 dark:border-kfn-800">
                  <span className="text-xs font-semibold text-kfn-500 dark:text-kfn-400 block mb-2">
                    Generated Micro-Workout:
                  </span>
                  <div className="p-3 bg-white dark:bg-kfn-900 rounded-xl border border-kfn-200 dark:border-kfn-800 font-mono text-sm sm:text-base text-kfa-600 dark:text-kfa-300 font-semibold tracking-wide">
                    {isGenerating ? (
                      <span className="flex items-center gap-2 text-kfn-400">
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
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-kfa-600 to-kfa-600 hover:from-kfa-500 hover:to-kfa-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-kfa-500/20 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" /> Start AI Recommended Workout
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

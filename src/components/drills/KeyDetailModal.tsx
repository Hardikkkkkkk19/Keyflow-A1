import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { KeyPerformance } from "../../types";
import {
  X,
  Target,
  Zap,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { getFingerForKey } from "../../utils/typingUtils";

interface KeyDetailModalProps {
  keyData: KeyPerformance | null;
  onClose: () => void;
  onPracticeKey: (key: string) => void;
}

export const KeyDetailModal: React.FC<KeyDetailModalProps> = ({
  keyData,
  onClose,
  onPracticeKey,
}) => {
  if (!keyData) return null;

  const fingerInfo = getFingerForKey(keyData.key);
  const correctPresses = Math.max(0, keyData.presses - keyData.errors);
  const trend =
    keyData.accuracy < 90 ? "Needs attention" : keyData.accuracy < 95 ? "Stable" : "Improving";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-kfn-950/70 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-kfn-900 rounded-3xl p-6 sm:p-8 border border-kfn-200 dark:border-kfn-800 shadow-2xl max-w-md w-full space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-extrabold font-mono text-white shadow-lg ${
                  keyData.heatLevel === "hot"
                    ? "bg-rose-500 shadow-rose-500/30"
                    : keyData.heatLevel === "warm"
                      ? "bg-amber-500 shadow-amber-500/30"
                      : "bg-kfa-600 shadow-kfa-500/30"
                }`}
              >
                {keyData.displayLabel}
              </div>
              <div>
                <h3 className="text-xl font-bold text-kfn-900 dark:text-white">
                  Key '{keyData.displayLabel}' Performance
                </h3>
                <div className="flex items-center gap-2 text-xs text-kfn-500 dark:text-kfn-400 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${fingerInfo.color}`} />
                  <span>
                    {fingerInfo.finger} ({fingerInfo.side === "left" ? "Left Hand" : "Right Hand"})
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-kfn-400 hover:text-kfn-600 hover:bg-kfn-100 dark:hover:bg-kfn-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Trend Tag */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-kfn-50 dark:bg-kfn-950 border border-kfn-200/80 dark:border-kfn-800 text-xs">
            <span className="text-kfn-500 dark:text-kfn-400 font-medium">Performance Status:</span>
            <span
              className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                trend === "Improving"
                  ? "bg-kfa-50 text-kfa-700 dark:bg-kfa-950 dark:text-kfa-300 border border-kfa-200 dark:border-kfa-800"
                  : trend === "Stable"
                    ? "bg-kfa-50 text-kfa-700 dark:bg-kfa-950 dark:text-kfa-300 border border-kfa-200 dark:border-kfa-800"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
              }`}
            >
              {trend === "Improving" ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : trend === "Stable" ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              {trend}
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3.5 bg-kfn-50 dark:bg-kfn-950 rounded-2xl border border-kfn-200/80 dark:border-kfn-800 text-center">
              <div className="text-[10px] text-kfn-400 font-sans uppercase">Accuracy</div>
              <div className="text-2xl font-extrabold text-kfa-600 dark:text-kfa-400">
                {keyData.accuracy}%
              </div>
              <div className="text-[10px] text-kfn-400">Precision Rate</div>
            </div>

            <div className="p-3.5 bg-kfn-50 dark:bg-kfn-950 rounded-2xl border border-kfn-200/80 dark:border-kfn-800 text-center">
              <div className="text-[10px] text-kfn-400 font-sans uppercase">Reaction Speed</div>
              <div className="text-2xl font-extrabold text-kfn-800 dark:text-kfn-200">
                {keyData.avgLatencyMs}
              </div>
              <div className="text-[10px] text-kfn-400">Milliseconds</div>
            </div>

            <div className="p-3.5 bg-kfn-50 dark:bg-kfn-950 rounded-2xl border border-kfn-200/80 dark:border-kfn-800 text-center">
              <div className="text-[10px] text-kfn-400 font-sans uppercase">Total Presses</div>
              <div className="text-xl font-bold text-kfa-600 dark:text-kfa-400">
                {keyData.presses}
              </div>
              <div className="text-[10px] text-kfn-400">{correctPresses} correct</div>
            </div>

            <div className="p-3.5 bg-kfn-50 dark:bg-kfn-950 rounded-2xl border border-kfn-200/80 dark:border-kfn-800 text-center">
              <div className="text-[10px] text-kfn-400 font-sans uppercase">Total Errors</div>
              <div className="text-xl font-bold text-rose-500">{keyData.errors}</div>
              <div className="text-[10px] text-kfn-400">Missed key strikes</div>
            </div>
          </div>

          {/* Practice Key Action */}
          <button
            onClick={() => {
              onPracticeKey(keyData.key);
              onClose();
            }}
            className="w-full py-3.5 rounded-2xl bg-kfa-600 hover:bg-kfa-500 text-white font-bold text-xs shadow-lg shadow-kfa-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-white" />
            Launch Drill for Key '{keyData.displayLabel}'
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

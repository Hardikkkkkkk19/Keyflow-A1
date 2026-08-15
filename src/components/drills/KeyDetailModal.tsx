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
        className="fixed inset-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#151515] rounded-3xl p-6 sm:p-8 border border-[#262626] shadow-2xl max-w-md w-full space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-extrabold font-mono text-[#0A0A0A] shadow-lg ${
                  keyData.heatLevel === "hot"
                    ? "bg-[#F05A9D] text-[#0A0A0A] shadow-[#F05A9D]/30"
                    : keyData.heatLevel === "warm"
                      ? "bg-[#F4D35E] text-[#0A0A0A] shadow-[#F4D35E]/30"
                      : "bg-[#79D88B] text-[#0A0A0A] shadow-[#79D88B]/30"
                }`}
              >
                {keyData.displayLabel}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#F5F5F5]">
                  Key '{keyData.displayLabel}' Performance
                </h3>
                <div className="flex items-center gap-2 text-xs text-[#A0A0A0] mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${fingerInfo.color}`} />
                  <span>
                    {fingerInfo.finger} ({fingerInfo.side === "left" ? "Left Hand" : "Right Hand"})
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#666666] hover:text-[#F5F5F5] hover:bg-[#181818] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Trend Tag */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#111111] border border-[#262626] text-xs">
            <span className="text-[#A0A0A0] font-medium">Performance Status:</span>
            <span
              className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                trend === "Improving"
                  ? "bg-[#79D88B]/10 text-[#79D88B] border border-[#79D88B]/30"
                  : trend === "Stable"
                    ? "bg-[#45D6E8]/10 text-[#45D6E8] border border-[#45D6E8]/30"
                    : "bg-[#F05A9D]/10 text-[#F05A9D] border border-[#F05A9D]/30"
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
            <div className="p-3.5 bg-[#111111] rounded-2xl border border-[#262626] text-center">
              <div className="text-[10px] text-[#666666] font-sans uppercase">Accuracy</div>
              <div className="text-2xl font-extrabold text-[#79D88B]">{keyData.accuracy}%</div>
              <div className="text-[10px] text-[#666666]">Precision Rate</div>
            </div>

            <div className="p-3.5 bg-[#111111] rounded-2xl border border-[#262626] text-center">
              <div className="text-[10px] text-[#666666] font-sans uppercase">Reaction Speed</div>
              <div className="text-2xl font-extrabold text-[#F5F5F5]">{keyData.avgLatencyMs}</div>
              <div className="text-[10px] text-[#666666]">Milliseconds</div>
            </div>

            <div className="p-3.5 bg-[#111111] rounded-2xl border border-[#262626] text-center">
              <div className="text-[10px] text-[#666666] font-sans uppercase">Total Presses</div>
              <div className="text-xl font-bold text-[#45D6E8]">{keyData.presses}</div>
              <div className="text-[10px] text-[#666666]">{correctPresses} correct</div>
            </div>

            <div className="p-3.5 bg-[#111111] rounded-2xl border border-[#262626] text-center">
              <div className="text-[10px] text-[#666666] font-sans uppercase">Total Errors</div>
              <div className="text-xl font-bold text-[#F05A9D]">{keyData.errors}</div>
              <div className="text-[10px] text-[#666666]">Missed key strikes</div>
            </div>
          </div>

          {/* Practice Key Action */}
          <button
            onClick={() => {
              onPracticeKey(keyData.key);
              onClose();
            }}
            className="w-full py-3.5 rounded-2xl bg-[#18C69A] hover:bg-[#14A782] text-[#0A0A0A] font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-[#0A0A0A]" />
            Launch Drill for Key '{keyData.displayLabel}'
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

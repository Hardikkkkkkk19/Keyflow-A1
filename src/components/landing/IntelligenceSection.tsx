import React, { useState } from "react";
import { motion } from "motion/react";
import { VirtualKeyboard } from "../keyboard/VirtualKeyboard";
import { generateKeyHeatmapData } from "../../utils/typingUtils";
import { RoutePath } from "../../types";
import { Cpu, Flame, Target, AlertTriangle, ArrowRight } from "lucide-react";

interface IntelligenceSectionProps {
  onNavigate: (path: RoutePath) => void;
}

export const IntelligenceSection: React.FC<IntelligenceSectionProps> = ({ onNavigate }) => {
  const heatmapData = generateKeyHeatmapData();
  const [selectedKey, setSelectedKey] = useState<string>("p");

  const weakKeyInfo =
    heatmapData.find((k) => k.key.toLowerCase() === selectedKey.toLowerCase()) || heatmapData[15];

  return (
    <section className="py-20 md:py-28 bg-kfn-900 text-white dark:bg-kfn-950 overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-kfa-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Copy */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kfa-900/80 border border-kfa-700/80 text-xs font-semibold text-kfa-300">
            <Cpu className="w-3.5 h-3.5 text-kfa-400" />
            <span>Key Latency Heatmap</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            KEYFLOW learns where you struggle.
          </h2>

          <p className="text-base sm:text-lg text-kfn-300">
            Every keystroke latency and error is mapped in real time to isolate weak fingers and
            friction keys.
          </p>
        </div>

        {/* Heatmap Visual Container */}
        <div className="bg-kfn-800/80 rounded-3xl p-6 sm:p-8 border border-kfn-700/80 shadow-2xl max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-kfn-700/80">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                Live Finger Latency & Accuracy Heatmap
              </h3>
              <p className="text-xs text-kfn-400">
                Click any key on the board to view finger latency metrics
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-kfa-500" /> Optimal (&lt;120ms)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-400" /> Medium (120-160ms)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500" /> Weak Key (&gt;180ms)
              </span>
            </div>
          </div>

          {/* Interactive Virtual Heatmap Keyboard */}
          <VirtualKeyboard
            isHeatmapMode={true}
            heatmapData={heatmapData}
            onKeyClick={(key) => setSelectedKey(key)}
            size="md"
          />

          {/* Selected Key Deep-Dive Panel */}
          <div className="mt-6 p-5 bg-kfn-900 rounded-2xl border border-kfn-700/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-kfn-800 border-2 border-kfa-500/80 flex items-center justify-center font-mono font-bold text-2xl text-white shadow-lg">
                {weakKeyInfo.displayLabel}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    Key Diagnostic for '{weakKeyInfo.displayLabel}'
                  </span>
                  {weakKeyInfo.heatLevel === "hot" && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-semibold border border-rose-500/30">
                      Weak Key
                    </span>
                  )}
                </div>
                <div className="text-xs text-kfn-400 flex items-center gap-4">
                  <span>
                    Presses: <strong className="text-white font-mono">{weakKeyInfo.presses}</strong>
                  </span>
                  <span>
                    Accuracy:{" "}
                    <strong className="text-white font-mono">{weakKeyInfo.accuracy}%</strong>
                  </span>
                  <span>
                    Avg Latency:{" "}
                    <strong className="text-white font-mono">{weakKeyInfo.avgLatencyMs}ms</strong>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate("/drills")}
              className="px-4 py-2.5 rounded-xl bg-kfa-600 hover:bg-kfa-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-colors cursor-pointer shrink-0"
            >
              Train Key '{weakKeyInfo.displayLabel}' <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

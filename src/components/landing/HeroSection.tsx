import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { AnimatedButton } from "../common/AnimatedButton";
import { AnimatedCounter } from "../common/AnimatedCounter";
import { VirtualKeyboard } from "../keyboard/VirtualKeyboard";
import { RoutePath } from "../../types";
import { ArrowRight, Sparkles, Play, RotateCcw, Activity, Target, ShieldCheck } from "lucide-react";

interface HeroSectionProps {
  onNavigate: (path: RoutePath) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  // Live simulated typing text for Hero interactive keyboard
  const heroDemoText = "Master modern typing flow with precision and speed.";
  const [typedIndex, setTypedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [heroWpm, setHeroWpm] = useState(78);
  const [heroAccuracy, setHeroAccuracy] = useState(96.4);
  const [heroConsistency, setHeroConsistency] = useState(91);

  // Auto-typing animation for hero interactive keyboard
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTypedIndex((prev) => {
        if (prev >= heroDemoText.length) {
          // Reset after pause
          setTimeout(() => setTypedIndex(0), 1200);
          return prev;
        }
        return prev + 1;
      });

      // Smooth subtle fluctuation of metrics
      setHeroWpm((w) => Number((w + (Math.random() * 2 - 0.9)).toFixed(0)));
      setHeroAccuracy((a) =>
        Number(Math.min(100, Math.max(94, a + (Math.random() * 0.4 - 0.2))).toFixed(1)),
      );
      setHeroConsistency((c) =>
        Number(Math.min(99, Math.max(88, c + (Math.random() * 0.6 - 0.3))).toFixed(0)),
      );
    }, 180);

    return () => clearInterval(interval);
  }, [isPlaying, heroDemoText]);

  const currentActiveKey = typedIndex < heroDemoText.length ? heroDemoText[typedIndex] : "";

  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-32 overflow-hidden">
      {/* Background soft ambient lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-kfa-200/40 via-kfa-200/30 to-kfa-200/20 dark:from-kfa-950/30 dark:via-kfa-900/20 dark:to-kfa-950/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Top Copy */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Social Proof Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-kfn-900 border border-kfn-200/80 dark:border-kfn-800 shadow-sm text-xs font-semibold text-kfn-700 dark:text-kfn-300"
          >
            <span className="w-2 h-2 rounded-full bg-kfa-500 animate-ping" />
            <ShieldCheck className="w-3.5 h-3.5 text-kfa-600 dark:text-kfa-400" />
            <span>Built for students, developers & professionals</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-kfn-900 dark:text-white tracking-tight leading-[1.08]"
          >
            Type smarter.
            <br />
            <span className="bg-gradient-to-r from-kfa-600 via-kfa-600 to-kfa-600 dark:from-kfa-400 dark:via-kfa-400 dark:to-kfa-400 bg-clip-text text-transparent">
              Get faster.
            </span>
          </motion.h1>

          {/* Supporting text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-kfn-600 dark:text-kfn-300 max-w-2xl mx-auto leading-relaxed"
          >
            Build faster typing habits with personalized practice, intelligent drills, and
            performance insights.
          </motion.p>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            <AnimatedButton
              size="lg"
              variant="primary"
              onClick={() => onNavigate("/practice")}
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Start Practicing
            </AnimatedButton>

            <AnimatedButton
              size="lg"
              variant="outline"
              onClick={() => {
                const el = document.getElementById("features-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Explore KEYFLOW
            </AnimatedButton>
          </motion.div>
        </div>

        {/* Hero Interactive Keyboard Visual & Live Stats */}
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.7,
            delay: 0.4,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          }}
          className="mt-14 max-w-5xl mx-auto relative"
        >
          {/* Main Workspace Frame */}
          <div className="bg-white/80 dark:bg-kfn-900/80 backdrop-blur-xl rounded-3xl p-4 sm:p-7 border border-kfn-200/90 dark:border-kfn-800 shadow-2xl shadow-kfa-500/10">
            {/* Live Typing Display Box */}
            <div className="mb-6 p-4 sm:p-5 bg-kfn-50 dark:bg-kfn-950/80 rounded-2xl border border-kfn-200/70 dark:border-kfn-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 font-mono text-base sm:text-lg tracking-wide leading-relaxed">
                <span className="text-kfa-600 dark:text-kfa-400 font-semibold">
                  {heroDemoText.slice(0, typedIndex)}
                </span>
                <span className="bg-kfa-600 text-white px-0.5 animate-pulse rounded-sm">
                  {heroDemoText[typedIndex] || "|"}
                </span>
                <span className="text-kfn-400 dark:text-kfn-600">
                  {heroDemoText.slice(typedIndex + 1)}
                </span>
              </div>

              {/* Simulation Playback controls */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-kfn-800 text-kfn-700 dark:text-kfn-200 border border-kfn-200 dark:border-kfn-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-kfn-100 dark:hover:bg-kfn-700 transition-colors cursor-pointer"
                >
                  {isPlaying ? (
                    <Activity className="w-3.5 h-3.5 text-kfa-500 animate-pulse" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  <span>{isPlaying ? "Live Sim" : "Paused"}</span>
                </button>
                <button
                  onClick={() => setTypedIndex(0)}
                  className="p-1.5 rounded-lg bg-white dark:bg-kfn-800 text-kfn-600 dark:text-kfn-400 border border-kfn-200 dark:border-kfn-700 hover:bg-kfn-100 transition-colors cursor-pointer"
                  title="Reset demo"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Virtual Keyboard Component */}
            <VirtualKeyboard
              activeKey={currentActiveKey}
              pressedKey={currentActiveKey}
              showFingerGuide={true}
              size="md"
            />

            {/* Floating Performance Panel Cards around Keyboard */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6">
              {/* Card 1: WPM */}
              <div className="p-4 bg-white dark:bg-kfn-900 rounded-2xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-kfa-50 dark:bg-kfa-950 text-kfa-600 dark:text-kfa-400 flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-medium text-kfn-500 dark:text-kfn-400">
                    Current WPM
                  </div>
                  <div className="text-2xl font-extrabold text-kfn-900 dark:text-white font-mono flex items-baseline gap-1">
                    <AnimatedCounter value={heroWpm} />
                    <span className="text-xs font-sans text-kfa-600 font-semibold">
                      +12% vs avg
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Accuracy */}
              <div className="p-4 bg-white dark:bg-kfn-900 rounded-2xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-kfa-50 dark:bg-kfa-950 text-kfa-600 dark:text-kfa-400 flex items-center justify-center font-bold">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-medium text-kfn-500 dark:text-kfn-400">
                    Accuracy Rate
                  </div>
                  <div className="text-2xl font-extrabold text-kfn-900 dark:text-white font-mono">
                    <AnimatedCounter value={heroAccuracy} decimals={1} suffix="%" />
                  </div>
                </div>
              </div>

              {/* Card 3: Consistency */}
              <div className="p-4 bg-white dark:bg-kfn-900 rounded-2xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-kfa-50 dark:bg-kfa-950 text-kfa-600 dark:text-kfa-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-medium text-kfn-500 dark:text-kfn-400">
                    Flow Consistency
                  </div>
                  <div className="text-2xl font-extrabold text-kfn-900 dark:text-white font-mono">
                    <AnimatedCounter value={heroConsistency} suffix="%" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

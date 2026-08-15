import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, CheckCircle, Check } from "lucide-react";

interface WelcomeTransitionProps {
  displayName: string;
  onComplete: () => void;
}

export const WelcomeTransition: React.FC<WelcomeTransitionProps> = ({
  displayName,
  onComplete,
}) => {
  // CRITICAL: Progress strictly begins at 0%
  const [progress, setProgress] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Check prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReducedMotion) {
      setProgress(100);
      const timer = setTimeout(() => {
        if (onCompleteRef.current) onCompleteRef.current();
      }, 500);
      return () => clearTimeout(timer);
    }

    // Paced boot sequence: ~3000ms duration for genuine, perceptible progression
    const totalDuration = 3000; // 3 seconds
    const startTime = performance.now();
    let animFrameId: number;

    const updateBootProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const normalizedTime = Math.min(1, elapsed / totalDuration);

      // Smooth progression across the 3 seconds: 0 -> 10 -> 25 -> 40 -> 55 -> 70 -> 85 -> 100
      let currentProgress = 0;

      if (normalizedTime <= 0.2) {
        // 0% -> 20%
        const t = normalizedTime / 0.2;
        currentProgress = 0 + 20 * t;
      } else if (normalizedTime <= 0.4) {
        // 20% -> 40%
        const t = (normalizedTime - 0.2) / 0.2;
        currentProgress = 20 + 20 * t;
      } else if (normalizedTime <= 0.6) {
        // 40% -> 60%
        const t = (normalizedTime - 0.4) / 0.2;
        currentProgress = 40 + 20 * t;
      } else if (normalizedTime <= 0.8) {
        // 60% -> 80%
        const t = (normalizedTime - 0.6) / 0.2;
        currentProgress = 60 + 20 * t;
      } else if (normalizedTime <= 0.95) {
        // 80% -> 99%
        const t = (normalizedTime - 0.8) / 0.15;
        currentProgress = 80 + 19 * t;
      } else {
        // 99% -> 100%
        const t = (normalizedTime - 0.95) / 0.05;
        currentProgress = 99 + 1 * t;
      }

      const clamped = Math.min(100, Math.max(0, currentProgress));
      setProgress(clamped);

      if (normalizedTime < 1) {
        animFrameId = requestAnimationFrame(updateBootProgress);
      } else {
        setProgress(100);
        // Show the 100% "KeyFlow Engine Ready" state for ~350ms before navigating
        setTimeout(() => {
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }
        }, 350);
      }
    };

    animFrameId = requestAnimationFrame(updateBootProgress);

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [prefersReducedMotion]);

  // Contextual status message corresponding to current boot progress
  const getSubMessage = () => {
    if (progress < 20) return "Initializing your session...";
    if (progress < 40) return "Loading your typing profile...";
    if (progress < 60) return "Syncing performance data...";
    if (progress < 80) return "Preparing your personalized typing arena...";
    if (progress < 100) return "Finalizing KeyFlow Engine...";
    return "Session initialized. Preparing your personalized typing arena...";
  };

  const displayPercent = Math.round(progress);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none"
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative max-w-md w-full bg-[#081712] border border-[#18C69A]/20 rounded-[28px] p-8 sm:p-9 shadow-2xl shadow-black/90 text-center overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#18C69A]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Logo / Brand Mark Badge Matching User Screenshot */}
          <div className="relative z-10 flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative"
            >
              {/* Outer Badge */}
              <div className="w-20 h-20 rounded-2xl bg-[#040D0A] border border-[#18C69A]/40 p-1 shadow-lg shadow-[#18C69A]/20 flex items-center justify-center relative">
                {/* SVG Character Icon from Screenshot */}
                <svg
                  className="w-10 h-10 text-[#18C69A]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="5" r="1.5" />
                  <path d="M12 9v4" />
                  <path d="M8 11l4 2 4-2" />
                  <path d="M9 19l3-4 3 4" />
                  <path d="M18 6l1 1-1 1" />
                </svg>

                {/* Top Right Corner Check Badge */}
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#040D0A] border border-[#18C69A] flex items-center justify-center text-[#18C69A] shadow-md shadow-[#18C69A]/30">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Greeting Header */}
          <div className="relative z-10 space-y-3 mb-8">
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white"
            >
              Welcome,{" "}
              <span className="text-[#18C69A] font-extrabold">
                {displayName || "Hardik Jadhav"}
              </span>
              !
            </motion.h2>

            <div className="text-2xl select-none leading-none">
              <span className="inline-block animate-waving-hand">👋</span>
            </div>

            <motion.p
              key={getSubMessage()}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs sm:text-sm text-[#8E9B94] font-normal leading-relaxed max-w-xs mx-auto min-h-[2.5rem] flex items-center justify-center"
            >
              {getSubMessage()}
            </motion.p>
          </div>

          {/* Progress Bar & Telemetry Details */}
          <div className="relative z-10 space-y-3">
            <div className="w-full bg-[#040D0A] rounded-full h-2 overflow-hidden border border-white/5 p-0.5">
              <div
                className="h-full bg-[#18C69A] rounded-full shadow-[0_0_12px_rgba(24,198,154,0.6)] transition-[width] duration-75 ease-out"
                style={{ width: `${displayPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-[#8E9B94] px-0.5">
              <span className="flex items-center gap-1.5 text-[11px]">
                {displayPercent >= 100 ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-[#18C69A]" />
                    <span className="text-[#18C69A] font-semibold">KeyFlow Engine Ready</span>
                  </>
                ) : (
                  <>
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[#8E9B94]">Keyflow Engine Active</span>
                  </>
                )}
              </span>

              <span className="font-bold text-[#18C69A]">{displayPercent}%</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

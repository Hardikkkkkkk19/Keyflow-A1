import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface StagedLoadingScreenProps {
  isReady: boolean;
  onComplete: () => void;
}

export const StagedLoadingScreen: React.FC<StagedLoadingScreenProps> = ({
  isReady,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Failsafe timer: if auth restoration exceeds 2.5 seconds, force progression
  useEffect(() => {
    const failsafeTimer = setTimeout(() => {
      setTimedOut(true);
    }, 2500);
    return () => clearTimeout(failsafeTimer);
  }, []);

  const ready = isReady || timedOut;

  // Staged progress animation controller
  useEffect(() => {
    const tick = () => {
      setProgress((prev) => {
        if (prev >= 100) return 100;

        // Stage targets: 25 -> 45 -> 65 -> 80 -> 95 -> 100
        if (prev < 25) {
          return Math.min(25, prev + 5);
        } else if (prev < 45) {
          return Math.min(45, prev + 5);
        } else if (prev < 65) {
          return Math.min(65, prev + 5);
        } else if (prev < 80) {
          return Math.min(80, prev + 5);
        } else if (prev < 95) {
          return Math.min(95, prev + 5);
        } else if (prev < 100) {
          // Advance from 95% to 100% when backend/auth is ready or timed out
          if (ready) {
            return Math.min(100, prev + 5);
          }
          return 95;
        }
        return prev;
      });
    };

    // Smooth interval (~60ms) for high-end feel
    const interval = setInterval(tick, 60);

    return () => clearInterval(interval);
  }, [ready]);

  // Handle completion trigger when progress hits 100%
  const onCompleteFired = useRef(false);

  useEffect(() => {
    if (progress >= 100 && !onCompleteFired.current) {
      onCompleteFired.current = true;
      setIsFinished(true);
      setTimeout(() => {
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }, 350);
    }
  }, [progress]);

  // Status subtitle based on progress stage
  const getStatusText = () => {
    if (progress < 25) return "INITIALIZING KEYFLOW SYSTEM...";
    if (progress < 45) return "RESTORING AUTH SESSION...";
    if (progress < 65) return "LOADING USER PROGRESSION...";
    if (progress < 80) return "SYNCHRONIZING TELEMETRY...";
    if (progress < 95) return "FINALIZING CONFIGURATION...";
    if (progress < 100) return "PREPARING DASHBOARD...";
    return "SYSTEM READY";
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isFinished ? 0 : 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] bg-[#0A0A0A] text-[#F5F5F5] flex flex-col items-center justify-center p-6 select-none overflow-hidden"
    >
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 bg-radial-atmosphere pointer-events-none opacity-60" />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8 text-center">
        {/* Brand Icon */}
        <motion.div
          animate={progress >= 100 ? { scale: [1, 1.1, 1], rotate: 0 } : { scale: [1, 1.05, 1] }}
          transition={{ repeat: progress >= 100 ? 0 : Infinity, duration: 2 }}
          className="relative"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#151515] border border-[#18C69A]/40 p-0.5 shadow-2xl shadow-[#18C69A]/20 flex items-center justify-center">
            {progress >= 100 ? (
              <CheckCircle2 className="w-8 h-8 text-[#18C69A]" />
            ) : (
              <Sparkles className="w-8 h-8 text-[#18C69A] animate-pulse" />
            )}
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-[#18C69A]/10 -z-10 blur-lg animate-pulse" />
        </motion.div>

        {/* Brand Name & Subtitle */}
        <div className="space-y-2">
          <h1 className="font-serif italic text-3xl tracking-wide text-[#F5F5F5] font-semibold">
            KEYFLOW
          </h1>
          <p className="text-xs text-[#18C69A] font-mono tracking-widest min-h-[1.25rem]">
            {getStatusText()}
          </p>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="w-full space-y-3">
          <div className="relative w-full h-2 bg-[#151515] border border-[#262626] rounded-full overflow-hidden p-0.5">
            <motion.div
              className="h-full bg-gradient-to-r from-[#18C69A]/80 to-[#18C69A] rounded-full shadow-[0_0_12px_rgba(24,198,154,0.6)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.15 }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[#666666] px-1">
            <span>KEYBOARD TELEMETRY</span>
            <span className="font-bold text-[#F5F5F5]">{progress}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

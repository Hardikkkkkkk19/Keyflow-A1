import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Zap } from "lucide-react";

interface XpEarnedToastProps {
  xpAmount: number;
  reason: string;
  onClose: () => void;
}

export const XpEarnedToast: React.FC<XpEarnedToastProps> = ({ xpAmount, reason, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#151515]/95 border border-[#18C69A]/40 text-[#F5F5F5] rounded-2xl shadow-xl backdrop-blur-md"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-[#18C69A] flex items-center justify-center font-extrabold text-sm text-white shadow-md shadow-amber-500/20 shrink-0">
          <Zap className="w-5 h-5 fill-current text-amber-300" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 font-mono font-extrabold text-sm text-amber-400">
            <span>+{xpAmount} XP</span>
            <Sparkles className="w-3.5 h-3.5 text-[#18C69A]" />
          </div>
          <p className="text-xs font-medium text-[#A0A0A0]">{reason}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

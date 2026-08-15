import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, Sparkles, X } from "lucide-react";
import { Badge } from "../../types";

interface AchievementToastProps {
  badge: Badge;
  onClose: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ badge, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 50, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 50, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="fixed top-20 right-6 z-50 flex items-center gap-4 p-4 bg-[#151515]/95 border border-amber-500/40 text-[#F5F5F5] rounded-3xl shadow-2xl max-w-sm backdrop-blur-md"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-[#18C69A] text-[#F5F5F5] flex items-center justify-center font-bold shadow-md shadow-amber-500/20 shrink-0">
          <Award className="w-6 h-6 text-amber-200" />
        </div>

        <div className="flex-1 space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>Achievement Unlocked</span>
          </div>
          <h4 className="font-extrabold text-sm text-[#F5F5F5]">{badge.title}</h4>
          <p className="text-xs text-[#A0A0A0] leading-tight">{badge.description}</p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-[#666666] hover:text-[#F5F5F5] rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

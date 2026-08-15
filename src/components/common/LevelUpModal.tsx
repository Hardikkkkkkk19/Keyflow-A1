import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, Sparkles, Trophy, ArrowRight } from "lucide-react";

interface LevelUpModalProps {
  previousLevel: number;
  newLevel: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ previousLevel, newLevel, onClose }) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-sm bg-[#151515] border border-[#18C69A]/40 text-[#F5F5F5] rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-6 overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#18C69A]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="relative z-10 w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 via-[#18C69A] to-[#18C69A] p-0.5 shadow-xl shadow-[#18C69A]/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#0A0A0A] rounded-[22px] flex items-center justify-center">
              <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
            </div>
          </div>

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18C69A]/20 border border-[#18C69A]/30 text-[#18C69A] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Level Up!</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#F5F5F5]">
              You're getting faster!
            </h2>
            <p className="text-xs text-[#A0A0A0]">
              Your speed and accuracy are unlocking higher mastery tiers.
            </p>
          </div>

          {/* Level Transition Badge */}
          <div className="relative z-10 p-4 rounded-2xl bg-[#181818] border border-[#262626] flex items-center justify-center gap-4">
            <div className="text-center space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-[#666666]">Previous</span>
              <div className="font-mono font-extrabold text-xl text-[#666666]">
                Lvl {previousLevel}
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-[#18C69A] animate-pulse" />

            <div className="text-center space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-amber-400">New Tier</span>
              <div className="font-mono font-extrabold text-2xl text-amber-300">Lvl {newLevel}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="relative z-10 w-full py-3.5 bg-[#18C69A] hover:bg-[#18C69A]/90 text-[#0A0A0A] font-bold text-sm rounded-2xl shadow-lg shadow-[#18C69A]/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Continue Training</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-kfn-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-sm bg-gradient-to-br from-kfn-900 via-kfa-950 to-kfn-900 border border-kfa-500/40 text-white rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-6 overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-kfa-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="relative z-10 w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 via-kfa-600 to-kfa-600 p-0.5 shadow-xl shadow-kfa-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-kfn-950 rounded-[22px] flex items-center justify-center">
              <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
            </div>
          </div>

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-kfa-500/20 border border-kfa-400/30 text-kfa-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Level Up!</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">You're getting faster!</h2>
            <p className="text-xs text-kfn-300">
              Your speed and accuracy are unlocking higher mastery tiers.
            </p>
          </div>

          {/* Level Transition Badge */}
          <div className="relative z-10 p-4 rounded-2xl bg-kfn-900/80 border border-kfn-800 flex items-center justify-center gap-4">
            <div className="text-center space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-kfn-400">Previous</span>
              <div className="font-mono font-extrabold text-xl text-kfn-400">
                Lvl {previousLevel}
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-kfa-400 animate-pulse" />

            <div className="text-center space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-amber-400">New Tier</span>
              <div className="font-mono font-extrabold text-2xl text-amber-300 bg-gradient-to-r from-amber-300 to-kfa-300 bg-clip-text text-transparent">
                Lvl {newLevel}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="relative z-10 w-full py-3.5 bg-gradient-to-r from-kfa-500 to-kfa-600 hover:from-kfa-400 hover:to-kfa-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-kfa-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Continue Training</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

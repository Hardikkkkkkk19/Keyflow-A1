import React from "react";
import { motion } from "motion/react";
import { AnimatedButton } from "../common/AnimatedButton";
import { RoutePath } from "../../types";
import { ArrowRight, Sparkles, Keyboard } from "lucide-react";

interface CTASectionProps {
  onNavigate: (path: RoutePath) => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onNavigate }) => {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-kfa-900 via-kfn-900 to-kfa-950 text-white relative overflow-hidden">
      {/* Glow orb background */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-kfa-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-kfa-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-kfa-200"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Elevate Your Typing Flow</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight"
        >
          Your next 10 minutes can make you faster.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-kfn-300 max-w-2xl mx-auto leading-relaxed"
        >
          Join thousands of developers, writers, and typists who build fluid keyboard mastery with
          KEYFLOW.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-4"
        >
          <AnimatedButton
            size="lg"
            variant="primary"
            onClick={() => onNavigate("/practice")}
            icon={<ArrowRight className="w-5 h-5" />}
            className="shadow-xl shadow-kfa-500/30 text-base font-bold"
          >
            Start Training
          </AnimatedButton>
        </motion.div>

        <div className="pt-6 flex flex-wrap justify-center gap-6 text-xs text-kfn-400 font-medium">
          <span className="flex items-center gap-1.5">
            <Keyboard className="w-4 h-4 text-kfa-400" /> No signup required to test
          </span>
          <span>•</span>
          <span>Zero installation</span>
          <span>•</span>
          <span>Instant audio feedback</span>
        </div>
      </div>
    </section>
  );
};

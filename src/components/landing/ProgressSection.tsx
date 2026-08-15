import React from "react";
import { motion } from "motion/react";
import { RoutePath } from "../../types";
import { Award, Zap, Flame, Trophy, ArrowRight } from "lucide-react";

interface ProgressSectionProps {
  onNavigate: (path: RoutePath) => void;
}

const milestones = [
  {
    stage: "Beginner",
    speed: "30 - 45 WPM",
    description: "Learn proper touch-typing hand placement and eliminate looking at keys.",
    icon: <Zap className="w-5 h-5 text-[#18C69A]" />,
    badge: "Stage 1",
  },
  {
    stage: "Improving",
    speed: "50 - 70 WPM",
    description: "Build muscle memory for common word prefixes, suffixes, and punctuation.",
    icon: <Flame className="w-5 h-5 text-[#45D6E8]" />,
    badge: "Stage 2",
  },
  {
    stage: "Fast",
    speed: "75 - 95 WPM",
    description: "Master smooth cadence, weak finger agility, and complex developer syntax.",
    icon: <Award className="w-5 h-5 text-[#B85CFF]" />,
    badge: "Stage 3",
  },
  {
    stage: "Advanced",
    speed: "100+ WPM",
    description: "Flow state velocity. Zero conscious friction between thought and keystroke.",
    icon: <Trophy className="w-5 h-5 text-amber-400" />,
    badge: "Stage 4",
  },
];

export const ProgressSection: React.FC<ProgressSectionProps> = ({ onNavigate }) => {
  return (
    <section className="py-20 md:py-28 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[#262626] text-xs font-semibold text-[#18C69A]">
            <span>Skill Progression Roadmap</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F5F5F5] tracking-tight">
            Your journey to 100+ WPM flow
          </h2>

          <p className="text-base text-[#A0A0A0]">
            Structured stages that guide you from foundational finger anchors to effortless
            velocity.
          </p>
        </div>

        {/* Progression Timeline Cards */}
        <div className="relative max-w-5xl mx-auto">
          {/* Animated Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-[#262626] -translate-y-1/2 z-0">
            <motion.div
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              className="h-full bg-gradient-to-r from-[#18C69A] via-[#45D6E8] to-[#B85CFF] rounded-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {milestones.map((m, idx) => (
              <motion.div
                key={m.stage}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="bg-[#151515] p-6 rounded-3xl border border-[#262626] shadow-md hover:border-[#303030] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#181818] flex items-center justify-center">
                      {m.icon}
                    </div>
                    <span className="text-xs font-bold text-[#18C69A] font-mono">{m.badge}</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#F5F5F5]">{m.stage}</h3>
                    <div className="text-sm font-bold font-mono text-[#18C69A] mt-0.5">
                      {m.speed}
                    </div>
                  </div>

                  <p className="text-xs text-[#A0A0A0] leading-relaxed">{m.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#262626] text-[11px] font-semibold text-[#666666] flex items-center justify-between">
                  <span>Target Benchmark</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

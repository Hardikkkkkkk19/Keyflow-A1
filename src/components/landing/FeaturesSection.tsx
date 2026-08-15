import React from "react";
import { motion } from "motion/react";
import { RoutePath } from "../../types";
import { Keyboard, Flame, LineChart, Sparkles, ArrowRight } from "lucide-react";

interface FeaturesSectionProps {
  onNavigate: (path: RoutePath) => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onNavigate }) => {
  const features = [
    {
      id: "live-typing",
      path: "/practice" as RoutePath,
      title: "Live Typing Practice",
      description:
        "Train with realistic texts, developer code snippets, and custom speed burst modes with zero latency feedback.",
      icon: <Keyboard className="w-6 h-6 text-[#18C69A]" />,
      accentColor: "emerald",
      badge: "Interactive",
      metrics: "Custom Modes & Audio Feedback",
    },
    {
      id: "smart-drills",
      path: "/drills" as RoutePath,
      title: "Smart Targeted Drills",
      description:
        "Isolate weak keys, master home row anchors, and train tricky top/bottom row reaches through structured exercises.",
      icon: <Flame className="w-6 h-6 text-amber-500" />,
      accentColor: "amber",
      badge: "Goal-Oriented",
      metrics: "Home Row, Pinky, Code Brackets",
    },
    {
      id: "analytics",
      path: "/analytics" as RoutePath,
      title: "Performance Analytics",
      description:
        "Track speed curves, accuracy stability, key-level latency, and rhythm consistency with deep visual charts.",
      icon: <LineChart className="w-6 h-6 text-[#45D6E8]" />,
      accentColor: "emerald",
      badge: "Data-Driven",
      metrics: "WPM, Latency, Heatmaps",
    },
    {
      id: "ai-coaching",
      path: "/coach" as RoutePath,
      title: "AI Coaching System",
      description:
        "Personalized recommendations that identify your finger hesitation patterns and automatically generate workouts.",
      icon: <Sparkles className="w-6 h-6 text-[#B85CFF]" />,
      accentColor: "emerald",
      badge: "Adaptive",
      metrics: "Real-Time Error Diagnosis",
    },
  ];

  return (
    <section
      id="features-section"
      className="py-20 md:py-28 bg-[#0D0D0D] border-y border-[#262626]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[#262626] text-xs font-semibold text-[#18C69A]"
          >
            <span>Core Capabilities</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-[#F5F5F5] tracking-tight"
          >
            Everything you need to type better
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-[#A0A0A0]"
          >
            A cohesive suite of tools designed to transform finger muscle memory into fluid speed.
          </motion.p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => onNavigate(feature.path)}
              className="group p-6 sm:p-8 bg-[#151515] rounded-3xl border border-[#262626] shadow-sm hover:border-[#303030] hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#181818] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#1C1C1C] transition-all duration-300">
                    {feature.icon}
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#181818] text-[#A0A0A0] text-xs font-semibold">
                    {feature.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#F5F5F5] group-hover:text-[#18C69A] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#A0A0A0] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-[#262626] flex items-center justify-between text-xs font-medium text-[#666666]">
                <span className="font-mono text-[#18C69A]">{feature.metrics}</span>
                <span className="inline-flex items-center gap-1 text-[#F5F5F5] font-semibold group-hover:translate-x-1 transition-transform">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

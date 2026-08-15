import React from "react";
import { motion } from "motion/react";

interface ProgressBarProps {
  progress: number; // 0-100
  height?: string;
  colorClass?: string;
  bgClass?: string;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = "h-2",
  colorClass = "bg-[#18C69A]",
  bgClass = "bg-[#181818]",
  showLabel = false,
  label,
  className = "",
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-medium text-[#A0A0A0] mb-1.5">
          <span>{label || "Progress"}</span>
          <span>{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div
        className={`w-full ${height} ${bgClass} rounded-full overflow-hidden p-0.5 border border-[#262626]`}
      >
        <motion.div
          className={`h-full rounded-full ${colorClass}`}
          initial={{ width: "0%" }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          }}
        />
      </div>
    </div>
  );
};

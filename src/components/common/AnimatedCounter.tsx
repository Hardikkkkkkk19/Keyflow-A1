import React, { useEffect, useState } from "react";
import { motion, useSpring } from "motion/react";

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  durationSec?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
  durationSec = 0.8,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const spring = useSpring(value, {
    stiffness: 100,
    damping: 20,
    duration: durationSec * 1000,
  });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest: any) => {
      setDisplayValue(Number(latest));
    });
    return () => unsubscribe();
  }, [spring]);

  return (
    <motion.span className={`inline-block font-mono tracking-tight ${className}`}>
      {prefix}
      {typeof displayValue === "number" ? displayValue.toFixed(decimals) : displayValue}
      {suffix}
    </motion.span>
  );
};

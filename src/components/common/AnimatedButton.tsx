import React from "react";
import { motion, HTMLMotionProps } from "motion/react";

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  icon,
  iconPosition = "right",
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-kfa-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-5 py-2.5 text-sm rounded-xl gap-2 shadow-sm",
    lg: "px-7 py-3.5 text-base rounded-2xl gap-2.5 shadow-md",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-kfa-600 to-kfa-600 hover:from-kfa-500 hover:to-kfa-500 text-white shadow-kfa-500/20 hover:shadow-kfa-500/30 border border-kfa-500/20",
    secondary:
      "bg-kfn-900 hover:bg-kfn-800 dark:bg-kfn-100 dark:hover:bg-white text-white dark:text-kfn-900 shadow-kfn-900/10",
    outline:
      "border border-kfn-300 dark:border-kfn-700 bg-white/80 dark:bg-kfn-900/80 hover:bg-kfn-100 dark:hover:bg-kfn-800 text-kfn-800 dark:text-kfn-200",
    ghost: "hover:bg-kfn-100 dark:hover:bg-kfn-800/80 text-kfn-700 dark:text-kfn-300",
    glass:
      "bg-white/60 dark:bg-kfn-800/60 backdrop-blur-md border border-white/40 dark:border-kfn-700/50 text-kfn-800 dark:text-kfn-200 hover:bg-white/80 dark:hover:bg-kfn-800/80 shadow-sm",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && iconPosition === "left" && (
        <motion.span
          initial={{ x: 0 }}
          whileHover={{ x: -2 }}
          transition={{ duration: 0.15 }}
          className="shrink-0"
        >
          {icon}
        </motion.span>
      )}
      <span>{children}</span>
      {icon && iconPosition === "right" && (
        <motion.span
          initial={{ x: 0 }}
          whileHover={{ x: 2 }}
          transition={{ duration: 0.15 }}
          className="shrink-0"
        >
          {icon}
        </motion.span>
      )}
    </motion.button>
  );
};

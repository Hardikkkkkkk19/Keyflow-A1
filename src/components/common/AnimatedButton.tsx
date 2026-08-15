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
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#18C69A] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-5 py-2.5 text-sm rounded-xl gap-2 shadow-sm",
    lg: "px-7 py-3.5 text-base rounded-2xl gap-2.5 shadow-md",
  };

  const variantStyles = {
    primary:
      "bg-[#18C69A] hover:bg-[#18C69A]/90 text-[#0A0A0A] font-bold shadow-lg shadow-[#18C69A]/20 border border-[#18C69A]/30",
    secondary: "bg-[#181818] hover:bg-[#1C1C1C] text-[#F5F5F5] border border-[#262626]",
    outline: "border border-[#262626] bg-transparent hover:bg-[#181818] text-[#F5F5F5]",
    ghost: "hover:bg-[#181818] text-[#A0A0A0] hover:text-[#F5F5F5]",
    glass:
      "bg-[#151515]/80 backdrop-blur-md border border-[#262626] text-[#F5F5F5] hover:bg-[#181818]",
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

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "indigo" | "slate" | "emerald" | "amber" | "violet" | "rose" | "outline";
  size?: "sm" | "md";
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "indigo",
  size = "sm",
  icon,
  className = "",
}) => {
  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-xs font-medium rounded-full gap-1",
    md: "px-3 py-1 text-sm font-medium rounded-full gap-1.5",
  };

  const variantStyles = {
    indigo: "bg-[#45D6E8]/10 text-[#45D6E8] border border-[#45D6E8]/30",
    slate: "bg-[#181818] text-[#A0A0A0] border border-[#262626]",
    emerald: "bg-[#18C69A]/10 text-[#18C69A] border border-[#18C69A]/30",
    amber: "bg-[#F4D35E]/10 text-[#F4D35E] border border-[#F4D35E]/30",
    violet: "bg-[#B85CFF]/10 text-[#B85CFF] border border-[#B85CFF]/30",
    rose: "bg-[#F05A9D]/10 text-[#F05A9D] border border-[#F05A9D]/30",
    outline: "bg-transparent text-[#A0A0A0] border border-[#262626]",
  };

  return (
    <span
      className={`inline-flex items-center tracking-tight whitespace-nowrap ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

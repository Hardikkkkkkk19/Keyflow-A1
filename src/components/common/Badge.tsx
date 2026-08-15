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
    indigo:
      "bg-kfa-50 text-kfa-700 dark:bg-kfa-950/60 dark:text-kfa-300 border border-kfa-200/60 dark:border-kfa-800/60",
    slate:
      "bg-kfn-100 text-kfn-700 dark:bg-kfn-800 dark:text-kfn-300 border border-kfn-200 dark:border-kfn-700",
    emerald:
      "bg-kfa-50 text-kfa-700 dark:bg-kfa-950/60 dark:text-kfa-300 border border-kfa-200/60 dark:border-kfa-800/60",
    amber:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60",
    violet:
      "bg-kfa-50 text-kfa-700 dark:bg-kfa-950/60 dark:text-kfa-300 border border-kfa-200/60 dark:border-kfa-800/60",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60",
    outline:
      "bg-transparent text-kfn-600 dark:text-kfn-400 border border-kfn-200 dark:border-kfn-700",
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

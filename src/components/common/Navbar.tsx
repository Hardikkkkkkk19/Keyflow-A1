import React, { useState, useEffect } from "react";
import { RoutePath, ThemeMode } from "../../types";
import {
  Keyboard,
  Flame,
  Trophy,
  LineChart,
  Sparkles,
  User,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Menu,
  X,
  ArrowRight,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../context/AuthContext";

interface NavbarProps {
  currentPath: RoutePath;
  onNavigate: (path: RoutePath) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  userStats?: { level: number; wpm: number; streak: number };
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  theme,
  onToggleTheme,
  userStats = { level: 1, wpm: 0, streak: 0 },
}) => {
  const { user, profile, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initialLetter = (profile?.display_name || user?.email || "U").charAt(0).toUpperCase();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems: {
    path: RoutePath;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }[] = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      color: "#35D6A0", // Emerald / Mint Green
    },
    {
      path: "/practice",
      label: "Practice",
      icon: Keyboard,
      color: "#5BC0EB", // Blue / Cyan
    },
    {
      path: "/drills",
      label: "Drills",
      icon: Flame,
      color: "#FF9F43", // Orange
    },
    {
      path: "/analytics",
      label: "Analytics",
      icon: LineChart,
      color: "#35D6D6", // Cyan / Teal
    },
    {
      path: "/challenges",
      label: "Challenges",
      icon: Trophy,
      color: "#E85AAD", // Pink / Magenta
    },
    {
      path: "/coach",
      label: "AI Coach",
      icon: Sparkles,
      color: "#A78BFA", // Violet / Purple
    },
    {
      path: "/leaderboard",
      label: "Leaderboard",
      icon: Trophy,
      color: "#F4C542", // Gold / Yellow
    },
  ];

  const handleNavClick = (path: RoutePath) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#262626] py-2.5 shadow-2xl shadow-black/50"
          : "bg-[#0A0A0A]/75 backdrop-blur-sm py-3 border-b border-[#262626]/60"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Wordmark */}
        <button
          onClick={() => handleNavClick("/")}
          className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none transition-transform duration-200 active:scale-95"
        >
          <div className="w-7 h-7 rounded-md bg-[#151515] border border-[#18C69A]/40 flex items-center justify-center text-[#18C69A] group-hover:border-[#18C69A] group-hover:scale-105 transition-all duration-200 shadow-xs">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M7 11h2m2 0h2m2 0h2" strokeLinecap="round" />
              <path d="M8 15h8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-serif italic text-lg tracking-wide text-[#F5F5F5] group-hover:text-white transition-colors">
              KEY
              <span className="text-[#18C69A] not-italic font-sans font-extrabold text-sm tracking-tight">
                FLOW
              </span>
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-0.5 bg-[#151515] p-1 rounded-xl border border-[#262626]">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`relative px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer group active:scale-[0.98] ${
                  isActive
                    ? "text-[#F5F5F5] font-semibold"
                    : "text-[#A0A0A0] hover:text-[#F5F5F5] hover:bg-[#1C1C1C]/60"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavBg"
                    className="absolute inset-0 bg-[#1C1C1C] rounded-lg border"
                    style={{
                      borderColor: `${item.color}50`,
                      boxShadow: `0 0 12px ${item.color}15`,
                    }}
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <span
                    style={{
                      color: item.color,
                      opacity: isActive ? 1 : 0.85,
                      filter: isActive ? `drop-shadow(0 0 6px ${item.color}50)` : "none",
                    }}
                    className="transition-all duration-200 group-hover:opacity-100 group-hover:scale-110 group-hover:-translate-y-0.5"
                  >
                    <Icon className="w-3.5 h-3.5 transition-transform duration-200" />
                  </span>
                  <span>{item.label}</span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right side controls */}
        <div className="hidden md:flex items-center gap-2">
          {/* User Progress Pill if authenticated */}
          {user && (
            <button
              onClick={() => handleNavClick("/profile")}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#151515] border border-[#262626] rounded-xl hover:border-[#18C69A]/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-xs font-medium text-[#A0A0A0]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#18C69A] animate-pulse" />
              <span className="text-[#F5F5F5] font-mono">Lvl {userStats.level}</span>
              <span className="text-[#666666]">•</span>
              <span className="font-mono font-semibold text-[#45D6E8]">{userStats.wpm} WPM</span>
              <span className="text-[#666666]">•</span>
              <span className="flex items-center gap-1 text-[#F4D35E] font-mono font-bold">
                <Flame className="w-3 h-3 fill-[#F4D35E]/20" />
                {userStats.streak}d
              </span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 text-[#A0A0A0] hover:text-[#F5F5F5] bg-[#151515] hover:bg-[#1C1C1C] rounded-md transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer border border-[#262626]"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5 text-[#18C69A]" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#A0A0A0]" />
            )}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => handleNavClick("/settings")}
            className={`p-1.5 rounded-md transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer border ${
              currentPath === "/settings"
                ? "bg-[#1C1C1C] border-[#18C69A]/50 text-[#18C69A]"
                : "text-[#A0A0A0] hover:text-[#F5F5F5] bg-[#151515] hover:bg-[#1C1C1C] border-[#262626]"
            }`}
            title="Settings"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
          </button>

          {/* Auth State Button / Profile Avatar */}
          {user ? (
            <div className="flex items-center gap-1.5 ml-1">
              <button
                onClick={() => handleNavClick("/profile")}
                className="w-7 h-7 rounded-md bg-[#18C69A] text-[#0A0A0A] flex items-center justify-center font-bold text-xs hover:bg-[#20B88A] transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                title={profile?.display_name || user.email || "User Profile"}
              >
                {initialLetter}
              </button>
              <button
                onClick={() => {
                  signOut();
                  onNavigate("/login");
                }}
                className="p-1.5 text-[#666666] hover:text-[#F05A9D] hover:bg-[#1C1C1C] rounded-md transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleNavClick("/login")}
                className="px-3 py-1.5 text-xs font-medium text-[#A0A0A0] hover:text-[#F5F5F5] hover:bg-[#151515] rounded-md transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-1.5 border border-transparent hover:border-[#262626]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
              <button
                onClick={() => handleNavClick("/register")}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#0A0A0A] bg-[#18C69A] hover:bg-[#20B88A] rounded-md transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="p-2 text-[#A0A0A0] rounded-md hover:bg-[#151515]"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-[#18C69A]" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#F5F5F5] rounded-md bg-[#151515] border border-[#262626]"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#0A0A0A] border-b border-[#262626] px-4 pt-2 pb-6 space-y-3"
          >
            {user ? (
              <div className="flex items-center justify-between p-3 bg-[#151515] rounded-lg border border-[#18C69A]/30">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#18C69A]" />
                  <span className="text-xs font-medium text-[#F5F5F5]">
                    {profile?.display_name || "Champion"}
                  </span>
                </div>
                <span className="font-mono font-semibold text-sm text-[#45D6E8]">
                  {userStats.wpm} WPM
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-1">
                <button
                  onClick={() => handleNavClick("/login")}
                  className="py-2 px-3 text-xs font-semibold text-[#F5F5F5] bg-[#151515] border border-[#262626] rounded-lg flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Log In
                </button>
                <button
                  onClick={() => handleNavClick("/register")}
                  className="py-2 px-3 text-xs font-semibold text-[#0A0A0A] bg-[#18C69A] rounded-lg flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-1 pt-1">
              {navItems.map((item) => {
                const isActive = currentPath === item.path;
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-[#1C1C1C] text-[#F5F5F5] font-semibold border"
                        : "text-[#A0A0A0] hover:bg-[#151515] hover:text-[#F5F5F5]"
                    }`}
                    style={
                      isActive
                        ? {
                            borderColor: `${item.color}45`,
                            boxShadow: `0 0 10px ${item.color}12`,
                          }
                        : {}
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        style={{
                          color: item.color,
                          opacity: isActive ? 1 : 0.85,
                          filter: isActive ? `drop-shadow(0 0 6px ${item.color}40)` : "none",
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span>{item.label}</span>
                    </div>
                    <ArrowRight
                      className="w-3.5 h-3.5 opacity-60"
                      style={{ color: isActive ? item.color : undefined }}
                    />
                  </button>
                );
              })}
            </div>

            {user && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#262626]">
                <button
                  onClick={() => handleNavClick("/profile")}
                  className="flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium bg-[#151515] text-[#A0A0A0] border border-[#262626]"
                >
                  <User className="w-3.5 h-3.5" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    signOut();
                    onNavigate("/login");
                  }}
                  className="flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium bg-[#1C1C1C] text-[#F05A9D] border border-[#262626]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

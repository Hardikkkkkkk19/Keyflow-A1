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

  const navItems: { path: RoutePath; label: string; icon: React.ReactNode }[] = [
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { path: "/practice", label: "Practice", icon: <Keyboard className="w-3.5 h-3.5" /> },
    { path: "/drills", label: "Drills", icon: <Flame className="w-3.5 h-3.5" /> },
    { path: "/analytics", label: "Analytics", icon: <LineChart className="w-3.5 h-3.5" /> },
    { path: "/challenges", label: "Challenges", icon: <Trophy className="w-3.5 h-3.5" /> },
    { path: "/coach", label: "AI Coach", icon: <Sparkles className="w-3.5 h-3.5" /> },
    {
      path: "/leaderboard",
      label: "Leaderboard",
      icon: <Trophy className="w-3.5 h-3.5 text-[#18C69A]" />,
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
          ? "bg-[#050807]/90 backdrop-blur-md border-b border-[#F3F5F2]/10 py-2.5 shadow-2xl shadow-black/50"
          : "bg-[#050807]/60 backdrop-blur-sm py-3.5 border-b border-[#F3F5F2]/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Wordmark */}
        <button
          onClick={() => handleNavClick("/")}
          className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
        >
          <div className="w-7 h-7 rounded-md bg-[#0D1210] border border-[#18C69A]/40 flex items-center justify-center text-[#18C69A] group-hover:border-[#18C69A] transition-colors">
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
            <span className="font-serif italic text-lg tracking-wide text-[#F3F5F2] group-hover:text-white transition-colors">
              KEY
              <span className="text-[#18C69A] not-italic font-sans font-extrabold text-sm tracking-tight">
                FLOW
              </span>
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-0.5 bg-[#0D1210]/90 p-1 rounded-lg border border-[#F3F5F2]/10">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`relative px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "text-[#F3F5F2] font-semibold"
                    : "text-[#A6ADA8] hover:text-[#F3F5F2] hover:bg-[#151B18]/60"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavBg"
                    className="absolute inset-0 bg-[#151B18] rounded-md border border-[#18C69A]/30"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <span className={isActive ? "text-[#18C69A]" : "text-[#68716C]"}>
                    {item.icon}
                  </span>
                  {item.label}
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
              className="flex items-center gap-2 px-2.5 py-1.5 bg-[#0D1210] border border-[#F3F5F2]/10 rounded-md hover:border-[#18C69A]/40 transition-colors cursor-pointer text-xs font-medium text-[#A6ADA8]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#18C69A] animate-pulse" />
              <span className="text-[#F3F5F2]">Lvl {userStats.level}</span>
              <span className="text-[#68716C]">|</span>
              <span className="font-mono font-semibold text-[#18C69A]">{userStats.wpm} WPM</span>
              <span className="text-[#68716C]">|</span>
              <span className="flex items-center gap-1 text-amber-400 font-mono font-bold">
                <Flame className="w-3 h-3 fill-amber-400/20" />
                {userStats.streak}d
              </span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 text-[#A6ADA8] hover:text-[#F3F5F2] bg-[#0D1210] hover:bg-[#151B18] rounded-md transition-colors cursor-pointer border border-[#F3F5F2]/10"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5 text-[#18C69A]" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#A6ADA8]" />
            )}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => handleNavClick("/settings")}
            className={`p-1.5 rounded-md transition-colors cursor-pointer border ${
              currentPath === "/settings"
                ? "bg-[#151B18] border-[#18C69A]/50 text-[#18C69A]"
                : "text-[#A6ADA8] hover:text-[#F3F5F2] bg-[#0D1210] hover:bg-[#151B18] border-[#F3F5F2]/10"
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
                className="w-7 h-7 rounded-md bg-[#18C69A] text-[#050807] flex items-center justify-center font-bold text-xs hover:bg-[#20B88A] transition-colors cursor-pointer shadow-xs"
                title={profile?.display_name || user.email || "User Profile"}
              >
                {initialLetter}
              </button>
              <button
                onClick={() => {
                  signOut();
                  onNavigate("/login");
                }}
                className="p-1.5 text-[#68716C] hover:text-rose-400 hover:bg-rose-950/30 rounded-md transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleNavClick("/login")}
                className="px-3 py-1.5 text-xs font-medium text-[#A6ADA8] hover:text-[#F3F5F2] hover:bg-[#0D1210] rounded-md transition-colors cursor-pointer flex items-center gap-1.5 border border-transparent hover:border-[#F3F5F2]/10"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
              <button
                onClick={() => handleNavClick("/register")}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#050807] bg-[#18C69A] hover:bg-[#20B88A] rounded-md transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
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
            className="p-2 text-[#A6ADA8] rounded-md hover:bg-[#0D1210]"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-[#18C69A]" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#F3F5F2] rounded-md bg-[#0D1210] border border-[#F3F5F2]/10"
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
            className="md:hidden bg-[#050807] border-b border-[#F3F5F2]/10 px-4 pt-2 pb-6 space-y-3"
          >
            {user ? (
              <div className="flex items-center justify-between p-3 bg-[#0D1210] rounded-lg border border-[#18C69A]/30">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#18C69A]" />
                  <span className="text-xs font-medium text-[#F3F5F2]">
                    {profile?.display_name || "Champion"}
                  </span>
                </div>
                <span className="font-mono font-semibold text-sm text-[#18C69A]">
                  {userStats.wpm} WPM
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-1">
                <button
                  onClick={() => handleNavClick("/login")}
                  className="py-2 px-3 text-xs font-semibold text-[#F3F5F2] bg-[#0D1210] border border-[#F3F5F2]/10 rounded-lg flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Log In
                </button>
                <button
                  onClick={() => handleNavClick("/register")}
                  className="py-2 px-3 text-xs font-semibold text-[#050807] bg-[#18C69A] rounded-lg flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-1 pt-1">
              {navItems.map((item) => {
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-[#151B18] text-[#18C69A] border border-[#18C69A]/30 font-semibold"
                        : "text-[#A6ADA8] hover:bg-[#0D1210] hover:text-[#F3F5F2]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      {item.label}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                );
              })}
            </div>

            {user && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F3F5F2]/10">
                <button
                  onClick={() => handleNavClick("/profile")}
                  className="flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium bg-[#0D1210] text-[#A6ADA8] border border-[#F3F5F2]/10"
                >
                  <User className="w-3.5 h-3.5" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    signOut();
                    onNavigate("/login");
                  }}
                  className="flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium bg-rose-950/20 text-rose-400 border border-rose-900/30"
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

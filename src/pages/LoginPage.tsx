import React, { useState } from "react";
import { PageTransition } from "../components/common/PageTransition";
import { useAuth } from "../context/AuthContext";
import { RoutePath } from "../types";
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

interface LoginPageProps {
  onNavigate: (path: RoutePath) => void;
  redirectTo?: RoutePath;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, redirectTo }) => {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);

    if (result.error) {
      setErrorMsg(result.error.message);
    } else {
      // Successful login -> Navigate to target protected path or /dashboard
      onNavigate(redirectTo || "/dashboard");
    }
  };

  return (
    <PageTransition>
      <div className="relative min-h-[calc(100vh-4.5rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 overflow-hidden">
        {/* Background Atmosphere & Ambient Visuals */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* Subtle Emerald Radial Spotlight */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(24,198,154,0.09)_0%,rgba(10,10,10,0)_70%)] rounded-full blur-2xl" />

          {/* Faint Technical Grid Background */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: `linear-gradient(to right, #F5F5F5 1px, transparent 1px), linear-gradient(to bottom, #F5F5F5 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Low-Opacity Geometric Keycap Watermarks (Decorative Typing Motifs) */}
          <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 left-12 xl:left-24 flex-col gap-3 opacity-[0.07] text-[#18C69A] font-mono text-xs select-none">
            <div className="flex gap-2">
              <div className="w-12 h-12 rounded-xl border border-current flex items-center justify-center font-bold">
                ESC
              </div>
              <div className="w-12 h-12 rounded-xl border border-current flex items-center justify-center font-bold">
                Q
              </div>
              <div className="w-12 h-12 rounded-xl border border-current flex items-center justify-center font-bold">
                W
              </div>
            </div>
            <div className="flex gap-2 pl-3">
              <div className="w-12 h-12 rounded-xl border border-current flex items-center justify-center font-bold">
                A
              </div>
              <div className="w-12 h-12 rounded-xl border border-[#18C69A] bg-[#18C69A]/10 flex items-center justify-center font-bold">
                S
              </div>
              <div className="w-12 h-12 rounded-xl border border-current flex items-center justify-center font-bold">
                D
              </div>
            </div>
            <div className="flex gap-2 pl-6">
              <div className="w-12 h-12 rounded-xl border border-current flex items-center justify-center font-bold">
                Z
              </div>
              <div className="w-12 h-12 rounded-xl border border-current flex items-center justify-center font-bold">
                X
              </div>
              <div className="w-12 h-12 rounded-xl border border-current flex items-center justify-center font-bold">
                C
              </div>
            </div>
          </div>

          <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 right-12 xl:right-24 flex-col gap-3 opacity-[0.07] text-[#18C69A] font-mono text-xs select-none items-end">
            <div className="flex gap-2">
              <div className="w-12 h-12 rounded-xl border border-current flex items-center justify-center font-bold">
                U
              </div>
              <div className="w-12 h-12 rounded-xl border border-current flex items-center justify-center font-bold">
                I
              </div>
              <div className="w-12 h-12 rounded-xl border border-current flex items-center justify-center font-bold">
                O
              </div>
            </div>
            <div className="flex gap-2 pr-3">
              <div className="w-12 h-12 rounded-xl border border-current flex items-center justify-center font-bold">
                J
              </div>
              <div className="w-12 h-12 rounded-xl border border-[#18C69A] bg-[#18C69A]/10 flex items-center justify-center font-bold">
                K
              </div>
              <div className="w-12 h-12 rounded-xl border border-current flex items-center justify-center font-bold">
                L
              </div>
            </div>
            <div className="flex gap-2 pr-6">
              <div className="w-12 h-12 rounded-xl border border-current flex items-center justify-center font-bold">
                M
              </div>
              <div className="w-16 h-12 rounded-xl border border-current flex items-center justify-center font-bold">
                RET ↵
              </div>
            </div>
          </div>

          {/* Faint WPM Telemetry Sparkline Accent */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-[0.08] pointer-events-none hidden sm:block">
            <svg
              width="360"
              height="36"
              viewBox="0 0 360 36"
              fill="none"
              stroke="#18C69A"
              strokeWidth="1.5"
            >
              <path
                d="M 0,26 Q 40,32 80,18 T 160,22 T 240,10 T 320,16 T 360,8"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Authentication Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-md bg-[#151515]/95 backdrop-blur-xl border border-[#262626] hover:border-[#18C69A]/30 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/70 space-y-6 relative z-10 transition-colors duration-300"
        >
          {/* Subtle Top Accent Glow Line */}
          <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#18C69A]/70 to-transparent" />

          {/* Header & KEYFLOW Branding */}
          <div className="text-center space-y-3">
            {/* Brand Mark Icon */}
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#0A0A0A] border border-[#18C69A]/30 text-[#18C69A] shadow-inner shadow-[#18C69A]/10">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <path d="M7 10h2m2 0h2m2 0h2" strokeLinecap="round" />
                <path d="M7 14h10" strokeLinecap="round" />
              </svg>
            </div>

            {/* Title & Hierarchy */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5">
                <span className="font-serif italic text-2xl sm:text-3xl text-[#F5F5F5] tracking-wide">
                  Welcome to{" "}
                  <span className="not-italic font-sans font-extrabold text-[#18C69A]">
                    KEYFLOW
                  </span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#A0A0A0] font-sans leading-relaxed">
                Continue your progress. Your performance is waiting.
              </p>
            </div>

            {/* Secure Sync Indicator Pill */}
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181818] border border-[#18C69A]/20 text-[11px] font-mono text-[#A0A0A0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#18C69A]" />
                <span>Your progress is securely synced</span>
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-medium text-[#A0A0A0]">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#666666]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-[#0A0A0A] border border-[#262626] hover:border-[#303030] text-[#F5F5F5] placeholder-[#666666] focus:outline-none focus:border-[#18C69A] focus:ring-1 focus:ring-[#18C69A]/30 transition-all font-sans"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-medium text-[#A0A0A0]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => onNavigate("/forgot-password")}
                  className="text-xs text-[#18C69A] hover:text-[#18C69A]/80 hover:underline font-mono font-medium cursor-pointer transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#666666]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-[#0A0A0A] border border-[#262626] hover:border-[#303030] text-[#F5F5F5] placeholder-[#666666] focus:outline-none focus:border-[#18C69A] focus:ring-1 focus:ring-[#18C69A]/30 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#666666] hover:text-[#F5F5F5] cursor-pointer transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 bg-[#18C69A] hover:bg-[#18C69A]/90 active:scale-[0.99] text-[#0A0A0A] font-bold text-sm rounded-xl shadow-lg shadow-[#18C69A]/20 hover:shadow-[#18C69A]/35 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0A0A0A]/30 border-t-[#0A0A0A] rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Security & Encryption Indicator */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#666666] font-mono pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#18C69A]/80" />
            <span>Secure authentication</span>
          </div>

          {/* Link to Register */}
          <div className="text-center pt-4 border-t border-[#262626]">
            <p className="text-xs text-[#A0A0A0] font-sans">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => onNavigate("/register")}
                className="font-bold text-[#18C69A] hover:text-[#18C69A]/80 hover:underline cursor-pointer transition-colors ml-1"
              >
                Create Account
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

import React, { useState } from "react";
import { PageTransition } from "../components/common/PageTransition";
import { useAuth } from "../context/AuthContext";
import { RoutePath } from "../types";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";

interface RegisterPageProps {
  onNavigate: (path: RoutePath) => void;
  redirectTo?: RoutePath;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate, redirectTo }) => {
  const { signUp } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Field validation states
  const isEmailValid = email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password === "" || password.length >= 6;
  const isMatch = confirmPassword === "" || password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!displayName.trim()) {
      setErrorMsg("Please enter your Display Name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await signUp(email.trim(), password, displayName.trim());
    setLoading(false);

    if (result.error) {
      setErrorMsg(result.error.message);
    } else {
      // Successful registration -> Navigate to dashboard or redirect target
      onNavigate(redirectTo || "/dashboard");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-[#151515] border border-[#262626] rounded-3xl p-8 shadow-2xl shadow-black/60 space-y-6 relative overflow-hidden"
        >
          {/* Subtle Top Gradient Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#18C69A] to-[#18C69A]" />

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#181818] text-[#18C69A] mb-2 border border-[#262626]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#F5F5F5] tracking-tight">
              Join <span className="text-[#18C69A]">KEYFLOW</span>
            </h1>
            <p className="text-xs text-[#A0A0A0] font-medium">
              Create your account to unlock personalized typing analytics and level tracking.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name Input */}
            <div className="space-y-1">
              <label className="block text-xs font-mono font-medium text-[#A0A0A0]">
                Display Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#666666]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. SpeedDemon"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-[#0A0A0A] border border-[#262626] text-[#F5F5F5] placeholder-[#666666] focus:outline-none focus:border-[#18C69A] focus:ring-1 focus:ring-[#18C69A]/30 transition-all font-medium"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1">
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
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-[#0A0A0A] border ${
                    !isEmailValid
                      ? "border-rose-400 focus:ring-rose-500/20"
                      : "border-[#262626] focus:border-[#18C69A] focus:ring-1 focus:ring-[#18C69A]/30"
                  } text-[#F5F5F5] placeholder-[#666666] focus:outline-none transition-all font-medium`}
                />
              </div>
              {!isEmailValid && (
                <p className="text-[11px] text-rose-400 font-medium pl-1">
                  Please enter a valid email format.
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="block text-xs font-mono font-medium text-[#A0A0A0]">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#666666]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-[#0A0A0A] border ${
                    !isPasswordValid ? "border-rose-400" : "border-[#262626]"
                  } text-[#F5F5F5] placeholder-[#666666] focus:outline-none focus:border-[#18C69A] focus:ring-1 focus:ring-[#18C69A]/30 transition-all font-medium`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#666666] hover:text-[#F5F5F5]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!isPasswordValid && (
                <p className="text-[11px] text-rose-400 font-medium pl-1">
                  Password must be at least 6 characters.
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <label className="block text-xs font-mono font-medium text-[#A0A0A0]">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#666666]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-[#0A0A0A] border ${
                    !isMatch ? "border-rose-400" : "border-[#262626]"
                  } text-[#F5F5F5] placeholder-[#666666] focus:outline-none focus:border-[#18C69A] focus:ring-1 focus:ring-[#18C69A]/30 transition-all font-medium`}
                />
                {confirmPassword && isMatch && (
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#18C69A]">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
              </div>
              {!isMatch && (
                <p className="text-[11px] text-rose-400 font-medium pl-1">
                  Passwords do not match.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#18C69A] hover:bg-[#18C69A]/90 active:scale-[0.99] text-[#0A0A0A] font-bold text-sm rounded-xl shadow-lg shadow-[#18C69A]/20 hover:shadow-[#18C69A]/35 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0A0A0A]/30 border-t-[#0A0A0A] rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Link to Login */}
          <div className="text-center pt-2 border-t border-[#262626]">
            <p className="text-xs text-[#A0A0A0] font-medium">
              Already have an account?{" "}
              <button
                onClick={() => onNavigate("/login")}
                className="font-bold text-[#18C69A] hover:underline cursor-pointer"
              >
                Log in
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

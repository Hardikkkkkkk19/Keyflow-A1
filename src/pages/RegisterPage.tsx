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
          className="w-full max-w-md bg-white dark:bg-kfn-900 border border-kfn-200/80 dark:border-kfn-800 rounded-3xl p-8 shadow-xl shadow-kfn-200/50 dark:shadow-none space-y-6 relative overflow-hidden"
        >
          {/* Subtle Top Gradient Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-kfa-500 via-kfa-500 to-kfa-500" />

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-kfa-50 dark:bg-kfa-950/80 text-kfa-600 dark:text-kfa-400 mb-2 border border-kfa-100 dark:border-kfa-900">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-kfn-900 dark:text-white tracking-tight">
              Join{" "}
              <span className="bg-gradient-to-r from-kfa-600 to-kfa-600 bg-clip-text text-transparent">
                KEYFLOW
              </span>
            </h1>
            <p className="text-xs text-kfn-500 dark:text-kfn-400 font-medium">
              Create your account to unlock personalized typing analytics and level tracking.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name Input */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-kfn-700 dark:text-kfn-300">
                Display Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-kfn-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. SpeedDemon"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-kfn-50 dark:bg-kfn-950 border border-kfn-200 dark:border-kfn-800 text-kfn-900 dark:text-white placeholder-kfn-400 focus:outline-none focus:ring-2 focus:ring-kfa-500/30 focus:border-kfa-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-kfn-700 dark:text-kfn-300">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-kfn-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-kfn-50 dark:bg-kfn-950 border ${
                    !isEmailValid
                      ? "border-rose-400 focus:ring-rose-500/20"
                      : "border-kfn-200 dark:border-kfn-800 focus:ring-kfa-500/30 focus:border-kfa-500"
                  } text-kfn-900 dark:text-white placeholder-kfn-400 focus:outline-none focus:ring-2 transition-all font-medium`}
                />
              </div>
              {!isEmailValid && (
                <p className="text-[11px] text-rose-500 font-medium pl-1">
                  Please enter a valid email format.
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-kfn-700 dark:text-kfn-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-kfn-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-kfn-50 dark:bg-kfn-950 border ${
                    !isPasswordValid ? "border-rose-400" : "border-kfn-200 dark:border-kfn-800"
                  } text-kfn-900 dark:text-white placeholder-kfn-400 focus:outline-none focus:ring-2 focus:ring-kfa-500/30 focus:border-kfa-500 transition-all font-medium`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-kfn-400 hover:text-kfn-600 dark:hover:text-kfn-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!isPasswordValid && (
                <p className="text-[11px] text-rose-500 font-medium pl-1">
                  Password must be at least 6 characters.
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-kfn-700 dark:text-kfn-300">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-kfn-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-kfn-50 dark:bg-kfn-950 border ${
                    !isMatch ? "border-rose-400" : "border-kfn-200 dark:border-kfn-800"
                  } text-kfn-900 dark:text-white placeholder-kfn-400 focus:outline-none focus:ring-2 focus:ring-kfa-500/30 focus:border-kfa-500 transition-all font-medium`}
                />
                {confirmPassword && isMatch && (
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-kfa-500">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
              </div>
              {!isMatch && (
                <p className="text-[11px] text-rose-500 font-medium pl-1">
                  Passwords do not match.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-kfa-600 via-kfa-500 to-kfa-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-kfa-500/25 hover:shadow-kfa-500/40 hover:opacity-95 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
          <div className="text-center pt-2 border-t border-kfn-100 dark:border-kfn-800">
            <p className="text-xs text-kfn-500 dark:text-kfn-400 font-medium">
              Already have an account?{" "}
              <button
                onClick={() => onNavigate("/login")}
                className="font-bold text-kfa-600 dark:text-kfa-400 hover:underline cursor-pointer"
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

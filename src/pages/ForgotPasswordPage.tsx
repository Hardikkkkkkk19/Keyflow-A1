import React, { useState } from "react";
import { PageTransition } from "../components/common/PageTransition";
import { useAuth } from "../context/AuthContext";
import { RoutePath } from "../types";
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { motion } from "motion/react";

interface ForgotPasswordPageProps {
  onNavigate: (path: RoutePath) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    await resetPassword(email.trim());
    setLoading(false);
    setSubmitted(true);
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
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-kfa-500 to-kfa-500" />

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-kfa-50 dark:bg-kfa-950/80 text-kfa-600 dark:text-kfa-400 mb-2 border border-kfa-100 dark:border-kfa-900">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-kfn-900 dark:text-white tracking-tight">
              Reset Your Password
            </h1>
            <p className="text-xs text-kfn-500 dark:text-kfn-400 font-medium">
              Enter your registered email address and we'll send you instructions to reset your
              password.
            </p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-2xl bg-kfa-50/80 dark:bg-kfa-950/50 border border-kfa-200/80 dark:border-kfa-800 text-center space-y-3"
            >
              <div className="w-10 h-10 rounded-full bg-kfa-500 text-kfn-950 flex items-center justify-center mx-auto font-bold shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-kfn-900 dark:text-white">Check Your Inbox</h3>
              <p className="text-xs text-kfn-600 dark:text-kfn-300 leading-relaxed">
                If an account exists for{" "}
                <span className="font-semibold font-mono text-kfa-600 dark:text-kfa-300">
                  {email}
                </span>
                , you will receive a password reset link shortly.
              </p>
              <button
                onClick={() => onNavigate("/login")}
                className="w-full mt-2 py-2.5 px-4 bg-kfn-900 dark:bg-kfn-100 text-white dark:text-kfn-900 text-xs font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
              >
                Return to Login
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-kfn-50 dark:bg-kfn-950 border border-kfn-200 dark:border-kfn-800 text-kfn-900 dark:text-white placeholder-kfn-400 focus:outline-none focus:ring-2 focus:ring-kfa-500/30 focus:border-kfa-500 transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-kfa-600 via-kfa-500 to-kfa-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-kfa-500/25 hover:shadow-kfa-500/40 hover:opacity-95 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <span>Send Reset Email</span>
                )}
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <button
              onClick={() => onNavigate("/login")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-kfn-500 hover:text-kfn-800 dark:hover:text-kfn-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </button>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

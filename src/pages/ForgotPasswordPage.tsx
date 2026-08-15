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
          className="w-full max-w-md bg-[#151515] border border-[#262626] rounded-3xl p-8 shadow-2xl shadow-black/60 space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#18C69A] to-[#18C69A]" />

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#181818] text-[#18C69A] mb-2 border border-[#262626]">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#F5F5F5] tracking-tight">
              Reset Your Password
            </h1>
            <p className="text-xs text-[#A0A0A0] font-medium">
              Enter your registered email address and we'll send you instructions to reset your
              password.
            </p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-2xl bg-[#181818] border border-[#262626] text-center space-y-3"
            >
              <div className="w-10 h-10 rounded-full bg-[#18C69A] text-[#0A0A0A] flex items-center justify-center mx-auto font-bold shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-[#F5F5F5]">Check Your Inbox</h3>
              <p className="text-xs text-[#A0A0A0] leading-relaxed">
                If an account exists for{" "}
                <span className="font-semibold font-mono text-[#18C69A]">{email}</span>, you will
                receive a password reset link shortly.
              </p>
              <button
                onClick={() => onNavigate("/login")}
                className="w-full mt-2 py-2.5 px-4 bg-[#18C69A] text-[#0A0A0A] text-xs font-bold rounded-xl hover:bg-[#18C69A]/90 transition-colors cursor-pointer"
              >
                Return to Login
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-[#0A0A0A] border border-[#262626] text-[#F5F5F5] placeholder-[#666666] focus:outline-none focus:border-[#18C69A] focus:ring-1 focus:ring-[#18C69A]/30 transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#18C69A] hover:bg-[#18C69A]/90 text-[#0A0A0A] font-bold text-sm rounded-xl shadow-lg shadow-[#18C69A]/20 hover:shadow-[#18C69A]/35 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0A0A0A]/30 border-t-[#0A0A0A] rounded-full animate-spin" />
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
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#666666] hover:text-[#F5F5F5] transition-colors cursor-pointer"
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

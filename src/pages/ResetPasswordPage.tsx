import React, { useState } from "react";
import { PageTransition } from "../components/common/PageTransition";
import { useAuth } from "../context/AuthContext";
import { RoutePath } from "../types";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface ResetPasswordPageProps {
  onNavigate: (path: RoutePath) => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigate }) => {
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg("New password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);

    if (result.error) {
      setErrorMsg(result.error.message);
    } else {
      setSuccess(true);
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
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#18C69A] to-[#18C69A]" />

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#181818] text-[#18C69A] mb-2 border border-[#262626]">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#F5F5F5] tracking-tight">
              Create New Password
            </h1>
            <p className="text-xs text-[#A0A0A0] font-medium">
              Please choose a new, secure password for your KEYFLOW account.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-2xl bg-[#181818] border border-[#262626] text-center space-y-3"
            >
              <div className="w-10 h-10 rounded-full bg-[#18C69A] text-[#0A0A0A] flex items-center justify-center mx-auto font-bold shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-[#F5F5F5]">Password Reset Complete</h3>
              <p className="text-xs text-[#A0A0A0]">
                Your password has been updated successfully. You can now log in with your new
                password.
              </p>
              <button
                onClick={() => onNavigate("/login")}
                className="w-full mt-2 py-2.5 px-4 bg-[#18C69A] text-[#0A0A0A] text-xs font-bold rounded-xl hover:bg-[#18C69A]/90 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Log In Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono font-medium text-[#A0A0A0]">
                  New Password
                </label>
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
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-[#0A0A0A] border border-[#262626] text-[#F5F5F5] placeholder-[#666666] focus:outline-none focus:border-[#18C69A] focus:ring-1 focus:ring-[#18C69A]/30 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#666666] hover:text-[#F5F5F5]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono font-medium text-[#A0A0A0]">
                  Confirm New Password
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
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-[#0A0A0A] border border-[#262626] text-[#F5F5F5] placeholder-[#666666] focus:outline-none focus:border-[#18C69A] focus:ring-1 focus:ring-[#18C69A]/30 transition-all font-medium"
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
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
};

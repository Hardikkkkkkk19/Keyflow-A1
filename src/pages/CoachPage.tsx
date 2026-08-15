import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PageTransition } from "../components/common/PageTransition";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../components/common/ScrollReveal";
import { RoutePath } from "../types";
import { useAuth } from "../context/AuthContext";
import { buildUserCoachContext, UserCoachContext } from "../utils/coachContextBuilder";
import { askCoach, ChatMessage } from "../utils/coachApiClient";
import { loadCoachHistory, saveCoachMessage, clearCoachHistory } from "../utils/coachStorage";
import {
  Sparkles,
  Bot,
  User as UserIcon,
  Send,
  Zap,
  Play,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  Trash2,
  Target,
  Flame,
  Award,
  BarChart3,
  Code2,
  ChevronRight,
  HelpCircle,
  Lightbulb,
} from "lucide-react";

interface CoachPageProps {
  onStartCustomWorkout: (sampleText: string) => void;
  onNavigate: (path: RoutePath) => void;
}

const QUICK_ACTIONS = [
  {
    id: "analyze",
    label: "Analyze my performance",
    prompt: "Analyze my performance and highlight my top strengths and primary bottleneck.",
  },
  {
    id: "practice_today",
    label: "What should I practice today?",
    prompt:
      "What should I practice today? Generate a tailored 5–8 minute training routine based on my weaknesses.",
  },
  {
    id: "holding_back",
    label: "Which keys are holding me back?",
    prompt: "Which keys are holding me back based on my actual error telemetry?",
  },
  {
    id: "speed_stuck",
    label: "Why am I not getting faster?",
    prompt: "Why am I not getting faster? Analyze my speed, accuracy, and consistency trends.",
  },
  {
    id: "accuracy_trend",
    label: "How is my accuracy trending?",
    prompt: "How is my accuracy trending over my recent completed sessions?",
  },
  {
    id: "coding_perf",
    label: "Analyze my coding performance",
    prompt: "Analyze my coding typing performance, symbol accuracy, and bracket accuracy.",
  },
  {
    id: "training_plan",
    label: "Create a training plan",
    prompt: "Create a realistic short-term training plan to improve my WPM and reduce errors.",
  },
];

export const CoachPage: React.FC<CoachPageProps> = ({ onStartCustomWorkout, onNavigate }) => {
  const { user, userStatsProfile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const userId = user?.id || "guest_user";

  // Build telemetry user context
  const coachContext: UserCoachContext = buildUserCoachContext(
    userStatsProfile,
    userStatsProfile.recentSessions || [],
    user?.id,
  );
  const coachContextRef = useRef(coachContext);
  coachContextRef.current = coachContext;

  // Auto-scroll internal chat container only - never scroll the window
  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  // Ensure window always opens and stays at top on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  // When messages or loading state changes, scroll only internal chat container
  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isLoading]);

  // Load saved conversation history for user
  useEffect(() => {
    async function fetchHistory() {
      if (userId) {
        const history = await loadCoachHistory(userId);
        if (history.length > 0) {
          setMessages(history);
        } else {
          const currentCtx = coachContextRef.current;
          // Add default welcome message
          const welcomeMsg: ChatMessage = {
            id: "welcome-init",
            role: "assistant",
            content: currentCtx.hasEnoughData
              ? `Hello **${currentCtx.user.displayName}**! I am your personal KEYFLOW AI Typing Coach.

I have analyzed your **${currentCtx.overview.totalSessions}** completed sessions (**${currentCtx.overview.avgWpm} WPM**, **${currentCtx.overview.avgAccuracy}% accuracy**).

How can I help guide your training session today? Click a quick action above or ask me anything!`
              : `Welcome to KEYFLOW AI Coach, **${currentCtx.user.displayName}**!

I use your real typing telemetry to diagnose finger hesitation, weak keys, and speed bottlenecks.

You currently have **no completed practice history**. Complete a few 30-second tests on the Practice page or a drill so I can analyze your style!`,
            createdAt: new Date().toISOString(),
          };
          setMessages([welcomeMsg]);
          saveCoachMessage(userId, welcomeMsg);
        }
      }
    }
    fetchHistory();
  }, [userId]);

  // Handle sending user query
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    setInputText("");
    setErrorMsg(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    saveCoachMessage(userId, userMsg);
    setIsLoading(true);

    try {
      const replyText = await askCoach(query, coachContext, updatedMessages);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: replyText,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      saveCoachMessage(userId, aiMsg);
    } catch (err: any) {
      console.error("Error asking coach:", err);
      setErrorMsg("Failed to fetch response from AI Coach. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear conversation
  const handleClearHistory = async () => {
    if (confirm("Are you sure you want to clear your AI Coach conversation history?")) {
      await clearCoachHistory(userId);
      const initMsg: ChatMessage = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: `Conversation reset. Ask me anything about your KEYFLOW typing statistics, weak keys, or practice routines!`,
        createdAt: new Date().toISOString(),
      };
      setMessages([initMsg]);
      saveCoachMessage(userId, initMsg);
    }
  };

  // Calculate recent 3 sessions average
  const last3Sessions = (userStatsProfile.recentSessions || []).slice(0, 3);
  const recentWpm =
    last3Sessions.length > 0
      ? Math.round(last3Sessions.reduce((a, b) => a + b.wpm, 0) / last3Sessions.length)
      : null;
  const recentAcc =
    last3Sessions.length > 0
      ? Number(
          (last3Sessions.reduce((a, b) => a + b.accuracy, 0) / last3Sessions.length).toFixed(1),
        )
      : null;

  return (
    <PageTransition>
      <div className="py-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <ScrollReveal className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B85CFF]/10 border border-[#B85CFF]/30 text-xs font-semibold text-[#B85CFF]">
              <span className="w-2 h-2 rounded-full bg-[#B85CFF] animate-pulse" />
              <Bot className="w-3.5 h-3.5 text-[#B85CFF]" />
              <span>AI Coach • Telemetry Active</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#F5F5F5] tracking-tight">
              Your AI Typing Coach
            </h1>
            <p className="text-sm text-[#A0A0A0] font-sans">
              Personal guidance based on how you actually type.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClearHistory}
              className="px-3.5 py-2 rounded-xl bg-[#151515] border border-[#262626] text-xs font-semibold text-[#A0A0A0] hover:text-[#F05A9D] hover:border-[#F05A9D]/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#666666]" /> Clear Chat
            </button>
            <button
              onClick={() => onNavigate("/practice")}
              className="px-4 py-2 rounded-xl bg-[#18C69A] hover:bg-[#14A782] text-[#0A0A0A] text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-[#0A0A0A]" /> Practice Now
            </button>
          </div>
        </ScrollReveal>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT / MAIN AREA: AI Conversation Chat Workspace */}
          <div className="lg:col-span-2 space-y-4 flex flex-col h-[750px] bg-[#151515] rounded-2xl border border-[#262626] shadow-xl overflow-hidden">
            {/* Quick Coach Actions Bar */}
            <div className="p-4 bg-[#111111] border-b border-[#262626] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#A0A0A0] uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-[#F4D35E]" />
                <span>Quick Actions</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleSendMessage(action.prompt)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-xl bg-[#181818] border border-[#262626] hover:border-[#B85CFF]/50 text-[#F5F5F5] text-xs font-semibold whitespace-nowrap transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    <Sparkles className="w-3 h-3 text-[#B85CFF]" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages Stream Area */}
            <div ref={chatContainerRef} className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl bg-[#B85CFF] text-[#0A0A0A] flex items-center justify-center shrink-0 shadow-md mt-0.5 font-bold">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 sm:p-5 text-xs sm:text-sm shadow-sm ${
                      msg.role === "user"
                        ? "bg-[#18C69A] text-[#0A0A0A] font-semibold"
                        : "bg-[#181818] border border-[#262626] text-[#F5F5F5]"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <FormattedChatMessage
                        content={msg.content}
                        onNavigate={onNavigate}
                        onStartDrill={onStartCustomWorkout}
                      />
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-xl bg-[#1C1C1C] text-[#F5F5F5] border border-[#262626] flex items-center justify-center shrink-0 shadow-xs mt-0.5 font-bold text-xs">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#B85CFF] text-[#0A0A0A] flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-[#181818] border border-[#262626] p-4 rounded-2xl flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#B85CFF] animate-ping" />
                    <span className="text-xs text-[#A0A0A0] font-medium">
                      KEYFLOW AI Coach analyzing your telemetry...
                    </span>
                  </div>
                </motion.div>
              )}

              {errorMsg && (
                <div className="p-3 bg-[#F05A9D]/10 border border-[#F05A9D]/30 rounded-xl text-xs text-[#F05A9D] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#F05A9D] shrink-0" />
                  <span>{errorMsg}</span>
                  <button
                    onClick={() => handleSendMessage()}
                    className="ml-auto underline font-bold cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-[#111111] border-t border-[#262626]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask your coach anything about your typing technique, weak keys, or pacing..."
                  disabled={isLoading}
                  className="flex-1 bg-[#181818] border border-[#262626] focus:border-[#B85CFF]/60 text-xs sm:text-sm text-[#F5F5F5] placeholder-[#666666] px-4 py-3 rounded-xl focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="p-3 rounded-xl bg-[#B85CFF] hover:bg-[#A342EE] text-[#0A0A0A] font-bold disabled:opacity-40 disabled:hover:bg-[#B85CFF] transition-all cursor-pointer shadow-md shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT / SECONDARY AREA: Performance Context & AI Recommendations */}
          <div className="space-y-6">
            {/* Performance Context Card */}
            <div className="bg-[#151515] p-6 rounded-2xl border border-[#262626] shadow-lg space-y-5">
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#18C69A]" />
                  <h3 className="font-bold text-sm text-[#F5F5F5] uppercase tracking-wider">
                    Performance Snapshot
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181818] text-[#A0A0A0] font-semibold border border-[#262626]">
                  Real Telemetry
                </span>
              </div>

              {!coachContext.hasEnoughData ? (
                <div className="text-center py-6 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#181818] text-[#666666] flex items-center justify-center mx-auto border border-[#262626]">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-[#A0A0A0]">
                    No performance history yet.
                  </p>
                  <p className="text-[11px] text-[#666666] max-w-xs mx-auto">
                    Complete your first typing session to generate diagnostic metrics.
                  </p>
                  <button
                    onClick={() => onNavigate("/practice")}
                    className="mt-2 px-3.5 py-1.5 rounded-xl bg-[#18C69A] hover:bg-[#14A782] text-[#0A0A0A] text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    Start First Session
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* User Badge Bar */}
                  <div className="flex items-center justify-between bg-[#181818] p-3 rounded-xl border border-[#262626]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#18C69A] text-[#0A0A0A] font-mono font-bold text-xs flex items-center justify-center">
                        L{coachContext.progress.level}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#F5F5F5] block">
                          Level {coachContext.progress.level}
                        </span>
                        <span className="text-[10px] text-[#666666] font-mono">
                          {coachContext.progress.currentXp} / {coachContext.progress.nextLevelXp} XP
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-[#F4D35E] bg-[#F4D35E]/10 px-2.5 py-1 rounded-xl border border-[#F4D35E]/20">
                      <Flame className="w-3.5 h-3.5 fill-[#F4D35E]" />
                      <span>{coachContext.progress.streakDays} Day Streak</span>
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 text-center font-mono">
                    <div className="bg-[#181818] p-3 rounded-xl border border-[#262626]">
                      <span className="text-[10px] text-[#666666] uppercase font-sans font-bold block">
                        Average WPM
                      </span>
                      <strong className="text-xl font-extrabold text-[#18C69A]">
                        {coachContext.overview.avgWpm}
                      </strong>
                    </div>
                    <div className="bg-[#181818] p-3 rounded-xl border border-[#262626]">
                      <span className="text-[10px] text-[#666666] uppercase font-sans font-bold block">
                        Average Acc
                      </span>
                      <strong className="text-xl font-extrabold text-[#79D88B]">
                        {coachContext.overview.avgAccuracy}%
                      </strong>
                    </div>
                    <div className="bg-[#181818] p-3 rounded-xl border border-[#262626]">
                      <span className="text-[10px] text-[#666666] uppercase font-sans font-bold block">
                        Recent WPM (3x)
                      </span>
                      <strong className="text-sm font-bold text-[#F5F5F5]">
                        {recentWpm !== null ? `${recentWpm} WPM` : "--"}
                      </strong>
                    </div>
                    <div className="bg-[#181818] p-3 rounded-xl border border-[#262626]">
                      <span className="text-[10px] text-[#666666] uppercase font-sans font-bold block">
                        Recent Acc (3x)
                      </span>
                      <strong className="text-sm font-bold text-[#F5F5F5]">
                        {recentAcc !== null ? `${recentAcc}%` : "--"}
                      </strong>
                    </div>
                  </div>

                  {/* Weakest Keys Highlight */}
                  {coachContext.weakKeys.length > 0 && (
                    <div className="p-3 bg-[#F4D35E]/5 border border-[#F4D35E]/20 rounded-xl space-y-2">
                      <span className="text-[10px] font-bold uppercase text-[#F4D35E] tracking-wider flex items-center gap-1">
                        <Target className="w-3 h-3 text-[#F4D35E]" /> Detected Weak Hesitation Keys
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {coachContext.weakKeys.map((wk) => (
                          <span
                            key={wk.key}
                            className="px-2 py-0.5 rounded-lg bg-[#F4D35E]/10 text-[#F4D35E] text-xs font-mono font-bold border border-[#F4D35E]/20"
                          >
                            {wk.displayLabel.toUpperCase()}: {wk.accuracy}%
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI-Powered Telemetry Recommendation Cards */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-[#F5F5F5] uppercase tracking-wider flex items-center gap-1.5 px-1">
                <Lightbulb className="w-4 h-4 text-[#F4D35E]" />
                Diagnostic Recommendations
              </h3>

              {!coachContext.hasEnoughData ? (
                <div className="bg-[#151515] p-5 rounded-2xl border border-[#262626] text-center space-y-2">
                  <p className="text-xs font-semibold text-[#A0A0A0]">
                    Complete a few sessions to unlock personalized coaching insights.
                  </p>
                  <button
                    onClick={() => onNavigate("/practice")}
                    className="px-4 py-2 rounded-xl bg-[#18C69A] text-[#0A0A0A] text-xs font-bold inline-flex items-center gap-1 shadow-sm cursor-pointer transition-colors hover:bg-[#14A782]"
                  >
                    Launch Practice Session
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Card 1: Biggest Opportunity */}
                  <div className="bg-[#151515] p-5 rounded-2xl border border-[#262626] shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#B85CFF] uppercase tracking-wider flex items-center gap-1 font-mono">
                        <Target className="w-3.5 h-3.5 text-[#B85CFF]" /> Your Biggest Opportunity
                      </span>
                    </div>
                    <p className="text-xs text-[#A0A0A0] leading-relaxed font-medium">
                      {coachContext.weakKeys.length > 0
                        ? `Target muscle memory calibration on weak keys (${coachContext.weakKeys.map((k) => k.displayLabel.toUpperCase()).join(", ")}). Your accuracy is currently dipping on these characters.`
                        : coachContext.overview.avgAccuracy < 95
                          ? `Focus on precision sprint routines to elevate accuracy above 95% and eliminate backspace friction.`
                          : `Your accuracy is high (${coachContext.overview.avgAccuracy}%). Focus on short 15s speed bursts to raise your baseline WPM.`}
                    </p>
                    <button
                      onClick={() => {
                        if (coachContext.weakKeys.length > 0) {
                          onStartCustomWorkout(
                            `${coachContext.weakKeys.map((k) => k.key).join(" ")} ${coachContext.weakKeys.map((k) => k.key).join("")} repeat flow`,
                          );
                        } else {
                          onNavigate("/practice");
                        }
                      }}
                      className="w-full py-2 rounded-xl bg-[#B85CFF] hover:bg-[#A342EE] text-[#0A0A0A] text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-[#0A0A0A]" /> Start Recommended Drill
                    </button>
                  </div>

                  {/* Card 2: Speed vs Accuracy */}
                  <div className="bg-[#151515] p-5 rounded-2xl border border-[#262626] shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#45D6E8] uppercase tracking-wider flex items-center gap-1 font-mono">
                        <Zap className="w-3.5 h-3.5 text-[#45D6E8]" /> Speed vs Accuracy
                      </span>
                    </div>
                    <p className="text-xs text-[#A0A0A0] leading-relaxed font-medium">
                      {coachContext.overview.avgAccuracy >= 95
                        ? `Velocity Balanced: Average WPM is ${coachContext.overview.avgWpm} at ${coachContext.overview.avgAccuracy}% accuracy. Ready for higher targets.`
                        : `Accuracy Bottleneck: Average accuracy is ${coachContext.overview.avgAccuracy}%. Backspaces are capping your WPM growth.`}
                    </p>
                    <button
                      onClick={() => onNavigate("/analytics")}
                      className="w-full py-2 rounded-xl bg-[#181818] hover:bg-[#1C1C1C] text-[#F5F5F5] text-xs font-bold flex items-center justify-center gap-1 border border-[#262626] cursor-pointer transition-colors"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-[#45D6E8]" /> View Detailed Analytics
                    </button>
                  </div>

                  {/* Card 3: Coding Focus */}
                  <div className="bg-[#151515] p-5 rounded-2xl border border-[#262626] shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#18C69A] uppercase tracking-wider flex items-center gap-1 font-mono">
                        <Code2 className="w-3.5 h-3.5 text-[#18C69A]" /> Coding Syntax Focus
                      </span>
                    </div>
                    <p className="text-xs text-[#A0A0A0] leading-relaxed font-medium">
                      {coachContext.coding.hasCodingData
                        ? `Code WPM: ${coachContext.coding.codeWpm} | Symbol Acc: ${coachContext.coding.symbolAccuracy}% | Bracket Acc: ${coachContext.coding.bracketAccuracy}%.`
                        : `No developer coding sessions logged yet. Master brackets, braces, and syntax symbols in Code Mode.`}
                    </p>
                    <button
                      onClick={() => onNavigate("/practice")}
                      className="w-full py-2 rounded-xl bg-[#181818] hover:bg-[#1C1C1C] text-[#F5F5F5] text-xs font-bold flex items-center justify-center gap-1 border border-[#262626] cursor-pointer transition-colors"
                    >
                      <Code2 className="w-3.5 h-3.5 text-[#18C69A]" /> Practice Code Syntax
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

// Formatted Chat Message Component
const FormattedChatMessage: React.FC<{
  content: string;
  onNavigate: (path: RoutePath) => void;
  onStartDrill: (text: string) => void;
}> = ({ content, onNavigate, onStartDrill }) => {
  const lines = content.split("\n");

  return (
    <div className="space-y-2 leading-relaxed text-[#F5F5F5]">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (trimmed.startsWith("### ") || trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
          const text = trimmed.replace(/^#+\s*/, "");
          return (
            <h4
              key={idx}
              className="font-bold text-xs sm:text-sm text-[#F5F5F5] pt-2 border-b border-[#262626] pb-1 font-mono"
            >
              {renderInlineBold(text)}
            </h4>
          );
        }

        if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const text = trimmed.replace(/^[•\-\*]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-[#18C69A] font-bold mt-0.5">•</span>
              <span className="flex-1 text-[#A0A0A0]">{renderInlineBold(text)}</span>
            </div>
          );
        }

        if (/^\d+\.\s/.test(trimmed)) {
          const text = trimmed.replace(/^\d+\.\s*/, "");
          const num = trimmed.match(/^(\d+)\./)?.[1];
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="px-1.5 py-0.5 rounded bg-[#18C69A]/15 text-[#18C69A] text-[10px] font-mono font-bold border border-[#18C69A]/30">
                {num}
              </span>
              <span className="flex-1 text-[#A0A0A0]">{renderInlineBold(text)}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="text-[#A0A0A0]">
            {renderInlineBold(line)}
          </p>
        );
      })}
    </div>
  );
};

function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-[#F5F5F5]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-[#111111] font-mono text-[11px] font-bold text-[#18C69A] border border-[#262626]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

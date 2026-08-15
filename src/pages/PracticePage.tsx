import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { audioEngine } from "../utils/audio";
import {
  CodeDifficulty,
  calculateCodeMetrics,
  getCodeSessionFeedback,
  CODING_SYMBOLS,
  BRACKET_SYMBOLS,
} from "../utils/codeTypingUtils";
import {
  calculateWpm,
  calculateAccuracy,
  calculateConsistency,
  getFingerForKey,
  generatePerformanceFeedback,
  formatTime,
} from "../utils/typingUtils";
import {
  saveDrillProgress,
  calculateWeakKeys,
  generateDynamicWeakKeyExercise,
} from "../utils/drillUtils";
import { saveSessionToStorageAndDb } from "../utils/sessionStorage";
import { useAuth } from "../context/AuthContext";
import {
  WORD_LISTS,
  QUOTES,
  CODE_SNIPPETS,
  getRandomTimeText,
  getRandomWords,
  getRandomQuote,
  getRandomCodeSnippet,
} from "../data/sampleTexts";
import { VirtualKeyboard } from "../components/keyboard/VirtualKeyboard";
import { PageTransition } from "../components/common/PageTransition";
import {
  RoutePath,
  TypingMode,
  TimeOption,
  WordOption,
  QuoteOption,
  CodeLanguage,
  Settings,
  SessionResult,
  UserRankSummary,
} from "../types";
import { fetchUserRankSummary } from "../utils/leaderboardUtils";
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
  Target,
  Clock,
  Zap,
  Pause,
  Play,
  X,
  Edit3,
  CheckCircle,
  Sparkles,
  Activity,
  Award,
  ArrowRight,
  ShieldCheck,
  Flame,
  TrendingUp,
} from "lucide-react";

interface TimerDisplayProps {
  mode: TypingMode;
  timeRemaining: number;
  timeElapsed: number;
}

const TimerDisplay = React.memo<TimerDisplayProps>(({ mode, timeRemaining, timeElapsed }) => {
  return (
    <div className="flex items-center gap-2">
      <Clock className="w-5 h-5 text-[#18C69A]" />
      <span className="text-[#F3F5F2]">
        {mode === "time" ? `${timeRemaining}s` : formatTime(timeElapsed)}
      </span>
    </div>
  );
});
TimerDisplay.displayName = "TimerDisplay";

interface PracticePageProps {
  settings: Settings;
  onUpdateSettings: (newSettings: Partial<Settings>) => void;
  onCompleteSession: (result: SessionResult) => void;
  onNavigate: (path: RoutePath) => void;
  initialTextOverride?: string;
}

export const PracticePage: React.FC<PracticePageProps> = ({
  settings,
  onUpdateSettings,
  onCompleteSession,
  onNavigate,
  initialTextOverride,
}) => {
  const { user, userStatsProfile } = useAuth();

  // Mode configuration state
  const [mode, setMode] = useState<TypingMode>("time");
  const [timeOption, setTimeOption] = useState<TimeOption>(30);
  const [wordOption, setWordOption] = useState<WordOption>(25);
  const [quoteOption, setQuoteOption] = useState<QuoteOption>("medium");
  const [codeLang, setCodeLang] = useState<CodeLanguage>("javascript");
  const [codeDifficulty, setCodeDifficulty] = useState<CodeDifficulty>("Intermediate");
  const [includePunctuation, setIncludePunctuation] = useState(false);
  const [includeNumbers, setIncludeNumbers] = useState(false);

  // Custom mode text state
  const [customTextModalOpen, setCustomTextModalOpen] = useState(false);
  const [customTextInput, setCustomTextInput] = useState(
    "Type or paste your custom practice text here to train specialized vocabulary or interview code.",
  );

  // Engine state
  const [targetText, setTargetText] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [pressedKey, setPressedKey] = useState<string>("");

  // Frozen stats upon completion
  const [frozenStats, setFrozenStats] = useState<{
    wpm: number;
    rawWpm: number;
    accuracy: number;
    consistency: number;
    timeSec: number;
    displayTimeSec: number;
    correctChars: number;
    incorrectChars: number;
    totalChars: number;
    backspaces: number;
    errors: number;
  } | null>(null);

  // Detailed telemetry metrics
  const [totalErrors, setTotalErrors] = useState<number>(0);
  const [backspaceCount, setBackspaceCount] = useState<number>(0);
  const [intervalWpms, setIntervalWpms] = useState<number[]>([]);
  const [errorKeys, setErrorKeys] = useState<Set<string>>(new Set());
  const [completionRankSummary, setCompletionRankSummary] = useState<UserRankSummary | null>(null);

  // Fetch updated global rank summary on completion
  useEffect(() => {
    let isMounted = true;
    if (isFinished && user?.id) {
      fetchUserRankSummary(user.id, userStatsProfile).then((summary) => {
        if (isMounted) setCompletionRankSummary(summary);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isFinished, user?.id, userStatsProfile]);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentCharRef = useRef<HTMLSpanElement | null>(null);

  // Atomic refs for race-condition prevention & exact timing
  const isFinishedRef = useRef<boolean>(false);
  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const userInputRef = useRef<string>("");
  const pauseStartRef = useRef<number | null>(null);
  const totalPausedMsRef = useRef<number>(0);

  // Active drill override state
  const [activeDrillText, setActiveDrillText] = useState<string | undefined>(initialTextOverride);

  // Sync prop when initialTextOverride changes (e.g. user clicked a drill)
  useEffect(() => {
    setActiveDrillText(initialTextOverride);
  }, [initialTextOverride]);

  // Generate target text based on selected options
  const generateText = useCallback(() => {
    if (activeDrillText) {
      setTargetText(activeDrillText);
      return;
    }

    if (mode === "custom") {
      const trimmed = customTextInput.trim();
      setTargetText(trimmed || "Add your own text to start a custom practice session.");
      return;
    }

    if (mode === "time") {
      setTargetText(getRandomTimeText(includePunctuation, includeNumbers));
    } else if (mode === "words") {
      setTargetText(getRandomWords(wordOption, includePunctuation, includeNumbers));
    } else if (mode === "quote") {
      setTargetText(getRandomQuote(quoteOption));
    } else if (mode === "code") {
      setTargetText(getRandomCodeSnippet(codeLang, codeDifficulty));
    }
  }, [
    mode,
    wordOption,
    quoteOption,
    codeLang,
    codeDifficulty,
    includePunctuation,
    includeNumbers,
    activeDrillText,
    customTextInput,
  ]);

  // Track paused duration
  useEffect(() => {
    if (isPaused) {
      pauseStartRef.current = Date.now();
    } else {
      if (pauseStartRef.current) {
        totalPausedMsRef.current += Date.now() - pauseStartRef.current;
        pauseStartRef.current = null;
      }
    }
  }, [isPaused]);

  // Reset practice state
  const resetTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    isFinishedRef.current = false;
    startTimeRef.current = null;
    endTimeRef.current = null;
    pauseStartRef.current = null;
    totalPausedMsRef.current = 0;
    userInputRef.current = "";

    setUserInput("");
    setIsStarted(false);
    setIsPaused(false);
    setIsFinished(false);
    setFrozenStats(null);
    setTimeElapsed(0);
    setTimeRemaining(timeOption);
    setTotalErrors(0);
    setBackspaceCount(0);
    setIntervalWpms([]);
    setErrorKeys(new Set());
    generateText();
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [timeOption, generateText]);

  useEffect(() => {
    resetTest();
  }, [
    mode,
    timeOption,
    wordOption,
    quoteOption,
    codeLang,
    codeDifficulty,
    includePunctuation,
    includeNumbers,
    resetTest,
  ]);

  // Synchronously finalize session with exact timing
  const finishTest = useCallback(
    (finalInputStr?: string, endTimeMs?: number) => {
      // Prevent duplicate completion calls (idempotence)
      if (isFinishedRef.current) return;
      isFinishedRef.current = true;

      // Immediately clear and stop timer interval
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsFinished(true);

      const inputToUse = finalInputStr !== undefined ? finalInputStr : userInputRef.current;
      const now = endTimeMs || Date.now();
      endTimeRef.current = now;

      let totalPaused = totalPausedMsRef.current;
      if (pauseStartRef.current) {
        totalPaused += now - pauseStartRef.current;
      }

      const startMs = startTimeRef.current || now - 1000;
      const rawElapsedMs = Math.max(100, now - startMs - totalPaused);
      const exactDurationSec =
        mode === "time" && !activeDrillText
          ? Math.min(timeOption, rawElapsedMs / 1000)
          : rawElapsedMs / 1000;
      const displayDurationSec = Math.max(1, Math.round(exactDurationSec));

      setTimeElapsed(displayDurationSec);

      let correctCount = 0;
      for (let i = 0; i < inputToUse.length; i++) {
        if (inputToUse[i] === targetText[i]) correctCount++;
      }

      const finalWpm = calculateWpm(correctCount, exactDurationSec);
      const rawWpm = calculateWpm(inputToUse.length, exactDurationSec);
      const finalAcc = calculateAccuracy(correctCount, inputToUse.length);
      const finalConsistency = calculateConsistency(intervalWpms);
      const incorrectCount = inputToUse.length - correctCount;

      const codeMetrics =
        mode === "code" || activeDrillText?.includes("{")
          ? calculateCodeMetrics(targetText, inputToUse)
          : null;

      const stats = {
        wpm: finalWpm,
        rawWpm,
        accuracy: finalAcc,
        consistency: finalConsistency,
        timeSec: exactDurationSec,
        displayTimeSec: displayDurationSec,
        correctChars: correctCount,
        incorrectChars: incorrectCount,
        totalChars: inputToUse.length,
        backspaces: backspaceCount,
        errors: totalErrors,
        symbolAccuracy: codeMetrics?.symbolAccuracy,
        bracketAccuracy: codeMetrics?.bracketAccuracy,
        whitespaceAccuracy: codeMetrics?.whitespaceAccuracy,
        syntaxAccuracy: codeMetrics?.syntaxAccuracy,
      };

      setFrozenStats(stats);

      // Save result session
      const session: SessionResult = {
        id: `session-${Date.now()}`,
        userId: user?.id,
        timestamp: new Date().toISOString(),
        mode,
        modeDetail:
          mode === "time"
            ? `${timeOption}s`
            : mode === "words"
              ? `${wordOption}w`
              : mode === "quote"
                ? quoteOption
                : mode === "code"
                  ? `${codeLang} (${codeDifficulty})`
                  : "Custom",
        wpm: finalWpm,
        rawWpm,
        accuracy: finalAcc,
        consistency: finalConsistency,
        timeSec: displayDurationSec,
        snippet: targetText.slice(0, 45) + (targetText.length > 45 ? "..." : ""),
        errorKeys: Array.from(errorKeys),
        correctChars: correctCount,
        incorrectChars: incorrectCount,
        totalChars: inputToUse.length,
        backspaces: backspaceCount,
        layout: settings.layout,
        sessionType: mode === "code" ? "code" : "typing",
        language: mode === "code" ? codeLang : undefined,
        difficulty: mode === "code" ? codeDifficulty : undefined,
        symbolAccuracy: codeMetrics?.symbolAccuracy,
        bracketAccuracy: codeMetrics?.bracketAccuracy,
        whitespaceAccuracy: codeMetrics?.whitespaceAccuracy,
        syntaxAccuracy: codeMetrics?.syntaxAccuracy,
      };

      queueMicrotask(() => {
        onCompleteSession(session);
      });

      try {
        saveSessionToStorageAndDb(session, user?.id);
        if (initialTextOverride) {
          saveDrillProgress("drill-active", finalWpm, finalAcc);
        }
      } catch {
        // Ignore local storage error
      }

      if (finalWpm >= 50 || finalAcc >= 96) {
        confetti({
          particleCount: 65,
          spread: 75,
          origin: { y: 0.6 },
          colors: ["#18C69A", "#20B88A", "#20B88A", "#20B88A"],
        });
      }
    },
    [
      targetText,
      intervalWpms,
      backspaceCount,
      totalErrors,
      errorKeys,
      mode,
      timeOption,
      wordOption,
      quoteOption,
      codeLang,
      codeDifficulty,
      settings.layout,
      onCompleteSession,
      initialTextOverride,
      activeDrillText,
      user?.id,
    ],
  );

  const finishTestRef = useRef(finishTest);
  finishTestRef.current = finishTest;

  // Stable decrement tick handler using functional update pattern
  const handleTick = useCallback(() => {
    setTimeElapsed((prevElapsed) => {
      const nextElapsed = prevElapsed + 1;

      // Record interval WPM for consistency calculation
      const currentWpm = calculateWpm(userInputRef.current.length, nextElapsed);
      setIntervalWpms((wpms) => [...wpms, currentWpm]);

      return nextElapsed;
    });

    if (mode === "time") {
      setTimeRemaining((prevRemaining) => {
        const nextRemaining = Math.max(0, prevRemaining - 1);
        if (nextRemaining <= 0) {
          finishTestRef.current(userInputRef.current, Date.now());
        }
        return nextRemaining;
      });
    }
  }, [mode]);

  // Handle countdown & time tracking
  useEffect(() => {
    if (isStarted && !isFinished && !isPaused && !isFinishedRef.current) {
      timerRef.current = setInterval(() => {
        if (isFinishedRef.current) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return;
        }
        handleTick();
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isStarted, isFinished, isPaused, handleTick]);

  // Check completion for word, quote, code, custom, or drill modes
  useEffect(() => {
    if (isStarted && !isFinished && !isFinishedRef.current) {
      if (mode !== "time" || initialTextOverride) {
        if (userInput.length >= targetText.length && targetText.length > 0) {
          finishTestRef.current(userInput, Date.now());
        }
      }
    }
  }, [userInput, targetText, isStarted, isFinished, mode, initialTextOverride]);

  // Scroll current character into view
  useEffect(() => {
    if (currentCharRef.current) {
      currentCharRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [userInput.length]);

  // Keyboard input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished || isFinishedRef.current || isPaused) return;

    const val = e.target.value;
    userInputRef.current = val;

    if (!isStarted && val.length > 0) {
      setIsStarted(true);
      startTimeRef.current = Date.now();
    }

    // Check if backspace was used
    if (val.length < userInput.length) {
      setBackspaceCount((prev) => prev + 1);
      audioEngine.playKeySound(settings.sound, "backspace");
      setUserInput(val);
      return;
    }

    const lastTypedChar = val[val.length - 1];
    const targetChar = targetText[val.length - 1];

    if (lastTypedChar) {
      setPressedKey(lastTypedChar);
      setTimeout(() => setPressedKey(""), 100);

      // Audio feedback & error tracking
      if (lastTypedChar === targetChar) {
        audioEngine.playKeySound(settings.sound, lastTypedChar === " " ? "space" : "normal");
      } else {
        audioEngine.playKeySound(settings.sound, "error");
        setTotalErrors((prev) => prev + 1);
        if (targetChar) {
          setErrorKeys((prev) => new Set(prev).add(targetChar.toLowerCase()));
        }
      }
    }

    setUserInput(val);

    // If in time mode (without drill override), append extra prose text if user is near the end
    if (mode === "time" && !activeDrillText) {
      if (val.length >= targetText.length - 20) {
        setTargetText((prev) => prev + " " + getRandomTimeText(includePunctuation, includeNumbers));
      }
    }

    // Immediately detect completion for word / quote / code / custom / drill modes (or time mode with active drill override)
    if (mode !== "time" || activeDrillText) {
      if (val.length >= targetText.length && targetText.length > 0) {
        finishTestRef.current(val, Date.now());
      }
    }
  };

  // Global key listener for shortcuts (Tab to restart, Esc to pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        resetTest();
      } else if (e.key === "Escape" && isStarted && !isFinished) {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isStarted, isFinished, resetTest]);

  // Calculate live statistics
  let correctCharsCount = 0;
  for (let i = 0; i < userInput.length; i++) {
    if (userInput[i] === targetText[i]) correctCharsCount++;
  }

  const liveWpm = calculateWpm(correctCharsCount, Math.max(1, timeElapsed));
  const liveRawWpm = calculateWpm(userInput.length, Math.max(1, timeElapsed));
  const liveAccuracy = calculateAccuracy(correctCharsCount, userInput.length);
  const liveCodeMetrics =
    mode === "code" || activeDrillText?.includes("{")
      ? calculateCodeMetrics(targetText, userInput)
      : null;
  const activeCharToPress = targetText[userInput.length] || "";
  const fingerGuideInfo = activeCharToPress
    ? getFingerForKey(activeCharToPress, settings.layout)
    : null;

  // Frozen or Live Display Stats
  const displayWpm = frozenStats ? frozenStats.wpm : liveWpm;
  const displayRawWpm = frozenStats ? frozenStats.rawWpm : liveRawWpm;
  const displayAccuracy = frozenStats ? frozenStats.accuracy : liveAccuracy;
  const displayConsistency = frozenStats
    ? frozenStats.consistency
    : calculateConsistency(intervalWpms);
  const displayCorrectChars = frozenStats ? frozenStats.correctChars : correctCharsCount;
  const displayIncorrectChars = frozenStats
    ? frozenStats.incorrectChars
    : userInput.length - correctCharsCount;
  const displayBackspaces = frozenStats ? frozenStats.backspaces : backspaceCount;

  // Performance summary for results screen
  const feedback = generatePerformanceFeedback(
    displayWpm,
    displayAccuracy,
    displayConsistency,
    errorKeys.size,
  );

  return (
    <PageTransition>
      <div className="pt-24 pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Mode Selector Bar */}
        <div className="bg-[#0D1210] p-3 sm:p-4 rounded-2xl border border-[#F3F5F2]/10 shadow-lg flex flex-wrap items-center justify-between gap-4">
          {/* Main Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#050807] p-1 rounded-xl border border-[#F3F5F2]/5">
            {(["time", "words", "quote", "code", "custom"] as TypingMode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setActiveDrillText(undefined);
                  setMode(m);
                  if (m === "custom") setCustomTextModalOpen(true);
                }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer capitalize ${
                  mode === m && !activeDrillText
                    ? "bg-[#18C69A] text-[#050807] font-bold shadow-sm"
                    : "text-[#A6ADA8] hover:text-[#F3F5F2]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Mode Sub-Option Options */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {mode === "time" && (
              <div className="flex items-center gap-1 bg-[#050807] p-1 rounded-xl border border-[#F3F5F2]/5">
                {([15, 30, 60, 120] as TimeOption[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setActiveDrillText(undefined);
                      setTimeOption(t);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-mono font-semibold transition-all cursor-pointer ${
                      timeOption === t
                        ? "bg-[#18C69A] text-[#050807]"
                        : "text-[#A6ADA8] hover:text-[#F3F5F2]"
                    }`}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            )}

            {mode === "words" && (
              <div className="flex items-center gap-1 bg-[#050807] p-1 rounded-xl border border-[#F3F5F2]/5">
                {([10, 25, 50, 100] as WordOption[]).map((w) => (
                  <button
                    key={w}
                    onClick={() => {
                      setActiveDrillText(undefined);
                      setWordOption(w);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-mono font-semibold transition-all cursor-pointer ${
                      wordOption === w
                        ? "bg-[#18C69A] text-[#050807]"
                        : "text-[#A6ADA8] hover:text-[#F3F5F2]"
                    }`}
                  >
                    {w}w
                  </button>
                ))}
              </div>
            )}

            {mode === "quote" && (
              <div className="flex items-center gap-1 bg-[#050807] p-1 rounded-xl border border-[#F3F5F2]/5">
                {(["short", "medium", "long"] as QuoteOption[]).map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setActiveDrillText(undefined);
                      setQuoteOption(q);
                    }}
                    className={`px-2.5 py-1 rounded-lg capitalize font-semibold transition-all cursor-pointer ${
                      quoteOption === q
                        ? "bg-[#18C69A] text-[#050807]"
                        : "text-[#A6ADA8] hover:text-[#F3F5F2]"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {mode === "code" && (
              <div className="flex flex-wrap items-center gap-2">
                {/* Language Selector */}
                <div className="flex items-center gap-1 bg-[#050807] p-1 rounded-xl border border-[#F3F5F2]/5">
                  {(["javascript", "python", "java", "html", "css", "sql"] as CodeLanguage[]).map(
                    (lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setActiveDrillText(undefined);
                          setCodeLang(lang);
                        }}
                        className={`px-2.5 py-1 rounded-lg uppercase font-semibold transition-all cursor-pointer text-[10px] ${
                          codeLang === lang
                            ? "bg-[#18C69A] text-[#050807] font-bold shadow-sm"
                            : "text-[#A6ADA8] hover:text-[#F3F5F2]"
                        }`}
                      >
                        {lang}
                      </button>
                    ),
                  )}
                </div>

                {/* Difficulty Selector */}
                <div className="flex items-center gap-1 bg-[#050807] p-1 rounded-xl border border-[#F3F5F2]/5">
                  {(["Beginner", "Intermediate", "Advanced", "Expert"] as CodeDifficulty[]).map(
                    (diff) => (
                      <button
                        key={diff}
                        onClick={() => {
                          setActiveDrillText(undefined);
                          setCodeDifficulty(diff);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer text-[10px] ${
                          codeDifficulty === diff
                            ? "bg-[#18C69A] text-[#050807] font-bold shadow-sm"
                            : "text-[#A6ADA8] hover:text-[#F3F5F2]"
                        }`}
                      >
                        {diff}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}

            {mode === "custom" && (
              <button
                onClick={() => setCustomTextModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[#18C69A]/10 border border-[#18C69A]/30 text-[#18C69A] font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-[#18C69A]/20 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Custom Text
              </button>
            )}

            {/* Punctuation, Numbers & Sound Controls */}
            {(mode === "time" || mode === "words") && (
              <>
                <button
                  onClick={() => {
                    setActiveDrillText(undefined);
                    setIncludePunctuation(!includePunctuation);
                  }}
                  className={`px-2.5 py-1 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                    includePunctuation
                      ? "bg-[#18C69A]/15 border-[#18C69A]/40 text-[#18C69A]"
                      : "border-[#F3F5F2]/10 text-[#68716C] hover:text-[#A6ADA8]"
                  }`}
                >
                  @ punctuation
                </button>

                <button
                  onClick={() => {
                    setActiveDrillText(undefined);
                    setIncludeNumbers(!includeNumbers);
                  }}
                  className={`px-2.5 py-1 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                    includeNumbers
                      ? "bg-[#18C69A]/15 border-[#18C69A]/40 text-[#18C69A]"
                      : "border-[#F3F5F2]/10 text-[#68716C] hover:text-[#A6ADA8]"
                  }`}
                >
                  # numbers
                </button>
              </>
            )}

            <button
              onClick={() =>
                onUpdateSettings({ sound: settings.sound === "silent" ? "mechanical" : "silent" })
              }
              className="p-2 rounded-xl bg-[#050807] text-[#A6ADA8] hover:text-[#F3F5F2] border border-[#F3F5F2]/10 transition-colors cursor-pointer"
              title="Toggle sound"
            >
              {settings.sound === "silent" ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#18C69A]" />
              )}
            </button>
          </div>
        </div>

        {/* Active Drill Override Banner */}
        {activeDrillText && (
          <div className="bg-kfa-950/60 border border-kfa-500/40 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs text-kfa-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-kfa-400 shrink-0" />
              <span>
                <strong>Targeted Drill Active:</strong> Custom exercise loaded from Drills
              </span>
            </div>
            <button
              onClick={() => {
                setActiveDrillText(undefined);
                resetTest();
              }}
              className="px-3 py-1 bg-kfa-600 hover:bg-kfa-500 text-white rounded-xl font-bold transition-colors cursor-pointer text-xs"
            >
              Exit Drill
            </button>
          </div>
        )}

        {/* Live Telemetry Display Header */}
        <div className="flex items-center justify-between px-2 text-[#A6ADA8]">
          <div className="flex items-center gap-6 sm:gap-8 font-mono text-xl sm:text-2xl font-bold">
            <TimerDisplay mode={mode} timeRemaining={timeRemaining} timeElapsed={timeElapsed} />
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#18C69A]" />
              <span className="text-[#F3F5F2]">
                {liveWpm} <span className="text-xs font-sans text-[#68716C]">WPM</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#18C69A]" />
              <span className="text-[#F3F5F2]">{liveAccuracy}%</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[#68716C] text-sm font-normal">
              <span>Raw: {liveRawWpm}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isStarted && !isFinished && (
              <button
                onClick={() => setIsPaused((p) => !p)}
                className="p-2.5 rounded-xl bg-[#0D1210] border border-[#F3F5F2]/10 text-[#A6ADA8] hover:text-[#F3F5F2] hover:bg-[#111715] transition-all cursor-pointer shadow-sm flex items-center gap-1.5 text-xs font-semibold"
              >
                {isPaused ? (
                  <Play className="w-4 h-4 fill-[#18C69A] text-[#18C69A]" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
                <span>{isPaused ? "Resume" : "Pause (Esc)"}</span>
              </button>
            )}

            <button
              onClick={resetTest}
              className="p-2.5 rounded-xl bg-[#0D1210] border border-[#F3F5F2]/10 text-[#A6ADA8] hover:text-[#F3F5F2] hover:bg-[#111715] transition-all cursor-pointer shadow-sm flex items-center gap-1.5 text-xs font-semibold"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Restart (Tab)</span>
            </button>
          </div>
        </div>

        {/* Live Code Metrics Header (Code Mode Only) */}
        {mode === "code" && (
          <div className="bg-[#0D1210] text-[#F3F5F2] p-3.5 rounded-2xl border border-[#F3F5F2]/10 shadow-md grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-[#050807] p-2.5 rounded-xl border border-[#F3F5F2]/5 flex flex-col justify-center">
              <span className="text-[10px] text-[#68716C] uppercase font-sans">
                Symbol Accuracy
              </span>
              <strong className="text-[#18C69A] text-sm font-bold">
                {liveCodeMetrics ? `${liveCodeMetrics.symbolAccuracy}%` : "100%"}
              </strong>
            </div>
            <div className="bg-[#050807] p-2.5 rounded-xl border border-[#F3F5F2]/5 flex flex-col justify-center">
              <span className="text-[10px] text-[#68716C] uppercase font-sans">
                Bracket Accuracy
              </span>
              <strong className="text-[#18C69A] text-sm font-bold">
                {liveCodeMetrics ? `${liveCodeMetrics.bracketAccuracy}%` : "100%"}
              </strong>
            </div>
            <div className="bg-[#050807] p-2.5 rounded-xl border border-[#F3F5F2]/5 flex flex-col justify-center">
              <span className="text-[10px] text-[#68716C] uppercase font-sans">
                Whitespace Accuracy
              </span>
              <strong className="text-[#F3F5F2] text-sm font-bold">
                {liveCodeMetrics ? `${liveCodeMetrics.whitespaceAccuracy}%` : "100%"}
              </strong>
            </div>
            <div className="bg-[#050807] p-2.5 rounded-xl border border-[#F3F5F2]/5 flex flex-col justify-center">
              <span className="text-[10px] text-[#68716C] uppercase font-sans">
                Syntax Accuracy
              </span>
              <strong className="text-[#18C69A] text-sm font-bold">
                {liveCodeMetrics ? `${liveCodeMetrics.syntaxAccuracy}%` : "100%"}
              </strong>
            </div>
          </div>
        )}

        {/* Main Typing Area Canvas */}
        <div
          onClick={() => inputRef.current?.focus()}
          className={`relative rounded-2xl border transition-all duration-300 shadow-2xl min-h-[220px] flex flex-col cursor-text overflow-hidden ${
            mode === "code"
              ? "bg-[#050807] border-[#F3F5F2]/10"
              : "bg-[#0D1210] p-6 sm:p-10 border-[#F3F5F2]/10 hover:border-[#18C69A]/40"
          } ${isPaused ? "border-amber-400/80 bg-amber-50/5" : ""}`}
        >
          {/* Developer Workspace Top Bar (Code Mode) */}
          {mode === "code" && (
            <div className="bg-kfn-900 px-4 py-2.5 border-b border-kfn-800 flex items-center justify-between text-xs text-kfn-400 select-none">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-kfa-500/80 inline-block" />
                <span className="ml-3 font-mono text-kfn-300 font-semibold px-2.5 py-0.5 rounded-md bg-kfn-800 border border-kfn-700/60">
                  {codeLang === "javascript"
                    ? "main.js"
                    : codeLang === "python"
                      ? "script.py"
                      : codeLang === "java"
                        ? "Main.java"
                        : codeLang === "html"
                          ? "index.html"
                          : codeLang === "css"
                            ? "style.css"
                            : "query.sql"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-kfa-900/60 border border-kfa-700/60 text-kfa-300 text-[10px] font-mono font-bold uppercase">
                  {codeLang}
                </span>
                <span className="px-2 py-0.5 rounded bg-kfn-800 text-kfn-300 text-[10px] font-mono font-bold">
                  {codeDifficulty}
                </span>
              </div>
            </div>
          )}

          {/* Hidden Textarea Controller (Supports multiline code) */}
          <textarea
            ref={inputRef as any}
            value={userInput}
            onChange={handleInputChange as any}
            disabled={isFinished || isPaused}
            className="absolute opacity-0 pointer-events-none w-0 h-0"
            autoFocus
          />

          {/* Pause Overlay */}
          {isPaused && (
            <div className="absolute inset-0 z-20 bg-kfn-950/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-white">
              <Pause className="w-10 h-10 text-amber-400 animate-pulse" />
              <h3 className="text-xl font-bold">Session Paused</h3>
              <p className="text-xs text-kfn-300">Press Esc or click Resume to continue typing.</p>
              <button
                onClick={() => setIsPaused(false)}
                className="px-5 py-2.5 rounded-xl bg-kfa-600 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Resume Typing
              </button>
            </div>
          )}

          {/* Prompt banner when not started */}
          {!isStarted && !isPaused && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#18C69A]/10 text-[#18C69A] text-xs font-semibold border border-[#18C69A]/30 animate-pulse flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#18C69A]" />
              <span>
                {initialTextOverride
                  ? "🎯 Focus Drill Active • Start typing to begin"
                  : "Start typing to begin practice session"}
              </span>
            </div>
          )}

          {/* Text Display with character highlights & caret */}
          <div
            className={`font-mono text-lg sm:text-xl md:text-2xl tracking-wide leading-relaxed select-none max-w-4xl text-left w-full whitespace-pre-wrap ${mode === "code" ? "p-6 sm:p-8 bg-[#050807] text-[#F3F5F2] rounded-b-2xl" : ""}`}
          >
            {targetText.split("").map((char, index) => {
              const isCurrent = index === userInput.length;
              let charStyle = "text-[#3E4743]"; // Untyped characters: muted charcoal

              if (index < userInput.length) {
                if (userInput[index] === char) {
                  charStyle = "text-[#18C69A] font-semibold bg-[#18C69A]/10 rounded-xs";
                } else {
                  charStyle =
                    "text-[#FF5C5C] bg-[#FF5C5C]/15 rounded-xs px-0.5 underline font-bold";
                }
              }

              let caretStyleClass = "";
              if (isCurrent && !isPaused && !isFinished) {
                if (settings.caretStyle === "block") {
                  caretStyleClass =
                    "bg-[#18C69A] text-[#050807] font-bold rounded-xs shadow-md shadow-[#18C69A]/30";
                } else if (settings.caretStyle === "underline") {
                  caretStyleClass =
                    "border-b-2 border-[#18C69A] bg-[#18C69A]/10 text-[#F3F5F2] font-bold";
                } else if (settings.caretStyle === "glowing") {
                  caretStyleClass =
                    "bg-[#18C69A]/20 border border-[#18C69A] text-[#F3F5F2] font-bold shadow-lg shadow-[#18C69A]/40 rounded-xs animate-pulse";
                } else {
                  // Default line caret in emerald
                  caretStyleClass =
                    "border-l-2 border-[#18C69A] bg-[#18C69A]/15 text-[#F3F5F2] font-bold rounded-xs animate-pulse";
                }
              }

              // Display line breaks & whitespace cleanly
              if (char === "\n") {
                return (
                  <React.Fragment key={index}>
                    <span
                      ref={isCurrent ? currentCharRef : null}
                      className={`inline-block opacity-60 text-xs px-1 ${caretStyleClass}`}
                    >
                      ↵
                    </span>
                    <br />
                  </React.Fragment>
                );
              }

              return (
                <span
                  key={index}
                  ref={isCurrent ? currentCharRef : null}
                  className={`relative transition-colors duration-75 ${charStyle} ${caretStyleClass}`}
                >
                  {char}
                </span>
              );
            })}
          </div>
        </div>

        {/* Target Finger Guide Banner */}
        {settings.showFingerGuide && activeCharToPress && fingerGuideInfo && !isFinished && (
          <div className="bg-white/80 dark:bg-kfn-900/80 p-3 rounded-2xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm flex items-center justify-between text-xs px-5">
            <div className="flex items-center gap-3">
              <span className="text-kfn-400 font-medium">Next Key:</span>
              <span className="px-2.5 py-1 rounded-lg bg-kfn-100 dark:bg-kfn-800 font-mono font-bold text-kfn-900 dark:text-white uppercase border border-kfn-200 dark:border-kfn-700">
                {activeCharToPress === " " ? "Spacebar" : activeCharToPress}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${fingerGuideInfo.color}`} />
              <span className="font-bold text-kfn-800 dark:text-kfn-200">
                {fingerGuideInfo.finger}
              </span>
              <span className="text-kfn-400">
                ({fingerGuideInfo.side === "left" ? "Left Hand" : "Right Hand"})
              </span>
            </div>
          </div>
        )}

        {/* Synchronized Virtual Keyboard */}
        {settings.showVirtualKeyboard && (
          <VirtualKeyboard
            activeKey={activeCharToPress}
            pressedKey={pressedKey}
            showFingerGuide={settings.showFingerGuide}
            layout={settings.layout}
            size="md"
          />
        )}

        {/* Custom Text Prompt Modal */}
        <AnimatePresence>
          {customTextModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-kfn-950/70 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-white dark:bg-kfn-900 rounded-3xl p-6 sm:p-8 border border-kfn-200 dark:border-kfn-800 shadow-2xl max-w-lg w-full space-y-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-kfn-900 dark:text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-kfa-500" />
                    Custom Practice Text
                  </h3>
                  <button
                    onClick={() => setCustomTextModalOpen(false)}
                    className="p-1 rounded-lg text-kfn-400 hover:text-kfn-600 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-kfn-600 dark:text-kfn-300 block">
                    Enter target text or code snippet:
                  </label>
                  <textarea
                    rows={5}
                    value={customTextInput}
                    onChange={(e) => setCustomTextInput(e.target.value)}
                    className="w-full p-3 bg-kfn-50 dark:bg-kfn-950 border border-kfn-200 dark:border-kfn-800 rounded-2xl font-mono text-xs text-kfn-900 dark:text-kfn-200 focus:outline-none focus:ring-2 focus:ring-kfa-500 resize-none"
                    placeholder="Paste custom text here..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setActiveDrillText(undefined);
                      setMode("custom");
                      setCustomTextModalOpen(false);
                      resetTest();
                    }}
                    className="flex-1 py-3 rounded-2xl bg-kfa-600 hover:bg-kfa-500 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    Start Custom Session
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Modal upon completion */}
        <AnimatePresence>
          {isFinished && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-kfn-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-kfn-900 rounded-3xl p-6 sm:p-8 border border-kfn-200 dark:border-kfn-800 shadow-2xl max-w-xl w-full space-y-6 my-8"
              >
                <div className="flex items-center justify-between border-b border-kfn-100 dark:border-kfn-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-kfa-50 dark:bg-kfa-950 text-kfa-600 dark:text-kfa-400 flex items-center justify-center shadow-inner">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-extrabold text-kfn-900 dark:text-white">
                        Session Complete!
                      </h3>
                      <p className="text-xs text-kfn-500 dark:text-kfn-400 capitalize">
                        {mode} mode test • {settings.layout.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-kfa-50 dark:bg-kfa-950 text-kfa-700 dark:text-kfa-300 text-xs font-bold border border-kfa-200 dark:border-kfa-800 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified Score
                  </span>
                </div>

                {/* Primary Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="p-3.5 bg-kfn-50 dark:bg-kfn-950 rounded-2xl border border-kfn-200 dark:border-kfn-800 text-center">
                    <div className="text-[10px] text-kfn-400 font-sans uppercase">Net Speed</div>
                    <div className="text-2xl font-extrabold text-kfa-600 dark:text-kfa-400">
                      {displayWpm}
                    </div>
                    <div className="text-[10px] text-kfn-400">WPM</div>
                  </div>

                  <div className="p-3.5 bg-kfn-50 dark:bg-kfn-950 rounded-2xl border border-kfn-200 dark:border-kfn-800 text-center">
                    <div className="text-[10px] text-kfn-400 font-sans uppercase">Raw Speed</div>
                    <div className="text-2xl font-extrabold text-kfn-800 dark:text-kfn-200">
                      {displayRawWpm}
                    </div>
                    <div className="text-[10px] text-kfn-400">WPM</div>
                  </div>

                  <div className="p-3.5 bg-kfn-50 dark:bg-kfn-950 rounded-2xl border border-kfn-200 dark:border-kfn-800 text-center">
                    <div className="text-[10px] text-kfn-400 font-sans uppercase">Accuracy</div>
                    <div className="text-2xl font-extrabold text-kfa-600 dark:text-kfa-400">
                      {displayAccuracy}%
                    </div>
                    <div className="text-[10px] text-kfn-400">Precision</div>
                  </div>

                  <div className="p-3.5 bg-kfn-50 dark:bg-kfn-950 rounded-2xl border border-kfn-200 dark:border-kfn-800 text-center">
                    <div className="text-[10px] text-kfn-400 font-sans uppercase">Consistency</div>
                    <div className="text-2xl font-extrabold text-kfa-600 dark:text-kfa-400">
                      {displayConsistency}%
                    </div>
                    <div className="text-[10px] text-kfn-400">Cadence</div>
                  </div>
                </div>

                {/* Detailed Character Statistics breakdown */}
                <div className="grid grid-cols-3 gap-2 text-xs font-mono p-3 bg-kfn-50/80 dark:bg-kfn-950/80 rounded-2xl border border-kfn-200/60 dark:border-kfn-800 text-kfn-600 dark:text-kfn-300">
                  <div>
                    <span className="text-kfn-400 block text-[10px]">Correct Chars</span>
                    <strong className="text-kfa-600">{displayCorrectChars}</strong>
                  </div>
                  <div>
                    <span className="text-kfn-400 block text-[10px]">Errors / Incorrect</span>
                    <strong className="text-rose-500">{displayIncorrectChars}</strong>
                  </div>
                  <div>
                    <span className="text-kfn-400 block text-[10px]">Backspaces</span>
                    <strong className="text-amber-500">{displayBackspaces}</strong>
                  </div>
                </div>

                {/* Developer Code Metrics Breakdown (Code Mode) */}
                {(mode === "code" || (frozenStats as any)?.symbolAccuracy !== undefined) && (
                  <div className="p-4 bg-kfn-900 text-white rounded-2xl border border-kfn-800 space-y-3 font-mono text-xs">
                    <div className="text-kfn-400 font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                      <span>Developer Telemetry Breakdown</span>
                      <span className="text-kfa-400">
                        {codeLang.toUpperCase()} • {codeDifficulty}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="bg-kfn-950 p-2.5 rounded-xl border border-kfn-800">
                        <span className="text-[10px] text-kfn-400 block">Symbol Acc</span>
                        <strong className="text-kfa-400 text-sm font-bold">
                          {(frozenStats as any)?.symbolAccuracy ?? 100}%
                        </strong>
                      </div>
                      <div className="bg-kfn-950 p-2.5 rounded-xl border border-kfn-800">
                        <span className="text-[10px] text-kfn-400 block">Bracket Acc</span>
                        <strong className="text-kfa-400 text-sm font-bold">
                          {(frozenStats as any)?.bracketAccuracy ?? 100}%
                        </strong>
                      </div>
                      <div className="bg-kfn-950 p-2.5 rounded-xl border border-kfn-800">
                        <span className="text-[10px] text-kfn-400 block">Whitespace Acc</span>
                        <strong className="text-kfa-400 text-sm font-bold">
                          {(frozenStats as any)?.whitespaceAccuracy ?? 100}%
                        </strong>
                      </div>
                      <div className="bg-kfn-950 p-2.5 rounded-xl border border-kfn-800">
                        <span className="text-[10px] text-kfn-400 block">Syntax Acc</span>
                        <strong className="text-kfa-400 text-sm font-bold">
                          {(frozenStats as any)?.syntaxAccuracy ?? 100}%
                        </strong>
                      </div>
                    </div>

                    {/* Code Specific Feedback */}
                    {(() => {
                      const codeFeedback = getCodeSessionFeedback({
                        wpm: displayWpm,
                        accuracy: displayAccuracy,
                        symbolAccuracy: (frozenStats as any)?.symbolAccuracy,
                        bracketAccuracy: (frozenStats as any)?.bracketAccuracy,
                        whitespaceAccuracy: (frozenStats as any)?.whitespaceAccuracy,
                        language: codeLang,
                      });
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-sans text-xs">
                          <div className="bg-kfn-950/80 p-2.5 rounded-xl border border-kfn-800">
                            <span className="text-kfn-400 text-[10px] font-bold block">
                              Strongest Syntax:
                            </span>
                            <span className="text-kfa-300 font-medium">
                              {codeFeedback.strongestSyntax}
                            </span>
                          </div>
                          <div className="bg-kfn-950/80 p-2.5 rounded-xl border border-kfn-800">
                            <span className="text-kfn-400 text-[10px] font-bold block">
                              Recommended Focus:
                            </span>
                            <span className="text-amber-300 font-medium">
                              {codeFeedback.recommendedFocus}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Rule-based AI/Engine Performance Advice */}
                <div className="p-4 bg-kfa-50/80 dark:bg-kfa-950/60 rounded-2xl border border-kfa-200/80 dark:border-kfa-800 text-left space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-kfa-900 dark:text-kfa-200">
                    <Sparkles className="w-4 h-4 text-kfa-500" />
                    <span>{feedback.title}</span>
                  </div>
                  <p className="text-xs text-kfa-800 dark:text-kfa-300 leading-relaxed">
                    {feedback.advice}
                  </p>
                  {errorKeys.size > 0 && (
                    <div className="pt-1 flex items-center gap-1.5 text-xs text-kfa-700 dark:text-kfa-300">
                      <span className="text-kfn-400">Target Weak Keys:</span>
                      {Array.from(errorKeys).map((k) => (
                        <span
                          key={String(k)}
                          className="px-1.5 py-0.5 rounded bg-kfa-200/80 dark:bg-kfa-900 font-mono text-[11px] font-bold"
                        >
                          {String(k).toUpperCase()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Public Global Leaderboard Standing Card */}
                <div className="p-4 bg-gradient-to-r from-kfn-900 to-kfa-950 text-white rounded-2xl border border-kfa-500/30 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-mono">
                      <Trophy className="w-4 h-4 text-amber-400" /> Global Leaderboard Standing
                    </span>
                    <button
                      onClick={() => onNavigate("/leaderboard")}
                      className="text-[10px] font-mono font-bold text-kfa-400 hover:text-kfa-300 underline cursor-pointer"
                    >
                      View Leaderboard &rarr;
                    </button>
                  </div>
                  <div className="flex items-center justify-between font-mono text-xs pt-1">
                    <div>
                      <span className="text-kfn-400 text-[10px] block">Overall Rank</span>
                      <strong className="text-amber-400 text-sm font-bold">
                        {completionRankSummary?.overallRank
                          ? `#${completionRankSummary.overallRank}`
                          : "Unranked"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-kfn-400 text-[10px] block">Score</span>
                      <strong className="text-white text-sm font-bold">
                        {completionRankSummary?.overallScore || 0} pts
                      </strong>
                    </div>
                    <div>
                      <span className="text-kfn-400 text-[10px] block">Speed Rank</span>
                      <strong className="text-kfa-300 text-sm font-bold">
                        {completionRankSummary?.speedRank
                          ? `#${completionRankSummary.speedRank}`
                          : "Unranked"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Drill Impact Section */}
                <div className="p-4 bg-kfa-50/80 dark:bg-kfa-950/60 rounded-2xl border border-kfa-200/80 dark:border-kfa-800 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-kfa-900 dark:text-kfa-200 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-kfa-500" /> Drill Impact
                    </span>
                    <span className="text-[10px] font-mono text-kfa-700 dark:text-kfa-300">
                      {displayAccuracy >= 95 ? "Strong Progress" : "Needs Practice"}
                    </span>
                  </div>
                  <div className="text-xs text-kfa-800 dark:text-kfa-300 font-mono">
                    {displayAccuracy >= 95 ? (
                      <div className="flex justify-between items-center bg-white/60 dark:bg-kfn-900/60 p-2 rounded-xl border border-kfa-200/60 dark:border-kfa-900">
                        <span>Target Key Precision:</span>
                        <strong className="text-kfa-600 dark:text-kfa-400">
                          Before: 89% &rarr; After: {displayAccuracy}%
                        </strong>
                      </div>
                    ) : (
                      <p className="text-[11px] text-kfn-500 dark:text-kfn-400 font-sans">
                        Keep practicing to unlock improvement tracking.
                      </p>
                    )}
                  </div>
                </div>

                {/* Recommended Next Drill */}
                <div className="p-4 bg-amber-50/80 dark:bg-amber-950/60 rounded-2xl border border-amber-200/80 dark:border-amber-800 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-500" /> Recommended Next Drill
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    {displayAccuracy < 94
                      ? "Your accuracy dropped below 94%. Strengthen transitions with our Error Reduction Protocol."
                      : "Your precision is strong! Try a 15-second Speed Burst to build rapid cadence."}
                  </p>
                  <button
                    onClick={() => {
                      const nextText =
                        displayAccuracy < 94
                          ? "gather weather further together strength brightness right height"
                          : "and the ing ion ent for context design speed rapid sprint";
                      onNavigate("/practice");
                      setTargetText(nextText);
                      resetTest();
                    }}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" /> Start Recommended Next Drill
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <button
                    onClick={resetTest}
                    className="py-3 px-3 rounded-2xl bg-kfa-600 hover:bg-kfa-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-kfa-500/20"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Try Again
                  </button>

                  <button
                    onClick={() => {
                      setActiveDrillText(undefined);
                      generateText();
                      resetTest();
                    }}
                    className="py-3 px-3 rounded-2xl bg-kfn-100 dark:bg-kfn-800 hover:bg-kfn-200 text-kfn-800 dark:text-kfn-200 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" /> New Test
                  </button>

                  <button
                    onClick={() => onNavigate("/drills")}
                    className="py-3 px-3 rounded-2xl bg-kfn-100 dark:bg-kfn-800 hover:bg-kfn-200 text-kfn-800 dark:text-kfn-200 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-500" /> Practice Drills
                  </button>

                  <button
                    onClick={() => onNavigate("/analytics")}
                    className="py-3 px-3 rounded-2xl bg-kfn-100 dark:bg-kfn-800 hover:bg-kfn-200 text-kfn-800 dark:text-kfn-200 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Activity className="w-3.5 h-3.5 text-kfa-500" /> Analytics
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export type RoutePath =
  | "/"
  | "/dashboard"
  | "/practice"
  | "/drills"
  | "/analytics"
  | "/challenges"
  | "/coach"
  | "/ai-coach"
  | "/leaderboard"
  | "/profile"
  | "/settings"
  | "/login"
  | "/register"
  | "/forgot-password"
  | "/reset-password";

export type TypingMode = "time" | "words" | "quote" | "code" | "custom";
export type TimeOption = 15 | 30 | 60 | 120;
export type WordOption = 10 | 25 | 50 | 100;
export type QuoteOption = "short" | "medium" | "long";
export type CodeLanguage = "javascript" | "python" | "java" | "html" | "sql" | "css";

export type KeyboardLayout = "qwerty" | "dvorak" | "colemak";
export type KeyboardStyle = "classic" | "cyber" | "aurora" | "mechanical";
export type SoundPreset = "mechanical" | "tactile" | "creamy" | "silent";
export type CaretStyle = "line" | "block" | "underline" | "glowing";
export type ThemeMode = "light" | "dark";

export interface TypingStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  timeElapsed: number;
  totalChars: number;
  correctChars: number;
  errorChars: number;
  maxStreak: number;
  currentStreak: number;
}

export interface KeyLatencies {
  [key: string]: {
    totalPresses: number;
    errors: number;
    totalLatencyMs: number;
    avgLatencyMs: number;
  };
}

export interface KeyPerformance {
  key: string;
  displayLabel: string;
  presses: number;
  errors: number;
  avgLatencyMs: number;
  accuracy: number;
  heatLevel: "cool" | "optimal" | "warm" | "hot";
}

export type DrillCategory =
  | "Foundations"
  | "Accuracy"
  | "Speed"
  | "Special Characters"
  | "Programming"
  | "Personalized"
  | "Weak Keys"
  | "Home Row"
  | "Top & Bottom Row"
  | "Symbols & Brackets"
  | "Finger Speed"
  | "Code Syntax";

export interface Drill {
  id: string;
  title: string;
  description: string;
  category: DrillCategory;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Master";
  durationSec: number;
  keyTargets: string[];
  wpmTarget: number;
  accuracyTarget: number;
  skillTrained?: string;
  sampleText: string;
  completed?: boolean;
  attempts?: number;
  bestWpm?: number;
  bestAccuracy?: number;
  lastAttemptDate?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  category: "Daily" | "Weekly" | "Benchmark";
  targetValue: number;
  unit: "WPM" | "Accuracy" | "Tests" | "Streak";
  progressValue: number;
  isCompleted: boolean;
  badgeName: string;
  badgeColor: string;
}

export interface AICoachingInsight {
  id: string;
  type: "strength" | "weakness" | "tip" | "drill_recommendation";
  title: string;
  message: string;
  keyFocus?: string[];
  actionLabel?: string;
  drillId?: string;
  impactScore?: number; // 1-100 impact on WPM
}

export interface SessionResult {
  id: string;
  userId?: string;
  timestamp: string;
  mode: TypingMode;
  modeDetail: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  timeSec: number;
  snippet: string;
  errorKeys: string[];
  correctChars?: number;
  incorrectChars?: number;
  totalChars?: number;
  backspaces?: number;
  layout?: KeyboardLayout;
  // Code mode specific telemetry & metadata
  sessionType?: "typing" | "code";
  language?: CodeLanguage;
  difficulty?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  snippetId?: string;
  symbolAccuracy?: number;
  bracketAccuracy?: number;
  whitespaceAccuracy?: number;
  syntaxAccuracy?: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  category: "Speed" | "Accuracy" | "Endurance" | "Special" | "Streak" | "Practice";
  xpReward?: number;
}

export interface XpEvent {
  id: string;
  eventType: "session" | "drill" | "personal_record" | "challenge" | "streak" | "achievement";
  title: string;
  xpAmount: number;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  handle: string;
  avatarUrl?: string;
  title: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  streakDays: number;
  lastPracticeDate?: string;
  highestWpm: number;
  avgWpm: number;
  avgAccuracy: number;
  totalTestsCompleted: number;
  totalDrillsCompleted?: number;
  totalTimeMinutes: number;
  badges: Badge[];
  recentSessions: SessionResult[];
  xpHistory?: XpEvent[];
  completedChallenges?: string[];
}

export interface Settings {
  layout: KeyboardLayout;
  sound: SoundPreset;
  soundVolume: number; // 0-100
  caretStyle: CaretStyle;
  showVirtualKeyboard: boolean;
  showFingerGuide: boolean;
  fontSize: "sm" | "base" | "lg" | "xl";
  fontFamily: "mono" | "sans" | "code";
  theme: ThemeMode;
  smoothCaret: boolean;
  strictMode: boolean; // Must backspace errors
  blindMode: boolean; // Hide live stats while typing
  showOnLeaderboard?: boolean; // Privacy toggle for public leaderboards
}

export type LeaderboardCategory = "Overall" | "Speed" | "Accuracy" | "Coding" | "Streak";
export type TimePeriodFilter = "Weekly" | "Monthly" | "All Time";
export type CodeLanguageFilter = "All" | CodeLanguage;

export interface LeaderboardEntry {
  userId: string;
  rank: number;
  displayName: string;
  avatarUrl?: string;
  level: number;
  totalXp: number;
  categoryMetric: number; // Value specific to current category (Score, WPM, Acc %, Code WPM, or Streak)
  primaryStatLabel: string; // e.g. "86 WPM", "99.2%", "14 Days"
  secondaryStatLabel?: string; // e.g. "Level 4", "12 Tests", "JS Mode"
  wpm: number;
  accuracy: number;
  codeWpm?: number;
  streakDays: number;
  totalTests: number;
  badgesUnlockedCount: number;
  lastActive: string;
  rankChange?: "up" | "down" | "same" | "new";
  rankChangeAmount?: number;
  isCurrentUser?: boolean;
}

export interface UserRankSummary {
  overallRank: number | null;
  speedRank: number | null;
  accuracyRank: number | null;
  codingRank: number | null;
  streakRank: number | null;
  overallScore: number;
  bestWpm: number;
  bestAccuracy: number;
  bestCodeWpm: number;
  streakDays: number;
  totalCompetitors: number;
  isPublic: boolean;
}

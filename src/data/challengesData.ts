import { UserProfile, SessionResult } from "../types";

export type ChallengeFilterCategory =
  | "All"
  | "Daily & Weekly"
  | "Speed"
  | "Accuracy"
  | "Consistency"
  | "Endurance"
  | "Coding"
  | "Skills";

export interface ChallengeDefinition {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  category:
    "Daily" | "Weekly" | "Speed" | "Accuracy" | "Consistency" | "Endurance" | "Coding" | "Skills";
  filterCategory: ChallengeFilterCategory;
  targetValue: number;
  unit: string;
  badgeName: string;
  sampleText: string;
  computeProgress: (profile: UserProfile) => number;
}

export const ALL_CHALLENGES: ChallengeDefinition[] = [
  // 1. FEATURED DAILY / WEEKLY
  {
    id: "daily_precision_sprint",
    title: "Daily Precision Sprint",
    description: "Reach 95% accuracy or higher in a typing session today.",
    rewardXp: 25,
    category: "Daily",
    filterCategory: "Daily & Weekly",
    targetValue: 95,
    unit: "% Acc",
    badgeName: "Precision Sprint Master",
    sampleText:
      "Precision and speed require consistent rhythm, steady finger positioning, and mindful accuracy.",
    computeProgress: (profile) => {
      const recent = profile.recentSessions || [];
      const highestAcc = recent.length
        ? Math.max(...recent.map((s) => s.accuracy))
        : profile.avgAccuracy || 0;
      return Math.min(95, highestAcc);
    },
  },
  {
    id: "weekly_volume",
    title: "Weekly Practice Target",
    description: "Complete 10 total practice sessions.",
    rewardXp: 45,
    category: "Weekly",
    filterCategory: "Daily & Weekly",
    targetValue: 10,
    unit: "Sessions",
    badgeName: "Volume Master",
    sampleText:
      "Building a daily practice routine creates sustainable finger dexterity and effortless speed.",
    computeProgress: (profile) => {
      return Math.min(10, profile.totalTestsCompleted || 0);
    },
  },
  {
    id: "weekly_practice_time",
    title: "Weekly Time Investor",
    description: "Accumulate 15 total minutes of typing practice.",
    rewardXp: 40,
    category: "Weekly",
    filterCategory: "Daily & Weekly",
    targetValue: 15,
    unit: "Mins",
    badgeName: "Dedicated Investor",
    sampleText:
      "Dedicated practice time produces compounding speed gains over long engineering horizons.",
    computeProgress: (profile) => {
      return Math.min(15, profile.totalTimeMinutes || 0);
    },
  },

  // 2. SPEED CHALLENGES
  {
    id: "chal_speed_40",
    title: "Pacesetter 40 WPM",
    description: "Reach a typing speed of 40 WPM in any session.",
    rewardXp: 15,
    category: "Speed",
    filterCategory: "Speed",
    targetValue: 40,
    unit: "WPM",
    badgeName: "Pacesetter",
    sampleText:
      "Fluency begins when conscious letter hunting transforms into smooth muscle memory.",
    computeProgress: (profile) => {
      return Math.min(40, profile.highestWpm || 0);
    },
  },
  {
    id: "chal_speed60",
    title: "Speed Threshold: 60 WPM",
    description: "Break through the 60 WPM barrier in a typing test.",
    rewardXp: 30,
    category: "Speed",
    filterCategory: "Speed",
    targetValue: 60,
    unit: "WPM",
    badgeName: "Velocity Master",
    sampleText:
      "Breaking through sixty words per minute unlocks fluid, instinctual keyboard execution.",
    computeProgress: (profile) => {
      return Math.min(60, profile.highestWpm || 0);
    },
  },
  {
    id: "chal_speed_80",
    title: "High-Velocity Master: 80 WPM",
    description: "Reach 80 WPM or higher in a typing session.",
    rewardXp: 50,
    category: "Speed",
    filterCategory: "Speed",
    targetValue: 80,
    unit: "WPM",
    badgeName: "Keyboard Demon",
    sampleText:
      "Eighty words per minute demands relaxed hands, rapid keystroke transitions, and zero hesitation.",
    computeProgress: (profile) => {
      return Math.min(80, profile.highestWpm || 0);
    },
  },
  {
    id: "chal_speed_record",
    title: "Personal Record Breaker",
    description: "Set or match a personal speed record of at least 50 WPM.",
    rewardXp: 35,
    category: "Speed",
    filterCategory: "Speed",
    targetValue: 50,
    unit: "WPM PR",
    badgeName: "Record Breaker",
    sampleText:
      "Every personal record is built on steady rhythm, controlled breathing, and relentless focus.",
    computeProgress: (profile) => {
      const wpm = profile.highestWpm || 0;
      return wpm >= 50 ? 50 : wpm;
    },
  },

  // 3. ACCURACY CHALLENGES
  {
    id: "chal_accuracy95",
    title: "Precision Target 95%",
    description: "Achieve 95% accuracy or higher in a typing test.",
    rewardXp: 20,
    category: "Accuracy",
    filterCategory: "Accuracy",
    targetValue: 95,
    unit: "% Acc",
    badgeName: "Marksman",
    sampleText:
      "Accuracy creates speed; eliminating mistakes keeps your typing cadence uninterrupted.",
    computeProgress: (profile) => {
      const recent = profile.recentSessions || [];
      const highestAcc = recent.length
        ? Math.max(...recent.map((s) => s.accuracy))
        : profile.avgAccuracy || 0;
      return Math.min(95, highestAcc);
    },
  },
  {
    id: "chal_acc_98",
    title: "Sharpshooter: 98% Accuracy",
    description: "Achieve 98% accuracy or higher in a typing session.",
    rewardXp: 35,
    category: "Accuracy",
    filterCategory: "Accuracy",
    targetValue: 98,
    unit: "% Acc",
    badgeName: "Sharpshooter",
    sampleText:
      "Near-perfect execution eliminates backspace delays and establishes unwavering confidence.",
    computeProgress: (profile) => {
      const recent = profile.recentSessions || [];
      const highestAcc = recent.length
        ? Math.max(...recent.map((s) => s.accuracy))
        : profile.avgAccuracy || 0;
      return Math.min(98, highestAcc);
    },
  },
  {
    id: "chal_acc_flawless",
    title: "Flawless Execution (99%+)",
    description: "Complete a typing test with 99% or higher accuracy.",
    rewardXp: 60,
    category: "Accuracy",
    filterCategory: "Accuracy",
    targetValue: 99,
    unit: "% Acc",
    badgeName: "Flawless Virtuoso",
    sampleText:
      "Flawless typing requires complete mental stillness and deliberate, precise key placement.",
    computeProgress: (profile) => {
      const recent = profile.recentSessions || [];
      const highestAcc = recent.length
        ? Math.max(...recent.map((s) => s.accuracy))
        : profile.avgAccuracy || 0;
      return Math.min(99, highestAcc);
    },
  },
  {
    id: "chal_acc_speed_combo",
    title: "Velocity & Precision Combo",
    description: "Reach at least 65 WPM with 97%+ accuracy in a single test.",
    rewardXp: 55,
    category: "Accuracy",
    filterCategory: "Accuracy",
    targetValue: 1,
    unit: "Combo Test",
    badgeName: "Balanced Master",
    sampleText:
      "Harmonizing speed and precision represents the pinnacle of modern touch-typing mastery.",
    computeProgress: (profile) => {
      const recent = profile.recentSessions || [];
      const met = recent.some((s) => s.wpm >= 65 && s.accuracy >= 97);
      return met ? 1 : 0;
    },
  },

  // 4. CONSISTENCY CHALLENGES
  {
    id: "chal_sprint60",
    title: "Consistency Starter",
    description: "Log 5 completed practice sessions.",
    rewardXp: 20,
    category: "Consistency",
    filterCategory: "Consistency",
    targetValue: 5,
    unit: "Sessions",
    badgeName: "Steady Hands",
    sampleText: "Five completed sessions build the foundation for lasting mechanical skill.",
    computeProgress: (profile) => {
      return Math.min(5, profile.totalTestsCompleted || 0);
    },
  },
  {
    id: "chal_cons_15tests",
    title: "Dedicated Competitor",
    description: "Log 15 completed typing sessions.",
    rewardXp: 45,
    category: "Consistency",
    filterCategory: "Consistency",
    targetValue: 15,
    unit: "Sessions",
    badgeName: "Unwavering Focus",
    sampleText: "Repetition is the mother of dexterity and the engine of instinctive performance.",
    computeProgress: (profile) => {
      return Math.min(15, profile.totalTestsCompleted || 0);
    },
  },
  {
    id: "chal_cons_streak",
    title: "Streak Guardian",
    description: "Maintain an active 3-day typing streak.",
    rewardXp: 30,
    category: "Consistency",
    filterCategory: "Consistency",
    targetValue: 3,
    unit: "Days Streak",
    badgeName: "Streak Keeper",
    sampleText:
      "Daily habit building ensures that skills stay sharp and finger reflex remains effortless.",
    computeProgress: (profile) => {
      return Math.min(3, profile.streakDays || 0);
    },
  },

  // 5. ENDURANCE CHALLENGES
  {
    id: "chal_time10",
    title: "Stamina Training: 5 Mins",
    description: "Log 5 total minutes of typing practice.",
    rewardXp: 15,
    category: "Endurance",
    filterCategory: "Endurance",
    targetValue: 5,
    unit: "Minutes",
    badgeName: "Stamina Initiate",
    sampleText:
      "Short, focused stamina intervals protect against fatigue while building muscle endurance.",
    computeProgress: (profile) => {
      return Math.min(5, profile.totalTimeMinutes || 0);
    },
  },
  {
    id: "chal_endur_15min",
    title: "Marathon Typist: 15 Mins",
    description: "Log 15 total minutes of active typing time.",
    rewardXp: 40,
    category: "Endurance",
    filterCategory: "Endurance",
    targetValue: 15,
    unit: "Minutes",
    badgeName: "Endurance Champion",
    sampleText:
      "Sustaining focused attention over long sessions turns mechanical movements into subconscious habit.",
    computeProgress: (profile) => {
      return Math.min(15, profile.totalTimeMinutes || 0);
    },
  },
  {
    id: "chal_endur_120s",
    title: "Sustained Focus Sprint",
    description: "Complete a 120-second (2-minute) typing session.",
    rewardXp: 35,
    category: "Endurance",
    filterCategory: "Endurance",
    targetValue: 1,
    unit: "2-Min Test",
    badgeName: "Marathoner",
    sampleText:
      "Sustaining high velocity over two full minutes tests mental focus and physical hand stamina.",
    computeProgress: (profile) => {
      const recent = profile.recentSessions || [];
      const hasLong = recent.some((s) => s.timeSec >= 120);
      return hasLong ? 1 : 0;
    },
  },

  // 6. CODING CHALLENGES
  {
    id: "chal_code_js",
    title: "JavaScript Syntax Mastery",
    description: "Complete a JavaScript coding session with 40+ WPM.",
    rewardXp: 30,
    category: "Coding",
    filterCategory: "Coding",
    targetValue: 40,
    unit: "JS WPM",
    badgeName: "JS Architect",
    sampleText:
      "const transformTelemetry = (stream) => stream.map((s) => ({ id: s.id, velocity: Math.round(s.wpm * 1.2) })).filter((x) => x.velocity > 60);",
    computeProgress: (profile) => {
      const recent = profile.recentSessions || [];
      const jsSessions = recent.filter(
        (s) =>
          s.language === "javascript" ||
          s.sessionType === "code" ||
          (s.snippet && (s.snippet.includes("const ") || s.snippet.includes("=>"))),
      );
      const maxJs = jsSessions.length ? Math.max(...jsSessions.map((s) => s.wpm)) : 0;
      return Math.min(40, maxJs);
    },
  },
  {
    id: "chal_code_python",
    title: "Pythonic Precision",
    description: "Complete a Python code typing session with 95%+ accuracy.",
    rewardXp: 30,
    category: "Coding",
    filterCategory: "Coding",
    targetValue: 95,
    unit: "% Acc",
    badgeName: "Pythonista",
    sampleText:
      "def compute_percentiles(metrics: list) -> dict:\n    sorted_data = sorted(metrics)\n    return {'p50': sorted_data[len(sorted_data) // 2], 'max': sorted_data[-1]}",
    computeProgress: (profile) => {
      const recent = profile.recentSessions || [];
      const pySessions = recent.filter(
        (s) =>
          s.language === "python" ||
          (s.snippet &&
            (s.snippet.includes("def ") ||
              s.snippet.includes("import ") ||
              s.snippet.includes("compute_percentiles"))),
      );
      const maxPyAcc = pySessions.length ? Math.max(...pySessions.map((s) => s.accuracy)) : 0;
      return Math.min(95, maxPyAcc);
    },
  },
  {
    id: "chal_code_java_cpp",
    title: "Compiled Code Sprint (Java & C++)",
    description: "Complete a Java or C++ code typing session.",
    rewardXp: 35,
    category: "Coding",
    filterCategory: "Coding",
    targetValue: 1,
    unit: "Session",
    badgeName: "System Engineer",
    sampleText:
      "public class BenchmarkSuite {\n    public static double runTrial(int iterations, long delayMs) {\n        long start = System.currentTimeMillis();\n        return (System.currentTimeMillis() - start) / (double) iterations;\n    }\n}",
    computeProgress: (profile) => {
      const recent = profile.recentSessions || [];
      const hasCompiled = recent.some(
        (s) =>
          s.language === "java" ||
          (s.snippet &&
            (s.snippet.includes("public class") ||
              s.snippet.includes("#include") ||
              s.snippet.includes("BenchmarkSuite"))),
      );
      return hasCompiled ? 1 : 0;
    },
  },
  {
    id: "chal_code_web_sql",
    title: "Full-Stack Markup & SQL",
    description: "Complete an HTML/CSS or SQL code typing session with 95%+ accuracy.",
    rewardXp: 35,
    category: "Coding",
    filterCategory: "Coding",
    targetValue: 1,
    unit: "Session",
    badgeName: "Database & Web Specialist",
    sampleText:
      "SELECT user_id, COUNT(session_id) AS total_runs, ROUND(AVG(wpm), 2) AS mean_wpm FROM user_telemetry WHERE accuracy >= 95.0 GROUP BY user_id HAVING total_runs >= 10 ORDER BY mean_wpm DESC LIMIT 50;",
    computeProgress: (profile) => {
      const recent = profile.recentSessions || [];
      const hasWebSql = recent.some(
        (s) =>
          (s.language === "html" ||
            s.language === "css" ||
            s.language === "sql" ||
            (s.snippet && s.snippet.toUpperCase().includes("SELECT"))) &&
          s.accuracy >= 95,
      );
      return hasWebSql ? 1 : 0;
    },
  },

  // 7. SKILL-BASED CHALLENGES
  {
    id: "chal_drills3",
    title: "Drill Habit",
    description: "Complete 3 targeted skill drills.",
    rewardXp: 25,
    category: "Skills",
    filterCategory: "Skills",
    targetValue: 3,
    unit: "Drills",
    badgeName: "Dedicated Student",
    sampleText:
      "Targeted mechanical drills isolate weak keystrokes to refine your neural muscle pathways.",
    computeProgress: (profile) => {
      return Math.min(3, profile.totalDrillsCompleted || 0);
    },
  },
  {
    id: "chal_skill_symbols",
    title: "Symbol & Bracket Mastery",
    description: "Complete a symbol-heavy session with brackets {}, [], (), <>, and operators.",
    rewardXp: 30,
    category: "Skills",
    filterCategory: "Skills",
    targetValue: 1,
    unit: "Symbol Session",
    badgeName: "Syntax Specialist",
    sampleText:
      "const query = (items[idx]?.id ?? -1) > 0 ? { [key]: value, flags: (mask & 0x0F) | 0x80 } : null;",
    computeProgress: (profile) => {
      const recent = profile.recentSessions || [];
      const hasSymbols = recent.some((s) => s.snippet && /[{}<>[\]()=;&|?]/.test(s.snippet));
      return hasSymbols ? 1 : 0;
    },
  },
  {
    id: "chal_skill_numbers",
    title: "Numeric Data Entry",
    description: "Complete a number-heavy typing test with 95%+ accuracy.",
    rewardXp: 25,
    category: "Skills",
    filterCategory: "Skills",
    targetValue: 95,
    unit: "% Acc",
    badgeName: "Data Entry Pro",
    sampleText:
      "Transaction #84920: Processed 1,450 units @ $27.50 each ($39,875.00 total) with 99.85% uptime over 365 days.",
    computeProgress: (profile) => {
      const recent = profile.recentSessions || [];
      const hasNum = recent.some((s) => s.snippet && /\d{2,}/.test(s.snippet) && s.accuracy >= 95);
      return hasNum ? 95 : 0;
    },
  },
];

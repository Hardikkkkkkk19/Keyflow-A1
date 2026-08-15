import { UserProfile, Badge, XpEvent, SessionResult, Drill } from "../types";

// ==========================================
// 1. LEVEL & XP CALCULATION ENGINE
// ==========================================

export interface LevelInfo {
  level: number;
  totalXp: number;
  xpInCurrentLevel: number;
  xpRequiredForCurrentLevel: number; // XP span needed for current level (e.g., 100 for L1, 150 for L2)
  xpForNextLevelTotal: number; // Total cumulative XP needed for next level (e.g., 250 for L3)
  remainingXpForNextLevel: number;
  progressPercent: number; // 0-100
}

/**
  Level 1: 0 - 99 total XP (100 XP needed to hit Lvl 2)
  Level 2: 100 - 249 total XP (150 XP needed to hit Lvl 3)
  Level 3: 250 - 449 total XP (200 XP needed to hit Lvl 4)
  Level 4: 450 - 699 total XP (250 XP needed to hit Lvl 5)
  Level N span = 100 + (N - 1) * 50
 */
export function getLevelSpan(level: number): number {
  return 100 + (level - 1) * 50;
}

export function calculateLevelInfo(totalXp: number): LevelInfo {
  let level = 1;
  let accumulatedXp = 0;

  while (true) {
    const span = getLevelSpan(level);
    if (totalXp < accumulatedXp + span) {
      const xpInCurrentLevel = Math.max(0, totalXp - accumulatedXp);
      const xpRequiredForCurrentLevel = span;
      const xpForNextLevelTotal = accumulatedXp + span;
      const remainingXpForNextLevel = Math.max(0, xpForNextLevelTotal - totalXp);
      const progressPercent = Math.min(
        100,
        Math.round((xpInCurrentLevel / xpRequiredForCurrentLevel) * 100),
      );

      return {
        level,
        totalXp,
        xpInCurrentLevel,
        xpRequiredForCurrentLevel,
        xpForNextLevelTotal,
        remainingXpForNextLevel,
        progressPercent,
      };
    }
    accumulatedXp += span;
    level += 1;
  }
}

// ==========================================
// 2. MASTER ACHIEVEMENTS / BADGES LIST
// ==========================================

export const MASTER_ACHIEVEMENTS: Badge[] = [
  {
    id: "first_step",
    title: "First Step",
    description: "Complete your first typing session.",
    icon: "Keyboard",
    isUnlocked: false,
    category: "Practice",
    xpReward: 25,
  },
  {
    id: "accuracy_start",
    title: "Accuracy Starter",
    description: "Reach 90% accuracy in a typing session.",
    icon: "Target",
    isUnlocked: false,
    category: "Accuracy",
    xpReward: 20,
  },
  {
    id: "precision_master",
    title: "Precision Master",
    description: "Reach 98% accuracy in a typing session.",
    icon: "Shield",
    isUnlocked: false,
    category: "Accuracy",
    xpReward: 35,
  },
  {
    id: "speed_beginner",
    title: "Speed Beginner",
    description: "Reach 40 WPM in a typing session.",
    icon: "Zap",
    isUnlocked: false,
    category: "Speed",
    xpReward: 20,
  },
  {
    id: "speed_builder",
    title: "Speed Builder",
    description: "Reach 60 WPM in a typing session.",
    icon: "Flame",
    isUnlocked: false,
    category: "Speed",
    xpReward: 30,
  },
  {
    id: "speed_runner",
    title: "Speed Runner",
    description: "Reach 80 WPM in a typing session.",
    icon: "Trophy",
    isUnlocked: false,
    category: "Speed",
    xpReward: 50,
  },
  {
    id: "century",
    title: "Century Club",
    description: "Break the 100 WPM speed threshold.",
    icon: "Sparkles",
    isUnlocked: false,
    category: "Speed",
    xpReward: 100,
  },
  {
    id: "drill_starter",
    title: "Drill Starter",
    description: "Complete your first practice drill.",
    icon: "Target",
    isUnlocked: false,
    category: "Practice",
    xpReward: 20,
  },
  {
    id: "drill_master",
    title: "Drill Master",
    description: "Complete 10 skill drills.",
    icon: "Award",
    isUnlocked: false,
    category: "Practice",
    xpReward: 40,
  },
  {
    id: "weakness_hunter",
    title: "Weakness Hunter",
    description: "Complete a targeted weak-key practice drill.",
    icon: "ShieldAlert",
    isUnlocked: false,
    category: "Special",
    xpReward: 25,
  },
  {
    id: "consistency",
    title: "Steady Hands",
    description: "Achieve an 85%+ consistency score in a session.",
    icon: "Activity",
    isUnlocked: false,
    category: "Accuracy",
    xpReward: 25,
  },
  {
    id: "code_typer",
    title: "Code Synthesizer",
    description: "Complete a coding syntax practice session.",
    icon: "Code",
    isUnlocked: false,
    category: "Special",
    xpReward: 30,
  },
  {
    id: "practice_habit",
    title: "Practice Habit",
    description: "Complete 10 practice tests.",
    icon: "CheckCircle",
    isUnlocked: false,
    category: "Practice",
    xpReward: 50,
  },
  {
    id: "streak_3",
    title: "On Fire",
    description: "Maintain a 3-day practice streak.",
    icon: "Flame",
    isUnlocked: false,
    category: "Streak",
    xpReward: 40,
  },
  {
    id: "streak_7",
    title: "Weekly Warrior",
    description: "Maintain a 7-day practice streak.",
    icon: "Flame",
    isUnlocked: false,
    category: "Streak",
    xpReward: 75,
  },
  {
    id: "streak_30",
    title: "Unstoppable",
    description: "Maintain a 30-day practice streak.",
    icon: "Flame",
    isUnlocked: false,
    category: "Streak",
    xpReward: 200,
  },
  {
    id: "first_rank",
    title: "First Rank",
    description: "Complete a qualifying session and enter the public leaderboard.",
    icon: "Trophy",
    isUnlocked: false,
    category: "Special",
    xpReward: 30,
  },
  {
    id: "speed_contender",
    title: "Speed Contender",
    description: "Reach 70+ WPM on the global speed leaderboard.",
    icon: "Zap",
    isUnlocked: false,
    category: "Speed",
    xpReward: 40,
  },
  {
    id: "code_contender",
    title: "Code Contender",
    description: "Complete a code typing session and rank on the code leaderboard.",
    icon: "Code",
    isUnlocked: false,
    category: "Special",
    xpReward: 40,
  },
  {
    id: "top_10",
    title: "Top 10 Contender",
    description: "Break into the Top 10 on any leaderboard category.",
    icon: "Award",
    isUnlocked: false,
    category: "Special",
    xpReward: 75,
  },
  {
    id: "podium",
    title: "Podium Finisher",
    description: "Reach the Top 3 on any global leaderboard.",
    icon: "Sparkles",
    isUnlocked: false,
    category: "Special",
    xpReward: 100,
  },
];

// ==========================================
// 3. STREAK CALCULATION ENGINE
// ==========================================

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateKey(dateInput?: string | Date | number): string {
  if (!dateInput) return "";
  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) {
      return match[1];
    }
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function calculateUpdatedStreak(
  currentStreak: number,
  lastPracticeDate?: string,
): { updatedStreak: number; todayStr: string } {
  const todayStr = getTodayDateString();
  const lastKey = formatDateKey(lastPracticeDate);

  if (!lastKey) {
    return { updatedStreak: 1, todayStr };
  }

  if (lastKey === todayStr) {
    return { updatedStreak: Math.max(currentStreak || 1, 1), todayStr };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);

  if (lastKey === yesterdayKey) {
    return { updatedStreak: (currentStreak || 0) + 1, todayStr };
  }

  // Missed more than 1 day -> start fresh at 1 for today's completed session
  return { updatedStreak: 1, todayStr };
}

export function evaluateActiveStreak(
  storedStreak: number,
  lastPracticeDate?: string,
  hasActivity: boolean = false,
): { activeStreak: number; lastDateKey: string } {
  const todayKey = getTodayDateString();
  const lastKey = formatDateKey(lastPracticeDate);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);

  if (!lastKey) {
    if (storedStreak > 0) {
      return { activeStreak: storedStreak, lastDateKey: "" };
    }
    if (hasActivity) {
      return { activeStreak: 1, lastDateKey: todayKey };
    }
    return { activeStreak: 0, lastDateKey: "" };
  }

  if (lastKey === todayKey || lastKey === yesterdayKey) {
    return { activeStreak: Math.max(storedStreak, 1), lastDateKey: lastKey };
  }

  // If last activity was older than yesterday, streak has expired
  return { activeStreak: 0, lastDateKey: lastKey };
}

// ==========================================
// 4. ACHIEVEMENT EVALUATION ENGINE
// ==========================================

export interface AchievementEvaluationResult {
  unlockedBadges: Badge[];
  newlyUnlockedBadges: Badge[];
  totalBonusXp: number;
  xpEvents: XpEvent[];
}

export function evaluateAchievements(
  profile: UserProfile,
  latestSession?: SessionResult,
  latestDrill?: { isWeakKeyDrill?: boolean },
  rankInfo?: { rank?: number | null },
): AchievementEvaluationResult {
  const existingBadgesMap = new Map<string, Badge>();
  (profile.badges || []).forEach((b) => existingBadgesMap.set(b.id, b));

  const newlyUnlocked: Badge[] = [];
  const xpEvents: XpEvent[] = [];
  let totalBonusXp = 0;
  const now = new Date().toISOString();

  const totalSessions = profile.totalTestsCompleted || 0;
  const totalDrills = profile.totalDrillsCompleted || 0;
  const streak = profile.streakDays || 0;
  const highestWpm = profile.highestWpm || 0;

  MASTER_ACHIEVEMENTS.forEach((master) => {
    const existing = existingBadgesMap.get(master.id);
    if (existing?.isUnlocked) return; // Already unlocked

    let shouldUnlock = false;

    switch (master.id) {
      case "first_step":
        if (totalSessions >= 1) shouldUnlock = true;
        break;
      case "accuracy_start":
        if (latestSession && latestSession.accuracy >= 90) shouldUnlock = true;
        break;
      case "precision_master":
        if (latestSession && latestSession.accuracy >= 98) shouldUnlock = true;
        break;
      case "speed_beginner":
        if (highestWpm >= 40 || (latestSession && latestSession.wpm >= 40)) shouldUnlock = true;
        break;
      case "speed_builder":
        if (highestWpm >= 60 || (latestSession && latestSession.wpm >= 60)) shouldUnlock = true;
        break;
      case "speed_runner":
        if (highestWpm >= 80 || (latestSession && latestSession.wpm >= 80)) shouldUnlock = true;
        break;
      case "century":
        if (highestWpm >= 100 || (latestSession && latestSession.wpm >= 100)) shouldUnlock = true;
        break;
      case "drill_starter":
        if (totalDrills >= 1 || latestDrill) shouldUnlock = true;
        break;
      case "drill_master":
        if (totalDrills >= 10) shouldUnlock = true;
        break;
      case "weakness_hunter":
        if (latestDrill?.isWeakKeyDrill) shouldUnlock = true;
        break;
      case "consistency":
        if (latestSession && latestSession.consistency >= 85) shouldUnlock = true;
        break;
      case "code_typer":
        if (latestSession && latestSession.mode === "code") shouldUnlock = true;
        break;
      case "practice_habit":
        if (totalSessions >= 10) shouldUnlock = true;
        break;
      case "streak_3":
        if (streak >= 3) shouldUnlock = true;
        break;
      case "streak_7":
        if (streak >= 7) shouldUnlock = true;
        break;
      case "streak_30":
        if (streak >= 30) shouldUnlock = true;
        break;
      case "first_rank":
        if (totalSessions >= 1 || (rankInfo?.rank !== undefined && rankInfo.rank !== null))
          shouldUnlock = true;
        break;
      case "speed_contender":
        if (highestWpm >= 70 || (latestSession && latestSession.wpm >= 70)) shouldUnlock = true;
        break;
      case "code_contender":
        if (latestSession && latestSession.mode === "code") shouldUnlock = true;
        break;
      case "top_10":
        if (rankInfo?.rank && rankInfo.rank <= 10 && rankInfo.rank > 0) shouldUnlock = true;
        break;
      case "podium":
        if (rankInfo?.rank && rankInfo.rank <= 3 && rankInfo.rank > 0) shouldUnlock = true;
        break;
    }

    if (shouldUnlock) {
      const unlockedBadge: Badge = {
        ...master,
        isUnlocked: true,
        unlockedAt: now,
      };
      existingBadgesMap.set(master.id, unlockedBadge);
      newlyUnlocked.push(unlockedBadge);

      const reward = master.xpReward || 25;
      totalBonusXp += reward;

      xpEvents.push({
        id: `xp_ach_${master.id}_${Date.now()}`,
        eventType: "achievement",
        title: `Achievement: ${master.title}`,
        xpAmount: reward,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }
  });

  const finalBadges: Badge[] = MASTER_ACHIEVEMENTS.map((master) => {
    return existingBadgesMap.get(master.id) || { ...master, isUnlocked: false };
  });

  return {
    unlockedBadges: finalBadges,
    newlyUnlockedBadges: newlyUnlocked,
    totalBonusXp,
    xpEvents,
  };
}

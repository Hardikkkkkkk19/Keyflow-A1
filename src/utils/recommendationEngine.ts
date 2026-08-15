import { UserProfile, SessionResult, RoutePath } from "../types";
import { validateAndFilterUserSessions } from "./sessionStorage";

export interface PracticeRecommendation {
  id: string;
  type: "onboarding" | "accuracy" | "speed" | "weak_keys" | "coding" | "streak";
  title: string;
  category: string;
  badge: string;
  badgeColor: "emerald" | "amber" | "rose" | "cyan" | "indigo";
  description: string;
  targetMetricLabel: string;
  targetMetricValue: string;
  currentMetricLabel: string;
  currentMetricValue: string;
  primaryActionLabel: string;
  targetPath: RoutePath;
  drillText?: string;
  reason: string;
  iconName: "Target" | "Zap" | "Flame" | "Code2" | "Keyboard" | "Play";
}

export interface RecommendationSummary {
  hasData: boolean;
  primary: PracticeRecommendation;
  secondary: PracticeRecommendation[];
}

/**
 * Pure diagnostic recommendation engine strictly analyzing the active authenticated user's verified performance telemetry.
 * Filters and validates sessions by authenticatedUserId to prevent cross-account data contamination and telemetry leakage.
 */
export function generateUserRecommendations(
  userStatsProfile: UserProfile,
  sessions: SessionResult[] = [],
  authenticatedUserId?: string,
): RecommendationSummary {
  // Strict Validation Step: Filter sessions strictly by the authenticated user's ID
  const validatedSessions = validateAndFilterUserSessions(sessions, authenticatedUserId);
  const hasSessions =
    (userStatsProfile.totalTestsCompleted || 0) > 0 && validatedSessions.length > 0;

  // 1. ZERO-STATE: Brand new user with zero completed sessions in their validated scope
  if (!hasSessions) {
    const onboardingPrimary: PracticeRecommendation = {
      id: "rec-onboarding-primary",
      type: "onboarding",
      title: "Start Your First Practice Session",
      category: "Baseline Calibration",
      badge: "START BENCHMARK",
      badgeColor: "emerald",
      description:
        "Complete a 30-second benchmark test to measure your natural typing cadence, accuracy, and keystroke rhythm.",
      targetMetricLabel: "Benchmark Goal",
      targetMetricValue: "30s Test",
      currentMetricLabel: "Status",
      currentMetricValue: "Uncalibrated",
      primaryActionLabel: "Start First Practice",
      targetPath: "/practice",
      reason:
        "Diagnostic telemetry unlocks personalized weak-key identification and AI coaching after your first session.",
      iconName: "Play",
    };

    const onboardingSecondary: PracticeRecommendation[] = [
      {
        id: "rec-onboarding-foundations",
        type: "onboarding",
        title: "Home Row Foundations",
        category: "Finger Anchors",
        badge: "STARTER DRILL",
        badgeColor: "cyan",
        description:
          "Establish clean muscle memory on anchor keys (A S D F J K L ;) for zero-strain typing.",
        targetMetricLabel: "Target Accuracy",
        targetMetricValue: "98%+",
        currentMetricLabel: "Drill Category",
        currentMetricValue: "Home Row",
        primaryActionLabel: "Explore Drills",
        targetPath: "/drills",
        reason: "Core foundation for touch typing without looking down at the keyboard.",
        iconName: "Target",
      },
      {
        id: "rec-onboarding-coach",
        type: "onboarding",
        title: "Meet Your AI Typing Coach",
        category: "Telemetry Guidance",
        badge: "AI COACH",
        badgeColor: "indigo",
        description:
          "Your AI coach monitors keystroke latency and finger hesitation in real time to guide your training.",
        targetMetricLabel: "Analysis Mode",
        targetMetricValue: "Real Telemetry",
        currentMetricLabel: "Status",
        currentMetricValue: "Ready",
        primaryActionLabel: "Open AI Coach",
        targetPath: "/coach",
        reason: "Ask the coach questions about posture, speed bottlenecks, and custom drills.",
        iconName: "Zap",
      },
    ];

    return {
      hasData: false,
      primary: onboardingPrimary,
      secondary: onboardingSecondary,
    };
  }

  // 2. ACTIVE USER WITH REAL VALIDATED SESSIONS
  const sortedSessions = [...validatedSessions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const last3 = sortedSessions.slice(0, 3);
  const recentAcc =
    last3.length > 0
      ? last3.reduce((acc, s) => acc + (s.accuracy || 0), 0) / last3.length
      : userStatsProfile.avgAccuracy || 0;

  const recentWpm =
    last3.length > 0
      ? last3.reduce((acc, s) => acc + (s.wpm || 0), 0) / last3.length
      : userStatsProfile.avgWpm || 0;

  const overallAvgAcc = userStatsProfile.avgAccuracy || Math.round(recentAcc);
  const overallAvgWpm = userStatsProfile.avgWpm || Math.round(recentWpm);
  const bestWpm = userStatsProfile.highestWpm || Math.round(recentWpm);
  const streakDays = userStatsProfile.streakDays || 0;

  // Extract weak keys and error counts strictly from the current user's sessions
  const keyErrorCounts: Record<string, number> = {};
  validatedSessions.forEach((s) => {
    if (s.errorKeys && Array.isArray(s.errorKeys)) {
      s.errorKeys.forEach((rawKey) => {
        const k = rawKey.trim().toUpperCase();
        if (k && k.length === 1) {
          keyErrorCounts[k] = (keyErrorCounts[k] || 0) + 1;
        }
      });
    }
  });

  const sortedWeakKeys = Object.entries(keyErrorCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key);

  const topWeakKeys = sortedWeakKeys.slice(0, 4);

  // Coding sessions
  const codeSessions = validatedSessions.filter(
    (s) => s.sessionType === "code" || s.mode === "code",
  );
  const codeAvgAcc =
    codeSessions.length > 0
      ? codeSessions.reduce((acc, s) => acc + (s.accuracy || 0), 0) / codeSessions.length
      : null;
  const codeAvgWpm =
    codeSessions.length > 0
      ? codeSessions.reduce((acc, s) => acc + (s.wpm || 0), 0) / codeSessions.length
      : null;

  const candidates: PracticeRecommendation[] = [];

  // 1. Weak Keys Recommendation (if weak keys detected)
  if (topWeakKeys.length > 0) {
    const drillKeysStr = topWeakKeys.join(" ");
    const weakDrillText = topWeakKeys
      .map(
        (k) =>
          `${k.toLowerCase()}${k.toLowerCase()} ${k.toLowerCase()}e ${k.toLowerCase()}a ${k.toLowerCase()}o ${k.toLowerCase()}t`,
      )
      .join(" ");

    candidates.push({
      id: "rec-weak-keys",
      type: "weak_keys",
      title: `Key Weakness: [${topWeakKeys.slice(0, 3).join(", ")}]`,
      category: "Targeted Key Precision",
      badge: "KEY WEAKNESS",
      badgeColor: "amber",
      description: `Frequent errors detected on keys ${topWeakKeys
        .slice(0, 3)
        .map((k) => `"${k}"`)
        .join(", ")}. Complete an isolated drill to reinforce correct finger trajectory.`,
      targetMetricLabel: "Target Error Rate",
      targetMetricValue: "< 2% Errors",
      currentMetricLabel: "Weak Keys",
      currentMetricValue: topWeakKeys.slice(0, 3).join(" • "),
      primaryActionLabel: `Drill Keys (${topWeakKeys.slice(0, 3).join(", ")})`,
      targetPath: "/practice",
      drillText: weakDrillText,
      reason: `Real session telemetry identified ${keyErrorCounts[topWeakKeys[0]] || 1} missed strikes on ${topWeakKeys[0]}.`,
      iconName: "Keyboard",
    });
  }

  // 2. Accuracy Focus (if accuracy is below 95%)
  if (recentAcc < 95 || overallAvgAcc < 95) {
    candidates.push({
      id: "rec-accuracy-focus",
      type: "accuracy",
      title: "Accuracy Focus: Zero-Error Cadence",
      category: "Precision Protocol",
      badge: "ACCURACY FOCUS",
      badgeColor: "rose",
      description: `Your recent accuracy is ${recentAcc.toFixed(1)}%. Dial back speed by 10% to eliminate correction backspaces and build clean motor pathways.`,
      targetMetricLabel: "Target Accuracy",
      targetMetricValue: "95%+",
      currentMetricLabel: "Recent Accuracy",
      currentMetricValue: `${recentAcc.toFixed(1)}%`,
      primaryActionLabel: "Start Accuracy Practice",
      targetPath: "/practice",
      reason: "Keystroke accuracy below 95% slows overall throughput due to correction latency.",
      iconName: "Target",
    });
  }

  // 3. Speed Focus (if accuracy is solid >= 95%)
  if (recentAcc >= 95) {
    const targetSprintWpm = Math.max(bestWpm + 5, Math.round(overallAvgWpm * 1.15));
    candidates.push({
      id: "rec-speed-focus",
      type: "speed",
      title: "Speed Focus: High-Cadence Sprint",
      category: "Velocity Acceleration",
      badge: "SPEED FOCUS",
      badgeColor: "emerald",
      description: `Accuracy is high (${recentAcc.toFixed(1)}%). Push finger velocity with high-cadence short sprints to expand your peak speed ceiling.`,
      targetMetricLabel: "Target Speed",
      targetMetricValue: `${targetSprintWpm} WPM`,
      currentMetricLabel: "Current Average",
      currentMetricValue: `${Math.round(overallAvgWpm)} WPM`,
      primaryActionLabel: "Start Speed Sprint",
      targetPath: "/practice",
      reason: "Strong baseline precision provides a reliable foundation to raise raw cadence.",
      iconName: "Zap",
    });
  }

  // 4. Coding Focus
  if (codeSessions.length > 0 && (codeAvgAcc === null || codeAvgAcc < 94)) {
    candidates.push({
      id: "rec-coding-focus",
      type: "coding",
      title: "Coding Focus: Syntax & Symbols",
      category: "Code Agility",
      badge: "CODING FOCUS",
      badgeColor: "cyan",
      description:
        "Sharpen syntax agility across braces (`{}`), brackets (`[]`), operators (`=>`, `===`), and indentation.",
      targetMetricLabel: "Symbol Accuracy",
      targetMetricValue: "95%+",
      currentMetricLabel: "Code Speed",
      currentMetricValue: codeAvgWpm ? `${Math.round(codeAvgWpm)} WPM` : "Untrained",
      primaryActionLabel: "Practice Code Mode",
      targetPath: "/practice",
      reason: "Programming syntax requires distinct non-alpha finger stretches and symbol mastery.",
      iconName: "Code2",
    });
  } else if (overallAvgWpm >= 50 && codeSessions.length === 0) {
    // Advanced typist who hasn't tried coding mode
    candidates.push({
      id: "rec-coding-intro",
      type: "coding",
      title: "Expand to Code Practice",
      category: "Programming Agility",
      badge: "CODE MODE",
      badgeColor: "cyan",
      description:
        "You have strong standard typing velocity. Test your muscle memory on real JavaScript, Python, and SQL snippets.",
      targetMetricLabel: "Target Accuracy",
      targetMetricValue: "95%+",
      currentMetricLabel: "Status",
      currentMetricValue: "Untested",
      primaryActionLabel: "Try Code Mode",
      targetPath: "/practice",
      reason: "Coding syntax exercises alternate fingers on symbols and indentation.",
      iconName: "Code2",
    });
  }

  // 5. Daily Streak Focus
  if (streakDays > 0) {
    candidates.push({
      id: "rec-streak-focus",
      type: "streak",
      title: "Maintain Daily Streak",
      category: "Consistency Routine",
      badge: "DAILY HABIT",
      badgeColor: "amber",
      description: `Keep your ${streakDays}-day streak active with a disciplined 60-second test. Daily repetition prevents motor decay.`,
      targetMetricLabel: "Daily Goal",
      targetMetricValue: "1+ Tests",
      currentMetricLabel: "Active Streak",
      currentMetricValue: `${streakDays} Days`,
      primaryActionLabel: "Continue Daily Streak",
      targetPath: "/practice",
      reason: "Consistent daily practice produces steady long-term neuroplastic adaptation.",
      iconName: "Flame",
    });
  }

  // Fallback if empty (e.g. steady state)
  if (candidates.length === 0) {
    candidates.push({
      id: "rec-standard-practice",
      type: "speed",
      title: "Standard 60-Second Test",
      category: "General Practice",
      badge: "RECOMMENDED",
      badgeColor: "emerald",
      description:
        "Maintain your typing rhythm and track your personal records with a standard 60-second test.",
      targetMetricLabel: "Target Speed",
      targetMetricValue: `${bestWpm + 2} WPM`,
      currentMetricLabel: "Average",
      currentMetricValue: `${overallAvgWpm} WPM`,
      primaryActionLabel: "Start Practice",
      targetPath: "/practice",
      reason: "Regular sessions keep keystroke timing steady and fluid.",
      iconName: "Play",
    });
  }

  // Prioritize primary recommendation
  // Priority order: Accuracy Focus (<95%) -> Weak Keys -> Speed Sprint -> Coding -> Streak
  let primaryIndex = 0;
  if (recentAcc < 95 || overallAvgAcc < 95) {
    const accIdx = candidates.findIndex((c) => c.type === "accuracy");
    if (accIdx !== -1) primaryIndex = accIdx;
  } else if (topWeakKeys.length > 0) {
    const wkIdx = candidates.findIndex((c) => c.type === "weak_keys");
    if (wkIdx !== -1) primaryIndex = wkIdx;
  } else {
    const spdIdx = candidates.findIndex((c) => c.type === "speed");
    if (spdIdx !== -1) primaryIndex = spdIdx;
  }

  const primary = candidates[primaryIndex] || candidates[0];
  const secondary = candidates.filter((_, idx) => idx !== primaryIndex).slice(0, 2);

  // If secondary has fewer than 2, add helpful links to drills or coach
  if (secondary.length < 2) {
    if (!secondary.some((s) => s.targetPath === "/drills")) {
      secondary.push({
        id: "rec-aux-drills",
        type: "weak_keys",
        title: "Curated Agility Drills",
        category: "Skill Library",
        badge: "ALL DRILLS",
        badgeColor: "indigo",
        description:
          "Explore specialized drills for top row stretches, number row reaches, and punctuation rhythm.",
        targetMetricLabel: "Catalog",
        targetMetricValue: "12 Modules",
        currentMetricLabel: "Status",
        currentMetricValue: "Available",
        primaryActionLabel: "Browse Drills",
        targetPath: "/drills",
        reason: "Target individual fingers with structured training exercises.",
        iconName: "Target",
      });
    }
  }

  return {
    hasData: true,
    primary,
    secondary: secondary.slice(0, 2),
  };
}

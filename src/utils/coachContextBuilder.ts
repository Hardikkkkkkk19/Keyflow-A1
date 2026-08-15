import { UserProfile, SessionResult } from "../types";
import { calculateOverviewMetrics, calculateCodingStats } from "./analyticsUtils";
import {
  calculateWeakKeys,
  calculateFingerZoneStats,
  WeakKeyAnalysis,
  FingerZoneStat,
} from "./drillUtils";
import { validateAndFilterUserSessions } from "./sessionStorage";

export interface UserCoachContext {
  user: {
    displayName: string;
    handle: string;
  };
  progress: {
    level: number;
    currentXp: number;
    nextLevelXp: number;
    streakDays: number;
  };
  overview: {
    totalSessions: number;
    avgWpm: number;
    bestWpm: number;
    avgAccuracy: number;
    bestAccuracy: number;
    avgConsistency: number;
    wpmTrendPercentage: number | null;
    accuracyTrendPercentage: number | null;
  };
  recentSessionsSummary: Array<{
    mode: string;
    modeDetail: string;
    wpm: number;
    accuracy: number;
    consistency: number;
    errorsCount: number;
    backspaces: number;
    timestamp: string;
  }>;
  weakKeys: Array<{
    key: string;
    displayLabel: string;
    accuracy: number;
    presses: number;
    errors: number;
  }>;
  weakFingers: Array<{
    fingerName: string;
    accuracy: number;
    totalErrors: number;
  }>;
  coding: {
    hasCodingData: boolean;
    codeWpm: number;
    symbolAccuracy: number;
    bracketAccuracy: number;
    languageBreakdown: Array<{
      lang: string;
      sessions: number;
      avgWpm: number;
      avgAccuracy: number;
    }>;
  };
  lastSession: {
    mode: string;
    modeDetail: string;
    wpm: number;
    accuracy: number;
    consistency: number;
    errors: number;
    backspaces: number;
    errorKeys: string[];
    snippet?: string;
  } | null;
  hasEnoughData: boolean;
}

export function buildUserCoachContext(
  userProfile: UserProfile,
  sessions: SessionResult[] = [],
  authenticatedUserId?: string,
): UserCoachContext {
  const rawSessions: SessionResult[] =
    sessions && sessions.length > 0 ? sessions : userProfile.recentSessions || [];
  const allSessions = validateAndFilterUserSessions(rawSessions, authenticatedUserId);
  const totalSessions = allSessions.length;
  const hasEnoughData = totalSessions > 0;

  const overview = calculateOverviewMetrics(allSessions, []);
  const codingStats = calculateCodingStats(allSessions);
  const weakKeysData: WeakKeyAnalysis[] = calculateWeakKeys(allSessions);
  const fingerZoneData: FingerZoneStat[] = calculateFingerZoneStats(allSessions);

  // Extract top 5 weakest keys
  const weakKeysList = weakKeysData.slice(0, 5).map((wk) => ({
    key: wk.key,
    displayLabel: wk.key.toUpperCase(),
    accuracy: wk.accuracy,
    presses: wk.presses,
    errors: wk.errorCount,
  }));

  // Extract fingers with lowest accuracy
  const weakFingersList = fingerZoneData
    .filter((f) => f.accuracy < 96)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)
    .map((f) => ({
      fingerName: `${f.side} ${f.finger}`,
      accuracy: f.accuracy,
      totalErrors: f.errorCount,
    }));

  // Summary of last N sessions (up to 5)
  const recentSessionsSummary = allSessions.slice(0, 5).map((s) => ({
    mode: s.mode,
    modeDetail: s.modeDetail,
    wpm: s.wpm,
    accuracy: s.accuracy,
    consistency: s.consistency,
    errorsCount: s.errorKeys ? s.errorKeys.length : s.incorrectChars || 0,
    backspaces: s.backspaces || 0,
    timestamp: s.timestamp || "Recent",
  }));

  // Last completed session detail
  const lastSessionRaw = allSessions[0] || null;
  const lastSession = lastSessionRaw
    ? {
        mode: lastSessionRaw.mode,
        modeDetail: lastSessionRaw.modeDetail,
        wpm: lastSessionRaw.wpm,
        accuracy: lastSessionRaw.accuracy,
        consistency: lastSessionRaw.consistency,
        errors: lastSessionRaw.errorKeys
          ? lastSessionRaw.errorKeys.length
          : lastSessionRaw.incorrectChars || 0,
        backspaces: lastSessionRaw.backspaces || 0,
        errorKeys: lastSessionRaw.errorKeys || [],
        snippet: lastSessionRaw.snippet ? lastSessionRaw.snippet.slice(0, 100) : undefined,
      }
    : null;

  return {
    user: {
      displayName: userProfile.name || "Typist",
      handle: userProfile.handle || "@keyflow_user",
    },
    progress: {
      level: userProfile.level || 1,
      currentXp: userProfile.currentXp || 0,
      nextLevelXp: userProfile.nextLevelXp || 100,
      streakDays: userProfile.streakDays || 0,
    },
    overview: {
      totalSessions,
      avgWpm: overview.avgWpm,
      bestWpm: overview.bestWpm,
      avgAccuracy: overview.avgAccuracy,
      bestAccuracy: overview.bestAccuracy,
      avgConsistency: overview.avgConsistency,
      wpmTrendPercentage: overview.trendWpm,
      accuracyTrendPercentage: overview.trendAccuracy,
    },
    recentSessionsSummary,
    weakKeys: weakKeysList,
    weakFingers: weakFingersList,
    coding: {
      hasCodingData: codingStats.hasData,
      codeWpm: codingStats.codeWpm,
      symbolAccuracy: codingStats.symbolAccuracy,
      bracketAccuracy: codingStats.bracketAccuracy,
      languageBreakdown: codingStats.languages.map((l) => ({
        lang: l.lang,
        sessions: l.sessions,
        avgWpm: l.avgWpm,
        avgAccuracy: l.avgAccuracy,
      })),
    },
    lastSession,
    hasEnoughData,
  };
}

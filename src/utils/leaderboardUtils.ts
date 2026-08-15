import { supabase, supabasePublic, isSupabaseConfigured } from "../lib/supabase";
import {
  LeaderboardCategory,
  TimePeriodFilter,
  CodeLanguageFilter,
  LeaderboardEntry,
  UserRankSummary,
  UserProfile,
  SessionResult,
} from "../types";

const LOCAL_REGISTERED_USERS_KEY = "keyflow_registered_users_list";
const LOCAL_RANK_SNAPSHOTS_KEY = "keyflow_rank_snapshots_";

/**
 * Convert any string (e.g. mock user ID "usr_123" or email) into a valid RFC 4122 v4 UUID string.
 * Leaves already-valid UUIDs intact.
 */
export function toValidUuid(idStr: string): string {
  if (!idStr) return "00000000-0000-4000-8000-000000000000";
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(idStr)) return idStr;

  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < idStr.length; i++) {
    const ch = idStr.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hex1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const hex2 = (h2 >>> 0).toString(16).padStart(8, "0");
  const hex3 = (Math.imul(h1, h2) >>> 0).toString(16).padStart(8, "0");
  const hex4 = ((h1 ^ h2) >>> 0).toString(16).padStart(8, "0");

  const full = hex1 + hex2 + hex3 + hex4;
  return `${full.slice(0, 8)}-${full.slice(8, 12)}-4${full.slice(13, 16)}-8${full.slice(17, 20)}-${full.slice(20, 32)}`;
}

export interface StoredUserInfo {
  id: string;
  email: string;
  displayName: string;
  leaderboardVisible?: boolean;
}

/**
 * Anti-cheat & Session Validation Engine
 * Ensures only legitimate, completed practice sessions enter competitive rankings.
 */
export function isValidCompetitiveSession(session: Partial<SessionResult>): boolean {
  if (!session) return false;
  const wpm = session.wpm ?? -1;
  const accuracy = session.accuracy ?? -1;
  const timeSec = session.timeSec ?? 0;
  const totalChars = session.totalChars ?? 0;

  // Reasonable human physical bounds
  if (wpm < 0 || wpm > 250) return false;
  if (accuracy < 0 || accuracy > 100) return false;
  if (timeSec < 1) return false;
  if (totalChars <= 0) return false;

  return true;
}

/**
 * Register a real authenticated user in the global competitors registry
 */
export function registerRealUser(id: string, email: string, displayName: string) {
  try {
    const existingStr = localStorage.getItem(LOCAL_REGISTERED_USERS_KEY);
    const users: StoredUserInfo[] = existingStr ? JSON.parse(existingStr) : [];
    const validId = toValidUuid(id);

    const idx = users.findIndex(
      (u) =>
        u.id === validId ||
        (displayName && u.displayName.toLowerCase().trim() === displayName.toLowerCase().trim()),
    );

    if (idx >= 0) {
      users[idx] = { ...users[idx], id: validId, displayName, email };
    } else {
      users.push({ id: validId, email, displayName, leaderboardVisible: true });
    }

    localStorage.setItem(LOCAL_REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.warn("Failed to save local user registration:", err);
  }
}

/**
 * Update a user's leaderboard visibility preference locally & in Supabase
 */
export async function setLeaderboardVisibility(userId: string, isVisible: boolean) {
  const validId = toValidUuid(userId);

  // Update local registry
  try {
    const existingStr = localStorage.getItem(LOCAL_REGISTERED_USERS_KEY);
    if (existingStr) {
      const users: StoredUserInfo[] = JSON.parse(existingStr);
      const updated = users.map((u) =>
        u.id === validId || u.id === userId ? { ...u, leaderboardVisible: isVisible } : u,
      );
      localStorage.setItem(LOCAL_REGISTERED_USERS_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.warn("Failed to update local leaderboard visibility:", err);
  }

  // Update Supabase keyflow_users table
  if (isSupabaseConfigured) {
    try {
      await supabase
        .from("keyflow_users")
        .update({ leaderboard_visible: isVisible })
        .eq("id", validId);
    } catch (err) {
      console.warn("Supabase update leaderboard_visible error:", err);
    }
  }
}

/**
 * Sync a completed session to Supabase & local storage for competitive evaluation
 */
export async function syncSessionToLeaderboard(
  userId: string,
  displayName: string,
  session: SessionResult,
  userStats: UserProfile,
) {
  if (!isValidCompetitiveSession(session)) {
    console.warn("Session failed competitive anti-cheat validation. Excluded from leaderboard.");
    return;
  }

  const validId = toValidUuid(userId);

  // Ensure user is registered in global directory
  registerRealUser(validId, userStats.handle || "", displayName);

  // 1. Sync to Supabase
  if (isSupabaseConfigured) {
    try {
      await supabase.from("keyflow_users").upsert(
        {
          id: validId,
          display_name: displayName,
          highest_wpm: Math.max(userStats.highestWpm || 0, session.wpm),
          avg_wpm: Math.round(userStats.avgWpm || session.wpm),
          avg_accuracy: Number(Math.max(userStats.avgAccuracy || 0, session.accuracy).toFixed(1)),
          level: userStats.level || 1,
          xp: userStats.currentXp || 0,
          streak_days: userStats.streakDays || 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
    } catch (err) {
      console.warn("Supabase leaderboard session sync warning:", err);
    }
  }

  // 2. Local storage session history sync
  try {
    const key = `keyflow_user_sessions_${validId}`;
    const existing = localStorage.getItem(key);
    const sessions: SessionResult[] = existing ? JSON.parse(existing) : [];
    const updated = [session, ...sessions.filter((s) => s.id !== session.id)].slice(0, 100);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.warn("Local session storage sync warning:", err);
  }
}

/**
 * Filter sessions by time period (Weekly, Monthly, All Time)
 */
function filterSessionsByTimePeriod(
  sessions: SessionResult[],
  period: TimePeriodFilter,
): SessionResult[] {
  if (period === "All Time") return sessions;

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const cutoffMs = period === "Weekly" ? now - 7 * dayMs : now - 30 * dayMs;

  return sessions.filter((s) => {
    // Check session timestamp or fallback to current date if missing
    if (!s.timestamp) return true;
    const parsedDate = new Date(s.timestamp).getTime();
    if (isNaN(parsedDate)) return true; // Keep if non-standard string timestamp
    return parsedDate >= cutoffMs;
  });
}

/**
 * Calculate deterministic Overall Score
 * Overall Score = (Best Legitimate WPM * 0.4) + (Best Legitimate Accuracy * 0.3) + (Level * 2) + (Streak Days * 0.5) + (Total Sessions * 0.2)
 */
export function calculateOverallScore(
  bestWpm: number,
  bestAccuracy: number,
  level: number,
  streakDays: number,
  totalTests: number,
  totalXp: number = 0,
): number {
  const safeLevel = level || 1;
  const safeXp = totalXp || 0;
  const safeWpm = bestWpm || 0;
  const safeAccuracy = bestAccuracy || 0;
  const safeStreak = streakDays || 0;
  const safeTotalTests = totalTests || 0;

  // A genuinely fresh user with no activity and zero XP/starting level gets 0 pts
  if (
    safeTotalTests === 0 &&
    safeWpm === 0 &&
    safeAccuracy === 0 &&
    safeStreak === 0 &&
    safeXp === 0 &&
    safeLevel <= 1
  ) {
    return 0;
  }

  const levelPoints = safeLevel * 2;
  const score =
    safeWpm * 0.4 + safeAccuracy * 0.3 + levelPoints + safeStreak * 0.5 + safeTotalTests * 0.2;

  return Math.round(score * 10) / 10;
}

/**
 * Main Leaderboard Data Retrieval
 * STRICT RULE: Single authoritative source: Supabase `keyflow_users`.
 * NEVER return fake users or silently fallback to single-user localStorage data.
 */
export async function fetchLeaderboardData(
  category: LeaderboardCategory,
  timePeriod: TimePeriodFilter,
  codeLanguage: CodeLanguageFilter,
  currentUserId?: string,
): Promise<{
  entries: LeaderboardEntry[];
  currentUserEntry: LeaderboardEntry | null;
  error?: string | null;
}> {
  const rawUsersData: Array<{
    userId: string;
    displayName: string;
    level: number;
    totalXp: number;
    streakDays: number;
    totalTests: number;
    badgesCount: number;
    isVisible: boolean;
    bestWpm: number;
    bestAccuracy: number;
    bestCodeWpm: number;
    updatedAt: string | null;
    sessions: SessionResult[];
  }> = [];

  let fetchError: string | null = null;

  // Step A: Fetch all registered competitors from Supabase `keyflow_users` table
  if (isSupabaseConfigured) {
    try {
      const {
        data: profiles,
        error: profErr,
        status,
      } = await supabasePublic.from("keyflow_users").select("*").order("xp", { ascending: false });

      if (profErr) {
        console.error("[Supabase Leaderboard Query Error]", {
          status,
          code: profErr.code,
          message: profErr.message,
          details: profErr.details,
          hint: profErr.hint,
        });
        fetchError =
          process.env.NODE_ENV === "development"
            ? `Supabase Error (${profErr.code || status}): ${profErr.message}`
            : "Unable to load the global leaderboard.";
      } else if (profiles && profiles.length > 0) {
        for (const p of profiles) {
          // Check explicit opt-out if flag exists
          if (p.leaderboard_visible === false) continue;

          rawUsersData.push({
            userId: p.id,
            displayName: p.display_name || p.email?.split("@")[0] || "Anonymous Typist",
            level: p.level || 1,
            totalXp: p.xp ?? 0,
            streakDays: p.streak_days || 0,
            totalTests: p.total_sessions ?? 0,
            badgesCount: 0,
            isVisible: true,
            bestWpm: p.highest_wpm ?? 0,
            bestAccuracy: p.avg_accuracy ?? 0,
            bestCodeWpm: p.highest_wpm ?? 0,
            updatedAt: p.updated_at || p.created_at || null,
            sessions: [],
          });
        }
      }
    } catch (err: any) {
      console.error("[Supabase Leaderboard Exception]", err);
      fetchError =
        process.env.NODE_ENV === "development"
          ? `Connection Exception: ${err?.message || err}`
          : "Unable to load the global leaderboard.";
    }
  } else {
    console.warn(
      "[Supabase Leaderboard] Supabase is unconfigured or credentials missing from environment.",
    );
    fetchError = "Unable to load the global leaderboard.";
  }

  // If Supabase query failed, return error state
  if (fetchError) {
    return {
      entries: [],
      currentUserEntry: null,
      error: fetchError,
    };
  }

  // Filter visible users
  const visibleUsers = rawUsersData.filter((u) => u.isVisible);

  // Time period cutoff calculation
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const cutoffMs =
    timePeriod === "Weekly" ? now - 7 * dayMs : timePeriod === "Monthly" ? now - 30 * dayMs : 0;

  // Process & rank entries for the requested Category
  const entriesCandidate: Array<Omit<LeaderboardEntry, "rank">> = [];

  for (const user of visibleUsers) {
    // Check if user was active within time period if period is not All Time
    if (timePeriod !== "All Time" && user.updatedAt) {
      const userUpdateMs = new Date(user.updatedAt).getTime();
      if (!isNaN(userUpdateMs) && userUpdateMs < cutoffMs) {
        continue;
      }
    }

    const bestWpm = user.bestWpm || 0;
    const bestAccuracy = user.bestAccuracy || 0;
    const bestCodeWpm = user.bestCodeWpm || bestWpm;

    // Determine category metric value & labels
    let categoryMetric = 0;
    let primaryStatLabel = "";
    let secondaryStatLabel = "";

    if (category === "Overall") {
      categoryMetric = calculateOverallScore(
        bestWpm,
        bestAccuracy,
        user.level,
        user.streakDays,
        user.totalTests,
        user.totalXp,
      );
      primaryStatLabel = `${categoryMetric} pts`;
      secondaryStatLabel = `${bestWpm} WPM • ${bestAccuracy}% Acc`;
    } else if (category === "Speed") {
      categoryMetric = bestWpm;
      primaryStatLabel = `${bestWpm} WPM`;
      secondaryStatLabel = `${bestAccuracy}% Acc • Lvl ${user.level}`;
    } else if (category === "Accuracy") {
      categoryMetric = bestAccuracy;
      primaryStatLabel = `${bestAccuracy}%`;
      secondaryStatLabel = `${bestWpm} WPM • ${user.totalTests} Tests`;
    } else if (category === "Coding") {
      categoryMetric = bestCodeWpm;
      primaryStatLabel = `${bestCodeWpm} WPM`;
      secondaryStatLabel = `${bestAccuracy}% Acc • ${codeLanguage.toUpperCase()}`;
    } else if (category === "Streak") {
      categoryMetric = user.streakDays;
      primaryStatLabel = `${user.streakDays} Days`;
      secondaryStatLabel = `Level ${user.level} • ${bestWpm} Max WPM`;
    }

    const isCurrent = Boolean(
      currentUserId &&
      (user.userId === currentUserId ||
        toValidUuid(currentUserId) === user.userId ||
        (user.userId &&
          currentUserId &&
          user.userId.toLowerCase() === currentUserId.toLowerCase())),
    );

    entriesCandidate.push({
      userId: user.userId,
      displayName: user.displayName,
      level: user.level,
      totalXp: user.totalXp,
      categoryMetric,
      primaryStatLabel,
      secondaryStatLabel,
      wpm: bestWpm,
      accuracy: bestAccuracy,
      codeWpm: bestCodeWpm,
      streakDays: user.streakDays,
      totalTests: user.totalTests,
      badgesUnlockedCount: user.badgesCount,
      lastActive: "Active",
      isCurrentUser: isCurrent,
    });
  }

  // Sort deterministically: categoryMetric -> totalXp -> wpm -> accuracy -> level -> streakDays -> totalTests -> displayName -> userId
  entriesCandidate.sort((a, b) => {
    if (b.categoryMetric !== a.categoryMetric) return b.categoryMetric - a.categoryMetric;
    if (b.totalXp !== a.totalXp) return b.totalXp - a.totalXp;
    if (b.wpm !== a.wpm) return b.wpm - a.wpm;
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    if (b.level !== a.level) return b.level - a.level;
    if (b.streakDays !== a.streakDays) return b.streakDays - a.streakDays;
    if (b.totalTests !== a.totalTests) return b.totalTests - a.totalTests;
    const nameDiff = a.displayName.localeCompare(b.displayName);
    if (nameDiff !== 0) return nameDiff;
    return a.userId.localeCompare(b.userId);
  });

  // Load stored rank history snapshot for rank movement calculation
  const snapshotKey = `${LOCAL_RANK_SNAPSHOTS_KEY}${category}_${timePeriod}`;
  const rankSnapshotMap = new Map<string, number>();
  try {
    const existingSnap = localStorage.getItem(snapshotKey);
    if (existingSnap) {
      const snapArr: Array<{ userId: string; rank: number }> = JSON.parse(existingSnap);
      snapArr.forEach((s) => rankSnapshotMap.set(s.userId, s.rank));
    }
  } catch {
    // Ignore snapshot read errors
  }

  // Assign 1-indexed ranks and calculate legitimate rank changes
  const finalEntries: LeaderboardEntry[] = entriesCandidate.map((item, idx) => {
    const currentRank = idx + 1;
    const previousRank = rankSnapshotMap.get(item.userId);

    let rankChange: "up" | "down" | "same" | "new" = "same";
    let rankChangeAmount = 0;

    if (previousRank === undefined) {
      rankChange = "new";
    } else if (previousRank > currentRank) {
      rankChange = "up";
      rankChangeAmount = previousRank - currentRank;
    } else if (previousRank < currentRank) {
      rankChange = "down";
      rankChangeAmount = currentRank - previousRank;
    }

    return {
      ...item,
      rank: currentRank,
      rankChange,
      rankChangeAmount,
    };
  });

  // Save current rank snapshot
  try {
    const newSnap = finalEntries.map((e) => ({ userId: e.userId, rank: e.rank }));
    localStorage.setItem(snapshotKey, JSON.stringify(newSnap));
  } catch {
    // Ignore snapshot write errors
  }

  const currentUserEntry =
    finalEntries.find(
      (e) =>
        e.isCurrentUser ||
        (currentUserId && (e.userId === currentUserId || toValidUuid(currentUserId) === e.userId)),
    ) || null;

  return {
    entries: finalEntries,
    currentUserEntry,
  };
}

/**
 * Fetch rank summary across all categories for the logged in user
 */
export async function fetchUserRankSummary(
  userId: string,
  userStats: UserProfile,
): Promise<UserRankSummary> {
  const isPublic = true;

  try {
    const overallRes = await fetchLeaderboardData("Overall", "All Time", "All", userId);
    const speedRes = await fetchLeaderboardData("Speed", "All Time", "All", userId);
    const accRes = await fetchLeaderboardData("Accuracy", "All Time", "All", userId);
    const codeRes = await fetchLeaderboardData("Coding", "All Time", "All", userId);
    const streakRes = await fetchLeaderboardData("Streak", "All Time", "All", userId);

    const overallScore = calculateOverallScore(
      userStats.highestWpm,
      userStats.avgAccuracy,
      userStats.level,
      userStats.streakDays,
      userStats.totalTestsCompleted,
      userStats.currentXp,
    );

    const codeSessions = (userStats.recentSessions || []).filter(
      (s) => s.mode === "code" || !!s.language,
    );
    const bestCodeWpm = codeSessions.length > 0 ? Math.max(...codeSessions.map((s) => s.wpm)) : 0;

    return {
      overallRank: overallRes.currentUserEntry?.rank || null,
      speedRank: speedRes.currentUserEntry?.rank || null,
      accuracyRank: accRes.currentUserEntry?.rank || null,
      codingRank: codeRes.currentUserEntry?.rank || null,
      streakRank: streakRes.currentUserEntry?.rank || null,
      overallScore,
      bestWpm: userStats.highestWpm,
      bestAccuracy: userStats.avgAccuracy,
      bestCodeWpm,
      streakDays: userStats.streakDays,
      totalCompetitors: overallRes.entries.length,
      isPublic,
    };
  } catch (err) {
    return {
      overallRank: null,
      speedRank: null,
      accuracyRank: null,
      codingRank: null,
      streakRank: null,
      overallScore: 0,
      bestWpm: userStats.highestWpm,
      bestAccuracy: userStats.avgAccuracy,
      bestCodeWpm: 0,
      streakDays: userStats.streakDays,
      totalCompetitors: 0,
      isPublic: true,
    };
  }
}

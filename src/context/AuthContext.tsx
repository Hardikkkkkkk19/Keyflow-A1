import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { UserProfile, SessionResult, Badge, XpEvent } from "../types";
import {
  MASTER_ACHIEVEMENTS,
  calculateLevelInfo,
  calculateUpdatedStreak,
  evaluateActiveStreak,
  formatDateKey,
  evaluateAchievements,
} from "../utils/gamification";
import { syncSessionToLeaderboard, registerRealUser, toValidUuid } from "../utils/leaderboardUtils";
import { saveSessionToStorageAndDb, fetchCanonicalSessions } from "../utils/sessionStorage";
import { sendEmailNotification } from "../utils/emailClient";
import { XpEarnedToast } from "../components/common/XpEarnedToast";
import { LevelUpModal } from "../components/common/LevelUpModal";
import { AchievementToast } from "../components/common/AchievementToast";

export interface DbProfile {
  id: string;
  email: string;
  display_name: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: DbProfile | null;
  userStatsProfile: UserProfile;
  loading: boolean;
  welcomeUser: string | null;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  clearWelcome: () => void;
  recordSession: (session: SessionResult) => void;
  recordDrillCompletion: (drillTitle: string, isWeakKeyDrill?: boolean) => void;
  recordChallengeCompletion: (
    challengeId: string,
    challengeTitle: string,
    rewardXp: number,
  ) => void;
  refreshProfile: () => Promise<{ error: Error | null }>;
}

const DEFAULT_NEW_USER_PROFILE: UserProfile = {
  name: "Champ",
  handle: "@keyflow_user",
  title: "Novice Typist",
  level: 1,
  currentXp: 0,
  nextLevelXp: 100,
  streakDays: 0,
  lastPracticeDate: undefined,
  highestWpm: 0,
  avgWpm: 0,
  avgAccuracy: 0,
  totalTestsCompleted: 0,
  totalDrillsCompleted: 0,
  totalTimeMinutes: 0,
  badges: MASTER_ACHIEVEMENTS,
  recentSessions: [],
  xpHistory: [],
  completedChallenges: [],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_SESSION = "keyflow_auth_session";
const LOCAL_STORAGE_KEY_USER_STATS = "keyflow_user_stats_";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [userStatsProfile, setUserStatsProfile] = useState<UserProfile>(DEFAULT_NEW_USER_PROFILE);
  const [loading, setLoading] = useState(true);
  const [welcomeUser, setWelcomeUser] = useState<string | null>(null);

  // Overlay Notification States
  const [pendingXpToast, setPendingXpToast] = useState<{ xpAmount: number; reason: string } | null>(
    null,
  );
  const [pendingLevelUp, setPendingLevelUp] = useState<{
    previousLevel: number;
    newLevel: number;
  } | null>(null);
  const [pendingAchievement, setPendingAchievement] = useState<Badge | null>(null);

  // Ref to track processed session IDs to prevent duplicate XP
  const processedSessionIdsRef = useRef<Set<string>>(new Set());

  // Helper to load or initialize local user stats profile for user ID
  const loadUserStats = (userId: string, email: string, displayName: string): UserProfile => {
    const storageKey = LOCAL_STORAGE_KEY_USER_STATS + userId;
    const existing = localStorage.getItem(storageKey);
    let loadedProfile: UserProfile;

    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        const levelInfo = calculateLevelInfo(parsed.currentXp || 0);

        // Ensure all master achievements are present
        const existingBadgesMap = new Map<string, Badge>();
        (parsed.badges || []).forEach((b: Badge) => existingBadgesMap.set(b.id, b));
        const mergedBadges = MASTER_ACHIEVEMENTS.map(
          (master) => existingBadgesMap.get(master.id) || { ...master, isUnlocked: false },
        );

        loadedProfile = {
          ...DEFAULT_NEW_USER_PROFILE,
          ...parsed,
          level: levelInfo.level,
          nextLevelXp: levelInfo.xpForNextLevelTotal,
          badges: mergedBadges,
          xpHistory: parsed.xpHistory || [],
          completedChallenges: parsed.completedChallenges || [],
          totalDrillsCompleted: parsed.totalDrillsCompleted || 0,
        };
      } catch (e) {
        console.error("Error parsing stored user stats:", e);
        loadedProfile = {
          ...DEFAULT_NEW_USER_PROFILE,
          name: displayName || email.split("@")[0] || "Champ",
          handle: `@${(displayName || email.split("@")[0]).toLowerCase().replace(/[^a-z0-9_]/g, "")}`,
        };
      }
    } else {
      loadedProfile = {
        ...DEFAULT_NEW_USER_PROFILE,
        name: displayName || email.split("@")[0] || "Champ",
        handle: `@${(displayName || email.split("@")[0]).toLowerCase().replace(/[^a-z0-9_]/g, "")}`,
      };
    }

    localStorage.setItem(storageKey, JSON.stringify(loadedProfile));
    return loadedProfile;
  };

  // Helper to save user stats
  const saveUserStats = (userId: string, stats: UserProfile) => {
    const storageKey = LOCAL_STORAGE_KEY_USER_STATS + userId;
    localStorage.setItem(storageKey, JSON.stringify(stats));
  };

  // Helper to persist user progression & stats to Supabase
  const persistUserStatsToSupabase = async (userId: string, stats: UserProfile) => {
    if (!isSupabaseConfigured || !userId) return;
    try {
      const { error } = await supabase.from("keyflow_users").upsert(
        {
          id: userId,
          display_name: stats.name || "Champ",
          level: stats.level || 1,
          xp: stats.currentXp || 0,
          streak_days: stats.streakDays || 0,
          highest_wpm: stats.highestWpm || 0,
          avg_wpm: stats.avgWpm || stats.highestWpm || 0,
          avg_accuracy: stats.avgAccuracy || 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (error) {
        console.warn("Notice upserting keyflow_users in Supabase:", error.message);
      }
    } catch (err) {
      console.warn("Failed to persist user stats to Supabase:", err);
    }
  };

  // Helper to discover local stats profiles belonging strictly to the current user
  const findCandidateLocalProfiles = (currentUser: User): UserProfile[] => {
    const candidatesMap = new Map<string, UserProfile>();

    const checkAndAdd = (key: string) => {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          if (
            typeof parsed.currentXp === "number" ||
            typeof parsed.highestWpm === "number" ||
            Array.isArray(parsed.recentSessions)
          ) {
            candidatesMap.set(key, parsed);
          }
        }
      } catch (e) {
        // ignore JSON parse error
      }
    };

    // STRICT: Only look for the exact authenticated user ID storage key
    checkAndAdd(LOCAL_STORAGE_KEY_USER_STATS + currentUser.id);

    return Array.from(candidatesMap.values());
  };

  // Function to non-destructively merge DB profile and local candidate profiles
  const mergeProfileProgression = (
    currentUser: User,
    dbData: any,
    localCandidates: UserProfile[],
    displayName: string,
    email: string,
  ): { mergedStats: UserProfile; wasMigrated: boolean } => {
    // DB values
    const dbXp = dbData?.total_xp ?? dbData?.current_xp ?? dbData?.xp ?? 0;
    const dbLevel = dbData?.level ?? 1;
    const dbStreak = dbData?.streak_days ?? dbData?.streak ?? 0;
    const dbBestWpm = dbData?.best_wpm ?? dbData?.highest_wpm ?? 0;
    const dbBestAcc = dbData?.best_accuracy ?? dbData?.avg_accuracy ?? 0;
    const dbTotalTests = dbData?.total_tests_completed ?? 0;
    const dbTotalDrills = dbData?.total_drills_completed ?? 0;
    const dbTotalTime = dbData?.total_time_minutes ?? 0;
    const dbLastDate = dbData?.last_practice_date || "";

    // Candidate aggregates
    let maxLocalXp = 0;
    let maxLocalStreak = 0;
    let maxLocalWpm = 0;
    let maxLocalAcc = 0;
    let maxLocalTests = 0;
    let maxLocalDrills = 0;
    let maxLocalTime = 0;
    let latestLocalDate = "";

    const allSessionsMap = new Map<string, SessionResult>();
    const allBadgesMap = new Map<string, Badge>();
    MASTER_ACHIEVEMENTS.forEach((b) => allBadgesMap.set(b.id, { ...b, isUnlocked: false }));

    const completedChallengesSet = new Set<string>();
    const xpEventsMap = new Map<string, XpEvent>();

    for (const candidate of localCandidates) {
      if (!candidate) continue;

      if (typeof candidate.currentXp === "number" && candidate.currentXp > maxLocalXp) {
        maxLocalXp = candidate.currentXp;
      }
      if (typeof candidate.streakDays === "number" && candidate.streakDays > maxLocalStreak) {
        maxLocalStreak = candidate.streakDays;
      }
      if (typeof candidate.highestWpm === "number" && candidate.highestWpm > maxLocalWpm) {
        maxLocalWpm = candidate.highestWpm;
      }
      if (typeof candidate.avgAccuracy === "number" && candidate.avgAccuracy > maxLocalAcc) {
        maxLocalAcc = candidate.avgAccuracy;
      }
      if (
        typeof candidate.totalTestsCompleted === "number" &&
        candidate.totalTestsCompleted > maxLocalTests
      ) {
        maxLocalTests = candidate.totalTestsCompleted;
      }
      if (
        typeof candidate.totalDrillsCompleted === "number" &&
        candidate.totalDrillsCompleted > maxLocalDrills
      ) {
        maxLocalDrills = candidate.totalDrillsCompleted;
      }
      if (
        typeof candidate.totalTimeMinutes === "number" &&
        candidate.totalTimeMinutes > maxLocalTime
      ) {
        maxLocalTime = candidate.totalTimeMinutes;
      }
      if (candidate.lastPracticeDate && candidate.lastPracticeDate > latestLocalDate) {
        latestLocalDate = candidate.lastPracticeDate;
      }

      // Merge badges
      if (Array.isArray(candidate.badges)) {
        for (const badge of candidate.badges) {
          if (badge && badge.isUnlocked) {
            const existing = allBadgesMap.get(badge.id);
            if (existing) {
              allBadgesMap.set(badge.id, {
                ...existing,
                isUnlocked: true,
                unlockedAt: badge.unlockedAt || existing.unlockedAt || new Date().toISOString(),
              });
            }
          }
        }
      }

      // Merge sessions
      if (Array.isArray(candidate.recentSessions)) {
        for (const sess of candidate.recentSessions) {
          if (sess && sess.id) {
            allSessionsMap.set(sess.id, sess);
          }
        }
      }

      // Merge completed challenges
      if (Array.isArray(candidate.completedChallenges)) {
        for (const chId of candidate.completedChallenges) {
          completedChallengesSet.add(chId);
        }
      }

      // Merge XP events
      if (Array.isArray(candidate.xpHistory)) {
        for (const evt of candidate.xpHistory) {
          if (evt && evt.id) {
            xpEventsMap.set(evt.id, evt);
          }
        }
      }
    }

    // Determine if local candidate has higher progression
    const localHasHigherProgression =
      maxLocalXp > dbXp ||
      maxLocalWpm > dbBestWpm ||
      maxLocalTests > dbTotalTests ||
      maxLocalDrills > dbTotalDrills;

    const mergedXp = Math.max(dbXp, maxLocalXp);
    const levelInfo = calculateLevelInfo(mergedXp);
    const mergedLevel = Math.max(dbLevel, levelInfo.level);

    const mergedStreakCandidate = Math.max(dbStreak, maxLocalStreak);
    const mergedHighestWpm = Math.max(dbBestWpm, maxLocalWpm);

    const mergedSessions = Array.from(allSessionsMap.values()).sort(
      (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime(),
    );

    // Accuracy: compute average from valid sessions if available, or preserve best valid accuracy
    let mergedAvgAccuracy = Math.max(dbBestAcc, maxLocalAcc);
    if (mergedSessions.length > 0) {
      const validAccSessions = mergedSessions.filter(
        (s) => typeof s.accuracy === "number" && s.accuracy > 0,
      );
      if (validAccSessions.length > 0) {
        const sumAcc = validAccSessions.reduce((acc, s) => acc + s.accuracy, 0);
        const computedAcc = Number((sumAcc / validAccSessions.length).toFixed(1));
        mergedAvgAccuracy = Math.max(mergedAvgAccuracy, computedAcc);
      }
    }

    const mergedTotalTests = Math.max(dbTotalTests, maxLocalTests, mergedSessions.length);
    const mergedTotalDrills = Math.max(dbTotalDrills, maxLocalDrills);
    const mergedTotalTime = Math.max(dbTotalTime, maxLocalTime);
    let mergedLastDate =
      latestLocalDate && latestLocalDate > dbLastDate ? latestLocalDate : dbLastDate;

    if (!mergedLastDate && mergedSessions.length > 0 && mergedSessions[0].timestamp) {
      mergedLastDate = formatDateKey(mergedSessions[0].timestamp);
    }

    const hasActivity =
      mergedTotalTests > 0 ||
      mergedTotalDrills > 0 ||
      mergedSessions.length > 0 ||
      mergedHighestWpm > 0;

    const { activeStreak, lastDateKey } = evaluateActiveStreak(
      mergedStreakCandidate,
      mergedLastDate,
      hasActivity,
    );
    const mergedStreak = activeStreak;
    if (lastDateKey) {
      mergedLastDate = lastDateKey;
    }

    const name = dbData?.display_name || displayName || email.split("@")[0] || "Champ";
    const handle = `@${name.toLowerCase().replace(/[^a-z0-9_]/g, "")}`;

    const mergedStats: UserProfile = {
      name,
      handle,
      level: mergedLevel,
      currentXp: mergedXp,
      nextLevelXp: levelInfo.xpForNextLevelTotal,
      streakDays: mergedStreak,
      lastPracticeDate: mergedLastDate,
      highestWpm: mergedHighestWpm,
      avgWpm:
        mergedSessions.length > 0
          ? Math.round(mergedSessions.reduce((acc, s) => acc + s.wpm, 0) / mergedSessions.length)
          : mergedHighestWpm,
      avgAccuracy: mergedAvgAccuracy,
      totalTestsCompleted: mergedTotalTests,
      totalDrillsCompleted: mergedTotalDrills,
      totalTimeMinutes: mergedTotalTime,
      recentSessions: mergedSessions,
      badges: Array.from(allBadgesMap.values()),
      xpHistory: Array.from(xpEventsMap.values()),
      completedChallenges: Array.from(completedChallengesSet),
    };

    return {
      mergedStats,
      wasMigrated: localHasHigherProgression,
    };
  };

  // Fetch user profile record from Supabase or fallback
  const fetchProfile = async (currentUser: User) => {
    const displayName =
      currentUser.user_metadata?.display_name || currentUser.email?.split("@")[0] || "Champ";
    const email = currentUser.email || "";

    const migrationGuardKey = `keyflow_migrated_user_${currentUser.id}`;
    const isAlreadyMigrated = localStorage.getItem(migrationGuardKey) === "true";

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("keyflow_users")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.warn("Supabase fetch profile warning:", error.message);
        }

        if (data) {
          setProfile(data);

          // Find candidate local stats profiles belonging to this user
          const candidates = findCandidateLocalProfiles(currentUser);
          const { mergedStats, wasMigrated } = mergeProfileProgression(
            currentUser,
            data,
            candidates,
            displayName,
            email,
          );

          setUserStatsProfile(mergedStats);
          saveUserStats(currentUser.id, mergedStats);

          // If local candidates had higher progression than Supabase, update Supabase in background
          if (
            wasMigrated ||
            mergedStats.currentXp > (data.xp ?? data.total_xp ?? 0) ||
            mergedStats.highestWpm > (data.highest_wpm ?? data.best_wpm ?? 0)
          ) {
            persistUserStatsToSupabase(currentUser.id, mergedStats).catch((e) =>
              console.warn("Supabase background sync notice:", e),
            );
            localStorage.setItem(migrationGuardKey, "true");
          }

          fetchCanonicalSessions(currentUser.id).then((canonical) => {
            setUserStatsProfile((prev) => ({
              ...prev,
              recentSessions: canonical || [],
            }));
          });
          return;
        }

        // Profile doesn't exist yet in Supabase -> Create it and check local candidates
        const newDbProfile: DbProfile = {
          id: currentUser.id,
          email,
          display_name: displayName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
          .from("keyflow_users")
          .upsert(newDbProfile, { onConflict: "id" });

        if (insertError) {
          console.warn("Supabase profile creation notice:", insertError.message);
        }

        setProfile(newDbProfile);

        const candidates = findCandidateLocalProfiles(currentUser);
        const { mergedStats } = mergeProfileProgression(
          currentUser,
          null,
          candidates,
          displayName,
          email,
        );

        setUserStatsProfile(mergedStats);
        saveUserStats(currentUser.id, mergedStats);
        persistUserStatsToSupabase(currentUser.id, mergedStats).catch((e) =>
          console.warn("Supabase background sync notice:", e),
        );
        localStorage.setItem(migrationGuardKey, "true");
        return;
      } catch (err) {
        console.warn("Error fetching Supabase profile:", err);
      }
    }

    // Fallback profile if Supabase is unconfigured or offline
    const fallbackDbProfile: DbProfile = {
      id: currentUser.id,
      email,
      display_name: displayName,
      created_at: new Date().toISOString(),
    };
    setProfile(fallbackDbProfile);
    const candidates = findCandidateLocalProfiles(currentUser);
    const { mergedStats } = mergeProfileProgression(
      currentUser,
      null,
      candidates,
      displayName,
      email,
    );
    setUserStatsProfile(mergedStats);
    saveUserStats(currentUser.id, mergedStats);
  };

  // Initial Auth Check
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      if (isSupabaseConfigured) {
        try {
          const { data } = await supabase.auth.getSession();
          if (mounted) {
            setSession(data.session);
            setUser(data.session?.user ?? null);
            if (data.session?.user) {
              await fetchProfile(data.session.user);
            }
          }
        } catch (err) {
          console.warn("Supabase initial auth check:", err);
        }
      } else {
        // Fallback local session
        const storedSession = localStorage.getItem(LOCAL_STORAGE_KEY_SESSION);
        if (storedSession) {
          try {
            const parsed = JSON.parse(storedSession);
            if (parsed && parsed.user) {
              setUser(parsed.user);
              setSession(parsed);
              const displayName =
                parsed.user.user_metadata?.display_name ||
                parsed.user.email?.split("@")[0] ||
                "Champ";
              setProfile({
                id: parsed.user.id,
                email: parsed.user.email,
                display_name: displayName,
              });
              setUserStatsProfile(loadUserStats(parsed.user.id, parsed.user.email, displayName));
            }
          } catch (e) {
            localStorage.removeItem(LOCAL_STORAGE_KEY_SESSION);
          }
        }
      }

      if (mounted) {
        setLoading(false);
      }
    };

    // Safety fallback timer to guarantee loading state resolves
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 2000);

    initAuth();

    // Listen to Supabase Auth State Changes if configured
    let subscription: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await fetchProfile(newSession.user);
        } else {
          setProfile(null);
          setUserStatsProfile(DEFAULT_NEW_USER_PROFILE);
        }
        setLoading(false);
      });
      subscription = authListener.subscription;
    }

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Sign In
  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    if (!email || !password) {
      return { error: new Error("Please enter both email and password.") };
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          return { error: new Error(formatAuthError(error.message)) };
        }

        if (data.user) {
          setUser(data.user);
          setSession(data.session);
          await fetchProfile(data.user);
          const name =
            data.user.user_metadata?.display_name || data.user.email?.split("@")[0] || "Champ";
          setWelcomeUser(name);
        }
        return { error: null };
      } catch (err: any) {
        return {
          error: new Error("Unable to connect to authentication server. Please try again."),
        };
      }
    }

    // Local Fallback Sign In
    const mockId = "usr_" + btoa(email).replace(/=/g, "").slice(0, 10);
    const displayName = email.split("@")[0] || "Champ";
    const mockUser: any = {
      id: mockId,
      email,
      user_metadata: { display_name: displayName },
    };
    const mockSession: any = { user: mockUser, access_token: "mock_token" };

    localStorage.setItem(LOCAL_STORAGE_KEY_SESSION, JSON.stringify(mockSession));
    setUser(mockUser);
    setSession(mockSession);
    setProfile({ id: mockId, email, display_name: displayName });
    setUserStatsProfile(loadUserStats(mockId, email, displayName));
    setWelcomeUser(displayName);

    return { error: null };
  };

  // Sign Up
  const signUp = async (
    email: string,
    password: string,
    displayName: string,
  ): Promise<{ error: Error | null }> => {
    if (!email || !password || !displayName) {
      return { error: new Error("All fields are required.") };
    }

    if (password.length < 6) {
      return { error: new Error("Password must be at least 6 characters.") };
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
          },
        });

        if (error) {
          return { error: new Error(formatAuthError(error.message)) };
        }

        if (data.user) {
          setUser(data.user);
          setSession(data.session);

          // Create Profile in Supabase
          const newDbProfile: DbProfile = {
            id: data.user.id,
            email,
            display_name: displayName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          await supabase.from("keyflow_users").upsert(newDbProfile, { onConflict: "id" });
          setProfile(newDbProfile);

          // Initialize fresh zero user stats
          const freshStats: UserProfile = {
            ...DEFAULT_NEW_USER_PROFILE,
            name: displayName,
            handle: `@${displayName.toLowerCase().replace(/[^a-z0-9_]/g, "")}`,
          };

          saveUserStats(data.user.id, freshStats);
          setUserStatsProfile(freshStats);
          setWelcomeUser(displayName);

          // Dispatch Welcome Email for genuinely new account
          sendEmailNotification({
            type: "welcome",
            email: data.user.email || email,
            userId: data.user.id,
            displayName,
          });
        }

        return { error: null };
      } catch (err: any) {
        return {
          error: new Error(
            "Failed to create account. Please check your credentials and try again.",
          ),
        };
      }
    }

    // Local Fallback Sign Up
    const mockId = "usr_" + btoa(email).replace(/=/g, "").slice(0, 10);
    const mockUser: any = {
      id: mockId,
      email,
      user_metadata: { display_name: displayName },
    };
    const mockSession: any = { user: mockUser, access_token: "mock_token" };

    localStorage.setItem(LOCAL_STORAGE_KEY_SESSION, JSON.stringify(mockSession));
    setUser(mockUser);
    setSession(mockSession);
    setProfile({ id: mockId, email, display_name: displayName });

    const freshStats: UserProfile = {
      ...DEFAULT_NEW_USER_PROFILE,
      name: displayName,
      handle: `@${displayName.toLowerCase().replace(/[^a-z0-9_]/g, "")}`,
    };
    saveUserStats(mockId, freshStats);
    setUserStatsProfile(freshStats);
    setWelcomeUser(displayName);

    // Dispatch Welcome Email for local fallback sign up
    sendEmailNotification({
      type: "welcome",
      email,
      userId: mockId,
      displayName,
    });

    return { error: null };
  };

  // Sign Out
  const signOut = async (): Promise<void> => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Error on Supabase signout:", err);
      }
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY_SESSION);
    setUser(null);
    setSession(null);
    setProfile(null);
    setUserStatsProfile(DEFAULT_NEW_USER_PROFILE);
    processedSessionIdsRef.current.clear();
  };

  // Forgot Password / Reset Link
  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
    if (!email) {
      return { error: new Error("Please enter your email address.") };
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          return { error: new Error(formatAuthError(error.message)) };
        }
      } catch (err) {
        console.warn("Reset password error:", err);
      }
    }

    return { error: null };
  };

  // Update Password
  const updatePassword = async (newPassword: string): Promise<{ error: Error | null }> => {
    if (!newPassword || newPassword.length < 6) {
      return { error: new Error("Password must be at least 6 characters long.") };
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          return { error: new Error(formatAuthError(error.message)) };
        }
      } catch (err) {
        return { error: new Error("Failed to update password. Please try again.") };
      }
    }

    return { error: null };
  };

  // Helper to dispatch level up, streak milestone, and achievement emails
  const handleProgressionEmails = (
    userObj: User | null,
    profileObj: DbProfile | null,
    statsName: string,
    prevLevel: number,
    newLevel: number,
    currentXp: number,
    prevStreak: number,
    newStreak: number,
    newBadges: Badge[],
  ) => {
    const email = userObj?.email;
    const userId = userObj?.id;
    if (!email || !userId) return;

    const displayName = statsName || profileObj?.display_name || email.split("@")[0] || "Typist";

    // 1. Level up email
    if (newLevel > prevLevel) {
      sendEmailNotification({
        type: "level_up",
        email,
        userId,
        displayName,
        previousLevel: prevLevel,
        newLevel,
        currentXp,
      });
    }

    // 2. Streak milestone email
    const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100];
    if (STREAK_MILESTONES.includes(newStreak) && prevStreak < newStreak) {
      sendEmailNotification({
        type: "streak_milestone",
        email,
        userId,
        displayName,
        streakDays: newStreak,
      });
    }

    // 3. Achievement unlocked email
    if (newBadges && newBadges.length > 0) {
      newBadges.forEach((badge) => {
        sendEmailNotification({
          type: "achievement",
          email,
          userId,
          displayName,
          badgeId: badge.id,
          badgeTitle: badge.title,
          rewardXp: badge.xpReward || 50,
          description: badge.description,
        });
      });
    }
  };

  // ==========================================
  // GAMIFICATION LOGIC IMPLEMENTATION
  // ==========================================

  // Record completed typing session for current user
  const recordSession = (sessionData: SessionResult) => {
    if (!user) return;

    // Ensure session is explicitly stamped with active user ID
    const sessionWithUser: SessionResult = {
      ...sessionData,
      userId: user.id,
    };

    // Prevent duplicate XP awards for same session ID
    if (sessionWithUser.id && processedSessionIdsRef.current.has(sessionWithUser.id)) {
      return;
    }
    if (sessionWithUser.id) {
      processedSessionIdsRef.current.add(sessionWithUser.id);
    }

    const prev = userStatsProfile;

    // 1. Calculate XP for this session
    let sessionXp = 10; // Base session completion XP
    if (sessionWithUser.accuracy >= 95) sessionXp += 10; // High accuracy bonus
    if (sessionWithUser.wpm > prev.highestWpm && prev.totalTestsCompleted > 0) sessionXp += 20; // Personal record bonus

    // 2. Update streak
    const { updatedStreak, todayStr } = calculateUpdatedStreak(
      prev.streakDays,
      prev.lastPracticeDate,
    );

    // 3. Update lifetime metrics
    const updatedSessions = [sessionWithUser, ...(prev.recentSessions || [])].slice(0, 200);
    const newHighest = Math.max(prev.highestWpm, sessionWithUser.wpm);
    const newTotalTests = prev.totalTestsCompleted + 1;
    const newTotalMinutes = Math.round(prev.totalTimeMinutes + sessionWithUser.timeSec / 60);

    const sumWpm = updatedSessions.reduce((acc, s) => acc + s.wpm, 0);
    const sumAcc = updatedSessions.reduce((acc, s) => acc + s.accuracy, 0);
    const avgWpm = Math.round(sumWpm / updatedSessions.length);
    const avgAcc = Number((sumAcc / updatedSessions.length).toFixed(1));

    // 4. Record XP Event
    const sessionXpEvent: XpEvent = {
      id: `xp_sess_${Date.now()}`,
      eventType: "session",
      title:
        sessionWithUser.wpm > prev.highestWpm && prev.totalTestsCompleted > 0
          ? `Typing Session + Personal Record! (${sessionWithUser.wpm} WPM)`
          : `Completed Practice Session (${sessionWithUser.wpm} WPM)`,
      xpAmount: sessionXp,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedXpEvents = [sessionXpEvent, ...(prev.xpHistory || [])].slice(0, 30);
    let cumulativeXp = prev.currentXp + sessionXp;

    // 5. Evaluate achievements
    const tempProfileForEval: UserProfile = {
      ...prev,
      highestWpm: newHighest,
      avgWpm,
      avgAccuracy: avgAcc,
      totalTestsCompleted: newTotalTests,
      streakDays: updatedStreak,
      lastPracticeDate: todayStr,
    };

    const {
      unlockedBadges,
      newlyUnlockedBadges,
      totalBonusXp,
      xpEvents: achievementXpEvents,
    } = evaluateAchievements(tempProfileForEval, sessionWithUser);

    cumulativeXp += totalBonusXp;
    const finalXpEvents = [...achievementXpEvents, ...updatedXpEvents].slice(0, 30);

    // 6. Level Calculation
    const prevLevel = prev.level;
    const levelInfo = calculateLevelInfo(cumulativeXp);

    const updated: UserProfile = {
      ...prev,
      highestWpm: newHighest,
      avgWpm,
      avgAccuracy: avgAcc,
      totalTestsCompleted: newTotalTests,
      totalTimeMinutes: newTotalMinutes,
      currentXp: cumulativeXp,
      level: levelInfo.level,
      nextLevelXp: levelInfo.xpForNextLevelTotal,
      recentSessions: updatedSessions,
      streakDays: updatedStreak,
      lastPracticeDate: todayStr,
      badges: unlockedBadges,
      xpHistory: finalXpEvents,
    };

    setUserStatsProfile(updated);

    if (levelInfo.level > prevLevel) {
      setPendingLevelUp({ previousLevel: prevLevel, newLevel: levelInfo.level });
    }

    if (newlyUnlockedBadges.length > 0) {
      setPendingAchievement(newlyUnlockedBadges[0]);
    } else {
      setPendingXpToast({ xpAmount: sessionXp, reason: "Session Completed" });
    }

    saveUserStats(user.id, updated);
    saveSessionToStorageAndDb(sessionWithUser, user.id);
    const displayName = profile?.display_name || user.email?.split("@")[0] || "Champ";
    localStorage.setItem("keyflow_current_user_id", user.id);
    syncSessionToLeaderboard(user.id, displayName, sessionWithUser, updated);
    persistUserStatsToSupabase(user.id, updated);

    // Dispatch email notifications for level up, streak milestone, & newly unlocked achievements
    handleProgressionEmails(
      user,
      profile,
      updated.name,
      prevLevel,
      levelInfo.level,
      cumulativeXp,
      prev.streakDays,
      updatedStreak,
      newlyUnlockedBadges,
    );
  };

  // Record completed practice drill for current user
  const recordDrillCompletion = (drillTitle: string, isWeakKeyDrill: boolean = false) => {
    if (!user) return;

    const prev = userStatsProfile;
    const drillXp = isWeakKeyDrill ? 25 : 15;
    const { updatedStreak, todayStr } = calculateUpdatedStreak(
      prev.streakDays,
      prev.lastPracticeDate,
    );
    const newTotalDrills = (prev.totalDrillsCompleted || 0) + 1;

    const drillXpEvent: XpEvent = {
      id: `xp_drill_${Date.now()}`,
      eventType: "drill",
      title: isWeakKeyDrill
        ? `Targeted Weak-Key Drill (${drillTitle})`
        : `Completed Drill: ${drillTitle}`,
      xpAmount: drillXp,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    let cumulativeXp = prev.currentXp + drillXp;
    const updatedXpEvents = [drillXpEvent, ...(prev.xpHistory || [])].slice(0, 30);

    const tempProfileForEval: UserProfile = {
      ...prev,
      totalDrillsCompleted: newTotalDrills,
      streakDays: updatedStreak,
      lastPracticeDate: todayStr,
    };

    const {
      unlockedBadges,
      newlyUnlockedBadges,
      totalBonusXp,
      xpEvents: achievementXpEvents,
    } = evaluateAchievements(tempProfileForEval, undefined, { isWeakKeyDrill });

    cumulativeXp += totalBonusXp;
    const finalXpEvents = [...achievementXpEvents, ...updatedXpEvents].slice(0, 30);

    const prevLevel = prev.level;
    const levelInfo = calculateLevelInfo(cumulativeXp);

    const updated: UserProfile = {
      ...prev,
      totalDrillsCompleted: newTotalDrills,
      currentXp: cumulativeXp,
      level: levelInfo.level,
      nextLevelXp: levelInfo.xpForNextLevelTotal,
      streakDays: updatedStreak,
      lastPracticeDate: todayStr,
      badges: unlockedBadges,
      xpHistory: finalXpEvents,
    };

    setUserStatsProfile(updated);

    if (levelInfo.level > prevLevel) {
      setPendingLevelUp({ previousLevel: prevLevel, newLevel: levelInfo.level });
    }

    if (newlyUnlockedBadges.length > 0) {
      setPendingAchievement(newlyUnlockedBadges[0]);
    } else {
      setPendingXpToast({
        xpAmount: drillXp,
        reason: isWeakKeyDrill ? "Weak-Key Drill Mastered" : "Drill Completed",
      });
    }

    saveUserStats(user.id, updated);
    persistUserStatsToSupabase(user.id, updated);

    // Dispatch email notifications for level up, streak milestone, & newly unlocked achievements
    handleProgressionEmails(
      user,
      profile,
      updated.name,
      prevLevel,
      levelInfo.level,
      cumulativeXp,
      prev.streakDays,
      updatedStreak,
      newlyUnlockedBadges,
    );
  };

  // Record completed challenge for current user
  const recordChallengeCompletion = (
    challengeId: string,
    challengeTitle: string,
    rewardXp: number,
  ) => {
    if (!user) return;

    const prev = userStatsProfile;
    const completedList = prev.completedChallenges || [];
    if (completedList.includes(challengeId)) return; // Already completed

    const updatedCompleted = [...completedList, challengeId];
    const challengeXpEvent: XpEvent = {
      id: `xp_chal_${Date.now()}`,
      eventType: "challenge",
      title: `Challenge Completed: ${challengeTitle}`,
      xpAmount: rewardXp,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const cumulativeXp = prev.currentXp + rewardXp;
    const updatedXpEvents = [challengeXpEvent, ...(prev.xpHistory || [])].slice(0, 30);

    const prevLevel = prev.level;
    const levelInfo = calculateLevelInfo(cumulativeXp);

    const updated: UserProfile = {
      ...prev,
      completedChallenges: updatedCompleted,
      currentXp: cumulativeXp,
      level: levelInfo.level,
      nextLevelXp: levelInfo.xpForNextLevelTotal,
      xpHistory: updatedXpEvents,
    };

    setUserStatsProfile(updated);

    if (levelInfo.level > prevLevel) {
      setPendingLevelUp({ previousLevel: prevLevel, newLevel: levelInfo.level });
    }

    setPendingXpToast({ xpAmount: rewardXp, reason: "Challenge Completed" });

    saveUserStats(user.id, updated);
    persistUserStatsToSupabase(user.id, updated);

    // Dispatch email notification for level up if challenge pushed user over level boundary
    handleProgressionEmails(
      user,
      profile,
      updated.name,
      prevLevel,
      levelInfo.level,
      cumulativeXp,
      prev.streakDays,
      prev.streakDays,
      [],
    );
  };

  const refreshProfile = async (): Promise<{ error: Error | null }> => {
    if (!user) return { error: null };
    try {
      await fetchProfile(user);
      return { error: null };
    } catch (err: any) {
      console.warn("Failed to refresh profile:", err);
      return {
        error: err instanceof Error ? err : new Error("Failed to refresh user progression"),
      };
    }
  };

  const clearWelcome = () => setWelcomeUser(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        userStatsProfile,
        loading,
        welcomeUser,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        clearWelcome,
        recordSession,
        recordDrillCompletion,
        recordChallengeCompletion,
        refreshProfile,
      }}
    >
      {children}

      {/* Floating XP Toast */}
      {pendingXpToast && (
        <XpEarnedToast
          xpAmount={pendingXpToast.xpAmount}
          reason={pendingXpToast.reason}
          onClose={() => setPendingXpToast(null)}
        />
      )}

      {/* Level Up Modal */}
      {pendingLevelUp && (
        <LevelUpModal
          previousLevel={pendingLevelUp.previousLevel}
          newLevel={pendingLevelUp.newLevel}
          onClose={() => setPendingLevelUp(null)}
        />
      )}

      {/* Achievement Toast */}
      {pendingAchievement && (
        <AchievementToast badge={pendingAchievement} onClose={() => setPendingAchievement(null)} />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Clean user-facing error message formatter
function formatAuthError(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("invalid login credentials") || lower.includes("invalid credentials")) {
    return "Invalid email or password. Please check your details and try again.";
  }
  if (lower.includes("user already registered") || lower.includes("already exists")) {
    return "An account with this email address already exists. Try logging in instead.";
  }
  if (lower.includes("password should be at least")) {
    return "Password must be at least 6 characters long.";
  }
  if (lower.includes("rate limit")) {
    return "Too many login attempts. Please wait a moment before trying again.";
  }
  return msg || "An authentication error occurred. Please try again.";
}

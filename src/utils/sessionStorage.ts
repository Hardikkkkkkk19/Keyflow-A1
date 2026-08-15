import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { SessionResult } from "../types";

const STORAGE_KEY_SESSIONS = "keyflow_sessions";

/**
 * Anti-leak session validation and isolation utility.
 * Strictly guarantees that only sessions belonging to the specified targetUserId are used
 * for personalized recommendations, user telemetry, and AI coach prompt construction.
 *
 * Rules:
 * 1. If targetUserId is provided (authenticated user):
 *    - Include sessions whose session.userId matches targetUserId.
 *    - For backward compatibility with older un-tagged local storage sessions in the user's isolated storage namespace,
 *      only include if session is structurally valid and does not belong to a DIFFERENT userId.
 * 2. If targetUserId is empty/undefined (guest/unauthenticated):
 *    - Only allow sessions that have no userId or userId === "guest" / "guest_user". Discard any sessions tagged with registered user IDs.
 * 3. Validate structural integrity:
 *    - Valid numeric WPM >= 0 and <= 300
 *    - Valid numeric Accuracy >= 0 and <= 100
 *    - Valid timestamp
 *    - Non-empty ID
 */
export function validateAndFilterUserSessions(
  sessions: SessionResult[] = [],
  targetUserId?: string,
): SessionResult[] {
  if (!Array.isArray(sessions)) return [];

  const cleanUserId = targetUserId?.trim();

  return sessions.filter((s) => {
    if (!s || typeof s !== "object" || !s.id) return false;

    // Numerical sanity checks
    if (typeof s.wpm !== "number" || isNaN(s.wpm) || s.wpm < 0 || s.wpm > 300) return false;
    if (typeof s.accuracy !== "number" || isNaN(s.accuracy) || s.accuracy < 0 || s.accuracy > 100)
      return false;

    // Date sanity check
    if (!s.timestamp || isNaN(new Date(s.timestamp).getTime())) return false;

    // Strict User Ownership Validation & Isolation
    if (cleanUserId) {
      // For authenticated user: If session has userId, it MUST match the authenticated user ID
      if (s.userId && s.userId !== cleanUserId) {
        return false;
      }
    } else {
      // For unauthenticated guest: reject any session that belongs to a registered user ID
      if (s.userId && s.userId !== "guest" && s.userId !== "guest_user") {
        return false;
      }
    }

    return true;
  });
}

/**
 * Saves a completed typing session to localStorage and Supabase.
 */
export async function saveSessionToStorageAndDb(
  session: SessionResult,
  userId?: string,
): Promise<void> {
  if (!session) return;

  // Ensure timestamp is valid ISO string
  const validTimestamp =
    session.timestamp && !isNaN(new Date(session.timestamp).getTime())
      ? session.timestamp
      : new Date().toISOString();

  const normalizedSession: SessionResult = {
    ...session,
    userId: userId || "guest",
    timestamp: validTimestamp,
  };

  // 1. Save locally with strict user scoping
  try {
    if (userId) {
      const userKey = `${STORAGE_KEY_SESSIONS}_${userId}`;
      const userExistingRaw = localStorage.getItem(userKey);
      const userExisting: SessionResult[] = userExistingRaw ? JSON.parse(userExistingRaw) : [];
      const userFiltered = userExisting.filter((s) => s.id !== normalizedSession.id);
      const userUpdated = [normalizedSession, ...userFiltered].slice(0, 100);
      localStorage.setItem(userKey, JSON.stringify(userUpdated));
    } else {
      // Guest only - save to unauthenticated guest key
      const existingRaw = localStorage.getItem(STORAGE_KEY_SESSIONS);
      const existing: SessionResult[] = existingRaw ? JSON.parse(existingRaw) : [];
      const filtered = existing.filter((s) => s.id !== normalizedSession.id);
      const updated = [normalizedSession, ...filtered].slice(0, 100);
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updated));
    }
  } catch (err) {
    console.warn("Error saving session locally:", err);
  }

  // 2. Persist to Supabase if configured and user is logged in
  if (isSupabaseConfigured && userId) {
    try {
      const { error } = await supabase.from("typing_sessions").upsert(
        {
          id: normalizedSession.id || `sess_${Date.now()}`,
          user_id: userId,
          mode: normalizedSession.mode || "time",
          wpm: normalizedSession.wpm || 0,
          raw_wpm: normalizedSession.rawWpm || normalizedSession.wpm || 0,
          accuracy: normalizedSession.accuracy || 0,
          consistency: normalizedSession.consistency || 0,
          correct_chars: normalizedSession.correctChars || 0,
          incorrect_chars: normalizedSession.incorrectChars || 0,
          backspaces: normalizedSession.backspaces || 0,
          total_keystrokes: normalizedSession.totalChars || 0,
          duration_seconds: normalizedSession.timeSec || 0,
          text_length: normalizedSession.snippet?.length || 0,
          snippet: normalizedSession.snippet || "",
          completed_at: new Date(normalizedSession.timestamp).toISOString(),
          created_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (error) {
        console.warn("Supabase typing_sessions save notice:", error.message);
      }
    } catch (e) {
      console.warn("Failed to persist session to Supabase:", e);
    }
  }
}

/**
 * Fetches canonical sessions from Supabase and localStorage.
 * For authenticated users, strictly accesses only sessions belonging to that user.
 */
export async function fetchCanonicalSessions(userId?: string): Promise<SessionResult[]> {
  const sessionMap = new Map<string, SessionResult>();

  // Load local sessions scoped strictly by ownership
  try {
    if (userId) {
      const userKey = `${STORAGE_KEY_SESSIONS}_${userId}`;
      const userRaw = localStorage.getItem(userKey);
      if (userRaw) {
        const userParsed: SessionResult[] = JSON.parse(userRaw);
        if (Array.isArray(userParsed)) {
          userParsed.forEach((s) => {
            if (s && s.id) {
              sessionMap.set(s.id, {
                ...s,
                userId: s.userId || userId,
              });
            }
          });
        }
      }
    } else {
      // Guest mode only: read un-namespaced guest sessions
      const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (raw) {
        const parsed: SessionResult[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((s) => {
            if (s && s.id && (!s.userId || s.userId === "guest" || s.userId === "guest_user")) {
              sessionMap.set(s.id, {
                ...s,
                userId: "guest",
              });
            }
          });
        }
      }
    }
  } catch (err) {
    console.warn("Error reading local sessions:", err);
  }

  // Load Supabase sessions if configured and user is logged in
  if (isSupabaseConfigured && userId) {
    try {
      const { data, error } = await supabase
        .from("typing_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false });

      if (!error && data && data.length > 0) {
        data.forEach((row) => {
          const s: SessionResult = {
            id: row.id,
            userId: row.user_id || userId,
            timestamp: row.completed_at || row.created_at || new Date().toISOString(),
            mode: row.mode || "time",
            modeDetail: `${row.duration_seconds || 30}s`,
            wpm: Number(row.wpm) || 0,
            rawWpm: Number(row.raw_wpm) || Number(row.wpm) || 0,
            accuracy: Number(row.accuracy) || 0,
            consistency: Number(row.consistency) || 0,
            timeSec: Number(row.duration_seconds) || 30,
            snippet: row.snippet || "",
            errorKeys: [],
            correctChars: row.correct_chars || 0,
            incorrectChars: row.incorrect_chars || 0,
            totalChars: row.total_keystrokes || 0,
            backspaces: row.backspaces || 0,
          };
          sessionMap.set(s.id, s);
        });
      }
    } catch (e) {
      console.warn("Error fetching Supabase typing_sessions:", e);
    }
  }

  const all = Array.from(sessionMap.values());
  all.sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime() || 0;
    const timeB = new Date(b.timestamp).getTime() || 0;
    return timeB - timeA;
  });

  // Apply strict validation and user ownership filtering
  return validateAndFilterUserSessions(all, userId);
}

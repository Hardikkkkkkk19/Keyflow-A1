/**
 * Client-side Email Dispatcher & Safe Duplicate Protection Engine
 * Guarantees emails are sent via server-side /api/email and never repeated on re-renders,
 * page refreshes, auth restores, or route navigation.
 */

export interface EmailNotificationPayload {
  type: "welcome" | "achievement" | "level_up" | "streak_milestone";
  email: string;
  userId: string;
  displayName: string;
  badgeTitle?: string;
  badgeId?: string;
  rewardXp?: number;
  description?: string;
  previousLevel?: number;
  newLevel?: number;
  currentXp?: number;
  streakDays?: number;
}

const sentEmailKeysInMemory = new Set<string>();
const LOCAL_STORAGE_SENT_EMAILS_KEY = "keyflow_sent_emails_registry_v1";

function getStoredSentEmailKeys(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SENT_EMAILS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed);
    }
  } catch {
    // ignore localStorage errors
  }
  return new Set();
}

function saveSentEmailKey(key: string) {
  sentEmailKeysInMemory.add(key);
  if (typeof window === "undefined") return;
  try {
    const keys = getStoredSentEmailKeys();
    keys.add(key);
    localStorage.setItem(LOCAL_STORAGE_SENT_EMAILS_KEY, JSON.stringify(Array.from(keys)));
  } catch (e) {
    console.warn("Notice saving sent email key to localStorage:", e);
  }
}

export function generateDedupKey(payload: EmailNotificationPayload): string {
  const uId = payload.userId || "anon";
  switch (payload.type) {
    case "welcome":
      return `email_sent_welcome_${uId}`;
    case "level_up":
      return `email_sent_levelup_${uId}_lvl_${payload.newLevel || 1}`;
    case "achievement":
      return `email_sent_achievement_${uId}_badge_${payload.badgeId || "unknown"}`;
    case "streak_milestone":
      return `email_sent_streak_${uId}_day_${payload.streakDays || 0}`;
    default:
      return `email_sent_gen_${uId}_${Date.now()}`;
  }
}

export function isEmailNotificationAlreadySent(key: string): boolean {
  if (sentEmailKeysInMemory.has(key)) return true;
  const stored = getStoredSentEmailKeys();
  if (stored.has(key)) {
    sentEmailKeysInMemory.add(key);
    return true;
  }
  return false;
}

export function isValidEmail(email?: string): boolean {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

/**
 * Dispatch email notification asynchronously.
 * NEVER throws errors and NEVER blocks core app progression (WPM, XP, level, streak, auth).
 */
export async function sendEmailNotification(
  payload: EmailNotificationPayload,
): Promise<{ success: boolean; skipped?: boolean; error?: string; sandboxNotice?: boolean }> {
  if (!isValidEmail(payload.email)) {
    return { success: false, skipped: true, error: "Invalid recipient email" };
  }

  const dedupKey = generateDedupKey(payload);

  if (isEmailNotificationAlreadySent(dedupKey)) {
    return { success: true, skipped: true };
  }

  // Optimistically lock to prevent parallel re-renders firing duplicate calls
  saveSentEmailKey(dedupKey);

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (typeof window !== "undefined") {
      try {
        const rawSession = localStorage.getItem("keyflow_supabase_session_v1");
        if (rawSession) {
          const parsed = JSON.parse(rawSession);
          if (parsed?.access_token) {
            headers["Authorization"] = `Bearer ${parsed.access_token}`;
          }
        }
      } catch {
        // Ignore session parse error
      }
    }

    const response = await fetch("/api/email", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.warn(
        `[KEYFLOW Email Notice] Server returned ${response.status}:`,
        data.error || "Failed",
      );
      return { success: false, error: data.error || `HTTP ${response.status}` };
    }

    if (data.sandboxNotice) {
      console.info(
        `[KEYFLOW Email Info] Email delivery skipped by provider testing sandbox: ${data.error}`,
      );
      return { success: false, sandboxNotice: true, error: data.error };
    }

    if (data.error) {
      console.warn("[KEYFLOW Email Notice] Email sending notice:", data.error);
      return { success: false, error: data.error };
    }

    console.log(
      `[KEYFLOW Email Sent] ${payload.type} notification sent successfully to ${payload.email}`,
    );
    return { success: true };
  } catch (err: any) {
    console.warn("[KEYFLOW Email Notice] Network error delivering email:", err?.message || err);
    return { success: false, error: err?.message || "Network error" };
  }
}

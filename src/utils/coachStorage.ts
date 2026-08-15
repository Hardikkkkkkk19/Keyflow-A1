import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { ChatMessage } from "./coachApiClient";

const LOCAL_STORAGE_PREFIX = "keyflow_coach_chat_";

export async function loadCoachHistory(userId: string): Promise<ChatMessage[]> {
  if (!userId) return [];

  // Try loading from LocalStorage first for instant UI response
  const localKey = LOCAL_STORAGE_PREFIX + userId;
  const localData = localStorage.getItem(localKey);
  let localMessages: ChatMessage[] = [];

  if (localData) {
    try {
      localMessages = JSON.parse(localData);
    } catch (e) {
      console.warn("Error parsing local coach messages:", e);
    }
  }

  // Try fetching from Supabase if configured
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("coach_conversations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        const dbMessages: ChatMessage[] = data.map((item) => ({
          id: item.id,
          role: item.role as "user" | "assistant",
          content: item.content,
          createdAt: item.created_at,
        }));

        // Update LocalStorage cache
        localStorage.setItem(localKey, JSON.stringify(dbMessages));
        return dbMessages;
      }
    } catch (e) {
      console.warn("Supabase coach conversation fetch error:", e);
    }
  }

  return localMessages;
}

export async function saveCoachMessage(userId: string, message: ChatMessage): Promise<void> {
  if (!userId) return;

  const localKey = LOCAL_STORAGE_PREFIX + userId;
  const existingMessages = await loadCoachHistory(userId);
  const updatedMessages = [...existingMessages, message];

  // Save to LocalStorage
  localStorage.setItem(localKey, JSON.stringify(updatedMessages));

  // Save to Supabase if configured
  if (isSupabaseConfigured) {
    try {
      await supabase.from("coach_conversations").insert({
        id: message.id,
        user_id: userId,
        role: message.role,
        content: message.content,
        created_at: message.createdAt || new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Supabase coach conversation save error:", e);
    }
  }
}

export async function clearCoachHistory(userId: string): Promise<void> {
  if (!userId) return;

  const localKey = LOCAL_STORAGE_PREFIX + userId;
  localStorage.removeItem(localKey);

  if (isSupabaseConfigured) {
    try {
      await supabase.from("coach_conversations").delete().eq("user_id", userId);
    } catch (e) {
      console.warn("Supabase coach conversation clear error:", e);
    }
  }
}

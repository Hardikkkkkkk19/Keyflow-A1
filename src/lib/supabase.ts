import { createClient } from "@supabase/supabase-js";

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || "";

// Fallback check to prevent client crash when environment variables are unconfigured
const validUrl =
  supabaseUrl && supabaseUrl.startsWith("http")
    ? supabaseUrl
    : "https://placeholder-supabase.supabase.co";

const validAnonKey = supabaseAnonKey || "placeholder-anon-key";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.startsWith("http") &&
  !supabaseUrl.includes("your-supabase-project") &&
  supabaseAnonKey &&
  !supabaseAnonKey.includes("your-supabase-anon-key"),
);

export const supabase = createClient(validUrl, validAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

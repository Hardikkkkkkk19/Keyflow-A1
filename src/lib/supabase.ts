import { createClient } from "@supabase/supabase-js";

// Safely read environment variables across Vite client/SSR and Node.js environments
const supabaseUrl: string =
  (typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.VITE_SUPABASE_URL
    : "") ||
  (typeof process !== "undefined" && process.env ? process.env.VITE_SUPABASE_URL : "") ||
  "";
const supabaseAnonKey: string =
  (typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.VITE_SUPABASE_ANON_KEY
    : "") ||
  (typeof process !== "undefined" && process.env ? process.env.VITE_SUPABASE_ANON_KEY : "") ||
  "";

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
  !supabaseUrl.includes("placeholder-supabase") &&
  supabaseAnonKey &&
  !supabaseAnonKey.includes("your-supabase-anon-key") &&
  !supabaseAnonKey.includes("placeholder-anon-key"),
);

export const supabase = createClient(validUrl, validAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

// Dedicated unauthenticated client for global public data reads (e.g. global leaderboard)
// This ensures queries use the public/anon role and are never restricted by user-specific RLS policies
export const supabasePublic = createClient(validUrl, validAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

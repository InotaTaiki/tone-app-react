// Expo only exposes env vars to the JS bundle if they're prefixed with
// EXPO_PUBLIC_ — set these in a .env file at the project root (same idea
// as the Python backend's .env, just a different prefix convention).
//
//   EXPO_PUBLIC_SUPABASE_URL=...
//   EXPO_PUBLIC_SUPABASE_ANON_KEY=...
//   EXPO_PUBLIC_API_URL=http://192.168.1.23:8000
//
// IMPORTANT — API_URL can't be "localhost" or "127.0.0.1" here. Your
// phone is a separate device on the network; it has no idea what
// "localhost" means to it. Use your computer's LAN IP instead (run
// `ipconfig getifaddr en0` on Mac, or `ipconfig` on Windows and look for
// IPv4 Address), and make sure your phone is on the same Wi-Fi network as
// your computer. When you eventually deploy the FastAPI backend
// somewhere (Render, Fly.io, etc.), swap this for that public URL.

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const isApiConfigured = Boolean(API_URL);

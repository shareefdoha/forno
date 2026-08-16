import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Whether .env has been filled in. When it hasn't, the site still renders —
 * the design, hero, story, reviews and contact form all work — and only the
 * menu shows a setup notice instead of the page dying on a white screen.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * The browser-storage stand-in in ./localBackend.js. Requires DEV, so a
 * production build can never fall back to it no matter what .env says —
 * its demo password must never be a way into a deployed site.
 */
export const isDemoBackend = import.meta.env.DEV && !isSupabaseConfigured;

export const SETUP_MESSAGE =
  'Supabase is not configured yet. Copy .env.example to .env, fill in ' +
  'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart `npm run dev`. ' +
  'See SETUP.md for the full walkthrough.';

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/** Use inside any function that actually talks to the database. */
export function requireSupabase() {
  if (!supabase) throw new Error(SETUP_MESSAGE);
  return supabase;
}

/** Name of the public Storage bucket that holds food photography. */
export const IMAGE_BUCKET = import.meta.env.VITE_SUPABASE_IMAGE_BUCKET || 'menu-images';

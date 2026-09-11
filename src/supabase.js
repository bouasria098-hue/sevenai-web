// src/supabase.js — Safe Supabase Client Setup (UMD global)

let rawUrl = 'https://dvzbkhsjvymbadnbmmfk.supabase.co';
const supabaseAnonKey = 'sb_publishable_f1xt8raz0W7DjwOzJfG_0g_-5DTFmQX';

let client = null;

try {
  // Use the UMD global loaded via <script> in index.html
  if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    client = window.supabase.createClient(rawUrl, supabaseAnonKey);
    console.log('[sevenai] Supabase client initialized');
  } else {
    console.warn('[sevenai] Supabase UMD not loaded yet — form will work without DB');
  }
} catch (err) {
  console.warn('[sevenai] Supabase init error:', err.message);
}

export const supabase = client;

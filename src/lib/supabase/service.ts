import { createClient } from "@supabase/supabase-js";

/** Server-side Supabase client for API routes (signUp, admin-style calls). */
export const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

import { createClient } from "@supabase/supabase-js";

/** Server-side Supabase Admin client for API routes (admin.createUser, admin.updateUserById, etc.). */
export const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rrysbbzgmtghjzoiioec.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_k-hU9ophAt1tJ_rNqtp0wQ_1hoOsfy_";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

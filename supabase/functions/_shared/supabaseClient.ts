import { createClient } from "npm:@supabase/supabase-js@2.38.4";

export const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL"), 
    Deno.env.get("SUPABASE_ANON_KEY")
);
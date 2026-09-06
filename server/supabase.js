const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Normalize the Supabase URL in case it has /rest/v1 appended
const rawUrl = process.env.SUPABASE_URL || "";
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").trim();

// Use SERVICE_ROLE_KEY for admin/backend queries to manage tables & storage without RLS hurdles
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Supabase credentials are missing in environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

module.exports = supabase;

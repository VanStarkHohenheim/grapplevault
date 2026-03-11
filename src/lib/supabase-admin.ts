import { createClient } from '@supabase/supabase-js';

// Client avec le service_role — SERVEUR UNIQUEMENT, jamais exposé au client
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

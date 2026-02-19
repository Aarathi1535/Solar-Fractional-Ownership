import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://auedauimefznpumwatcs.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_DM-qtQE9Qk7lfEivKrUmmQ_5z4wgCbT';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

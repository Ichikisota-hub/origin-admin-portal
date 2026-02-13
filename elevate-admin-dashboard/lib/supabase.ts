
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hdumbjxhjhuprwqvqntm.supabase.co';
const supabaseAnonKey = 'sb_publishable_3CdNV7Fc0nEAfaktL8RChg_UWAZc1qQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321') as string;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder') as string;


export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

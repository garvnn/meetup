import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (to be defined based on your schema)
export interface Meetup {
  id: string;
  title: string;
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  created_at: string;
  updated_at: string;
  token: string;
}

export interface Message {
  id: string;
  meetup_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface File {
  id: string;
  meetup_id: string;
  user_id: string;
  filename: string;
  url: string;
  created_at: string;
}

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that credentials are provided
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Type exports for database tables
export interface Game {
  id: string;
  name: string;
  category_id: string;
  created_at?: string;
}

export interface GameCategory {
  id: string;
  name: string;
  icon: string;
  created_at?: string;
  updated_at?: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  items: string[];
  current_game_id: string | null;
  current_category_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PlayerGame {
  id: string;
  player_id: string;
  game_name: string;
  category_id: string;
  score: number;
  played_at: string;
  created_at?: string;
}

export interface CustomWheel {
  id: string;
  name: string;
  icon: string;
  created_at?: string;
  updated_at?: string;
  options?: WheelOption[];
}

export interface WheelOption {
  id: string;
  wheel_id: string;
  name: string;
  icon: string;
  display_order: number;
  created_at?: string;
}

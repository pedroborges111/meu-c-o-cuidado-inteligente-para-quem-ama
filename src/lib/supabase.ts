import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Tipos do banco de dados
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface DogProfile {
  id: string;
  user_id: string;
  name: string;
  age: string;
  breed: string;
  size: 'pequeno' | 'médio' | 'grande';
  energy: 'baixo' | 'médio' | 'alto';
  gender: 'macho' | 'fêmea';
  weight: string;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyTask {
  id: string;
  user_id: string;
  dog_profile_id: string;
  label: string;
  completed: boolean;
  completed_at: string | null;
  date: string;
  created_at: string;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

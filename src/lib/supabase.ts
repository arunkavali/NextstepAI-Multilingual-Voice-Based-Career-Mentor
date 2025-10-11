import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          language: string;
          created_at: string;
          updated_at: string;
          messages: any;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title?: string;
          language?: string;
          created_at?: string;
          updated_at?: string;
          messages?: any;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          language?: string;
          created_at?: string;
          updated_at?: string;
          messages?: any;
        };
      };
      career_paths: {
        Row: {
          id: string;
          user_id: string | null;
          conversation_id: string | null;
          title: string;
          description: string;
          roadmap_data: any;
          image_url: string | null;
          pdf_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          conversation_id?: string | null;
          title: string;
          description?: string;
          roadmap_data?: any;
          image_url?: string | null;
          pdf_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          conversation_id?: string | null;
          title?: string;
          description?: string;
          roadmap_data?: any;
          image_url?: string | null;
          pdf_url?: string | null;
          created_at?: string;
        };
      };
      skills_learned: {
        Row: {
          id: string;
          user_id: string | null;
          conversation_id: string | null;
          skill_name: string;
          category: string;
          proficiency_level: string;
          resources: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          conversation_id?: string | null;
          skill_name: string;
          category?: string;
          proficiency_level?: string;
          resources?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          conversation_id?: string | null;
          skill_name?: string;
          category?: string;
          proficiency_level?: string;
          resources?: any;
          created_at?: string;
        };
      };
    };
  };
};

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Hardcode the values to avoid any env var issues during build/runtime
const supabaseUrl = 'https://vsnvtujkkkbjpuuwxvyd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbnZ0dWpra2tianB1dXd4dnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzUyNDYsImV4cCI6MjA3MTIxMTI0Nn0.GwWKrl_6zlIBvIaJs8NngoheF24nNzAfBO5_j_d1ogA';

// Create a singleton client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface Member {
  id: string;
  auth_user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  job_title?: string;
  industry?: string;
  phone_number?: string;
  linkedin_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  website_url?: string;
  profile_photo_url?: string;
  company_logo_url?: string;
  bio?: string;
  membership_type: 'individual' | 'nonprofit' | 'business';
  billing_frequency?: 'monthly' | 'annual';
  is_active: boolean;
  is_admin?: boolean;
  matching_profile?: MatchingProfile;
  created_at: string;
  updated_at?: string;
}

export interface MatchingProfile {
  targetIndustry?: string;
  targetSize?: string;
  targetBudget?: string;
  targetLocation?: string;
  primaryOffering?: string;
  valueProposition?: string;
  workStyle?: string;
  businessGoals?: string[];
  updatedAt?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  created_at: string;
  updated_at?: string;
}

export interface CollaborationPost {
  id: string;
  member_id: string;
  type: 'need' | 'offer';
  title: string;
  description: string;
  category: string;
  status: 'active' | 'closed';
  created_at: string;
}

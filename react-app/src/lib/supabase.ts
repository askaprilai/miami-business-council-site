import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vsnvtujkkkbjpuuwxvyd.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key-for-build';

// Create a singleton client - the placeholder key is only used during build
// At runtime, the real key from environment variables will be used
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

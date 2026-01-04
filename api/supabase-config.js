// Supabase configuration for Miami Business Council
// This file should be included in your Vercel environment variables

export const supabaseConfig = {
  url: process.env.SUPABASE_URL || 'https://vsnvtujkkkbjpuuwxvyd.supabase.co',
  anonKey: process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY',
  serviceKey: process.env.SUPABASE_SERVICE_KEY || 'sb_secret_aJXyfJ-CPzHri9Fd8nFgcw_kdfcoCBB'
};

// Initialize Supabase client
export function createSupabaseClient(useServiceKey = false) {
  if (typeof window !== 'undefined') {
    // Client-side - always use anon key
    return window.supabase?.createClient(supabaseConfig.url, supabaseConfig.anonKey);
  } else {
    // Server-side - use service key for admin operations or anon key for user operations
    const { createClient } = require('@supabase/supabase-js');
    const key = useServiceKey ? supabaseConfig.serviceKey : supabaseConfig.anonKey;
    return createClient(supabaseConfig.url, key);
  }
}

// Database schema reference
export const TABLES = {
  MEMBERS: 'members',
  BUSINESS_OPPORTUNITIES: 'business_opportunities', 
  CONNECTIONS: 'member_connections',
  EVENTS: 'events',
  EVENT_REGISTRATIONS: 'event_registrations'
};

/*
Recommended Supabase table schemas:

1. members table:
- id (uuid, primary key)
- email (text, unique)
- first_name (text)
- last_name (text)
- company_name (text)
- job_title (text)
- industry (text)
- linkedin_url (text)
- company_size (text)
- membership_type (text)
- created_at (timestamp)
- updated_at (timestamp)
- is_active (boolean, default true)

2. business_opportunities table:
- id (uuid, primary key)
- member_id (uuid, foreign key to members.id)
- opportunity_type (text) - 'looking_for' or 'can_offer'
- category (text) - 'Clients', 'Partnerships', etc.
- description (text, optional)
- created_at (timestamp)

3. member_connections table:
- id (uuid, primary key)
- requester_id (uuid, foreign key to members.id)
- recipient_id (uuid, foreign key to members.id)
- status (text) - 'pending', 'accepted', 'declined'
- message (text, optional)
- created_at (timestamp)
- updated_at (timestamp)

4. events table:
- id (uuid, primary key)
- title (text)
- description (text)
- event_date (timestamp)
- location (text)
- max_attendees (integer)
- luma_event_id (text, optional)
- created_at (timestamp)

5. event_registrations table:
- id (uuid, primary key)
- event_id (uuid, foreign key to events.id)
- member_id (uuid, foreign key to members.id)
- registration_status (text) - 'registered', 'attended', 'cancelled'
- created_at (timestamp)
*/
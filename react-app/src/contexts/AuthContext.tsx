'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Member } from '@/lib/supabase';

const SUPABASE_URL = 'https://vsnvtujkkkbjpuuwxvyd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbnZ0dWpra2tianB1dXd4dnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzUyNDYsImV4cCI6MjA3MTIxMTI0Nn0.GwWKrl_6zlIBvIaJs8NngoheF24nNzAfBO5_j_d1ogA';

interface AuthContextType {
  user: User | null;
  member: Member | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshMember: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Use REST API instead of Supabase client to avoid hanging
  const fetchMember = async (userId: string, userEmail?: string): Promise<Member | null> => {
    console.log('Fetching member for userId:', userId, 'email:', userEmail);

    try {
      if (userEmail) {
        console.log('Querying by email via REST...');
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/members?email=eq.${encodeURIComponent(userEmail.toLowerCase())}&limit=1`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
            },
          }
        );
        const data = await response.json();

        console.log('REST query result:', data);

        if (data && data.length > 0) {
          console.log('Found member:', data[0].email);
          setMember(data[0] as Member);
          return data[0] as Member;
        }
      }

      console.log('No member found');
      setMember(null);
      return null;
    } catch (error) {
      console.error('Error fetching member:', error);
      setMember(null);
      return null;
    }
  };

  const refreshMember = async () => {
    if (user) {
      await fetchMember(user.id, user.email || undefined);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Force loading to false after 5 seconds as a safety net
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.log('Auth timeout - forcing loading to false');
        setLoading(false);
      }
    }, 5000);

    const initAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          if (mounted) setLoading(false);
          return;
        }

        if (!mounted) return;

        console.log('Session:', session ? `found for ${session.user?.email}` : 'none');
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchMember(session.user.id, session.user.email || undefined);
        }

        if (mounted) setLoading(false);
      } catch (error) {
        console.error('Auth init error:', error);
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchMember(session.user.id, session.user.email || undefined);
        } else {
          setMember(null);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMember(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, member, session, loading, signOut, refreshMember }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Direct REST API helper - bypasses Supabase client issues
const SUPABASE_URL = 'https://vsnvtujkkkbjpuuwxvyd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbnZ0dWpra2tianB1dXd4dnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzUyNDYsImV4cCI6MjA3MTIxMTI0Nn0.GwWKrl_6zlIBvIaJs8NngoheF24nNzAfBO5_j_d1ogA';

export async function fetchFromSupabase(table: string, query: string = '') {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}${query}`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    }
  );
  return response.json();
}

export async function insertToSupabase(table: string, data: any) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}`,
    {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(data),
    }
  );
  return response.json();
}

export async function updateSupabase(table: string, query: string, data: any) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}${query}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(data),
    }
  );
  return response.json();
}

export function getSessionEmail(): string | null {
  if (typeof window === 'undefined') return null;
  const storageKey = 'sb-vsnvtujkkkbjpuuwxvyd-auth-token';
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed?.user?.email || null;
    } catch {
      return null;
    }
  }
  return null;
}

export async function getCurrentMember() {
  const email = getSessionEmail();
  if (!email) return null;

  const data = await fetchFromSupabase('members', `?email=eq.${encodeURIComponent(email.toLowerCase())}&limit=1`);
  return data && data.length > 0 ? data[0] : null;
}

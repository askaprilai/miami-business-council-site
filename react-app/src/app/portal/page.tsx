'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const SUPABASE_URL = 'https://vsnvtujkkkbjpuuwxvyd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbnZ0dWpra2tianB1dXd4dnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzUyNDYsImV4cCI6MjA3MTIxMTI0Nn0.GwWKrl_6zlIBvIaJs8NngoheF24nNzAfBO5_j_d1ogA';
const STORAGE_KEY = 'sb-vsnvtujkkkbjpuuwxvyd-auth-token';

// Helper to make REST API calls with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export default function PortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState('smart-matches');
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      // Check localStorage for session
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        router.push('/member-login');
        return;
      }

      const parsed = JSON.parse(stored);
      const email = parsed?.user?.email;

      if (!email) {
        router.push('/member-login');
        return;
      }

      // Check if token is expired
      const expiresAt = parsed?.expires_at;
      if (expiresAt && Date.now() / 1000 > expiresAt) {
        localStorage.removeItem(STORAGE_KEY);
        router.push('/member-login');
        return;
      }

      setUser(parsed.user);

      // Fetch member with timeout
      const memberRes = await fetchWithTimeout(
        `${SUPABASE_URL}/rest/v1/members?email=eq.${encodeURIComponent(email.toLowerCase())}&limit=1`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Accept': 'application/json',
          },
          cache: 'no-store',
        }
      );

      if (!memberRes.ok) {
        throw new Error(`Failed to fetch member: ${memberRes.status}`);
      }

      const memberData = await memberRes.json();

      if (memberData && memberData.length > 0) {
        setMember(memberData[0]);
      }
    } catch (e) {
      console.error('Auth error:', e);
      setError('Failed to load your profile. Please try refreshing the page.');
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loadSmartMatches = useCallback(async () => {
    if (!member) return;

    setDataLoading(true);
    setError(null);

    try {
      const res = await fetchWithTimeout(
        `${SUPABASE_URL}/rest/v1/members?is_active=eq.true&select=id,first_name,last_name,company_name,job_title,industry,profile_photo_url`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Accept': 'application/json',
          },
          cache: 'no-store',
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch members: ${res.status}`);
      }

      const data = await res.json();
      const filtered = (data || []).filter((m: any) => m.id !== member?.id);
      setMembers(filtered);
    } catch (e) {
      console.error('Error loading members:', e);
      setError('Failed to load Smart Matches. Please try again.');
    }
    setDataLoading(false);
  }, [member]);

  useEffect(() => {
    if (member && activeSection === 'smart-matches') {
      loadSmartMatches();
    }
  }, [member, activeSection, loadSmartMatches]);

  const signOut = () => {
    localStorage.removeItem('sb-vsnvtujkkkbjpuuwxvyd-auth-token');
    router.push('/member-login');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading portal...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className={styles.loadingContainer}>
        <h2>Account Not Found</h2>
        <p>Please contact support or <a href="/membership">join as a member</a>.</p>
      </div>
    );
  }

  return (
    <div className={styles.portal}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoText}>MBC</span>
          <span>Member Portal</span>
        </div>
        <button onClick={signOut} className={styles.signOutBtn}>Sign Out</button>
      </header>

      <div className={styles.container}>
        {/* Sidebar */}
        <nav className={styles.sidebar}>
          <button
            className={`${styles.navItem} ${activeSection === 'dashboard' ? styles.active : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`${styles.navItem} ${activeSection === 'smart-matches' ? styles.active : ''}`}
            onClick={() => setActiveSection('smart-matches')}
          >
            🎯 Smart Matches
          </button>
          <button
            className={`${styles.navItem} ${activeSection === 'directory' ? styles.active : ''}`}
            onClick={() => setActiveSection('directory')}
          >
            👥 Directory
          </button>
          <button
            className={`${styles.navItem} ${activeSection === 'profile' ? styles.active : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            👤 Profile
          </button>
        </nav>

        {/* Main Content */}
        <main className={styles.main}>
          {activeSection === 'smart-matches' && (
            <div>
              <h1 className={styles.pageTitle}>🎯 Smart Matches</h1>
              <p className={styles.subtitle}>Connect with fellow members</p>

              {/* Stats */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <h3>Total Matches</h3>
                  <p className={styles.statValue}>{members.length}</p>
                </div>
                <div className={styles.statCard}>
                  <h3>Your Profile</h3>
                  <p className={styles.statValue}>{member?.first_name} {member?.last_name}</p>
                </div>
              </div>

              {/* Members Grid */}
              {error && (
                <div className={styles.errorBox}>
                  <p>{error}</p>
                  <button onClick={loadSmartMatches} className={styles.retryBtn}>
                    Try Again
                  </button>
                </div>
              )}
              {dataLoading ? (
                <div className={styles.loadingInline}>
                  <div className={styles.spinner}></div>
                  <p>Loading matches...</p>
                </div>
              ) : (
                <div className={styles.matchGrid}>
                  {members.length === 0 && !error && (
                    <p className={styles.noResults}>No matches found yet. Check back soon!</p>
                  )}
                  {members.map((m) => (
                    <div key={m.id} className={styles.matchCard}>
                      <div className={styles.matchAvatar}>
                        {m.profile_photo_url ? (
                          <img src={m.profile_photo_url} alt="" />
                        ) : (
                          <span>{m.first_name?.[0]}{m.last_name?.[0]}</span>
                        )}
                      </div>
                      <h3>{m.first_name} {m.last_name}</h3>
                      <p>{m.job_title || 'Member'}</p>
                      {m.company_name && <p className={styles.company}>{m.company_name}</p>}
                      {m.industry && <span className={styles.industry}>{m.industry}</span>}
                      <button className={styles.connectBtn}>Connect</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'dashboard' && (
            <div>
              <h1 className={styles.pageTitle}>📊 Dashboard</h1>
              <p>Welcome back, {member?.first_name}!</p>
            </div>
          )}

          {activeSection === 'directory' && (
            <div>
              <h1 className={styles.pageTitle}>👥 Member Directory</h1>
              <p>Browse all members</p>
            </div>
          )}

          {activeSection === 'profile' && (
            <div>
              <h1 className={styles.pageTitle}>👤 Your Profile</h1>
              <p>Email: {member?.email}</p>
              <p>Company: {member?.company_name}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

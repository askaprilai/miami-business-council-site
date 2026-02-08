'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const SUPABASE_URL = 'https://vsnvtujkkkbjpuuwxvyd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbnZ0dWpra2tianB1dXd4dnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzUyNDYsImV4cCI6MjA3MTIxMTI0Nn0.GwWKrl_6zlIBvIaJs8NngoheF24nNzAfBO5_j_d1ogA';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState('smart-matches');
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Check localStorage for session
    const storageKey = 'sb-vsnvtujkkkbjpuuwxvyd-auth-token';
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      router.push('/member-login');
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      const email = parsed?.user?.email;

      if (!email) {
        router.push('/member-login');
        return;
      }

      setUser(parsed.user);

      // Fetch member
      const memberRes = await fetch(
        `${SUPABASE_URL}/rest/v1/members?email=eq.${encodeURIComponent(email.toLowerCase())}&limit=1`,
        { headers: { 'apikey': SUPABASE_KEY } }
      );
      const memberData = await memberRes.json();

      if (memberData && memberData.length > 0) {
        setMember(memberData[0]);
      }
    } catch (e) {
      console.error('Auth error:', e);
    }

    setLoading(false);
  };

  const loadSmartMatches = async () => {
    setDataLoading(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/members?is_active=eq.true&select=id,first_name,last_name,company_name,job_title,industry,profile_photo_url`,
        { headers: { 'apikey': SUPABASE_KEY } }
      );
      const data = await res.json();
      const filtered = (data || []).filter((m: any) => m.id !== member?.id);
      setMembers(filtered);
    } catch (e) {
      console.error('Error loading members:', e);
    }
    setDataLoading(false);
  };

  useEffect(() => {
    if (member && activeSection === 'smart-matches') {
      loadSmartMatches();
    }
  }, [member, activeSection]);

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
              {dataLoading ? (
                <p>Loading matches...</p>
              ) : (
                <div className={styles.matchGrid}>
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

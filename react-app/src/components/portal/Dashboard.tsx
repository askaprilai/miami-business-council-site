'use client';

import { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';

interface DashboardStats {
  connections: number;
  pendingConnections: number;
  unreadMessages: number;
  matchScore: number;
}

const SUPABASE_URL = 'https://vsnvtujkkkbjpuuwxvyd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbnZ0dWpra2tianB1dXd4dnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzUyNDYsImV4cCI6MjA3MTIxMTI0Nn0.GwWKrl_6zlIBvIaJs8NngoheF24nNzAfBO5_j_d1ogA';

export default function Dashboard() {
  const [member, setMember] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    connections: 0,
    pendingConnections: 0,
    unreadMessages: 0,
    matchScore: 0,
  });
  const [communityUpdates, setCommunityUpdates] = useState<any[]>([]);
  const [newMembers, setNewMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get session from localStorage
        const storageKey = 'sb-vsnvtujkkkbjpuuwxvyd-auth-token';
        const stored = localStorage.getItem(storageKey);
        let email = '';

        if (stored) {
          const parsed = JSON.parse(stored);
          email = parsed?.user?.email || '';
        }

        if (!email) {
          setLoading(false);
          return;
        }

        // Fetch member, collaboration posts, and new members in parallel
        const [memberRes, needsRes, membersRes] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/members?email=eq.${encodeURIComponent(email.toLowerCase())}&limit=1`, {
            headers: { 'apikey': SUPABASE_KEY },
          }),
          fetch(`${SUPABASE_URL}/rest/v1/member_needs?order=created_at.desc&limit=5`, {
            headers: { 'apikey': SUPABASE_KEY },
          }),
          fetch(`${SUPABASE_URL}/rest/v1/members?order=created_at.desc&limit=5`, {
            headers: { 'apikey': SUPABASE_KEY },
          }),
        ]);

        const [memberData, needsData, membersData] = await Promise.all([
          memberRes.json(),
          needsRes.json(),
          membersRes.json(),
        ]);

        if (memberData && memberData.length > 0) {
          const m = memberData[0];
          setMember(m);

          // Calculate profile completion
          const profileFields = [m.first_name, m.last_name, m.company_name, m.job_title, m.industry, m.bio, m.profile_photo_url, m.linkedin_url];
          const completedFields = profileFields.filter(Boolean).length;
          const matchScore = Math.round((completedFields / profileFields.length) * 100);

          setStats({
            connections: 0,
            pendingConnections: 0,
            unreadMessages: 0,
            matchScore,
          });
        }

        // Set community updates (collaboration posts)
        if (needsData && Array.isArray(needsData)) {
          setCommunityUpdates(needsData);
        }

        // Set new members
        if (membersData && Array.isArray(membersData)) {
          setNewMembers(membersData);
        }
      } catch (e) {
        console.error('Dashboard fetch error:', e);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcome}>
        <h1 className={styles.greeting}>
          {getGreeting()}, {member?.first_name || 'Member'}!
        </h1>
        <p className={styles.welcomeText}>
          Welcome to your Miami Business Council member portal.
        </p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🤝</div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{stats.connections}</span>
            <span className={styles.statLabel}>Connections</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏳</div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{stats.pendingConnections}</span>
            <span className={styles.statLabel}>Pending Requests</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>💬</div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{stats.unreadMessages}</span>
            <span className={styles.statLabel}>Unread Messages</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎯</div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{stats.matchScore}%</span>
            <span className={styles.statLabel}>Profile Complete</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.quickActions}>
          <button className={styles.actionCard}>
            <span className={styles.actionIcon}>🎯</span>
            <span className={styles.actionLabel}>Find Smart Matches</span>
          </button>
          <button className={styles.actionCard}>
            <span className={styles.actionIcon}>👥</span>
            <span className={styles.actionLabel}>Browse Directory</span>
          </button>
          <button className={styles.actionCard}>
            <span className={styles.actionIcon}>📅</span>
            <span className={styles.actionLabel}>View Events</span>
          </button>
          <button className={styles.actionCard}>
            <span className={styles.actionIcon}>⚙️</span>
            <span className={styles.actionLabel}>Edit Profile</span>
          </button>
        </div>
      </div>

      {stats.matchScore < 100 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Complete Your Profile</h2>
          <div className={styles.profileCompletion}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${stats.matchScore}%` }}></div>
            </div>
            <p className={styles.completionText}>
              Your profile is {stats.matchScore}% complete.
            </p>
          </div>
        </div>
      )}

      {/* Community Updates */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Community Updates</h2>
        <div className={styles.updatesList}>
          {communityUpdates.length > 0 ? (
            communityUpdates.map((update) => (
              <div key={update.id} className={styles.updateItem}>
                <span className={styles.updateIcon}>📢</span>
                <div className={styles.updateContent}>
                  <h4>{update.title}</h4>
                  <p>{update.description?.substring(0, 100)}...</p>
                  <span className={styles.updateDate}>
                    {new Date(update.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noUpdates}>No recent community updates</p>
          )}
        </div>
      </div>

      {/* New Members */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>New Members</h2>
        <div className={styles.newMembersList}>
          {newMembers.length > 0 ? (
            newMembers.map((m) => (
              <div key={m.id} className={styles.newMemberItem}>
                <div className={styles.newMemberAvatar}>
                  {m.profile_photo_url ? (
                    <img src={m.profile_photo_url} alt={m.first_name} />
                  ) : (
                    <span>{m.first_name?.[0]}{m.last_name?.[0]}</span>
                  )}
                </div>
                <div className={styles.newMemberInfo}>
                  <h4>{m.first_name} {m.last_name}</h4>
                  <p>{m.company_name || m.job_title}</p>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noUpdates}>No new members recently</p>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Your Membership</h2>
        <div className={styles.memberCard}>
          <div className={styles.memberInfo}>
            <div className={styles.memberAvatar}>
              {member?.profile_photo_url ? (
                <img src={member.profile_photo_url} alt={member.first_name} />
              ) : (
                <span>{member?.first_name?.[0]}{member?.last_name?.[0]}</span>
              )}
            </div>
            <div className={styles.memberDetails}>
              <h3>{member?.first_name} {member?.last_name}</h3>
              <p>{member?.job_title} {member?.company_name && `at ${member.company_name}`}</p>
              <span className={styles.membershipType}>{member?.membership_type} Member</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

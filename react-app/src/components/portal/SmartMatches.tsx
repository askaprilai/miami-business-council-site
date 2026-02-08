'use client';

import { useState, useEffect } from 'react';
import styles from './SmartMatches.module.css';

const SUPABASE_URL = 'https://vsnvtujkkkbjpuuwxvyd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbnZ0dWpra2tianB1dXd4dnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzUyNDYsImV4cCI6MjA3MTIxMTI0Nn0.GwWKrl_6zlIBvIaJs8NngoheF24nNzAfBO5_j_d1ogA';

interface SmartMatchesProps {
  member?: any;
}

export default function SmartMatches({ member }: SmartMatchesProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        console.log('SmartMatches: Fetching members, current member:', member?.email);

        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/members?is_active=eq.true&select=id,first_name,last_name,company_name,job_title,industry,profile_photo_url,bio,linkedin_url`,
          { headers: { 'apikey': SUPABASE_KEY } }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch members');
        }

        const data = await response.json();
        console.log('SmartMatches: Got', data?.length, 'members');

        // Filter out current member and calculate basic scores
        const otherMembers = (data || [])
          .filter((m: any) => m.id !== member?.id)
          .map((m: any) => ({
            ...m,
            score: calculateScore(member, m),
          }))
          .sort((a: any, b: any) => b.score - a.score);

        setMembers(otherMembers);
      } catch (err: any) {
        console.error('SmartMatches: Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Small delay to ensure component is mounted
    const timer = setTimeout(fetchMembers, 100);
    return () => clearTimeout(timer);
  }, [member?.id]);

  const calculateScore = (currentMember: any, otherMember: any) => {
    if (!currentMember) return 20;
    let score = 20; // Base score

    // Same industry
    if (otherMember.industry && currentMember.industry &&
        otherMember.industry === currentMember.industry) {
      score += 30;
    }

    // Has profile photo
    if (otherMember.profile_photo_url) score += 10;

    // Has bio
    if (otherMember.bio) score += 15;

    // Has LinkedIn
    if (otherMember.linkedin_url) score += 10;

    // Has company
    if (otherMember.company_name) score += 15;

    return Math.min(score, 100);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Finding your best matches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.noMatches}>
        <h3>Error loading matches</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className={styles.connectBtn}>
          Try Again
        </button>
      </div>
    );
  }

  const highPriority = members.filter(m => m.score >= 70).length;
  const avgScore = members.length > 0
    ? Math.round(members.reduce((sum, m) => sum + m.score, 0) / members.length)
    : 0;

  return (
    <div className={styles.smartMatches}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Smart Matches</h1>
          <p className={styles.subtitle}>
            Connect with fellow members based on shared interests and goals
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsRow}>
        <div className={styles.statsCard}>
          <div className={styles.statsCardHeader}>
            <h3>Match Statistics</h3>
            <span className={styles.statsIcon}>📊</span>
          </div>
          <div className={styles.statsContent}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total Matches:</span>
              <span className={styles.statValue}>{members.length}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>High Priority:</span>
              <span className={styles.statValue}>{highPriority}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Avg Score:</span>
              <span className={styles.statValue}>{avgScore}%</span>
            </div>
          </div>
        </div>

        <div className={styles.statsCard}>
          <div className={styles.statsCardHeader}>
            <h3>Quick Actions</h3>
            <span className={styles.statsIcon}>⚡</span>
          </div>
          <div className={styles.quickActions}>
            <button className={styles.actionLink} onClick={() => window.location.reload()}>
              🔄 Refresh Matches
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className={styles.resultsCount}>
        Showing {members.length} potential matches
      </div>

      {members.length === 0 ? (
        <div className={styles.noMatches}>
          <span className={styles.noMatchIcon}>🎯</span>
          <h3>No matches found</h3>
          <p>Check back soon as more members join!</p>
        </div>
      ) : (
        <div className={styles.matchesGrid}>
          {members.map((m) => (
            <div key={m.id} className={styles.matchCard}>
              <div className={styles.matchScore}>
                <span className={styles.scoreValue}>{m.score}%</span>
                <span className={styles.scoreLabel}>Match</span>
              </div>

              {m.score >= 70 && (
                <span className={styles.priorityBadge}>High Priority</span>
              )}

              <div className={styles.matchHeader}>
                <div className={styles.avatar}>
                  {m.profile_photo_url ? (
                    <img src={m.profile_photo_url} alt={m.first_name} />
                  ) : (
                    <span>{m.first_name?.[0]}{m.last_name?.[0]}</span>
                  )}
                </div>
                <div className={styles.matchInfo}>
                  <h3>{m.first_name} {m.last_name}</h3>
                  <p>{m.job_title || 'Member'}</p>
                  {m.company_name && (
                    <span className={styles.company}>{m.company_name}</span>
                  )}
                </div>
              </div>

              {m.industry && (
                <span className={styles.industry}>{m.industry}</span>
              )}

              <button className={styles.connectBtn}>
                Connect
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

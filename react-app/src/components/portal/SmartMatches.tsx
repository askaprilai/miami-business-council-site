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
  const [status, setStatus] = useState('Loading matches...');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setStatus('Fetching members...');

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/members?is_active=eq.true&select=id,first_name,last_name,company_name,job_title,industry,profile_photo_url`,
        {
          headers: { 'apikey': SUPABASE_KEY },
        }
      );

      if (!response.ok) {
        setStatus(`Error: ${response.status}`);
        return;
      }

      const data = await response.json();
      setStatus(`Found ${data?.length || 0} members`);

      const filtered = (data || [])
        .filter((m: any) => m.id !== member?.id)
        .slice(0, 20);

      setMembers(filtered);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className={styles.smartMatches}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Smart Matches</h1>
          <p className={styles.subtitle}>
            Connect with fellow members - Status: {status}
          </p>
        </div>
      </div>

      {/* Stats */}
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
          </div>
        </div>

        <div className={styles.statsCard}>
          <div className={styles.statsCardHeader}>
            <h3>Quick Actions</h3>
            <span className={styles.statsIcon}>⚡</span>
          </div>
          <div className={styles.quickActions}>
            <button className={styles.actionLink} onClick={fetchMembers}>
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
          <h3>{status.includes('Error') ? 'Error Loading' : 'Loading...'}</h3>
          <p>{status}</p>
          <button onClick={fetchMembers} className={styles.connectBtn} style={{marginTop: '1rem'}}>
            Try Again
          </button>
        </div>
      ) : (
        <div className={styles.matchesGrid}>
          {members.map((m) => (
            <div key={m.id} className={styles.matchCard}>
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

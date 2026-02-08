'use client';

import { useState, useEffect } from 'react';
import styles from './SmartMatches.module.css';

const SUPABASE_URL = 'https://vsnvtujkkkbjpuuwxvyd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbnZ0dWpra2tianB1dXd4dnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzUyNDYsImV4cCI6MjA3MTIxMTI0Nn0.GwWKrl_6zlIBvIaJs8NngoheF24nNzAfBO5_j_d1ogA';

interface MatchResult {
  member: any;
  score: number;
  reasons: string[];
  isHighPriority: boolean;
  isNewThisWeek: boolean;
}

interface MatchStats {
  totalMatches: number;
  highPriorityMatches: number;
  newThisWeek: number;
  averageScore: number;
  mutualInterestMatches: number;
  profileCompletion: number;
}

interface Filters {
  matchType: string;
  industry: string;
  matchScore: string;
  availability: string;
}

// Get member email from localStorage
function getMemberEmail(): string | null {
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

export default function SmartMatches() {
  const [currentMember, setCurrentMember] = useState<any>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MatchStats>({
    totalMatches: 0,
    highPriorityMatches: 0,
    newThisWeek: 0,
    averageScore: 0,
    mutualInterestMatches: 0,
    profileCompletion: 0,
  });
  const [filters, setFilters] = useState<Filters>({
    matchType: '',
    industry: '',
    matchScore: '',
    availability: '',
  });
  const [industries, setIndustries] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, matches]);

  const loadData = async () => {
    try {
      // Fetch current member using REST API
      const email = getMemberEmail();
      console.log('SmartMatches: Got email from storage:', email);

      let member = null;
      if (email) {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/members?email=eq.${encodeURIComponent(email.toLowerCase())}&limit=1`,
          { headers: { 'apikey': SUPABASE_KEY } }
        );
        const data = await res.json();
        member = data && data.length > 0 ? data[0] : null;
      }

      console.log('SmartMatches: Found member:', member?.email);

      if (!member) {
        console.log('SmartMatches: No member found, showing empty state');
        setLoading(false);
        return;
      }
      setCurrentMember(member);

      // Calculate profile completion
      const profileFields = [
        member.first_name, member.last_name, member.company_name,
        member.job_title, member.industry, member.bio,
        member.profile_photo_url, member.linkedin_url
      ];
      const completedFields = profileFields.filter(Boolean).length;
      const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

      // Fetch all active members using REST API
      const membersRes = await fetch(
        `${SUPABASE_URL}/rest/v1/members?is_active=eq.true`,
        { headers: { 'apikey': SUPABASE_KEY } }
      );
      const membersData = await membersRes.json();
      console.log('SmartMatches: Fetched', membersData?.length, 'members');
      const otherMembers = (membersData || []).filter((m: any) => m.id !== member.id);

      // Get unique industries for filter
      const uniqueIndustries = [...new Set(otherMembers.map((m: any) => m.industry).filter(Boolean))] as string[];
      setIndustries(uniqueIndustries.sort());

      // Calculate matches
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const matchResults: MatchResult[] = [];
      let mutualCount = 0;

      otherMembers.forEach((m: any) => {
        const { score, reasons, isMutual } = calculateMatchScore(member, m);
        if (score > 0) {
          const isNewThisWeek = m.created_at && new Date(m.created_at) > oneWeekAgo;
          const isHighPriority = score >= 70;

          if (isMutual) mutualCount++;

          matchResults.push({
            member: m,
            score,
            reasons,
            isHighPriority,
            isNewThisWeek,
          });
        }
      });

      // Sort by score
      matchResults.sort((a, b) => b.score - a.score);
      setMatches(matchResults);
      setFilteredMatches(matchResults);

      // Calculate stats
      const totalMatches = matchResults.length;
      const highPriorityMatches = matchResults.filter(m => m.isHighPriority).length;
      const newThisWeek = matchResults.filter(m => m.isNewThisWeek).length;
      const averageScore = totalMatches > 0
        ? Math.round(matchResults.reduce((sum, m) => sum + m.score, 0) / totalMatches)
        : 0;

      setStats({
        totalMatches,
        highPriorityMatches,
        newThisWeek,
        averageScore,
        mutualInterestMatches: mutualCount,
        profileCompletion,
      });
    } catch (e) {
      console.error('Error loading smart matches:', e);
    }
    setLoading(false);
  };

  const calculateMatchScore = (currentMember: any, otherMember: any) => {
    const reasons: string[] = [];
    let score = 0;
    let isMutual = false;

    // Industry match
    if (otherMember.industry && currentMember.industry) {
      if (otherMember.industry === currentMember.industry) {
        score += 25;
        reasons.push(`Same industry: ${otherMember.industry}`);
      }
    }

    // Has matching profile preferences
    if (otherMember.matching_profile && currentMember.matching_profile) {
      // Check mutual interest
      if (otherMember.matching_profile.targetIndustry === currentMember.industry ||
          currentMember.matching_profile.targetIndustry === otherMember.industry) {
        score += 20;
        isMutual = true;
        reasons.push('Mutual business interest');
      }

      // Work style compatibility
      if (currentMember.matching_profile.workStyle &&
          otherMember.matching_profile.workStyle === currentMember.matching_profile.workStyle) {
        score += 15;
        reasons.push('Compatible work style');
      }

      // Business goals overlap
      if (currentMember.matching_profile.businessGoals && otherMember.matching_profile.businessGoals) {
        const overlap = currentMember.matching_profile.businessGoals.filter((g: string) =>
          otherMember.matching_profile?.businessGoals?.includes(g)
        );
        if (overlap.length > 0) {
          score += overlap.length * 10;
          reasons.push(`Shared goals: ${overlap.join(', ')}`);
        }
      }
    }

    // Profile completeness bonus
    if (otherMember.bio) {
      score += 10;
    }
    if (otherMember.linkedin_url) {
      score += 5;
      reasons.push('Has LinkedIn profile');
    }
    if (otherMember.profile_photo_url) {
      score += 5;
    }

    // Cap at 100
    return { score: Math.min(score, 100), reasons, isMutual };
  };

  const applyFilters = () => {
    let result = [...matches];

    if (filters.matchType === 'high-priority') {
      result = result.filter(m => m.isHighPriority);
    } else if (filters.matchType === 'mutual') {
      result = result.filter(m => m.reasons.some(r => r.includes('Mutual')));
    } else if (filters.matchType === 'new') {
      result = result.filter(m => m.isNewThisWeek);
    }

    if (filters.industry) {
      result = result.filter(m => m.member.industry === filters.industry);
    }

    if (filters.matchScore === '90+') {
      result = result.filter(m => m.score >= 90);
    } else if (filters.matchScore === '70-89') {
      result = result.filter(m => m.score >= 70 && m.score < 90);
    } else if (filters.matchScore === '50-69') {
      result = result.filter(m => m.score >= 50 && m.score < 70);
    }

    setFilteredMatches(result);
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const refreshMatches = () => {
    setLoading(true);
    loadData();
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Finding your best matches...</p>
      </div>
    );
  }

  return (
    <div className={styles.smartMatches}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Smart Matches</h1>
          <p className={styles.subtitle}>
            AI-powered connections based on your ideal client profile and business goals
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
              <span className={styles.statLabel}>Total Matches Found:</span>
              <span className={styles.statValue}>{stats.totalMatches}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>High-Priority Matches:</span>
              <span className={styles.statValue}>{stats.highPriorityMatches}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>New This Week:</span>
              <span className={styles.statValue}>{stats.newThisWeek}</span>
            </div>
          </div>
        </div>

        <div className={styles.statsCard}>
          <div className={styles.statsCardHeader}>
            <h3>Match Quality</h3>
            <span className={styles.statsIcon}>⭐</span>
          </div>
          <div className={styles.statsContent}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Average Match Score:</span>
              <span className={styles.statValue}>{stats.averageScore}%</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Mutual Interest Matches:</span>
              <span className={styles.statValue}>{stats.mutualInterestMatches}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Your Profile Completion:</span>
              <span className={styles.statValue}>{stats.profileCompletion}%</span>
            </div>
          </div>
          {stats.profileCompletion < 100 && (
            <button className={styles.completeProfileBtn}>Complete Profile</button>
          )}
        </div>

        <div className={styles.statsCard}>
          <div className={styles.statsCardHeader}>
            <h3>Quick Actions</h3>
            <span className={styles.statsIcon}>⚡</span>
          </div>
          <div className={styles.quickActions}>
            <button className={styles.actionLink} onClick={refreshMatches}>
              🔄 Refresh Matches
            </button>
            <button className={styles.actionLink}>
              📋 Export Match List
            </button>
            <button className={styles.actionLink}>
              🔔 Weekly Match Alerts
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersSection}>
        <h3 className={styles.filterTitle}>🔍 Filter Your Matches</h3>
        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label>Match Type:</label>
            <select
              value={filters.matchType}
              onChange={(e) => handleFilterChange('matchType', e.target.value)}
            >
              <option value="">All Matches</option>
              <option value="high-priority">High Priority</option>
              <option value="mutual">Mutual Interest</option>
              <option value="new">New This Week</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Industry:</label>
            <select
              value={filters.industry}
              onChange={(e) => handleFilterChange('industry', e.target.value)}
            >
              <option value="">All Industries</option>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Match Score:</label>
            <select
              value={filters.matchScore}
              onChange={(e) => handleFilterChange('matchScore', e.target.value)}
            >
              <option value="">Any Score</option>
              <option value="90+">90%+</option>
              <option value="70-89">70-89%</option>
              <option value="50-69">50-69%</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Availability:</label>
            <select
              value={filters.availability}
              onChange={(e) => handleFilterChange('availability', e.target.value)}
            >
              <option value="">All Members</option>
              <option value="available">Available Now</option>
              <option value="busy">Currently Busy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className={styles.resultsCount}>
        Showing {filteredMatches.length} of {matches.length} matches
      </div>

      {filteredMatches.length === 0 ? (
        <div className={styles.noMatches}>
          <span className={styles.noMatchIcon}>🎯</span>
          <h3>No matches found</h3>
          <p>Try adjusting your filters or complete your profile to get better matches.</p>
        </div>
      ) : (
        <div className={styles.matchesGrid}>
          {filteredMatches.map((match) => (
            <div key={match.member.id} className={styles.matchCard}>
              <div className={styles.matchScore}>
                <span className={styles.scoreValue}>{match.score}%</span>
                <span className={styles.scoreLabel}>Match</span>
              </div>

              {match.isHighPriority && (
                <span className={styles.priorityBadge}>High Priority</span>
              )}
              {match.isNewThisWeek && (
                <span className={styles.newBadge}>New</span>
              )}

              <div className={styles.matchHeader}>
                <div className={styles.avatar}>
                  {match.member.profile_photo_url ? (
                    <img src={match.member.profile_photo_url} alt={match.member.first_name} />
                  ) : (
                    <span>{match.member.first_name?.[0]}{match.member.last_name?.[0]}</span>
                  )}
                </div>
                <div className={styles.matchInfo}>
                  <h3>{match.member.first_name} {match.member.last_name}</h3>
                  <p>{match.member.job_title}</p>
                  {match.member.company_name && (
                    <span className={styles.company}>{match.member.company_name}</span>
                  )}
                </div>
              </div>

              {match.member.industry && (
                <span className={styles.industry}>{match.member.industry}</span>
              )}

              <div className={styles.reasons}>
                <h4>Why you match:</h4>
                <ul>
                  {match.reasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>

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

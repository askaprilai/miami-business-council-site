'use client';

import { useState, useEffect } from 'react';
import { fetchFromSupabase, getCurrentMember } from '@/lib/api';
import styles from './Directory.module.css';

export default function Directory() {
  const [members, setMembers] = useState<any[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [industries, setIndustries] = useState<string[]>([]);
  const [currentMember, setCurrentMember] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [membersData, current] = await Promise.all([
          fetchFromSupabase('members', '?is_active=eq.true&order=first_name.asc'),
          getCurrentMember()
        ]);

        setCurrentMember(current);
        const otherMembers = (membersData || []).filter((m: any) => m.id !== current?.id);
        setMembers(otherMembers);
        setFilteredMembers(otherMembers);

        const uniqueIndustries = [...new Set(otherMembers.map((m: any) => m.industry).filter(Boolean))] as string[];
        setIndustries(uniqueIndustries.sort());
      } catch (e) {
        console.error('Error loading directory:', e);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    let filtered = members;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.first_name?.toLowerCase().includes(query) ||
        m.last_name?.toLowerCase().includes(query) ||
        m.company_name?.toLowerCase().includes(query) ||
        m.job_title?.toLowerCase().includes(query)
      );
    }
    if (industryFilter) {
      filtered = filtered.filter(m => m.industry === industryFilter);
    }
    setFilteredMembers(filtered);
  }, [searchQuery, industryFilter, members]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading directory...</p>
      </div>
    );
  }

  return (
    <div className={styles.directory}>
      <div className={styles.header}>
        <h1 className={styles.title}>Member Directory</h1>
        <p className={styles.subtitle}>
          Connect with {members.length} fellow Miami Business Council members
        </p>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search by name, company, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">All Industries</option>
          {industries.map((industry) => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
      </div>

      <p className={styles.resultsCount}>
        Showing {filteredMembers.length} of {members.length} members
      </p>

      <div className={styles.membersGrid}>
        {filteredMembers.map((member) => (
          <div key={member.id} className={styles.memberCard}>
            <div className={styles.memberHeader}>
              <div className={styles.avatar}>
                {member.profile_photo_url ? (
                  <img src={member.profile_photo_url} alt={member.first_name} />
                ) : (
                  <span>{member.first_name?.[0]}{member.last_name?.[0]}</span>
                )}
              </div>
              <div className={styles.memberInfo}>
                <h3>{member.first_name} {member.last_name}</h3>
                <p className={styles.jobTitle}>{member.job_title}</p>
                {member.company_name && (
                  <p className={styles.company}>{member.company_name}</p>
                )}
              </div>
            </div>

            {member.industry && (
              <span className={styles.industry}>{member.industry}</span>
            )}

            {member.bio && (
              <p className={styles.bio}>{member.bio.substring(0, 120)}...</p>
            )}

            <div className={styles.cardFooter}>
              <div className={styles.socialLinks}>
                {member.linkedin_url && (
                  <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                )}
                {member.website_url && (
                  <a href={member.website_url} target="_blank" rel="noopener noreferrer">Website</a>
                )}
              </div>
              <button className={styles.connectBtn}>Connect</button>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className={styles.noResults}>
          <p>No members found matching your criteria.</p>
          <button
            onClick={() => { setSearchQuery(''); setIndustryFilter(''); }}
            className={styles.clearFilters}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { fetchFromSupabase, getCurrentMember } from '@/lib/api';
import styles from './CollaborationHub.module.css';

const SUPABASE_URL = 'https://vsnvtujkkkbjpuuwxvyd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbnZ0dWpra2tianB1dXd4dnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzUyNDYsImV4cCI6MjA3MTIxMTI0Nn0.GwWKrl_6zlIBvIaJs8NngoheF24nNzAfBO5_j_d1ogA';

interface MemberNeed {
  id: string;
  member_id: string;
  title: string;
  description: string;
  category: string;
  budget_range: string;
  timeline: string;
  status: 'open' | 'closed';
  visibility: string;
  created_at: string;
  expires_at: string;
  member?: {
    first_name: string;
    last_name: string;
    company_name: string;
    profile_photo_url: string;
  };
}

const categories = [
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'development', label: 'Development & Tech' },
  { value: 'design', label: 'Design & Creative' },
  { value: 'consulting', label: 'Consulting & Strategy' },
  { value: 'legal', label: 'Legal Services' },
  { value: 'finance', label: 'Finance & Accounting' },
  { value: 'operations', label: 'Operations & HR' },
  { value: 'other', label: 'Other' },
];

const budgetRanges = [
  { value: 'pro-bono', label: 'Pro Bono' },
  { value: 'under-1k', label: 'Under $1K' },
  { value: '1k-5k', label: '$1K - $5K' },
  { value: '5k-10k', label: '$5K - $10K' },
  { value: '10k-plus', label: '$10K+' },
];

const timelines = [
  { value: 'urgent', label: 'Urgent (< 1 week)' },
  { value: 'short-term', label: 'Short-term (1-4 weeks)' },
  { value: 'medium-term', label: 'Medium-term (1-3 months)' },
  { value: 'long-term', label: 'Long-term (3+ months)' },
  { value: 'flexible', label: 'Flexible' },
];

export default function CollaborationHub() {
  const [currentMember, setCurrentMember] = useState<any>(null);
  const [needs, setNeeds] = useState<MemberNeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'marketing',
    budget_range: '1k-5k',
    timeline: 'medium-term',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const member = await getCurrentMember();
      setCurrentMember(member);
      await fetchNeeds();
    } catch (e) {
      console.error('Error loading collaboration hub:', e);
    }
    setLoading(false);
  };

  const fetchNeeds = async () => {
    try {
      // Fetch needs
      const needsData = await fetchFromSupabase('member_needs', '?status=eq.open&visibility=eq.public&order=created_at.desc');

      if (!needsData || needsData.length === 0) {
        setNeeds([]);
        return;
      }

      // Get unique member IDs
      const memberIds = [...new Set(needsData.map((n: any) => n.member_id))];

      // Fetch member details
      let membersData: any[] = [];
      if (memberIds.length > 0) {
        const membersRes = await fetch(
          `${SUPABASE_URL}/rest/v1/members?id=in.(${memberIds.join(',')})&select=id,first_name,last_name,company_name,profile_photo_url`,
          { headers: { 'apikey': SUPABASE_KEY } }
        );
        membersData = await membersRes.json();
      }

      // Create member lookup map
      const memberMap = new Map();
      membersData?.forEach((m: any) => memberMap.set(m.id, m));

      // Combine data
      const combinedData = needsData.map((need: any) => ({
        ...need,
        member: memberMap.get(need.member_id) || null,
      }));

      setNeeds(combinedData);
    } catch (error) {
      console.error('Error fetching needs:', error);
      setNeeds([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMember) return;

    setSubmitting(true);
    try {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 3);

      const response = await fetch(`${SUPABASE_URL}/rest/v1/member_needs`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          member_id: currentMember.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          budget_range: formData.budget_range,
          timeline: formData.timeline,
          status: 'open',
          visibility: 'public',
          expires_at: expiresAt.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        category: 'marketing',
        budget_range: '1k-5k',
        timeline: 'medium-term',
      });
      await fetchNeeds();
    } catch (error) {
      console.error('Error creating need:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredNeeds = filter === 'all'
    ? needs
    : filter === 'mine'
      ? needs.filter(n => n.member_id === currentMember?.id)
      : needs.filter(n => n.category === filter);

  const getCategoryLabel = (value: string) =>
    categories.find(c => c.value === value)?.label || value;

  const getBudgetLabel = (value: string) =>
    budgetRanges.find(b => b.value === value)?.label || value;

  const getTimelineLabel = (value: string) =>
    timelines.find(t => t.value === value)?.label || value;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading collaboration requests...</p>
      </div>
    );
  }

  return (
    <div className={styles.hub}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Collaboration Hub</h1>
          <p className={styles.subtitle}>
            Find opportunities to collaborate with fellow members
          </p>
        </div>
        <button
          className={styles.postBtn}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Post a Need'}
        </button>
      </div>

      {/* Post Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <h3>What do you need help with?</h3>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Looking for a web developer"
                required
              />
            </div>
            <div className={styles.field}>
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>Budget Range</label>
              <select
                value={formData.budget_range}
                onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
              >
                {budgetRanges.map(b => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>Timeline</label>
              <select
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              >
                {timelines.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.field}>
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what you're looking for in detail..."
              rows={4}
              required
            />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Posting...' : 'Post Request'}
          </button>
        </form>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <button
          className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          All Requests
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'mine' ? styles.active : ''}`}
          onClick={() => setFilter('mine')}
        >
          My Posts
        </button>
        {categories.slice(0, 4).map(c => (
          <button
            key={c.value}
            className={`${styles.filterBtn} ${filter === c.value ? styles.active : ''}`}
            onClick={() => setFilter(c.value)}
          >
            {c.label.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <p className={styles.resultsCount}>
        Showing {filteredNeeds.length} collaboration request{filteredNeeds.length !== 1 ? 's' : ''}
      </p>

      {/* Needs Grid */}
      {filteredNeeds.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🤝</span>
          <h3>No collaboration requests found</h3>
          <p>Be the first to post a collaboration request!</p>
        </div>
      ) : (
        <div className={styles.needsGrid}>
          {filteredNeeds.map((need) => (
            <div key={need.id} className={styles.needCard}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  {need.member?.profile_photo_url ? (
                    <img src={need.member.profile_photo_url} alt="" />
                  ) : (
                    <span>
                      {need.member?.first_name?.[0]}
                      {need.member?.last_name?.[0]}
                    </span>
                  )}
                </div>
                <div className={styles.memberInfo}>
                  <h4>{need.member?.first_name} {need.member?.last_name}</h4>
                  <p>{need.member?.company_name}</p>
                </div>
                <span className={styles.date}>{formatDate(need.created_at)}</span>
              </div>

              <span className={styles.category}>{getCategoryLabel(need.category)}</span>
              <h3 className={styles.needTitle}>{need.title}</h3>
              <p className={styles.needDescription}>{need.description}</p>

              <div className={styles.tags}>
                <span className={styles.tag}>{getBudgetLabel(need.budget_range)}</span>
                <span className={styles.tag}>{getTimelineLabel(need.timeline)}</span>
              </div>

              <button className={styles.contactBtn}>
                Contact Member
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchFromSupabase, updateSupabase, getCurrentMember } from '@/lib/api';
import styles from './Profile.module.css';

const SUPABASE_URL = 'https://vsnvtujkkkbjpuuwxvyd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbnZ0dWpra2tianB1dXd4dnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzUyNDYsImV4cCI6MjA3MTIxMTI0Nn0.GwWKrl_6zlIBvIaJs8NngoheF24nNzAfBO5_j_d1ogA';

export default function Profile() {
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company_name: '',
    job_title: '',
    industry: '',
    bio: '',
    linkedin_url: '',
    instagram_url: '',
    facebook_url: '',
    twitter_url: '',
    website_url: '',
  });

  useEffect(() => {
    const loadMember = async () => {
      const m = await getCurrentMember();
      if (m) {
        setMember(m);
        setFormData({
          first_name: m.first_name || '',
          last_name: m.last_name || '',
          company_name: m.company_name || '',
          job_title: m.job_title || '',
          industry: m.industry || '',
          bio: m.bio || '',
          linkedin_url: m.linkedin_url || '',
          instagram_url: m.instagram_url || '',
          facebook_url: m.facebook_url || '',
          twitter_url: m.twitter_url || '',
          website_url: m.website_url || '',
        });
      }
      setLoading(false);
    };
    loadMember();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const response = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY,
          'Content-Type': file.type,
          'x-upsert': 'true',
        },
        body: file,
      }
    );

    if (response.ok) {
      return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
    }

    const error = await response.text();
    console.error('Upload error:', error);
    throw new Error('Upload failed');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !member) return;

    setUploadingPhoto(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `profile-photos/${member.id}-${Date.now()}.${ext}`;
      const url = await uploadFile(file, 'member-assets', path);

      await updateSupabase('members', `?id=eq.${member.id}`, { profile_photo_url: url });
      setMember({ ...member, profile_photo_url: url });
    } catch (e) {
      console.error('Photo upload error:', e);
      alert('Failed to upload photo');
    }
    setUploadingPhoto(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !member) return;

    setUploadingLogo(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `company-logos/${member.id}-${Date.now()}.${ext}`;
      const url = await uploadFile(file, 'member-assets', path);

      await updateSupabase('members', `?id=eq.${member.id}`, { company_logo_url: url });
      setMember({ ...member, company_logo_url: url });
    } catch (e) {
      console.error('Logo upload error:', e);
      alert('Failed to upload logo');
    }
    setUploadingLogo(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    setSaving(true);
    setSuccess(false);

    try {
      await updateSupabase('members', `?id=eq.${member.id}`, {
        ...formData,
        updated_at: new Date().toISOString(),
      });
      setSuccess(true);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
    setSaving(false);
  };

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Real Estate', 'Marketing & Advertising',
    'Legal', 'Consulting', 'Manufacturing', 'Retail', 'Hospitality',
    'Education', 'Non-Profit', 'Entertainment', 'Construction', 'Other',
  ];

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.profile}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Profile</h1>
        <p className={styles.subtitle}>Keep your profile up to date to get better matches and connections</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Profile Photo Section */}
        <div className={styles.photoSection}>
          <div className={styles.photoGroup}>
            <div className={styles.avatar}>
              {member?.profile_photo_url ? (
                <img src={member.profile_photo_url} alt={member.first_name} />
              ) : (
                <span>{member?.first_name?.[0]}{member?.last_name?.[0]}</span>
              )}
            </div>
            <div className={styles.photoInfo}>
              <h3>Profile Photo</h3>
              <p>Your photo helps other members recognize you</p>
              <input
                type="file"
                ref={photoInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className={styles.uploadBtn}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
              </button>
            </div>
          </div>

          <div className={styles.photoGroup}>
            <div className={styles.logo}>
              {member?.company_logo_url ? (
                <img src={member.company_logo_url} alt="Company logo" />
              ) : (
                <span>🏢</span>
              )}
            </div>
            <div className={styles.photoInfo}>
              <h3>Company Logo</h3>
              <p>Display your company brand</p>
              <input
                type="file"
                ref={logoInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className={styles.uploadBtn}
                disabled={uploadingLogo}
              >
                {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
              </button>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Basic Information</h2>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="first_name">First Name</label>
              <input type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} required />
            </div>
            <div className={styles.field}>
              <label htmlFor="last_name">Last Name</label>
              <input type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} required />
            </div>
            <div className={styles.field}>
              <label htmlFor="job_title">Job Title</label>
              <input type="text" id="job_title" name="job_title" value={formData.job_title} onChange={handleChange} placeholder="e.g., CEO, Marketing Director" />
            </div>
            <div className={styles.field}>
              <label htmlFor="company_name">Company Name</label>
              <input type="text" id="company_name" name="company_name" value={formData.company_name} onChange={handleChange} placeholder="Your company name" />
            </div>
            <div className={styles.field}>
              <label htmlFor="industry">Industry</label>
              <select id="industry" name="industry" value={formData.industry} onChange={handleChange}>
                <option value="">Select an industry</option>
                {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="bio">Bio / About Your Business</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell other members about yourself and your business. What services do you offer? What makes you unique?"
              rows={5}
            />
          </div>
        </div>

        {/* Social Links */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Social Links & Website</h2>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="website_url">Website</label>
              <input type="url" id="website_url" name="website_url" value={formData.website_url} onChange={handleChange} placeholder="https://yourwebsite.com" />
            </div>
            <div className={styles.field}>
              <label htmlFor="linkedin_url">LinkedIn</label>
              <input type="url" id="linkedin_url" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/in/yourprofile" />
            </div>
            <div className={styles.field}>
              <label htmlFor="instagram_url">Instagram</label>
              <input type="url" id="instagram_url" name="instagram_url" value={formData.instagram_url} onChange={handleChange} placeholder="https://instagram.com/yourhandle" />
            </div>
            <div className={styles.field}>
              <label htmlFor="facebook_url">Facebook</label>
              <input type="url" id="facebook_url" name="facebook_url" value={formData.facebook_url} onChange={handleChange} placeholder="https://facebook.com/yourpage" />
            </div>
            <div className={styles.field}>
              <label htmlFor="twitter_url">Twitter/X</label>
              <input type="url" id="twitter_url" name="twitter_url" value={formData.twitter_url} onChange={handleChange} placeholder="https://twitter.com/yourhandle" />
            </div>
          </div>
        </div>

        {/* Membership Info */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Membership Details</h2>
          <div className={styles.membershipInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Membership Type</span>
              <span className={styles.infoValue}>{member?.membership_type}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{member?.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Member Since</span>
              <span className={styles.infoValue}>{member?.created_at && new Date(member.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className={styles.actions}>
          {success && <span className={styles.successMessage}>Profile updated successfully!</span>}
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

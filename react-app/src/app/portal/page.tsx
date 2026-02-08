'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import PortalLayout from '@/components/portal/PortalLayout';
import Dashboard from '@/components/portal/Dashboard';
import SmartMatches from '@/components/portal/SmartMatches';
import Directory from '@/components/portal/Directory';
import Connections from '@/components/portal/Connections';
import Messages from '@/components/portal/Messages';
import Events from '@/components/portal/Events';
import CollaborationHub from '@/components/portal/CollaborationHub';
import Profile from '@/components/portal/Profile';
import styles from './page.module.css';
export const dynamic = 'force-dynamic';

function PortalContent() {
  const { user, member, loading } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [localMember, setLocalMember] = useState<any>(null);
  const [localLoading, setLocalLoading] = useState(true);

  // Direct fetch member using REST API
  useEffect(() => {
    const fetchMemberDirect = async () => {
      if (!user?.email) {
        setLocalLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://vsnvtujkkkbjpuuwxvyd.supabase.co/rest/v1/members?email=eq.${encodeURIComponent(user.email.toLowerCase())}&limit=1`,
          {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbnZ0dWpra2tianB1dXd4dnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzUyNDYsImV4cCI6MjA3MTIxMTI0Nn0.GwWKrl_6zlIBvIaJs8NngoheF24nNzAfBO5_j_d1ogA',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbnZ0dWpra2tianB1dXd4dnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzUyNDYsImV4cCI6MjA3MTIxMTI0Nn0.GwWKrl_6zlIBvIaJs8NngoheF24nNzAfBO5_j_d1ogA`,
            },
          }
        );
        const data = await response.json();
        console.log('REST API response:', data);

        if (data && data.length > 0) {
          setLocalMember(data[0]);
        }
      } catch (e) {
        console.error('Direct fetch error:', e);
      }
      setLocalLoading(false);
    };

    if (user) {
      fetchMemberDirect();
    } else if (!loading) {
      setLocalLoading(false);
    }
  }, [user, loading]);

  useEffect(() => {
    if (!loading && !localLoading && !user) {
      router.push('/member-login');
    }
  }, [user, loading, localLoading, router]);

  const activeMember = member || localMember;

  if (loading || localLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading portal...</p>
      </div>
    );
  }

  if (!activeMember) {
    return (
      <div className={styles.loading}>
        <h2>Account Not Found</h2>
        <p>Your email ({user?.email}) is not associated with a member account.</p>
        <p>Please contact support or <a href="/membership">join as a member</a>.</p>
        <button onClick={() => window.location.href = '/member-login'}>
          Try Different Email
        </button>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'smart-matches':
        return <SmartMatches member={activeMember} />;
      case 'directory':
        return <Directory />;
      case 'connections':
        return <Connections />;
      case 'messages':
        return <Messages />;
      case 'events':
        return <Events />;
      case 'collaboration-hub':
        return <CollaborationHub />;
      case 'profile':
        return <Profile />;
      case 'admin':
        return activeMember?.is_admin ? <AdminPanel /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <PortalLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      {renderSection()}
    </PortalLayout>
  );
}

// Placeholder components for sections not yet fully built
function AdminPanel() {
  return (
    <div className={styles.placeholder}>
      <h1>Admin Panel</h1>
      <p>Manage members, events, and site content.</p>
      <div className={styles.comingSoon}>
        <span>👑</span>
        <p>Admin features loading...</p>
      </div>
    </div>
  );
}

export default function PortalPage() {
  return (
    <AuthProvider>
      <PortalContent />
    </AuthProvider>
  );
}

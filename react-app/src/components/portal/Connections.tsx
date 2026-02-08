'use client';

import { useState, useEffect } from 'react';
import { fetchFromSupabase, getCurrentMember, updateSupabase } from '@/lib/api';
import styles from './Connections.module.css';

const SUPABASE_URL = 'https://vsnvtujkkkbjpuuwxvyd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbnZ0dWpra2tianB1dXd4dnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzUyNDYsImV4cCI6MjA3MTIxMTI0Nn0.GwWKrl_6zlIBvIaJs8NngoheF24nNzAfBO5_j_d1ogA';

interface ConnectionWithMember {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
  created_at: string;
  updated_at?: string;
  member: any;
}

export default function Connections() {
  const [currentMember, setCurrentMember] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'accepted' | 'pending' | 'sent'>('accepted');
  const [connections, setConnections] = useState<ConnectionWithMember[]>([]);
  const [pendingReceived, setPendingReceived] = useState<ConnectionWithMember[]>([]);
  const [pendingSent, setPendingSent] = useState<ConnectionWithMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const member = await getCurrentMember();
      if (!member) {
        setLoading(false);
        return;
      }
      setCurrentMember(member);
      await fetchConnections(member);
    } catch (e) {
      console.error('Error loading connections:', e);
    }
    setLoading(false);
  };

  const fetchConnections = async (member: any) => {
    if (!member) return;

    try {
      // Fetch connections where user is requester or recipient
      const connectionsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/connections?or=(requester_id.eq.${member.id},recipient_id.eq.${member.id})`,
        { headers: { 'apikey': SUPABASE_KEY } }
      );
      const allConnections = await connectionsRes.json();

      if (!allConnections || allConnections.length === 0) {
        setConnections([]);
        setPendingReceived([]);
        setPendingSent([]);
        return;
      }

      // Get unique member IDs
      const memberIds = new Set<string>();
      allConnections.forEach((conn: any) => {
        memberIds.add(conn.requester_id);
        memberIds.add(conn.recipient_id);
      });
      memberIds.delete(member.id);

      // Fetch member details
      const idsArray = Array.from(memberIds);
      let membersData: any[] = [];
      if (idsArray.length > 0) {
        const membersRes = await fetch(
          `${SUPABASE_URL}/rest/v1/members?id=in.(${idsArray.join(',')})`,
          { headers: { 'apikey': SUPABASE_KEY } }
        );
        membersData = await membersRes.json();
      }

      const memberMap = new Map<string, any>();
      membersData?.forEach((m: any) => memberMap.set(m.id, m));

      // Categorize connections
      const accepted: ConnectionWithMember[] = [];
      const receivedPending: ConnectionWithMember[] = [];
      const sentPending: ConnectionWithMember[] = [];

      allConnections.forEach((conn: any) => {
        const otherMemberId = conn.requester_id === member.id
          ? conn.recipient_id
          : conn.requester_id;
        const otherMember = memberMap.get(otherMemberId);

        if (!otherMember) return;

        const connectionWithMember: ConnectionWithMember = {
          ...conn,
          member: otherMember,
        };

        if (conn.status === 'accepted') {
          accepted.push(connectionWithMember);
        } else if (conn.status === 'pending') {
          if (conn.recipient_id === member.id) {
            receivedPending.push(connectionWithMember);
          } else {
            sentPending.push(connectionWithMember);
          }
        }
      });

      setConnections(accepted);
      setPendingReceived(receivedPending);
      setPendingSent(sentPending);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleAccept = async (connectionId: string) => {
    try {
      await updateSupabase('connections', `?id=eq.${connectionId}`, {
        status: 'accepted',
        updated_at: new Date().toISOString()
      });
      if (currentMember) await fetchConnections(currentMember);
    } catch (error) {
      console.error('Error accepting connection:', error);
    }
  };

  const handleDecline = async (connectionId: string) => {
    try {
      await updateSupabase('connections', `?id=eq.${connectionId}`, {
        status: 'declined',
        updated_at: new Date().toISOString()
      });
      if (currentMember) await fetchConnections(currentMember);
    } catch (error) {
      console.error('Error declining connection:', error);
    }
  };

  const handleRemove = async (connectionId: string) => {
    if (!confirm('Are you sure you want to remove this connection?')) return;

    try {
      await fetch(`${SUPABASE_URL}/rest/v1/connections?id=eq.${connectionId}`, {
        method: 'DELETE',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
      });
      if (currentMember) await fetchConnections(currentMember);
    } catch (error) {
      console.error('Error removing connection:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading connections...</p>
      </div>
    );
  }

  return (
    <div className={styles.connections}>
      <div className={styles.header}>
        <h1 className={styles.title}>Connections</h1>
        <p className={styles.subtitle}>
          Manage your network of {connections.length} connections
        </p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'accepted' ? styles.active : ''}`}
          onClick={() => setActiveTab('accepted')}
        >
          Connections ({connections.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'pending' ? styles.active : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({pendingReceived.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'sent' ? styles.active : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          Sent ({pendingSent.length})
        </button>
      </div>

      {/* Accepted Connections */}
      {activeTab === 'accepted' && (
        <div className={styles.connectionsList}>
          {connections.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🤝</span>
              <h3>No connections yet</h3>
              <p>Start building your network by browsing the member directory</p>
            </div>
          ) : (
            connections.map((conn) => (
              <div key={conn.id} className={styles.connectionCard}>
                <div className={styles.cardMain}>
                  <div className={styles.avatar}>
                    {conn.member.profile_photo_url ? (
                      <img src={conn.member.profile_photo_url} alt={conn.member.first_name} />
                    ) : (
                      <span>{conn.member.first_name?.[0]}{conn.member.last_name?.[0]}</span>
                    )}
                  </div>
                  <div className={styles.memberInfo}>
                    <h3>{conn.member.first_name} {conn.member.last_name}</h3>
                    <p>{conn.member.job_title}</p>
                    {conn.member.company_name && (
                      <span className={styles.company}>{conn.member.company_name}</span>
                    )}
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <span className={styles.connectedDate}>
                    Connected {formatDate(conn.updated_at || conn.created_at)}
                  </span>
                  <div className={styles.actionBtns}>
                    <button className={styles.messageBtn}>Message</button>
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemove(conn.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pending Received */}
      {activeTab === 'pending' && (
        <div className={styles.connectionsList}>
          {pendingReceived.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>⏳</span>
              <h3>No pending requests</h3>
              <p>When someone wants to connect, you&apos;ll see their request here</p>
            </div>
          ) : (
            pendingReceived.map((conn) => (
              <div key={conn.id} className={styles.connectionCard}>
                <div className={styles.cardMain}>
                  <div className={styles.avatar}>
                    {conn.member.profile_photo_url ? (
                      <img src={conn.member.profile_photo_url} alt={conn.member.first_name} />
                    ) : (
                      <span>{conn.member.first_name?.[0]}{conn.member.last_name?.[0]}</span>
                    )}
                  </div>
                  <div className={styles.memberInfo}>
                    <h3>{conn.member.first_name} {conn.member.last_name}</h3>
                    <p>{conn.member.job_title}</p>
                    {conn.member.company_name && (
                      <span className={styles.company}>{conn.member.company_name}</span>
                    )}
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <span className={styles.requestDate}>
                    Requested {formatDate(conn.created_at)}
                  </span>
                  <div className={styles.actionBtns}>
                    <button
                      className={styles.acceptBtn}
                      onClick={() => handleAccept(conn.id)}
                    >
                      Accept
                    </button>
                    <button
                      className={styles.declineBtn}
                      onClick={() => handleDecline(conn.id)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pending Sent */}
      {activeTab === 'sent' && (
        <div className={styles.connectionsList}>
          {pendingSent.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>📤</span>
              <h3>No pending sent requests</h3>
              <p>Your sent connection requests will appear here</p>
            </div>
          ) : (
            pendingSent.map((conn) => (
              <div key={conn.id} className={styles.connectionCard}>
                <div className={styles.cardMain}>
                  <div className={styles.avatar}>
                    {conn.member.profile_photo_url ? (
                      <img src={conn.member.profile_photo_url} alt={conn.member.first_name} />
                    ) : (
                      <span>{conn.member.first_name?.[0]}{conn.member.last_name?.[0]}</span>
                    )}
                  </div>
                  <div className={styles.memberInfo}>
                    <h3>{conn.member.first_name} {conn.member.last_name}</h3>
                    <p>{conn.member.job_title}</p>
                    {conn.member.company_name && (
                      <span className={styles.company}>{conn.member.company_name}</span>
                    )}
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <span className={styles.pendingLabel}>
                    Pending since {formatDate(conn.created_at)}
                  </span>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => handleRemove(conn.id)}
                  >
                    Cancel Request
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

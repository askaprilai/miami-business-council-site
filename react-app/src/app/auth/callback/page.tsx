'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

const SUPABASE_URL = 'https://vsnvtujkkkbjpuuwxvyd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbnZ0dWpra2tianB1dXd4dnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzUyNDYsImV4cCI6MjA3MTIxMTI0Nn0.GwWKrl_6zlIBvIaJs8NngoheF24nNzAfBO5_j_d1ogA';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState('Authenticating...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the auth code from URL
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get('code');

        // Check for error in URL
        const error = queryParams.get('error');
        if (error) {
          console.error('Auth error:', error);
          setStatus('Authentication failed. Redirecting...');
          setTimeout(() => {
            window.location.href = '/member-login?error=auth_failed';
          }, 1500);
          return;
        }

        if (code) {
          setStatus('Exchanging code for session...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            setStatus('Authentication failed. Redirecting...');
            setTimeout(() => {
              window.location.href = '/member-login?error=auth_failed';
            }, 1500);
            return;
          }

          if (data.session) {
            setStatus('Success! Verifying member...');

            // Use REST API to verify member (avoid Supabase client hanging)
            const memberRes = await fetch(
              `${SUPABASE_URL}/rest/v1/members?auth_user_id=eq.${data.session.user.id}&limit=1`,
              { headers: { 'apikey': SUPABASE_KEY } }
            );
            const memberData = await memberRes.json();

            if (!memberData || memberData.length === 0) {
              // Try to find by email if auth_user_id doesn't match
              const emailRes = await fetch(
                `${SUPABASE_URL}/rest/v1/members?email=eq.${encodeURIComponent(data.session.user.email?.toLowerCase() || '')}&limit=1`,
                { headers: { 'apikey': SUPABASE_KEY } }
              );
              const memberByEmail = await emailRes.json();

              if (memberByEmail && memberByEmail.length > 0) {
                const member = memberByEmail[0];
                if (!member.auth_user_id) {
                  // Update the member record with auth_user_id
                  await fetch(
                    `${SUPABASE_URL}/rest/v1/members?id=eq.${member.id}`,
                    {
                      method: 'PATCH',
                      headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ auth_user_id: data.session.user.id }),
                    }
                  );
                  setStatus('Account linked! Redirecting to portal...');
                } else {
                  setStatus('Redirecting to portal...');
                }
              } else {
                setStatus('No member account found. Please contact support.');
                setTimeout(() => {
                  window.location.href = '/member-login?error=no_member';
                }, 2000);
                return;
              }
            }

            // Use window.location for a full page reload to ensure session is loaded
            setStatus('Redirecting to portal...');
            setTimeout(() => {
              window.location.href = '/portal';
            }, 500);
            return;
          }
        }

        // No code in URL - check if already have session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          window.location.href = '/portal';
          return;
        }

        setStatus('No authentication data found. Redirecting...');
        setTimeout(() => {
          window.location.href = '/member-login';
        }, 1500);

      } catch (err) {
        console.error('Auth callback error:', err);
        setStatus('An error occurred. Redirecting...');
        setTimeout(() => {
          window.location.href = '/member-login?error=auth_failed';
        }, 1500);
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.spinner}></div>
        <p className={styles.status}>{status}</p>
      </div>
    </div>
  );
}

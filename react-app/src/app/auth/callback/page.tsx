'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

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

            // Verify member exists in database
            const { data: memberData, error: memberError } = await supabase
              .from('members')
              .select('id, email')
              .eq('auth_user_id', data.session.user.id)
              .single();

            if (memberError || !memberData) {
              // Try to find by email if auth_user_id doesn't match
              const { data: memberByEmail } = await supabase
                .from('members')
                .select('id, auth_user_id')
                .eq('email', data.session.user.email)
                .single();

              if (memberByEmail && !memberByEmail.auth_user_id) {
                // Update the member record with auth_user_id
                await supabase
                  .from('members')
                  .update({ auth_user_id: data.session.user.id })
                  .eq('id', memberByEmail.id);

                setStatus('Account linked! Redirecting to portal...');
              } else if (memberByEmail) {
                setStatus('Redirecting to portal...');
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

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Header, Footer } from '@/components';
import styles from './page.module.css';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Check for auth errors from callback
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'auth_failed') {
      setMessage('Authentication failed. Please try again.');
      setIsSuccess(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Send magic link via Supabase Auth
      const { error } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      setMessage('Check your email for a magic link to sign in! (Check spam folder too)');
    } catch (error: any) {
      setIsSuccess(false);
      setMessage(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.loginForm}>
      <div className={styles.formGroup}>
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
        />
      </div>

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={isLoading}
      >
        {isLoading ? 'Sending...' : 'Send Magic Link'}
      </button>

      {message && (
        <div className={`${styles.message} ${isSuccess ? styles.success : styles.error}`}>
          {message}
        </div>
      )}
    </form>
  );
}

export default function MemberLoginPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.loginContainer}>
          <div className={styles.loginCard}>
            <div className={styles.maintenanceBanner}>
              <span className={styles.maintenanceIcon}>🔧</span>
              <div>
                <strong>Portal Update in Progress</strong>
                <p>We're making improvements to the member portal. Please check back shortly.</p>
              </div>
            </div>

            <div className={styles.logoSection}>
              <Image
                src="/Images/MBC BLACK LOGO NONTRANSPARENT (1).png"
                alt="Miami Business Council"
                width={80}
                height={80}
                className={styles.logo}
              />
              <h1>Member Portal</h1>
              <p>Sign in to access your exclusive member benefits</p>
            </div>

            {/* Login form temporarily disabled during maintenance */}
            <div className={styles.formDisabled}>
              <p>Login temporarily unavailable during update.</p>
            </div>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <div className={styles.alternativeActions}>
              <p>Not a member yet?</p>
              <Link href="/membership" className={styles.joinLink}>
                Learn About Membership
              </Link>
            </div>

            <div className={styles.features}>
              <h3>Member Benefits Include:</h3>
              <ul>
                <li>Access to exclusive networking events</li>
                <li>AI-powered business matching</li>
                <li>Member directory &amp; messaging</li>
                <li>Collaboration opportunities</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

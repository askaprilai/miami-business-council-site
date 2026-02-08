'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Header, Footer } from '@/components';
import styles from './page.module.css';

export default function MemberLoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // This will be connected to Supabase Auth
      // For now, show a placeholder message
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
      setMessage('Check your email for a magic link to sign in!');
    } catch (error) {
      setIsSuccess(false);
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.loginContainer}>
          <div className={styles.loginCard}>
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

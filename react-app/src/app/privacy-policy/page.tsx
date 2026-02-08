import { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy | Miami Business Council',
  description: 'Miami Business Council Privacy Policy - How we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1>Privacy Policy</h1>
          <p>Miami Business Council</p>
        </div>

        <div className={styles.container}>
          <div className={styles.lastUpdated}>
            <strong>Effective Date:</strong> January 22, 2026<br />
            <strong>Last Updated:</strong> January 22, 2026<br />
            <strong>Version:</strong> 1.0
          </div>

          <nav className={styles.toc}>
            <h3>Table of Contents</h3>
            <ul>
              <li><a href="#introduction">1. Introduction</a></li>
              <li><a href="#information-we-collect">2. Information We Collect</a></li>
              <li><a href="#how-we-use">3. How We Use Your Information</a></li>
              <li><a href="#how-we-share">4. How We Share Your Information</a></li>
              <li><a href="#data-security">5. Data Security</a></li>
              <li><a href="#your-rights">6. Your Privacy Rights</a></li>
              <li><a href="#contact">7. Contact Us</a></li>
            </ul>
          </nav>

          <section>
            <h2 id="introduction">1. Introduction</h2>
            <p>Welcome to Miami Business Council (&quot;MBC,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our member portal and services.</p>
            <p><strong>By accessing or using our services, you agree to this Privacy Policy.</strong> If you do not agree, please do not use our services.</p>
          </section>

          <section>
            <h2 id="information-we-collect">2. Information We Collect</h2>

            <h3>2.1 Information You Provide</h3>
            <ul>
              <li><strong>Account Information:</strong> Full name, email address, company name, job title, industry</li>
              <li><strong>Professional Information:</strong> LinkedIn profile (optional), professional photo (optional)</li>
              <li><strong>Networking Information:</strong> Business opportunities, connection requests, messages, event registrations</li>
            </ul>

            <h3>2.2 Information We Collect Automatically</h3>
            <ul>
              <li>Login timestamps and session data</li>
              <li>Browser type and device information</li>
              <li>IP address (for security purposes only)</li>
              <li>Usage statistics and feature interactions</li>
            </ul>

            <div className={styles.highlightBox}>
              <h3>What We DON&apos;T Collect</h3>
              <ul>
                <li>Social Security numbers</li>
                <li>Credit card information (payments processed by Stripe)</li>
                <li>Health information</li>
                <li>Passwords (we use passwordless authentication)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 id="how-we-use">3. How We Use Your Information</h2>

            <h3>Primary Purposes:</h3>
            <ul>
              <li><strong>Account Management:</strong> Create and manage your member account</li>
              <li><strong>Networking:</strong> Facilitate connections between members and AI-powered business matching</li>
              <li><strong>Communication:</strong> Send service announcements, event invitations, and member updates</li>
              <li><strong>Security:</strong> Prevent fraud, enforce terms, and protect member safety</li>
              <li><strong>Improvement:</strong> Analyze usage to enhance our platform and develop new features</li>
            </ul>
          </section>

          <section>
            <h2 id="how-we-share">4. How We Share Your Information</h2>

            <h3>4.1 Within the Member Community</h3>
            <p><strong>Shared with All Members:</strong></p>
            <ul>
              <li>Name, company name, job title, industry</li>
              <li>Professional photo (if uploaded)</li>
              <li>Business opportunities (what you&apos;re looking for/offering)</li>
              <li>LinkedIn profile (if provided)</li>
            </ul>

            <p><strong>Never Shared:</strong></p>
            <ul>
              <li>Your email address (unless you initiate contact)</li>
              <li>Authentication logs</li>
              <li>Private messages</li>
            </ul>

            <h3>4.2 Service Providers</h3>
            <p>We share information with trusted third-party service providers who help us operate our platform:</p>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Service</th>
                  <th>Data Shared</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Supabase</td>
                  <td>Database & Authentication</td>
                  <td>Account data, profile information</td>
                </tr>
                <tr>
                  <td>Vercel</td>
                  <td>Website Hosting</td>
                  <td>Usage logs</td>
                </tr>
                <tr>
                  <td>Resend</td>
                  <td>Email Delivery</td>
                  <td>Email address, name</td>
                </tr>
                <tr>
                  <td>Stripe</td>
                  <td>Payment Processing</td>
                  <td>Name, email (for memberships)</td>
                </tr>
              </tbody>
            </table>

            <p><strong>All service providers are contractually obligated to protect your data and may only use it for specified purposes.</strong></p>
          </section>

          <section>
            <h2 id="data-security">5. Data Security</h2>

            <h3>Security Measures We Implement:</h3>
            <ul>
              <li><strong>Encryption:</strong> All data encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
              <li><strong>Passwordless Authentication:</strong> Magic link system eliminates password theft risk</li>
              <li><strong>Row-level Security:</strong> Database isolation prevents unauthorized data access</li>
              <li><strong>SOC 2 Certified Infrastructure:</strong> Enterprise-grade security (Supabase, Vercel)</li>
              <li><strong>Daily Backups:</strong> Automated backups for disaster recovery</li>
              <li><strong>Rate Limiting:</strong> Protection against automated attacks</li>
              <li><strong>Security Monitoring:</strong> 24/7 monitoring and alerts</li>
            </ul>

            <div className={styles.highlightBox}>
              <h3>Data Breach Notification</h3>
              <p>In the unlikely event of a data breach affecting your information, we will notify you within 72 hours and explain:</p>
              <ul>
                <li>What happened</li>
                <li>What data was affected</li>
                <li>Steps we&apos;re taking</li>
                <li>What you should do</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 id="your-rights">6. Your Privacy Rights</h2>

            <h3>You Have the Right To:</h3>
            <ul>
              <li><strong>Access:</strong> View your personal information anytime through your profile</li>
              <li><strong>Correction:</strong> Update or correct your information in your profile settings</li>
              <li><strong>Deletion:</strong> Request deletion of your account and all associated data</li>
              <li><strong>Export:</strong> Download your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Restrict Processing:</strong> Request we limit how we use your data</li>
            </ul>

            <h3>How to Exercise Your Rights:</h3>
            <p><strong>Email:</strong> <a href="mailto:privacy@miamibusinesscouncil.com">privacy@miamibusinesscouncil.com</a><br />
            <strong>Subject Line:</strong> &quot;Privacy Rights Request - [Your Name]&quot;<br />
            <strong>Response Time:</strong> Within 30 days</p>
          </section>

          <section>
            <h2>7. Data Retention</h2>
            <p><strong>How Long We Keep Your Data:</strong></p>
            <ul>
              <li><strong>Active Members:</strong> Duration of membership + 90 days</li>
              <li><strong>Former Members:</strong> 1 year after membership ends</li>
              <li><strong>Deleted Accounts:</strong> Removed from active database within 30 days, backups cleared within 90 days</li>
            </ul>
          </section>

          <section>
            <h2>8. Cookies and Tracking</h2>
            <p><strong>Essential Cookies (Required):</strong></p>
            <ul>
              <li>Session authentication</li>
              <li>Security features</li>
            </ul>

            <p><strong>We DO NOT use:</strong></p>
            <ul>
              <li>Third-party advertising cookies</li>
              <li>Social media tracking pixels</li>
              <li>Cross-site tracking</li>
            </ul>
          </section>

          <section>
            <h2>9. Children&apos;s Privacy</h2>
            <p>Our services are not directed to individuals under 18. We do not knowingly collect information from children.</p>
          </section>

          <section>
            <h2>10. International Data Transfers</h2>
            <p>Your information is stored on servers located in the United States (AWS US-East-2). If accessing from outside the US, you consent to this transfer.</p>
          </section>

          <section>
            <h2>11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Material changes will be communicated via email with 30-day notice before taking effect.</p>
          </section>

          <section>
            <h2 id="contact">12. Contact Us</h2>
            <p><strong>Privacy Questions:</strong><br />
            Email: <a href="mailto:privacy@miamibusinesscouncil.com">privacy@miamibusinesscouncil.com</a></p>

            <p><strong>Response Time:</strong> 5 business days (acknowledgment), 30 days (full response)</p>

            <div className={styles.highlightBox}>
              <h3>Your Consent</h3>
              <p>By using our services, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.</p>
            </div>
          </section>

          <Link href="/" className={styles.backLink}>
            &larr; Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

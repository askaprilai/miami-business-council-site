'use client';

import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer id="contact" className={styles.footer}>
      <div className="container">
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h4>Miami Business Council</h4>
            <p>
              Building a stronger creative community through collaboration,
              innovation, and business excellence.
            </p>
          </div>

          <div className={styles.footerSection}>
            <h4>Contact Info</h4>
            <p>
              Email:{' '}
              <a href="mailto:info@miamibusinesscouncil.com">
                info@miamibusinesscouncil.com
              </a>
            </p>
            <p>Phone: Coming Soon</p>
            <p>Address: Miami Location TBD</p>
          </div>

          <div className={styles.footerSection}>
            <h4>Get Involved</h4>
            <ul>
              <li>
                <Link href="#email-signup">Join Waitlist</Link>
              </li>
              <li>
                <Link href="#events">Attend Events</Link>
              </li>
              <li>
                <Link href="/member-login">Member Portal</Link>
              </li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h4>Quick Links</h4>
            <ul>
              <li>
                <Link href="/about-us">About Us</Link>
              </li>
              <li>
                <Link href="/membership">Membership</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} Miami Business Council. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

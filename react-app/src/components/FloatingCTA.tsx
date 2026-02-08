'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './FloatingCTA.module.css';

export default function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const emailCapture = document.getElementById('email-signup');
      const footer = document.querySelector('footer');

      if (emailCapture && footer) {
        const emailCaptureRect = emailCapture.getBoundingClientRect();
        const footerRect = footer.getBoundingClientRect();

        // Show button when past email capture, hide when reaching footer
        if (emailCaptureRect.bottom < 0 && footerRect.top > window.innerHeight) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Link
      href="#email-signup"
      className={`${styles.floatingCta} ${isVisible ? styles.visible : ''}`}
    >
      Join Waitlist
    </Link>
  );
}

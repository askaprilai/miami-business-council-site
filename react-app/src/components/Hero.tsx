'use client';

import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section id="home" className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 className={styles.title}>
          Miami&apos;s Business Community for Growth-Minded Leaders
        </h1>
        <p className={styles.subtitle}>
          Connect. Collaborate. Build the future of Miami alongside founders, innovators,
          and industry leaders committed to elevating our city.
        </p>

        <div className={styles.emailCapture} id="email-signup">
          {/* Progress Indicator */}
          <div className={styles.progressIndicator}>
            <div className={styles.progressDot} data-active="true"></div>
            <div className={styles.progressLine}></div>
            <div className={styles.progressDot}></div>
            <div className={styles.progressLine}></div>
            <div className={styles.progressDot}></div>
          </div>

          <p className={styles.captureTitle}>
            2026 memberships invitations opening soon
          </p>

          <div className={styles.spacer}></div>

          {/* Zeffy Newsletter Signup Form */}
          <div className={styles.formContainer}>
            <iframe
              title="Signup form powered by Zeffy"
              className={styles.zeffyIframe}
              src="https://www.zeffy.com/en-US/embed/newsletter-form/sign-up-for-newsletter"
              allowTransparency={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

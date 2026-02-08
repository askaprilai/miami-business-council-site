'use client';

import styles from './SmartMatches.module.css';

export default function SmartMatches({ member }: { member?: any }) {
  return (
    <div className={styles.smartMatches}>
      <div className={styles.header}>
        <h1 className={styles.title}>Smart Matches</h1>
        <p className={styles.subtitle}>Version 2 - {new Date().toISOString()}</p>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statsCard}>
          <h3>Test Card</h3>
          <p>If you see this, the component is working.</p>
          <p>Member: {member?.email || 'No member passed'}</p>
        </div>
      </div>
    </div>
  );
}

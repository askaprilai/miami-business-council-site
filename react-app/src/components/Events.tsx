'use client';

import styles from './Events.module.css';

export default function Events() {
  return (
    <section id="events" className={styles.events}>
      <div className="container">
        <h2 className={styles.title}>Upcoming Events</h2>

        <div className={styles.eventsGrid}>
          {/* Featured Event */}
          <div className={styles.eventCardFeatured}>
            <div className={styles.eventDate}>February 25th</div>
            <h3 className={styles.eventTitle}>Monthly Breakfast Networking</h3>
            <p className={styles.eventDescription}>
              Join us for our monthly breakfast and connect with fellow business leaders
              in the Miami Design District. Learn about our mission and enjoy a
              complimentary light breakfast and coffee.
            </p>
            <div className={styles.eventMeta}>
              February 25th &bull; 9:00 AM - 10:30 AM &bull; Design District Location
              <br />
              <span>Exact address provided upon registration approval</span>
            </div>
            <a
              href="https://luma.com/8tp3t1g5"
              className={styles.registerBtn}
              target="_blank"
              rel="noopener noreferrer"
            >
              Register Now
            </a>
          </div>

          {/* Coming Soon Event */}
          <div className={styles.eventCardSecondary}>
            <div className={styles.comingSoon}>Coming Soon</div>
            <h3 className={styles.eventTitleDark}>Quarterly Mixer</h3>
            <p className={styles.eventDescriptionDark}>
              Connect with fellow design professionals, architects, and luxury retail
              leaders in an exclusive networking environment.
            </p>
            <div className={styles.eventMetaDark}>Date &amp; Location TBD</div>
            <span className={styles.comingSoonBadge}>Coming Soon</span>
          </div>
        </div>
      </div>
    </section>
  );
}

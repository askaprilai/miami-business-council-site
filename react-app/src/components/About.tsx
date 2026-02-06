'use client';

import styles from './About.module.css';

const features = [
  {
    title: 'Professional Networking',
    description: "Connect with like-minded professionals and expand your creative network through exclusive events and workshops in Miami's premier design destination.",
  },
  {
    title: 'Business Growth',
    description: 'Access resources, mentorship, and strategic opportunities to grow your design business and reach new markets throughout South Florida.',
  },
  {
    title: 'Community Impact',
    description: "Collaborate on initiatives that enhance our district's reputation as a global destination for design excellence and innovation.",
  },
];

export default function About() {
  return (
    <section id="about" className={styles.about}>
      <div className="container">
        <div className={styles.aboutContent}>
          <div className={styles.aboutText}>
            <div className={styles.visionMission}>
              <div className={styles.mission}>
                <h3 className={styles.sectionTitle}>MISSION</h3>
                <p>
                  The Miami Business Council creates platforms for leaders to connect,
                  form partnerships, and collaborate to advance the Miami business community.
                </p>
              </div>
              <div className={styles.vision}>
                <h3 className={styles.sectionTitle}>VISION</h3>
                <p>
                  To establish the Miami business community as a hub for collaboration,
                  where partnerships and community engagement create a thriving and
                  sustainable economic landscape.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.aboutFeatures}>
            {features.map((feature, index) => (
              <div key={index} className={styles.feature}>
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

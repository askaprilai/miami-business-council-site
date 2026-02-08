'use client';

import styles from './Resources.module.css';

const resources = [
  {
    icon: 'DIR',
    title: 'Business Directory',
    description: 'Connect with vetted design professionals, luxury retailers, and service providers in the district.',
  },
  {
    icon: 'MKT',
    title: 'Market Insights',
    description: "Access exclusive market reports, trends, and data specific to Miami's luxury design market.",
  },
  {
    icon: 'COL',
    title: 'Partnership Portal',
    description: 'Discover collaboration opportunities with established brands and emerging designers.',
  },
];

export default function Resources() {
  return (
    <section id="resources" className={styles.resources}>
      <div className="container">
        <h2 className={styles.title}>Business Resources</h2>

        <div className={styles.resourcesGrid}>
          {resources.map((resource, index) => (
            <div key={index} className={styles.resourceCard}>
              <div className={styles.iconWrapper}>
                {resource.icon}
              </div>
              <h3>{resource.title}</h3>
              <p>{resource.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

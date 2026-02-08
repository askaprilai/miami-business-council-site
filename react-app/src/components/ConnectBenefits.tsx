'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './ConnectBenefits.module.css';

const benefits = [
  {
    icon: 'N',
    title: 'Elite Networking',
    description: 'Connect with luxury industry leaders, designers, and innovators at exclusive monthly mixers and VIP events.',
    features: [
      'Monthly luxury networking events',
      'VIP access to industry gatherings',
      'Direct access to decision makers',
    ],
  },
  {
    icon: 'G',
    title: 'Business Growth',
    description: 'Accelerate your business with strategic partnerships, mentorship programs, and exclusive market insights.',
    features: [
      'Expert mentorship & consultations',
      'Strategic partnership facilitation',
      'Quarterly business strategy sessions',
    ],
  },
  {
    icon: 'I',
    title: 'Exclusive Insights',
    description: 'Stay ahead with exclusive market reports, trend analysis, and insider knowledge of the luxury design sector.',
    features: [
      'Exclusive market insights & reports',
      'Industry trend forecasting',
      'Luxury market data & analytics',
    ],
  },
];

const valueProps = [
  { title: 'Exclusive Access', description: "Join Miami's most prestigious business community" },
  { title: 'Premium Platform', description: 'Access to premium member platform' },
  { title: 'Business Growth', description: 'Unparalleled networking and growth opportunities' },
];

export default function ConnectBenefits() {
  return (
    <section className={styles.connectBenefits}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.title}>Coming Soon</h2>
          <h3 className={styles.subtitle}>Business Connect</h3>

          {/* Portal Preview */}
          <div className={styles.portalPreview}>
            <div className={styles.previewCard}>
              <Image
                src="/Images/portal.png"
                alt="Member Portal Preview"
                width={500}
                height={300}
                className={styles.previewImage}
              />
              <p className={styles.previewLabel}>Exclusive Member Portal Preview</p>
              <Link href="#" className={styles.previewBtn}>
                Preview Portal
              </Link>
            </div>
          </div>

          {/* Value Propositions */}
          <div className={styles.valueProps}>
            {valueProps.map((prop, index) => (
              <div key={index} className={styles.valueProp}>
                <h4>{prop.title}</h4>
                <p>{prop.description}</p>
              </div>
            ))}
          </div>

          <p className={styles.sectionDescription}>
            Discover what makes our membership platform the premier choice for Miami&apos;s design and business leaders
          </p>
        </div>

        {/* Benefits Grid */}
        <div className={styles.benefitsGrid}>
          {benefits.map((benefit, index) => (
            <div key={index} className={styles.benefitCard}>
              <div className={styles.benefitIcon}>{benefit.icon}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
              <ul>
                {benefit.features.map((feature, i) => (
                  <li key={i}>
                    <span className={styles.checkmark}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={styles.ctaSection}>
          <h3>Ready to Elevate Your Business?</h3>
          <p>
            Join the Miami Business Council and gain exclusive access to our premium membership platform.
            Be the first to know when our enhanced member benefits launch in Miami&apos;s premier business destination.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="#email-signup" className={styles.btnPrimary}>
              Get Early Access
            </Link>
            <Link href="/member-login" className={styles.btnPrimary}>
              Access Member Portal
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

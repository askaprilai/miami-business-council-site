import { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Membership - Miami Business Council | Join Our Business Community',
  description: 'Join Miami Business Council and gain access to exclusive networking events, AI-powered business matching, and a community of growth-minded leaders.',
};

const membershipTiers = [
  {
    name: 'Individual',
    price: '$25',
    period: '/month',
    description: 'Perfect for entrepreneurs and professionals',
    features: [
      'Access to member directory',
      'Monthly networking events',
      'AI-powered business matching',
      'Direct messaging with members',
      'Collaboration opportunities',
    ],
    popular: false,
  },
  {
    name: 'Nonprofit',
    price: '$35',
    period: '/month',
    description: 'For nonprofit organizations and social enterprises',
    features: [
      'All Individual benefits',
      'Priority event registration',
      'Featured in member spotlight',
      'Access to nonprofit resources',
      'Grant opportunity notifications',
    ],
    popular: false,
  },
  {
    name: 'Business',
    price: '$45',
    period: '/month',
    description: 'For established businesses seeking growth',
    features: [
      'All Nonprofit benefits',
      'Company profile in directory',
      'Multiple team member access',
      'Premium business matching',
      'Exclusive B2B opportunities',
      'Logo featured on website',
    ],
    popular: true,
  },
];

export default function MembershipPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className="container">
            <h1 className={styles.heroTitle}>Join Miami Business Council</h1>
            <p className={styles.heroSubtitle}>
              Connect with Miami&apos;s premier business community and unlock exclusive
              opportunities for growth, collaboration, and success.
            </p>
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className={styles.pricingSection}>
          <div className="container">
            <div className={styles.pricingGrid}>
              {membershipTiers.map((tier, index) => (
                <div
                  key={index}
                  className={`${styles.pricingCard} ${tier.popular ? styles.popular : ''}`}
                >
                  {tier.popular && <div className={styles.popularBadge}>Most Popular</div>}
                  <h3 className={styles.tierName}>{tier.name}</h3>
                  <div className={styles.price}>
                    <span className={styles.amount}>{tier.price}</span>
                    <span className={styles.period}>{tier.period}</span>
                  </div>
                  <p className={styles.description}>{tier.description}</p>
                  <ul className={styles.features}>
                    {tier.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                  <Link href="/#email-signup" className={styles.joinBtn}>
                    Join Waitlist
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
            <div className={styles.faqGrid}>
              <div className={styles.faqItem}>
                <h4>How do I become a member?</h4>
                <p>
                  Join our waitlist and you&apos;ll receive an invitation when memberships
                  open. Simply complete your profile and choose your membership tier.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>Can I upgrade my membership?</h4>
                <p>
                  Yes! You can upgrade your membership at any time. The price difference
                  will be prorated for your current billing period.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>What payment methods do you accept?</h4>
                <p>
                  We accept all major credit cards through our secure payment processor.
                  Annual memberships receive a 2-month discount.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>Is there a refund policy?</h4>
                <p>
                  We offer a 30-day money-back guarantee. If you&apos;re not satisfied with
                  your membership, contact us for a full refund.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

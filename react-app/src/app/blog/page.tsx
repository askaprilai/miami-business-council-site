import { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Blog - Miami Business Council | Business Insights & News',
  description: 'Stay updated with the latest business insights, networking tips, and news from Miami Business Council.',
};

const blogPosts = [
  {
    title: 'The Power of Business Networking in Miami',
    excerpt: 'Discover how strategic networking can transform your business growth in Miami\'s dynamic market.',
    date: 'February 5, 2026',
    category: 'Networking',
    slug: 'power-of-business-networking',
  },
  {
    title: 'AI-Powered Business Matching: The Future is Here',
    excerpt: 'Learn how our AI matching system connects you with the perfect business partners and opportunities.',
    date: 'January 28, 2026',
    category: 'Technology',
    slug: 'ai-powered-business-matching',
  },
  {
    title: 'Building Meaningful Business Relationships',
    excerpt: 'Tips and strategies for creating lasting connections that drive mutual business success.',
    date: 'January 15, 2026',
    category: 'Business Growth',
    slug: 'building-meaningful-relationships',
  },
];

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className="container">
            <h1 className={styles.heroTitle}>Business Insights & News</h1>
            <p className={styles.heroSubtitle}>
              Stay updated with the latest trends, tips, and news from Miami&apos;s
              business community.
            </p>
          </div>
        </section>

        {/* Blog Posts */}
        <section className={styles.blogSection}>
          <div className="container">
            <div className={styles.blogGrid}>
              {blogPosts.map((post, index) => (
                <article key={index} className={styles.blogCard}>
                  <div className={styles.cardContent}>
                    <span className={styles.category}>{post.category}</span>
                    <h2 className={styles.postTitle}>{post.title}</h2>
                    <p className={styles.excerpt}>{post.excerpt}</p>
                    <div className={styles.cardFooter}>
                      <span className={styles.date}>{post.date}</span>
                      <Link href={`/blog/${post.slug}`} className={styles.readMore}>
                        Read More
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Coming Soon */}
            <div className={styles.comingSoon}>
              <h3>More Articles Coming Soon</h3>
              <p>
                We&apos;re working on bringing you more valuable content about
                business growth, networking, and success in Miami.
              </p>
              <Link href="/#email-signup" className={styles.subscribeBtn}>
                Subscribe for Updates
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

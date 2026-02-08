import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Header, Footer } from '@/components';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About Us - Miami Business Council | Meet Our Executive Team & Board',
  description: 'Meet the visionary leaders of Miami Business Council. Our executive director April Sabral and distinguished board members drive innovation, collaboration, and sustainable growth.',
};

const executiveDirector = {
  name: 'April Sabral',
  title: 'Executive Director',
  image: '/Images/April.jpg',
  bio: 'April Sabral brings over two decades of transformational leadership experience to the Miami Business Council. As a visionary executive, she has consistently driven organizational excellence across diverse industries, from luxury retail to cutting-edge AI technology.',
  linkedin: 'https://linkedin.com/in/aprilsabral',
};

const boardMembers = [
  {
    name: 'Lubna Najjar',
    title: 'Board President',
    image: '/Images/Lubna-Najjar.jpg',
    bio: 'Lubna Najjar is a dynamic entrepreneur and business leader with expertise in fashion, retail, and brand development. As the founder of ilmoda, she has built a reputation for creating innovative fashion concepts that bridge cultures and markets.',
  },
  {
    name: 'Martu E. Freeman-Parker',
    title: 'Vice President',
    image: '/Images/MartuF.jpg',
    bio: 'Martu E. Freeman-Parker is a versatile creative professional and entrepreneur with extensive experience in production, event management, and content creation. As the founder of M.E.F. Productions LLC, she brings a unique blend of artistic vision and business acumen.',
  },
  {
    name: 'Atiba Madyun',
    title: 'Treasurer',
    image: '/Images/Atiba.jpg',
    bio: 'Atiba Madyun is a seasoned business leader and entrepreneur with extensive experience in strategic planning, operations management, and community development initiatives. As the founder of The Madyun Group, he brings decades of expertise in business development and financial management.',
  },
  {
    name: 'Thomas McClure',
    title: 'Secretary',
    image: '/Images/Tommy.jpeg',
    bio: 'Thomas McClure brings extensive experience in business operations and community engagement to the Miami Business Council. His dedication to organizational excellence and community development makes him an invaluable member of the leadership team.',
  },
  {
    name: 'Olga Largen',
    title: 'Board Member',
    image: '/Images/Olga.jpg',
    bio: 'Olga Largen is a distinguished professional with expertise in business development and community relations. Her strategic insights and commitment to excellence contribute significantly to the council\'s mission and growth.',
  },
  {
    name: 'Yolanda Vega',
    title: 'Board Member',
    image: '/Images/Yolanda.jpg',
    bio: 'Yolanda Vega brings a wealth of experience in business strategy and community leadership. Her passion for fostering business growth and creating meaningful connections strengthens the council\'s impact in the Miami business community.',
  },
  {
    name: 'Scott Largen, Esq.',
    title: 'Board Member',
    image: '/Images/Scott.JPG',
    bio: 'Scott Largen is a distinguished attorney with extensive experience in business law and corporate governance. His legal expertise and strategic counsel provide invaluable guidance to the council\'s operations and growth initiatives.',
  },
];

export default function AboutUsPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className="container">
            <h1 className={styles.heroTitle}>About Miami Business Council</h1>
            <p className={styles.heroSubtitle}>
              Building a stronger business community through visionary leadership,
              strategic collaboration, and unwavering commitment to excellence.
            </p>
          </div>
        </section>

        {/* Executive Director */}
        <section className={styles.executiveSection}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Executive Leadership</h2>
            <div className={styles.executiveCard}>
              <div className={styles.executiveImage}>
                <Image
                  src={executiveDirector.image}
                  alt={executiveDirector.name}
                  width={300}
                  height={300}
                  className={styles.profileImage}
                />
              </div>
              <div className={styles.executiveInfo}>
                <h2>{executiveDirector.name}</h2>
                <p className={styles.title}>{executiveDirector.title}</p>
                <p className={styles.bio}>{executiveDirector.bio}</p>
                <Link href={executiveDirector.linkedin} className={styles.linkedinBtn} target="_blank">
                  Connect on LinkedIn
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Board of Directors */}
        <section className={styles.boardSection}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Board of Directors</h2>
            <div className={styles.boardGrid}>
              {boardMembers.map((member, index) => (
                <div key={index} className={styles.boardCard}>
                  <div className={styles.cardImage}>
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={200}
                      height={200}
                      className={styles.memberImage}
                    />
                  </div>
                  <h3>{member.name}</h3>
                  <p className={styles.memberTitle}>{member.title}</p>
                  <p className={styles.memberBio}>{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className="container">
            <h2>Join Our Community</h2>
            <p>Become part of Miami&apos;s premier business network and connect with industry leaders.</p>
            <div className={styles.ctaButtons}>
              <Link href="/membership" className={styles.btnPrimary}>
                Learn About Membership
              </Link>
              <Link href="/#email-signup" className={styles.btnSecondary}>
                Join Waitlist
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

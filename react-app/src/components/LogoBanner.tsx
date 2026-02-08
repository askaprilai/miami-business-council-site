'use client';

import Image from 'next/image';
import styles from './LogoBanner.module.css';

const logos = [
  { src: '/Images/askapril-logo.png', alt: 'AskApril AI' },
  { src: '/Images/ilmoda-logo.png', alt: 'Ilmoda' },
  { src: '/Images/mef-logo.png', alt: 'M.E.F. Productions LLC' },
  { src: '/Images/madyun-logo.png', alt: 'The Madyun Group' },
  { src: '/Images/fan_horizontal_4.svg', alt: 'FAN Business' },
  { src: '/Images/IMG_3955.jpeg', alt: 'IMG Business' },
  { src: '/Images/Logo_Global.png', alt: 'Local Global' },
  { src: '/Images/the-crowned-life-logo.png', alt: 'The Crowned Life' },
];

export default function LogoBanner() {
  // Triple the logos for seamless infinite scroll
  const allLogos = [...logos, ...logos, ...logos];

  return (
    <section className={styles.logoBanner}>
      <div className="container">
        <h2 className={styles.title}>Our Member Businesses</h2>
      </div>
      <div className={styles.logoSlider}>
        <div className={styles.logoTrack}>
          {allLogos.map((logo, index) => (
            <div key={index} className={styles.businessLogo}>
              <Image
                src={logo.src}
                alt={logo.alt}
                width={120}
                height={60}
                className={styles.logoImage}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <span className={styles.fallbackText}>{logo.alt}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

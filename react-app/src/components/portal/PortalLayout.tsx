'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import styles from './PortalLayout.module.css';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'smart-matches', label: 'Smart Matches', icon: '🎯' },
  { id: 'directory', label: 'Member Directory', icon: '👥' },
  { id: 'connections', label: 'Connections', icon: '🤝' },
  { id: 'messages', label: 'Messages', icon: '💬' },
  { id: 'events', label: 'Events', icon: '📅' },
  { id: 'collaboration-hub', label: 'Collaboration Hub', icon: '🤝' },
  { id: 'profile', label: 'My Profile', icon: '⚙️' },
  { id: 'admin', label: 'Admin Panel', icon: '👑', adminOnly: true },
];

interface PortalLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function PortalLayout({
  children,
  activeSection,
  onSectionChange
}: PortalLayoutProps) {
  const { member, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    onSectionChange(sectionId);
    setIsMobileMenuOpen(false);
  };

  const visibleNavItems = navItems.filter(
    item => !item.adminOnly || member?.is_admin
  );

  return (
    <div className={styles.portalContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.logo}>
            <Image
              src="/Images/MBC WHITE LOGO NONTRANSPARENT (1).png"
              alt="Miami Business Council"
              width={50}
              height={50}
              className={styles.logoImage}
            />
            <span className={styles.logoText}>Member Portal</span>
          </Link>

          <div className={styles.headerRight}>
            {member && (
              <div className={styles.userInfo}>
                <span className={styles.userName}>
                  {member.first_name} {member.last_name}
                </span>
                <span className={styles.membershipBadge}>
                  {member.membership_type}
                </span>
              </div>
            )}
            <button onClick={signOut} className={styles.signOutBtn}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className={styles.mainContainer}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            {visibleNavItems.map((item) => (
              <button
                key={item.id}
                className={`${styles.navItem} ${activeSection === item.id ? styles.active : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className={styles.mobileNav}>
        {visibleNavItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            className={`${styles.mobileNavItem} ${activeSection === item.id ? styles.active : ''}`}
            onClick={() => handleNavClick(item.id)}
          >
            <span className={styles.mobileNavIcon}>{item.icon}</span>
            <span className={styles.mobileNavLabel}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

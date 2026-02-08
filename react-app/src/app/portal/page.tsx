'use client';

import { useEffect } from 'react';

export default function PortalPage() {
  useEffect(() => {
    // Redirect to the working HTML portal
    window.location.href = 'https://miamibusinesscouncil.com/portal.html';
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#121212',
      color: '#fff'
    }}>
      <p>Redirecting to Member Portal...</p>
    </div>
  );
}

import { Header, Hero, About, Events, Footer } from '@/components';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Events />
        {/* Additional sections will be added here:
            - Resources
            - ConnectBenefits
            - LogoBanner
            - PortalPreviewModal
            - FloatingCTA
        */}
      </main>
      <Footer />
    </>
  );
}

import {
  Header,
  Hero,
  About,
  Events,
  Resources,
  ConnectBenefits,
  LogoBanner,
  FloatingCTA,
  Footer,
} from '@/components';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Events />
        <Resources />
        <ConnectBenefits />
        <LogoBanner />
      </main>
      <Footer />
      <FloatingCTA />
    </>
  );
}

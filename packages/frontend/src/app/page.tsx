import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import PaymentMethods from '@/components/landing/PaymentMethods';
import Pricing from '@/components/landing/Pricing';
import Testimonials from '@/components/landing/Testimonials';
import CTA from '@/components/landing/CTA';

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <PaymentMethods />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}

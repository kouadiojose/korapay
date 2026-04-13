import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Pricing from '@/components/landing/Pricing';

export default function PricingPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-16">
        <Pricing />
      </div>
      <Footer />
    </main>
  );
}

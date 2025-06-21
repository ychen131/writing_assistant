import LandingHeader from '@/components/landing/LandingHeader';
import LandingHero from '@/components/landing/LandingHero';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-green-50">
      <LandingHeader />
      <LandingHero />
    </div>
  );
}

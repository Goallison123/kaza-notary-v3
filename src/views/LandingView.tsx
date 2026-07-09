import LandingNav from './landing/LandingNav';
import HeroSection from './landing/HeroSection';
import FeaturesSection from './landing/FeaturesSection';
import TestimonialsSection from './landing/TestimonialsSection';
import PricingSection from './landing/PricingSection';
import FAQSection from './landing/FAQSection';

interface LandingViewProps {
  onEnterApp: () => void;
}

export default function LandingView({ onEnterApp }: LandingViewProps) {
  return (
    <div className="min-h-screen">
      <LandingNav onEnterApp={onEnterApp} />
      <HeroSection onEnterApp={onEnterApp} />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection onEnterApp={onEnterApp} />
      <FAQSection onEnterApp={onEnterApp} />
    </div>
  );
}

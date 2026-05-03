import React, { useEffect, useState } from 'react';
import { ArrowRight, Shield, FlaskConical, Award } from 'lucide-react';

interface HeroProps {
  onShopAll: () => void;
}

const Hero: React.FC<HeroProps> = ({ onShopAll }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative min-h-[90vh] overflow-hidden bg-white flex items-center justify-center">

      {/* ── Background Decorative Elements ── */}

      {/* Soft pink blob - top left */}
      <div
        className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full opacity-30 blur-3xl animate-pulse"
        style={{ background: '#FFD6E3', animationDuration: '7s' }}
      />

      {/* Soft pink blob - bottom right */}
      <div
        className="absolute -bottom-32 -right-20 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl animate-pulse"
        style={{ background: '#FFC2D5', animationDuration: '9s' }}
      />

      {/* Pastel pink circle - top right */}
      <div
        className="absolute top-16 right-[10%] w-[250px] h-[250px] rounded-full opacity-15 blur-2xl"
        style={{ background: 'radial-gradient(circle, #FFEAF1, transparent 70%)' }}
      />

      {/* Primary pink circle - bottom left */}
      <div
        className="absolute bottom-20 left-[8%] w-[200px] h-[200px] rounded-full opacity-20 blur-2xl animate-pulse"
        style={{ background: 'radial-gradient(circle, #FFB6C9, transparent 70%)', animationDuration: '8s' }}
      />

      {/* Small soft pink accent - mid right */}
      <div
        className="absolute top-1/2 right-[5%] w-[120px] h-[120px] rounded-full opacity-20 blur-xl"
        style={{ background: '#FFD6E3' }}
      />

      {/* ── DNA Helix SVG Decorations ── */}

      {/* DNA helix - top right */}
      <svg
        className="absolute top-12 right-12 w-40 h-40 opacity-[0.07] text-brand-500"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path d="M60 10 C80 30, 120 30, 140 10" />
        <path d="M60 40 C80 60, 120 60, 140 40" />
        <path d="M60 70 C80 90, 120 90, 140 70" />
        <path d="M60 100 C80 120, 120 120, 140 100" />
        <path d="M60 130 C80 150, 120 150, 140 130" />
        <path d="M60 160 C80 180, 120 180, 140 160" />
        <path d="M60 10 C80 -10, 120 -10, 140 10" opacity="0.5" />
        <line x1="75" y1="20" x2="125" y2="20" strokeWidth="0.8" />
        <line x1="68" y1="50" x2="132" y2="50" strokeWidth="0.8" />
        <line x1="75" y1="80" x2="125" y2="80" strokeWidth="0.8" />
        <line x1="68" y1="110" x2="132" y2="110" strokeWidth="0.8" />
        <line x1="75" y1="140" x2="125" y2="140" strokeWidth="0.8" />
        <line x1="68" y1="170" x2="132" y2="170" strokeWidth="0.8" />
        <circle cx="60" cy="10" r="3" fill="currentColor" opacity="0.3" />
        <circle cx="140" cy="40" r="3" fill="currentColor" opacity="0.3" />
        <circle cx="60" cy="70" r="3" fill="currentColor" opacity="0.3" />
        <circle cx="140" cy="100" r="3" fill="currentColor" opacity="0.3" />
      </svg>

      {/* DNA helix - bottom left */}
      <svg
        className="absolute bottom-16 left-12 w-36 h-36 opacity-[0.06] text-brand-400"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path d="M60 20 C80 40, 120 40, 140 20" />
        <path d="M60 50 C80 70, 120 70, 140 50" />
        <path d="M60 80 C80 100, 120 100, 140 80" />
        <path d="M60 110 C80 130, 120 130, 140 110" />
        <path d="M60 140 C80 160, 120 160, 140 140" />
        <path d="M60 170 C80 190, 120 190, 140 170" />
        <line x1="70" y1="30" x2="130" y2="30" strokeWidth="0.8" />
        <line x1="70" y1="60" x2="130" y2="60" strokeWidth="0.8" />
        <line x1="70" y1="90" x2="130" y2="90" strokeWidth="0.8" />
        <line x1="70" y1="120" x2="130" y2="120" strokeWidth="0.8" />
        <line x1="70" y1="150" x2="130" y2="150" strokeWidth="0.8" />
      </svg>

      {/* Pastel circles - left side */}
      <svg
        className="absolute top-1/3 left-4 w-16 h-64 opacity-[0.06] text-brand-300"
        viewBox="0 0 60 250"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <circle cx="30" cy="40" r="18" />
        <circle cx="30" cy="100" r="12" />
        <circle cx="30" cy="150" r="22" />
        <circle cx="30" cy="210" r="10" />
      </svg>

      {/* Pastel circles - right side */}
      <svg
        className="absolute top-1/4 right-4 w-16 h-64 opacity-[0.06] text-brand-300"
        viewBox="0 0 60 250"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <circle cx="30" cy="30" r="14" />
        <circle cx="30" cy="90" r="20" />
        <circle cx="30" cy="160" r="10" />
        <circle cx="30" cy="220" r="16" />
      </svg>

      {/* ── Main Content (Centered) ── */}
      <div className={`
        relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto px-4 sm:px-6 py-20
        transition-all duration-1000 ease-out transform
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
      `}>

        {/* Brand Logo */}
        <div className="mb-6">
          <img
            src="/logo.png?v=3"
            alt="Pepstack Davao"
            className="h-48 sm:h-56 md:h-64 w-auto object-contain mx-auto drop-shadow-lg"
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-semibold text-charcoal-900 mb-4 leading-tight tracking-tight">
          Premium Peptide Solutions, Delivered with Care
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-charcoal-500 mb-10 leading-relaxed font-light max-w-lg">
          Advanced peptide solutions designed for innovation and research.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={onShopAll}
            className="w-full sm:w-auto px-8 py-4 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
            style={{ background: 'linear-gradient(135deg, #FFD6E3, #FFB6C9)' }}
          >
            Explore Products
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onShopAll}
            className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-brand-300 text-brand-500 hover:bg-brand-50 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center"
          >
            Learn More
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-14 flex flex-wrap justify-center gap-6 border-t border-charcoal-100 pt-8 w-full">
          {[
            { icon: Shield, label: '99% Purity Guaranteed' },
            { icon: FlaskConical, label: 'Lab Tested' },
            { icon: Award, label: 'Premium Grade' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm font-medium text-charcoal-500">
              <item.icon className="w-4 h-4 text-brand-400" />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;

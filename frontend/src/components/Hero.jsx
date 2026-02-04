import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ChevronDown } from 'lucide-react';

export const Hero = () => {
  const { t } = useLanguage();

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="hero-section grain-overlay" data-testid="hero-section">
      {/* Background Image */}
      <div
        className="hero-bg"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1672825953834-a686738c5047?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxnb2xmJTIwY291cnNlJTIwb2NlYW4lMjB2aWV3JTIwc3Vubnl8ZW58MHx8fHwxNzcwMTg2NjYxfDA&ixlib=rb-4.1.0&q=85')`,
        }}
      />
      <div className="hero-overlay" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container-custom w-full">
          <div className="max-w-3xl">
            {/* Subtitle */}
            <p
              className="text-brand-sand text-sm uppercase tracking-[0.3em] mb-6 opacity-0 animate-fade-in-up stagger-1"
              data-testid="hero-subtitle"
            >
              {t('hero.subtitle')}
            </p>

            {/* Title */}
            <h1
              className="font-heading text-5xl md:text-7xl text-white font-medium leading-tight mb-8 opacity-0 animate-fade-in-up stagger-2"
              data-testid="hero-title"
            >
              {t('hero.title')}
            </h1>

            {/* Description */}
            <p
              className="text-white/80 text-lg md:text-xl leading-relaxed mb-12 max-w-xl opacity-0 animate-fade-in-up stagger-3"
              data-testid="hero-description"
            >
              {t('hero.description')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-in-up stagger-4">
              <button
                onClick={() => scrollToSection('contact')}
                className="btn-primary text-base"
                data-testid="hero-cta-primary"
              >
                {t('hero.cta')}
              </button>
              <button
                onClick={() => scrollToSection('courses')}
                className="btn-secondary border-white/50 text-white hover:bg-white hover:text-brand-green"
                data-testid="hero-cta-secondary"
              >
                {t('hero.ctaSecondary')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={() => scrollToSection('about')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors cursor-pointer z-10"
        data-testid="scroll-indicator"
      >
        <ChevronDown className="w-8 h-8 animate-bounce" />
      </button>
    </section>
  );
};

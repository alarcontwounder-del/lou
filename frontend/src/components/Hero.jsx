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
          backgroundImage: `url('https://customer-assets.emergentagent.com/job_422d7e07-6f75-490f-aee9-3e5fef6c152e/artifacts/42pl3jtx_golf%20son-gual%20mallorca%20portada%20hole13-%20copy.JPG')`,
        }}
      />
      <div className="hero-overlay" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container-custom w-full">
          <div className="max-w-3xl">
            {/* Subtitle */}
            <p
              className="text-brand-sand text-sm uppercase tracking-[0.3em] mb-6 opacity-0 animate-fade-in-up stagger-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              data-testid="hero-subtitle"
            >
              {t('hero.subtitle')}
            </p>

            {/* Title */}
            <h1
              className="font-heading text-5xl md:text-7xl text-white font-medium leading-tight mb-8 opacity-0 animate-fade-in-up stagger-2 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
              data-testid="hero-title"
            >
              {t('hero.title')}
            </h1>

            {/* Description */}
            <p
              className="text-white text-lg md:text-xl leading-relaxed mb-12 max-w-xl opacity-0 animate-fade-in-up stagger-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              data-testid="hero-description"
            >
              {t('hero.description')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-in-up stagger-4">
              <a
                href="https://golfinmallorca.greenfee365.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-base inline-flex items-center justify-center gap-2"
                data-testid="hero-book-tee-time"
              >
                {t('hero.bookTeeTime')}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
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

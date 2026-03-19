import React from 'react';
import { useLanguage } from '../context/LanguageContext';

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
      <div className="relative z-10 min-h-screen flex flex-col justify-center px-4 sm:px-6 pt-40 sm:pt-44 md:pt-48 pb-24">
        <div className="container-custom w-full">
          <div className="max-w-3xl">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-5 sm:mb-6 opacity-0 animate-fade-in-up stagger-1"
              data-testid="hero-subtitle"
            >
              <span className="text-white font-semibold text-sm sm:text-base tracking-wide">Est. 2003</span>
              <span className="w-px h-5 bg-white/50"></span>
              <span className="text-white font-semibold text-sm sm:text-base tracking-wide">Mallorca's First Golf Agency</span>
            </div>

            {/* Brand story */}
            <p
              className="text-white text-base sm:text-lg md:text-xl leading-relaxed mb-8 sm:mb-10 max-w-2xl opacity-0 animate-fade-in-up stagger-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] font-medium"
              data-testid="hero-brand-story"
            >
              Leaders in innovation with the island's first 24/7 real-time booking system service.
            </p>

            {/* Title */}
            <h1
              className="font-heading text-4xl sm:text-5xl md:text-7xl text-white font-medium leading-tight mb-8 sm:mb-10 opacity-0 animate-fade-in-up stagger-3 drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]"
              data-testid="hero-title"
            >
              {t('hero.title')}
            </h1>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-3 opacity-0 animate-fade-in-up stagger-4">
              <a
                href="https://golfinmallorca.greenfee365.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-full bg-white text-stone-800 hover:bg-stone-100 transition-all duration-300 shadow-lg hover:shadow-xl"
                data-testid="hero-book-tee-time"
              >
                {t('hero.bookTeeTime')}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Elegant phantom arrow */}
      <button
        onClick={() => scrollToSection('about')}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 group"
        data-testid="scroll-indicator"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-white/60 text-xs uppercase tracking-[0.2em] font-light group-hover:text-white/80 transition-colors">Scroll</span>
          <div className="w-8 h-14 rounded-full border-2 border-white/30 flex items-start justify-center pt-2 group-hover:border-white/50 transition-colors">
            <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce group-hover:bg-white/80 transition-colors"></div>
          </div>
        </div>
      </button>
    </section>
  );
};

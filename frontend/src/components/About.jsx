import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle } from 'lucide-react';

export const About = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="pt-12 pb-6 bg-brand-cream" data-testid="about-section">
      <div className="container-custom max-w-4xl mx-auto text-center">
        <p className="text-brand-slate text-sm uppercase tracking-[0.2em] mb-4" data-testid="about-subtitle">
          {t('about.subtitle')}
        </p>
        <h2 className="font-heading text-4xl md:text-5xl text-stone-900 mb-6" data-testid="about-title">
          {t('about.title')}
        </h2>
        <p className="text-stone-600 text-lg leading-relaxed mb-10" data-testid="about-description">
          {t('about.description')}
        </p>

        {/* Points - horizontal on desktop */}
        <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-12">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-brand-slate flex-shrink-0" />
            <p className="text-stone-700 text-sm">{t('about.point1')}</p>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-brand-slate flex-shrink-0" />
            <p className="text-stone-700 text-sm">{t('about.point2')}</p>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-brand-slate flex-shrink-0" />
            <p className="text-stone-700 text-sm">{t('about.point3')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

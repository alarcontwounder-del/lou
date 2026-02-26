import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle } from 'lucide-react';

export const About = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="section-padding bg-brand-cream" data-testid="about-section">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <p className="text-brand-slate text-sm uppercase tracking-[0.2em] mb-4" data-testid="about-subtitle">
              {t('about.subtitle')}
            </p>
            <h2 className="font-heading text-4xl md:text-5xl text-stone-900 mb-6" data-testid="about-title">
              {t('about.title')}
            </h2>
            <p className="text-stone-600 text-lg leading-relaxed mb-8" data-testid="about-description">
              {t('about.description')}
            </p>

            {/* Points */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-brand-slate flex-shrink-0 mt-0.5" />
                <p className="text-stone-700">{t('about.point1')}</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-brand-slate flex-shrink-0 mt-0.5" />
                <p className="text-stone-700">{t('about.point2')}</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-brand-slate flex-shrink-0 mt-0.5" />
                <p className="text-stone-700">{t('about.point3')}</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="aspect-[4/5] img-zoom rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/api/static/images/about-golf.jpg"
                  alt="Golf Alcanada course in Mallorca"
                  className="w-full h-full object-cover"
                  data-testid="about-image"
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-brand-slate/30 -z-10 rounded-2xl" />
              <div className="absolute -top-6 -right-6 w-24 h-24 border-2 border-brand-slate/30 -z-10 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

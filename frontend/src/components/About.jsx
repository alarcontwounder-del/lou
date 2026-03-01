import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle } from 'lucide-react';

export const About = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="section-padding bg-brand-cream" data-testid="about-section">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <p className="text-brand-slate text-sm uppercase tracking-[0.2em] mb-4" data-testid="about-subtitle">
              {t('about.subtitle')}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl text-stone-900 mb-5" data-testid="about-title">
              {t('about.title')}
            </h2>
            <p className="text-stone-600 text-base leading-relaxed mb-6" data-testid="about-description">
              {t('about.description')}
            </p>

            {/* Points */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-brand-slate flex-shrink-0 mt-0.5" />
                <p className="text-stone-700 text-sm">{t('about.point1')}</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-brand-slate flex-shrink-0 mt-0.5" />
                <p className="text-stone-700 text-sm">{t('about.point2')}</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-brand-slate flex-shrink-0 mt-0.5" />
                <p className="text-stone-700 text-sm">{t('about.point3')}</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="aspect-[4/3] img-zoom rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://customer-assets.emergentagent.com/job_e972e808-34ad-4ed5-9add-1b44d86f7c5d/artifacts/b8qqdpbf_4031807808_4672471f49_o%20copia%20copy.jpg"
                  alt="Golf course panorama in Mallorca at sunset"
                  className="w-full h-full object-cover object-top"
                  data-testid="about-image"
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-brand-slate/20 -z-10 rounded-2xl" />
              <div className="absolute -top-4 -right-4 w-20 h-20 border-2 border-brand-slate/20 -z-10 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

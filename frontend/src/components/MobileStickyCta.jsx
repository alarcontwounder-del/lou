import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { trackEvent } from '../lib/analytics';

export default function MobileStickyCta() {
  const { t } = useLanguage();

  // Hide on admin pages
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-3"
        style={{
          background: 'rgba(26, 26, 26, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))'
        }}
        data-testid="mobile-sticky-cta-wrapper"
      >
        <a
          href="https://golfinmallorca.greenfee365.com/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('book_tee_time_click', {
            location: 'mobile_sticky',
            destination: 'greenfee365'
          })}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold text-black bg-white hover:bg-white/90 transition-colors shadow-lg"
          data-testid="mobile-sticky-cta"
        >
          {t('hero.bookTeeTime')} <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      {/* Spacer to prevent content overlap with footer */}
      <div className="md:hidden h-16" aria-hidden="true" />
    </>
  );
}

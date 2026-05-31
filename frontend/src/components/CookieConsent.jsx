import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'gim_cookie_consent';

function WhiteCookieIcon({ size = 32, maskId = 'cookieBite' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <circle cx="20.5" cy="4" r="3.6" fill="black" />
          <circle cx="17.8" cy="2.2" r="1.3" fill="black" />
          <circle cx="22.2" cy="9.5" r="1.5" fill="black" />
        </mask>
      </defs>
      <circle cx="12" cy="12" r="10" fill="#FFFFFF" mask={`url(#${maskId})`} />
      <circle cx="7" cy="8.8" r="1.6" fill="#1a1a1a" />
      <circle cx="14.2" cy="14.5" r="1.7" fill="#1a1a1a" />
      <circle cx="9" cy="15.8" r="1.3" fill="#1a1a1a" />
      <circle cx="11.5" cy="11" r="0.65" fill="#1a1a1a" />
    </svg>
  );
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, date: new Date().toISOString() }));
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: false, date: new Date().toISOString() }));
    setVisible(false);
  };

  if (!visible) return null;

  const renderCookieBox = (variant) => (
    <div className="w-[260px] bg-stone-900/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 p-5 text-center">
      <div className="mx-auto mb-3 w-8 h-8 flex items-center justify-center">
        <WhiteCookieIcon size={32} maskId={`cookieBoxBite-${variant}`} />
      </div>
      <p className="text-white/90 text-[13px] leading-relaxed mb-1">
        This website uses cookies to ensure you get the best experience.
      </p>
      <a href="/privacy" className="text-white/50 text-[11px] underline underline-offset-2 hover:text-white/80 transition-colors" data-testid={`cookie-learn-more-${variant}`}>
        Learn more
      </a>
      <button
        onClick={handleAccept}
        className="w-full mt-4 border border-white/40 text-white hover:bg-white/15 text-sm font-semibold py-2.5 rounded-lg transition-all duration-200"
        data-testid={`cookie-accept-${variant}`}
      >
        Accept
      </button>
      <button
        onClick={handleDecline}
        className="w-full mt-2 text-white/50 hover:text-white/80 text-xs font-medium py-1.5 transition-colors"
        data-testid={`cookie-decline-${variant}`}
      >
        Preferences
      </button>
    </div>
  );

  return (
    <>
      {/* Pill móvil — solo si NO expandido */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          aria-label="Cookie consent"
          data-testid="cookie-pill"
          className="md:hidden fixed bottom-20 right-4 z-[9999] w-12 h-12 flex items-center justify-center bg-transparent border-none p-0 cursor-pointer hover:scale-110 active:scale-95 transition-transform animate-in fade-in duration-500"
          style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.55)) drop-shadow(0 2px 4px rgba(0,0,0,.4))' }}
        >
          <WhiteCookieIcon size={48} maskId="cookiePillBite" />
        </button>
      )}

      {/* Cuadro desktop — siempre visible bottom-left (glass actual conservado) */}
      <div
        className="hidden md:block fixed bottom-6 left-6 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-500"
        data-testid="cookie-consent-banner"
      >
        {renderCookieBox('desktop')}
      </div>

      {/* Modal móvil — solo si expandido (backdrop coherente con el glass del sitio) */}
      {expanded && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setExpanded(false); }}
          data-testid="cookie-consent-mobile"
          className="md:hidden fixed inset-0 z-[9999] bg-stone-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          {renderCookieBox('mobile')}
        </div>
      )}
    </>
  );
}

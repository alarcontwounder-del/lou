import React, { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';

const STORAGE_KEY = 'gim_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(function() {
    var consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      var timer = setTimeout(function() { setVisible(true); }, 1500);
      return function() { clearTimeout(timer); };
    }
  }, []);

  var handleAccept = function() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, date: new Date().toISOString() }));
    setVisible(false);
  };

  var handleDecline = function() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: false, date: new Date().toISOString() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 left-6 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-500"
      data-testid="cookie-consent-banner"
    >
      <div className="w-[260px] bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-stone-200/60 p-5 text-center">
        <Cookie className="w-8 h-8 text-stone-700 mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-stone-700 text-[13px] leading-relaxed mb-1">
          This website uses cookies to ensure you get the best experience.
        </p>
        <a href="https://golfinmallorca.com" className="text-stone-400 text-[11px] underline underline-offset-2 hover:text-stone-600 transition-colors" data-testid="cookie-learn-more">
          Learn more
        </a>
        <button
          onClick={handleAccept}
          className="w-full mt-4 border-2 border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white text-sm font-semibold py-2.5 rounded-lg transition-all duration-200"
          data-testid="cookie-accept"
        >
          Accept
        </button>
        <button
          onClick={handleDecline}
          className="w-full mt-2 text-stone-500 hover:text-stone-700 text-xs font-medium py-1.5 transition-colors"
          data-testid="cookie-decline"
        >
          Preferences
        </button>
      </div>
    </div>
  );
}

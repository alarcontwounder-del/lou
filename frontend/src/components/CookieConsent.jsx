import React, { useState, useEffect } from 'react';
import { X, Shield } from 'lucide-react';

const STORAGE_KEY = 'gim_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6" data-testid="cookie-consent-banner">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Main banner */}
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 bg-stone-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Shield className="w-4 h-4 text-brand-slate" />
            </div>
            <div>
              <h3 className="font-heading text-lg text-stone-900 mb-1">We value your privacy</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                We use essential cookies to keep the site functional and secure. No tracking or advertising cookies are used.{' '}
                <button
                  onClick={function() { setShowDetails(!showDetails); }}
                  className="text-brand-slate underline underline-offset-2 hover:text-stone-900 transition-colors"
                  data-testid="cookie-learn-more"
                >
                  {showDetails ? 'Hide details' : 'Learn more'}
                </button>
              </p>
            </div>
          </div>

          {/* Expandable details */}
          {showDetails && (
            <div className="mb-4 ml-12 bg-stone-50 rounded-xl p-4 text-sm text-stone-600 space-y-3" data-testid="cookie-details">
              <div>
                <p className="font-medium text-stone-800 mb-1">Essential Cookies</p>
                <p className="text-xs leading-relaxed">Session cookies are used to authenticate administrators. These are strictly necessary for the site to function and do not require consent under GDPR Article 6(1)(f).</p>
              </div>
              <div>
                <p className="font-medium text-stone-800 mb-1">Local Storage</p>
                <p className="text-xs leading-relaxed">We store your language preference and cookie consent choice locally on your device. No personal data is transmitted to third parties.</p>
              </div>
              <div>
                <p className="font-medium text-stone-800 mb-1">No Tracking</p>
                <p className="text-xs leading-relaxed">This site does not use Google Analytics, Facebook Pixel, or any third-party tracking cookies.</p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-3 ml-12">
            <button
              onClick={handleAccept}
              className="bg-brand-charcoal hover:bg-stone-700 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors"
              data-testid="cookie-accept"
            >
              Accept All
            </button>
            <button
              onClick={handleDecline}
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium px-6 py-2.5 rounded-full transition-colors"
              data-testid="cookie-decline"
            >
              Necessary Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

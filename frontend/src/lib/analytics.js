/**
 * GA4 Event Tracking Utility
 * Sends custom events to Google Analytics for conversion tracking.
 */
export const trackEvent = (eventName, params = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
};

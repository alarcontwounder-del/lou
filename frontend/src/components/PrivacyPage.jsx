import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ChevronRight } from 'lucide-react';

export default function PrivacyPage() {
  useEffect(function() {
    window.scrollTo(0, 0);
    document.title = 'Privacy Policy | golfinmallorca.com';
    var setMeta = function(attr, name, content) {
      var el = document.querySelector('meta[' + attr + '="' + name + '"]');
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('name', 'description', 'Privacy policy for golfinmallorca.com. Learn how we collect, use, and protect your personal data in compliance with GDPR and Spanish data protection law.');
    setMeta('name', 'robots', 'index, follow');
    return function() { document.title = 'golfinmallorca.com | Your Gateway to Luxury Golf in Mallorca'; };
  }, []);

  return (
    <div className="min-h-screen bg-brand-cream" data-testid="privacy-page">
      <Navbar onAdminClick={function(){}} isAuthenticated={false} isCheckingAuth={true} onSearchClick={function(){}} onPlanTrip={function(){}} />

      <nav className="max-w-3xl mx-auto px-4 pt-28 pb-2">
        <ol className="flex items-center gap-1.5 text-xs text-stone-400">
          <li><Link to="/" className="hover:text-stone-600 transition-colors">Home</Link></li>
          <ChevronRight className="w-3 h-3 text-stone-300" />
          <li className="text-stone-500">Privacy Policy</li>
        </ol>
      </nav>

      <article className="max-w-3xl mx-auto px-4 pb-20">
        <h1 className="font-heading text-3xl sm:text-4xl text-stone-900 mb-3 mt-4" data-testid="privacy-title">Privacy Policy</h1>
        <p className="text-stone-400 text-sm mb-10">Last updated: March 2026</p>

        <div className="space-y-8 text-stone-700 text-[15px] leading-relaxed">

          <section>
            <p>golfinmallorca.com ("we", "us", "our") is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and share your information when you visit our website or use our services, in compliance with the General Data Protection Regulation (GDPR - EU 2016/679) and the Spanish Organic Law 3/2018 on Data Protection (LOPDGDD).</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-900 mb-3">1. Data Controller</h2>
            <div className="bg-stone-50 rounded-xl p-5 text-sm space-y-1">
              <p><strong className="text-stone-900">golfinmallorca.com</strong></p>
              <p>Email: <a href="mailto:contact@golfinmallorca.com" className="text-brand-slate hover:underline">contact@golfinmallorca.com</a></p>
              <p>Phone: <a href="tel:+34620987575" className="text-brand-slate hover:underline">+34 620 987 575</a></p>
              <p>Location: Mallorca, Balearic Islands, Spain</p>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-900 mb-3">2. Information We Collect</h2>
            <p>We collect the following types of personal data:</p>

            <h3 className="font-semibold text-stone-800 mt-4 mb-2">Information you provide directly:</h3>
            <ul className="list-disc ml-6 space-y-1.5">
              <li><strong>Contact inquiries:</strong> Name, email address, phone number, country, and message content when you use our contact forms</li>
              <li><strong>Trip planning:</strong> Name, email, phone, travel dates, golf preferences, group size, budget range, and accommodation preferences when you use our Trip Planner</li>
              <li><strong>Newsletter:</strong> Email address when you subscribe to our newsletter</li>
              <li><strong>Payments:</strong> Name and email address for payment processing (credit card details are handled directly by Stripe and never stored on our servers)</li>
            </ul>

            <h3 className="font-semibold text-stone-800 mt-4 mb-2">Information collected automatically:</h3>
            <ul className="list-disc ml-6 space-y-1.5">
              <li><strong>Essential cookies:</strong> Session cookies for site functionality and admin authentication</li>
              <li><strong>Local storage:</strong> Language preferences and cookie consent status</li>
            </ul>

            <p className="mt-3 bg-stone-50 rounded-xl p-4 text-sm"><strong>We do not use</strong> Google Analytics, Facebook Pixel, or any third-party tracking, advertising, or profiling cookies.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-900 mb-3">3. How We Use Your Data</h2>
            <p>We process your personal data for the following purposes:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1.5">
              <li><strong>To respond to your inquiries</strong> (legal basis: legitimate interest, Art. 6(1)(f) GDPR)</li>
              <li><strong>To process bookings and payments</strong> (legal basis: contract performance, Art. 6(1)(b) GDPR)</li>
              <li><strong>To send booking confirmations and payment receipts</strong> (legal basis: contract performance)</li>
              <li><strong>To create personalized trip itineraries</strong> (legal basis: consent, Art. 6(1)(a) GDPR)</li>
              <li><strong>To send newsletters</strong> you have subscribed to (legal basis: consent, Art. 6(1)(a) GDPR)</li>
              <li><strong>To maintain site security and functionality</strong> (legal basis: legitimate interest, Art. 6(1)(f) GDPR)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-900 mb-3">4. Data Sharing</h2>
            <p>We may share your personal data with:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1.5">
              <li><strong>Golf courses and hotels</strong> in Mallorca to fulfil your booking (only the data necessary for the reservation)</li>
              <li><strong>Stripe</strong> for secure payment processing (<a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-slate hover:underline">Stripe Privacy Policy</a>)</li>
              <li><strong>Resend</strong> for transactional email delivery (<a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-brand-slate hover:underline">Resend Privacy Policy</a>)</li>
            </ul>
            <p className="mt-3">We do not sell, rent, or trade your personal data to any third party for marketing purposes.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-900 mb-3">5. Data Retention</h2>
            <p>We retain your personal data only for as long as necessary to fulfil the purposes for which it was collected:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1.5">
              <li><strong>Contact inquiries:</strong> Up to 24 months after last communication</li>
              <li><strong>Booking records:</strong> Up to 5 years for legal and tax compliance</li>
              <li><strong>Newsletter subscriptions:</strong> Until you unsubscribe</li>
              <li><strong>Payment records:</strong> As required by Spanish tax law (minimum 4 years)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-900 mb-3">6. Your Rights</h2>
            <p>Under GDPR, you have the following rights regarding your personal data:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1.5">
              <li><strong>Right of access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Right to rectification:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Right to erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
              <li><strong>Right to restrict processing:</strong> Request limitation of how we use your data</li>
              <li><strong>Right to data portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li><strong>Right to object:</strong> Object to processing based on legitimate interest</li>
              <li><strong>Right to withdraw consent:</strong> Withdraw consent for newsletter or marketing at any time</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, contact us at <a href="mailto:contact@golfinmallorca.com" className="text-brand-slate hover:underline">contact@golfinmallorca.com</a>. We will respond within 30 days.</p>
            <p className="mt-2">You also have the right to lodge a complaint with the Spanish Data Protection Agency (AEPD) at <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-brand-slate hover:underline">www.aepd.es</a>.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-900 mb-3">7. Cookies</h2>
            <p>Our website uses only essential cookies necessary for the site to function:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1.5">
              <li><strong>Session cookies:</strong> For admin authentication (strictly necessary, exempt from consent under GDPR Art. 6(1)(f))</li>
              <li><strong>Local storage:</strong> Language preference and cookie consent choice (stored locally on your device, no data transmitted)</li>
            </ul>
            <p className="mt-3">We do not use advertising, analytics, or third-party tracking cookies of any kind.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-900 mb-3">8. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal data, including:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1.5">
              <li>HTTPS encryption for all data in transit</li>
              <li>Secure payment processing via Stripe (PCI DSS compliant)</li>
              <li>Restricted access to personal data within our team</li>
              <li>Regular security reviews of our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-900 mb-3">9. International Data Transfers</h2>
            <p>Your data may be processed by service providers located outside the European Economic Area (EEA). In such cases, we ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs) approved by the European Commission, to protect your data in accordance with GDPR requirements.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-900 mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Significant changes will be communicated through our website. We encourage you to review this page periodically.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-900 mb-3">11. Contact</h2>
            <p>For any privacy-related questions or to exercise your rights:</p>
            <div className="mt-3 bg-stone-50 rounded-xl p-5 text-sm space-y-1">
              <p><strong className="text-stone-900">golfinmallorca.com</strong></p>
              <p>Email: <a href="mailto:contact@golfinmallorca.com" className="text-brand-slate hover:underline">contact@golfinmallorca.com</a></p>
              <p>Phone: <a href="tel:+34620987575" className="text-brand-slate hover:underline">+34 620 987 575</a></p>
              <p>Location: Mallorca, Balearic Islands, Spain</p>
            </div>
          </section>

        </div>
      </article>

      <Footer />
    </div>
  );
}

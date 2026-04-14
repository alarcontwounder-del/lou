import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ChevronRight } from 'lucide-react';

export default function TermsPage() {
  useEffect(function() {
    window.scrollTo(0, 0);
    document.title = 'Terms of Service | golfinmallorca.com';
    const setMeta = function(attr, name, content) {
      const el = document.querySelector('meta[' + attr + '="' + name + '"]');
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('name', 'description', 'Terms of service for golfinmallorca.com. Read our booking conditions, cancellation policies, payment terms, and service agreements.');
    setMeta('name', 'robots', 'index, follow');
    const mainCanonical = document.getElementById('main-canonical');
    if (mainCanonical) mainCanonical.href = 'https://golfinmallorca.com/terms';
    return function() {
      document.title = 'golfinmallorca.com | Your Gateway to Luxury Golf in Mallorca';
      if (mainCanonical) mainCanonical.href = 'https://golfinmallorca.com/';
    };
  }, []);

  return (
    <div className="min-h-screen bg-brand-cream" data-testid="terms-page">
      <Navbar onAdminClick={function(){}} isAuthenticated={false} isCheckingAuth={true} onSearchClick={function(){}} onPlanTrip={function(){}} variant="light" />

      <nav className="max-w-3xl mx-auto px-4 pt-28 pb-2">
        <ol className="flex items-center gap-1.5 text-xs text-stone-400">
          <li><Link to="/" className="hover:text-stone-600 transition-colors">Home</Link></li>
          <ChevronRight className="w-3 h-3 text-stone-300" />
          <li className="text-stone-500">Terms of Service</li>
        </ol>
      </nav>

      <article className="max-w-3xl mx-auto px-4 pb-20">
        <h1 className="font-heading text-3xl sm:text-4xl text-stone-900 mb-3 mt-4" data-testid="terms-title">Terms of Service</h1>
        <p className="text-stone-400 text-sm mb-10">Last updated: March 2026</p>

        <div className="space-y-8 text-stone-700 text-[15px] leading-relaxed">

          <section>
            <p>These terms and conditions apply to all services provided directly or indirectly by golfinmallorca.com, including those made available online, through any mobile device, by email, or by telephone. By accessing, browsing, and using our website and/or by completing a booking or inquiry, you acknowledge and agree to have read, understood, and agreed to the terms and conditions set out below, including our Privacy Policy.</p>
            <p className="mt-3">golfinmallorca.com operates as a golf travel consultancy and booking service based in Mallorca, Spain. Our website and services are provided for your personal, non-commercial use only, subject to the terms and conditions set out below.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-900 mb-3">1. Scope of Our Service</h2>
            <p>Through our platform, we provide a golf travel consultancy service through which golf courses, hotels, and related service providers (hereinafter "Suppliers") can offer their products and services, and through which visitors can make inquiries, request quotes, and complete bookings.</p>
            <p className="mt-3">When you make a booking through golfinmallorca.com, you may enter into a direct contractual relationship with the Supplier. In such cases, we act as an intermediary, facilitating the connection between you and the Supplier. For custom packages arranged directly through our team, the contractual relationship is between you and golfinmallorca.com.</p>
            <p className="mt-3">While we use reasonable skill and care in performing our services, the information displayed on our platform is based on information provided by Suppliers. We cannot guarantee that all information is accurate, complete, or up to date at all times.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-900 mb-3">2. Bookings and Payments</h2>
            <p>Bookings can be made through our Trip Planner tool, by contacting us directly via email or phone, or through payment links sent by our team. All prices are displayed in Euros (EUR) unless otherwise stated.</p>
            <p className="mt-3">Payments processed through our platform are handled securely via Stripe. golfinmallorca.com never stores your full credit card details. By making a payment, you confirm that you are authorized to use the payment method provided.</p>
            <p className="mt-3">For reservation deposits and full package payments, golfinmallorca.com may send you a secure payment link via email. These links are valid for the period stated in the email and are for single use only.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-900 mb-3">3. Cancellation and Refund Policy</h2>
            <p>Cancellation policies vary depending on the Supplier and the type of service booked. The applicable cancellation policy will be communicated to you at the time of booking and included in your confirmation email.</p>
            <p className="mt-3"><strong className="text-stone-900">General guidelines:</strong></p>
            <ul className="list-disc ml-6 mt-2 space-y-1.5">
              <li>Cancellations made more than 72 hours before the scheduled service are generally eligible for a full refund, minus any processing fees.</li>
              <li>Cancellations made within 72 hours may be subject to partial or no refund, depending on the Supplier's policy.</li>
              <li>No-shows are not eligible for refunds.</li>
              <li>Custom packages and peak-season bookings may have different cancellation terms, which will be clearly stated before payment.</li>
            </ul>
            <p className="mt-3">If you wish to cancel or modify a booking, please contact us as soon as possible at <a href="mailto:contact@golfinmallorca.com" className="text-brand-slate hover:underline">contact@golfinmallorca.com</a> or call <a href="tel:+34620987575" className="text-brand-slate hover:underline">+34 620 987 575</a>.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-900 mb-3">4. Credit Card and Payment Security</h2>
            <p>All online payments are processed securely through Stripe using industry-standard encryption (TLS/SSL). golfinmallorca.com does not store, process, or have access to your full credit card number.</p>
            <p className="mt-3">In the event of suspected credit card fraud or unauthorized use, please contact your card issuer immediately and notify us at <a href="mailto:contact@golfinmallorca.com" className="text-brand-slate hover:underline">contact@golfinmallorca.com</a>.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-900 mb-3">5. Third-Party Suppliers</h2>
            <p>golfinmallorca.com partners with golf courses, hotels, transfer services, and other providers in Mallorca. While we carefully select our partners, each Supplier is independently responsible for the quality and delivery of their services.</p>
            <p className="mt-3">Our platform does not constitute a recommendation or endorsement of any Supplier's quality, service level, or facilities beyond our genuine experience and opinion. Ratings, descriptions, and photos are provided to help you make informed decisions.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-900 mb-3">6. Limitation of Liability</h2>
            <p>To the extent permitted by law, golfinmallorca.com shall only be liable for direct damages actually suffered due to a proven shortcoming in our services, up to the total amount paid for the relevant booking.</p>
            <p className="mt-3">We shall not be liable for:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1.5">
              <li>Services rendered directly by Suppliers (golf courses, hotels, transfer companies)</li>
              <li>Inaccuracies in information provided by Suppliers</li>
              <li>Force majeure events (weather, natural disasters, strikes, pandemics)</li>
              <li>Any indirect, consequential, or punitive damages</li>
              <li>Temporary unavailability of our platform due to maintenance or technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-900 mb-3">7. Intellectual Property</h2>
            <p>All content on golfinmallorca.com, including text, images, logos, design, and software, is protected by intellectual property rights. You may not reproduce, distribute, or use any content from our platform without prior written consent.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-900 mb-3">8. Governing Law</h2>
            <p>These terms and conditions shall be governed by and construed in accordance with Spanish law. Any disputes arising from these terms or our services shall be submitted to the courts of Palma de Mallorca, Spain.</p>
            <p className="mt-3">If any provision of these terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-900 mb-3">9. Contact Information</h2>
            <p>If you have any questions about these terms, please contact us:</p>
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

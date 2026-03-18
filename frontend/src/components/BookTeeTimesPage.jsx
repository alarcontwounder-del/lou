import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Newsletter } from '../components/Newsletter';
import { CourseCard } from '../components/GolfCourses';
import { ChevronRight, ExternalLink, Clock, Shield, CreditCard, Headphones, Tag, Calendar } from 'lucide-react';

export default function BookTeeTimesPage() {
  const { language, t } = useLanguage();
  const { golfCourses } = useData();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Book Tee Times in Mallorca | 16 Courses | Instant Confirmation | Golfinmallorca.com';
    const setMeta = (attr, name, content) => {
      let el = document.querySelector('meta[' + attr + '="' + name + '"]');
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('name', 'description', 'Book tee times at 16 golf courses in Mallorca with instant confirmation. Green fees from EUR47. Discount tee times, last-minute deals, and group bookings. The island\'s leading golf booking service since 2003.');
    setMeta('property', 'og:title', 'Book Tee Times in Mallorca | 16 Courses | Instant Confirmation');
    setMeta('property', 'og:description', 'Book tee times at 16 premium golf courses in Mallorca. Instant confirmation, best rates, discount deals. Expert booking service since 2003.');
    setMeta('property', 'og:url', 'https://golfinmallorca.com/book-tee-times');
    setMeta('property', 'og:type', 'website');

    let canonical = document.getElementById('booktee-canonical');
    if (!canonical) { canonical = document.createElement('link'); canonical.id = 'booktee-canonical'; canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = 'https://golfinmallorca.com/book-tee-times';

    let schema = document.getElementById('booktee-schema');
    if (!schema) { schema = document.createElement('script'); schema.id = 'booktee-schema'; schema.type = 'application/ld+json'; document.head.appendChild(schema); }
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Book Tee Times in Mallorca',
      description: 'Instant tee time booking at 16 golf courses in Mallorca, Ibiza, and Menorca. Best rates guaranteed.',
      provider: { '@id': 'https://golfinmallorca.com/#organization' },
      serviceType: 'Golf Tee Time Booking',
      areaServed: { '@id': 'https://golfinmallorca.com/#mallorca' },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'EUR',
        lowPrice: '47',
        highPrice: '175',
        offerCount: '16',
        availability: 'https://schema.org/InStock'
      }
    });

    return () => {
      document.title = 'Golf in Mallorca | Book Tee Times, Golf Holidays & Packages';
      const s = document.getElementById('booktee-schema'); if (s) s.remove();
      const c = document.getElementById('booktee-canonical'); if (c) c.remove();
    };
  }, []);

  // Sort courses by price
  const sortedCourses = [...golfCourses].sort((a, b) => (a.price_from || 999) - (b.price_from || 999));

  return (
    <div className="min-h-screen bg-brand-cream" data-testid="book-tee-times-page">
      <Navbar onAdminClick={() => {}} isAuthenticated={false} isCheckingAuth={false} variant="light" />

      {/* Hero */}
      <section className="bg-stone-900 text-white pt-8 pb-16" data-testid="booktee-hero">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <nav className="flex items-center gap-2 text-stone-400 text-xs mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-stone-200">Book Tee Times</span>
          </nav>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl mb-4" data-testid="booktee-title">
            Book Tee Times in Mallorca
          </h1>
          <p className="text-stone-300 text-lg max-w-2xl mb-8">
            Instant online booking at 16 golf courses across Mallorca, Ibiza, and Menorca. Best rates guaranteed with free cancellation options. Green fees from EUR47.
          </p>
          <a
            href="https://golfinmallorca.greenfee365.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-stone-900 px-6 py-3 rounded-full font-semibold text-sm hover:bg-stone-100 transition-all shadow-lg"
            data-testid="booktee-main-btn"
          >
            Book a Tee Time Now<ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 py-16" data-testid="booking-benefits">
        <h2 className="font-heading text-2xl md:text-3xl text-stone-900 mb-3">Why Book Tee Times Through Us?</h2>
        <p className="text-stone-500 mb-10 max-w-2xl">As the only golf booking service based on Mallorca since 2003, we offer unmatched local expertise and the best rates at every course.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BenefitCard
            icon={<Clock className="w-6 h-6" />}
            title="Instant Confirmation"
            description="Book your tee time online and receive instant confirmation. No waiting, no phone calls, no uncertainty."
            testId="benefit-instant"
          />
          <BenefitCard
            icon={<Tag className="w-6 h-6" />}
            title="Best Rate Guarantee"
            description="We negotiate directly with courses to offer the best green fee rates in Mallorca. Find a lower price and we'll match it."
            testId="benefit-rate"
          />
          <BenefitCard
            icon={<Calendar className="w-6 h-6" />}
            title="Last-Minute Deals"
            description="Looking for discount tee times? We offer last-minute deals and off-peak rates for budget-conscious golfers."
            testId="benefit-lastminute"
          />
          <BenefitCard
            icon={<Shield className="w-6 h-6" />}
            title="Free Cancellation"
            description="Plans change — we understand. Many bookings include free cancellation up to 24 hours before your tee time."
            testId="benefit-cancel"
          />
          <BenefitCard
            icon={<CreditCard className="w-6 h-6" />}
            title="Secure Payment"
            description="Pay securely online or at the course. We accept all major credit cards and offer flexible payment options for groups."
            testId="benefit-payment"
          />
          <BenefitCard
            icon={<Headphones className="w-6 h-6" />}
            title="Golf Concierge Support"
            description="Need help choosing a course? Our Mallorca-based concierge team provides personal recommendations based on your skill level and preferences."
            testId="benefit-concierge"
          />
        </div>
      </section>

      {/* Course Price Table */}
      <section className="bg-white py-16" data-testid="price-overview">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <h2 className="font-heading text-2xl md:text-3xl text-stone-900 mb-3">Mallorca Golf Course Green Fees</h2>
          <p className="text-stone-500 mb-10 max-w-2xl">Quick overview of green fees at all 16 courses. Click any course for full details, photos, and instant booking.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left" data-testid="price-table">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="py-3 text-stone-600 text-sm font-semibold">Course</th>
                  <th className="py-3 text-stone-600 text-sm font-semibold">Location</th>
                  <th className="py-3 text-stone-600 text-sm font-semibold">Holes</th>
                  <th className="py-3 text-stone-600 text-sm font-semibold">Par</th>
                  <th className="py-3 text-stone-600 text-sm font-semibold">Green Fee From</th>
                  <th className="py-3 text-stone-600 text-sm font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {sortedCourses.map(c => (
                  <tr key={c.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="py-3 text-stone-900 font-medium text-sm">
                      <Link to={'/golf-courses/' + c.id} className="hover:text-stone-600 transition-colors">{c.name}</Link>
                    </td>
                    <td className="py-3 text-stone-500 text-sm">{c.location}</td>
                    <td className="py-3 text-stone-500 text-sm">{c.holes}</td>
                    <td className="py-3 text-stone-500 text-sm">{c.par}</td>
                    <td className="py-3 text-stone-900 font-semibold text-sm">{c.price_from ? 'EUR ' + c.price_from : '-'}</td>
                    <td className="py-3">
                      <a
                        href={c.booking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-900 text-xs font-medium transition-colors"
                      >
                        Book<ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Top Picks */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 py-16" data-testid="top-picks">
        <h2 className="font-heading text-2xl md:text-3xl text-stone-900 mb-3">Most Popular Courses to Book</h2>
        <p className="text-stone-500 mb-10">These are the most-booked golf courses in Mallorca. Hover the cards for quick details and booking links.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sortedCourses.slice(0, 3).map(c => (
            <CourseCard key={c.id} course={c} language={language} t={t} />
          ))}
        </div>
      </section>

      {/* Booking Tips */}
      <section className="bg-white py-16" data-testid="booking-tips">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <h2 className="font-heading text-2xl md:text-3xl text-stone-900 mb-3">Tips for Booking Tee Times in Mallorca</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <TipCard
              title="Book Early for Peak Season"
              text="March-May and September-November are peak golf months in Mallorca. Book your tee times at least 2-4 weeks in advance, especially at popular courses like Golf Alcanada and Son Gual."
            />
            <TipCard
              title="Take Advantage of Twilight Rates"
              text="Many Mallorca courses offer discounted green fees for afternoon and twilight rounds. Ask about off-peak rates to save on your golf budget."
            />
            <TipCard
              title="Consider Multi-Round Packages"
              text="Booking multiple rounds? Our golf concierge can arrange multi-course packages with discounted rates, saving you 10-20% compared to individual bookings."
            />
            <TipCard
              title="Group Bookings Get Special Rates"
              text="Groups of 8+ golfers qualify for special rates at most Mallorca courses. Contact us for customised group pricing, including competitions and dinner arrangements."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-900 text-white py-16" data-testid="booktee-cta">
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
          <h2 className="font-heading text-2xl md:text-3xl mb-4">Ready to Book Your Round?</h2>
          <p className="text-stone-300 mb-8">Choose from 16 courses across Mallorca, Ibiza, and Menorca. Instant confirmation, best rates, expert local support.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://golfinmallorca.greenfee365.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-stone-900 px-6 py-3 rounded-full font-semibold text-sm hover:bg-stone-100 transition-all"
              data-testid="booktee-bottom-btn"
            >
              Book Tee Times Now<ExternalLink className="w-4 h-4" />
            </a>
            <Link
              to="/#contact"
              className="inline-flex items-center gap-2 border border-stone-500 text-stone-200 px-6 py-3 rounded-full font-semibold text-sm hover:border-white hover:text-white transition-all"
            >
              Contact Golf Concierge
            </Link>
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer />
    </div>
  );
}

function BenefitCard({ icon, title, description, testId }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm" data-testid={testId}>
      <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-stone-600 mb-4">
        {icon}
      </div>
      <h3 className="font-heading text-lg text-stone-900 mb-2">{title}</h3>
      <p className="text-stone-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function TipCard({ title, text }) {
  return (
    <div className="flex gap-4">
      <div className="w-2 bg-stone-200 rounded-full flex-shrink-0" />
      <div>
        <h3 className="font-heading text-lg text-stone-900 mb-1">{title}</h3>
        <p className="text-stone-500 text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

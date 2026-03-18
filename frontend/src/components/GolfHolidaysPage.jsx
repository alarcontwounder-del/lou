import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Newsletter } from '../components/Newsletter';
import { CourseCard } from '../components/GolfCourses';
import { ChevronRight, ExternalLink, MapPin, Sun, Users, Plane, Hotel, UtensilsCrossed, Car } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function GolfHolidaysPage() {
  const { language, t } = useLanguage();
  const { golfCourses } = useData();
  const navigate = useNavigate();

  const goToContact = () => {
    navigate('/', { state: { scrollTo: 'contact' } });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Golf Holidays in Mallorca | Packages, Deals & Stay and Play | Golfinmallorca.com';
    const setMeta = (attr, name, content) => {
      let el = document.querySelector('meta[' + attr + '="' + name + '"]');
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('name', 'description', 'Plan your perfect golf holiday in Mallorca. Stay and play packages, luxury golf resort deals, weekend breaks, group trips, and corporate golf events. 16 courses, expert concierge service since 2003.');
    setMeta('property', 'og:title', 'Golf Holidays in Mallorca | Packages, Deals & Stay and Play');
    setMeta('property', 'og:description', 'Custom golf holiday packages in Mallorca — stay and play deals, luxury resort packages, weekend breaks, and group golf trips. Expert concierge since 2003.');
    setMeta('property', 'og:url', 'https://golfinmallorca.com/golf-holidays-mallorca');
    setMeta('property', 'og:type', 'website');

    let canonical = document.getElementById('holidays-canonical');
    if (!canonical) { canonical = document.createElement('link'); canonical.id = 'holidays-canonical'; canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = 'https://golfinmallorca.com/golf-holidays-mallorca';

    let schema = document.getElementById('holidays-schema');
    if (!schema) { schema = document.createElement('script'); schema.id = 'holidays-schema'; schema.type = 'application/ld+json'; document.head.appendChild(schema); }
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      name: 'Golf Holidays in Mallorca',
      description: 'Custom golf holiday packages in Mallorca including tee times, luxury hotels, dining, and transfers.',
      touristType: ['Golf Travelers', 'Luxury Tourists', 'Sports Enthusiasts'],
      provider: { '@id': 'https://golfinmallorca.com/#organization' },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'EUR',
        lowPrice: '199',
        offerCount: '16',
        availability: 'https://schema.org/InStock'
      }
    });

    return () => {
      document.title = 'Golf in Mallorca | Book Tee Times, Golf Holidays & Packages';
      const s = document.getElementById('holidays-schema'); if (s) s.remove();
      const c = document.getElementById('holidays-canonical'); if (c) c.remove();
    };
  }, []);

  const featuredCourses = golfCourses.slice(0, 6);

  return (
    <div className="min-h-screen bg-brand-cream" data-testid="golf-holidays-page">
      <Navbar onAdminClick={() => {}} isAuthenticated={false} isCheckingAuth={false} variant="light" />

      {/* Hero */}
      <section className="bg-brand-charcoal text-white pt-8 pb-16" data-testid="holidays-hero">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <nav className="flex items-center gap-2 text-stone-400 text-xs mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-stone-200">Golf Holidays</span>
          </nav>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl mb-4" data-testid="holidays-title">
            Golf Holidays in Mallorca
          </h1>
          <p className="text-stone-300 text-lg max-w-2xl mb-8">
            Custom golf holiday packages combining the best courses, luxury hotels, fine dining, and seamless transfers. Designed by Mallorca's only exclusive golf operator since 2003.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://golfinmallorca.greenfee365.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-brand-charcoal px-6 py-3 rounded-full font-semibold text-sm hover:bg-stone-100 transition-all"
              data-testid="holidays-book-btn"
            >
              Book Tee Times<ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={goToContact}
              className="inline-flex items-center gap-2 border border-stone-500 text-stone-200 px-6 py-3 rounded-full font-semibold text-sm hover:border-white hover:text-white transition-all"
              data-testid="holidays-enquiry-btn"
            >
              Request a Package Quote
            </button>
          </div>
        </div>
      </section>

      {/* Package Types */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 py-16" data-testid="package-types">
        <h2 className="font-heading text-2xl md:text-3xl text-stone-900 mb-3">Golf Holiday Packages We Offer</h2>
        <p className="text-stone-500 mb-10 max-w-2xl">Every package is personalised by our golf concierge team. Tell us your dates, budget, and preferences, and we'll handle the rest.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PackageCard
            icon={<Hotel className="w-6 h-6" />}
            title="Stay & Play Packages"
            description="Golf resort packages combining luxury hotel stays with tee times at premium courses. Breakfast, green fees, and buggy hire included."
            keywords="stay and play golf mallorca, golf resort packages mallorca"
            testId="package-stay-play"
          />
          <PackageCard
            icon={<Plane className="w-6 h-6" />}
            title="Golf Weekend Breaks"
            description="Short golf breaks from 2-4 nights. Fly in, play 2-3 courses, enjoy fine dining, and fly home refreshed. Perfect for a quick Mallorca golf getaway."
            keywords="golf weekend packages mallorca, golf breaks mallorca, cheap golf breaks mallorca"
            testId="package-weekend"
          />
          <PackageCard
            icon={<Users className="w-6 h-6" />}
            title="Group & Society Trips"
            description="Golf society trips and group bookings for 4-100+ players. Competition formats, group rates, restaurant bookings, and celebration dinners arranged."
            keywords="mallorca golf group booking, golf society trips mallorca, corporate golf events mallorca"
            testId="package-group"
          />
          <PackageCard
            icon={<Sun className="w-6 h-6" />}
            title="Luxury Golf Holidays"
            description="Premium 5-star golf vacations with VIP course access, private transfers, Michelin-starred dining, and spa treatments at the island's finest resorts."
            keywords="luxury golf holiday mallorca, vip golf experience mallorca, premium golf packages mallorca"
            testId="package-luxury"
          />
          <PackageCard
            icon={<Car className="w-6 h-6" />}
            title="All-Inclusive Golf Trips"
            description="Complete golf travel packages with flights, airport transfers, rental car, hotel, tee times, and dining reservations. Stress-free golf travel."
            keywords="mallorca golf trip packages, golf travel deals mallorca, golf airport transfer mallorca"
            testId="package-allinclusive"
          />
          <PackageCard
            icon={<UtensilsCrossed className="w-6 h-6" />}
            title="Golf & Gastronomy"
            description="Combine championship golf with Mallorca's world-class food scene. Play top courses by day, dine at Michelin-starred restaurants by night."
            keywords="golf experience mallorca, golf retreat mallorca, golf vacation mallorca"
            testId="package-gastro"
          />
        </div>
      </section>

      {/* Why Mallorca */}
      <section className="bg-white py-16" data-testid="why-mallorca">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <h2 className="font-heading text-2xl md:text-3xl text-stone-900 mb-3">Why Choose Mallorca for Your Golf Holiday?</h2>
          <p className="text-stone-500 mb-10 max-w-2xl">Mallorca is one of Europe's premier golf travel destinations, offering the perfect combination of world-class courses, year-round sunshine, and Mediterranean lifestyle.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <WhyCard title="16 Premium Golf Courses" text="From championship layouts like Golf Son Gual to scenic coastal courses like Golf Alcanada, Mallorca offers diverse golf for every handicap and budget. Green fees from EUR47." />
            <WhyCard title="Year-Round Sunshine" text="Over 300 days of sunshine per year. Play golf in Mallorca in spring, summer, autumn, or even mild winters. The peak golf seasons are March-May and September-November." />
            <WhyCard title="Easy European Access" text="Direct flights from most European cities in 2-3 hours. Palma airport is 15-30 minutes from the best courses. Perfect for golf weekends and last-minute breaks." />
            <WhyCard title="Luxury Beyond Golf" text="5-star hotels, Michelin-starred restaurants, exclusive beach clubs, and stunning Mediterranean beaches. Mallorca delivers a complete luxury holiday experience." />
            <WhyCard title="Expert Local Knowledge" text="As the only golf operator based on the island since 2003, we know every course, every hotel deal, and every hidden gem. Your personal golf concierge in Mallorca." />
            <WhyCard title="Value for Money" text="Mallorca offers excellent value compared to other European golf destinations. Stay-and-play packages, discount tee times, and group rates make it affordable for all budgets." />
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 py-16" data-testid="featured-courses">
        <h2 className="font-heading text-2xl md:text-3xl text-stone-900 mb-3">Top Golf Courses for Your Holiday</h2>
        <p className="text-stone-500 mb-10">Explore the best golf courses in Mallorca. Each course links to a detailed guide with green fees, booking, and travel info.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCourses.map(c => (
            <CourseCard key={c.id} course={c} language={language} t={t} />
          ))}
        </div>
        <div className="text-center mt-10">
          <button onClick={() => navigate('/', { state: { scrollTo: 'courses' } })} className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 font-medium transition-colors">
            View all 16 golf courses<ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-charcoal text-white py-16" data-testid="holidays-cta">
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
          <h2 className="font-heading text-2xl md:text-3xl mb-4">Ready to Plan Your Mallorca Golf Holiday?</h2>
          <p className="text-stone-300 mb-8">Tell us your dates, group size, and preferences. Our concierge team will design a personalised golf trip package within 24 hours.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={goToContact}
              className="inline-flex items-center gap-2 bg-white text-brand-charcoal px-6 py-3 rounded-full font-semibold text-sm hover:bg-stone-100 transition-all"
              data-testid="holidays-contact-btn"
            >
              Get a Free Quote
            </button>
            <a
              href="tel:+34620987575"
              className="inline-flex items-center gap-2 border border-stone-500 text-stone-200 px-6 py-3 rounded-full font-semibold text-sm hover:border-white hover:text-white transition-all"
            >
              Call +34 620 987 575
            </a>
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer />
    </div>
  );
}

function PackageCard({ icon, title, description, keywords, testId }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:shadow-md transition-shadow" data-testid={testId}>
      <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-stone-600 mb-4">
        {icon}
      </div>
      <h3 className="font-heading text-lg text-stone-900 mb-2">{title}</h3>
      <p className="text-stone-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function WhyCard({ title, text }) {
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

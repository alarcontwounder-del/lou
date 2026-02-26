import React, { useState, useEffect, useRef } from 'react';
import { Star, Languages, Search, X, Quote, ChevronDown, ChevronLeft, ChevronRight, ArrowRight, Globe, Users, Award } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const countryFlags = {
  'Germany': '🇩🇪', 'UK': '🇬🇧', 'US': '🇺🇸', 'Italy': '🇮🇹',
  'France': '🇫🇷', 'Sweden': '🇸🇪', 'Norway': '🇳🇴', 'Switzerland': '🇨🇭',
};

const avatarColors = [
  'bg-brand-charcoal', 'bg-brand-slate', 'bg-amber-600',
  'bg-brand-charcoal/80', 'bg-stone-600', 'bg-brand-slate/80',
];

// Platform logos as SVG components
const GoogleLogo = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const TrustpilotLogo = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#00B67A" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
);

const TripAdvisorLogo = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <circle fill="#34E0A1" cx="12" cy="12" r="10"/>
    <circle fill="white" cx="8" cy="11" r="3"/>
    <circle fill="white" cx="16" cy="11" r="3"/>
    <circle fill="#000" cx="8" cy="11" r="1.5"/>
    <circle fill="#000" cx="16" cy="11" r="1.5"/>
    <path fill="#FF5722" d="M12 15c-1.5 0-2.5.8-2.5.8s1 1.2 2.5 1.2 2.5-1.2 2.5-1.2S13.5 15 12 15z"/>
  </svg>
);

const platformConfig = {
  'Google Reviews': { 
    Logo: GoogleLogo,
    bg: 'bg-white', 
    text: 'text-stone-700', 
    border: 'border-stone-200',
    label: 'Google'
  },
  'Trustpilot': { 
    Logo: TrustpilotLogo,
    bg: 'bg-[#00B67A]/10', 
    text: 'text-[#00B67A]', 
    border: 'border-[#00B67A]/30',
    label: 'Trustpilot'
  },
  'TripAdvisor': { 
    Logo: TripAdvisorLogo,
    bg: 'bg-[#34E0A1]/10', 
    text: 'text-[#00AA6C]', 
    border: 'border-[#34E0A1]/30',
    label: 'TripAdvisor'
  },
  'Capterra': { 
    Logo: () => <span className="text-orange-500 font-bold text-xs">C</span>,
    bg: 'bg-orange-50', 
    text: 'text-orange-700', 
    border: 'border-orange-200',
    label: 'Capterra'
  },
  'Product Hunt': { 
    Logo: () => <span className="text-orange-600 font-bold text-xs">PH</span>,
    bg: 'bg-orange-50', 
    text: 'text-orange-700', 
    border: 'border-orange-200',
    label: 'Product Hunt'
  },
};

const getInitials = (name) => {
  const parts = name.split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase();
};

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star key={star} className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-stone-200 text-stone-200'}`} />
    ))}
  </div>
);

const ReviewCard = ({ review, index }) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  const flag = countryFlags[review.country] || '🌍';
  const initials = getInitials(review.user_name);
  const avatarColor = avatarColors[index % avatarColors.length];
  const isEnglish = review.language === 'EN';
  const displayText = showTranslation ? review.review_text_en : review.review_text;
  const platform = platformConfig[review.platform] || { 
    Logo: () => null, 
    bg: 'bg-stone-100', 
    text: 'text-stone-600', 
    border: 'border-stone-200', 
    label: review.platform 
  };

  useEffect(() => {
    const node = cardRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); } },
      { threshold: 0.1, rootMargin: '50px' }
    );
    if (node) observer.observe(node);
    return () => { if (node) observer.unobserve(node); };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative group ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${index * 50}ms` }}
      data-testid={`review-card-${review.id}`}
    >
      <Quote className="absolute top-4 right-4 w-8 h-8 text-brand-slate/20 group-hover:text-brand-slate/40 transition-colors" />
      
      {/* Platform Badge with Logo */}
      <div className={`${platform.bg} ${platform.text} border ${platform.border} text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-4`}>
        <platform.Logo />
        <span>{platform.label}</span>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-shrink-0">
          <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
            {initials}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm border border-stone-100">
            <span className="text-xs">{flag}</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="font-bold text-stone-900 leading-tight">{review.user_name}</p>
          <p className="text-sm text-stone-500">{review.age && `${review.age} · `}{review.country}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4"><StarRating rating={review.rating} /></div>
      <p className="text-stone-700 text-base leading-relaxed mb-4 italic font-serif">"{displayText}"</p>
      {!isEnglish && (
        <div className="pt-4 border-t border-stone-100">
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all ${
              showTranslation ? 'bg-brand-charcoal text-white shadow-sm hover:bg-brand-charcoal/90' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
            data-testid={`translate-btn-${review.id}`}
          >
            <Languages className="w-4 h-4" />
            {showTranslation ? 'Show Original' : 'See Translation'}
          </button>
        </div>
      )}
    </div>
  );
};

const REVIEWS_PER_PAGE = 9;

export const ReviewCarousel = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0, by_platform: {}, by_country: {} });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [platformFilter, setPlatformFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewsRes, statsRes] = await Promise.all([
          axios.get(BACKEND_URL + '/api/reviews'),
          axios.get(BACKEND_URL + '/api/reviews/stats')
        ]);
        setReviews(reviewsRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const platforms = ['All', ...Object.keys(stats.by_platform || {})];
  const countries = ['All', ...Object.keys(stats.by_country || {})];

  const filteredReviews = reviews.filter((review) => {
    const platformMatch = platformFilter === 'All' || review.platform === platformFilter;
    const countryMatch = countryFilter === 'All' || review.country === countryFilter;
    const searchMatch = searchQuery === '' ||
      review.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.review_text.toLowerCase().includes(searchQuery.toLowerCase());
    return platformMatch && countryMatch && searchMatch;
  });

  const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, platformFilter, countryFilter]);

  const uniqueCountries = Object.keys(stats.by_country || {});
  const marketLeader = uniqueCountries.length > 0
    ? Object.entries(stats.by_country).sort((a, b) => b[1] - a[1])[0]
    : null;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <section id="reviews" className="py-20 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-6 text-center text-stone-500">Loading reviews...</div>
      </section>
    );
  }

  return (
    <section id="reviews" className="py-20 bg-brand-cream" data-testid="reviews-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-10">
          <p className="text-brand-slate text-xs font-bold uppercase tracking-[0.3em] mb-4">
            Trusted by Golfers Worldwide
          </p>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-stone-900 mb-5 leading-tight">
            What Golfers are Saying
          </h2>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto">
            Join thousands of players across Europe and the US who save time and money booking their perfect round.
          </p>
        </div>

        {/* Statistics Bar */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm mb-10 overflow-hidden" data-testid="reviews-stats-bar">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-stone-100">
            <div className="flex flex-col items-center justify-center py-6 px-4" data-testid="stat-avg-rating">
              <div className="flex items-center gap-2 mb-1.5">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                <span className="text-4xl font-bold text-stone-900">{stats.average_rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-stone-500 uppercase tracking-widest font-semibold">Average Rating</span>
            </div>
            <div className="flex flex-col items-center justify-center py-6 px-4" data-testid="stat-global-reach">
              <div className="flex items-center gap-2 mb-1.5">
                <Globe className="w-6 h-6 text-brand-slate" />
                <span className="text-4xl font-bold text-stone-900">{uniqueCountries.length}</span>
              </div>
              <span className="text-xs text-stone-500 uppercase tracking-widest font-semibold">Global Reach</span>
            </div>
            <div className="flex flex-col items-center justify-center py-6 px-4" data-testid="stat-verified-reviews">
              <div className="flex items-center gap-2 mb-1.5">
                <Users className="w-6 h-6 text-brand-charcoal" />
                <span className="text-4xl font-bold text-stone-900">{stats.total_reviews}</span>
              </div>
              <span className="text-xs text-stone-500 uppercase tracking-widest font-semibold">Verified Reviews</span>
            </div>
            <div className="flex flex-col items-center justify-center py-6 px-4" data-testid="stat-market-leader">
              <div className="flex items-center gap-2 mb-1.5">
                <Award className="w-6 h-6 text-amber-500" />
                <span className="text-4xl font-bold text-stone-900">
                  {marketLeader ? `${countryFlags[marketLeader[0]] || ''}` : '—'}
                </span>
                <span className="text-lg font-bold text-stone-700">{marketLeader ? marketLeader[0] : ''}</span>
              </div>
              <span className="text-xs text-stone-500 uppercase tracking-widest font-semibold">Market Leader</span>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search by country, platform, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-12 py-4 rounded-2xl border border-stone-200 bg-white text-stone-700 placeholder-stone-400 focus:outline-none focus:border-brand-slate focus:ring-2 focus:ring-brand-slate/20 transition-all text-base shadow-sm"
              data-testid="review-search"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-center max-w-2xl mx-auto">
            {/* Platform Dropdown */}
            <div className="relative flex-1">
              <button
                onClick={() => { setIsPlatformDropdownOpen(!isPlatformDropdownOpen); setIsCountryDropdownOpen(false); }}
                className="w-full px-5 py-3 rounded-2xl border border-stone-200 bg-white text-left flex items-center justify-between gap-2 hover:border-brand-slate transition-all shadow-sm"
                data-testid="platform-filter"
              >
                <span className="text-stone-700 font-medium">{platformFilter === 'All' ? 'All Platforms' : platformFilter.replace(' Reviews', '')}</span>
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isPlatformDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isPlatformDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-lg z-20 max-h-64 overflow-y-auto">
                  {platforms.map((platform) => (
                    <button
                      key={platform}
                      onClick={() => { setPlatformFilter(platform); setIsPlatformDropdownOpen(false); }}
                      className={`w-full px-5 py-3 text-left hover:bg-stone-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl ${
                        platformFilter === platform ? 'bg-stone-50 font-semibold text-brand-charcoal' : 'text-stone-700'
                      }`}
                    >
                      {platform === 'All' ? 'All Platforms' : platform.replace(' Reviews', '')}
                      {platform !== 'All' && stats.by_platform[platform] && (
                        <span className="ml-2 text-xs text-stone-400">({stats.by_platform[platform]})</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Country Dropdown */}
            <div className="relative flex-1">
              <button
                onClick={() => { setIsCountryDropdownOpen(!isCountryDropdownOpen); setIsPlatformDropdownOpen(false); }}
                className="w-full px-5 py-3 rounded-2xl border border-stone-200 bg-white text-left flex items-center justify-between gap-2 hover:border-brand-slate transition-all shadow-sm"
                data-testid="country-filter"
              >
                <span className="flex items-center gap-2">
                  <span>{countryFilter !== 'All' ? countryFlags[countryFilter] : '🌍'}</span>
                  <span className="text-stone-700 font-medium">{countryFilter === 'All' ? 'All Countries' : countryFilter}</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCountryDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-lg z-20 max-h-64 overflow-y-auto">
                  {countries.map((country) => (
                    <button
                      key={country}
                      onClick={() => { setCountryFilter(country); setIsCountryDropdownOpen(false); }}
                      className={`w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-stone-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl ${
                        countryFilter === country ? 'bg-stone-50 font-semibold text-brand-charcoal' : 'text-stone-700'
                      }`}
                    >
                      <span>{country !== 'All' ? countryFlags[country] : '🌍'}</span>
                      <span className="flex-1">{country === 'All' ? 'All Countries' : country}</span>
                      {country !== 'All' && stats.by_country[country] && (
                        <span className="text-xs text-stone-400">({stats.by_country[country]})</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Grid — 3 columns, paginated */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedReviews.map((review, index) => (
            <ReviewCard key={review.id} review={review} index={index} />
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-16" data-testid="reviews-no-results">
            <p className="text-xl text-stone-600 font-medium">No reviews match your filters</p>
            <p className="text-stone-400 mt-2">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10" data-testid="reviews-pagination">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              data-testid="pagination-prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .reduce((acc, page, idx, arr) => {
                if (idx > 0 && page - arr[idx - 1] > 1) acc.push('...');
                acc.push(page);
                return acc;
              }, [])
              .map((item, idx) =>
                item === '...' ? (
                  <span key={`dots-${idx}`} className="w-8 text-center text-stone-400 text-sm">...</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => handlePageChange(item)}
                    className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                      currentPage === item
                        ? 'bg-brand-charcoal text-white shadow-md'
                        : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                    data-testid={`pagination-page-${item}`}
                  >
                    {item}
                  </button>
                )
              )}

            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              data-testid="pagination-next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="ml-4 text-sm text-stone-400">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        )}

        {/* Booking CTA Section */}
        <div className="mt-20 mb-10">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-charcoal via-brand-charcoal/90 to-brand-charcoalLight p-12 md:p-16 text-center shadow-2xl">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }}></div>
            </div>
            <div className="relative z-10">
              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
                Ready to hit the green?
              </h2>
              <p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                Book your perfect tee time at Mallorca's finest golf courses. Instant confirmation guaranteed.
              </p>
              <a
                href="https://golfinmallorca.greenfee365.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-white text-brand-charcoal font-bold text-lg px-10 py-5 rounded-full hover:bg-brand-cream hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                data-testid="booking-cta-button"
              >
                Book My Tee Time Now
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

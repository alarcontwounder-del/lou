import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Star, Quote, ChevronLeft, ChevronRight, Globe, Users, TrendingUp, Award, Search, Filter } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const countryFlags = {
  'Germany': '🇩🇪',
  'UK': '🇬🇧',
  'US': '🇺🇸',
  'Italy': '🇮🇹',
  'France': '🇫🇷',
  'Sweden': '🇸🇪',
  'Norway': '🇳🇴',
  'Switzerland': '🇨🇭',
  'Spain': '🇪🇸',
};

const PlatformBadge = ({ platform }) => {
  const platformStyles = {
    'Google Reviews': { bg: 'bg-white', text: 'text-stone-700', color: '#4285F4', label: 'Google' },
    'Trustpilot': { bg: 'bg-[#00B67A]', text: 'text-white', color: '#00B67A', label: 'Trustpilot' },
    'TripAdvisor': { bg: 'bg-[#34E0A1]', text: 'text-stone-800', color: '#34E0A1', label: 'TripAdvisor' },
    'Capterra': { bg: 'bg-[#FF9D28]', text: 'text-white', color: '#FF9D28', label: 'Capterra' },
    'Product Hunt': { bg: 'bg-[#DA552F]', text: 'text-white', color: '#DA552F', label: 'Product Hunt' },
  };
  const style = platformStyles[platform] || { bg: 'bg-stone-100', text: 'text-stone-600', color: '#666', label: platform };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}
      style={{ borderLeft: `3px solid ${style.color}` }}
    >
      {style.label}
    </span>
  );
};

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-stone-200 text-stone-200'}`}
      />
    ))}
  </div>
);

const ReviewCard = ({ review }) => {
  const flag = countryFlags[review.country] || '🌍';
  return (
    <div
      className="bg-white border border-stone-100 rounded-2xl p-5 hover:shadow-lg transition-shadow duration-300 relative group"
      data-testid={`review-card-${review.id}`}
    >
      <Quote className="absolute top-4 right-4 w-6 h-6 text-brand-sand/20 group-hover:text-brand-sand/40 transition-colors" />
      <div className="flex items-center justify-between mb-3">
        <PlatformBadge platform={review.platform} />
        <StarRating rating={review.rating} />
      </div>
      <p className="text-stone-600 text-sm italic leading-relaxed mb-4 line-clamp-4">
        "{review.review_text}"
      </p>
      <div className="flex items-center gap-3 pt-3 border-t border-stone-100">
        <div className="w-9 h-9 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-bold text-sm shrink-0">
          {review.user_name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-stone-900 text-sm">{review.user_name}</p>
          <p className="text-xs text-stone-400">{review.age} · {review.country}</p>
        </div>
        <span className="text-lg">{flag}</span>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, value, label, testId }) => (
  <div className="flex flex-col items-center text-center px-4 py-3" data-testid={testId}>
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-5 h-5 text-brand-terracotta" />
      <span className="text-3xl md:text-4xl font-bold text-stone-900">{value}</span>
    </div>
    <span className="text-xs md:text-sm text-stone-500 uppercase tracking-wider font-medium">{label}</span>
  </div>
);

const REVIEWS_PER_PAGE = 9;

export const Reviews = () => {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0, by_country: {}, by_platform: {} });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');

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

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = !searchTerm ||
      r.review_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.platform.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = !filterCountry || r.country === filterCountry;
    const matchesPlatform = !filterPlatform || r.platform === filterPlatform;
    return matchesSearch && matchesCountry && matchesPlatform;
  });

  const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterCountry, filterPlatform]);

  const uniqueCountries = Object.keys(stats.by_country || {});
  const marketLeader = uniqueCountries.length > 0
    ? Object.entries(stats.by_country).sort((a, b) => b[1] - a[1])[0]
    : null;

  if (loading) {
    return (
      <section id="reviews" className="section-padding bg-brand-cream">
        <div className="container-custom text-center">Loading reviews...</div>
      </section>
    );
  }

  return (
    <section id="reviews" className="section-padding bg-brand-cream" data-testid="reviews-section">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-brand-terracotta text-sm uppercase tracking-[0.2em] mb-4" data-testid="reviews-subtitle">
            {t('reviews.subtitle')}
          </p>
          <h2 className="font-heading text-4xl md:text-5xl text-stone-900 mb-3" data-testid="reviews-title">
            {t('reviews.title')}
          </h2>
          <p className="text-stone-500 max-w-2xl mx-auto text-base">
            {t('reviews.description')}
          </p>
        </div>

        {/* Statistics Bar */}
        <div
          className="bg-white rounded-2xl border border-stone-100 shadow-sm mb-8 divide-y sm:divide-y-0 sm:divide-x divide-stone-100"
          data-testid="reviews-stats-bar"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4">
            <StatCard
              icon={Star}
              value={stats.average_rating.toFixed(1)}
              label="Average Rating"
              testId="stat-avg-rating"
            />
            <StatCard
              icon={Globe}
              value={uniqueCountries.length}
              label="Global Reach"
              testId="stat-global-reach"
            />
            <StatCard
              icon={Users}
              value={stats.total_reviews}
              label="Verified Reviews"
              testId="stat-verified-reviews"
            />
            <StatCard
              icon={Award}
              value={marketLeader ? `${countryFlags[marketLeader[0]] || ''} ${marketLeader[0]}` : '—'}
              label="Market Leader"
              testId="stat-market-leader"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by country, platform, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-colors"
              data-testid="reviews-search"
            />
          </div>
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-4 py-2.5 border border-stone-200 rounded-xl text-sm bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-brand-green/20 cursor-pointer"
            data-testid="reviews-filter-platform"
          >
            <option value="">All Platforms</option>
            {Object.keys(stats.by_platform || {}).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="px-4 py-2.5 border border-stone-200 rounded-xl text-sm bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-brand-green/20 cursor-pointer"
            data-testid="reviews-filter-country"
          >
            <option value="">All Countries</option>
            {uniqueCountries.map(c => (
              <option key={c} value={c}>{countryFlags[c] || '🌍'} {c}</option>
            ))}
          </select>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-12 text-stone-400" data-testid="reviews-no-results">
            No reviews match your search. Try different keywords.
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8" data-testid="reviews-pagination">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                    onClick={() => setCurrentPage(item)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                      currentPage === item
                        ? 'bg-brand-green text-white shadow-sm'
                        : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                    data-testid={`pagination-page-${item}`}
                  >
                    {item}
                  </button>
                )
              )}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              data-testid="pagination-next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="ml-3 text-xs text-stone-400">
              Page {currentPage} of {totalPages} · {filteredReviews.length} reviews
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

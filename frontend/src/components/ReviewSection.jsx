import React, { useState, useEffect } from 'react';
import { Star, Languages, Search, X, Quote } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Country flags
const countryFlags = {
  'Germany': '🇩🇪', 'UK': '🇬🇧', 'US': '🇺🇸', 'Italy': '🇮🇹',
  'France': '🇫🇷', 'Sweden': '🇸🇪', 'Norway': '🇳🇴', 'Switzerland': '🇨🇭',
};

// Platform accent colors
const platformAccents = {
  'Google Reviews': {
    border: 'border-l-blue-500',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    accent: 'text-blue-600',
    hover: 'hover:border-blue-200',
  },
  'Trustpilot': {
    border: 'border-l-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accent: 'text-emerald-600',
    hover: 'hover:border-emerald-200',
  },
  'TripAdvisor': {
    border: 'border-l-green-500',
    badge: 'bg-green-50 text-green-700 border-green-200',
    accent: 'text-green-600',
    hover: 'hover:border-green-200',
  },
  'Yelp': {
    border: 'border-l-red-500',
    badge: 'bg-red-50 text-red-700 border-red-200',
    accent: 'text-red-600',
    hover: 'hover:border-red-200',
  },
  'Capterra': {
    border: 'border-l-orange-500',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    accent: 'text-orange-600',
    hover: 'hover:border-orange-200',
  },
  'G2': {
    border: 'border-l-rose-500',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    accent: 'text-rose-600',
    hover: 'hover:border-rose-200',
  },
  'Angi': {
    border: 'border-l-red-400',
    badge: 'bg-red-50 text-red-600 border-red-200',
    accent: 'text-red-500',
    hover: 'hover:border-red-200',
  },
  'Product Hunt': {
    border: 'border-l-orange-500',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    accent: 'text-orange-600',
    hover: 'hover:border-orange-200',
  },
};

// Avatar gradient colors
const avatarGradients = [
  'from-blue-400 to-blue-600',
  'from-emerald-400 to-emerald-600',
  'from-violet-400 to-violet-600',
  'from-rose-400 to-rose-600',
  'from-amber-400 to-amber-600',
  'from-cyan-400 to-cyan-600',
  'from-indigo-400 to-indigo-600',
  'from-teal-400 to-teal-600',
];

// Get initials from name
const getInitials = (name) => {
  const parts = name.split(' ');
  return parts.length >= 2 
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase();
};

// Star Rating Component
const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-4 h-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
      />
    ))}
  </div>
);

// Review Card Component - Using provided logic
const ReviewCard = ({ review }) => {
  const [showTranslation, setShowTranslation] = useState(false);

  // Use the actual English translation from backend, or mock if not available
  const englishText = review.review_text_en || "The booking process was incredibly smooth and the prices were excellent. Highly recommend for any golfer visiting Mallorca!";

  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Platform Badge */}
      <div className="absolute top-4 right-4">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
          review.platform === 'Trustpilot' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {review.platform.replace(' Reviews', '')}
        </span>
      </div>

      {/* Header: User Info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
          {review.user_name.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900 leading-none">{review.user_name}</h4>
            {review.age && <span className="text-xs text-slate-400">{review.age}y</span>}
            <span className="text-base">{countryFlags[review.country] || '🌍'}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{review.country}</p>
        </div>
      </div>

      {/* Rating */}
      <div className="flex gap-0.5 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
        ))}
      </div>

      {/* Review Text */}
      <div className="relative">
        <Quote size={16} className="text-slate-100 absolute -top-2 -left-2 -z-10" />
        <p className="text-slate-600 text-sm leading-relaxed italic">
          "{showTranslation ? englishText : review.review_text}"
        </p>
      </div>

      {/* Footer: Translation Toggle */}
      {review.language !== 'EN' && (
        <button 
          onClick={() => setShowTranslation(!showTranslation)}
          className="mt-4 flex items-center gap-2 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <Languages size={14} />
          {showTranslation ? 'Show Original' : 'Translate to English'}
        </button>
      )}
    </div>
  );
};

// Main ReviewSection Component
export const ReviewSection = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0, by_platform: {}, by_country: {} });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All Countries');
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

  // Filter options
  const filters = ['All', 'Google Reviews', 'Trustpilot', 'TripAdvisor'];
  const countries = ['All Countries', ...Object.keys(stats.by_country || {})];

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    const platformMatch = activeFilter === 'All' || review.platform === activeFilter;
    const countryMatch = countryFilter === 'All Countries' || review.country === countryFilter;
    const searchMatch = searchQuery === '' || 
      review.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.user_name.toLowerCase().includes(searchQuery.toLowerCase());
    return platformMatch && countryMatch && searchMatch;
  });

  if (loading) {
    return (
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">Loading reviews...</div>
      </section>
    );
  }

  return (
    <section id="reviews" className="py-16 md:py-24 bg-gray-50" data-testid="review-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block text-amber-600 text-xs sm:text-sm font-semibold tracking-widest uppercase mb-4">
            Trusted Worldwide
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-4 md:mb-6">
            Loved by golfers everywhere
          </h2>
          <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto px-4">
            See what our customers have to say about their booking experience
          </p>
          
          {/* Stats Row */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mt-8 md:mt-10">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <StarRating rating={5} />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.average_rating}</p>
              <p className="text-xs sm:text-sm text-gray-400">Average Rating</p>
            </div>
            <div className="w-px h-10 md:h-12 bg-gray-200 hidden sm:block"></div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.total_reviews}</p>
              <p className="text-xs sm:text-sm text-gray-400">Verified Reviews</p>
            </div>
            <div className="w-px h-10 md:h-12 bg-gray-200 hidden sm:block"></div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{Object.keys(stats.by_country || {}).length}</p>
              <p className="text-xs sm:text-sm text-gray-400">Countries</p>
            </div>
          </div>
        </div>

        {/* Search & Filters - Responsive */}
        <div className="flex flex-col gap-4 mb-8 md:mb-12">
          {/* Top Row: Search + Country Dropdown */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by country or platform..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all text-sm sm:text-base"
                data-testid="review-search"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* Country Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                className="w-full sm:w-48 px-4 py-3 rounded-xl border border-gray-200 bg-white text-left flex items-center justify-between gap-2 hover:border-gray-300 transition-all text-sm sm:text-base"
                data-testid="country-filter"
              >
                <span className="flex items-center gap-2">
                  <span>{countryFilter !== 'All Countries' ? countryFlags[countryFilter] : '🌍'}</span>
                  <span className="text-gray-700 truncate">{countryFilter}</span>
                </span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {isCountryDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-64 overflow-y-auto">
                  {countries.map((country) => (
                    <button
                      key={country}
                      onClick={() => {
                        setCountryFilter(country);
                        setIsCountryDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors text-sm ${
                        countryFilter === country ? 'bg-gray-50 font-medium' : ''
                      }`}
                    >
                      <span>{country !== 'All Countries' ? countryFlags[country] : '🌍'}</span>
                      <span className="text-gray-700">{country}</span>
                      {stats.by_country[country] && (
                        <span className="ml-auto text-xs text-gray-400">({stats.by_country[country]})</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Platform Filter Pills - Horizontally Scrollable on Mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-hide">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex-shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  activeFilter === filter
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {filter === 'Google Reviews' ? 'Google' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry Grid - Responsive Columns */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6">
          {filteredReviews.map((review, index) => (
            <div key={review.id} className="break-inside-avoid mb-4 sm:mb-6">
              <ReviewCard review={review} index={index} />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredReviews.length === 0 && (
          <div className="text-center py-16 md:py-20">
            <p className="text-4xl md:text-5xl mb-4">🔍</p>
            <p className="text-lg md:text-xl text-gray-600">No reviews found</p>
            <p className="text-gray-400 mt-2 text-sm md:text-base">Try a different search term or filter</p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveFilter('All'); setCountryFilter('All Countries'); }}
              className="mt-4 text-sm text-gray-500 underline hover:text-gray-700"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Results Count */}
        {filteredReviews.length > 0 && (
          <p className="text-center text-xs sm:text-sm text-gray-400 mt-8 md:mt-12">
            Showing {filteredReviews.length} of {reviews.length} reviews
          </p>
        )}
      </div>
    </section>
  );
};

// Also export as ReviewCarousel for backward compatibility
export const ReviewCarousel = ReviewSection;

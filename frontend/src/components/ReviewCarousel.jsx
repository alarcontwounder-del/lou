import React, { useState, useEffect } from 'react';
import { Star, Languages, Filter, Search, X, User, Quote, ChevronDown } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Country flags
const countryFlags = {
  'Germany': '🇩🇪', 'UK': '🇬🇧', 'US': '🇺🇸', 'Italy': '🇮🇹',
  'France': '🇫🇷', 'Sweden': '🇸🇪', 'Norway': '🇳🇴', 'Switzerland': '🇨🇭',
};

// Region mapping (kept for potential use)
const countryRegions = {
  'Germany': 'Europe', 'UK': 'Europe', 'Italy': 'Europe', 'France': 'Europe',
  'Sweden': 'Europe', 'Norway': 'Europe', 'Switzerland': 'Europe', 'US': 'USA',
};

// Premium avatar colors (warm, sophisticated)
const avatarColors = [
  'bg-brand-green', 'bg-brand-terracotta', 'bg-amber-600', 
  'bg-emerald-600', 'bg-stone-600', 'bg-teal-600',
];

// Platform badge styles (premium subtle colors)
const platformBadges = {
  'Google Reviews': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Google' },
  'Trustpilot': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Trustpilot' },
  'TripAdvisor': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'TripAdvisor' },
  'Yelp': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Yelp' },
  'Capterra': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Capterra' },
  'G2': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'G2' },
  'Angi': { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', label: 'Angi' },
  'Product Hunt': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Product Hunt' },
};

// Get initials
const getInitials = (name) => {
  const parts = name.split(' ');
  return parts.length >= 2 
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase();
};

// Get initials from name
const getInitials = (name) => {
  const parts = name.split(' ');
  return parts.length >= 2 
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase();
};

// Star Rating with Lucide icons (Gold/Yellow for premium feel)
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

// Review Card - Enhanced Premium Version with all Master Plan features
const ReviewCard = ({ review, index }) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const flag = countryFlags[review.country] || '🌍';
  const initials = getInitials(review.user_name);
  const avatarColor = avatarColors[index % avatarColors.length];
  const isEnglish = review.language === 'EN';
  const displayText = showTranslation ? review.review_text_en : review.review_text;
  const badge = platformBadges[review.platform] || { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200', label: review.platform };

  return (
    <div
      className="bg-white border border-stone-200 rounded-lg p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group"
      data-testid={`review-card-${review.id}`}
    >
      {/* Quote Icon - Subtle decorative element */}
      <Quote className="absolute top-4 right-4 w-8 h-8 text-brand-sand/20 group-hover:text-brand-sand/40 transition-colors" />

      {/* Platform Badge */}
      <div className={`${badge.bg} ${badge.text} border ${badge.border} text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4`}>
        {badge.label}
      </div>

      {/* Header - Circular avatar with flag + user info */}
      <div className="flex items-center gap-3 mb-4">
        {/* Circular Avatar with Initials */}
        <div className="relative flex-shrink-0">
          <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
            {initials}
          </div>
          {/* Circular Flag Badge */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm border border-stone-100">
            <span className="text-xs">{flag}</span>
          </div>
        </div>
        
        {/* User Info with Age */}
        <div className="flex-1">
          <p className="font-bold text-stone-900 leading-tight">{review.user_name}</p>
          <p className="text-sm text-stone-500">
            {review.age && `${review.age} · `}{review.country}
          </p>
        </div>
      </div>

      {/* Gold 5-Star Rating */}
      <div className="flex items-center gap-2 mb-4">
        <StarRating rating={review.rating} />
      </div>

      {/* Review Text - Italic Serif Font (as per master plan) */}
      <p className="text-stone-700 text-base leading-relaxed mb-4 italic font-serif">
        "{displayText}"
      </p>

      {/* Translation Toggle Button (for non-EN reviews) */}
      {!isEnglish && (
        <div className="pt-4 border-t border-stone-100">
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all ${
              showTranslation 
                ? 'bg-brand-green text-white shadow-sm' 
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
            data-testid={`translate-btn-${review.id}`}
          >
            <Languages className="w-4 h-4" />
            {showTranslation ? 'Show Original' : 'Translate to English'}
          </button>
        </div>
      )}
    </div>
  );
};

// Filter Pill
const FilterPill = ({ label, active, onClick, count }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
      active
        ? 'bg-slate-900 text-white shadow-md'
        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
    }`}
  >
    {label} {count !== undefined && <span className="ml-1 opacity-60">({count})</span>}
  </button>
);

// Main Component - Enhanced Premium Reviews Section
export const ReviewCarousel = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0, by_platform: {}, by_country: {} });
  const [loading, setLoading] = useState(true);
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
        
        {/* Section Header - Premium Luxury Style */}
        <div className="text-center mb-14">
          <p className="text-brand-terracotta text-xs font-bold uppercase tracking-[0.3em] mb-4">
            Trusted by Golfers Worldwide
          </p>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-stone-900 mb-5 leading-tight">
            What Golfers are Saying
          </h2>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto">
            Join thousands of players across Europe and the US who save time and money booking their perfect round.
          </p>
          
          {/* Stats Row with Gold Stars */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2">
              <StarRating rating={5} />
              <span className="text-2xl font-bold text-stone-900">{stats.average_rating}</span>
            </div>
            <span className="text-stone-300 text-2xl">·</span>
            <span className="text-stone-600 text-lg">{stats.total_reviews} verified reviews</span>
          </div>
          
          {/* Country Summary with Flags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            {Object.entries(stats.by_country || {}).map(([country, count]) => (
              <span key={country} className="inline-flex items-center gap-1.5 text-sm bg-white border border-stone-200 px-3 py-1.5 rounded-full shadow-sm">
                <span>{countryFlags[country]}</span>
                <span className="text-stone-600 font-medium">{count}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-12 space-y-5">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search by country, platform, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-12 py-4 rounded-xl border border-stone-200 bg-white text-stone-700 placeholder-stone-400 focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all text-base shadow-sm"
              data-testid="review-search"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns - Side by Side */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-center max-w-2xl mx-auto">
            {/* Platform Dropdown */}
            <div className="relative flex-1">
              <button
                onClick={() => {
                  setIsPlatformDropdownOpen(!isPlatformDropdownOpen);
                  setIsCountryDropdownOpen(false);
                }}
                className="w-full px-5 py-3 rounded-xl border border-stone-200 bg-white text-left flex items-center justify-between gap-2 hover:border-brand-green transition-all shadow-sm"
                data-testid="platform-filter"
              >
                <span className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-stone-400" />
                  <span className="text-stone-700 font-medium">
                    {platformFilter === 'All' ? 'All Platforms' : platformFilter.replace(' Reviews', '')}
                  </span>
                </span>
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isPlatformDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isPlatformDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-lg z-20 max-h-64 overflow-y-auto">
                  {platforms.map((platform) => (
                    <button
                      key={platform}
                      onClick={() => {
                        setPlatformFilter(platform);
                        setIsPlatformDropdownOpen(false);
                      }}
                      className={`w-full px-5 py-3 text-left hover:bg-stone-50 transition-colors ${
                        platformFilter === platform ? 'bg-stone-50 font-semibold text-brand-green' : 'text-stone-700'
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
                onClick={() => {
                  setIsCountryDropdownOpen(!isCountryDropdownOpen);
                  setIsPlatformDropdownOpen(false);
                }}
                className="w-full px-5 py-3 rounded-xl border border-stone-200 bg-white text-left flex items-center justify-between gap-2 hover:border-brand-green transition-all shadow-sm"
                data-testid="country-filter"
              >
                <span className="flex items-center gap-2">
                  <span>{countryFilter !== 'All' ? countryFlags[countryFilter] : '🌍'}</span>
                  <span className="text-stone-700 font-medium truncate">
                    {countryFilter === 'All' ? 'All Countries' : countryFilter}
                  </span>
                </span>
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isCountryDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-lg z-20 max-h-64 overflow-y-auto">
                  {countries.map((country) => (
                    <button
                      key={country}
                      onClick={() => {
                        setCountryFilter(country);
                        setIsCountryDropdownOpen(false);
                      }}
                      className={`w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-stone-50 transition-colors ${
                        countryFilter === country ? 'bg-stone-50 font-semibold text-brand-green' : 'text-stone-700'
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

        {/* 3-Column Masonry Grid (as per master plan) */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
          {filteredReviews.map((review, index) => (
            <div key={review.id} className="break-inside-avoid mb-6">
              <ReviewCard review={review} index={index} />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredReviews.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-stone-600 font-medium">No reviews match your filters</p>
            <p className="text-stone-400 mt-2">Try adjusting your search or filters</p>
          </div>
        )}
        
        {/* Results Count */}
        {filteredReviews.length > 0 && (
          <p className="text-center text-sm text-stone-400 mt-10">
            Showing {filteredReviews.length} of {reviews.length} reviews
          </p>
        )}
      </div>
    </section>
  );
};

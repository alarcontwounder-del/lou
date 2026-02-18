import React, { useState, useEffect } from 'react';
import { Star, Languages, Filter, Search, X, User } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Country flags
const countryFlags = {
  'Germany': '🇩🇪', 'UK': '🇬🇧', 'US': '🇺🇸', 'Italy': '🇮🇹',
  'France': '🇫🇷', 'Sweden': '🇸🇪', 'Norway': '🇳🇴', 'Switzerland': '🇨🇭',
};

// Region mapping
const countryRegions = {
  'Germany': 'Europe', 'UK': 'Europe', 'Italy': 'Europe', 'France': 'Europe',
  'Sweden': 'Europe', 'Norway': 'Europe', 'Switzerland': 'Europe', 'US': 'USA',
};

// Avatar colors
const avatarColors = [
  'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500',
  'bg-amber-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500',
];

// Get initials
const getInitials = (name) => {
  const parts = name.split(' ');
  return parts.length >= 2 
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase();
};

// Platform Logo
const PlatformLogo = ({ platform }) => {
  const styles = {
    'Google Reviews': { icon: 'G', color: 'text-blue-500' },
    'Trustpilot': { icon: '★', color: 'text-emerald-500' },
    'TripAdvisor': { icon: '●', color: 'text-green-500' },
    'Yelp': { icon: 'Y', color: 'text-red-500' },
    'Capterra': { icon: 'C', color: 'text-orange-500' },
    'G2': { icon: 'G2', color: 'text-rose-500' },
    'Angi': { icon: 'A', color: 'text-red-400' },
    'Product Hunt': { icon: '▲', color: 'text-orange-600' },
  };
  const style = styles[platform] || { icon: '•', color: 'text-stone-400' };
  
  return (
    <div className="flex items-center gap-1.5">
      <span className={`font-bold text-sm ${style.color}`}>{style.icon}</span>
      <span className="text-xs text-stone-400">{platform}</span>
    </div>
  );
};

// Star Rating
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

// Review Card
const ReviewCard = ({ review, index }) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const flag = countryFlags[review.country] || '🌍';
  const initials = getInitials(review.user_name);
  const avatarColor = avatarColors[index % avatarColors.length];
  const isEnglish = review.language === 'EN';
  const displayText = showTranslation ? review.review_text_en : review.review_text;
  const isTrustpilot = review.platform === 'Trustpilot';

  return (
    <div
      className="bg-white border border-stone-200 rounded-xl p-5 hover:shadow-lg hover:border-stone-300 hover:-translate-y-1 transition-all duration-300"
      data-testid={`review-card-${review.id}`}
    >
      {/* Header: Avatar + User Info with Flag */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-sm relative`}>
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-stone-900">{review.user_name}</p>
              <span className="text-lg">{flag}</span>
            </div>
            <p className="text-xs text-stone-400">{review.country}</p>
          </div>
        </div>
        {/* Verified Badge for Trustpilot */}
        {isTrustpilot && (
          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Verified
          </div>
        )}
      </div>

      {/* Rating + Platform */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-100">
        <StarRating rating={review.rating} />
        <PlatformLogo platform={review.platform} />
      </div>

      {/* Review Text */}
      <p className="text-stone-700 text-sm leading-relaxed mb-4">
        "{displayText}"
      </p>

      {/* Translate Button - Show only for non-English */}
      {!isEnglish && (
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
            showTranslation 
              ? 'bg-brand-green text-white' 
              : 'bg-stone-100 text-stone-600 hover:bg-brand-green hover:text-white'
          }`}
          data-testid={`translate-btn-${review.id}`}
        >
          <Languages className="w-3.5 h-3.5" />
          {showTranslation ? 'Show Original' : 'Show Translation'}
        </button>
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
        ? 'bg-brand-green text-white shadow-md'
        : 'bg-white text-stone-600 border border-stone-200 hover:border-brand-green hover:text-brand-green'
    }`}
  >
    {label} {count !== undefined && <span className="ml-1 opacity-70">({count})</span>}
  </button>
);

// Main Component
export const ReviewCarousel = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0, by_platform: {}, by_country: {} });
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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
  const regions = ['All', 'Europe', 'USA'];

  const filteredReviews = reviews.filter((review) => {
    const platformMatch = platformFilter === 'All' || review.platform === platformFilter;
    const regionMatch = regionFilter === 'All' || countryRegions[review.country] === regionFilter;
    const searchMatch = searchQuery === '' || 
      review.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.review_text.toLowerCase().includes(searchQuery.toLowerCase());
    return platformMatch && regionMatch && searchMatch;
  });

  if (loading) {
    return (
      <section id="reviews" className="py-16 md:py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 text-center">Loading reviews...</div>
      </section>
    );
  }

  return (
    <section id="reviews" className="py-16 md:py-24 bg-stone-50" data-testid="reviews-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-brand-terracotta text-xs font-bold uppercase tracking-[0.3em] mb-4">
            Trusted by Golfers Worldwide
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-stone-900 mb-4">
            The easiest way to book your next round.
          </h2>
          <p className="text-stone-500 text-base sm:text-lg max-w-2xl mx-auto">
            Join thousands of players across Europe and the US who save time and money.
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <StarRating rating={5} />
              <span className="text-xl font-bold text-stone-900">{stats.average_rating}</span>
            </div>
            <span className="hidden sm:inline text-stone-300">•</span>
            <span className="text-stone-600">{stats.total_reviews} verified reviews</span>
          </div>
          
          {/* Country flags summary */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {Object.entries(stats.by_country || {}).map(([country, count]) => (
              <span key={country} className="inline-flex items-center gap-1 text-sm bg-white px-2 py-1 rounded-full border border-stone-200">
                <span>{countryFlags[country]}</span>
                <span className="text-stone-500">{count}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-10 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search by country, platform, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 rounded-full border border-stone-200 bg-white text-stone-700 placeholder-stone-400 focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all"
              data-testid="review-search"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Platform Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-center gap-1 text-stone-400 mr-2 flex-shrink-0">
              <Filter className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Platform:</span>
            </div>
            {platforms.map((platform) => (
              <FilterPill
                key={platform}
                label={platform === 'All' ? 'All Platforms' : platform}
                active={platformFilter === platform}
                onClick={() => setPlatformFilter(platform)}
                count={platform === 'All' ? undefined : stats.by_platform[platform]}
              />
            ))}
          </div>
          
          {/* Region Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-center gap-1 text-stone-400 mr-2 flex-shrink-0">
              <span className="text-xs font-medium uppercase tracking-wide ml-5">Region:</span>
            </div>
            {regions.map((region) => (
              <FilterPill
                key={region}
                label={region === 'All' ? 'All Regions' : region}
                active={regionFilter === region}
                onClick={() => setRegionFilter(region)}
              />
            ))}
          </div>
        </div>

        {/* 3-Column Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
          {filteredReviews.map((review, index) => (
            <div key={review.id} className="break-inside-avoid">
              <ReviewCard review={review} index={index} />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredReviews.length === 0 && (
          <div className="text-center py-16 text-stone-400">
            <p className="text-lg">No reviews match your filters.</p>
            <p className="text-sm mt-2">Try adjusting your selection.</p>
          </div>
        )}
        
        {/* Results count */}
        {filteredReviews.length > 0 && (
          <p className="text-center text-sm text-stone-400 mt-8">
            Showing {filteredReviews.length} of {reviews.length} reviews
          </p>
        )}
      </div>
    </section>
  );
};

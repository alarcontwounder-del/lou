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

// Review Card Component
const ReviewCard = ({ review, index }) => {
  const [showTranslation, setShowTranslation] = useState(false);
  
  const flag = countryFlags[review.country] || '🌍';
  const initials = getInitials(review.user_name);
  const gradient = avatarGradients[index % avatarGradients.length];
  const accent = platformAccents[review.platform] || platformAccents['Google Reviews'];
  const isEnglish = review.language === 'EN';
  
  // Display original or translated text
  const displayText = showTranslation ? review.review_text_en : review.review_text;

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${accent.border} ${accent.hover} p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
      data-testid={`review-card-${review.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        {/* User Info */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-semibold text-sm shadow-lg`}>
            {initials}
          </div>
          {/* Name & Location */}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">{review.user_name}</h4>
              <span className="text-lg">{flag}</span>
            </div>
            <p className="text-sm text-gray-400">{review.country}</p>
          </div>
        </div>
        
        {/* Platform Badge */}
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${accent.badge}`}>
          {review.platform.replace(' Reviews', '')}
        </span>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-4">
        <StarRating rating={review.rating} />
        {review.platform === 'Trustpilot' && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            ✓ Verified
          </span>
        )}
      </div>

      {/* Review Text */}
      <div className="relative mb-5">
        <Quote className="absolute -top-1 -left-1 w-5 h-5 text-gray-200" />
        <p className="text-gray-700 text-base leading-relaxed pl-5">
          {displayText}
        </p>
      </div>

      {/* Translate Button - Only for non-English reviews */}
      {!isEnglish && (
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 ${
            showTranslation 
              ? 'bg-gray-900 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          data-testid={`translate-btn-${review.id}`}
        >
          <Languages className="w-4 h-4" />
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

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    const platformMatch = activeFilter === 'All' || review.platform === activeFilter;
    const searchMatch = searchQuery === '' || 
      review.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.user_name.toLowerCase().includes(searchQuery.toLowerCase());
    return platformMatch && searchMatch;
  });

  if (loading) {
    return (
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">Loading reviews...</div>
      </section>
    );
  }

  return (
    <section id="reviews" className="py-24 bg-gray-50" data-testid="review-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-amber-600 text-sm font-semibold tracking-widest uppercase mb-4">
            Trusted Worldwide
          </span>
          <h2 className="font-heading text-4xl md:text-5xl text-gray-900 mb-6">
            Loved by golfers everywhere
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            See what our customers have to say about their booking experience
          </p>
          
          {/* Stats Row */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-10">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <StarRating rating={5} />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.average_rating}</p>
              <p className="text-sm text-gray-400">Average Rating</p>
            </div>
            <div className="w-px h-12 bg-gray-200 hidden sm:block"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{stats.total_reviews}</p>
              <p className="text-sm text-gray-400">Verified Reviews</p>
            </div>
            <div className="w-px h-12 bg-gray-200 hidden sm:block"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">8</p>
              <p className="text-sm text-gray-400">Countries</p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by country or platform..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
              data-testid="review-search"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
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

        {/* Masonry Grid */}
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
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-xl text-gray-600">No reviews found</p>
            <p className="text-gray-400 mt-2">Try a different search term</p>
          </div>
        )}

        {/* Results Count */}
        {filteredReviews.length > 0 && (
          <p className="text-center text-sm text-gray-400 mt-12">
            Showing {filteredReviews.length} of {reviews.length} reviews
          </p>
        )}
      </div>
    </section>
  );
};

// Also export as ReviewCarousel for backward compatibility
export const ReviewCarousel = ReviewSection;

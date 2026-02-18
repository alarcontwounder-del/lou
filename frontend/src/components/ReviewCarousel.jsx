import React, { useState, useEffect } from 'react';
import { Star, Languages } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Country flags mapping
const countryFlags = {
  'Germany': '🇩🇪',
  'UK': '🇬🇧',
  'US': '🇺🇸',
  'Italy': '🇮🇹',
  'France': '🇫🇷',
  'Sweden': '🇸🇪',
  'Norway': '🇳🇴',
  'Switzerland': '🇨🇭',
};

// Region mapping
const countryRegions = {
  'Germany': 'Europe',
  'UK': 'Europe',
  'Italy': 'Europe',
  'France': 'Europe',
  'Sweden': 'Europe',
  'Norway': 'Europe',
  'Switzerland': 'Europe',
  'US': 'USA',
};

// Avatar background colors
const avatarColors = [
  'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500',
  'bg-amber-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-pink-500',
];

// Get initials from name
const getInitials = (name) => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Platform logos (monochrome SVG-like components)
const PlatformLogo = ({ platform }) => {
  const logos = {
    'Google Reviews': (
      <div className="flex items-center gap-1 text-stone-400">
        <span className="font-bold text-sm">G</span>
        <span className="text-xs">Google</span>
      </div>
    ),
    'Trustpilot': (
      <div className="flex items-center gap-1 text-stone-400">
        <span className="text-sm">★</span>
        <span className="text-xs">Trustpilot</span>
      </div>
    ),
    'TripAdvisor': (
      <div className="flex items-center gap-1 text-stone-400">
        <span className="text-sm">●</span>
        <span className="text-xs">TripAdvisor</span>
      </div>
    ),
    'Yelp': (
      <div className="flex items-center gap-1 text-stone-400">
        <span className="font-bold text-sm">Y</span>
        <span className="text-xs">Yelp</span>
      </div>
    ),
    'Capterra': (
      <div className="flex items-center gap-1 text-stone-400">
        <span className="font-bold text-sm">C</span>
        <span className="text-xs">Capterra</span>
      </div>
    ),
    'G2': (
      <div className="flex items-center gap-1 text-stone-400">
        <span className="font-bold text-sm">G2</span>
      </div>
    ),
    'Angi': (
      <div className="flex items-center gap-1 text-stone-400">
        <span className="font-bold text-sm">A</span>
        <span className="text-xs">Angi</span>
      </div>
    ),
    'Product Hunt': (
      <div className="flex items-center gap-1 text-stone-400">
        <span className="font-bold text-sm">▲</span>
        <span className="text-xs">Product Hunt</span>
      </div>
    ),
  };
  return logos[platform] || <span className="text-xs text-stone-400">{platform}</span>;
};

// Star Rating Component
const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-4 h-4 ${
          star <= rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-stone-200 text-stone-200'
        }`}
      />
    ))}
  </div>
);

// Review Card Component
const ReviewCard = ({ review, index }) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const flag = countryFlags[review.country] || '🌍';
  const initials = getInitials(review.user_name);
  const avatarColor = avatarColors[index % avatarColors.length];
  const isEnglish = review.language === 'EN';
  const displayText = showTranslation ? review.review_text_en : review.review_text;

  return (
    <div
      className="bg-white border border-stone-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-300"
      data-testid={`review-card-${review.id}`}
    >
      {/* Top Row: Avatar, User Info, Flag */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar with initials */}
          <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-sm`}>
            {initials}
          </div>
          {/* User info */}
          <div>
            <p className="font-semibold text-stone-900 text-sm">
              {review.user_name}{review.age ? `, ${review.age}` : ''}
            </p>
            <p className="text-xs text-stone-400">{review.country}</p>
          </div>
        </div>
        {/* Country flag */}
        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-lg">
          {flag}
        </div>
      </div>

      {/* Middle Row: Rating & Platform */}
      <div className="flex items-center justify-between mb-4">
        <StarRating rating={review.rating} />
        <PlatformLogo platform={review.platform} />
      </div>

      {/* Content Area: Review Text */}
      <p className="text-stone-700 text-sm leading-relaxed mb-4">
        "{displayText}"
      </p>

      {/* Translate Button */}
      {!isEnglish && (
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className="flex items-center gap-1.5 text-xs text-brand-green hover:text-brand-terracotta transition-colors"
          data-testid={`translate-btn-${review.id}`}
        >
          <Languages className="w-3.5 h-3.5" />
          {showTranslation ? 'Show original' : 'Translate to English'}
        </button>
      )}
    </div>
  );
};

// Filter Pill Component
const FilterPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
      active
        ? 'bg-brand-green text-white shadow-md'
        : 'bg-white text-stone-600 border border-stone-200 hover:border-brand-green hover:text-brand-green'
    }`}
  >
    {label}
  </button>
);

// Main Reviews Section Component
export const ReviewCarousel = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0, by_platform: {} });
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');

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

  // Get unique platforms
  const platforms = ['All', ...Object.keys(stats.by_platform || {})];
  const regions = ['All', 'Europe', 'USA'];

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    const platformMatch = platformFilter === 'All' || review.platform === platformFilter;
    const regionMatch = regionFilter === 'All' || countryRegions[review.country] === regionFilter;
    return platformMatch && regionMatch;
  });

  if (loading) {
    return (
      <section id="reviews" className="section-padding bg-stone-50">
        <div className="container-custom text-center">Loading reviews...</div>
      </section>
    );
  }

  return (
    <section id="reviews" className="section-padding bg-stone-50" data-testid="reviews-section">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-10">
          {/* Eyebrow */}
          <p className="text-brand-terracotta text-xs font-bold uppercase tracking-[0.25em] mb-4">
            Trusted by Golfers Worldwide
          </p>
          {/* Main Title */}
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-stone-900 mb-4">
            The easiest way to book your next round.
          </h2>
          {/* Subtext */}
          <p className="text-stone-500 text-lg max-w-2xl mx-auto">
            Join thousands of players across Europe and the US who save time and money.
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <StarRating rating={5} />
              <span className="text-xl font-bold text-stone-900">{stats.average_rating}</span>
            </div>
            <span className="text-stone-300">•</span>
            <span className="text-stone-600">{stats.total_reviews} verified reviews</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-8">
          {/* Platform filters */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wide mr-2 flex-shrink-0">Platform:</span>
            {platforms.map((platform) => (
              <FilterPill
                key={platform}
                label={platform}
                active={platformFilter === platform}
                onClick={() => setPlatformFilter(platform)}
              />
            ))}
          </div>
          {/* Region filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wide mr-2 flex-shrink-0">Region:</span>
            {regions.map((region) => (
              <FilterPill
                key={region}
                label={region}
                active={regionFilter === region}
                onClick={() => setRegionFilter(region)}
              />
            ))}
          </div>
        </div>

        {/* Review Grid (Masonry-style 3 columns) */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
          {filteredReviews.map((review, index) => (
            <div key={review.id} className="break-inside-avoid">
              <ReviewCard review={review} index={index} />
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredReviews.length === 0 && (
          <div className="text-center py-12 text-stone-400">
            No reviews match your filters. Try adjusting your selection.
          </div>
        )}
      </div>
    </section>
  );
};

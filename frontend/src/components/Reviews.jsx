import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Star, Quote } from 'lucide-react';
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
  'Spain': '🇪🇸',
};

// Platform logo/icon component
const PlatformBadge = ({ platform }) => {
  const platformStyles = {
    'Google Reviews': { bg: 'bg-white', text: 'text-stone-700', icon: '★', color: '#4285F4' },
    'Trustpilot': { bg: 'bg-[#00B67A]', text: 'text-white', icon: '★', color: '#00B67A' },
    'TripAdvisor': { bg: 'bg-[#34E0A1]', text: 'text-stone-800', icon: '●', color: '#34E0A1' },
    'Yelp': { bg: 'bg-[#FF1A1A]', text: 'text-white', icon: '★', color: '#FF1A1A' },
    'Capterra': { bg: 'bg-[#FF9D28]', text: 'text-white', icon: '★', color: '#FF9D28' },
    'G2': { bg: 'bg-[#FF492C]', text: 'text-white', icon: '★', color: '#FF492C' },
    'Angi': { bg: 'bg-[#FF6153]', text: 'text-white', icon: '★', color: '#FF6153' },
    'Product Hunt': { bg: 'bg-[#DA552F]', text: 'text-white', icon: '▲', color: '#DA552F' },
  };

  const style = platformStyles[platform] || { bg: 'bg-stone-100', text: 'text-stone-600', icon: '★', color: '#666' };

  return (
    <span 
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}
      style={{ borderLeft: `3px solid ${style.color}` }}
    >
      {platform}
    </span>
  );
};

// Star rating display
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

// Individual review card
const ReviewCard = ({ review }) => {
  const flag = countryFlags[review.country] || '🌍';
  
  return (
    <div
      className="bg-white border border-stone-100 rounded-lg p-5 hover:shadow-lg transition-shadow duration-300 relative group"
      data-testid={`review-card-${review.id}`}
    >
      {/* Quote icon */}
      <Quote className="absolute top-4 right-4 w-6 h-6 text-brand-sand/20 group-hover:text-brand-sand/40 transition-colors" />

      {/* Header: Platform & Rating */}
      <div className="flex items-center justify-between mb-3">
        <PlatformBadge platform={review.platform} />
        <StarRating rating={review.rating} />
      </div>

      {/* Review text in original language */}
      <p className="text-stone-700 text-sm leading-relaxed mb-4 line-clamp-4">
        "{review.review_text}"
      </p>

      {/* Footer: User info */}
      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
        <div className="flex items-center gap-2">
          <span className="text-xl">{flag}</span>
          <div>
            <p className="font-medium text-stone-900 text-sm">{review.user_name}</p>
            <p className="text-xs text-stone-400">{review.country}</p>
          </div>
        </div>
        <span className="text-xs text-stone-400 uppercase tracking-wide">{review.language}</span>
      </div>
    </div>
  );
};

export const Reviews = () => {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0, by_country: {}, by_platform: {} });
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);

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

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 8, reviews.length));
  };

  if (loading) {
    return (
      <section id="reviews" className="section-padding bg-brand-cream">
        <div className="container-custom">
          <div className="text-center">Loading reviews...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="reviews" className="section-padding bg-brand-cream" data-testid="reviews-section">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-brand-terracotta text-sm uppercase tracking-[0.2em] mb-4" data-testid="reviews-subtitle">
            {t('reviews.subtitle')}
          </p>
          <h2 className="font-heading text-4xl md:text-5xl text-stone-900 mb-4" data-testid="reviews-title">
            {t('reviews.title')}
          </h2>

          {/* Stats Summary */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(stats.average_rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-stone-200 text-stone-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-2xl font-bold text-brand-green">{stats.average_rating}</span>
            </div>
            <span className="text-stone-300">|</span>
            <span className="text-stone-600 font-medium">{stats.total_reviews} {t('reviews.reviewsCount')}</span>
          </div>

          {/* Country breakdown */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            {Object.entries(stats.by_country || {}).slice(0, 6).map(([country, count]) => (
              <span key={country} className="inline-flex items-center gap-1 text-sm text-stone-500">
                <span>{countryFlags[country] || '🌍'}</span>
                <span>{count}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {reviews.slice(0, visibleCount).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Load More Button */}
        {visibleCount < reviews.length && (
          <div className="text-center mt-10">
            <button
              onClick={loadMore}
              className="btn-secondary"
              data-testid="load-more-reviews"
            >
              {t('reviews.loadMore')} ({reviews.length - visibleCount} more)
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, PenLine } from 'lucide-react';
import axios from 'axios';
import ReviewModal from './ReviewModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Country flags
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
  'Netherlands': '🇳🇱',
  'Belgium': '🇧🇪',
  'Austria': '🇦🇹',
};

// Platform logos
const GoogleLogo = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const TrustpilotLogo = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
    <path fill="#00B67A" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
);

const TripAdvisorLogo = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
    <circle fill="#34E0A1" cx="12" cy="12" r="10"/>
    <circle fill="white" cx="8" cy="10" r="2.5"/>
    <circle fill="white" cx="16" cy="10" r="2.5"/>
    <circle fill="#000" cx="8" cy="10" r="1.2"/>
    <circle fill="#000" cx="16" cy="10" r="1.2"/>
    <ellipse fill="#FF5722" cx="12" cy="15" rx="2" ry="1"/>
  </svg>
);

const platformConfig = {
  'Google Reviews': { Logo: GoogleLogo, name: 'Google' },
  'Google': { Logo: GoogleLogo, name: 'Google' },
  'Trustpilot': { Logo: TrustpilotLogo, name: 'Trustpilot' },
  'TripAdvisor': { Logo: TripAdvisorLogo, name: 'TripAdvisor' },
};

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star 
        key={star} 
        className={`w-2.5 h-2.5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'}`} 
      />
    ))}
  </div>
);

// Compact review card with platform logo and country flag
const CompactReviewCard = ({ review }) => {
  const platform = platformConfig[review.platform] || platformConfig['Google Reviews'];
  const PlatformLogo = platform.Logo;
  const flag = countryFlags[review.country] || '🌍';

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-stone-100 min-w-[200px] max-w-[200px] flex-shrink-0 hover:shadow-md transition-shadow">
      {/* Header with avatar and name */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-brand-slate/15 flex items-center justify-center text-brand-charcoal font-semibold text-[10px]">
          {review.user_name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="font-medium text-stone-700 text-[11px] truncate">{review.user_name}</p>
            <span className="text-xs">{flag}</span>
          </div>
          <StarRating rating={review.rating || 5} />
        </div>
      </div>
      
      {/* Review Text */}
      <p className="text-[11px] text-stone-500 leading-relaxed line-clamp-3 mb-2">
        "{review.review_text}"
      </p>
      
      {/* Platform badge */}
      <div className="flex items-center gap-1 pt-2 border-t border-stone-100">
        <PlatformLogo />
        <span className="text-[10px] text-stone-400">{platform.name}</span>
      </div>
    </div>
  );
};

export const CompactReviewsCarousel = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0, by_platform: {}, by_country: {} });
  const [loading, setLoading] = useState(true);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewsRes, statsRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/reviews`),
          axios.get(`${BACKEND_URL}/api/reviews/stats`)
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

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 420; // ~2 cards
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-8 bg-stone-50 border-t border-stone-100" data-testid="reviews-carousel-section">
      <div className="container-custom">
        {/* Header with stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 flex-wrap">
            <h3 className="text-sm font-medium text-stone-600">Customer Reviews</h3>
            
            {/* Rating badge */}
            <div className="flex items-center gap-1 px-2 py-0.5 bg-white rounded-full border border-stone-200">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-stone-700">{stats.average_rating?.toFixed(1) || '5.0'}</span>
              <span className="text-[10px] text-stone-400">({stats.total_reviews || reviews.length})</span>
            </div>
            
            {/* Platform counts */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-0.5 bg-white rounded-full border border-stone-200">
                <GoogleLogo />
                <span className="text-[10px] text-stone-500">{stats.by_platform?.['Google Reviews'] || 0}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-white rounded-full border border-stone-200">
                <TrustpilotLogo />
                <span className="text-[10px] text-stone-500">{stats.by_platform?.['Trustpilot'] || 0}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-white rounded-full border border-stone-200">
                <TripAdvisorLogo />
                <span className="text-[10px] text-stone-500">{stats.by_platform?.['TripAdvisor'] || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Navigation arrows */}
            <button
              onClick={() => scrollCarousel('left')}
              className="p-1.5 rounded-full border border-stone-200 hover:bg-white hover:border-stone-300 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-stone-500" />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              className="p-1.5 rounded-full border border-stone-200 hover:bg-white hover:border-stone-300 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
            </button>
            
            {/* Write Review */}
            <button
              onClick={() => setIsWriteModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] bg-brand-charcoal text-white rounded-full hover:bg-brand-charcoal/90 transition-colors ml-2"
            >
              <PenLine className="w-3 h-3" />
              <span>Write Review</span>
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div 
          ref={carouselRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading ? (
            <div className="flex items-center justify-center w-full py-6">
              <div className="w-5 h-5 border-2 border-brand-slate border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            reviews.map((review, index) => (
              <CompactReviewCard key={review.id || index} review={review} />
            ))
          )}
        </div>
      </div>

      {/* Write Review Modal */}
      <ReviewModal 
        isOpen={isWriteModalOpen} 
        onClose={() => setIsWriteModalOpen(false)} 
      />
    </section>
  );
};

export default CompactReviewsCarousel;

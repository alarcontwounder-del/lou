import React, { useState, useEffect, useRef } from 'react';
import { Star, X, ChevronLeft, ChevronRight, PenLine } from 'lucide-react';
import axios from 'axios';
import ReviewModal from './ReviewModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const StarRating = ({ rating, size = 'sm' }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star 
        key={star} 
        className={`${size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} ${star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} 
      />
    ))}
  </div>
);

// Compact review card for carousel
const CompactReviewCard = ({ review }) => {
  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-stone-100 min-w-[200px] max-w-[200px] flex-shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-brand-slate/20 flex items-center justify-center text-brand-charcoal font-semibold text-xs">
          {review.user_name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-stone-800 text-xs truncate">{review.user_name}</p>
          <StarRating rating={review.rating || 5} />
        </div>
      </div>
      
      {/* Review Text - very compact */}
      <p className="text-xs text-stone-500 leading-relaxed line-clamp-3">
        "{review.review_text}"
      </p>
    </div>
  );
};

export const FloatingReviewsButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0 });
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
      const scrollAmount = 220; // card width + gap
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      {/* Floating Button - Subtle, bottom left */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-1.5 px-3 py-2 bg-white/90 backdrop-blur-sm text-stone-700 rounded-full shadow-md border border-stone-200 hover:bg-white hover:shadow-lg transition-all text-sm"
        data-testid="floating-reviews-btn"
      >
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        <span className="font-medium">{stats.average_rating?.toFixed(1) || '5.0'}</span>
        <span className="text-stone-400 text-xs">({stats.total_reviews || reviews.length})</span>
      </button>

      {/* Slide-up Panel - Compact */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
          
          {/* Panel */}
          <div 
            className="relative bg-white rounded-t-2xl w-full max-w-3xl shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Compact */}
            <div className="flex items-center justify-between p-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-stone-900">{stats.average_rating?.toFixed(1)}</span>
                </div>
                <span className="text-stone-400 text-sm">{stats.total_reviews || reviews.length} reviews</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsWriteModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-brand-slate text-white rounded-full hover:bg-brand-slate/90 transition-colors"
                >
                  <PenLine className="w-3 h-3" />
                  <span>Write Review</span>
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-stone-400" />
                </button>
              </div>
            </div>

            {/* Carousel */}
            <div className="relative p-4">
              {/* Scroll buttons */}
              <button
                onClick={() => scrollCarousel('left')}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white rounded-full shadow-md border border-stone-200 hover:bg-stone-50"
              >
                <ChevronLeft className="w-4 h-4 text-stone-600" />
              </button>
              
              <button
                onClick={() => scrollCarousel('right')}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white rounded-full shadow-md border border-stone-200 hover:bg-stone-50"
              >
                <ChevronRight className="w-4 h-4 text-stone-600" />
              </button>

              {/* Reviews Carousel */}
              <div 
                ref={carouselRef}
                className="flex gap-3 overflow-x-auto scrollbar-hide px-6 py-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {loading ? (
                  <div className="flex items-center justify-center w-full py-8">
                    <div className="w-6 h-6 border-2 border-brand-slate border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  reviews.map((review, index) => (
                    <CompactReviewCard key={review.id || index} review={review} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      <ReviewModal 
        isOpen={isWriteModalOpen} 
        onClose={() => setIsWriteModalOpen(false)} 
      />
    </>
  );
};

export default FloatingReviewsButton;

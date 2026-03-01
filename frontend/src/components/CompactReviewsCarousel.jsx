import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, PenLine } from 'lucide-react';
import axios from 'axios';
import ReviewModal from './ReviewModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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

// Very compact review card
const CompactReviewCard = ({ review }) => {
  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-stone-100 min-w-[180px] max-w-[180px] flex-shrink-0 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 rounded-full bg-brand-slate/15 flex items-center justify-center text-brand-charcoal font-semibold text-[10px]">
          {review.user_name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-stone-700 text-[11px] truncate">{review.user_name}</p>
          <StarRating rating={review.rating || 5} />
        </div>
      </div>
      
      {/* Review Text */}
      <p className="text-[11px] text-stone-500 leading-relaxed line-clamp-3">
        "{review.review_text}"
      </p>
    </div>
  );
};

export const CompactReviewsCarousel = () => {
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
      const scrollAmount = 380; // ~2 cards
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-8 bg-stone-50 border-t border-stone-100" data-testid="reviews-carousel-section">
      <div className="container-custom">
        {/* Header - very compact */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-stone-600">Customer Reviews</h3>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-white rounded-full border border-stone-200">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-stone-700">{stats.average_rating?.toFixed(1) || '5.0'}</span>
              <span className="text-[10px] text-stone-400">({stats.total_reviews || reviews.length})</span>
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

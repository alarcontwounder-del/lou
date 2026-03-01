import React, { useState, useEffect } from 'react';
import { Star, X, ChevronLeft, ChevronRight, MessageSquare, PenLine } from 'lucide-react';
import axios from 'axios';
import ReviewModal from './ReviewModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Platform logos
const GoogleLogo = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const TrustpilotLogo = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#00B67A" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
);

const TripAdvisorLogo = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <circle fill="#34E0A1" cx="12" cy="12" r="11"/>
    <circle fill="white" cx="8" cy="10" r="3"/>
    <circle fill="white" cx="16" cy="10" r="3"/>
    <circle fill="#000" cx="8" cy="10" r="1.5"/>
    <circle fill="#000" cx="16" cy="10" r="1.5"/>
  </svg>
);

const platformLogos = {
  'Google Reviews': { Logo: GoogleLogo, color: '#4285F4' },
  'Trustpilot': { Logo: TrustpilotLogo, color: '#00B67A' },
  'TripAdvisor': { Logo: TripAdvisorLogo, color: '#34E0A1' },
};

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star 
        key={star} 
        className={`w-3 h-3 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} 
      />
    ))}
  </div>
);

const ReviewCard = ({ review }) => {
  const platform = platformLogos[review.platform] || platformLogos['Google Reviews'];
  const PlatformLogo = platform.Logo;
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-slate to-brand-charcoal flex items-center justify-center text-white font-bold text-sm">
          {review.user_name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-stone-900 text-sm">{review.user_name}</p>
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating || 5} />
            <PlatformLogo />
          </div>
        </div>
      </div>
      
      {/* Review Text */}
      <p className="text-sm text-stone-600 leading-relaxed flex-1 line-clamp-4">
        "{review.review_text}"
      </p>
      
      {/* Country */}
      <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-400">
        {review.country}
      </div>
    </div>
  );
};

export const FloatingReviewsButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const reviewsPerPage = 6;

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

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const currentReviews = reviews.slice(
    currentPage * reviewsPerPage,
    (currentPage + 1) * reviewsPerPage
  );

  const nextPage = () => setCurrentPage((p) => (p + 1) % totalPages);
  const prevPage = () => setCurrentPage((p) => (p - 1 + totalPages) % totalPages);

  return (
    <>
      {/* Floating Button - Bottom Left */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-3 bg-brand-charcoal text-white rounded-full shadow-lg hover:bg-brand-charcoal/90 transition-all hover:scale-105 group"
        data-testid="floating-reviews-btn"
      >
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="font-bold">{stats.average_rating?.toFixed(1) || '5.0'}</span>
        </div>
        <span className="text-sm font-medium hidden sm:inline">Reviews</span>
        <span className="text-xs text-stone-400 hidden sm:inline">({stats.total_reviews || reviews.length})</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Content */}
          <div 
            className="bg-brand-cream rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-brand-charcoal text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-serif font-bold mb-2">Customer Reviews</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-xl font-bold">{stats.average_rating?.toFixed(1)}</span>
                    </div>
                    <span className="text-stone-400">|</span>
                    <span className="text-stone-300">{stats.total_reviews || reviews.length} verified reviews</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Platform Stats */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
                  <GoogleLogo />
                  <span className="text-sm">{stats.by_platform?.['Google Reviews'] || 0}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
                  <TrustpilotLogo />
                  <span className="text-sm">{stats.by_platform?.['Trustpilot'] || 0}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
                  <TripAdvisorLogo />
                  <span className="text-sm">{stats.by_platform?.['TripAdvisor'] || 0}</span>
                </div>
              </div>
            </div>

            {/* Reviews Grid */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-brand-slate border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentReviews.map((review, index) => (
                    <ReviewCard key={review.id || index} review={review} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer with Pagination & Write Review */}
            <div className="border-t border-stone-200 p-4 flex items-center justify-between bg-white">
              {/* Pagination */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prevPage}
                  disabled={totalPages <= 1}
                  className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-stone-500">
                  Page {currentPage + 1} of {totalPages || 1}
                </span>
                <button
                  onClick={nextPage}
                  disabled={totalPages <= 1}
                  className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Write Review Button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsWriteModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-brand-slate text-white rounded-lg hover:bg-brand-slate/90 transition-colors"
              >
                <PenLine className="w-4 h-4" />
                <span>Write a Review</span>
              </button>
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

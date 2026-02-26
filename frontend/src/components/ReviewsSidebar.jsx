import React, { useState, useEffect } from 'react';
import { Star, Search, X, Globe, Users, PenLine } from 'lucide-react';
import axios from 'axios';
import ReviewModal from './ReviewModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Platform logos
const GoogleLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const TrustpilotLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#00B67A" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
);

const TripAdvisorLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <circle fill="#34E0A1" cx="12" cy="12" r="11"/>
    <circle fill="white" cx="8" cy="10" r="3.5"/>
    <circle fill="white" cx="16" cy="10" r="3.5"/>
    <circle fill="#000" cx="8" cy="10" r="1.8"/>
    <circle fill="#000" cx="16" cy="10" r="1.8"/>
    <ellipse fill="#FF5722" cx="12" cy="16" rx="3" ry="1.5"/>
  </svg>
);

const FacebookLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <circle fill="#1877F2" cx="12" cy="12" r="11"/>
    <path fill="white" d="M16.5 8H14c-.5 0-1 .5-1 1v2h3.5l-.5 3H13v7h-3v-7H8v-3h2V9c0-2 1.5-3.5 3.5-3.5h3v2.5z"/>
  </svg>
);

const YelpLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <circle fill="#D32323" cx="12" cy="12" r="11"/>
    <path fill="white" d="M10 6v5l-3 2v-5l3-2zm4 0v5l3 2v-5l-3-2zm-2 7l-3 3h6l-3-3z"/>
  </svg>
);

const platformLogos = {
  'Google Reviews': { Logo: GoogleLogo, name: 'Google', color: '#4285F4' },
  'Google': { Logo: GoogleLogo, name: 'Google', color: '#4285F4' },
  'Trustpilot': { Logo: TrustpilotLogo, name: 'Trustpilot', color: '#00B67A' },
  'TripAdvisor': { Logo: TripAdvisorLogo, name: 'TripAdvisor', color: '#34E0A1' },
  'Yelp': { Logo: YelpLogo, name: 'Yelp', color: '#D32323' },
  'Facebook': { Logo: FacebookLogo, name: 'Facebook', color: '#1877F2' },
};

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

const ReviewItem = ({ review }) => {
  const [expanded, setExpanded] = useState(false);
  const platform = platformLogos[review.platform] || platformLogos['Google'];
  const PlatformLogo = platform.Logo;
  const isLongText = review.review_text && review.review_text.length > 120;
  const displayText = expanded || !isLongText 
    ? review.review_text 
    : review.review_text.substring(0, 120) + '...';

  return (
    <div className="py-4 border-b border-stone-200/50 last:border-b-0 bg-white rounded-lg mb-3 px-4 shadow-sm">
      {/* Header: Avatar & Name */}
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stone-400 to-stone-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden shadow">
          {review.avatar_url ? (
            <img src={review.avatar_url} alt={review.user_name} className="w-full h-full object-cover" />
          ) : (
            review.user_name?.charAt(0).toUpperCase() || 'U'
          )}
        </div>
        
        {/* Name & Rating */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-stone-900 text-sm">{review.user_name}</p>
          <div className="flex items-center gap-1">
            <StarRating rating={review.rating || 5} />
            <span className="text-xs text-stone-400 ml-1">
              {review.review_date ? new Date(review.review_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
            </span>
          </div>
        </div>
      </div>
      
      {/* Review Text */}
      <p className="text-sm text-stone-700 leading-relaxed mb-3">
        {displayText}
        {isLongText && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-brand-slate hover:underline ml-1 font-medium"
          >
            {expanded ? 'Less' : 'Read more'}
          </button>
        )}
      </p>
      
      {/* Posted on Platform */}
      <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
        <span className="text-xs text-stone-400">Posted on</span>
        <div className="flex items-center gap-1.5">
          <PlatformLogo />
          <span className="text-xs font-medium" style={{ color: platform.color }}>{platform.name}</span>
        </div>
      </div>
    </div>
  );
};

export const ReviewsSidebar = ({ isVisible }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0, by_platform: {}, by_country: {} });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

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

  // Check for review redirect from OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('review') === 'true') {
      setIsReviewModalOpen(true);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const filteredReviews = reviews.filter(review => 
    searchQuery === '' || 
    review.review_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.platform?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const uniqueCountries = Object.keys(stats.by_country || {});

  if (!isVisible) return null;

  return (
    <aside 
      className="fixed left-0 top-0 h-screen w-80 bg-brand-charcoal border-r border-stone-700 z-40 flex flex-col shadow-2xl hidden lg:flex"
      data-testid="reviews-sidebar"
    >
      {/* Spacer for navbar */}
      <div className="h-20 flex-shrink-0"></div>
      
      {/* Header with Stats */}
      <div className="p-5 border-b border-stone-600 bg-brand-charcoal flex-shrink-0">
        <h2 className="text-2xl font-serif font-bold text-white mb-4 italic">Reviews</h2>
        
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-lg font-bold text-white">{stats.average_rating?.toFixed(1) || '5.0'}</span>
            </div>
            <p className="text-[10px] text-stone-400 uppercase tracking-wide">Rating</p>
          </div>
          <div className="text-center p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1">
              <Users className="w-4 h-4 text-brand-slate" />
              <span className="text-lg font-bold text-white">{stats.total_reviews || reviews.length}</span>
            </div>
            <p className="text-[10px] text-stone-400 uppercase tracking-wide">Reviews</p>
          </div>
          <div className="text-center p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1">
              <Globe className="w-4 h-4 text-brand-slate" />
              <span className="text-lg font-bold text-white">{uniqueCountries.length}</span>
            </div>
            <p className="text-[10px] text-stone-400 uppercase tracking-wide">Countries</p>
          </div>
        </div>

        {/* Platform Logos */}
        <div className="flex items-center justify-center gap-4 mb-4 py-2 px-3 bg-white/10 rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-1.5" title="Google Reviews">
            <GoogleLogo />
            <span className="text-xs font-medium text-white">{stats.by_platform?.['Google Reviews'] || 0}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Trustpilot">
            <TrustpilotLogo />
            <span className="text-xs font-medium text-white">{stats.by_platform?.['Trustpilot'] || 0}</span>
          </div>
          <div className="flex items-center gap-1.5" title="TripAdvisor">
            <TripAdvisorLogo />
            <span className="text-xs font-medium text-white">{stats.by_platform?.['TripAdvisor'] || 0}</span>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 text-sm bg-white/10 border border-stone-600 rounded-lg text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-slate/50 focus:border-brand-slate"
            data-testid="sidebar-search"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Reviews List */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-stone-100">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-8 h-8 border-2 border-brand-slate border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-stone-500 text-sm">No reviews found</p>
          </div>
        ) : (
          filteredReviews.map((review, index) => (
            <ReviewItem key={review.id || index} review={review} />
          ))
        )}
      </div>
      
      {/* Footer with Write Review Button */}
      <div className="p-4 border-t border-stone-300 bg-stone-100 flex-shrink-0">
        <button
          onClick={() => setIsReviewModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-charcoal hover:bg-stone-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
          data-testid="write-review-btn-footer"
        >
          <PenLine className="w-5 h-5" />
          <span>Write a Review</span>
        </button>
        <p className="text-xs text-stone-500 text-center mt-2">
          Showing {filteredReviews.length} of {reviews.length} verified reviews
        </p>
      </div>

      {/* Review Modal */}
      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
      />
    </aside>
  );
};

export default ReviewsSidebar;

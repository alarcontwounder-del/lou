import React, { useState, useEffect } from 'react';
import { X, Star, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Google Logo SVG
const GoogleLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const StarRatingInput = ({ rating, setRating, disabled }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={disabled}
        onClick={() => setRating(star)}
        className={`transition-all duration-150 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
      >
        <Star 
          className={`w-8 h-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-300 hover:fill-amber-200 hover:text-amber-300'}`} 
        />
      </button>
    ))}
  </div>
);

export const ReviewModal = ({ isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'submitting', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    if (!isOpen) return;
    
    const checkAuth = async () => {
      setCheckingAuth(true);
      try {
        const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
          withCredentials: true
        });
        setUser(response.data);
      } catch (error) {
        // User is not logged in
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, [isOpen]);

  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + window.location.pathname + '?review=true';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setErrorMessage('Please sign in to submit a review');
      return;
    }
    
    if (!reviewText.trim()) {
      setErrorMessage('Please write a review');
      return;
    }
    
    setSubmitStatus('submitting');
    setErrorMessage('');
    
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/reviews/submit`,
        {
          rating,
          review_text: reviewText.trim(),
          platform: 'Google'
        },
        { withCredentials: true }
      );
      
      setSubmitStatus('success');
      
      // Close modal after success message
      setTimeout(() => {
        onClose();
        // Reset form
        setRating(5);
        setReviewText('');
        setSubmitStatus(null);
      }, 3000);
      
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error.response?.data?.detail || 'Failed to submit review. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        data-testid="review-modal"
      >
        {/* Header */}
        <div className="bg-brand-charcoal px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-white">Write a Review</h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white transition-colors"
            data-testid="review-modal-close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {checkingAuth ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-brand-slate animate-spin" />
            </div>
          ) : submitStatus === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-stone-800 mb-2">Thank You!</h3>
              <p className="text-stone-600">
                Your review has been submitted and is pending approval.
              </p>
            </div>
          ) : !user ? (
            /* Not logged in - Show Google Login */
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-800 mb-2">
                Share Your Experience
              </h3>
              <p className="text-stone-600 mb-6 text-sm">
                Sign in with your Google account to leave a verified review
              </p>
              
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors font-medium text-stone-700"
                data-testid="google-login-btn"
              >
                <GoogleLogo />
                <span>Continue with Google</span>
              </button>
              
              <p className="mt-4 text-xs text-stone-500">
                We only use your name and profile picture for the review.
                Your email is kept private.
              </p>
            </div>
          ) : (
            /* Logged in - Show Review Form */
            <form onSubmit={handleSubmit}>
              {/* User Info */}
              <div className="flex items-center gap-3 mb-6 p-3 bg-stone-50 rounded-lg">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-stone-200">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-500 font-bold text-lg">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-stone-800">{user.name}</p>
                  <p className="text-sm text-stone-500">Posting as verified user</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-stone-500 hover:text-stone-700 underline"
                >
                  Sign out
                </button>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Your Rating
                </label>
                <StarRatingInput 
                  rating={rating} 
                  setRating={setRating} 
                  disabled={submitStatus === 'submitting'}
                />
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with Golf in Mallorca..."
                  rows={4}
                  disabled={submitStatus === 'submitting'}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-slate/50 focus:border-brand-slate resize-none disabled:bg-stone-100 disabled:cursor-not-allowed"
                  data-testid="review-text-input"
                />
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitStatus === 'submitting' || !reviewText.trim()}
                className="w-full py-3 bg-brand-charcoal text-white font-semibold rounded-lg hover:bg-stone-800 transition-colors disabled:bg-stone-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                data-testid="submit-review-btn"
              >
                {submitStatus === 'submitting' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Review</span>
                )}
              </button>

              <p className="mt-3 text-xs text-stone-500 text-center">
                Your review will be visible after admin approval
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;

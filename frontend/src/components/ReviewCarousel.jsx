import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Star, Quote, ChevronLeft, ChevronRight, Languages } from 'lucide-react';
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

// Platform colors
const platformColors = {
  'Google Reviews': '#4285F4',
  'Trustpilot': '#00B67A',
  'TripAdvisor': '#34E0A1',
  'Yelp': '#FF1A1A',
  'Capterra': '#FF9D28',
  'G2': '#FF492C',
  'Angi': '#FF6153',
  'Product Hunt': '#DA552F',
};

// Star rating display
const StarRating = ({ rating, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-stone-200 text-stone-200'
          }`}
        />
      ))}
    </div>
  );
};

// Individual carousel card with translate toggle
const CarouselCard = ({ review, isCenter }) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const flag = countryFlags[review.country] || '🌍';
  const platformColor = platformColors[review.platform] || '#666';
  const isEnglish = review.language === 'EN';
  
  const displayText = showTranslation ? review.review_text_en : review.review_text;

  return (
    <div
      className={`flex-shrink-0 w-[320px] md:w-[380px] bg-white rounded-xl shadow-lg border border-stone-100 p-6 transition-all duration-500 ${
        isCenter ? 'scale-105 shadow-xl z-10' : 'scale-95 opacity-80'
      }`}
      data-testid={`carousel-card-${review.id}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{flag}</span>
          <div>
            <p className="font-semibold text-stone-900">{review.user_name}</p>
            <p className="text-xs text-stone-400">{review.country}</p>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>

      {/* Platform badge */}
      <div 
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white mb-4"
        style={{ backgroundColor: platformColor }}
      >
        <span>★</span>
        {review.platform}
      </div>

      {/* Review text with quote */}
      <div className="relative mb-4">
        <Quote className="absolute -top-2 -left-1 w-6 h-6 text-brand-sand/30" />
        <p className="text-stone-700 text-sm leading-relaxed pl-5 min-h-[80px]">
          "{displayText}"
        </p>
      </div>

      {/* Translate button - only show for non-English reviews */}
      {!isEnglish && (
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
            showTranslation 
              ? 'bg-brand-green text-white' 
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
          data-testid={`translate-btn-${review.id}`}
        >
          <Languages className="w-3.5 h-3.5" />
          {showTranslation ? 'Show Original' : 'Translate to English'}
        </button>
      )}

      {/* Language indicator */}
      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
        <span className="text-xs text-stone-400">
          {showTranslation ? 'Translated from' : 'Original'}: {review.language}
        </span>
      </div>
    </div>
  );
};

export const ReviewCarousel = () => {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);
  const autoPlayRef = useRef(null);

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

  // Auto-play carousel
  useEffect(() => {
    if (reviews.length > 0) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
      }, 5000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [reviews.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    // Reset auto-play timer
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
  };

  const goToPrev = () => {
    goToSlide(currentIndex === 0 ? reviews.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    goToSlide((currentIndex + 1) % reviews.length);
  };

  if (loading) {
    return (
      <section id="reviews" className="section-padding bg-brand-cream">
        <div className="container-custom text-center">Loading reviews...</div>
      </section>
    );
  }

  // Get visible reviews (current, prev, next)
  const getVisibleReviews = () => {
    if (reviews.length === 0) return [];
    const visible = [];
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + reviews.length) % reviews.length;
      visible.push({ ...reviews[index], offset: i });
    }
    return visible;
  };

  return (
    <section id="reviews" className="section-padding bg-brand-cream overflow-hidden" data-testid="review-carousel-section">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-brand-terracotta text-sm uppercase tracking-[0.2em] mb-4">
            {t('reviews.subtitle')}
          </p>
          <h2 className="font-heading text-4xl md:text-5xl text-stone-900 mb-4">
            {t('reviews.title')}
          </h2>

          {/* Stats */}
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

          {/* Country flags summary */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            {Object.entries(stats.by_country || {}).map(([country, count]) => (
              <span key={country} className="inline-flex items-center gap-1 text-sm text-stone-500">
                <span>{countryFlags[country] || '🌍'}</span>
                <span>{count}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Carousel */}
        <div className="relative" ref={carouselRef}>
          {/* Navigation arrows */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-stone-600 hover:text-brand-green hover:scale-110 transition-all"
            data-testid="carousel-prev"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-stone-600 hover:text-brand-green hover:scale-110 transition-all"
            data-testid="carousel-next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Cards container */}
          <div className="flex items-center justify-center gap-4 px-16 py-8">
            {getVisibleReviews().map((review, idx) => (
              <div
                key={`${review.id}-${review.offset}`}
                className={`transition-all duration-500 ${
                  review.offset === 0 ? '' : 
                  Math.abs(review.offset) === 1 ? 'hidden md:block' : 
                  'hidden lg:block'
                }`}
                style={{
                  transform: `translateX(${review.offset * 20}px)`,
                  opacity: review.offset === 0 ? 1 : 0.6,
                }}
              >
                <CarouselCard review={review} isCenter={review.offset === 0} />
              </div>
            ))}
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {reviews.slice(0, 10).map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentIndex % 10
                    ? 'bg-brand-green w-8'
                    : 'bg-stone-300 hover:bg-stone-400'
                }`}
                data-testid={`carousel-dot-${idx}`}
              />
            ))}
            {reviews.length > 10 && (
              <span className="text-xs text-stone-400 ml-2">+{reviews.length - 10}</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

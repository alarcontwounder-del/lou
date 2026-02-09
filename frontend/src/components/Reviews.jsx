import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Star, Quote, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StarRating = ({ rating, size = 'md', interactive = false, onRate }) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          onClick={() => interactive && onRate && onRate(star)}
          className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
          disabled={!interactive}
        >
          <Star
            className={`${sizeClass} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-stone-200 text-stone-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewCard = ({ review, t }) => {
  const getCountryFlag = (country) => {
    const flags = {
      germany: '🇩🇪',
      sweden: '🇸🇪',
      switzerland: '🇨🇭',
      uk: '🇬🇧',
      france: '🇫🇷',
      other: '🌍'
    };
    return flags[country] || flags.other;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <div
      className="bg-white border border-stone-100 p-6 rounded-sm relative"
      data-testid={`review-card-${review.id}`}
    >
      {/* Quote icon */}
      <Quote className="absolute top-4 right-4 w-8 h-8 text-brand-sand/30" />

      {/* Rating */}
      <div className="mb-4">
        <StarRating rating={review.rating} size="sm" />
      </div>

      {/* Title */}
      <h4 className="font-heading text-lg text-stone-900 mb-2">
        "{review.title}"
      </h4>

      {/* Comment */}
      <p className="text-stone-600 text-sm mb-4 line-clamp-4">
        {review.comment}
      </p>

      {/* Course played */}
      {review.course_played && (
        <p className="text-xs text-brand-green mb-4">
          ⛳ {review.course_played}
        </p>
      )}

      {/* Author */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-100">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCountryFlag(review.country)}</span>
          <span className="font-medium text-stone-900">{review.name}</span>
        </div>
        <span className="text-xs text-stone-400">{formatDate(review.created_at)}</span>
      </div>
    </div>
  );
};

const ReviewForm = ({ t, courses, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    rating: 5,
    title: '',
    comment: '',
    course_played: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/reviews`, formData);
      toast.success(t('reviews.submitSuccess'));
      setFormData({
        name: '',
        country: '',
        rating: 5,
        title: '',
        comment: '',
        course_played: ''
      });
      onSuccess();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const countries = [
    { value: 'germany', label: 'Germany 🇩🇪' },
    { value: 'sweden', label: 'Sweden 🇸🇪' },
    { value: 'switzerland', label: 'Switzerland 🇨🇭' },
    { value: 'uk', label: 'United Kingdom 🇬🇧' },
    { value: 'france', label: 'France 🇫🇷' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-stone-100 p-6 rounded-sm" data-testid="review-form">
      <h4 className="font-heading text-xl text-stone-900 mb-6">{t('reviews.leaveReview')}</h4>

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm text-stone-600 mb-2">{t('reviews.yourRating')}</label>
        <StarRating
          rating={formData.rating}
          size="lg"
          interactive={true}
          onRate={(rating) => setFormData(prev => ({ ...prev, rating }))}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={t('reviews.yourName')}
          required
          className="input-underline"
          data-testid="review-name"
        />
        <Select onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))} value={formData.country}>
          <SelectTrigger className="input-underline border-0 border-b border-stone-300 rounded-none px-0" data-testid="review-country">
            <SelectValue placeholder={t('reviews.yourCountry')} />
          </SelectTrigger>
          <SelectContent>
            {countries.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4">
        <Select onValueChange={(value) => setFormData(prev => ({ ...prev, course_played: value }))} value={formData.course_played}>
          <SelectTrigger className="input-underline border-0 border-b border-stone-300 rounded-none px-0" data-testid="review-course">
            <SelectValue placeholder={t('reviews.coursePlayed')} />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder={t('reviews.reviewTitle')}
        required
        className="input-underline mb-4"
        data-testid="review-title"
      />

      <textarea
        name="comment"
        value={formData.comment}
        onChange={handleChange}
        placeholder={t('reviews.yourReview')}
        required
        rows={4}
        className="input-underline resize-none mb-6"
        data-testid="review-comment"
      />

      <button
        type="submit"
        disabled={loading}
        className="btn-primary flex items-center gap-2 w-full justify-center"
        data-testid="review-submit"
      >
        {loading ? '...' : (
          <>
            {t('reviews.submit')}
            <Send className="w-4 h-4" />
          </>
        )}
      </button>

      <p className="text-xs text-stone-400 mt-4 text-center">
        {t('reviews.moderationNote')}
      </p>
    </form>
  );
};

export const Reviews = () => {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0 });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    try {
      const [reviewsRes, statsRes, coursesRes] = await Promise.all([
        axios.get(`${API}/reviews`),
        axios.get(`${API}/reviews/stats`),
        axios.get(`${API}/golf-courses`)
      ]);
      setReviews(reviewsRes.data);
      setStats(statsRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <section id="reviews" className="section-padding bg-brand-cream">
        <div className="container-custom">
          <div className="text-center">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="reviews" className="section-padding bg-brand-cream" data-testid="reviews-section">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-brand-terracotta text-sm uppercase tracking-[0.2em] mb-4" data-testid="reviews-subtitle">
            {t('reviews.subtitle')}
          </p>
          <h2 className="font-heading text-4xl md:text-5xl text-stone-900 mb-4" data-testid="reviews-title">
            {t('reviews.title')}
          </h2>

          {/* Stats */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(stats.average_rating)} size="md" />
              <span className="text-2xl font-semibold text-brand-green">{stats.average_rating}</span>
            </div>
            <span className="text-stone-400">|</span>
            <span className="text-stone-600">{stats.total_reviews} {t('reviews.reviewsCount')}</span>
          </div>
        </div>

        {/* Reviews Grid & Form */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Reviews */}
          <div className="lg:col-span-2">
            <div className="grid sm:grid-cols-2 gap-6">
              {reviews.slice(0, 6).map((review) => (
                <ReviewCard key={review.id} review={review} t={t} />
              ))}
            </div>
          </div>

          {/* Form */}
          <div>
            {showForm ? (
              <ReviewForm 
                t={t} 
                courses={courses} 
                onSuccess={() => {
                  setShowForm(false);
                  fetchData();
                }} 
              />
            ) : (
              <div className="bg-white border border-stone-100 p-6 rounded-sm text-center">
                <CheckCircle className="w-12 h-12 text-brand-green mx-auto mb-4" />
                <h4 className="font-heading text-xl text-stone-900 mb-2">{t('reviews.shareExperience')}</h4>
                <p className="text-stone-600 text-sm mb-6">{t('reviews.shareDescription')}</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary w-full"
                  data-testid="write-review-btn"
                >
                  {t('reviews.writeReview')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

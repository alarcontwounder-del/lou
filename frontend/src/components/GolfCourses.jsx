import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, ExternalLink, Phone, Flag, Ruler, Trophy } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CourseCard = ({ course, language, t }) => (
  <div
    className="flip-card"
    data-testid={`course-card-${course.id}`}
  >
    <div className="flip-card-inner">
      {/* Front of Card */}
      <div className="flip-card-front bg-white border border-stone-100 shadow-sm rounded-2xl">
        {/* Image - Vertical/Portrait orientation */}
        <div className="h-64 overflow-hidden rounded-t-2xl relative m-3 mb-0">
          <img
            src={course.image}
            alt={course.name}
            className="w-full h-full object-cover transition-transform duration-500 rounded-xl"
          />
          {/* Price Badge */}
          {course.price_from && (
            <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-stone-800 text-sm font-semibold px-3 py-1.5 rounded-full shadow-sm">
              From €{course.price_from}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 pt-4">
          <div className="flex items-center gap-2 text-stone-400 text-xs mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>{course.location}</span>
          </div>

          <h3 className="font-heading text-xl text-stone-900 mb-2">
            {course.name}
          </h3>

          <p className="text-stone-500 text-sm mb-4 line-clamp-2">
            {course.description[language] || course.description.en}
          </p>

          {/* Stats */}
          <div className="flex gap-4 mb-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-stone-400">{t('courses.holes')}</span>
              <p className="text-lg font-semibold text-stone-700">{course.holes}</p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-stone-400">{t('courses.par')}</span>
              <p className="text-lg font-semibold text-stone-700">{course.par}</p>
            </div>
          </div>

          {/* Hover hint */}
          <p className="text-xs text-stone-400 italic">Hover for details →</p>
        </div>
      </div>

      {/* Back of Card */}
      <div className="flip-card-back rounded-2xl" style={{ background: 'linear-gradient(135deg, #0a5f38 0%, #084a2b 100%)' }}>
        <h3 className="font-heading text-2xl mb-5">{course.name}</h3>
        
        <div className="space-y-3">
          {/* Location */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-white/70 text-xs uppercase tracking-wider mb-0.5">Location</p>
              <p className="text-sm">{course.location}</p>
            </div>
          </div>

          {/* Course Info */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-white/70 text-xs uppercase tracking-wider mb-0.5">Course</p>
              <p className="text-sm">{course.holes} Holes • Par {course.par}</p>
            </div>
          </div>

          {/* Phone if available */}
          {course.phone && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-white/70 text-xs uppercase tracking-wider mb-0.5">Pro Shop</p>
                <p className="text-sm">{course.phone}</p>
              </div>
            </div>
          )}

          {/* Features */}
          {course.features && course.features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {course.features.slice(0, 3).map((feature, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 bg-white/15 rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}

          {/* Price */}
          {course.price_from && (
            <div className="bg-white/10 rounded-lg p-3 mt-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Green Fee from €{course.price_from}
              </p>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <a
          href={course.booking_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center justify-center gap-2 bg-white text-stone-800 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition-all"
          data-testid={`course-book-${course.id}`}
        >
          {t('courses.bookNow')}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  </div>
);

export const GolfCourses = () => {
  const { language, t } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API}/golf-courses`);
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching golf courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <section id="courses" className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="section-padding bg-white" data-testid="courses-section">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-brand-terracotta text-sm uppercase tracking-[0.2em] mb-4" data-testid="courses-subtitle">
            {t('courses.subtitle')}
          </p>
          <h2 className="font-heading text-4xl md:text-5xl text-stone-900 mb-4" data-testid="courses-title">
            {t('courses.title')}
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            {t('courses.description')}
          </p>
        </div>

        {/* Grid - 3 cards per row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              language={language} 
              t={t} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

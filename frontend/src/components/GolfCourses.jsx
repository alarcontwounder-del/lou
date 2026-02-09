import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, ExternalLink } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CourseCard = ({ course, language, t, isLarge }) => (
  <div
    className={`card-hover bg-white border border-stone-100 overflow-hidden group ${
      isLarge ? 'md:col-span-2 md:row-span-2' : ''
    }`}
    data-testid={`course-card-${course.id}`}
  >
    {/* Image */}
    <div className={`img-zoom ${isLarge ? 'aspect-video' : 'aspect-[4/3]'}`}>
      <img
        src={course.image}
        alt={course.name}
        className="w-full h-full object-cover"
      />
    </div>

    {/* Content */}
    <div className="p-5 md:p-6">
      {/* Location */}
      {course.location && (
        <div className="flex items-center gap-1.5 text-stone-400 text-sm mb-2">
          <MapPin className="w-3.5 h-3.5" />
          <span>{course.location}</span>
        </div>
      )}

      <h3 className={`font-heading text-stone-900 mb-2 ${isLarge ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>
        {course.name}
      </h3>
      
      <p className="text-stone-600 text-sm mb-4 line-clamp-2">
        {course.description[language] || course.description.en}
      </p>

      {/* Stats */}
      <div className="flex gap-4 mb-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-stone-400">{t('courses.holes')}</span>
          <p className="text-lg font-semibold text-brand-green">{course.holes}</p>
        </div>
        <div>
          <span className="text-xs uppercase tracking-wider text-stone-400">{t('courses.par')}</span>
          <p className="text-lg font-semibold text-brand-green">{course.par}</p>
        </div>
        {course.price_from && (
          <div>
            <span className="text-xs uppercase tracking-wider text-stone-400">{t('courses.from')}</span>
            <p className="text-lg font-semibold text-brand-terracotta">€{course.price_from}</p>
          </div>
        )}
      </div>

      {/* Features - only show on larger cards or first few */}
      {isLarge && (
        <div className="flex flex-wrap gap-2 mb-4">
          {course.features.slice(0, 4).map((feature, i) => (
            <span
              key={i}
              className="text-xs px-2.5 py-1 bg-brand-sand/20 text-stone-600 rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      <a
        href={course.booking_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-brand-green text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brand-green/90 transition-colors"
        data-testid={`course-book-${course.id}`}
      >
        {t('courses.bookNow')}
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
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

        {/* Grid - responsive for many courses */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              language={language} 
              t={t} 
              isLarge={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

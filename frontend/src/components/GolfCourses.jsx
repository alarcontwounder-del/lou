import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, ExternalLink } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
        <div className="text-center mb-16">
          <p className="text-brand-terracotta text-sm uppercase tracking-[0.2em] mb-4" data-testid="courses-subtitle">
            {t('courses.subtitle')}
          </p>
          <h2 className="font-heading text-4xl md:text-5xl text-stone-900" data-testid="courses-title">
            {t('courses.title')}
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="bento-grid">
          {courses.map((course, index) => (
            <div
              key={course.id}
              className={`card-hover bg-white border border-stone-100 overflow-hidden group ${
                index === 0 ? 'bento-large' : ''
              }`}
              data-testid={`course-card-${course.id}`}
            >
              {/* Image */}
              <div className={`img-zoom ${index === 0 ? 'aspect-video' : 'aspect-[4/3]'}`}>
                <img
                  src={course.image}
                  alt={course.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-6 md:p-8">
                <h3 className="font-heading text-2xl md:text-3xl text-stone-900 mb-3">
                  {course.name}
                </h3>
                <p className="text-stone-600 mb-4 line-clamp-2">
                  {course.description[language] || course.description.en}
                </p>

                {/* Stats */}
                <div className="flex gap-6 mb-6">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-stone-400">{t('courses.holes')}</span>
                    <p className="text-xl font-semibold text-brand-green">{course.holes}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-stone-400">{t('courses.par')}</span>
                    <p className="text-xl font-semibold text-brand-green">{course.par}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {course.features.slice(0, 3).map((feature, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1.5 bg-brand-sand/20 text-stone-600 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <a
                  href={course.booking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-brand-green hover:text-brand-terracotta transition-colors font-medium"
                  data-testid={`course-book-${course.id}`}
                >
                  {t('courses.bookNow')}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

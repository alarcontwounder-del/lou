import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, ExternalLink, Phone, Flag, Ruler, Trophy, Globe, Navigation } from 'lucide-react';
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
      <div className="flip-card-front bg-stone-300 border border-stone-300 shadow-sm rounded-2xl">
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
          <div 
            className="flex items-center gap-2 text-stone-400 text-xs mb-2 cursor-pointer hover:text-brand-slate transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(course.name + ', ' + course.location + ', Mallorca')}`, '_blank');
            }}
            title="Open in Google Maps"
          >
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
      <div className="flip-card-back rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #2D2D2D 0%, #3D3D3D 100%)' }}>
        <h3 className="font-heading text-2xl mb-5">{course.name}</h3>
        
        <div className="space-y-3">
          {/* Location - Clickable */}
          <div 
            className="location-link flex items-start gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(course.full_address || course.name + ', ' + course.location + ', Mallorca')}`, '_blank');
            }}
            title="Open in Google Maps"
          >
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Navigation className="w-4 h-4" />
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
      <section id="courses" className="section-padding bg-brand-cream">
        <div className="container-custom">
          <div className="text-center">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="section-padding bg-brand-cream" data-testid="courses-section">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-brand-slate text-sm uppercase tracking-[0.2em] mb-4" data-testid="courses-subtitle">
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

        {/* Worldwide Booking CTA */}
        <div 
          className="mt-16 relative overflow-hidden rounded-3xl"
          data-testid="worldwide-golf-cta"
        >
          {/* Background with gradient overlay - same as hero */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://customer-assets.emergentagent.com/job_422d7e07-6f75-490f-aee9-3e5fef6c152e/artifacts/42pl3jtx_golf%20son-gual%20mallorca%20portada%20hole13-%20copy.JPG')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-charcoal/95 via-brand-charcoal/85 to-brand-charcoal/70" />
          
          {/* Content */}
          <div className="relative z-10 px-8 py-12 md:px-16 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full mb-4">
                <Globe className="w-4 h-4 text-brand-gold" />
                <span className="text-white/90 text-sm font-medium">Worldwide Tee Times</span>
              </div>
              <h3 className="font-heading text-3xl md:text-4xl text-white mb-4">
                {language === 'de' ? 'Golf spielen, wo immer Sie sind' :
                 language === 'fr' ? 'Jouez au golf où que vous soyez' :
                 language === 'se' ? 'Spela golf var du än är' :
                 'Play Golf Wherever You Are'}
              </h3>
              <p className="text-white/80 text-lg leading-relaxed">
                {language === 'de' ? 'Planen Sie Ihre Reise? Buchen Sie Abschlagszeiten in Ihrem Heimatland, Ihrer Zielstadt oder fast überall auf der Welt – bevor oder während Ihrer Reise.' :
                 language === 'fr' ? 'Vous planifiez votre voyage ? Réservez des départs dans votre pays, votre ville de destination ou presque partout dans le monde – avant ou pendant votre voyage.' :
                 language === 'se' ? 'Planerar du din resa? Boka starttider i ditt hemland, din destinationsstad eller nästan var som helst i världen – före eller under din resa.' :
                 'Planning your trip? Book tee times in your home country, destination city, or almost anywhere in the world – before or during your travels.'}
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <a
                href="https://golfinmallorca.greenfee365.com/es-ES/search?query=all_clubs"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 bg-white text-brand-charcoal px-8 py-4 rounded-full font-semibold text-lg hover:bg-stone-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                data-testid="worldwide-golf-btn"
              >
                <span>
                  {language === 'de' ? 'Weltweit erkunden' :
                   language === 'fr' ? 'Explorer le monde' :
                   language === 'se' ? 'Utforska världen' :
                   'Explore Worldwide'}
                </span>
                <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <span className="text-white/60 text-sm">
                {language === 'de' ? 'Über 3.000 Golfplätze verfügbar' :
                 language === 'fr' ? 'Plus de 3 000 parcours disponibles' :
                 language === 'se' ? 'Över 3 000 banor tillgängliga' :
                 'Over 3,000 courses available'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, ExternalLink, Coffee, Clock, Croissant, Navigation } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CafeBarCard = ({ place, language, t }) => (
  <div
    className="flip-card"
    data-testid={`cafe-bar-card-${place.id}`}
  >
    <div className="flip-card-inner">
      {/* Front of Card */}
      <div className="flip-card-front bg-white border border-stone-100 shadow-sm rounded-2xl">
        {/* Discount Badge */}
        {place.discount_percent && (
          <div className="absolute top-6 right-6 z-10 bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {t('offers.save')} {place.discount_percent}%
          </div>
        )}

        {/* Image */}
        <div className="h-64 overflow-hidden rounded-t-2xl relative m-3 mb-0">
          <img
            src={place.image}
            alt={place.name}
            className="w-full h-full object-cover transition-transform duration-500 rounded-xl"
          />
          {/* Category Icon Overlay */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1.5">
            <Coffee className="w-4 h-4 text-amber-700" />
            <span className="text-xs font-medium text-stone-700">
              {place.category || 'Café & Bar'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 pt-4">
          {/* Specialty Tags */}
          {place.specialty && (
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 font-medium rounded flex items-center gap-1">
                <Croissant className="w-3 h-3" />
                {place.specialty}
              </span>
            </div>
          )}
          
          <div 
            className="location-link flex items-center gap-2 text-stone-400 text-xs mb-2 cursor-pointer hover:text-amber-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.full_address || place.name + ', ' + place.location + ', Mallorca')}`, '_blank');
            }}
            title="Open in Google Maps"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{place.location}</span>
          </div>

          <h3 className="font-heading text-xl text-stone-900 mb-2">
            {place.name}
          </h3>

          <p className="text-stone-500 text-sm mb-4 line-clamp-2">
            {place.description[language] || place.description.en}
          </p>

          {/* Deal Preview */}
          {place.deal && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 mb-3">
              <p className="text-xs font-medium text-amber-700 line-clamp-1">
                {place.deal[language] || place.deal.en}
              </p>
            </div>
          )}

          {/* Hover Indicator */}
          <p className="text-xs text-stone-400 text-center mt-2 italic">
            {t('card.hoverForDetails') || 'Hover for details'}
          </p>
        </div>
      </div>

      {/* Back of Card */}
      <div className="flip-card-back bg-gradient-to-br from-amber-700 to-orange-800 rounded-2xl p-6 flex flex-col justify-between text-white">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Coffee className="w-5 h-5 text-amber-200" />
            <h3 className="text-white text-xl font-heading font-semibold">
              {place.name}
            </h3>
          </div>
          
          <p className="text-amber-100 text-sm leading-relaxed mb-4">
            {place.description[language] || place.description.en}
          </p>

          {/* Location - Clickable */}
          <div 
            className="location-link flex items-center gap-2 text-amber-100 text-sm mb-4 cursor-pointer hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.full_address || place.name + ', ' + place.location + ', Mallorca')}`, '_blank');
            }}
            title="Open in Google Maps"
          >
            <Navigation className="w-4 h-4" />
            <span>{place.location}</span>
          </div>

          {/* Deal */}
          {place.deal && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
              <p className="text-white text-xs uppercase tracking-wider mb-1 opacity-80">{t('offers.exclusive')}</p>
              <p className="text-white font-semibold text-sm">
                {place.deal[language] || place.deal.en}
              </p>
            </div>
          )}

          {/* Opening Hours if available */}
          {place.hours && (
            <div className="flex items-center gap-2 text-amber-100 text-sm">
              <Clock className="w-4 h-4" />
              <span>{place.hours}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <a
          href={place.contact_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 bg-white text-amber-700 text-center rounded-xl font-semibold hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
        >
          {t('offers.viewDetails') || 'View Details'}
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  </div>
);

export const CafeBarsPartners = () => {
  const { t, language } = useLanguage();
  const [cafeBars, setCafeBars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCafeBars = async () => {
      try {
        const response = await axios.get(`${API}/partner-offers?type=cafe_bar`);
        setCafeBars(response.data);
      } catch (error) {
        console.error('Error fetching cafes and bars:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCafeBars();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-amber-50 to-white">
        <div className="container-custom">
          <div className="text-center">Loading cafés & bars...</div>
        </div>
      </section>
    );
  }

  if (cafeBars.length === 0) {
    return null;
  }

  return (
    <section id="cafes-bars" className="py-20 bg-white" data-testid="cafes-bars-section">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Coffee className="w-6 h-6 text-amber-700" />
            <span className="text-sm uppercase tracking-[0.2em] text-amber-700 font-medium">
              {t('cafeBars.subtitle') || 'Coffee, Cocktails & Brunch'}
            </span>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl text-stone-900 mb-4">
            {t('cafeBars.title') || 'Bars, Cafés & Brunch'}
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            {t('cafeBars.description') || 'From the perfect morning espresso to sunset cocktails, discover Mallorca\'s best spots for coffee lovers and social gatherings.'}
          </p>
        </div>

        {/* Cafe & Bar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cafeBars.map((place) => (
            <CafeBarCard 
              key={place.id} 
              place={place} 
              language={language}
              t={t}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CafeBarsPartners;

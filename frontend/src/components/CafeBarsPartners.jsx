import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { MapPin, ExternalLink, Coffee, Clock, Croissant, Navigation, Eye } from 'lucide-react';
import { QuickViewModal } from './QuickViewModal';

const CafeBarCard = ({ place, language, t, onQuickView }) => {
  const inactive = place.is_active === false;
  return (
  <div
    className={`flip-card ${inactive ? 'inactive-card' : ''}`}
    data-testid={`cafe-bar-card-${place.id}`}
  >
    <div className={`flip-card-inner ${inactive ? 'pointer-events-none' : ''}`}>
      {/* Front of Card */}
      <div className={`flip-card-front bg-white border border-stone-100 shadow-sm rounded-2xl`}>
        {/* Discount Badge */}
        {!inactive && place.discount_percent && (
          <div className="absolute top-6 right-6 z-10 bg-brand-slate text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {t('offers.save')} {place.discount_percent}%
          </div>
        )}
        {inactive && (
          <div className="absolute top-6 right-6 z-10 bg-stone-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            Coming Soon
          </div>
        )}

        {/* Image */}
        <div className="h-56 overflow-hidden rounded-t-2xl relative m-3 mb-0">
          <img loading="lazy"
            src={place.image}
            alt={place.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 rounded-xl"
          />
          {/* Category Icon Overlay */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1.5">
            <Coffee className="w-4 h-4 text-stone-600" />
            <span className="text-xs font-medium text-stone-700">
              {place.category || 'Café & Bar'}
            </span>
          </div>
          {/* Quick View Button */}
          {!inactive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(place);
            }}
            className="absolute top-3 left-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-white transition-all shadow-sm"
            title="Quick View"
            data-testid={`cafe-bar-quick-view-${place.id}`}
          >
            <Eye className="w-4 h-4" />
          </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5 pt-4">
          {/* Specialty Tags */}
          {place.specialty && (
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs px-2 py-1 bg-stone-100 text-stone-600 font-medium rounded flex items-center gap-1">
                <Croissant className="w-3 h-3" />
                {place.specialty}
              </span>
            </div>
          )}

          {/* Nearest Golf Course */}
          {place.nearest_golf && (
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-2" data-testid={`cafe-nearest-golf-${place.id}`}>
              <Navigation className="w-3 h-3" />
              <span>{place.distance_km}km to {place.nearest_golf}</span>
            </div>
          )}
          
          <div 
            className="location-link flex items-center gap-2 text-stone-400 text-xs mb-2 cursor-pointer hover:text-brand-slate transition-colors"
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
            <div className="bg-stone-50 border border-stone-100 rounded-lg p-3 mb-3">
              <p className="text-xs font-medium text-stone-600 line-clamp-1">
                {place.deal[language] || place.deal.en}
              </p>
            </div>
          )}

          {/* Hover Indicator */}
          {!inactive && (
          <p className="text-xs text-stone-400 text-center mt-2 italic hidden md:block">
            {t('card.hoverForDetails') || 'Hover for details'}
          </p>
          )}
          {!inactive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(place);
            }}
            className="md:hidden text-xs text-brand-slate font-medium flex items-center gap-1 mx-auto mt-2"
          >
            <Eye className="w-3 h-3" />
            View Details
          </button>
          )}
        </div>
      </div>

      {/* Back of Card */}
      <div className={`flip-card-back rounded-2xl p-6 flex flex-col justify-between text-white`} style={{ background: 'linear-gradient(135deg, #2D2D2D 0%, #3D3D3D 100%)' }}>
        {inactive ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Coffee className="w-5 h-5 text-stone-300 mb-3" />
            <h3 className="text-white text-xl font-heading font-semibold mb-4">{place.name}</h3>
            <p className="text-white/70 text-sm text-center">This partner is not yet available.</p>
            <p className="text-white/50 text-xs mt-2 text-center">Check back soon for availability.</p>
          </div>
        ) : (
        <>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Coffee className="w-5 h-5 text-stone-300" />
            <h3 className="text-white text-xl font-heading font-semibold">
              {place.name}
            </h3>
          </div>
          
          <p className="text-stone-300 text-sm leading-relaxed mb-4">
            {place.description[language] || place.description.en}
          </p>

          {/* Location - Clickable */}
          <div 
            className="location-link flex items-center gap-2 text-stone-300 text-sm mb-4 cursor-pointer hover:text-white transition-colors"
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
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
              <p className="text-white text-xs uppercase tracking-wider mb-1 opacity-80">{t('offers.exclusive')}</p>
              <p className="text-white font-semibold text-sm">
                {place.deal[language] || place.deal.en}
              </p>
            </div>
          )}

          {/* Opening Hours if available */}
          {place.hours && (
            <div className="flex items-center gap-2 text-stone-300 text-sm">
              <Clock className="w-4 h-4" />
              <span>{place.hours}</span>
            </div>
          )}

          {/* Nearest Golf */}
          {place.nearest_golf && (
            <div className="flex items-center gap-2 text-white/80 text-sm mt-3">
              <Navigation className="w-4 h-4" />
              <span>{place.distance_km}km from {place.nearest_golf}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <a
          href={place.contact_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 mt-4 bg-white text-stone-800 text-center rounded-xl font-semibold hover:bg-stone-100 transition-colors flex items-center justify-center gap-2"
        >
          {t('offers.viewDetails') || 'View Details'}
          <ExternalLink className="w-4 h-4" />
        </a>
        </>
        )}
      </div>
    </div>
  </div>
  );
};

export const CafeBarsPartners = () => {
  const { t, language } = useLanguage();
  const { cafeBars, loading, getDisplayedItems } = useData();
  const [quickViewItem, setQuickViewItem] = useState(null);

  // Apply display limit
  const displayedCafeBars = getDisplayedItems(cafeBars, 'cafe_bars');

  if (loading) {
    return (
      <section className="section-padding bg-brand-cream">
        <div className="container-custom">
          <div className="text-center py-10">
            <div className="inline-block w-8 h-8 border-4 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  if (cafeBars.length === 0) {
    return null;
  }

  return (
    <>
      <section id="cafes-bars" className="section-padding bg-brand-cream" data-testid="cafes-bars-section">
        <div className="container-custom">
          {/* Section Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Coffee className="w-6 h-6 text-stone-500" />
              <span className="text-sm uppercase tracking-[0.2em] text-stone-500 font-medium">
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
            {displayedCafeBars.map((place) => (
              <CafeBarCard 
                key={place.id} 
                place={place} 
                language={language}
                t={t}
                onQuickView={setQuickViewItem}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        isOpen={!!quickViewItem}
        onClose={() => setQuickViewItem(null)}
        item={quickViewItem}
        type="cafe_bar"
        language={language}
        t={t}
      />
    </>
  );
};

export default CafeBarsPartners;

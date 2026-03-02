import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { MapPin, ExternalLink, Phone, Mail, Globe, Navigation, Eye } from 'lucide-react';
import { QuickViewModal } from './QuickViewModal';

const HotelCard = ({ hotel, language, t, onQuickView }) => (
  <div
    className="flip-card"
    data-testid={`hotel-card-${hotel.id}`}
  >
    <div className="flip-card-inner">
      {/* Front of Card */}
      <div className="flip-card-front bg-white border border-stone-100 shadow-sm rounded-2xl">
        {/* Discount Badge */}
        {hotel.discount_percent && (
          <div className="absolute top-6 right-6 z-10 bg-brand-slate text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {t('offers.save')} {hotel.discount_percent}%
          </div>
        )}

        {/* Image - Vertical with rounded edges */}
        <div className="h-64 overflow-hidden rounded-t-2xl relative m-3 mb-0">
          <img loading="lazy"
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-full object-cover transition-transform duration-500 rounded-xl"
          />
          {/* Quick View Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(hotel);
            }}
            className="absolute top-3 left-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-white transition-all shadow-sm"
            title="Quick View"
            data-testid={`hotel-quick-view-${hotel.id}`}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 pt-4">
          {/* Category & Region Tags */}
          {(hotel.category || hotel.region) && (
            <div className="flex items-center gap-2 mb-2">
              {hotel.category && (
                <span className="text-xs px-2 py-1 bg-brand-slate/20 text-brand-charcoal font-medium rounded">
                  {hotel.category}
                </span>
              )}
              {hotel.region && (
                <span className="text-xs px-2 py-1 bg-brand-charcoal/10 text-brand-charcoal font-medium rounded">
                  {hotel.region}
                </span>
              )}
            </div>
          )}
          
          <div 
            className="location-link flex items-center gap-2 text-stone-400 text-xs mb-2 cursor-pointer hover:text-brand-slate transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.full_address || hotel.name + ', ' + hotel.location + ', Mallorca')}`, '_blank');
            }}
            title="Open in Google Maps"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{hotel.location}</span>
          </div>

          <h3 className="font-heading text-xl text-stone-900 mb-2">
            {hotel.name}
          </h3>

          <p className="text-stone-500 text-sm mb-4 line-clamp-2">
            {hotel.description[language] || hotel.description.en}
          </p>

          {/* Pricing */}
          {hotel.offer_price && (
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xs uppercase tracking-wider text-stone-400">{t('offers.from')}</span>
              <span className="text-xl font-semibold text-stone-800">
                €{hotel.offer_price}
              </span>
              {hotel.original_price && (
                <span className="text-sm text-stone-400 line-through">
                  €{hotel.original_price}
                </span>
              )}
            </div>
          )}

          {/* Hover hint */}
          <p className="text-xs text-stone-400 italic hidden md:block">Hover for details →</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(hotel);
            }}
            className="md:hidden text-xs text-brand-slate font-medium flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            View Details
          </button>
        </div>
      </div>

      {/* Back of Card */}
      <div className="flip-card-back rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #2D2D2D 0%, #3D3D3D 100%)' }}>
        <h3 className="font-heading text-2xl mb-6">{hotel.name}</h3>
        
        <div className="space-y-4">
          {/* Location - Clickable */}
          <div 
            className="location-link flex items-start gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.full_address || hotel.name + ', ' + hotel.location + ', Mallorca')}`, '_blank');
            }}
            title="Open in Google Maps"
          >
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Location</p>
              <p className="text-sm">{hotel.location}</p>
              {hotel.address && <p className="text-sm text-white/80">{hotel.address}</p>}
            </div>
          </div>

          {/* Phone */}
          {hotel.phone && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Phone</p>
                <p className="text-sm">{hotel.phone}</p>
              </div>
            </div>
          )}

          {/* Deal */}
          <div className="bg-white/10 rounded-lg p-3 mt-4">
            <p className="text-sm font-medium">
              {hotel.deal[language] || hotel.deal.en}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <a
          href={hotel.contact_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center justify-center gap-2 bg-white text-stone-800 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition-all"
          data-testid={`hotel-book-${hotel.id}`}
        >
          {t('offers.bookHotel')}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  </div>
);

export const HotelPartners = () => {
  const { language, t } = useLanguage();
  const { hotels, loading, getDisplayedItems } = useData();
  const [quickViewItem, setQuickViewItem] = useState(null);

  // Apply display limit
  const displayedHotels = getDisplayedItems(hotels, 'hotels');

  if (loading) {
    return (
      <section id="hotels" className="section-padding bg-brand-cream">
        <div className="container-custom">
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="hotels" className="section-padding bg-brand-cream" data-testid="hotels-section">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-brand-slate text-sm uppercase tracking-[0.2em] mb-4" data-testid="hotels-subtitle">
              {t('hotels.subtitle')}
            </p>
            <h2 className="font-heading text-4xl md:text-5xl text-stone-900 mb-6" data-testid="hotels-title">
              {t('hotels.title')}
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto text-lg">
              {t('hotels.description')}
            </p>
          </div>

          {/* Hotels Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedHotels.map((hotel) => (
              <HotelCard 
                key={hotel.id} 
                hotel={hotel} 
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
        type="hotel"
        language={language}
        t={t}
      />
    </>
  );
};

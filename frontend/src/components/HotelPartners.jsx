import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, ExternalLink, Phone, Mail, Globe, Navigation } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HotelCard = ({ hotel, language, t }) => (
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
          <img
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-full object-cover transition-transform duration-500 rounded-xl"
          />
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
          <p className="text-xs text-stone-400 italic">Hover for details →</p>
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
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await axios.get(`${API}/partner-offers?type=hotel`);
        setHotels(response.data);
      } catch (error) {
        console.error('Error fetching hotels:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  if (loading) {
    return (
      <section id="hotels" className="section-padding bg-brand-cream">
        <div className="container-custom">
          <div className="text-center">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="hotels" className="section-padding bg-brand-cream" data-testid="hotels-section">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
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
          {hotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} language={language} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
};

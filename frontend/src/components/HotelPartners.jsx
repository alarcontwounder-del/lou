import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, ExternalLink, Star } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HotelCard = ({ hotel, language, t }) => (
  <div
    className="card-hover bg-white border border-stone-100 overflow-hidden group relative"
    data-testid={`hotel-card-${hotel.id}`}
  >
    {/* Discount Badge */}
    {hotel.discount_percent && (
      <div className="deal-badge">
        {t('offers.save')} {hotel.discount_percent}%
      </div>
    )}

    {/* Image */}
    <div className="img-zoom aspect-[4/3]">
      <img
        src={hotel.image}
        alt={hotel.name}
        className="w-full h-full object-cover"
      />
    </div>

    {/* Content */}
    <div className="p-6">
      <div className="flex items-center gap-2 text-stone-400 text-sm mb-2">
        <MapPin className="w-4 h-4" />
        <span>{hotel.location}</span>
      </div>

      <h3 className="font-heading text-xl md:text-2xl text-stone-900 mb-2">
        {hotel.name}
      </h3>

      <p className="text-stone-600 text-sm mb-4 line-clamp-2">
        {hotel.description[language] || hotel.description.en}
      </p>

      {/* Deal */}
      <div className="bg-brand-sand/10 rounded-sm p-4 mb-4">
        <p className="text-sm font-medium text-brand-green">
          {hotel.deal[language] || hotel.deal.en}
        </p>
      </div>

      {/* Pricing */}
      {hotel.offer_price && (
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-xs uppercase tracking-wider text-stone-400">{t('offers.from')}</span>
          <span className="text-xl font-semibold text-brand-green">
            €{hotel.offer_price}
          </span>
          {hotel.original_price && (
            <span className="text-sm text-stone-400 line-through">
              €{hotel.original_price}
            </span>
          )}
        </div>
      )}

      {/* CTA Button */}
      <a
        href={hotel.contact_url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full btn-primary inline-flex items-center justify-center gap-2 text-sm"
        data-testid={`hotel-book-${hotel.id}`}
      >
        {t('offers.bookHotel')}
        <ExternalLink className="w-4 h-4" />
      </a>
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
        const response = await axios.get(`${API}/partner-offers?offer_type=hotel`);
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
          <p className="text-brand-terracotta text-sm uppercase tracking-[0.2em] mb-4" data-testid="hotels-subtitle">
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

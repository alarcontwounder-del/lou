import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, ExternalLink, Phone, Wine, Clock, Utensils } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RestaurantCard = ({ restaurant, language, t }) => (
  <div
    className="flip-card"
    data-testid={`restaurant-card-${restaurant.id}`}
  >
    <div className="flip-card-inner">
      {/* Front of Card */}
      <div className="flip-card-front bg-white border border-stone-100 shadow-sm rounded-2xl">
        {/* Discount Badge */}
        {restaurant.discount_percent && (
          <div className="absolute top-6 right-6 z-10 bg-brand-terracotta text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {t('offers.save')} {restaurant.discount_percent}%
          </div>
        )}

        {/* Image - Vertical with rounded edges */}
        <div className="h-64 overflow-hidden rounded-t-2xl relative m-3 mb-0">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover transition-transform duration-500 rounded-xl"
          />
        </div>

        {/* Content */}
        <div className="p-5 pt-4">
          <div className="flex items-center gap-2 text-stone-400 text-xs mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>{restaurant.location}</span>
          </div>

          <h3 className="font-heading text-xl text-stone-900 mb-2">
            {restaurant.name}
          </h3>

          <p className="text-stone-500 text-sm mb-4 line-clamp-2">
            {restaurant.description[language] || restaurant.description.en}
          </p>

          {/* Pricing */}
          {restaurant.offer_price && (
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xs uppercase tracking-wider text-stone-400">{t('offers.from')}</span>
              <span className="text-xl font-semibold text-stone-800">
                €{restaurant.offer_price}
              </span>
              {restaurant.original_price && (
                <span className="text-sm text-stone-400 line-through">
                  €{restaurant.original_price}
                </span>
              )}
            </div>
          )}

          {/* Hover hint */}
          <p className="text-xs text-stone-400 italic">Hover for details →</p>
        </div>
      </div>

      {/* Back of Card */}
      <div className="flip-card-back rounded-2xl" style={{ background: 'linear-gradient(135deg, #723480 0%, #5a2866 100%)' }}>
        <h3 className="font-heading text-2xl mb-6">{restaurant.name}</h3>
        
        <div className="space-y-4">
          {/* Location */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Location</p>
              <p className="text-sm">{restaurant.location}</p>
              {restaurant.address && <p className="text-sm text-white/80">{restaurant.address}</p>}
            </div>
          </div>

          {/* Phone */}
          {restaurant.phone && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Reservations</p>
                <p className="text-sm">{restaurant.phone}</p>
              </div>
            </div>
          )}

          {/* Cuisine Type */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Cuisine</p>
              <p className="text-sm">Mediterranean Fine Dining</p>
            </div>
          </div>

          {/* Deal */}
          <div className="bg-white/10 rounded-lg p-3 mt-4">
            <p className="text-sm font-medium flex items-center gap-2">
              <Wine className="w-4 h-4" />
              {restaurant.deal[language] || restaurant.deal.en}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <a
          href={restaurant.contact_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center justify-center gap-2 bg-white text-stone-800 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition-all"
          data-testid={`restaurant-reserve-${restaurant.id}`}
        >
          {t('restaurants.reserve')}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  </div>
);

export const RestaurantPartners = () => {
  const { language, t } = useLanguage();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get(`${API}/partner-offers?offer_type=restaurant`);
        setRestaurants(response.data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <section id="restaurants" className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="restaurants" className="section-padding bg-white" data-testid="restaurants-section">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-brand-terracotta text-sm uppercase tracking-[0.2em] mb-4" data-testid="restaurants-subtitle">
            {t('restaurants.subtitle')}
          </p>
          <h2 className="font-heading text-4xl md:text-5xl text-stone-900 mb-6" data-testid="restaurants-title">
            {t('restaurants.title')}
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto text-lg">
            {t('restaurants.description')}
          </p>
        </div>

        {/* Restaurants Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} language={language} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
};

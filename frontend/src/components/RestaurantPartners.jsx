import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, ExternalLink, Utensils, Wine } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RestaurantCard = ({ restaurant, language, t }) => (
  <div
    className="card-hover bg-white border border-stone-100 overflow-hidden group relative"
    data-testid={`restaurant-card-${restaurant.id}`}
  >
    {/* Discount Badge */}
    {restaurant.discount_percent && (
      <div className="deal-badge">
        {t('offers.save')} {restaurant.discount_percent}%
      </div>
    )}

    {/* Image */}
    <div className="img-zoom aspect-[4/3]">
      <img
        src={restaurant.image}
        alt={restaurant.name}
        className="w-full h-full object-cover"
      />
    </div>

    {/* Content */}
    <div className="p-6">
      <div className="flex items-center gap-2 text-stone-400 text-sm mb-2">
        <MapPin className="w-4 h-4" />
        <span>{restaurant.location}</span>
      </div>

      <h3 className="font-heading text-xl md:text-2xl text-stone-900 mb-2">
        {restaurant.name}
      </h3>

      <p className="text-stone-600 text-sm mb-4 line-clamp-2">
        {restaurant.description[language] || restaurant.description.en}
      </p>

      {/* Deal */}
      <div className="bg-brand-terracotta/10 rounded-sm p-4 mb-4">
        <p className="text-sm font-medium text-brand-terracotta flex items-center gap-2">
          <Wine className="w-4 h-4" />
          {restaurant.deal[language] || restaurant.deal.en}
        </p>
      </div>

      {/* Pricing */}
      {restaurant.offer_price && (
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-xs uppercase tracking-wider text-stone-400">{t('offers.from')}</span>
          <span className="text-xl font-semibold text-brand-green">
            €{restaurant.offer_price}
          </span>
          {restaurant.original_price && (
            <span className="text-sm text-stone-400 line-through">
              €{restaurant.original_price}
            </span>
          )}
        </div>
      )}

      {/* CTA Button */}
      <a
        href={restaurant.contact_url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full btn-secondary inline-flex items-center justify-center gap-2 text-sm"
        data-testid={`restaurant-reserve-${restaurant.id}`}
      >
        {t('restaurants.reserve')}
        <ExternalLink className="w-4 h-4" />
      </a>
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

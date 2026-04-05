import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { MapPin, ExternalLink, Phone, Wine, Clock, Utensils, Navigation, Eye, ChevronDown } from 'lucide-react';
import { QuickViewModal } from './QuickViewModal';
import { BookingRequestModal } from './BookingRequestModal';
import { FavoriteButton } from './FavoriteButton';
import { CardSkeleton } from './CardSkeleton';
import { useIsMobile } from '../hooks/useIsMobile';

const RestaurantCard = ({ restaurant, language, t, onQuickView }) => {
  const inactive = restaurant.is_active === false;
  return (
  <div
    className={`flip-card ${inactive ? 'inactive-card' : ''}`}
    data-testid={`restaurant-card-${restaurant.id}`}
  >
    <div className={`flip-card-inner ${inactive ? 'pointer-events-none' : ''}`}>
      {/* Front of Card */}
      <div className={`flip-card-front bg-white border border-stone-100 shadow-sm rounded-2xl`}>
        {/* Discount Badge */}
        {!inactive && restaurant.discount_percent && (
          <div className="absolute top-6 right-6 z-10 bg-brand-slate text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {t('offers.save')} {restaurant.discount_percent}%
          </div>
        )}
        {inactive && (
          <div className="absolute top-6 right-6 z-10 bg-stone-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            Coming Soon
          </div>
        )}

        {/* Image - Properly framed with center focus */}
        <div className="h-56 overflow-hidden rounded-t-2xl relative m-3 mb-0">
          <img loading="lazy"
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 rounded-xl"
          />
          {/* Quick View Button */}
          {!inactive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(restaurant);
            }}
            className="absolute top-3 left-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-white transition-all shadow-sm"
            title="Quick View"
            data-testid={`restaurant-quick-view-${restaurant.id}`}
          >
            <Eye className="w-4 h-4" />
          </button>
          )}
          {/* Favorite Button */}
          {!inactive && (
            <FavoriteButton 
              item={{ id: restaurant.id, type: 'restaurant', name: restaurant.name, image: restaurant.image, location: restaurant.location }}
              className="absolute bottom-3 right-3 z-10"
            />
          )}
        </div>

        {/* Content */}
        <div className="p-5 pt-4">
          {/* Michelin Stars & Cuisine Type Badges */}
          {(restaurant.michelin_stars || restaurant.cuisine_type) && (
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {restaurant.michelin_stars && (
                <span className="text-xs px-2 py-1 bg-stone-100 text-stone-600 font-semibold rounded border border-stone-200">
                  {restaurant.michelin_stars}
                </span>
              )}
              {restaurant.municipality && (
                <span className="text-xs px-2 py-1 bg-stone-100 text-stone-600 font-medium rounded">
                  {restaurant.municipality}
                </span>
              )}
            </div>
          )}

          {/* Nearest Golf Course */}
          {restaurant.nearest_golf && (
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-2" data-testid={`restaurant-nearest-golf-${restaurant.id}`}>
              <Navigation className="w-3 h-3" />
              <span>{restaurant.distance_km}km to {restaurant.nearest_golf}</span>
            </div>
          )}
          
          <div 
            className="location-link flex items-center gap-2 text-stone-400 text-xs mb-2 cursor-pointer hover:text-brand-slate transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.full_address || restaurant.name + ', ' + restaurant.location + ', Mallorca')}`, '_blank');
            }}
            title="Open in Google Maps"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{restaurant.location}</span>
          </div>

          <h3 className="font-heading text-xl text-stone-900 mb-2">
            {restaurant.name}
          </h3>

          <p className="text-stone-500 text-sm mb-4 line-clamp-2">
            {(restaurant.description && restaurant.description[language]) || (restaurant.description && restaurant.description.en) || ""}
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
          {!inactive && <p className="text-xs text-stone-400 italic hidden md:block">Hover for details →</p>}
          {!inactive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(restaurant);
            }}
            className="md:hidden text-xs text-brand-slate font-medium flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            View Details
          </button>
          )}
        </div>
      </div>

      {/* Back of Card */}
      <div className={`flip-card-back rounded-2xl p-6 text-white`} style={{ background: 'linear-gradient(135deg, #2D2D2D 0%, #3D3D3D 100%)' }}>
        <h3 className="font-heading text-2xl mb-6">{restaurant.name}</h3>
        
        {inactive ? (
          <div className="flex flex-col items-center justify-center h-48">
            <p className="text-white/70 text-sm text-center">This partner is not yet available.</p>
            <p className="text-white/50 text-xs mt-2 text-center">Check back soon for availability.</p>
          </div>
        ) : (
        <>
        <div className="space-y-4">
          {/* Location - Clickable */}
          <div 
            className="location-link flex items-start gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.full_address || restaurant.name + ', ' + restaurant.location + ', Mallorca')}`, '_blank');
            }}
            title="Open in Google Maps"
          >
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Navigation className="w-5 h-5" />
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
              {(restaurant.deal && restaurant.deal[language]) || (restaurant.deal && restaurant.deal.en) || ""}
            </p>
          </div>

          {/* Nearest Golf */}
          {restaurant.nearest_golf && (
            <div className="flex items-center gap-2 text-white/80 text-sm mt-3">
              <Navigation className="w-4 h-4" />
              <span>{restaurant.distance_km}km from {restaurant.nearest_golf}</span>
            </div>
          )}
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
        </>
        )}
      </div>
    </div>
  </div>
  );
};

export const RestaurantPartners = () => {
  const { language, t } = useLanguage();
  const { restaurants, loading, getDisplayedItems } = useData();
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [bookingItem, setBookingItem] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const isMobile = useIsMobile();
  const MOBILE_LIMIT = 6;

  // Apply display limit
  const displayedRestaurants = getDisplayedItems(restaurants, 'restaurants');
  const visibleRestaurants = (isMobile && !expanded && displayedRestaurants.length > MOBILE_LIMIT)
    ? displayedRestaurants.slice(0, MOBILE_LIMIT)
    : displayedRestaurants;
  const hasMore = isMobile && !expanded && displayedRestaurants.length > MOBILE_LIMIT;

  if (loading) {
    return (
      <section id="restaurants" className="section-padding bg-brand-cream">
        <div className="container-custom">
          <div className="text-center mb-8">
            <div className="h-4 bg-stone-200 rounded w-40 mx-auto mb-4 animate-pulse" />
            <div className="h-10 bg-stone-200 rounded w-72 mx-auto mb-4 animate-pulse" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(isMobile ? 3 : 6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="restaurants" className="section-padding bg-brand-cream" data-testid="restaurants-section">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-brand-slate text-sm uppercase tracking-[0.2em] mb-4" data-testid="restaurants-subtitle">
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
            {visibleRestaurants.map((restaurant) => (
              <RestaurantCard 
                key={restaurant.id} 
                restaurant={restaurant} 
                language={language} 
                t={t}
                onQuickView={setQuickViewItem}
              />
            ))}
          </div>

          {/* View All button - mobile only */}
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={() => setExpanded(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-stone-200 rounded-full text-sm font-medium text-stone-600 hover:border-stone-400 hover:text-stone-800 transition-colors shadow-sm"
                data-testid="restaurants-view-all"
              >
                View all {displayedRestaurants.length} restaurants
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        isOpen={!!quickViewItem}
        onClose={() => setQuickViewItem(null)}
        item={quickViewItem}
        type="restaurant"
        language={language}
        t={t}
        onBooking={(item) => { setQuickViewItem(null); setBookingItem(item); }}
      />

      {/* Booking Request Modal */}
      <BookingRequestModal
        isOpen={!!bookingItem}
        onClose={() => setBookingItem(null)}
        venue={bookingItem}
        venueType="restaurant"
      />
    </>
  );
};

import React from 'react';
import { X, MapPin, Phone, ExternalLink, Navigation, Flag, Trophy, Wine, Utensils, Coffee, Umbrella, Clock, Croissant } from 'lucide-react';

export const QuickViewModal = ({ isOpen, onClose, item, type, language, t }) => {
  if (!isOpen || !item) return null;

  const getDescription = () => {
    if (!item.description) return '';
    return item.description[language] || item.description.en || '';
  };

  const getDeal = () => {
    if (!item.deal) return '';
    return item.deal[language] || item.deal.en || '';
  };

  const openMaps = () => {
    const query = encodeURIComponent(item.full_address || item.name + ', ' + item.location + ', Mallorca');
    window.open('https://www.google.com/maps/search/?api=1&query=' + query, '_blank');
  };

  const getBookingUrl = () => {
    return item.booking_url || item.contact_url || '#';
  };

  const getBookingLabel = () => {
    if (type === 'golf') return 'Book Tee Time';
    if (type === 'hotel') return 'Book Hotel';
    if (type === 'restaurant') return 'Reserve Table';
    if (type === 'beach_club') return 'Book Now';
    if (type === 'cafe_bar') return 'View Details';
    return 'Book Now';
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-testid="quick-view-modal"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors shadow-lg"
          data-testid="quick-view-close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image */}
        <div className="relative h-56 overflow-hidden rounded-t-2xl">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          {item.discount_percent && (
            <div className="absolute top-4 left-4 bg-brand-slate text-white text-xs font-bold px-3 py-1.5 rounded-full">
              Save {item.discount_percent}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Location */}
          <button
            onClick={openMaps}
            className="flex items-center gap-2 text-stone-500 text-sm mb-2 hover:text-brand-slate transition-colors"
          >
            <MapPin className="w-4 h-4" />
            <span>{item.location}</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          {/* Name */}
          <h3 className="font-heading text-2xl text-stone-900 mb-3">
            {item.name}
          </h3>

          {/* Golf specific */}
          {type === 'golf' && (
            <>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 bg-stone-100 px-3 py-2 rounded-lg">
                  <Flag className="w-4 h-4 text-stone-600" />
                  <span className="text-sm font-medium">{item.holes} Holes</span>
                </div>
                <div className="flex items-center gap-2 bg-stone-100 px-3 py-2 rounded-lg">
                  <span className="text-sm font-medium">Par {item.par}</span>
                </div>
              </div>
              {item.price_from && (
                <div className="flex items-center gap-2 bg-brand-slate/10 px-4 py-3 rounded-xl mb-4">
                  <Trophy className="w-5 h-5 text-brand-slate" />
                  <span className="font-semibold">Green Fee from €{item.price_from}</span>
                </div>
              )}
            </>
          )}

          {/* Hotel specific */}
          {type === 'hotel' && (
            <>
              {(item.category || item.region) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.category && (
                    <span className="text-xs px-3 py-1.5 bg-brand-slate/20 text-brand-charcoal font-medium rounded">
                      {item.category}
                    </span>
                  )}
                  {item.region && (
                    <span className="text-xs px-3 py-1.5 bg-stone-100 text-stone-700 font-medium rounded">
                      {item.region}
                    </span>
                  )}
                </div>
              )}
              {item.offer_price && (
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-xs uppercase tracking-wider text-stone-400">From</span>
                  <span className="text-2xl font-bold text-stone-800">€{item.offer_price}</span>
                  {item.original_price && (
                    <span className="text-lg text-stone-400 line-through">€{item.original_price}</span>
                  )}
                </div>
              )}
            </>
          )}

          {/* Restaurant specific */}
          {type === 'restaurant' && (
            <>
              {item.michelin_stars && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs px-3 py-1.5 bg-stone-800 text-white font-semibold rounded">
                    {item.michelin_stars}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-stone-600 mb-4">
                <Utensils className="w-4 h-4" />
                <span className="text-sm">Mediterranean Fine Dining</span>
              </div>
              {item.offer_price && (
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-xs uppercase tracking-wider text-stone-400">From</span>
                  <span className="text-2xl font-bold text-stone-800">€{item.offer_price}</span>
                </div>
              )}
            </>
          )}

          {/* Beach Club specific */}
          {type === 'beach_club' && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs px-3 py-1.5 bg-sky-100 text-sky-700 font-medium rounded-full flex items-center gap-1.5">
                <Umbrella className="w-3.5 h-3.5" />
                Beach Club
              </span>
              {item.nearest_golf && (
                <span className="text-xs px-3 py-1.5 bg-stone-100 text-stone-600 font-medium rounded-full flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" />
                  {item.distance_km}km to {item.nearest_golf}
                </span>
              )}
            </div>
          )}

          {/* Cafe Bar specific */}
          {type === 'cafe_bar' && (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs px-3 py-1.5 bg-amber-100 text-amber-700 font-medium rounded-full flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5" />
                  {item.category || 'Café & Bar'}
                </span>
                {item.specialty && (
                  <span className="text-xs px-3 py-1.5 bg-stone-100 text-stone-600 font-medium rounded-full flex items-center gap-1.5">
                    <Croissant className="w-3.5 h-3.5" />
                    {item.specialty}
                  </span>
                )}
              </div>
              {item.hours && (
                <div className="flex items-center gap-2 text-stone-600 mb-4">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{item.hours}</span>
                </div>
              )}
            </>
          )}

          {/* Description */}
          <p className="text-stone-600 text-sm leading-relaxed mb-4">
            {getDescription()}
          </p>

          {/* Deal */}
          {getDeal() && (
            <div className="bg-brand-charcoal/5 border border-brand-charcoal/10 rounded-xl p-4 mb-4">
              <p className="text-xs uppercase tracking-wider text-stone-400 mb-1">
                Exclusive Offer
              </p>
              <p className="text-stone-800 font-medium text-sm">
                {getDeal()}
              </p>
            </div>
          )}

          {/* Phone */}
          {item.phone && (
            <div className="flex items-center gap-3 text-stone-600 mb-4">
              <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-stone-400">Phone</p>
                <p className="text-sm font-medium">{item.phone}</p>
              </div>
            </div>
          )}

          {/* CTA Button */}
          <a
            href={getBookingUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-brand-charcoal text-white px-6 py-3.5 rounded-full font-semibold hover:bg-brand-charcoal/90 transition-all"
            data-testid="quick-view-cta"
          >
            {getBookingLabel()}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;

import React from 'react';
import { X, MapPin, Phone, ExternalLink, Navigation, Flag, Trophy, Utensils, Coffee, Umbrella, Clock, Croissant } from 'lucide-react';

export const QuickViewModal = ({ isOpen, onClose, item, type, language, t }) => {
  if (!isOpen || !item) return null;

  const desc = item.description ? (item.description[language] || item.description.en || '') : '';
  const deal = item.deal ? (item.deal[language] || item.deal.en || '') : '';
  const bookUrl = item.booking_url || item.contact_url || '#';

  const labels = { golf: 'Book Tee Time', hotel: 'Book Hotel', restaurant: 'Reserve Table', beach_club: 'Book Now', cafe_bar: 'View Details' };
  const bookLabel = labels[type] || 'Book Now';

  const openMaps = () => {
    window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(item.full_address || item.name + ', ' + item.location + ', Mallorca'), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="quick-view-modal">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl">
        {/* Close */}
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 shadow-md" data-testid="quick-view-close">
          <X className="w-4 h-4" />
        </button>

        {/* Image */}
        <div className="relative h-40 overflow-hidden rounded-t-xl flex-shrink-0">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          {item.discount_percent && (
            <div className="absolute top-3 left-3 bg-brand-slate text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              Save {item.discount_percent}%
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto flex-1 min-h-0">
          {/* Location */}
          <button onClick={openMaps} className="flex items-center gap-1.5 text-stone-500 text-xs mb-1.5 hover:text-brand-slate transition-colors">
            <MapPin className="w-3 h-3" />
            <span>{item.location}</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>

          {/* Name */}
          <h3 className="font-heading text-xl text-stone-900 mb-2">{item.name}</h3>

          {/* Golf */}
          {type === 'golf' && (
            <div className="flex items-center gap-3 mb-3">
              <span className="flex items-center gap-1.5 bg-stone-100 px-2.5 py-1.5 rounded-lg text-xs font-medium">
                <Flag className="w-3 h-3 text-stone-600" /> {item.holes} Holes
              </span>
              {item.par && <span className="bg-stone-100 px-2.5 py-1.5 rounded-lg text-xs font-medium">Par {item.par}</span>}
              {item.price_from && (
                <span className="flex items-center gap-1.5 bg-brand-slate/10 px-2.5 py-1.5 rounded-lg text-xs font-semibold">
                  <Trophy className="w-3 h-3 text-brand-slate" /> From €{item.price_from}
                </span>
              )}
            </div>
          )}

          {/* Hotel */}
          {type === 'hotel' && (
            <div className="space-y-2 mb-3">
              {(item.category || item.region) && (
                <div className="flex flex-wrap gap-1.5">
                  {item.category && <span className="text-[10px] px-2 py-1 bg-brand-slate/20 text-brand-charcoal font-medium rounded">{item.category}</span>}
                  {item.region && <span className="text-[10px] px-2 py-1 bg-stone-100 text-stone-700 font-medium rounded">{item.region}</span>}
                </div>
              )}
              {item.nearest_golf && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-stone-100 text-stone-600 font-medium rounded-full">
                  <Navigation className="w-3 h-3" /> {item.distance_km}km to {item.nearest_golf}
                </span>
              )}
              {item.offer_price && (
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400">From</span>
                  <span className="text-lg font-bold text-stone-800">€{item.offer_price}</span>
                  {item.original_price && <span className="text-sm text-stone-400 line-through">€{item.original_price}</span>}
                </div>
              )}
            </div>
          )}

          {/* Restaurant */}
          {type === 'restaurant' && (
            <div className="space-y-2 mb-3">
              <div className="flex flex-wrap gap-1.5">
                {item.michelin_stars && <span className="text-[10px] px-2 py-1 bg-stone-800 text-white font-semibold rounded">{item.michelin_stars}</span>}
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-stone-100 text-stone-600 rounded">
                  <Utensils className="w-3 h-3" /> Dining
                </span>
              </div>
              {item.nearest_golf && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-stone-100 text-stone-600 font-medium rounded-full">
                  <Navigation className="w-3 h-3" /> {item.distance_km}km to {item.nearest_golf}
                </span>
              )}
              {item.offer_price && (
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400">From</span>
                  <span className="text-lg font-bold text-stone-800">€{item.offer_price}</span>
                </div>
              )}
            </div>
          )}

          {/* Beach Club */}
          {type === 'beach_club' && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-sky-100 text-sky-700 font-medium rounded-full">
                <Umbrella className="w-3 h-3" /> Beach Club
              </span>
              {item.nearest_golf && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-stone-100 text-stone-600 font-medium rounded-full">
                  <Navigation className="w-3 h-3" /> {item.distance_km}km to {item.nearest_golf}
                </span>
              )}
            </div>
          )}

          {/* Cafe Bar */}
          {type === 'cafe_bar' && (
            <div className="space-y-2 mb-3">
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-amber-100 text-amber-700 font-medium rounded-full">
                  <Coffee className="w-3 h-3" /> {item.category || 'Cafe & Bar'}
                </span>
                {item.specialty && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-stone-100 text-stone-600 font-medium rounded-full">
                    <Croissant className="w-3 h-3" /> {item.specialty}
                  </span>
                )}
              </div>
              {item.nearest_golf && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-stone-100 text-stone-600 font-medium rounded-full">
                  <Navigation className="w-3 h-3" /> {item.distance_km}km to {item.nearest_golf}
                </span>
              )}
              {item.hours && (
                <div className="flex items-center gap-1.5 text-stone-600 text-xs">
                  <Clock className="w-3 h-3" /> {item.hours}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {desc && <p className="text-stone-600 text-xs leading-relaxed mb-3">{desc}</p>}

          {/* Deal */}
          {deal && (
            <div className="bg-brand-charcoal/5 border border-brand-charcoal/10 rounded-lg p-3 mb-3">
              <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-0.5">Exclusive Offer</p>
              <p className="text-stone-800 font-medium text-xs">{deal}</p>
            </div>
          )}

          {/* Phone */}
          {item.phone && (
            <a href={'tel:' + item.phone} className="flex items-center gap-2 text-stone-600 mb-3 hover:text-brand-slate transition-colors">
              <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium">{item.phone}</span>
            </a>
          )}
        </div>

        {/* CTA - Fixed at bottom */}
        <div className="p-4 pt-0 flex-shrink-0">
          <a
            href={bookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-brand-charcoal text-white px-5 py-3 rounded-full text-sm font-semibold hover:bg-brand-charcoal/90 transition-all"
            data-testid="quick-view-cta"
          >
            {bookLabel}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;

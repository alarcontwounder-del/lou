import React from 'react';
import { X, MapPin, Phone, ExternalLink, Navigation, Flag, Trophy, Utensils, Coffee, Umbrella, Clock, Croissant, Eye } from 'lucide-react';

export const QuickViewModal = ({ isOpen, onClose, item, type, language, t }) => {
  if (!isOpen || !item) return null;

  const desc = item.description ? (item.description[language] || item.description.en || '') : '';
  const deal = item.deal ? (item.deal[language] || item.deal.en || '') : '';
  const bookUrl = item.booking_url || item.contact_url || '#';
  const labels = { golf: 'Book Tee Time', hotel: 'Book Hotel', restaurant: 'Reserve Table', beach_club: 'Book Now', cafe_bar: 'View Details' };

  const openMaps = () => {
    window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(item.full_address || item.name + ', ' + item.location + ', Mallorca'), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="quick-view-modal">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Card — same style as flip-card-front */}
      <div className="relative bg-white border border-stone-100 shadow-sm rounded-2xl w-full max-w-sm">
        {/* Close */}
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-white transition-all shadow-sm" data-testid="quick-view-close">
          <X className="w-4 h-4" />
        </button>

        {/* Discount Badge */}
        {item.discount_percent && (
          <div className="absolute top-6 right-6 z-10 bg-brand-slate text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {item.discount_percent}% OFF
          </div>
        )}

        {/* Image — same as card */}
        <div className="h-56 overflow-hidden rounded-t-2xl relative m-3 mb-0">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover object-center rounded-xl" />
        </div>

        {/* Content — same as card */}
        <div className="p-5 pt-4">
          {/* Type-specific tags */}
          {type === 'golf' && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-1 bg-stone-100 font-medium rounded flex items-center gap-1"><Flag className="w-3 h-3" /> {item.holes} Holes</span>
              {item.par && <span className="text-xs px-2 py-1 bg-stone-100 font-medium rounded">Par {item.par}</span>}
              {item.price_from && <span className="text-xs px-2 py-1 bg-brand-slate/10 font-semibold rounded flex items-center gap-1"><Trophy className="w-3 h-3 text-brand-slate" /> From €{item.price_from}</span>}
            </div>
          )}

          {type === 'hotel' && (item.category || item.region) && (
            <div className="flex items-center gap-2 mb-2">
              {item.category && <span className="text-xs px-2 py-1 bg-brand-slate/20 text-brand-charcoal font-medium rounded">{item.category}</span>}
              {item.region && <span className="text-xs px-2 py-1 bg-brand-charcoal/10 text-brand-charcoal font-medium rounded">{item.region}</span>}
            </div>
          )}

          {type === 'restaurant' && item.michelin_stars && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-1 bg-stone-800 text-white font-semibold rounded">{item.michelin_stars}</span>
              <span className="text-xs px-2 py-1 bg-stone-100 text-stone-600 rounded flex items-center gap-1"><Utensils className="w-3 h-3" /> Dining</span>
            </div>
          )}

          {type === 'beach_club' && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-1 bg-sky-100 text-sky-700 font-medium rounded-full flex items-center gap-1"><Umbrella className="w-3 h-3" /> Beach Club</span>
            </div>
          )}

          {type === 'cafe_bar' && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 font-medium rounded-full flex items-center gap-1"><Coffee className="w-3 h-3" /> {item.category || 'Cafe & Bar'}</span>
              {item.specialty && <span className="text-xs px-2 py-1 bg-stone-100 text-stone-600 rounded-full flex items-center gap-1"><Croissant className="w-3 h-3" /> {item.specialty}</span>}
            </div>
          )}

          {/* Nearest Golf */}
          {item.nearest_golf && (
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-2">
              <Navigation className="w-3 h-3" />
              <span>{item.distance_km}km to {item.nearest_golf}</span>
            </div>
          )}

          {/* Location */}
          <div onClick={openMaps} className="location-link flex items-center gap-2 text-stone-400 text-xs mb-2 cursor-pointer hover:text-brand-slate transition-colors" title="Open in Google Maps">
            <MapPin className="w-3.5 h-3.5" />
            <span>{item.location}</span>
          </div>

          {/* Name */}
          <h3 className="font-heading text-xl text-stone-900 mb-2">{item.name}</h3>

          {/* Description */}
          <p className="text-stone-500 text-sm mb-4 line-clamp-2">{desc}</p>

          {/* Deal */}
          {deal && (
            <div className="bg-brand-charcoal/5 border border-brand-charcoal/10 rounded-lg p-3 mb-3">
              <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-0.5">Exclusive Offer</p>
              <p className="text-stone-800 font-medium text-xs">{deal}</p>
            </div>
          )}

          {/* Pricing */}
          {item.offer_price && (
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xs uppercase tracking-wider text-stone-400">From</span>
              <span className="text-xl font-semibold text-stone-800">€{item.offer_price}</span>
              {item.original_price && <span className="text-sm text-stone-400 line-through">€{item.original_price}</span>}
            </div>
          )}

          {/* Phone */}
          {item.phone && (
            <a href={'tel:' + item.phone} className="flex items-center gap-2 text-stone-500 text-xs mb-3 hover:text-brand-slate transition-colors">
              <Phone className="w-3.5 h-3.5" />
              <span>{item.phone}</span>
            </a>
          )}

          {/* CTA Button */}
          <a
            href={bookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-brand-charcoal text-white px-5 py-3 rounded-full text-sm font-semibold hover:bg-brand-charcoal/90 transition-all"
            data-testid="quick-view-cta"
          >
            {labels[type] || 'Book Now'}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;

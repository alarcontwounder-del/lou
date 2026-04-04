import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { MapPin, ExternalLink, Phone, Navigation, Eye, ArrowUpDown } from 'lucide-react';
import { QuickViewModal } from './QuickViewModal';
import { BookingRequestModal } from './BookingRequestModal';

const PRICE_FILTERS = [
  { key: 'all', label: { en: 'All', de: 'Alle', fr: 'Tous', sv: 'Alla' } },
  { key: 'under200', label: { en: 'Under €200', de: 'Unter €200', fr: 'Moins de €200', sv: 'Under €200' }, max: 200 },
  { key: '200to400', label: { en: '€200 – €400', de: '€200 – €400', fr: '€200 – €400', sv: '€200 – €400' }, min: 200, max: 400 },
  { key: 'over400', label: { en: '€400+', de: '€400+', fr: '€400+', sv: '€400+' }, min: 400 },
];

const HotelCard = ({ hotel, language, t, onQuickView, onBooking }) => {
  const inactive = hotel.is_active === false;

  return (
    <div
      className={`flip-card ${inactive ? 'inactive-card' : ''}`}
      data-testid={`hotel-card-${hotel.id}`}
    >
      <div className={`flip-card-inner ${inactive ? 'pointer-events-none' : ''}`}>
        {/* Front of Card */}
        <div className={`flip-card-front bg-white border border-stone-100 shadow-sm rounded-2xl`}>
          {/* Discount Badge */}
          {!inactive && hotel.discount_percent && (
            <div className="absolute top-6 right-6 z-10 bg-brand-slate text-white text-xs font-bold px-3 py-1.5 rounded-full">
              {t('offers.save')} {hotel.discount_percent}%
            </div>
          )}

          {/* Inactive Badge */}
          {inactive && (
            <div className="absolute top-6 right-6 z-10 bg-stone-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              Coming Soon
            </div>
          )}

          {/* Image */}
          <div className="h-56 overflow-hidden rounded-t-2xl relative m-3 mb-0">
            <img loading="lazy"
              src={hotel.image}
              alt={hotel.name}
              className="w-full h-full object-cover object-center transition-transform duration-500 rounded-xl"
            />
            {/* Quick View Button - only when active */}
            {!inactive && (
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
            )}
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

            {/* Nearest Golf Course */}
            {hotel.nearest_golf && (
              <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-2" data-testid={`hotel-nearest-golf-${hotel.id}`}>
                <Navigation className="w-3 h-3" />
                <span>{hotel.distance_km}km to {hotel.nearest_golf}</span>
              </div>
            )}
            
            <div 
              className={`location-link flex items-center gap-2 text-stone-400 text-xs mb-2 ${inactive ? '' : 'cursor-pointer hover:text-brand-slate'} transition-colors`}
              onClick={(e) => {
                if (inactive) return;
                e.stopPropagation();
                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.full_address || hotel.name + ', ' + hotel.location + ', Mallorca')}`, '_blank');
              }}
              title={inactive ? '' : 'Open in Google Maps'}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{hotel.location}</span>
            </div>

            <h3 className="font-heading text-xl text-stone-900 mb-2">
              {hotel.name}
            </h3>

            <p className="text-stone-500 text-sm mb-4 line-clamp-2">
              {(hotel.description && hotel.description[language]) || (hotel.description && hotel.description.en) || ''}
            </p>

            {/* Pricing */}
            {!inactive && hotel.offer_price && (
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
            {!inactive && <p className="text-xs text-stone-400 italic hidden md:block">Hover for details →</p>}
            {!inactive && (
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
            )}
          </div>
        </div>

        {/* Back of Card - only for active */}
        <div className={`flip-card-back rounded-2xl p-6 text-white`} style={{ background: 'linear-gradient(135deg, #2D2D2D 0%, #3D3D3D 100%)' }}>
          <h3 className="font-heading text-2xl mb-6">{hotel.name}</h3>
          
          {inactive ? (
            <div className="flex flex-col items-center justify-center h-48">
              <p className="text-white/70 text-sm text-center">This partner is not yet available.</p>
              <p className="text-white/50 text-xs mt-2 text-center">Check back soon for availability.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
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

                <div className="bg-white/10 rounded-lg p-3 mt-4">
                  <p className="text-sm font-medium">
                    {(hotel.deal && hotel.deal[language]) || (hotel.deal && hotel.deal.en) || ''}
                  </p>
                </div>

                {hotel.nearest_golf && (
                  <div className="flex items-center gap-2 text-white/80 text-sm mt-3">
                    <Navigation className="w-4 h-4" />
                    <span>{hotel.distance_km}km from {hotel.nearest_golf}</span>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); onBooking(hotel); }}
                className="mt-6 inline-flex items-center justify-center gap-2 bg-white text-stone-800 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition-all"
                data-testid={`hotel-book-${hotel.id}`}
              >
                {t('offers.bookHotel')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const HotelPartners = () => {
  const { language, t } = useLanguage();
  const { hotels, loading, getDisplayedItems } = useData();
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [bookingItem, setBookingItem] = useState(null);
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState(null); // null, 'asc', 'desc'

  const displayedHotels = getDisplayedItems(hotels, 'hotels');

  // Apply price filter and sort
  const filteredHotels = useMemo(() => {
    let result = [...displayedHotels];

    // Price filter (only applies to active hotels with offer_price)
    if (priceFilter !== 'all') {
      const filter = PRICE_FILTERS.find(f => f.key === priceFilter);
      if (filter) {
        result = result.filter(h => {
          if (h.is_active === false) return true; // always show inactive
          const price = h.offer_price;
          if (!price) return true; // show hotels without price
          if (filter.min && price < filter.min) return false;
          if (filter.max && price >= filter.max) return false;
          return true;
        });
      }
    }

    // Sort by price
    if (sortOrder) {
      result.sort((a, b) => {
        // Inactive always at end
        const aActive = a.is_active !== false ? 0 : 1;
        const bActive = b.is_active !== false ? 0 : 1;
        if (aActive !== bActive) return aActive - bActive;
        
        const aPrice = a.offer_price || 999999;
        const bPrice = b.offer_price || 999999;
        return sortOrder === 'asc' ? aPrice - bPrice : bPrice - aPrice;
      });
    }

    return result;
  }, [displayedHotels, priceFilter, sortOrder]);

  const activeCount = filteredHotels.filter(h => h.is_active !== false).length;

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

          {/* Price Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8" style={{ transform: 'translateZ(0)', transformStyle: 'flat' }} data-testid="hotel-price-filter">
            <div className="flex flex-wrap items-center gap-2">
              {PRICE_FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setPriceFilter(filter.key)}
                  data-testid={`price-filter-${filter.key}`}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    priceFilter === filter.key
                      ? 'bg-stone-800 text-white'
                      : 'bg-white text-stone-500 border border-stone-200 hover:border-stone-400 hover:text-stone-700'
                  }`}
                >
                  {filter.label[language] || filter.label.en}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-400">{activeCount} hotels</span>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc')}
                data-testid="price-sort-toggle"
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  sortOrder
                    ? 'bg-stone-800 text-white'
                    : 'bg-white text-stone-500 border border-stone-200 hover:border-stone-400 hover:text-stone-700'
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                {sortOrder === 'asc' ? 'Price ↑' : sortOrder === 'desc' ? 'Price ↓' : 'Sort by Price'}
              </button>
            </div>
          </div>

          {/* Hotels Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredHotels.map((hotel) => (
              <HotelCard 
                key={hotel.id} 
                hotel={hotel} 
                language={language} 
                t={t}
                onQuickView={setQuickViewItem}
                onBooking={setBookingItem}
              />
            ))}
          </div>
        </div>
      </section>

      <QuickViewModal
        isOpen={!!quickViewItem}
        onClose={() => setQuickViewItem(null)}
        item={quickViewItem}
        type="hotel"
        language={language}
        t={t}
        onBooking={(item) => { setQuickViewItem(null); setBookingItem(item); }}
      />

      <BookingRequestModal
        isOpen={!!bookingItem}
        onClose={() => setBookingItem(null)}
        venue={bookingItem}
        venueType="hotel"
      />
    </>
  );
};

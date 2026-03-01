import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, ExternalLink, Umbrella, Navigation, Waves } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BeachClubCard = ({ club, language, t }) => (
  <div
    className="flip-card"
    data-testid={`beach-club-card-${club.id}`}
  >
    <div className="flip-card-inner">
      {/* Front of Card */}
      <div className="flip-card-front bg-white border border-stone-100 shadow-sm rounded-2xl">
        {/* Discount Badge */}
        {club.discount_percent && (
          <div className="absolute top-6 right-6 z-10 bg-brand-slate text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {t('offers.save')} {club.discount_percent}%
          </div>
        )}

        {/* Image */}
        <div className="h-64 overflow-hidden rounded-t-2xl relative m-3 mb-0">
          <img
            src={club.image}
            alt={club.name}
            className="w-full h-full object-cover transition-transform duration-500 rounded-xl"
          />
          {/* Beach Club Icon Overlay */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1.5">
            <Umbrella className="w-4 h-4 text-stone-600" />
            <span className="text-xs font-medium text-stone-700">Beach Club</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 pt-4">
          {/* Nearest Golf Tag */}
          {club.nearest_golf && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-1 bg-stone-100 text-stone-600 font-medium rounded flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                {club.distance_km}km to {club.nearest_golf}
              </span>
            </div>
          )}
          
          <div 
            className="location-link flex items-center gap-2 text-stone-400 text-xs mb-2 cursor-pointer hover:text-brand-slate transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(club.full_address || club.name + ', ' + club.location + ', Mallorca')}`, '_blank');
            }}
            title="Open in Google Maps"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{club.location}</span>
          </div>

          <h3 className="font-heading text-xl text-stone-900 mb-2">
            {club.name}
          </h3>

          <p className="text-stone-500 text-sm mb-4 line-clamp-2">
            {club.description[language] || club.description.en}
          </p>

          {/* Deal Preview */}
          {club.deal && (
            <div className="bg-stone-50 border border-stone-100 rounded-lg p-3 mb-3">
              <p className="text-xs font-medium text-stone-600 line-clamp-1">
                {club.deal[language] || club.deal.en}
              </p>
            </div>
          )}

          {/* Hover Indicator */}
          <p className="text-xs text-stone-400 text-center mt-2 italic">
            {t('card.hoverForDetails') || 'Hover for details'}
          </p>
        </div>
      </div>

      {/* Back of Card */}
      <div className="flip-card-back rounded-2xl p-6 flex flex-col justify-between text-white" style={{ background: 'linear-gradient(135deg, #2D2D2D 0%, #3D3D3D 100%)' }}>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Waves className="w-5 h-5 text-stone-300" />
            <h3 className="text-white text-xl font-heading font-semibold">
              {club.name}
            </h3>
          </div>
          
          <p className="text-cyan-100 text-sm leading-relaxed mb-4">
            {club.description[language] || club.description.en}
          </p>

          {/* Location - Clickable */}
          <div 
            className="location-link flex items-center gap-2 text-cyan-100 text-sm mb-4 cursor-pointer hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(club.full_address || club.name + ', ' + club.location + ', Mallorca')}`, '_blank');
            }}
            title="Open in Google Maps"
          >
            <MapPin className="w-4 h-4" />
            <span>{club.location}</span>
          </div>

          {/* Deal */}
          {club.deal && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
              <p className="text-white text-xs uppercase tracking-wider mb-1 opacity-80">{t('offers.exclusive')}</p>
              <p className="text-white font-semibold text-sm">
                {club.deal[language] || club.deal.en}
              </p>
            </div>
          )}

          {/* Nearest Golf Course */}
          {club.nearest_golf && (
            <div className="flex items-center gap-2 text-cyan-100 text-sm">
              <Navigation className="w-4 h-4" />
              <span>{club.distance_km}km from {club.nearest_golf}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <a
          href={club.contact_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 bg-white text-cyan-700 text-center rounded-xl font-semibold hover:bg-cyan-50 transition-colors flex items-center justify-center gap-2"
        >
          {t('offers.bookNow')}
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  </div>
);

export const BeachClubPartners = () => {
  const { t, language } = useLanguage();
  const [beachClubs, setBeachClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBeachClubs = async () => {
      try {
        const response = await axios.get(`${API}/partner-offers?type=beach_club`);
        setBeachClubs(response.data);
      } catch (error) {
        console.error('Error fetching beach clubs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBeachClubs();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-cyan-50 to-white">
        <div className="container-custom">
          <div className="text-center">Loading beach clubs...</div>
        </div>
      </section>
    );
  }

  if (beachClubs.length === 0) {
    return null;
  }

  return (
    <section id="beach-clubs" className="py-20 bg-white" data-testid="beach-clubs-section">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Umbrella className="w-6 h-6 text-cyan-600" />
            <span className="text-sm uppercase tracking-[0.2em] text-cyan-600 font-medium">
              {t('beachClubs.subtitle') || 'Relax After Golf'}
            </span>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl text-stone-900 mb-4">
            {t('beachClubs.title') || 'Premium Beach Clubs'}
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            {t('beachClubs.description') || 'Unwind after your round at Mallorca\'s most exclusive beach clubs with special golfer packages.'}
          </p>
        </div>

        {/* Beach Club Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beachClubs.map((club) => (
            <BeachClubCard 
              key={club.id} 
              club={club} 
              language={language}
              t={t}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BeachClubPartners;

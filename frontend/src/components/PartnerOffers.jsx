import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, ExternalLink, Utensils, Hotel } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const PartnerOffers = () => {
  const { language, t } = useLanguage();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hotel');

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await axios.get(`${API}/partner-offers`);
        setOffers(response.data);
      } catch (error) {
        console.error('Error fetching partner offers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const hotels = offers.filter(o => o.type === 'hotel');
  const restaurants = offers.filter(o => o.type === 'restaurant');

  const OfferCard = ({ offer }) => (
    <div
      className="card-hover bg-white border border-stone-100 overflow-hidden group relative"
      data-testid={`offer-card-${offer.id}`}
    >
      {/* Discount Badge */}
      {offer.discount_percent && (
        <div className="deal-badge">
          {t('offers.save')} {offer.discount_percent}%
        </div>
      )}

      {/* Image */}
      <div className="img-zoom aspect-[4/3]">
        <img
          src={offer.image}
          alt={offer.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 text-stone-400 text-sm mb-2">
          <MapPin className="w-4 h-4" />
          <span>{offer.location}</span>
        </div>

        <h3 className="font-heading text-xl md:text-2xl text-stone-900 mb-2">
          {offer.name}
        </h3>

        <p className="text-stone-600 text-sm mb-4 line-clamp-2">
          {offer.description[language] || offer.description.en}
        </p>

        {/* Deal */}
        <div className="bg-brand-sand/10 rounded-sm p-4 mb-4">
          <p className="text-sm font-medium text-brand-green">
            {offer.deal[language] || offer.deal.en}
          </p>
        </div>

        {/* Pricing */}
        {offer.offer_price && (
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-lg font-semibold text-brand-green">
              €{offer.offer_price}
            </span>
            {offer.original_price && (
              <span className="text-sm text-stone-400 line-through">
                €{offer.original_price}
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <a
          href={offer.contact_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-brand-green hover:text-brand-terracotta transition-colors font-medium text-sm"
          data-testid={`offer-view-${offer.id}`}
        >
          {t('offers.viewDeal')}
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );

  if (loading) {
    return (
      <section id="offers" className="section-padding bg-brand-cream">
        <div className="container-custom">
          <div className="text-center">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="offers" className="section-padding bg-brand-cream" data-testid="offers-section">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-brand-terracotta text-sm uppercase tracking-[0.2em] mb-4" data-testid="offers-subtitle">
            {t('offers.subtitle')}
          </p>
          <h2 className="font-heading text-4xl md:text-5xl text-stone-900" data-testid="offers-title">
            {t('offers.title')}
          </h2>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="hotel" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="w-full max-w-md mx-auto mb-12 bg-white/50 p-1 rounded-full">
            <TabsTrigger
              value="hotel"
              className="flex-1 flex items-center justify-center gap-2 rounded-full data-[state=active]:bg-brand-green data-[state=active]:text-white py-3 transition-colors"
              data-testid="tab-hotels"
            >
              <Hotel className="w-4 h-4" />
              {t('offers.hotels')}
            </TabsTrigger>
            <TabsTrigger
              value="restaurant"
              className="flex-1 flex items-center justify-center gap-2 rounded-full data-[state=active]:bg-brand-green data-[state=active]:text-white py-3 transition-colors"
              data-testid="tab-restaurants"
            >
              <Utensils className="w-4 h-4" />
              {t('offers.restaurants')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hotel">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotels.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="restaurant">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Hotel, UtensilsCrossed, Umbrella, Users, ChevronRight, ChevronLeft, CheckCircle, Clock, Loader2, Car, RefreshCw, Sparkles, Mail, Copy, Bus } from 'lucide-react';
import { Calendar } from './ui/calendar';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SERVICES = [
  { id: 'hotel', label: 'Hotel Stay', icon: Hotel, desc: 'Luxury golf resort' },
  { id: 'restaurant', label: 'Michelin Dining', icon: UtensilsCrossed, desc: 'Fine dining experience' },
  { id: 'beach_club', label: 'Beach Club', icon: Umbrella, desc: 'Exclusive day pass' },
  { id: 'transfer', label: 'Premium Transfer', icon: Car, desc: 'Private luxury transport' },
  { id: 'golf_groups', label: 'Golf Groups', icon: Users, desc: 'Societies & friends trips' },
];

const BUDGETS = [
  { id: 'moderate', label: 'Moderate', range: '€1,000 – €2,500', rangePerPerson: '€150 – €300', desc: 'Great value experiences' },
  { id: 'premium', label: 'Premium', range: '€2,500 – €4,000', rangePerPerson: '€300 – €500', desc: 'Upscale comfort' },
  { id: 'luxury', label: 'Luxury', range: '€4,000+', rangePerPerson: '€500+', desc: 'The finest Mallorca offers' },
];

const GROUP_TYPES = [
  { id: 'society', label: 'Golf Society' },
  { id: 'friends', label: 'Friends Trip' },
];

const PLAYER_COUNTS = [
  { id: '4-8', label: '4 – 8', min: 4 },
  { id: '8-12', label: '8 – 12', min: 8 },
  { id: '12-20', label: '12 – 20', min: 12 },
  { id: '20+', label: '20+', min: 20 },
];

const TRANSFER_TYPES = [
  { id: 'sedan', label: 'Mercedes S-Class', desc: 'Up to 3 passengers per car' },
  { id: 'minibus', label: 'Luxury Minibus', desc: 'Up to 12 passengers' },
  { id: 'coach', label: 'Premium Coach', desc: '12+ passengers' },
];

const TIMES = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00',
];

/* Known luxury hotels for tier matching */
const LUXURY_HOTELS = ['St. Regis Mardavall', 'Belmond La Residencia', 'Cap Rocat', 'Park Hyatt Mallorca', 'Jumeirah Port Soller', 'Castell Son Claret', 'Hotel de Mar Gran Meliá', 'Pleta de Mar', 'Can Simoneta', 'Finca Serena'];
const PREMIUM_HOTELS = ['Son Brull Hotel & Spa', 'Hotel Can Aulí', 'Can Ferrereta', 'Glòria de Sant Jaume', 'Can Bordoy Grand House', 'Son Net', 'Bikini Island & Mountain Hotel', 'Nakar Hotel', 'Hotel Cort'];
const LUXURY_BEACH = ['Nikki Beach Mallorca', 'Mood Beach Club', 'Gran Folies Beach Club'];
const PREMIUM_BEACH = ['Purobeach Illetas', 'Zhero Boathouse', 'Beso Beach Mallorca', 'Birba Beach Club'];

function getHotelTier(name) {
  if (LUXURY_HOTELS.some(h => name.includes(h))) return 'luxury';
  if (PREMIUM_HOTELS.some(h => name.includes(h))) return 'premium';
  return 'moderate';
}

function getBeachTier(name) {
  if (LUXURY_BEACH.some(b => name.includes(b))) return 'luxury';
  if (PREMIUM_BEACH.some(b => name.includes(b))) return 'premium';
  return 'moderate';
}

function getRestaurantTier(r) {
  if (r.michelin_stars && r.michelin_stars.includes('⭐⭐')) return 'luxury';
  if (r.michelin_stars && r.michelin_stars.includes('⭐')) return 'premium';
  return 'moderate';
}

/* Budget-to-tier mapping: which tiers are acceptable for each budget */
const BUDGET_TIERS = {
  moderate: ['moderate', 'premium'],
  premium: ['premium', 'luxury'],
  luxury: ['luxury', 'premium'],
};

function generateItinerary(partners, services, budget, isGolfGroup) {
  const tiers = BUDGET_TIERS[budget] || ['moderate', 'premium', 'luxury'];
  const result = {};

  if (services.includes('hotel')) {
    if (isGolfGroup) {
      // For golf groups: prioritize hotels nearest to golf courses
      const golfHotels = partners.hotels
        .filter(h => h.nearest_golf && h.distance_km)
        .sort((a, b) => (a.distance_km || 99) - (b.distance_km || 99));
      // Filter by tier first, fallback to all golf hotels, then all hotels
      const tiered = golfHotels.filter(h => tiers.includes(getHotelTier(h.name)));
      const pool = tiered.length > 0 ? tiered : golfHotels.length > 0 ? golfHotels : partners.hotels;
      result.hotel = pool[Math.floor(Math.random() * Math.min(pool.length, 5))]; // Pick from top 5 closest
    } else {
      const matched = partners.hotels.filter(h => tiers.includes(getHotelTier(h.name)));
      const pool = matched.length > 0 ? matched : partners.hotels;
      result.hotel = pool[Math.floor(Math.random() * pool.length)];
    }
  }

  if (services.includes('restaurant')) {
    const matched = partners.restaurants.filter(r => tiers.includes(getRestaurantTier(r)));
    const pool = matched.length > 0 ? matched : partners.restaurants;
    result.restaurant = pool[Math.floor(Math.random() * pool.length)];
  }

  if (services.includes('beach_club')) {
    const matched = partners.beach_clubs.filter(b => tiers.includes(getBeachTier(b.name)));
    const pool = matched.length > 0 ? matched : partners.beach_clubs;
    result.beach_club = pool[Math.floor(Math.random() * pool.length)];
  }

  return result;
}

const formatSingleDate = (d) => d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

const TRANSFER_IMAGE = 'https://customer-assets.emergentagent.com/job_0fbbd441-c00e-428a-bb6e-219f78598e7b/artifacts/g1vy93s4_47f1c9acaea9e915bba2c2416d77904ca73d3937.webp';

const SCHEDULE_ITEMS = [
  { key: 'transfer_arrival', service: 'transfer', label: 'Arrival Pickup', icon: Car },
  { key: 'restaurant', service: 'restaurant', label: 'Dinner Reservation', icon: UtensilsCrossed },
  { key: 'beach_club', service: 'beach_club', label: 'Beach Club', icon: Umbrella },
  { key: 'transfer_departure', service: 'transfer', label: 'Departure Pickup', icon: Car },
];

const formatShortDate = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

/* ---- Sub-components ---- */

function ServiceButton({ opt, selected, onToggle }) {
  const Icon = opt.icon;
  return (
    <button onClick={onToggle} className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${selected ? 'border-stone-600 bg-stone-700/10' : 'border-stone-300 hover:border-stone-400 bg-stone-50'}`} data-testid={`service-${opt.id}`}>
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${selected ? 'bg-stone-700' : 'bg-stone-200'}`}>
        <Icon className={`w-5 h-5 ${selected ? 'text-white' : 'text-stone-500'}`} />
      </div>
      <div className="flex-1">
        <p className={`font-medium text-sm ${selected ? 'text-stone-800' : 'text-stone-600'}`}>{opt.label}</p>
        <p className="text-xs text-stone-400">{opt.desc}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-stone-700 bg-stone-700' : 'border-stone-300'}`}>
        {selected && <CheckCircle className="w-3 h-3 text-white" />}
      </div>
    </button>
  );
}

function BudgetButton({ b, selected, onSelect, isPerPerson }) {
  return (
    <button onClick={onSelect} className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${selected ? 'border-stone-600 bg-stone-700/10' : 'border-stone-300 hover:border-stone-400 bg-stone-50'}`} data-testid={`budget-${b.id}`}>
      <p className={`font-semibold text-sm ${selected ? 'text-stone-800' : 'text-stone-600'}`}>{b.label}</p>
      <p className={`text-xs mt-0.5 ${selected ? 'text-stone-600' : 'text-stone-400'}`}>{isPerPerson ? b.rangePerPerson : b.range}</p>
    </button>
  );
}

function TimeButton({ time, selected, onSelect }) {
  return (
    <button onClick={onSelect} className={`py-2 text-xs rounded-lg border transition-all ${selected ? 'bg-stone-700 text-white border-stone-700' : 'bg-stone-50 text-stone-600 border-stone-300 hover:border-stone-400'}`} data-testid={`time-${time}`}>
      {time}
    </button>
  );
}

function ItineraryCard({ label, icon: Icon, item, onSwap }) {
  if (!item) return null;
  const golfInfo = item.nearest_golf ? `${item.distance_km || '?'}km to ${item.nearest_golf}` : null;
  const subtitle = golfInfo ? `${item.location} · ${golfInfo}` : item.location;
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200">
      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-stone-400 uppercase tracking-wider">{label}</p>
        <p className="font-semibold text-stone-800 text-sm truncate">{item.name}</p>
        <p className="text-xs text-stone-500 truncate">{subtitle}{item.michelin_stars ? ` · ${item.michelin_stars}` : ''}</p>
      </div>
      <button onClick={onSwap} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors flex-shrink-0" title="Suggest another" data-testid={`swap-${label.toLowerCase().replace(' ', '-')}`}>
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  );
}

function SuccessView({ onClose, form, itinerary, formatDate }) {
  const [copied, setCopied] = useState(false);

  const generateShareText = () => {
    const isGolfGroup = form.services.includes('golf_groups');
    const budgetLabel = isGolfGroup ? (BUDGETS.find(b => b.id === form.budget)?.rangePerPerson || '') + ' /pers/day' : (BUDGETS.find(b => b.id === form.budget)?.range || '');
    const lines = [
      isGolfGroup ? `Golf ${form.group_type === 'society' ? 'Society' : 'Group'} Trip to Mallorca` : 'Golf Trip to Mallorca',
      `Dates: ${formatDate(form.date)}`,
      isGolfGroup ? `Players: ${form.number_of_players}` : `Group: ${form.group_size} ${form.group_size === 1 ? 'person' : 'people'}`,
      `Budget: ${budgetLabel}`,
      '',
    ];
    if (form.group_name) lines.push(`Group: ${form.group_name}`);
    if (form.services.includes('hotel') && itinerary.hotel) lines.push(`Hotel: ${itinerary.hotel.name}`);
    if (form.services.includes('restaurant') && itinerary.restaurant) lines.push(`Restaurant: ${itinerary.restaurant.name}`);
    if (form.services.includes('beach_club') && itinerary.beach_club) lines.push(`Beach Club: ${itinerary.beach_club.name}`);
    if (form.services.includes('transfer')) {
      const vehicle = isGolfGroup && form.transfer_type ? (TRANSFER_TYPES.find(t => t.id === form.transfer_type)?.label || 'Mercedes S-Class') : 'Mercedes S-Class';
      lines.push(`Transfer: ${vehicle}`);
    }
    lines.push('', 'Plan your trip at golfinmallorca.com');
    return lines.join('\n');
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(generateShareText())}`, '_blank');
  };

  const shareEmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent('Golf Trip to Mallorca')}&body=${encodeURIComponent(generateShareText())}`);
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) { /* clipboard API may fail in some contexts */ }
  };

  return (
    <div className="text-center py-8" data-testid="trip-planner-success">
      <CheckCircle className="w-14 h-14 text-stone-600 mx-auto mb-4" />
      <h3 className="font-heading text-2xl text-stone-800 mb-2">Request Received!</h3>
      <p className="text-stone-500 text-sm mb-6">We've received your personalised itinerary request. Our team will get back to you within 24 hours.</p>

      <div className="mb-6">
        <p className="text-stone-400 text-xs uppercase tracking-widest mb-3">Share with your travel group</p>
        <div className="flex justify-center gap-2.5">
          <button onClick={shareWhatsApp} className="flex items-center gap-1.5 px-4 py-2 bg-[#25D366] text-white text-xs font-medium rounded-lg hover:bg-[#20BD5A] transition-colors" data-testid="share-whatsapp">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </button>
          <button onClick={shareEmail} className="flex items-center gap-1.5 px-4 py-2 bg-stone-700 text-white text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors" data-testid="share-email">
            <Mail className="w-4 h-4" />
            Email
          </button>
          <button onClick={copyText} className="flex items-center gap-1.5 px-4 py-2 bg-stone-200 text-stone-700 text-xs font-medium rounded-lg hover:bg-stone-300 transition-colors" data-testid="share-copy">
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <button onClick={onClose} className="px-6 py-2.5 bg-stone-700 text-white text-sm rounded-lg hover:bg-stone-800 transition-colors" data-testid="trip-planner-done-btn">Done</button>
    </div>
  );
}

/* ---- Main Component ---- */

export const TripPlanner = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [partners, setPartners] = useState({ hotels: [], restaurants: [], beach_clubs: [] });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [itinerary, setItinerary] = useState({});
  const [golfCourses, setGolfCourses] = useState([]);
  const contentRef = useRef(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const [form, setForm] = useState({
    services: [], budget: '',
    date: null, schedule: {}, group_size: 2,
    transfer_pickup: '', transfer_dropoff: '',
    name: '', email: '', phone: '', special_requests: '',
    group_type: '', number_of_players: '', transfer_type: '', group_name: '',
  });

  useEffect(() => {
    if (!isOpen) return;
    Promise.all([
      axios.get(`${BACKEND_URL}/api/all-partners`),
      axios.get(`${BACKEND_URL}/api/golf-courses`),
    ]).then(([partnersRes, coursesRes]) => {
      setPartners({
        hotels: partnersRes.data.hotels || [],
        restaurants: (partnersRes.data.restaurants || []).filter(r => r.michelin_stars),
        beach_clubs: partnersRes.data.beach_clubs || [],
      });
      setGolfCourses(coursesRes.data || []);
    }).catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const checkScroll = () => {
      setShowScrollHint(el.scrollHeight - el.scrollTop - el.clientHeight > 30);
    };
    const timer = setTimeout(checkScroll, 150);
    checkScroll();
    el.addEventListener('scroll', checkScroll);
    const observer = new MutationObserver(checkScroll);
    observer.observe(el, { childList: true, subtree: true });
    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', checkScroll);
      observer.disconnect();
    };
  }, [step, isOpen]);

  const toggleService = (id) => {
    const isDeselecting = form.services.includes(id);
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(id) ? prev.services.filter(s => s !== id) : [...prev.services, id],
      ...(id === 'golf_groups' && !isDeselecting ? { group_type: 'friends', number_of_players: '4-8', group_size: 4 } : {}),
      ...(id === 'golf_groups' && isDeselecting ? { group_type: '', number_of_players: '', transfer_type: '', group_name: '', group_size: 2 } : {}),
    }));
    if (isDeselecting) {
      setItinerary(prev => {
        const updated = { ...prev };
        if (id === 'hotel') delete updated.hotel;
        if (id === 'restaurant') delete updated.restaurant;
        if (id === 'beach_club') delete updated.beach_club;
        return updated;
      });
    }
  };

  const totalSteps = 4;

  const isGolfGroup = form.services.includes('golf_groups');

  const canNext = () => {
    if (step === 1) return form.services.length > 0 && !!form.budget;
    if (step === 2) return form.date?.from;
    if (step === 3) return true;
    if (step === 4) return form.name && form.email;
    return true;
  };

  const formatDate = (range) => {
    if (!range?.from) return '';
    const arr = formatSingleDate(range.from);
    const dep = range.to ? formatSingleDate(range.to) : '';
    return dep ? `${arr} – ${dep}` : arr;
  };

  const goNext = () => {
    if (step === 2) {
      const suggested = generateItinerary(partners, form.services, form.budget, isGolfGroup);
      setItinerary(suggested);
    }
    setStep(s => s + 1);
  };

  const swapSuggestion = (category) => {
    const newItinerary = generateItinerary(partners, [category], form.budget, isGolfGroup);
    setItinerary(prev => ({ ...prev, ...newItinerary }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await axios.post(`${BACKEND_URL}/api/trip-planner`, {
        name: form.name, email: form.email, phone: form.phone || null,
        services: form.services, budget: form.budget,
        preferred_hotel: form.services.includes('hotel') ? (itinerary.hotel?.name || null) : null,
        preferred_restaurant: form.services.includes('restaurant') ? (itinerary.restaurant?.name || null) : null,
        preferred_beach_club: form.services.includes('beach_club') ? (itinerary.beach_club?.name || null) : null,
        transfer_pickup: form.transfer_pickup || null,
        transfer_dropoff: form.transfer_dropoff || null,
        date: form.date?.from ? form.date.from.toISOString().split('T')[0] : '',
        departure_date: form.date?.to ? form.date.to.toISOString().split('T')[0] : null,
        schedule: Object.keys(form.schedule).length > 0 ? form.schedule : null, group_size: form.group_size,
        special_requests: form.special_requests || null,
        group_type: form.group_type || null,
        group_name: form.group_name || null,
        transfer_type: form.transfer_type || null,
      });
      setSubmitted(true);
      toast.success('Trip request sent successfully!');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSubmitted(false);
    setItinerary({});
    setForm({ services: [], budget: '', date: null, schedule: {}, group_size: 2, transfer_pickup: '', transfer_dropoff: '', name: '', email: '', phone: '', special_requests: '', group_type: '', number_of_players: '', transfer_type: '', group_name: '' });
    onClose();
  };

  const getMissingHint = () => {
    if (step !== 1) return null;
    const missing = [];
    if (form.services.length === 0) missing.push('a service');
    if (form.services.length > 0 && !form.budget) missing.push('budget');
    return missing.length > 0 ? `Select ${missing.join(' and ')}` : null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="trip-planner-modal">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-lg mx-4 bg-[#F5F2EB] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-stone-800 px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-white font-heading text-lg sm:text-xl">Trip Planner</h2>
            <p className="text-stone-400 text-xs mt-0.5">Step {step} of {totalSteps}</p>
          </div>
          <button onClick={handleClose} className="text-stone-400 hover:text-white transition-colors" data-testid="trip-planner-close"><X className="w-5 h-5" /></button>
        </div>
        <div className="h-1 bg-stone-300 flex-shrink-0">
          <div className="h-full bg-stone-700 transition-all duration-500 ease-out" style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-6">
          {submitted && <SuccessView onClose={handleClose} form={form} itinerary={itinerary} formatDate={formatDate} />}
          {!submitted && step === 1 && <StepServices form={form} toggleService={toggleService} setForm={setForm} />}
          {!submitted && step === 2 && <StepDateTime form={form} setForm={setForm} />}
          {!submitted && step === 3 && <StepItinerary itinerary={itinerary} form={form} swapSuggestion={swapSuggestion} golfCourses={golfCourses} />}
          {!submitted && step === 4 && <StepContact form={form} setForm={setForm} formatDate={formatDate} itinerary={itinerary} />}
          {showScrollHint && !submitted && (
            <div className="sticky bottom-2 flex justify-center pointer-events-none" data-testid="scroll-indicator">
              <span className="bg-stone-700/70 text-white text-[10px] uppercase tracking-widest px-4 py-1 rounded-full backdrop-blur-sm shadow-sm">scroll ↓</span>
            </div>
          )}
        </div>

        {/* Footer */}
        {!submitted && (
          <div className="px-6 py-4 border-t border-stone-300 flex-shrink-0 bg-[#F5F2EB]">
            {step === 1 && !canNext() && getMissingHint() && (
              <p className="text-xs text-stone-400 mb-2 text-center" data-testid="missing-hint">{getMissingHint()}</p>
            )}
            <div className="flex items-center justify-between">
              {step > 1 ? (
                <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors" data-testid="trip-back-btn">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <button onClick={handleClose} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors" data-testid="trip-close-step1-btn">
                  <X className="w-4 h-4" /> Close
                </button>
              )}
              {step < totalSteps ? (
                <button onClick={goNext} disabled={!canNext()} className="flex items-center gap-1.5 px-5 py-2.5 bg-stone-700 text-white text-sm rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" data-testid="trip-next-btn">
                  {step === 2 ? 'See Suggestions' : 'Next'} <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={!canNext() || submitting} className="flex items-center gap-2 px-6 py-2.5 bg-stone-700 text-white text-sm rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" data-testid="trip-submit-btn">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---- Step 1: Services + Budget ---- */

function StepServices({ form, toggleService, setForm }) {
  const isGolfGroup = form.services.includes('golf_groups');

  return (
    <div data-testid="trip-planner-step-1">
      <h3 className="font-heading text-lg text-stone-800 mb-1">What would you like?</h3>
      <p className="text-stone-500 text-sm mb-4">Select one or more services</p>
      <div className="space-y-2.5">
        {SERVICES.map(opt => (
          <ServiceButton key={opt.id} opt={opt} selected={form.services.includes(opt.id)} onToggle={() => toggleService(opt.id)} />
        ))}
      </div>

      {/* Golf Groups details */}
      {isGolfGroup && (
        <div className="mt-4 space-y-3 p-4 bg-stone-100/60 rounded-xl border border-stone-200" data-testid="golf-groups-details">
          <p className="text-stone-600 text-xs uppercase tracking-widest font-semibold">Group details</p>
          <div className="flex gap-2">
            {GROUP_TYPES.map(g => (
              <button key={g.id} onClick={() => setForm(p => ({ ...p, group_type: g.id }))} className={`flex-1 py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all ${form.group_type === g.id ? 'border-stone-600 bg-stone-700/10 text-stone-800' : 'border-stone-300 bg-stone-50 text-stone-500 hover:border-stone-400'}`} data-testid={`group-type-${g.id}`}>
                {g.label}
              </button>
            ))}
          </div>
          <div>
            <p className="text-stone-500 text-xs mb-1.5">Number of players</p>
            <div className="flex gap-2">
              {PLAYER_COUNTS.map(p => (
                <button key={p.id} onClick={() => setForm(prev => ({ ...prev, number_of_players: p.id, group_size: p.min }))} className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${form.number_of_players === p.id ? 'border-stone-600 bg-stone-700/10 text-stone-800' : 'border-stone-300 bg-stone-50 text-stone-500 hover:border-stone-400'}`} data-testid={`players-${p.id}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transfer details */}
      {form.services.includes('transfer') && (
        <div className="mt-4 space-y-2.5">
          <p className="text-stone-500 text-xs uppercase tracking-widest">Transfer details</p>
          {isGolfGroup && (
            <div>
              <p className="text-stone-500 text-xs mb-1.5">Vehicle type</p>
              <div className="space-y-1.5">
                {TRANSFER_TYPES.map(t => (
                  <button key={t.id} onClick={() => setForm(p => ({ ...p, transfer_type: t.id }))} className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${form.transfer_type === t.id ? 'border-stone-600 bg-stone-700/10' : 'border-stone-300 bg-stone-50 hover:border-stone-400'}`} data-testid={`transfer-type-${t.id}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.transfer_type === t.id ? 'bg-stone-700' : 'bg-stone-200'}`}>
                      {t.id === 'sedan' ? <Car className={`w-4 h-4 ${form.transfer_type === t.id ? 'text-white' : 'text-stone-500'}`} /> : <Bus className={`w-4 h-4 ${form.transfer_type === t.id ? 'text-white' : 'text-stone-500'}`} />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${form.transfer_type === t.id ? 'text-stone-800' : 'text-stone-600'}`}>{t.label}</p>
                      <p className="text-xs text-stone-400">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          <input type="text" placeholder="Pickup location (e.g. Airport, Hotel name)" value={form.transfer_pickup} onChange={e => setForm(p => ({ ...p, transfer_pickup: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-stone-300 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400/30 placeholder:text-stone-400" data-testid="transfer-pickup" />
          <input type="text" placeholder="Drop-off location" value={form.transfer_dropoff} onChange={e => setForm(p => ({ ...p, transfer_dropoff: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-stone-300 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400/30 placeholder:text-stone-400" data-testid="transfer-dropoff" />
        </div>
      )}

      {/* Budget */}
      {form.services.length > 0 && (
        <div className="mt-5">
          <p className="text-stone-500 text-xs uppercase tracking-widest mb-2.5">
            {isGolfGroup ? 'Budget per person / day' : 'Your budget range'}
          </p>
          <div className="flex gap-2">
            {BUDGETS.map(b => (
              <BudgetButton key={b.id} b={b} selected={form.budget === b.id} onSelect={() => setForm(p => ({ ...p, budget: b.id }))} isPerPerson={isGolfGroup} />
            ))}
          </div>
          <p className="text-stone-400 text-xs mt-2.5 italic">
            {isGolfGroup ? 'Approx. cost per person per day for a golf trip.' : 'Approx. prices based on high season for 3 days.'}
          </p>
          <div className="mt-2 p-2.5 bg-stone-200/50 rounded-lg">
            <p className="text-stone-500 text-xs leading-relaxed">A 15% budget buffer is recommended for extras like the Balearic Sustainable Tourism Tax (€4.40/night).</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Step 2: Date / Time / Group ---- */

function StepDateTime({ form, setForm }) {
  const isGolfGroup = form.services.includes('golf_groups');
  const calendarClassNames = {
    day_selected: "bg-stone-700 text-white hover:bg-stone-800 hover:text-white focus:bg-stone-700 focus:text-white",
    day_today: "bg-stone-200 text-stone-800 font-bold",
    day_range_start: "day-range-start bg-stone-700 text-white",
    day_range_end: "day-range-end bg-stone-700 text-white",
    day_range_middle: "bg-stone-200 text-stone-700",
  };

  const dateOptions = useMemo(() => {
    if (!form.date?.from) return [];
    const to = form.date.to || form.date.from;
    const dates = [];
    const d = new Date(form.date.from);
    while (d <= to) {
      dates.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return dates;
  }, [form.date]);

  const updateSchedule = (key, field, value) => {
    setForm(p => ({
      ...p,
      schedule: { ...p.schedule, [key]: { ...(p.schedule[key] || {}), [field]: value } }
    }));
  };

  const activeItems = SCHEDULE_ITEMS.filter(item => form.services.includes(item.service));

  return (
    <div data-testid="trip-planner-step-2">
      <h3 className="font-heading text-lg text-stone-800 mb-1">When are you visiting?</h3>
      <p className="text-stone-500 text-sm mb-4">Select your arrival and departure dates</p>
      <div className="flex justify-center mb-4">
        <Calendar mode="range" selected={form.date} onSelect={(d) => setForm(p => ({ ...p, date: d }))} disabled={(d) => d < new Date()} className="rounded-xl border border-stone-300 shadow-sm bg-white" classNames={calendarClassNames} />
      </div>
      {form.date?.from && (
        <p className="text-center text-sm text-stone-600 mb-4">
          Arrival: <span className="font-semibold text-stone-800">{formatSingleDate(form.date.from)}</span>
          {form.date.to ? (
            <> — Departure: <span className="font-semibold text-stone-800">{formatSingleDate(form.date.to)}</span></>
          ) : (
            <span className="text-stone-400 ml-1">(select departure)</span>
          )}
        </p>
      )}

      {form.date?.from && activeItems.length > 0 && (
        <div className="mb-4">
          <label className="flex items-center gap-2 text-stone-500 text-xs uppercase tracking-widest mb-2.5">
            <Clock className="w-3.5 h-3.5" /> Your Schedule
          </label>
          <p className="text-stone-400 text-xs mb-2">Set your preferred date and time for each service</p>
          <div className="space-y-2">
            {activeItems.map(item => {
              const Icon = item.icon;
              const entry = form.schedule[item.key] || {};
              return (
                <div key={item.key} className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-stone-200" data-testid={`schedule-${item.key}`}>
                  <Icon className="w-4 h-4 text-stone-400 flex-shrink-0" />
                  <span className="text-xs font-medium text-stone-600 min-w-[105px] flex-shrink-0">{item.label}</span>
                  <select
                    value={entry.date || ''}
                    onChange={e => updateSchedule(item.key, 'date', e.target.value)}
                    className="flex-1 text-xs px-2 py-1.5 border border-stone-200 rounded bg-stone-50 text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-300"
                    data-testid={`schedule-${item.key}-date`}
                  >
                    <option value="">Day</option>
                    {dateOptions.map(d => (
                      <option key={d.toISOString()} value={d.toISOString().split('T')[0]}>
                        {formatShortDate(d)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={entry.time || ''}
                    onChange={e => updateSchedule(item.key, 'time', e.target.value)}
                    className="w-[72px] text-xs px-2 py-1.5 border border-stone-200 rounded bg-stone-50 text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-300"
                    data-testid={`schedule-${item.key}-time`}
                  >
                    <option value="">Time</option>
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              );
            })}
          </div>
          <p className="text-stone-400 text-xs mt-2 italic">Optional — our team will confirm availability with you.</p>
        </div>
      )}

      {!isGolfGroup && (
      <div>
        <label className="flex items-center gap-2 text-stone-500 text-xs uppercase tracking-widest mb-2"><Users className="w-3.5 h-3.5" /> Group size</label>
        <div className="flex items-center gap-3">
          <button onClick={() => setForm(p => ({ ...p, group_size: Math.max(1, p.group_size - 1) }))} className="w-9 h-9 rounded-lg border border-stone-300 flex items-center justify-center text-stone-500 hover:bg-stone-200 bg-stone-50" data-testid="group-minus">-</button>
          <span className="text-lg font-medium text-stone-800 w-8 text-center" data-testid="group-size-display">{form.group_size}</span>
          <button onClick={() => setForm(p => ({ ...p, group_size: Math.min(20, p.group_size + 1) }))} className="w-9 h-9 rounded-lg border border-stone-300 flex items-center justify-center text-stone-500 hover:bg-stone-200 bg-stone-50" data-testid="group-plus">+</button>
          <span className="text-sm text-stone-400">people</span>
        </div>
      </div>
      )}
      {isGolfGroup && (
        <div className="p-3 bg-stone-100 rounded-lg border border-stone-200">
          <p className="text-xs text-stone-500"><span className="font-semibold text-stone-700">{form.group_type === 'society' ? 'Golf Society' : 'Friends Trip'}</span> · {form.number_of_players} players</p>
        </div>
      )}
    </div>
  );
}

/* ---- Step 3: Suggested Itinerary ---- */

function StepItinerary({ itinerary, form, swapSuggestion, golfCourses }) {
  const budgetLabel = BUDGETS.find(b => b.id === form.budget)?.label || '';
  const isGolfGroup = form.services.includes('golf_groups');

  const matchGolfCourse = (hotel) => {
    if (!hotel?.nearest_golf || !golfCourses.length) return null;
    const name = hotel.nearest_golf.toLowerCase();
    return golfCourses.find(c => c.name.toLowerCase().includes(name) || name.includes(c.name.toLowerCase()));
  };

  const nearestGolf = itinerary.hotel ? matchGolfCourse(itinerary.hotel) : null;

  return (
    <div data-testid="trip-planner-step-3">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-5 h-5 text-stone-600" />
        <h3 className="font-heading text-lg text-stone-800">Your Personalised Itinerary</h3>
      </div>
      <p className="text-stone-500 text-sm mb-5">
        {isGolfGroup
          ? <>Hotels nearest to golf courses for your <span className="font-medium text-stone-700">{budgetLabel}</span> group. Tap refresh for alternatives.</>
          : <>Based on your <span className="font-medium text-stone-700">{budgetLabel}</span> budget, here's what we suggest. Tap the refresh icon to see alternatives.</>
        }
      </p>

      <div className="space-y-3">
        {itinerary.hotel && (
          <ItineraryCard label="Hotel" icon={Hotel} item={itinerary.hotel} onSwap={() => swapSuggestion('hotel')} />
        )}
        {nearestGolf && (
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200" data-testid="nearest-golf-card">
            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
              <img src={nearestGolf.image} alt={nearestGolf.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-stone-400 uppercase tracking-wider">Nearest Golf Course</p>
              <p className="text-sm font-semibold text-stone-800 truncate">{nearestGolf.name}</p>
              <p className="text-xs text-stone-500 truncate">{itinerary.hotel.distance_km}km · {nearestGolf.holes} holes · Par {nearestGolf.par} · From €{nearestGolf.price_from}</p>
            </div>
            <a href={nearestGolf.booking_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-[11px] bg-stone-500 text-white px-3 py-1.5 rounded-lg hover:bg-stone-600 transition-colors whitespace-nowrap" data-testid="book-tee-time">
              Book Tee Time
            </a>
          </div>
        )}
        {itinerary.restaurant && (
          <ItineraryCard label="Restaurant" icon={UtensilsCrossed} item={itinerary.restaurant} onSwap={() => swapSuggestion('restaurant')} />
        )}
        {itinerary.beach_club && (
          <ItineraryCard label="Beach Club" icon={Umbrella} item={itinerary.beach_club} onSwap={() => swapSuggestion('beach_club')} />
        )}
        {form.services.includes('transfer') && (
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200">
            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
              <img src={TRANSFER_IMAGE} alt="Transfer" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-stone-400 uppercase tracking-wider">Premium Transfer</p>
              <p className="font-semibold text-stone-800 text-sm">
                {isGolfGroup && form.transfer_type ? (TRANSFER_TYPES.find(t => t.id === form.transfer_type)?.label || 'Mercedes S-Class') : 'Mercedes S-Class'}
              </p>
              <p className="text-xs text-stone-500">
                {isGolfGroup && form.transfer_type ? (TRANSFER_TYPES.find(t => t.id === form.transfer_type)?.desc || 'Private luxury chauffeur service') : 'Private luxury chauffeur service'}
              </p>
              {form.transfer_pickup && <p className="text-xs text-stone-400 mt-0.5">{form.transfer_pickup} → {form.transfer_dropoff || 'TBD'}</p>}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-stone-400 mt-4 text-center">Not quite right? Use the refresh buttons above or our team can further personalise your plan.</p>
    </div>
  );
}

/* ---- Step 4: Contact Details ---- */

function StepContact({ form, setForm, formatDate, itinerary }) {
  const serviceLabels = form.services.map(s => SERVICES.find(o => o.id === s)?.label).join(', ');
  const budgetLabel = BUDGETS.find(b => b.id === form.budget)?.range || '';
  const isGolfGroup = form.services.includes('golf_groups');
  const budgetDisplay = isGolfGroup ? (BUDGETS.find(b => b.id === form.budget)?.rangePerPerson || '') + ' /pers/day' : budgetLabel;

  return (
    <div data-testid="trip-planner-step-contact">
      <h3 className="font-heading text-lg text-stone-800 mb-1">Your Details</h3>
      <p className="text-stone-500 text-sm mb-4">So we can confirm your personalised plan</p>
      <div className="space-y-3">
        <input type="text" placeholder="Full name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 text-sm border border-stone-300 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400/30 placeholder:text-stone-400" data-testid="trip-name" />
        <input type="email" placeholder="Email address *" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-3 text-sm border border-stone-300 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400/30 placeholder:text-stone-400" data-testid="trip-email" />
        <input type="tel" placeholder="Phone (optional)" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 text-sm border border-stone-300 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400/30 placeholder:text-stone-400" data-testid="trip-phone" />
        {isGolfGroup && (
          <input type="text" placeholder={form.group_type === 'society' ? 'Society / Club name' : 'Group name (optional)'} value={form.group_name} onChange={e => setForm(p => ({ ...p, group_name: e.target.value }))} className="w-full px-4 py-3 text-sm border border-stone-300 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400/30 placeholder:text-stone-400" data-testid="trip-group-name" />
        )}
        <textarea placeholder="Special requests (optional)" rows={2} value={form.special_requests} onChange={e => setForm(p => ({ ...p, special_requests: e.target.value }))} className="w-full px-4 py-3 text-sm border border-stone-300 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400/30 placeholder:text-stone-400 resize-none" data-testid="trip-special" />
      </div>
      <div className="mt-4 p-4 bg-stone-100 rounded-xl border border-stone-200">
        <p className="text-xs text-stone-400 uppercase tracking-widest mb-2">Request Summary</p>
        <div className="space-y-1 text-sm">
          <p className="text-stone-600"><span className="text-stone-400">Services:</span> {serviceLabels}</p>
          {isGolfGroup && (
            <>
              <p className="text-stone-600"><span className="text-stone-400">Group Type:</span> {form.group_type === 'society' ? 'Golf Society' : 'Friends Trip'}</p>
              <p className="text-stone-600"><span className="text-stone-400">Players:</span> {form.number_of_players}</p>
              {form.group_name && <p className="text-stone-600"><span className="text-stone-400">Group Name:</span> {form.group_name}</p>}
            </>
          )}
          <p className="text-stone-600"><span className="text-stone-400">Budget:</span> {budgetDisplay}</p>
          <p className="text-stone-600"><span className="text-stone-400">Dates:</span> {formatDate(form.date)}</p>
          {SCHEDULE_ITEMS.filter(item => form.services.includes(item.service) && (form.schedule[item.key]?.date || form.schedule[item.key]?.time)).map(item => {
            const s = form.schedule[item.key];
            return <p key={item.key} className="text-stone-500 text-xs"><span className="text-stone-400">{item.label}:</span> {s.date || ''}{s.time ? ` at ${s.time}` : ''}</p>;
          })}
          {!isGolfGroup && <p className="text-stone-600"><span className="text-stone-400">Group:</span> {form.group_size} {form.group_size === 1 ? 'person' : 'people'}</p>}
          {form.services.includes('hotel') && itinerary.hotel && <p className="text-stone-600"><span className="text-stone-400">Hotel:</span> {itinerary.hotel.name}</p>}
          {form.services.includes('restaurant') && itinerary.restaurant && <p className="text-stone-600"><span className="text-stone-400">Restaurant:</span> {itinerary.restaurant.name}</p>}
          {form.services.includes('beach_club') && itinerary.beach_club && <p className="text-stone-600"><span className="text-stone-400">Beach Club:</span> {itinerary.beach_club.name}</p>}
          {form.services.includes('transfer') && <p className="text-stone-600"><span className="text-stone-400">Transfer:</span> {isGolfGroup && form.transfer_type ? TRANSFER_TYPES.find(t => t.id === form.transfer_type)?.label : 'Mercedes S-Class'}{form.transfer_pickup ? ` · ${form.transfer_pickup} → ${form.transfer_dropoff || 'TBD'}` : ''}</p>}
        </div>
      </div>
    </div>
  );
}

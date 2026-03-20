import React, { useState, useEffect, useMemo } from 'react';
import { X, Hotel, UtensilsCrossed, Umbrella, Users, ChevronRight, ChevronLeft, CheckCircle, Clock, Loader2, Car, RefreshCw, Sparkles } from 'lucide-react';
import { Calendar } from './ui/calendar';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SERVICES = [
  { id: 'hotel', label: 'Hotel Stay', icon: Hotel, desc: 'Luxury golf resort' },
  { id: 'restaurant', label: 'Michelin Dining', icon: UtensilsCrossed, desc: 'Fine dining experience' },
  { id: 'beach_club', label: 'Beach Club', icon: Umbrella, desc: 'Exclusive day pass' },
  { id: 'transfer', label: 'Premium Transfer', icon: Car, desc: 'Private luxury transport' },
];

const BUDGETS = [
  { id: 'moderate', label: 'Moderate', range: '€500 – €1,000', desc: 'Great value experiences' },
  { id: 'premium', label: 'Premium', range: '€1,000 – €2,500', desc: 'Upscale comfort' },
  { id: 'luxury', label: 'Luxury', range: '€2,500+', desc: 'The finest Mallorca offers' },
];

const TIMES = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
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

function generateItinerary(partners, services, budget) {
  const tiers = BUDGET_TIERS[budget] || ['moderate', 'premium', 'luxury'];
  const result = {};

  if (services.includes('hotel')) {
    const matched = partners.hotels.filter(h => tiers.includes(getHotelTier(h.name)));
    const pool = matched.length > 0 ? matched : partners.hotels;
    result.hotel = pool[Math.floor(Math.random() * pool.length)];
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

function BudgetButton({ b, selected, onSelect }) {
  return (
    <button onClick={onSelect} className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${selected ? 'border-stone-600 bg-stone-700/10' : 'border-stone-300 hover:border-stone-400 bg-stone-50'}`} data-testid={`budget-${b.id}`}>
      <p className={`font-semibold text-sm ${selected ? 'text-stone-800' : 'text-stone-600'}`}>{b.label}</p>
      <p className={`text-xs mt-0.5 ${selected ? 'text-stone-600' : 'text-stone-400'}`}>{b.range}</p>
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
  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-stone-200">
      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-stone-400 uppercase tracking-wider">{label}</p>
        <p className="font-semibold text-stone-800 text-sm truncate">{item.name}</p>
        <p className="text-xs text-stone-500">{item.location}{item.michelin_stars ? ` · ${item.michelin_stars}` : ''}</p>
        {golfInfo && <p className="text-xs text-stone-400 mt-0.5">{golfInfo}</p>}
      </div>
      <button onClick={onSwap} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors flex-shrink-0" title="Suggest another" data-testid={`swap-${label.toLowerCase().replace(' ', '-')}`}>
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  );
}

function SuccessView({ onClose }) {
  return (
    <div className="text-center py-10" data-testid="trip-planner-success">
      <CheckCircle className="w-14 h-14 text-stone-600 mx-auto mb-4" />
      <h3 className="font-heading text-2xl text-stone-800 mb-2">Request Received!</h3>
      <p className="text-stone-500 text-sm">We've received your personalised itinerary request. Our team will get back to you within 24 hours.</p>
      <button onClick={onClose} className="mt-6 px-6 py-2.5 bg-stone-700 text-white text-sm rounded-lg hover:bg-stone-800 transition-colors" data-testid="trip-planner-done-btn">Done</button>
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

  const [form, setForm] = useState({
    services: [], budget: '',
    date: null, time: '', group_size: 2,
    transfer_pickup: '', transfer_dropoff: '',
    name: '', email: '', phone: '', special_requests: '',
  });

  useEffect(() => {
    if (!isOpen) return;
    axios.get(`${BACKEND_URL}/api/all-partners`).then(res => {
      setPartners({
        hotels: res.data.hotels || [],
        restaurants: (res.data.restaurants || []).filter(r => r.michelin_stars),
        beach_clubs: res.data.beach_clubs || [],
      });
    }).catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const toggleService = (id) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(id) ? prev.services.filter(s => s !== id) : [...prev.services, id],
    }));
  };

  const needsItinerary = form.services.some(s => ['hotel', 'restaurant', 'beach_club'].includes(s));
  const totalSteps = needsItinerary ? 4 : 3;

  const canNext = () => {
    if (step === 1) return form.services.length > 0 && form.budget;
    if (step === 2) return form.date;
    if (step === 3 && needsItinerary) return true;
    const contactStep = needsItinerary ? 4 : 3;
    if (step === contactStep) return form.name && form.email;
    return true;
  };

  const formatDate = (d) => d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  const goNext = () => {
    if (step === 2 && needsItinerary) {
      const suggested = generateItinerary(partners, form.services, form.budget);
      setItinerary(suggested);
    }
    setStep(s => s + 1);
  };

  const swapSuggestion = (category) => {
    const newItinerary = generateItinerary(partners, [category], form.budget);
    setItinerary(prev => ({ ...prev, ...newItinerary }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await axios.post(`${BACKEND_URL}/api/trip-planner`, {
        name: form.name, email: form.email, phone: form.phone || null,
        services: form.services, budget: form.budget,
        preferred_hotel: itinerary.hotel?.name || null,
        preferred_restaurant: itinerary.restaurant?.name || null,
        preferred_beach_club: itinerary.beach_club?.name || null,
        transfer_pickup: form.transfer_pickup || null,
        transfer_dropoff: form.transfer_dropoff || null,
        date: form.date ? form.date.toISOString().split('T')[0] : '',
        time: form.time || null, group_size: form.group_size,
        special_requests: form.special_requests || null,
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
    setForm({ services: [], budget: '', date: null, time: '', group_size: 2, transfer_pickup: '', transfer_dropoff: '', name: '', email: '', phone: '', special_requests: '' });
    onClose();
  };

  if (!isOpen) return null;

  const contactStep = needsItinerary ? 4 : 3;
  const itineraryStep = needsItinerary ? 3 : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="trip-planner-modal">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-lg mx-4 bg-[#F5F2EB] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-stone-800 px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-white font-heading text-lg sm:text-xl">Plan a Trip or Make a Reservation</h2>
            <p className="text-stone-400 text-xs mt-0.5">Step {step} of {totalSteps}</p>
          </div>
          <button onClick={handleClose} className="text-stone-400 hover:text-white transition-colors" data-testid="trip-planner-close"><X className="w-5 h-5" /></button>
        </div>
        <div className="h-1 bg-stone-300 flex-shrink-0">
          <div className="h-full bg-stone-700 transition-all duration-500 ease-out" style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {submitted && <SuccessView onClose={handleClose} />}
          {!submitted && step === 1 && <StepServices form={form} toggleService={toggleService} setForm={setForm} />}
          {!submitted && step === 2 && <StepDateTime form={form} setForm={setForm} formatDate={formatDate} />}
          {!submitted && step === itineraryStep && <StepItinerary itinerary={itinerary} form={form} swapSuggestion={swapSuggestion} />}
          {!submitted && step === contactStep && <StepContact form={form} setForm={setForm} formatDate={formatDate} itinerary={itinerary} needsItinerary={needsItinerary} />}
        </div>

        {/* Footer */}
        {!submitted && (
          <div className="px-6 py-4 border-t border-stone-300 flex items-center justify-between flex-shrink-0 bg-[#F5F2EB]">
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors" data-testid="trip-back-btn">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}
            {step < totalSteps ? (
              <button onClick={goNext} disabled={!canNext()} className="flex items-center gap-1.5 px-5 py-2.5 bg-stone-700 text-white text-sm rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" data-testid="trip-next-btn">
                {step === 2 && needsItinerary ? 'See Suggestions' : 'Next'} <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={!canNext() || submitting} className="flex items-center gap-2 px-6 py-2.5 bg-stone-700 text-white text-sm rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" data-testid="trip-submit-btn">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Sending...' : 'Send Request'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ---- Step 1: Services + Budget ---- */

function StepServices({ form, toggleService, setForm }) {
  return (
    <div data-testid="trip-planner-step-1">
      <h3 className="font-heading text-lg text-stone-800 mb-1">What would you like?</h3>
      <p className="text-stone-500 text-sm mb-4">Select one or more services</p>
      <div className="space-y-2.5">
        {SERVICES.map(opt => (
          <ServiceButton key={opt.id} opt={opt} selected={form.services.includes(opt.id)} onToggle={() => toggleService(opt.id)} />
        ))}
      </div>

      {/* Transfer details */}
      {form.services.includes('transfer') && (
        <div className="mt-4 space-y-2.5">
          <p className="text-stone-500 text-xs uppercase tracking-widest">Transfer details</p>
          <input type="text" placeholder="Pickup location (e.g. Airport, Hotel name)" value={form.transfer_pickup} onChange={e => setForm(p => ({ ...p, transfer_pickup: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-stone-300 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400/30 placeholder:text-stone-400" data-testid="transfer-pickup" />
          <input type="text" placeholder="Drop-off location" value={form.transfer_dropoff} onChange={e => setForm(p => ({ ...p, transfer_dropoff: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-stone-300 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400/30 placeholder:text-stone-400" data-testid="transfer-dropoff" />
        </div>
      )}

      {/* Budget */}
      {form.services.length > 0 && (
        <div className="mt-5">
          <p className="text-stone-500 text-xs uppercase tracking-widest mb-2.5">Your budget range</p>
          <div className="flex gap-2">
            {BUDGETS.map(b => (
              <BudgetButton key={b.id} b={b} selected={form.budget === b.id} onSelect={() => setForm(p => ({ ...p, budget: b.id }))} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Step 2: Date / Time / Group ---- */

function StepDateTime({ form, setForm, formatDate }) {
  const calendarClassNames = {
    day_selected: "bg-stone-700 text-white hover:bg-stone-800 hover:text-white focus:bg-stone-700 focus:text-white",
    day_today: "bg-stone-200 text-stone-800 font-bold",
  };

  return (
    <div data-testid="trip-planner-step-2">
      <h3 className="font-heading text-lg text-stone-800 mb-1">When are you coming?</h3>
      <p className="text-stone-500 text-sm mb-4">Pick your preferred date and time</p>
      <div className="flex justify-center mb-4">
        <Calendar mode="single" selected={form.date} onSelect={(d) => setForm(p => ({ ...p, date: d }))} disabled={(d) => d < new Date()} className="rounded-xl border border-stone-300 shadow-sm bg-white" classNames={calendarClassNames} />
      </div>
      {form.date && (
        <p className="text-center text-sm text-stone-600 mb-4">Selected: <span className="font-semibold text-stone-800">{formatDate(form.date)}</span></p>
      )}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-stone-500 text-xs uppercase tracking-widest mb-2"><Clock className="w-3.5 h-3.5" /> Preferred time</label>
        <div className="grid grid-cols-5 gap-1.5">
          {TIMES.map(t => (
            <TimeButton key={t} time={t} selected={form.time === t} onSelect={() => setForm(p => ({ ...p, time: p.time === t ? '' : t }))} />
          ))}
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2 text-stone-500 text-xs uppercase tracking-widest mb-2"><Users className="w-3.5 h-3.5" /> Group size</label>
        <div className="flex items-center gap-3">
          <button onClick={() => setForm(p => ({ ...p, group_size: Math.max(1, p.group_size - 1) }))} className="w-9 h-9 rounded-lg border border-stone-300 flex items-center justify-center text-stone-500 hover:bg-stone-200 bg-stone-50" data-testid="group-minus">-</button>
          <span className="text-lg font-medium text-stone-800 w-8 text-center" data-testid="group-size-display">{form.group_size}</span>
          <button onClick={() => setForm(p => ({ ...p, group_size: Math.min(20, p.group_size + 1) }))} className="w-9 h-9 rounded-lg border border-stone-300 flex items-center justify-center text-stone-500 hover:bg-stone-200 bg-stone-50" data-testid="group-plus">+</button>
          <span className="text-sm text-stone-400">people</span>
        </div>
      </div>
    </div>
  );
}

/* ---- Step 3: Suggested Itinerary ---- */

function StepItinerary({ itinerary, form, swapSuggestion }) {
  const budgetLabel = BUDGETS.find(b => b.id === form.budget)?.label || '';
  return (
    <div data-testid="trip-planner-step-3">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-5 h-5 text-stone-600" />
        <h3 className="font-heading text-lg text-stone-800">Your Personalised Itinerary</h3>
      </div>
      <p className="text-stone-500 text-sm mb-5">Based on your <span className="font-medium text-stone-700">{budgetLabel}</span> budget, here's what we suggest. Tap the refresh icon to see alternatives.</p>

      <div className="space-y-3">
        {itinerary.hotel && (
          <ItineraryCard label="Hotel" icon={Hotel} item={itinerary.hotel} onSwap={() => swapSuggestion('hotel')} />
        )}
        {itinerary.restaurant && (
          <ItineraryCard label="Restaurant" icon={UtensilsCrossed} item={itinerary.restaurant} onSwap={() => swapSuggestion('restaurant')} />
        )}
        {itinerary.beach_club && (
          <ItineraryCard label="Beach Club" icon={Umbrella} item={itinerary.beach_club} onSwap={() => swapSuggestion('beach_club')} />
        )}
        {form.services.includes('transfer') && (
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-stone-200">
            <div className="w-14 h-14 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
              <Car className="w-6 h-6 text-stone-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-stone-400 uppercase tracking-wider">Premium Transfer</p>
              <p className="font-semibold text-stone-800 text-sm">Private Luxury Vehicle</p>
              {form.transfer_pickup && <p className="text-xs text-stone-500">{form.transfer_pickup} → {form.transfer_dropoff || 'TBD'}</p>}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-stone-400 mt-4 text-center">Not quite right? Use the refresh buttons above or our team can further personalise your plan.</p>
    </div>
  );
}

/* ---- Step 4: Contact Details ---- */

function StepContact({ form, setForm, formatDate, itinerary, needsItinerary }) {
  const serviceLabels = form.services.map(s => SERVICES.find(o => o.id === s)?.label).join(', ');
  const budgetLabel = BUDGETS.find(b => b.id === form.budget)?.range || '';

  return (
    <div data-testid="trip-planner-step-contact">
      <h3 className="font-heading text-lg text-stone-800 mb-1">Your Details</h3>
      <p className="text-stone-500 text-sm mb-4">So we can confirm your personalised plan</p>
      <div className="space-y-3">
        <input type="text" placeholder="Full name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 text-sm border border-stone-300 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400/30 placeholder:text-stone-400" data-testid="trip-name" />
        <input type="email" placeholder="Email address *" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-3 text-sm border border-stone-300 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400/30 placeholder:text-stone-400" data-testid="trip-email" />
        <input type="tel" placeholder="Phone (optional)" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 text-sm border border-stone-300 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400/30 placeholder:text-stone-400" data-testid="trip-phone" />
        <textarea placeholder="Special requests (optional)" rows={2} value={form.special_requests} onChange={e => setForm(p => ({ ...p, special_requests: e.target.value }))} className="w-full px-4 py-3 text-sm border border-stone-300 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400/30 placeholder:text-stone-400 resize-none" data-testid="trip-special" />
      </div>
      <div className="mt-4 p-4 bg-stone-100 rounded-xl border border-stone-200">
        <p className="text-xs text-stone-400 uppercase tracking-widest mb-2">Request Summary</p>
        <div className="space-y-1 text-sm">
          <p className="text-stone-600"><span className="text-stone-400">Services:</span> {serviceLabels}</p>
          <p className="text-stone-600"><span className="text-stone-400">Budget:</span> {budgetLabel}</p>
          <p className="text-stone-600"><span className="text-stone-400">Date:</span> {formatDate(form.date)}{form.time ? ` at ${form.time}` : ''}</p>
          <p className="text-stone-600"><span className="text-stone-400">Group:</span> {form.group_size} {form.group_size === 1 ? 'person' : 'people'}</p>
          {itinerary.hotel && <p className="text-stone-600"><span className="text-stone-400">Hotel:</span> {itinerary.hotel.name}</p>}
          {itinerary.restaurant && <p className="text-stone-600"><span className="text-stone-400">Restaurant:</span> {itinerary.restaurant.name}</p>}
          {itinerary.beach_club && <p className="text-stone-600"><span className="text-stone-400">Beach Club:</span> {itinerary.beach_club.name}</p>}
          {form.services.includes('transfer') && form.transfer_pickup && <p className="text-stone-600"><span className="text-stone-400">Transfer:</span> {form.transfer_pickup} → {form.transfer_dropoff || 'TBD'}</p>}
        </div>
      </div>
    </div>
  );
}

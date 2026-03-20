import React, { useState, useEffect } from 'react';
import { X, Hotel, UtensilsCrossed, Umbrella, CalendarDays, Users, ChevronRight, ChevronLeft, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { Calendar } from './ui/calendar';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SERVICES = [
  { id: 'hotel', label: 'Hotel Stay', icon: Hotel, desc: 'Luxury golf resort' },
  { id: 'restaurant', label: 'Michelin Dining', icon: UtensilsCrossed, desc: 'Fine dining experience' },
  { id: 'beach_club', label: 'Beach Club', icon: Umbrella, desc: 'Exclusive day pass' },
];

const TIMES = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
];

/* ---- Sub-components to avoid Babel depth issues ---- */

function ServiceButton({ opt, selected, onToggle }) {
  const Icon = opt.icon;
  return (
    <button onClick={onToggle} className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${selected ? 'border-brand-charcoal bg-brand-charcoal/5' : 'border-stone-200 hover:border-stone-300 bg-white'}`} data-testid={`service-${opt.id}`}>
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${selected ? 'bg-brand-charcoal' : 'bg-stone-100'}`}>
        <Icon className={`w-5 h-5 ${selected ? 'text-white' : 'text-stone-400'}`} />
      </div>
      <div className="flex-1">
        <p className={`font-medium text-sm ${selected ? 'text-brand-charcoal' : 'text-stone-700'}`}>{opt.label}</p>
        <p className="text-xs text-stone-400">{opt.desc}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-brand-charcoal bg-brand-charcoal' : 'border-stone-300'}`}>
        {selected && <CheckCircle className="w-3 h-3 text-white" />}
      </div>
    </button>
  );
}

function VenueSelect({ label, value, onChange, options, testId }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-charcoal/20" data-testid={testId}>
      <option value="">{label}</option>
      {options.map(item => (
        <option key={item.id} value={item.name}>{item.name} — {item.location}</option>
      ))}
    </select>
  );
}

function TimeButton({ time, selected, onSelect }) {
  return (
    <button onClick={onSelect} className={`py-2 text-xs rounded-lg border transition-all ${selected ? 'bg-brand-charcoal text-white border-brand-charcoal' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'}`} data-testid={`time-${time}`}>
      {time}
    </button>
  );
}

function SuccessView({ onClose }) {
  return (
    <div className="text-center py-10" data-testid="trip-planner-success">
      <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
      <h3 className="font-heading text-2xl text-stone-900 mb-2">Request Received!</h3>
      <p className="text-stone-500 text-sm">We'll review your preferences and get back to you within 24 hours with a personalised plan.</p>
      <button onClick={onClose} className="mt-6 px-6 py-2.5 bg-brand-charcoal text-white text-sm rounded-lg hover:bg-brand-charcoal/90 transition-colors" data-testid="trip-planner-done-btn">Done</button>
    </div>
  );
}

/* ---- Main Component ---- */

export const TripPlanner = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [partners, setPartners] = useState({ hotels: [], restaurants: [], beach_clubs: [] });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    services: [], preferred_hotel: '', preferred_restaurant: '', preferred_beach_club: '',
    date: null, time: '', group_size: 2, name: '', email: '', phone: '', special_requests: '',
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
    setForm(prev => ({ ...prev, services: prev.services.includes(id) ? prev.services.filter(s => s !== id) : [...prev.services, id] }));
  };

  const canNext = () => {
    if (step === 1) return form.services.length > 0;
    if (step === 2) return form.date;
    return form.name && form.email;
  };

  const formatDate = (d) => d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await axios.post(`${BACKEND_URL}/api/trip-planner`, {
        name: form.name, email: form.email, phone: form.phone || null,
        services: form.services,
        preferred_hotel: form.preferred_hotel || null,
        preferred_restaurant: form.preferred_restaurant || null,
        preferred_beach_club: form.preferred_beach_club || null,
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
    setForm({ services: [], preferred_hotel: '', preferred_restaurant: '', preferred_beach_club: '', date: null, time: '', group_size: 2, name: '', email: '', phone: '', special_requests: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="trip-planner-modal">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-brand-charcoal px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-white font-heading text-xl">Plan Your Golf Trip</h2>
            <p className="text-white/60 text-xs mt-0.5">Step {step} of 3</p>
          </div>
          <button onClick={handleClose} className="text-white/60 hover:text-white transition-colors" data-testid="trip-planner-close"><X className="w-5 h-5" /></button>
        </div>
        <div className="h-1 bg-stone-100 flex-shrink-0">
          <div className="h-full bg-brand-charcoal transition-all duration-500 ease-out" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {submitted && <SuccessView onClose={handleClose} />}

          {!submitted && step === 1 && (
            <StepOne form={form} partners={partners} toggleService={toggleService} setForm={setForm} />
          )}
          {!submitted && step === 2 && (
            <StepTwo form={form} setForm={setForm} formatDate={formatDate} />
          )}
          {!submitted && step === 3 && (
            <StepThree form={form} setForm={setForm} formatDate={formatDate} />
          )}
        </div>

        {/* Footer */}
        {!submitted && (
          <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between flex-shrink-0 bg-white">
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors" data-testid="trip-back-btn">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}
            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-charcoal text-white text-sm rounded-lg hover:bg-brand-charcoal/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" data-testid="trip-next-btn">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={!canNext() || submitting} className="flex items-center gap-2 px-6 py-2.5 bg-brand-charcoal text-white text-sm rounded-lg hover:bg-brand-charcoal/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" data-testid="trip-submit-btn">
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

/* ---- Step Components ---- */

function StepOne({ form, partners, toggleService, setForm }) {
  return (
    <div data-testid="trip-planner-step-1">
      <h3 className="font-heading text-lg text-stone-900 mb-1">What would you like?</h3>
      <p className="text-stone-500 text-sm mb-5">Select one or more services</p>
      <div className="space-y-3">
        {SERVICES.map(opt => (
          <ServiceButton key={opt.id} opt={opt} selected={form.services.includes(opt.id)} onToggle={() => toggleService(opt.id)} />
        ))}
      </div>
      {form.services.length > 0 && (
        <div className="mt-5 space-y-3">
          <p className="text-stone-500 text-xs uppercase tracking-widest">Preferred venues (optional)</p>
          {form.services.includes('hotel') && (
            <VenueSelect label="Any hotel" value={form.preferred_hotel} onChange={v => setForm(p => ({ ...p, preferred_hotel: v }))} options={partners.hotels} testId="select-hotel" />
          )}
          {form.services.includes('restaurant') && (
            <VenueSelect label="Any Michelin restaurant" value={form.preferred_restaurant} onChange={v => setForm(p => ({ ...p, preferred_restaurant: v }))} options={partners.restaurants} testId="select-restaurant" />
          )}
          {form.services.includes('beach_club') && (
            <VenueSelect label="Any beach club" value={form.preferred_beach_club} onChange={v => setForm(p => ({ ...p, preferred_beach_club: v }))} options={partners.beach_clubs} testId="select-beach-club" />
          )}
        </div>
      )}
    </div>
  );
}

function StepTwo({ form, setForm, formatDate }) {
  return (
    <div data-testid="trip-planner-step-2">
      <h3 className="font-heading text-lg text-stone-900 mb-1">When are you coming?</h3>
      <p className="text-stone-500 text-sm mb-5">Pick your preferred date and time</p>
      <div className="flex justify-center mb-5">
        <Calendar
          mode="single"
          selected={form.date}
          onSelect={(d) => setForm(p => ({ ...p, date: d }))}
          disabled={(d) => d < new Date()}
          className="rounded-xl border border-stone-200 shadow-sm"
        />
      </div>
      {form.date && (
        <p className="text-center text-sm text-stone-600 mb-4">
          Selected: <span className="font-medium text-brand-charcoal">{formatDate(form.date)}</span>
        </p>
      )}
      <div className="mb-5">
        <label className="flex items-center gap-2 text-stone-500 text-xs uppercase tracking-widest mb-2">
          <Clock className="w-3.5 h-3.5" /> Preferred time
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {TIMES.map(t => (
            <TimeButton key={t} time={t} selected={form.time === t} onSelect={() => setForm(p => ({ ...p, time: p.time === t ? '' : t }))} />
          ))}
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2 text-stone-500 text-xs uppercase tracking-widest mb-2">
          <Users className="w-3.5 h-3.5" /> Group size
        </label>
        <div className="flex items-center gap-3">
          <button onClick={() => setForm(p => ({ ...p, group_size: Math.max(1, p.group_size - 1) }))} className="w-9 h-9 rounded-lg border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-50" data-testid="group-minus">-</button>
          <span className="text-lg font-medium text-brand-charcoal w-8 text-center" data-testid="group-size-display">{form.group_size}</span>
          <button onClick={() => setForm(p => ({ ...p, group_size: Math.min(20, p.group_size + 1) }))} className="w-9 h-9 rounded-lg border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-50" data-testid="group-plus">+</button>
          <span className="text-sm text-stone-400">people</span>
        </div>
      </div>
    </div>
  );
}

function StepThree({ form, setForm, formatDate }) {
  const serviceLabels = form.services.map(s => SERVICES.find(o => o.id === s)?.label).join(', ');
  return (
    <div data-testid="trip-planner-step-3">
      <h3 className="font-heading text-lg text-stone-900 mb-1">Your Details</h3>
      <p className="text-stone-500 text-sm mb-5">So we can send you your personalised plan</p>
      <div className="space-y-4">
        <input type="text" placeholder="Full name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-charcoal/20 placeholder:text-stone-400" data-testid="trip-name" />
        <input type="email" placeholder="Email address *" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-3 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-charcoal/20 placeholder:text-stone-400" data-testid="trip-email" />
        <input type="tel" placeholder="Phone (optional)" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-charcoal/20 placeholder:text-stone-400" data-testid="trip-phone" />
        <textarea placeholder="Special requests (optional)" rows={3} value={form.special_requests} onChange={e => setForm(p => ({ ...p, special_requests: e.target.value }))} className="w-full px-4 py-3 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-charcoal/20 placeholder:text-stone-400 resize-none" data-testid="trip-special" />
      </div>
      <div className="mt-5 p-4 bg-stone-50 rounded-xl border border-stone-100">
        <p className="text-xs text-stone-400 uppercase tracking-widest mb-2">Your request summary</p>
        <div className="space-y-1 text-sm">
          <p className="text-stone-600"><span className="text-stone-400">Services:</span> {serviceLabels}</p>
          <p className="text-stone-600"><span className="text-stone-400">Date:</span> {formatDate(form.date)}{form.time ? ` at ${form.time}` : ''}</p>
          <p className="text-stone-600"><span className="text-stone-400">Group:</span> {form.group_size} {form.group_size === 1 ? 'person' : 'people'}</p>
          {form.preferred_hotel && <p className="text-stone-600"><span className="text-stone-400">Hotel:</span> {form.preferred_hotel}</p>}
          {form.preferred_restaurant && <p className="text-stone-600"><span className="text-stone-400">Restaurant:</span> {form.preferred_restaurant}</p>}
          {form.preferred_beach_club && <p className="text-stone-600"><span className="text-stone-400">Beach Club:</span> {form.preferred_beach_club}</p>}
        </div>
      </div>
    </div>
  );
}

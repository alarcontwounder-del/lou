import React, { useState } from 'react';
import { X, Calendar, Clock, Users, User, Mail, Phone, UtensilsCrossed, AlertCircle, MessageSquare, Check, Loader2, BedDouble } from 'lucide-react';
import axios from 'axios';
import { trackEvent } from '../lib/analytics';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten Free' },
  { id: 'dairy-free', label: 'Dairy Free' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' },
];

const TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];

export const BookingRequestModal = ({ isOpen, onClose, venue, venueType }) => {
  const isHotel = venueType === 'hotel';
  const [status, setStatus] = useState('idle');
  const [form, setForm] = useState({
    guest_name: '', guest_email: '', guest_phone: '', date: '', date_checkout: '', time: '',
    guests: 2, dietary: [], allergies: '', special_requests: ''
  });

  if (!isOpen || !venue) return null;

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDietary = (id) => {
    setForm((prev) => {
      const list = prev.dietary.includes(id)
        ? prev.dietary.filter((d) => d !== id)
        : [...prev.dietary, id];
      return { ...prev, dietary: list };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.guest_name || !form.guest_email || !form.guest_phone || !form.date) return;
    if (!isHotel && !form.time) return;
    setStatus('loading');
    axios.post(BACKEND_URL + '/api/booking-request', {
      venue_name: venue.name,
      venue_type: venueType,
      guest_name: form.guest_name,
      guest_email: form.guest_email,
      guest_phone: form.guest_phone,
      date: form.date,
      date_checkout: isHotel ? form.date_checkout : undefined,
      time: isHotel ? undefined : form.time,
      guests: form.guests,
      dietary: isHotel ? [] : form.dietary,
      allergies: isHotel ? '' : form.allergies,
      special_requests: form.special_requests
    }).then(() => {
      setStatus('success');
      trackEvent('booking_request_submit', { venue: venue.name, venue_type: venueType, guests: form.guests });
    }).catch(() => {
      setStatus('error');
    });
  };

  const today = new Date().toISOString().split('T')[0];

  if (status === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="booking-success-modal">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-[#F5F2EB] rounded-2xl w-full max-w-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-heading text-xl text-stone-900 mb-2">Request Sent!</h3>
          <p className="text-stone-500 text-sm mb-2">Your {isHotel ? 'inquiry' : 'booking request'} for <strong>{venue.name}</strong> has been submitted.</p>
          <p className="text-stone-400 text-xs mb-6">We'll get back to you within 72 hours. Check your email for details.</p>
          <button onClick={onClose} className="w-full bg-brand-charcoal text-white py-3 rounded-full text-sm font-semibold hover:bg-brand-charcoal/90 transition-all" data-testid="booking-success-close">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="booking-request-modal">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#F5F2EB] rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 p-5 pb-3 border-b border-stone-100 flex-shrink-0">
          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
            <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading text-lg text-stone-900 truncate">{venue.name}</h3>
            <p className="text-stone-400 text-xs">{venue.location}</p>
          </div>
          <button onClick={onClose} className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all flex-shrink-0" data-testid="booking-close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 pt-4 overflow-y-auto flex-1 min-h-0 space-y-4">
          {/* Date & Time */}
          {isHotel ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-stone-500 mb-1.5">
                  <Calendar className="w-3 h-3" /> Check-in
                </label>
                <input type="date" required min={today} value={form.date}
                  onChange={function(e) { updateField('date', e.target.value); }}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-slate/30 focus:border-brand-slate outline-none" data-testid="booking-date"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-stone-500 mb-1.5">
                  <Calendar className="w-3 h-3" /> Check-out
                </label>
                <input type="date" min={form.date || today} value={form.date_checkout}
                  onChange={function(e) { updateField('date_checkout', e.target.value); }}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-slate/30 focus:border-brand-slate outline-none" data-testid="booking-date-checkout"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-stone-500 mb-1.5">
                  <Calendar className="w-3 h-3" /> Date
                </label>
                <input type="date" required min={today} value={form.date}
                  onChange={function(e) { updateField('date', e.target.value); }}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-slate/30 focus:border-brand-slate outline-none" data-testid="booking-date"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-stone-500 mb-1.5">
                  <Clock className="w-3 h-3" /> Time
                </label>
                <select required value={form.time}
                  onChange={function(e) { updateField('time', e.target.value); }}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-slate/30 focus:border-brand-slate outline-none bg-white" data-testid="booking-time"
                >
                  <option value="">Select</option>
                  {TIME_SLOTS.map(function(t) { return <option key={t} value={t}>{t}</option>; })}
                </select>
              </div>
            </div>
          )}

          {/* Guests */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-stone-500 mb-1.5">
              {isHotel ? <BedDouble className="w-3 h-3" /> : <Users className="w-3 h-3" />} {isHotel ? 'Number of Guests' : 'Number of Guests'}
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(function(n) {
                return (
                  <button key={n} type="button" onClick={function() { updateField('guests', n); }}
                    className={'w-9 h-9 rounded-lg text-sm font-medium transition-all ' + (form.guests === n ? 'bg-brand-charcoal text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200')}
                    data-testid={'booking-guests-' + n}
                  >{n}</button>
                );
              })}
              <span className="text-stone-400 text-xs">+</span>
            </div>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-stone-500 mb-1.5">
                <User className="w-3 h-3" /> Full Name
              </label>
              <input type="text" required value={form.guest_name} placeholder="John Smith"
                onChange={function(e) { updateField('guest_name', e.target.value); }}
                className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-slate/30 focus:border-brand-slate outline-none" data-testid="booking-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-stone-500 mb-1.5">
                  <Mail className="w-3 h-3" /> Email
                </label>
                <input type="email" required value={form.guest_email} placeholder="email@example.com"
                  onChange={function(e) { updateField('guest_email', e.target.value); }}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-slate/30 focus:border-brand-slate outline-none" data-testid="booking-email"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-stone-500 mb-1.5">
                  <Phone className="w-3 h-3" /> Phone
                </label>
                <input type="tel" required value={form.guest_phone} placeholder="+34 612 345 678"
                  onChange={function(e) { updateField('guest_phone', e.target.value); }}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-slate/30 focus:border-brand-slate outline-none" data-testid="booking-phone"
                />
              </div>
            </div>
          </div>

          {/* Dietary - only for dining */}
          {!isHotel && (
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-stone-500 mb-2">
              <UtensilsCrossed className="w-3 h-3" /> Dietary Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map(function(opt) {
                var selected = form.dietary.includes(opt.id);
                return (
                  <button key={opt.id} type="button" onClick={function() { toggleDietary(opt.id); }}
                    className={'px-3 py-1.5 rounded-full text-xs font-medium transition-all border ' + (selected ? 'bg-brand-charcoal text-white border-brand-charcoal' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300')}
                    data-testid={'dietary-' + opt.id}
                  >{opt.label}</button>
                );
              })}
            </div>
          </div>
          )}

          {/* Allergies - only for dining */}
          {!isHotel && (
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-stone-500 mb-1.5">
              <AlertCircle className="w-3 h-3" /> Allergies
            </label>
            <input type="text" value={form.allergies} placeholder="e.g., nuts, shellfish, lactose..."
              onChange={function(e) { updateField('allergies', e.target.value); }}
              className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-slate/30 focus:border-brand-slate outline-none" data-testid="booking-allergies"
            />
          </div>
          )}

          {/* Special Requests */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-stone-500 mb-1.5">
              <MessageSquare className="w-3 h-3" /> {isHotel ? 'Message / Special Requests' : 'Special Requests'}
            </label>
            <textarea value={form.special_requests} placeholder={isHotel ? 'Room type preferences, airport transfer, special occasions...' : 'Birthday celebration, outdoor seating, high chair...'}
              onChange={function(e) { updateField('special_requests', e.target.value); }}
              rows={2}
              className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-slate/30 focus:border-brand-slate outline-none resize-none" data-testid="booking-special"
            />
          </div>

          {/* Disclaimer */}
          <p className="text-[10px] text-stone-400 leading-relaxed">
            {isHotel
              ? 'Availability is subject to confirmation. We will get back to you within 72 hours, often sooner. By submitting, you agree to our terms.'
              : 'Bookings are subject to the restaurant\'s availability. We will confirm your reservation within 72 hours, often sooner. By submitting, you agree to our terms.'}
          </p>

          {/* Error */}
          {status === 'error' && (
            <p className="text-red-500 text-xs text-center">Something went wrong. Please try again.</p>
          )}

          {/* Submit */}
          <button type="submit" disabled={status === 'loading'}
            className="w-full flex items-center justify-center gap-2 bg-brand-charcoal text-white py-3 rounded-full text-sm font-semibold hover:bg-brand-charcoal/90 transition-all disabled:opacity-60"
            data-testid="booking-submit"
          >
            {status === 'loading' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
            ) : (
              isHotel ? 'Send Inquiry' : 'Request Reservation'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingRequestModal;

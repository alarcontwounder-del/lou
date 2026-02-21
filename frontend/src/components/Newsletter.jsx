import React, { useState } from 'react';
import { Mail, User, Globe, ArrowRight, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Country list
const countries = [
  'Germany', 'UK', 'US', 'Italy', 'France', 'Sweden', 'Norway', 
  'Switzerland', 'Spain', 'Netherlands', 'Belgium', 'Austria', 
  'Denmark', 'Finland', 'Ireland', 'Portugal', 'Other'
];

export const Newsletter = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    country: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.name || !formData.country) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(`${BACKEND_URL}/api/newsletter`, formData);
      
      // Success toast
      toast.success('Welcome to the club! Check your email for exclusive deals.', {
        duration: 5000,
        icon: <CheckCircle className="w-5 h-5 text-emerald-600" />
      });

      // Reset form
      setFormData({ email: '', name: '', country: '' });
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('This email is already subscribed!');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      
      <section className="py-20 relative overflow-hidden" data-testid="newsletter-section">
        {/* Premium Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600"></div>
        
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Header */}
            <div className="mb-10">
              <h2 className="font-heading text-4xl md:text-5xl text-white mb-4 leading-tight">
                Join 5,000+ Golfers Receiving Premium Course Deals
              </h2>
              <p className="text-white/90 text-lg md:text-xl">
                Exclusive tee times, insider tips, and special offers delivered to your inbox.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 md:p-10 shadow-2xl">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Name Field */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all text-stone-700 placeholder-stone-400"
                    data-testid="newsletter-name"
                    required
                  />
                </div>

                {/* Email Field */}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all text-stone-700 placeholder-stone-400"
                    data-testid="newsletter-email"
                    required
                  />
                </div>
              </div>

              {/* Country Dropdown */}
              <div className="relative mb-6">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none z-10" />
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all text-stone-700 appearance-none bg-white cursor-pointer"
                  data-testid="newsletter-country"
                  required
                >
                  <option value="">Select Your Country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-stone-800 hover:bg-stone-900 text-white font-semibold text-base px-6 py-4 rounded-full transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
                data-testid="newsletter-submit"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <>
                    <span>Get Exclusive Deals</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Trust Badge */}
              <p className="text-stone-500 text-sm mt-6">
                🔒 Your privacy is protected. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Send, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (value) => {
    setFormData((prev) => ({ ...prev, country: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/contact`, {
        ...formData,
        inquiry_type: 'general',
      });
      setSuccess(true);
      toast.success(t('contact.success'));
      setFormData({ name: '', email: '', phone: '', country: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const countries = [
    { value: 'germany', label: t('contact.countries.germany') },
    { value: 'sweden', label: t('contact.countries.sweden') },
    { value: 'switzerland', label: t('contact.countries.switzerland') },
    { value: 'uk', label: t('contact.countries.uk') },
    { value: 'france', label: t('contact.countries.france') },
    { value: 'other', label: t('contact.countries.other') },
  ];

  return (
    <section id="contact" className="section-padding bg-white" data-testid="contact-section">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Side - Form */}
          <div>
            <p className="text-brand-terracotta text-sm uppercase tracking-[0.2em] mb-4" data-testid="contact-subtitle">
              {t('contact.subtitle')}
            </p>
            <h2 className="font-heading text-4xl md:text-5xl text-stone-900 mb-6" data-testid="contact-title">
              {t('contact.title')}
            </h2>
            <p className="text-stone-600 mb-10" data-testid="contact-description">
              {t('contact.description')}
            </p>

            {success ? (
              <div className="bg-brand-green/5 border border-brand-green/20 rounded-sm p-8 text-center" data-testid="contact-success">
                <CheckCircle className="w-12 h-12 text-brand-green mx-auto mb-4" />
                <p className="text-lg font-medium text-brand-green">{t('contact.success')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                <div className="grid sm:grid-cols-2 gap-6">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('contact.name')}
                    required
                    className="input-underline"
                    data-testid="contact-name"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('contact.email')}
                    required
                    className="input-underline"
                    data-testid="contact-email"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t('contact.phone')}
                    className="input-underline"
                    data-testid="contact-phone"
                  />
                  <Select onValueChange={handleCountryChange} value={formData.country}>
                    <SelectTrigger
                      className="input-underline border-0 border-b border-stone-300 rounded-none px-0 focus:ring-0"
                      data-testid="contact-country"
                    >
                      <SelectValue placeholder={t('contact.country')} />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t('contact.message')}
                  required
                  rows={4}
                  className="input-underline resize-none"
                  data-testid="contact-message"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
                  data-testid="contact-submit"
                >
                  {loading ? (
                    <span>...</span>
                  ) : (
                    <>
                      {t('contact.send')}
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Side - Contact Info & Image */}
          <div>
            <div className="relative mb-12">
              <div className="aspect-[4/3] img-zoom overflow-hidden rounded-sm shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800"
                  alt="Golf course in Mallorca"
                  className="w-full h-full object-cover"
                  data-testid="contact-image"
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-brand-terracotta/10 -z-10 rounded-sm" />
            </div>

            {/* Contact Info */}
            <div className="space-y-6 bg-brand-cream/50 p-8 rounded-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-green/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-brand-green" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-stone-400 mb-1">Phone</p>
                  <p className="text-stone-900 font-medium">+34 620 987 575</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-green/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-brand-green" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-stone-400 mb-1">Email</p>
                  <p className="text-stone-900 font-medium">Contact@golfinmallorca.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-green/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-brand-green" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-stone-400 mb-1">Address</p>
                  <p className="text-stone-900 font-medium">Palma de Mallorca, IB, Spain</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

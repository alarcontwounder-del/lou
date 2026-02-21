import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Instagram, Facebook, Linkedin, Twitter } from 'lucide-react';

export const Footer = () => {
  const { t } = useLanguage();

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-green text-white py-16" data-testid="footer">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <h3 className="font-heading text-3xl mb-4">Golf in Mallorca</h3>
            <p className="text-white/70 max-w-md mb-6">
              The leading golf agency in Mallorca since 2003. Only exclusive operator based on the island specializing in all types of golf services.
            </p>
            {/* Social Links - To be added later */}
            <p className="text-white/50 text-sm">
              Website: <a href="https://golfinmallorca.com" target="_blank" rel="noopener noreferrer" className="text-brand-sand hover:text-white transition-colors">golfinmallorca.com</a>
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium text-lg mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection('hero')}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {t('nav.home')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('courses')}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {t('nav.courses')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('hotels')}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {t('offers.hotels')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('restaurants')}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {t('restaurants.subtitle')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {t('nav.contact')}
                </button>
              </li>
              <li>
                <a
                  href="https://golfinmallorca.greenfee365.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-sand hover:text-white transition-colors font-medium"
                >
                  {t('hero.bookTeeTime')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-medium text-lg mb-4">{t('footer.contactInfo')}</h4>
            <ul className="space-y-3 text-white/70">
              <li>+34 620 987 575</li>
              <li>Contact@golfinmallorca.com</li>
              <li>Palma de Mallorca, IB, Spain</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-sm">
            © {currentYear} Golf in Mallorca. {t('footer.rights')}
          </p>
          <div className="flex gap-6 text-sm text-white/50">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

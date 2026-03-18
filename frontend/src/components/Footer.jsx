import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Instagram, Facebook } from 'lucide-react';

export const Footer = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (id) => {
    if (location.pathname === '/' || location.pathname === '') {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/', { state: { scrollTo: id } });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-charcoal text-white py-16" data-testid="footer">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <p className="text-white/70 max-w-md mb-6">
              The leading golf agency in Mallorca since 2003. Only exclusive operator based on the island specializing in all types of golf services.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4 mb-6">
              <a 
                href="https://www.facebook.com/golfinmallorca" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors group"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-white/80 group-hover:text-white" />
              </a>
              <a 
                href="https://www.instagram.com/golfinmallorca" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors group"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-white/80 group-hover:text-white" />
              </a>
            </div>
            {/* Partner Logo */}
            <div className="flex items-center gap-6 flex-wrap">
              <img 
                src="https://customer-assets.emergentagent.com/job_3acbb158-2abd-4ba8-b269-c69139d59c32/artifacts/agyb9uib_Logo_Illes_Balears_Sostenibles%20copy.png"
                alt="Illes Balears Sostenibles"
                className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity mix-blend-screen"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium text-lg mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3">
              <li>
                <button onClick={() => scrollToSection('hero')} className="text-white/70 hover:text-white transition-colors">
                  {t('nav.home')}
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('courses')} className="text-white/70 hover:text-white transition-colors">
                  {t('nav.courses')}
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('hotels')} className="text-white/70 hover:text-white transition-colors">
                  {t('offers.hotels')}
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('restaurants')} className="text-white/70 hover:text-white transition-colors">
                  {t('restaurants.subtitle')}
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('contact')} className="text-white/70 hover:text-white transition-colors">
                  {t('nav.contact')}
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-medium text-lg mb-4">Services</h4>
            <ul className="space-y-3">
              <li>
                <a href="https://golfinmallorca.greenfee365.com" target="_blank" rel="noopener noreferrer" className="text-brand-slate hover:text-white transition-colors font-medium">
                  {t('hero.bookTeeTime')}
                </a>
              </li>
              <li>
                <Link to="/book-tee-times" className="text-white/70 hover:text-white transition-colors">
                  Book Tee Times Mallorca
                </Link>
              </li>
              <li>
                <Link to="/golf-holidays-mallorca" className="text-white/70 hover:text-white transition-colors">
                  Golf Holiday Packages
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-medium text-lg mb-4">{t('footer.contactInfo')}</h4>
            <ul className="space-y-3 text-white/70">
              <li>+34 620 987 575</li>
              <li>contact@golfinmallorca.com</li>
              <li>Palma de Mallorca, IB, Spain</li>
              <li className="pt-2">
                <span className="text-white/50">Website: </span>
                <a href="https://golfinmallorca.com" target="_blank" rel="noopener noreferrer" className="text-brand-slate hover:text-white transition-colors">golfinmallorca.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-sm">
            © {currentYear} Golfinmallorca.com. {t('footer.rights')}
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

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
                href="https://www.facebook.com/share/1CZVVBc8e9/?mibextid=wwXIfr" 
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
                data-testid="footer-instagram-link"
              >
                <Instagram className="w-5 h-5 text-white/80 group-hover:text-white" />
              </a>
              <a 
                href="https://x.com/Golfinmallorca" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors group"
                aria-label="X (Twitter)"
                data-testid="footer-x-link"
              >
                <svg className="w-5 h-5 text-white/80 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
            {/* Partner Logos */}
            <div className="flex items-center gap-4 flex-wrap">
              <a href="https://illessostenibles.travel/ca" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://customer-assets.emergentagent.com/job_3acbb158-2abd-4ba8-b269-c69139d59c32/artifacts/agyb9uib_Logo_Illes_Balears_Sostenibles%20copy.png"
                  alt="Illes Balears Sostenibles"
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity mix-blend-screen"
                />
              </a>
              <a href="https://www.savethemed.org/" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://customer-assets.emergentagent.com/job_f4355d4a-db43-4988-9dcb-e470aa2aecb0/artifacts/rlajf01p_logo-save-the-med.png"
                  alt="Save the Med Foundation"
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity mix-blend-screen"
                  style={{ filter: 'grayscale(1) brightness(1.3)' }}
                />
              </a>
            </div>
          </div>

          {/* Quick Links + Services */}
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

            <h4 className="font-medium text-lg mb-4 mt-8">Services</h4>
            <ul className="space-y-3">
              <li>
                <a href="https://golfinmallorca.greenfee365.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
                  {t('hero.bookTeeTime')}!
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

          {/* Other Destinations */}
          <div data-testid="footer-other-destinations">
            <h4 className="font-medium text-lg mb-4">Other Destinations</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://golfgatecatalunya.es"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                  data-testid="footer-link-golfgatecatalunya"
                >
                  golfgatecatalunya.es
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white/35">teetimescancun.net</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-white/30 bg-white/8 px-2 py-0.5 rounded-full">Coming soon</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white/35">teetimespuntacana.com</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-white/30 bg-white/8 px-2 py-0.5 rounded-full">Coming soon</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-medium text-lg mb-4">{t('footer.contactInfo')}</h4>
            <ul className="space-y-3 text-white/70">
              <li><a href="tel:+34620987575" className="hover:text-white transition-colors">+34 620 987 575</a></li>
              <li><a href="mailto:contact@golfinmallorca.com" className="hover:text-white transition-colors">contact@golfinmallorca.com</a></li>
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
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

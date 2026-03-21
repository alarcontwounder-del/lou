import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Menu, X, ChevronDown, Settings, Search } from 'lucide-react';
import { WeatherBadge } from './WeatherBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const languages = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'de', label: 'DE', flag: '🇩🇪' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'se', label: 'SE', flag: '🇸🇪' },
];

export const Navbar = ({ onAdminClick, isAuthenticated, isCheckingAuth, onSearchClick, onPlanTrip, variant }) => {
  const isLight = variant === 'light';
  const { language, changeLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLight) return; // No scroll behavior on light variant
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Navbar is only visible in the hero area (first ~80px)
      if (currentScrollY < 80) {
        setIsVisible(true);
        setIsScrolled(false);
      } else {
        setIsVisible(false);
        setIsScrolled(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLight]);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/' || location.pathname === '') {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to homepage and pass the target section via state
      navigate('/', { state: { scrollTo: id } });
    }
  };

  const currentLang = languages.find(l => l.code === language);

  return (
    <nav
      data-testid="navbar"
      className={`${isLight ? 'relative' : 'fixed'} top-0 left-0 right-0 z-50 transition-[transform,opacity] duration-200 ease-out ${
        isLight ? 'bg-brand-cream' :
        isVisible ? 'translate-y-0 opacity-100 bg-transparent overflow-visible' : '-translate-y-full opacity-0 pointer-events-none bg-transparent overflow-hidden'
      } py-2`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo - links to homepage on course pages, booking site on homepage */}
        <a
          href={isLight ? '/' : 'https://golfinmallorca.greenfee365.com'}
          target={isLight ? '_self' : '_blank'}
          rel={isLight ? undefined : 'noopener noreferrer'}
          className="transition-all duration-300 flex-shrink-0"
          data-testid="logo"
        >
          <img 
            src="https://customer-assets.emergentagent.com/job_9bf3074f-8ae7-4117-9cd1-ef20d6439f53/artifacts/f3ma6byf_2.png"
            alt="Golf in Mallorca Spain"
            className={`${isLight ? 'h-24 sm:h-28' : 'h-32 sm:h-36 md:h-44'} w-auto object-contain transition-all duration-300 ${isLight ? '' : 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]'}`}
            style={isLight ? {} : { filter: 'brightness(0) invert(1) drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}
          />
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          <button
            onClick={() => scrollToSection('courses')}
            className={`text-sm font-medium transition-colors duration-300 whitespace-nowrap drop-shadow-sm ${
              isLight ? 'text-stone-600 hover:text-stone-900' : isScrolled ? 'text-stone-600 hover:text-stone-900' : 'text-white hover:text-white/80'
            }`}
            data-testid="nav-courses"
          >
            Golf Courses
          </button>
          <button
            onClick={() => scrollToSection('hotels')}
            className={`text-sm font-medium transition-colors duration-300 whitespace-nowrap drop-shadow-sm ${
              isLight ? 'text-stone-600 hover:text-stone-900' : isScrolled ? 'text-stone-600 hover:text-stone-900' : 'text-white hover:text-white/80'
            }`}
            data-testid="nav-hotels"
          >
            Hotels
          </button>
          <button
            onClick={() => scrollToSection('restaurants')}
            className={`text-sm font-medium transition-colors duration-300 whitespace-nowrap drop-shadow-sm ${
              isLight ? 'text-stone-600 hover:text-stone-900' : isScrolled ? 'text-stone-600 hover:text-stone-900' : 'text-white hover:text-white/80'
            }`}
            data-testid="nav-restaurants"
          >
            Restaurants
          </button>
          <button
            onClick={() => scrollToSection('cafes-bars')}
            className={`text-sm font-medium transition-colors duration-300 whitespace-nowrap drop-shadow-sm ${
              isScrolled || isLight ? 'text-stone-600 hover:text-stone-900' : 'text-white hover:text-white/80'
            }`}
            data-testid="nav-cafes-bars"
          >
            Cafés & Bars
          </button>
          <button
            onClick={() => scrollToSection('beach-clubs')}
            className={`text-sm font-medium transition-colors duration-300 whitespace-nowrap drop-shadow-sm ${
              isScrolled || isLight ? 'text-stone-600 hover:text-stone-900' : 'text-white hover:text-white/80'
            }`}
            data-testid="nav-beach-clubs"
          >
            Beach Clubs
          </button>
          
          {/* Separator - more visible */}
          <span className={`hidden lg:block w-0.5 h-5 rounded-full ${isScrolled || isLight ? 'bg-stone-400' : 'bg-white/70'}`}></span>
          
          {onPlanTrip && (
            <button
              onClick={() => { setMobileMenuOpen(false); onPlanTrip(); }}
              className={`text-sm font-semibold transition-colors duration-300 whitespace-nowrap drop-shadow-sm ${
                isScrolled || isLight ? 'text-brand-charcoal hover:text-brand-slate' : 'text-white hover:text-white/80'
              }`}
              data-testid="nav-plan-trip"
            >
              Trip Planner
            </button>
          )}

          <button
            onClick={() => scrollToSection('reviews')}
            className={`text-sm font-medium transition-colors duration-300 whitespace-nowrap drop-shadow-sm ${
              isScrolled || isLight ? 'text-stone-600 hover:text-stone-900' : 'text-white hover:text-white/80'
            }`}
            data-testid="nav-reviews"
          >
            Reviews
          </button>
          <button
            onClick={() => scrollToSection('blog')}
            className={`text-sm font-medium transition-colors duration-300 whitespace-nowrap drop-shadow-sm ${
              isScrolled || isLight ? 'text-stone-600 hover:text-stone-900' : 'text-white hover:text-white/80'
            }`}
            data-testid="nav-blog"
          >
            Blog
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className={`text-base font-medium transition-colors duration-300 drop-shadow-sm ${
              isScrolled || isLight ? 'text-stone-600 hover:text-stone-900' : 'text-white hover:text-white/80'
            }`}
            data-testid="nav-contact"
          >
            {t('nav.contact')}
          </button>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-colors duration-300 text-sm ${
                isScrolled
                  ? 'border-stone-200 text-stone-700 hover:border-brand-slate'
                  : 'border-white/50 text-white hover:border-white'
              }`}
              data-testid="language-selector"
            >
              <span className="text-sm font-semibold">{currentLang?.label}</span>
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`cursor-pointer ${language === lang.code ? 'bg-brand-slate/20' : ''}`}
                  data-testid={`lang-${lang.code}`}
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Weather Badge */}
          <WeatherBadge isScrolled={isScrolled} />

          {/* Admin Button */}
          {!isCheckingAuth && (
            <button
              onClick={onAdminClick}
              className={`p-2.5 rounded-full transition-colors duration-300 ${
                isScrolled
                  ? 'text-stone-500 hover:text-brand-slate hover:bg-stone-100'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title={isAuthenticated ? 'Admin Dashboard' : 'Admin Login'}
              data-testid="admin-btn"
            >
              <Settings className={`w-6 h-6 ${isAuthenticated ? 'text-brand-slate' : ''}`} />
            </button>
          )}

          {/* Search Button in Navbar */}
          {onSearchClick && (
            <button
              onClick={onSearchClick}
              className={`p-2.5 rounded-full transition-colors duration-300 ${
                isScrolled
                  ? 'text-stone-500 hover:text-brand-slate hover:bg-stone-100'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Search"
              data-testid="navbar-search-btn"
            >
              <Search className="w-6 h-6" />
            </button>
          )}

        </div>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden p-2 ${isScrolled ? 'text-brand-charcoal' : 'text-white'}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="mobile-menu-btn"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg py-6 px-6 animate-slide-in-right"
          data-testid="mobile-menu"
        >
          <div className="flex flex-col gap-4">
            <button
              onClick={() => scrollToSection('courses')}
              className="text-left py-2 text-stone-700 hover:text-brand-slate font-medium"
            >
              Golf Courses
            </button>
            <button
              onClick={() => scrollToSection('hotels')}
              className="text-left py-2 text-stone-700 hover:text-brand-slate font-medium"
            >
              Hotels
            </button>
            <button
              onClick={() => scrollToSection('restaurants')}
              className="text-left py-2 text-stone-700 hover:text-brand-slate font-medium"
            >
              Restaurants
            </button>
            <button
              onClick={() => scrollToSection('cafes-bars')}
              className="text-left py-2 text-stone-700 hover:text-brand-slate font-medium"
            >
              Cafés & Bars
            </button>
            <button
              onClick={() => scrollToSection('beach-clubs')}
              className="text-left py-2 text-stone-700 hover:text-brand-slate font-medium"
            >
              Beach Clubs
            </button>
            
            <div className="border-t border-stone-100 my-2"></div>
            
            {onPlanTrip && (
              <button
                onClick={() => { setMobileMenuOpen(false); onPlanTrip(); }}
                className="text-left py-2 text-brand-charcoal hover:text-brand-slate font-semibold"
                data-testid="mobile-nav-plan-trip"
              >
                Trip Planner
              </button>
            )}
            <button
              onClick={() => scrollToSection('reviews')}
              className="text-left py-2 text-stone-700 hover:text-brand-slate font-medium"
            >
              Reviews
            </button>
            <button
              onClick={() => scrollToSection('blog')}
              className="text-left py-2 text-stone-700 hover:text-brand-slate font-medium"
            >
              Blog
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-left py-2 text-stone-700 hover:text-brand-slate font-medium"
            >
              Contact
            </button>
            
            {/* Mobile Language Selector */}
            <div className="flex gap-2 py-2 border-t border-stone-100 mt-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    language === lang.code
                      ? 'bg-brand-charcoal text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Admin Button - Mobile */}
            {!isCheckingAuth && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onAdminClick();
                }}
                className="flex items-center gap-2 text-left py-2 text-stone-700 hover:text-brand-slate font-medium border-t border-stone-100 mt-2 pt-4"
              >
                <Settings className={`w-5 h-5 ${isAuthenticated ? "text-brand-slate" : ""}`} />
                {isAuthenticated ? "Admin Dashboard" : "Admin Login"}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

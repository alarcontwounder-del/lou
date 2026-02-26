import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Menu, X, ChevronDown, Settings } from 'lucide-react';
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

export const Navbar = ({ onAdminClick, isAuthenticated, isCheckingAuth }) => {
  const { language, changeLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const currentLang = languages.find(l => l.code === language);

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <a
          href="#hero"
          onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}
          className="transition-all duration-300"
          data-testid="logo"
        >
          <img 
            src="https://customer-assets.emergentagent.com/job_9bf3074f-8ae7-4117-9cd1-ef20d6439f53/artifacts/f3ma6byf_2.png"
            alt="Golf in Mallorca Spain"
            className="h-28 md:h-32 w-auto object-contain transition-all duration-300"
            style={{ filter: 'brightness(0) invert(1) brightness(0.25)' }}
          />
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => scrollToSection('courses')}
            className={`text-sm font-medium transition-colors duration-300 ${
              isScrolled ? 'text-stone-700 hover:text-brand-slate' : 'text-white hover:text-white/80'
            }`}
            data-testid="nav-courses"
          >
            {t('nav.courses')}
          </button>
          <button
            onClick={() => scrollToSection('hotels')}
            className={`text-sm font-medium transition-colors duration-300 ${
              isScrolled ? 'text-stone-700 hover:text-brand-slate' : 'text-white hover:text-white/80'
            }`}
            data-testid="nav-hotels"
          >
            {t('offers.hotels')}
          </button>
          <button
            onClick={() => scrollToSection('restaurants')}
            className={`text-sm font-medium transition-colors duration-300 ${
              isScrolled ? 'text-stone-700 hover:text-brand-slate' : 'text-white hover:text-white/80'
            }`}
            data-testid="nav-restaurants"
          >
            {t('restaurants.subtitle')}
          </button>
          <button
            onClick={() => scrollToSection('reviews')}
            className={`text-sm font-medium transition-colors duration-300 ${
              isScrolled ? 'text-stone-700 hover:text-brand-slate' : 'text-white hover:text-white/80'
            }`}
            data-testid="nav-reviews"
          >
            {t('reviews.subtitle')}
          </button>
          <button
            onClick={() => scrollToSection('blog')}
            className={`text-sm font-medium transition-colors duration-300 ${
              isScrolled ? 'text-stone-700 hover:text-brand-slate' : 'text-white hover:text-white/80'
            }`}
            data-testid="nav-blog"
          >
            {t('blog.subtitle')}
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className={`text-sm font-medium transition-colors duration-300 ${
              isScrolled ? 'text-stone-700 hover:text-brand-slate' : 'text-white hover:text-white/80'
            }`}
            data-testid="nav-contact"
          >
            {t('nav.contact')}
          </button>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`flex items-center gap-1 px-3 py-2 rounded-full border transition-colors duration-300 ${
                isScrolled
                  ? 'border-stone-200 text-stone-700 hover:border-brand-slate'
                  : 'border-white/30 text-white hover:border-white'
              }`}
              data-testid="language-selector"
            >
              <span className="text-sm font-medium">{currentLang?.label}</span>
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

          {/* Admin Button */}
          {!isCheckingAuth && (
            <button
              onClick={onAdminClick}
              className={`p-2 rounded-full transition-colors duration-300 ${
                isScrolled
                  ? 'text-stone-500 hover:text-brand-slate hover:bg-stone-100'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title={isAuthenticated ? 'Admin Dashboard' : 'Admin Login'}
              data-testid="admin-btn"
            >
              <Settings className={`w-5 h-5 ${isAuthenticated ? 'text-brand-slate' : ''}`} />
            </button>
          )}

          {/* Book CTA */}
          <a
            href="https://golfinmallorca.greenfee365.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm"
            data-testid="nav-book-btn"
          >
            {t('nav.book')}
          </a>
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
              {t('nav.courses')}
            </button>
            <button
              onClick={() => scrollToSection('hotels')}
              className="text-left py-2 text-stone-700 hover:text-brand-slate font-medium"
            >
              {t('offers.hotels')}
            </button>
            <button
              onClick={() => scrollToSection('restaurants')}
              className="text-left py-2 text-stone-700 hover:text-brand-slate font-medium"
            >
              {t('restaurants.subtitle')}
            </button>
            <button
              onClick={() => scrollToSection('reviews')}
              className="text-left py-2 text-stone-700 hover:text-brand-slate font-medium"
            >
              {t('reviews.subtitle')}
            </button>
            <button
              onClick={() => scrollToSection('blog')}
              className="text-left py-2 text-stone-700 hover:text-brand-slate font-medium"
            >
              {t('blog.subtitle')}
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-left py-2 text-stone-700 hover:text-brand-slate font-medium"
            >
              {t('nav.contact')}
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


            <a
              href="https://golfinmallorca.greenfee365.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-2 text-center"
            >
              {t('nav.book')}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

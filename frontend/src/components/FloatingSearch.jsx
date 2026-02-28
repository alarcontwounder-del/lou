import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Star, Coffee, Utensils, Hotel, Palmtree, Flag, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const categoryIcons = {
  all: Search,
  golf: Flag,
  hotel: Hotel,
  restaurant: Utensils,
  cafe_bar: Coffee,
  beach_club: Palmtree,
};

const categoryLabels = {
  en: {
    all: 'All Categories',
    golf: 'Golf Courses',
    hotel: 'Hotels',
    restaurant: 'Restaurants',
    cafe_bar: 'Cafés & Bars',
    beach_club: 'Beach Clubs',
  },
  de: {
    all: 'Alle Kategorien',
    golf: 'Golfplätze',
    hotel: 'Hotels',
    restaurant: 'Restaurants',
    cafe_bar: 'Cafés & Bars',
    beach_club: 'Beach Clubs',
  },
  fr: {
    all: 'Toutes catégories',
    golf: 'Parcours de Golf',
    hotel: 'Hôtels',
    restaurant: 'Restaurants',
    cafe_bar: 'Cafés & Bars',
    beach_club: 'Beach Clubs',
  },
  se: {
    all: 'Alla kategorier',
    golf: 'Golfbanor',
    hotel: 'Hotell',
    restaurant: 'Restauranger',
    cafe_bar: 'Kaféer & Barer',
    beach_club: 'Strandklubbar',
  }
};

const searchPlaceholders = {
  en: 'Search golf, hotels, restaurants...',
  de: 'Golf, Hotels, Restaurants suchen...',
  fr: 'Rechercher golf, hôtels, restaurants...',
  se: 'Sök golf, hotell, restauranger...'
};

const categoryColors = {
  golf: 'bg-green-100 text-green-700 border-green-200',
  hotel: 'bg-blue-100 text-blue-700 border-blue-200',
  restaurant: 'bg-orange-100 text-orange-700 border-orange-200',
  cafe_bar: 'bg-amber-100 text-amber-700 border-amber-200',
  beach_club: 'bg-cyan-100 text-cyan-700 border-cyan-200',
};

export const FloatingSearch = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const { language } = useLanguage();

  const labels = categoryLabels[language] || categoryLabels.en;
  const placeholder = searchPlaceholders[language] || searchPlaceholders.en;

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsExpanded(false);
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
        setShowDropdown(false);
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const handleSearchClick = () => {
    setIsExpanded(true);
  };

  const handleCategorySelect = (category) => {
    setActiveCategory(category);
    setShowDropdown(false);
  };

  const ActiveIcon = categoryIcons[activeCategory];

  return (
    <>
      {/* Floating Search Button - Always visible when not expanded */}
      {!isExpanded && (
        <button
          onClick={handleSearchClick}
          data-testid="floating-search-button"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-5 py-3 
                     bg-gradient-to-r from-stone-800 to-stone-700 text-white 
                     rounded-full shadow-lg hover:shadow-xl transition-all duration-300 
                     hover:scale-105 group"
        >
          <Search className="w-5 h-5" />
          <span className="font-medium hidden sm:inline">Search</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
        </button>
      )}

      {/* Expanded Floating Search Bar */}
      {isExpanded && (
        <div 
          ref={searchRef}
          data-testid="floating-search-expanded"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-slide-up">
            {/* Search Input Row */}
            <div className="flex items-center gap-2 p-3 border-b border-stone-100">
              {/* Category Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  data-testid="category-dropdown-button"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    activeCategory !== 'all' 
                      ? categoryColors[activeCategory] || 'bg-stone-100 text-stone-700 border-stone-200'
                      : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  <ActiveIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{labels[activeCategory]}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Category Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden min-w-48 z-10">
                    {Object.entries(labels).map(([key, label]) => {
                      const Icon = categoryIcons[key];
                      return (
                        <button
                          key={key}
                          onClick={() => handleCategorySelect(key)}
                          data-testid={`category-option-${key}`}
                          className={`flex items-center gap-3 w-full px-4 py-3 text-sm text-left transition-colors ${
                            activeCategory === key 
                              ? 'bg-stone-100 text-stone-900 font-medium' 
                              : 'text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder={placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="search-input"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-stone-50 border border-stone-200 
                           text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 
                           focus:ring-amber-500 focus:border-transparent text-sm"
                  autoFocus
                />
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsExpanded(false)}
                data-testid="close-search-button"
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Category Tags */}
            <div className="flex items-center gap-2 p-3 bg-stone-50 overflow-x-auto">
              <span className="text-xs text-stone-500 whitespace-nowrap">Quick:</span>
              {Object.entries(labels).filter(([key]) => key !== 'all').map(([key, label]) => {
                const Icon = categoryIcons[key];
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveCategory(key);
                      setSearchQuery('');
                    }}
                    data-testid={`quick-category-${key}`}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium 
                              whitespace-nowrap transition-all border ${
                      activeCategory === key 
                        ? 'bg-stone-800 text-white border-stone-800' 
                        : `${categoryColors[key]} hover:opacity-80`
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Mockup Notice */}
            <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 flex items-center justify-between">
              <span className="text-xs text-amber-700">
                <span className="font-semibold">MOCKUP</span> - This is a preview of the search feature
              </span>
              <span className="text-xs text-amber-600">
                Press <kbd className="px-1.5 py-0.5 bg-amber-100 rounded text-[10px] font-mono">ESC</kbd> to close
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default FloatingSearch;

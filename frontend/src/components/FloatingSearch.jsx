import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Search, X, ChevronDown, Flag, Hotel, Utensils, Coffee, Palmtree } from 'lucide-react';
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
    all: 'All',
    golf: 'Golf',
    hotel: 'Hotels',
    restaurant: 'Restaurants',
    cafe_bar: 'Cafés',
    beach_club: 'Beach Clubs',
  },
  de: {
    all: 'Alle',
    golf: 'Golf',
    hotel: 'Hotels',
    restaurant: 'Restaurants',
    cafe_bar: 'Cafés',
    beach_club: 'Beach Clubs',
  },
  fr: {
    all: 'Tout',
    golf: 'Golf',
    hotel: 'Hôtels',
    restaurant: 'Restaurants',
    cafe_bar: 'Cafés',
    beach_club: 'Beach Clubs',
  },
  se: {
    all: 'Alla',
    golf: 'Golf',
    hotel: 'Hotell',
    restaurant: 'Restauranger',
    cafe_bar: 'Kaféer',
    beach_club: 'Strandklubbar',
  }
};

const searchPlaceholders = {
  en: 'Search venues...',
  de: 'Suchen...',
  fr: 'Rechercher...',
  se: 'Sök...'
};

export const FloatingSearch = forwardRef(({ showButton = true }, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const { language } = useLanguage();

  const labels = categoryLabels[language] || categoryLabels.en;
  const placeholder = searchPlaceholders[language] || searchPlaceholders.en;

  // Expose open method to parent
  useImperativeHandle(ref, () => ({
    open: () => setIsExpanded(true),
    close: () => setIsExpanded(false),
    toggle: () => setIsExpanded(prev => !prev)
  }));

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
      {/* Floating Search Button - Only show if showButton is true */}
      {showButton && !isExpanded && (
        <button
          onClick={handleSearchClick}
          data-testid="floating-search-button"
          className="fixed top-1/2 -translate-y-1/2 right-6 z-40 w-12 h-12 flex items-center justify-center
                     bg-stone-800 text-white rounded-full shadow-lg 
                     hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Search className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full" />
        </button>
      )}

      {/* Expanded Floating Search Bar - Drops down from navbar, right aligned */}
      {isExpanded && (
        <div 
          ref={searchRef}
          data-testid="floating-search-expanded"
          className="fixed top-36 right-16 z-50 w-full max-w-sm"
        >
          <div className="bg-stone-800/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-stone-700">
            {/* Search Input Row */}
            <div className="flex items-center gap-3 p-4">
              {/* Category Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  data-testid="category-dropdown-button"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-700/50 
                           text-stone-300 text-sm font-medium transition-colors hover:bg-stone-700"
                >
                  <ActiveIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{labels[activeCategory]}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Category Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute top-full mt-2 left-0 bg-stone-800 rounded-xl shadow-xl border border-stone-700 overflow-hidden min-w-40 z-10">
                    {Object.entries(labels).map(([key, label]) => {
                      const Icon = categoryIcons[key];
                      return (
                        <button
                          key={key}
                          onClick={() => handleCategorySelect(key)}
                          data-testid={`category-option-${key}`}
                          className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors ${
                            activeCategory === key 
                              ? 'bg-stone-700 text-white font-medium' 
                              : 'text-stone-400 hover:bg-stone-700/50 hover:text-stone-200'
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  placeholder={placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="search-input"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-stone-700/50 border border-stone-600 
                           text-white placeholder-stone-500 focus:outline-none focus:ring-1 
                           focus:ring-stone-500 focus:border-stone-500 text-sm"
                  autoFocus
                />
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsExpanded(false)}
                data-testid="close-search-button"
                className="p-2 text-stone-500 hover:text-stone-300 hover:bg-stone-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Category Pills */}
            <div className="flex items-center gap-2 px-4 pb-4 overflow-x-auto">
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
                        ? 'bg-white text-stone-800 border-white' 
                        : 'bg-transparent text-stone-400 border-stone-600 hover:border-stone-500 hover:text-stone-300'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Mockup Notice - subtle */}
            <div className="px-4 py-2 bg-stone-900/50 border-t border-stone-700 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Preview mockup
              </span>
              <span className="text-xs text-stone-600">
                ESC to close
              </span>
            </div>
          </div>
        </div>
      )}

      {/* No backdrop - search doesn't block the page */}
    </>
  );
});

FloatingSearch.displayName = 'FloatingSearch';

export default FloatingSearch;

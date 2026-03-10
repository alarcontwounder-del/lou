import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Search, X, ChevronDown, Flag, Hotel, Utensils, Coffee, Palmtree, MapPin, ExternalLink, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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

const categoryColors = {
  golf: 'bg-green-100 text-green-700',
  hotel: 'bg-blue-100 text-blue-700',
  restaurant: 'bg-orange-100 text-orange-700',
  cafe_bar: 'bg-amber-100 text-amber-700',
  beach_club: 'bg-cyan-100 text-cyan-700',
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
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const { language } = useLanguage();

  const labels = categoryLabels[language] || categoryLabels.en;
  const placeholder = searchPlaceholders[language] || searchPlaceholders.en;

  // Expose open method to parent
  useImperativeHandle(ref, () => ({
    open: () => setIsExpanded(true),
    close: () => setIsExpanded(false),
    toggle: () => setIsExpanded(prev => !prev)
  }));

  // Search function
  const performSearch = async (query, category) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/search`, {
        params: { q: query, category: category }
      });
      setResults(response.data.results || []);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (searchQuery.length > 0 || activeCategory !== 'all') {
      debounceRef.current = setTimeout(() => {
        performSearch(searchQuery, activeCategory);
      }, 300);
    } else {
      setResults([]);
      setHasSearched(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, activeCategory]);

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

  const handleResultClick = (result) => {
    if (result.booking_url) {
      window.open(result.booking_url, '_blank');
    }
  };

  const ActiveIcon = categoryIcons[activeCategory];

  return (
    <>
      {/* Floating Search Button */}
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

      {/* Expanded Search Panel */}
      {isExpanded && (
        <div 
          ref={searchRef}
          data-testid="floating-search-expanded"
          className="fixed top-36 right-8 z-50 w-full max-w-md"
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

            {/* Results Area */}
            {(hasSearched || loading) && (
              <div className="border-t border-stone-700 max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-stone-400 animate-spin" />
                  </div>
                ) : results.length > 0 ? (
                  <div className="p-3 space-y-2">
                    <p className="text-xs text-stone-500 px-2 mb-2">
                      {results.length} result{results.length !== 1 ? 's' : ''} found
                    </p>
                    {results.map((result) => {
                      const Icon = categoryIcons[result.type] || Search;
                      return (
                        <div 
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          className="flex items-center gap-3 p-3 rounded-xl bg-stone-700/30 hover:bg-stone-700/60 cursor-pointer transition-colors group"
                        >
                          <img 
                            src={result.image} 
                            alt={result.name}
                            className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[result.type] || 'bg-stone-100 text-stone-700'}`}>
                                <Icon className="w-3 h-3 inline mr-1" />
                                {labels[result.type] || result.type}
                              </span>
                              {result.michelin_stars && (
                                <span className="text-xs text-amber-400">⭐ Michelin</span>
                              )}
                            </div>
                            <h4 className="font-medium text-white text-sm truncate group-hover:text-amber-400 transition-colors">
                              {result.name}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-stone-400">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{result.location}</span>
                              {result.price_from && (
                                <span className="text-green-400">From €{result.price_from}</span>
                              )}
                              {result.offer_price && (
                                <span className="text-green-400">€{result.offer_price}</span>
                              )}
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-stone-500 group-hover:text-amber-400 flex-shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-stone-400 text-sm">No results found</p>
                    <p className="text-stone-500 text-xs mt-1">Try a different search term</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="px-4 py-2 bg-stone-900/50 border-t border-stone-700 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Press <kbd className="px-1.5 py-0.5 bg-stone-700 rounded text-xs">ESC</kbd> to close
              </span>
              <span className="text-xs text-stone-500">
                {results.length > 0 ? `${results.length} results` : 'Type to search'}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

FloatingSearch.displayName = 'FloatingSearch';

export default FloatingSearch;

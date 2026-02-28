import React, { useState } from 'react';
import { Search, X, MapPin, Star, Coffee, Utensils, Hotel, Palmtree, Flag } from 'lucide-react';

// Mockup data for demonstration
const mockResults = [
  { id: 1, type: 'golf', name: 'Golf Alcanada', location: 'Alcudia', rating: 4.8, image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=200&h=150&fit=crop' },
  { id: 2, type: 'restaurant', name: 'Es Fum', location: 'Costa d\'en Blanes', rating: 4.9, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=150&fit=crop' },
  { id: 3, type: 'hotel', name: 'St. Regis Mardavall', location: 'Costa d\'en Blanes', rating: 4.7, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=150&fit=crop' },
  { id: 4, type: 'cafe_bar', name: 'Cappuccino Grand Café', location: 'Puerto Portals', rating: 4.5, image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&h=150&fit=crop' },
  { id: 5, type: 'beach_club', name: 'Nikki Beach Mallorca', location: 'Calvià', rating: 4.6, image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=200&h=150&fit=crop' },
];

const categoryIcons = {
  all: Search,
  golf: Flag,
  hotel: Hotel,
  restaurant: Utensils,
  cafe_bar: Coffee,
  beach_club: Palmtree,
};

const categoryLabels = {
  all: 'All',
  golf: 'Golf Courses',
  hotel: 'Hotels',
  restaurant: 'Restaurants',
  cafe_bar: 'Cafés & Bars',
  beach_club: 'Beach Clubs',
};

const categoryColors = {
  golf: 'bg-green-100 text-green-700',
  hotel: 'bg-blue-100 text-blue-700',
  restaurant: 'bg-orange-100 text-orange-700',
  cafe_bar: 'bg-amber-100 text-amber-700',
  beach_club: 'bg-cyan-100 text-cyan-700',
};

export const SearchMockup = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setShowResults(e.target.value.length > 0);
  };

  const filteredResults = mockResults.filter(item => 
    activeCategory === 'all' || item.type === activeCategory
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" data-testid="search-mockup">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Search Modal */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-800 to-stone-700 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-lg font-semibold">Find Your Perfect Experience</h2>
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search golf courses, restaurants, hotels..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-lg"
              autoFocus
            />
            {searchQuery && (
              <button 
                onClick={() => { setSearchQuery(''); setShowResults(false); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryLabels).map(([key, label]) => {
              const Icon = categoryIcons[key];
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === key
                      ? 'bg-stone-800 text-white shadow-md'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto">
          {showResults ? (
            <div className="p-4">
              <p className="text-sm text-stone-500 mb-3">
                Showing {filteredResults.length} results for "{searchQuery}"
              </p>
              <div className="space-y-3">
                {filteredResults.map((result) => {
                  const Icon = categoryIcons[result.type];
                  return (
                    <div 
                      key={result.id}
                      className="flex items-center gap-4 p-3 rounded-xl bg-stone-50 hover:bg-stone-100 cursor-pointer transition-colors group"
                    >
                      <img 
                        src={result.image} 
                        alt={result.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[result.type]}`}>
                            <Icon className="w-3 h-3 inline mr-1" />
                            {categoryLabels[result.type]}
                          </span>
                        </div>
                        <h3 className="font-semibold text-stone-800 group-hover:text-amber-600 transition-colors">
                          {result.name}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-stone-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {result.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            {result.rating}
                          </span>
                        </div>
                      </div>
                      <div className="text-stone-400 group-hover:text-amber-600 transition-colors">
                        →
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-700 mb-2">
                What are you looking for?
              </h3>
              <p className="text-stone-500 text-sm mb-6">
                Search for golf courses, luxury hotels, restaurants, cafés, or beach clubs
              </p>
              
              {/* Quick Links */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto">
                <button className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors text-sm font-medium">
                  <Flag className="w-4 h-4" />
                  Golf Courses
                </button>
                <button className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium">
                  <Hotel className="w-4 h-4" />
                  Hotels
                </button>
                <button className="flex items-center gap-2 px-4 py-3 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 transition-colors text-sm font-medium">
                  <Utensils className="w-4 h-4" />
                  Restaurants
                </button>
                <button className="flex items-center gap-2 px-4 py-3 bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 transition-colors text-sm font-medium">
                  <Coffee className="w-4 h-4" />
                  Cafés & Bars
                </button>
                <button className="flex items-center gap-2 px-4 py-3 bg-cyan-50 text-cyan-700 rounded-xl hover:bg-cyan-100 transition-colors text-sm font-medium">
                  <Palmtree className="w-4 h-4" />
                  Beach Clubs
                </button>
                <button className="flex items-center gap-2 px-4 py-3 bg-stone-100 text-stone-700 rounded-xl hover:bg-stone-200 transition-colors text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  Near Me
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-sm text-stone-500">
          <span>Press <kbd className="px-2 py-0.5 bg-stone-200 rounded text-xs">ESC</kbd> to close</span>
          <span className="text-amber-600 font-medium">MOCKUP PREVIEW</span>
        </div>
      </div>
    </div>
  );
};

export default SearchMockup;

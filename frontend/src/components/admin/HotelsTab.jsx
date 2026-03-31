import React, { useState, useEffect } from 'react';
import { Search, ToggleLeft, ToggleRight, MapPin, Tag, Hotel } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const HotelsTab = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toggling, setToggling] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/hotels?include_inactive=true`);
      setHotels(res.data);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (hotelId, currentStatus) => {
    setToggling(hotelId);
    try {
      await axios.put(`${BACKEND_URL}/api/hotels/${hotelId}`, {
        is_active: !currentStatus
      }, { withCredentials: true });
      setHotels(prev =>
        prev.map(h => h.id === hotelId ? { ...h, is_active: !currentStatus } : h)
      );
    } catch (error) {
      console.error('Error toggling hotel:', error);
      alert('Failed to update hotel status');
    } finally {
      setToggling(null);
    }
  };

  const filtered = hotels.filter(h => {
    const matchesSearch = !searchTerm ||
      h.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'active' && h.is_active !== false) ||
      (filter === 'inactive' && h.is_active === false);
    return matchesSearch && matchesFilter;
  });

  const activeCount = hotels.filter(h => h.is_active !== false).length;
  const inactiveCount = hotels.filter(h => h.is_active === false).length;

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-brand-charcoal border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-stone-500 mt-4">Loading hotels...</p>
      </div>
    );
  }

  return (
    <div data-testid="hotels-tab">
      {/* Stats Row */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
          <span className="text-sm font-semibold text-emerald-700" data-testid="active-count">{activeCount} Active</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-stone-100 border border-stone-200 rounded-xl">
          <div className="w-2.5 h-2.5 bg-stone-400 rounded-full"></div>
          <span className="text-sm font-semibold text-stone-600" data-testid="inactive-count">{inactiveCount} Inactive</span>
        </div>
        <span className="text-sm text-stone-400 ml-auto">{hotels.length} total</span>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-slate/20"
            data-testid="hotels-search"
          />
        </div>
        <div className="flex bg-stone-100 rounded-xl p-1">
          {['all', 'active', 'inactive'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-medium rounded-lg capitalize transition-colors ${
                filter === f ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
              data-testid={`filter-${f}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Hotels List */}
      <div className="space-y-2">
        {filtered.map(hotel => {
          const isActive = hotel.is_active !== false;
          const isToggling = toggling === hotel.id;
          return (
            <div
              key={hotel.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                isActive ? 'bg-white border-stone-200' : 'bg-stone-50 border-stone-200/60'
              }`}
              data-testid={`hotel-row-${hotel.id}`}
            >
              {/* Image */}
              <div className={`w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 ${!isActive ? 'grayscale opacity-50' : ''}`}>
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e7e5e4" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%2378716c" font-size="12">No img</text></svg>'; }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-sm truncate ${isActive ? 'text-stone-900' : 'text-stone-400'}`}>
                  {hotel.name}
                </h4>
                <div className="flex items-center gap-3 mt-1">
                  {hotel.location && (
                    <span className="flex items-center gap-1 text-xs text-stone-400">
                      <MapPin className="w-3 h-3" />{hotel.location}
                    </span>
                  )}
                  {hotel.category && (
                    <span className="flex items-center gap-1 text-xs text-stone-400">
                      <Tag className="w-3 h-3" />{hotel.category}
                    </span>
                  )}
                  {hotel.offer_price && (
                    <span className="text-xs font-medium text-stone-500">
                      From {hotel.offer_price}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-400'
              }`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>

              {/* Toggle */}
              <button
                onClick={() => toggleActive(hotel.id, isActive)}
                disabled={isToggling}
                className={`flex-shrink-0 transition-all ${isToggling ? 'opacity-50' : 'hover:scale-110'}`}
                title={isActive ? 'Deactivate hotel' : 'Activate hotel'}
                data-testid={`toggle-${hotel.id}`}
              >
                {isActive ? (
                  <ToggleRight className="w-8 h-8 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-stone-300" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-stone-400" data-testid="no-hotels-found">
          <Hotel className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No hotels found</p>
        </div>
      )}
    </div>
  );
};

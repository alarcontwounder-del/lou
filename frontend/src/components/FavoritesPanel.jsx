import React from 'react';
import { X, Heart, MapPin, Trash2, ExternalLink } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';

const TYPE_LABELS = {
  golf: 'Golf Courses',
  hotel: 'Hotels',
  restaurant: 'Restaurants',
  beach_club: 'Beach Clubs',
  cafe_bar: 'Cafes & Bars',
};

const TYPE_COLORS = {
  golf: 'bg-emerald-100 text-emerald-700',
  hotel: 'bg-amber-100 text-amber-700',
  restaurant: 'bg-rose-100 text-rose-700',
  beach_club: 'bg-sky-100 text-sky-700',
  cafe_bar: 'bg-violet-100 text-violet-700',
};

function FavoriteItem({ item, onRemove }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-stone-100 group" data-testid={`fav-item-${item.type}-${item.id}`}>
      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-800 truncate">{item.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${TYPE_COLORS[item.type] || 'bg-stone-100 text-stone-600'}`}>
            {TYPE_LABELS[item.type] || item.type}
          </span>
          {item.location && (
            <span className="text-[10px] text-stone-400 flex items-center gap-0.5 truncate">
              <MapPin className="w-2.5 h-2.5" />
              {item.location}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => onRemove(item.id, item.type)}
        className="p-1.5 rounded-full text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors sm:opacity-0 sm:group-hover:opacity-100 flex-shrink-0"
        title="Remove"
        data-testid={`fav-remove-${item.type}-${item.id}`}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function FavoritesPanel({ isOpen, onClose }) {
  const { favorites, removeFavorite, clearAll, count } = useFavorites();

  const grouped = favorites.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  const typeOrder = ['golf', 'hotel', 'restaurant', 'beach_club', 'cafe_bar'];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] transition-opacity"
          onClick={onClose}
          data-testid="favorites-backdrop"
        />
      )}

      {/* Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-stone-50 z-[70] shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        data-testid="favorites-panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-white">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <h2 className="text-lg font-semibold text-stone-800">My List</h2>
            {count > 0 && (
              <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium">
                {count}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {count > 0 && (
              <button 
                onClick={clearAll}
                className="text-xs text-stone-400 hover:text-red-500 transition-colors px-2 py-1"
                data-testid="favorites-clear-all"
              >
                Clear all
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors"
              data-testid="favorites-close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-65px)] px-4 py-4">
          {count === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6" data-testid="favorites-empty">
              <Heart className="w-12 h-12 text-stone-200 mb-4" />
              <p className="text-stone-500 font-medium mb-1">Your list is empty</p>
              <p className="text-stone-400 text-sm">
                Tap the heart icon on any course, hotel, or restaurant to save it here while you browse.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {typeOrder.map(type => {
                const items = grouped[type];
                if (!items || items.length === 0) return null;
                return (
                  <div key={type}>
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 px-1">
                      {TYPE_LABELS[type]} ({items.length})
                    </p>
                    <div className="space-y-2">
                      {items.map(item => (
                        <FavoriteItem key={`${item.type}-${item.id}`} item={item} onRemove={removeFavorite} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

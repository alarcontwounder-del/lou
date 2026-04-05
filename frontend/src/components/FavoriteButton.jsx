import React from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';

export function FavoriteButton({ item, className = '' }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const active = isFavorite(item.id, item.type);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleFavorite(item);
      }}
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
        active 
          ? 'bg-red-500 text-white scale-110' 
          : 'bg-white/90 backdrop-blur-sm text-stone-400 hover:text-red-500 hover:bg-white'
      } ${className}`}
      title={active ? 'Remove from favorites' : 'Add to favorites'}
      data-testid={`favorite-btn-${item.type}-${item.id}`}
    >
      <Heart className={`w-4 h-4 transition-all duration-300 ${active ? 'fill-current' : ''}`} />
    </button>
  );
}

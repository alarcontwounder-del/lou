import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FavoritesContext = createContext();

const STORAGE_KEY = 'gim_session_favorites';

function loadFavorites() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to load favorites from sessionStorage:', e);
    return [];
  }
}

function saveFavorites(items) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(loadFavorites);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const toggleFavorite = useCallback((item) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === item.id && f.type === item.type);
      if (exists) {
        return prev.filter(f => !(f.id === item.id && f.type === item.type));
      }
      return [...prev, { 
        id: item.id, 
        type: item.type, 
        name: item.name, 
        image: item.image, 
        location: item.location,
        price_from: item.price_from,
        category: item.category,
      }];
    });
  }, []);

  const isFavorite = useCallback((id, type) => {
    return favorites.some(f => f.id === id && f.type === type);
  }, [favorites]);

  const removeFavorite = useCallback((id, type) => {
    setFavorites(prev => prev.filter(f => !(f.id === id && f.type === type)));
  }, []);

  const clearAll = useCallback(() => {
    setFavorites([]);
  }, []);

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      toggleFavorite, 
      isFavorite, 
      removeFavorite, 
      clearAll,
      count: favorites.length 
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}

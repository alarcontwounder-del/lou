import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    golfCourses: [],
    hotels: [],
    restaurants: [],
    beachClubs: [],
    cafeBars: [],
    displaySettings: {
      golf: null,
      hotels: null,
      restaurants: null,
      beach_clubs: null,
      cafe_bars: null
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [partnersRes, settingsRes] = await Promise.all([
          axios.get(`${API}/api/all-partners`),
          axios.get(`${API}/api/display-settings`).catch(() => ({ data: {} }))
        ]);

        const partners = partnersRes.data;
        
        setData({
          golfCourses: partners.golf_courses || [],
          hotels: partners.hotels || [],
          restaurants: partners.restaurants || [],
          beachClubs: partners.beach_clubs || [],
          cafeBars: partners.cafe_bars || [],
          displaySettings: settingsRes.data || {}
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getDisplayedItems = useCallback((items, limitKey) => {
    const setting = data.displaySettings[limitKey];
    let filtered = items;
    if (setting) {
      if (typeof setting === 'object' && setting.show === false) return [];
      if (typeof setting === 'number') filtered = items.slice(0, setting);
      else if (typeof setting === 'object' && setting.limit) filtered = items.slice(0, setting.limit);
    }
    return [...filtered].sort((a, b) => {
      const aActive = a.is_active !== false ? 0 : 1;
      const bActive = b.is_active !== false ? 0 : 1;
      return aActive - bActive;
    });
  }, [data.displaySettings]);

  const contextValue = useMemo(() => ({ 
    ...data, 
    loading, 
    error,
    getDisplayedItems
  }), [data, loading, error, getDisplayedItems]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

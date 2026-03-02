import React, { createContext, useContext, useState, useEffect } from 'react';
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
        // Fetch all data in parallel with a single batch
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
  }, []);

  // Helper to get displayed items based on limits
  const getDisplayedItems = (items, limitKey) => {
    const limit = data.displaySettings[limitKey];
    if (!limit) return items;
    return items.slice(0, limit);
  };

  return (
    <DataContext.Provider value={{ 
      ...data, 
      loading, 
      error,
      getDisplayedItems
    }}>
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

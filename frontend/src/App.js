import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import '@/App.css';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { GolfCourses } from './components/GolfCourses';
import { HotelPartners } from './components/HotelPartners';
import { RestaurantPartners } from './components/RestaurantPartners';
import { ReviewCarousel } from './components/ReviewCarousel';
import { Blog } from './components/Blog';
import { Newsletter } from './components/Newsletter';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthCallback } from './components/AuthCallback';
import { Toaster } from './components/ui/sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Main content component
function MainContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAdmin, setShowAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user was passed from AuthCallback
    if (location.state?.user) {
      setUser(location.state.user);
      if (location.state.showAdmin) {
        setShowAdmin(true);
      }
      // Clear the state
      navigate('/', { replace: true, state: {} });
      setIsCheckingAuth(false);
      return;
    }

    // Check if already authenticated
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
          withCredentials: true
        });
        setUser(response.data);
      } catch (error) {
        // Not authenticated - that's fine
        setUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [location.state, navigate]);

  const handleAdminLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleOpenAdmin = () => {
    if (user) {
      setShowAdmin(true);
    } else {
      handleAdminLogin();
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar 
        onAdminClick={handleOpenAdmin} 
        isAuthenticated={!!user} 
        isCheckingAuth={isCheckingAuth}
      />
      <main>
        <Hero />
        <About />
        <GolfCourses />
        <HotelPartners />
        <RestaurantPartners />
        <ReviewCarousel />
        <Blog />
        <Contact />
      </main>
      <Newsletter />
      <Footer />
      <Toaster position="bottom-right" />
      
      {showAdmin && user && (
        <AdminDashboard 
          onClose={() => setShowAdmin(false)} 
          user={user}
        />
      )}
    </div>
  );
}

// App Router component to handle session_id detection
function AppRouter() {
  const location = useLocation();
  
  // Check URL hash for session_id (synchronous detection before render)
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <Routes>
      <Route path="/*" element={<MainContent />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AppRouter />
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;

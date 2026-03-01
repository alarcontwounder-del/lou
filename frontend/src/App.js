import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import '@/App.css';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { GolfCourses } from './components/GolfCourses';
import { HotelPartners } from './components/HotelPartners';
import { RestaurantPartners } from './components/RestaurantPartners';
import { BeachClubPartners } from './components/BeachClubPartners';
import { CafeBarsPartners } from './components/CafeBarsPartners';
import { CompactReviewsCarousel } from './components/CompactReviewsCarousel';
import { Blog } from './components/Blog';
import { Newsletter } from './components/Newsletter';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthCallback } from './components/AuthCallback';
import { Toaster } from './components/ui/sonner';
import { FloatingSearch } from './components/FloatingSearch';
import { SectionNavigator } from './components/SectionNavigator';
import DesignPreview from './pages/DesignPreview';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Main content component
function MainContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAdmin, setShowAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const searchRef = useRef(null);

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
        onSearchClick={() => searchRef.current?.open()}
      />
      
      {/* Hero */}
      <Hero />
      
      {/* About */}
      <About />
      
      {/* Main content - clean layout */}
      <main>
        <GolfCourses />
        <HotelPartners />
        <RestaurantPartners />
        <CafeBarsPartners />
        <BeachClubPartners />
        <Blog />
        <Contact />
        <Newsletter />
        
        {/* Compact Reviews Carousel - just before footer */}
        <CompactReviewsCarousel />
        
        <Footer />
      </main>
      
      <Toaster position="bottom-right" />
      
      {/* Floating Search Mockup */}
      <FloatingSearch ref={searchRef} showButton={false} />
      
      {/* Section Navigator - dots on right side */}
      <SectionNavigator />
      
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
      <Route path="/preview" element={<DesignPreview />} />
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

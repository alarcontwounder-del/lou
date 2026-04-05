import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import '@/App.css';
import { LanguageProvider } from './context/LanguageContext';
import { DataProvider } from './context/DataContext';
import { FavoritesProvider } from './context/FavoritesContext';
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
import { CookieConsent } from './components/CookieConsent';
import { FloatingSearch } from './components/FloatingSearch';
import { SectionNavigator } from './components/SectionNavigator';
import { TripPlanner } from './components/TripPlanner';
import { FavoritesPanel } from './components/FavoritesPanel';
import { useFavorites } from './context/FavoritesContext';
import { Heart } from 'lucide-react';
import DesignPreview from './pages/DesignPreview';
const GolfCoursePage = React.lazy(() => import('./components/GolfCourseLanding'));
const GolfHolidaysPage = React.lazy(() => import('./components/GolfHolidaysPage'));
const BookTeeTimesPage = React.lazy(() => import('./components/BookTeeTimesPage'));
const PaymentPage = React.lazy(() => import('./components/PaymentPage'));
const BlogPostPage = React.lazy(() => import('./components/BlogPostPage'));
const TermsPage = React.lazy(() => import('./components/TermsPage'));
const PrivacyPage = React.lazy(() => import('./components/PrivacyPage'));
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Main content component
function MainContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAdmin, setShowAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showTripPlanner, setShowTripPlanner] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const searchRef = useRef(null);
  const { count: favCount } = useFavorites();

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

    // Handle scroll-to-section when navigating from other pages
    if (location.state?.scrollTo) {
      const sectionId = location.state.scrollTo;
      navigate('/', { replace: true, state: {} });
      // Use requestAnimationFrame loop for instant scroll before paint
      const tryScroll = (attempts = 0) => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'instant' });
        } else if (attempts < 50) {
          requestAnimationFrame(() => tryScroll(attempts + 1));
        }
      };
      requestAnimationFrame(tryScroll);
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
        onPlanTrip={() => setShowTripPlanner(true)}
      />
      
      {/* Hero */}
      <Hero onPlanTrip={() => setShowTripPlanner(true)} />
      
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
      
      {/* Trip Planner Modal */}
      <TripPlanner isOpen={showTripPlanner} onClose={() => setShowTripPlanner(false)} />
      
      {/* Favorites Panel */}
      <FavoritesPanel isOpen={showFavorites} onClose={() => setShowFavorites(false)} />
      
      {/* Floating Favorites Button */}
      <button
        onClick={() => setShowFavorites(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-white rounded-full shadow-lg border border-stone-200 flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all duration-300 group"
        data-testid="floating-favorites-btn"
      >
        <Heart className={`w-5 h-5 transition-colors duration-300 ${favCount > 0 ? 'text-red-500 fill-red-500' : 'text-stone-400 group-hover:text-red-400'}`} />
        {favCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center" data-testid="favorites-count-badge">
            {favCount}
          </span>
        )}
      </button>
      
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
      <Route path="/golf-courses/:courseId" element={
        <React.Suspense fallback={<div className="min-h-screen bg-brand-cream flex items-center justify-center"><div className="w-8 h-8 border-4 border-stone-300 border-t-stone-600 rounded-full animate-spin" /></div>}>
          <GolfCoursePage />
        </React.Suspense>
      } />
      <Route path="/golf-holidays-mallorca" element={
        <React.Suspense fallback={<div className="min-h-screen bg-brand-cream flex items-center justify-center"><div className="w-8 h-8 border-4 border-stone-300 border-t-stone-600 rounded-full animate-spin" /></div>}>
          <GolfHolidaysPage />
        </React.Suspense>
      } />
      <Route path="/book-tee-times" element={
        <React.Suspense fallback={<div className="min-h-screen bg-brand-cream flex items-center justify-center"><div className="w-8 h-8 border-4 border-stone-300 border-t-stone-600 rounded-full animate-spin" /></div>}>
          <BookTeeTimesPage />
        </React.Suspense>
      } />
      <Route path="/blog/:slug" element={
        <React.Suspense fallback={<div className="min-h-screen bg-brand-cream flex items-center justify-center"><div className="w-8 h-8 border-4 border-stone-300 border-t-stone-600 rounded-full animate-spin" /></div>}>
          <BlogPostPage />
        </React.Suspense>
      } />
      <Route path="/pay/:paymentId" element={
        <React.Suspense fallback={<div className="min-h-screen bg-stone-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-stone-300 border-t-stone-600 rounded-full animate-spin" /></div>}>
          <PaymentPage />
        </React.Suspense>
      } />
      <Route path="/terms" element={
        <React.Suspense fallback={<div className="min-h-screen bg-brand-cream flex items-center justify-center"><div className="w-8 h-8 border-4 border-stone-300 border-t-stone-600 rounded-full animate-spin" /></div>}>
          <TermsPage />
        </React.Suspense>
      } />
      <Route path="/privacy" element={
        <React.Suspense fallback={<div className="min-h-screen bg-brand-cream flex items-center justify-center"><div className="w-8 h-8 border-4 border-stone-300 border-t-stone-600 rounded-full animate-spin" /></div>}>
          <PrivacyPage />
        </React.Suspense>
      } />
      <Route path="/*" element={<MainContent />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <DataProvider>
          <FavoritesProvider>
            <AppRouter />
            <CookieConsent />
          </FavoritesProvider>
        </DataProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;

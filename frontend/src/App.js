import React from 'react';
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
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-brand-cream">
        <Navbar />
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
      </div>
    </LanguageProvider>
  );
}

export default App;

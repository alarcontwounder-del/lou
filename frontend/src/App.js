import React from 'react';
import '@/App.css';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { GolfCourses } from './components/GolfCourses';
import { HotelPartners } from './components/HotelPartners';
import { RestaurantPartners } from './components/RestaurantPartners';
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
          <Contact />
        </main>
        <Footer />
        <Toaster position="bottom-right" />
      </div>
    </LanguageProvider>
  );
}

export default App;

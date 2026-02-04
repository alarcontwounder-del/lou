import React from 'react';
import '@/App.css';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { GolfCourses } from './components/GolfCourses';
import { PartnerOffers } from './components/PartnerOffers';
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
          <PartnerOffers />
          <Contact />
        </main>
        <Footer />
        <Toaster position="bottom-right" />
      </div>
    </LanguageProvider>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { Flag, Hotel, UtensilsCrossed, Coffee, Umbrella, FileText, Mail, Newspaper } from 'lucide-react';

const sections = [
  { id: 'hero', label: 'Home', icon: null },
  { id: 'about', label: 'About', icon: null },
  { id: 'courses', label: 'Golf Courses', icon: Flag },
  { id: 'hotels', label: 'Hotels', icon: Hotel },
  { id: 'restaurants', label: 'Restaurants', icon: UtensilsCrossed },
  { id: 'cafes-bars', label: 'Cafés & Bars', icon: Coffee },
  { id: 'beach-clubs', label: 'Beach Clubs', icon: Umbrella },
  { id: 'blog', label: 'Blog', icon: FileText },
  { id: 'contact', label: 'Contact', icon: Mail },
];

export const SectionNavigator = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredSection, setHoveredSection] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      // Show navigator after scrolling past hero
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 300);

      // Determine active section
      const sectionElements = sections
        .map(s => ({ id: s.id, el: document.getElementById(s.id) }))
        .filter(s => s.el);

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const { id, el } = sectionElements[i];
        const rect = el.getBoundingClientRect();
        if (rect.top <= 150) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for navbar
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  if (!isVisible) return null;

  return (
    <nav 
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-1"
      aria-label="Section navigation"
    >
      {sections.map((section) => {
        const isActive = activeSection === section.id;
        const isHovered = hoveredSection === section.id;
        const Icon = section.icon;

        return (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            onMouseEnter={() => setHoveredSection(section.id)}
            onMouseLeave={() => setHoveredSection(null)}
            className={`group flex items-center gap-2 transition-all duration-200 ${
              isActive ? 'opacity-100' : 'opacity-50 hover:opacity-100'
            }`}
            title={section.label}
            data-testid={`nav-dot-${section.id}`}
          >
            {/* Label - shows on hover */}
            <span 
              className={`text-xs font-medium text-stone-700 bg-white px-2 py-1 rounded shadow-sm border border-stone-200 whitespace-nowrap transition-all duration-200 ${
                isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
              }`}
            >
              {section.label}
            </span>

            {/* Dot/Icon */}
            <div 
              className={`flex items-center justify-center transition-all duration-200 ${
                isActive 
                  ? 'w-8 h-8 bg-brand-charcoal rounded-full shadow-md' 
                  : 'w-3 h-3 bg-stone-400 rounded-full hover:bg-stone-600 hover:w-4 hover:h-4'
              }`}
            >
              {isActive && Icon && (
                <Icon className="w-4 h-4 text-white" />
              )}
            </div>
          </button>
        );
      })}
    </nav>
  );
};

export default SectionNavigator;

import React, { useState, useEffect } from 'react';

// Custom luxury-style SVG icons
const GolfIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <circle cx="12" cy="6" r="3" />
    <path d="M12 9v12" />
    <path d="M8 21h8" />
  </svg>
);

const HotelIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <rect x="4" y="4" width="16" height="16" rx="1" />
    <path d="M4 9h16" />
    <path d="M9 4v5" />
    <path d="M15 4v5" />
    <rect x="9" y="14" width="6" height="6" />
  </svg>
);

const DiningIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path d="M3 6h18" />
    <path d="M5 6v14a1 1 0 001 1h12a1 1 0 001-1V6" />
    <ellipse cx="12" cy="6" rx="8" ry="2" />
  </svg>
);

const CocktailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path d="M8 3l8 0" />
    <path d="M12 3v4" />
    <path d="M6 7l6 8 6-8z" />
    <path d="M12 15v6" />
    <path d="M9 21h6" />
  </svg>
);

const PalmIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path d="M12 21V11" />
    <path d="M12 11c-3-4-7-3-9-1" />
    <path d="M12 11c3-4 7-3 9-1" />
    <path d="M12 8c-2-3-1-6 0-7" />
    <path d="M9 21h6" />
  </svg>
);

const QuillIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path d="M20 4c-2 0-4 2-6 6l-8 8v3h3l8-8c4-2 6-4 6-6 0-1-1-3-3-3z" />
  </svg>
);

const EnvelopeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <rect x="3" y="5" width="18" height="14" rx="1" />
    <path d="M3 5l9 7 9-7" />
  </svg>
);

const sections = [
  { id: 'hero', label: 'Home', icon: null },
  { id: 'about', label: 'About', icon: null },
  { id: 'courses', label: 'Golf Courses', icon: GolfIcon },
  { id: 'hotels', label: 'Hotels', icon: HotelIcon },
  { id: 'restaurants', label: 'Restaurants', icon: DiningIcon },
  { id: 'cafes-bars', label: 'Cafés & Bars', icon: CocktailIcon },
  { id: 'beach-clubs', label: 'Beach Clubs', icon: PalmIcon },
  { id: 'blog', label: 'Blog', icon: QuillIcon },
  { id: 'contact', label: 'Contact', icon: EnvelopeIcon },
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
              isActive ? 'opacity-100' : 'opacity-40 hover:opacity-70'
            }`}
            title={section.label}
            data-testid={`nav-dot-${section.id}`}
          >
            {/* Label - shows on hover */}
            <span 
              className={`text-xs font-medium text-stone-500 bg-white px-2 py-1 rounded shadow-sm border border-stone-100 whitespace-nowrap transition-all duration-200 ${
                isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
              }`}
            >
              {section.label}
            </span>

            {/* Dot/Icon */}
            <div 
              className={`flex items-center justify-center transition-all duration-200 ${
                isActive 
                  ? 'w-8 h-8 bg-stone-400 rounded-full shadow-sm' 
                  : 'w-2.5 h-2.5 bg-stone-300 rounded-full hover:bg-stone-400 hover:w-3 hover:h-3'
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

import React, { useState, useEffect } from 'react';

const sections = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'courses', label: 'Golf Courses' },
  { id: 'hotels', label: 'Hotels' },
  { id: 'restaurants', label: 'Restaurants' },
  { id: 'cafes-bars', label: 'Cafés & Bars' },
  { id: 'beach-clubs', label: 'Beach Clubs' },
  { id: 'blog', label: 'Blog' },
  { id: 'contact', label: 'Contact' },
];

export const SectionNavigator = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredSection, setHoveredSection] = useState(null);
  const [isHoveringZone, setIsHoveringZone] = useState(false);

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
    <>
      {/* Invisible hover zone on right edge - desktop only */}
      <div 
        className="fixed right-0 top-0 w-20 h-full z-30 hidden lg:block"
        onMouseEnter={() => setIsHoveringZone(true)}
        onMouseLeave={() => setIsHoveringZone(false)}
      />
      
      {/* Navigation dots - always visible on mobile, ghost effect on desktop */}
      <nav 
        className={`fixed right-3 sm:right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-end gap-1.5 sm:gap-2 transition-all duration-300 ease-out ${
          isHoveringZone ? 'lg:opacity-100 lg:translate-x-0' : 'lg:opacity-0 lg:translate-x-4 lg:pointer-events-none'
        }`}
        aria-label="Section navigation"
        onMouseEnter={() => setIsHoveringZone(true)}
        onMouseLeave={() => setIsHoveringZone(false)}
      >
      {sections.map((section) => {
        const isActive = activeSection === section.id;
        const isHovered = hoveredSection === section.id;

        return (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            onMouseEnter={() => setHoveredSection(section.id)}
            onMouseLeave={() => setHoveredSection(null)}
            className="group flex items-center gap-2 transition-all duration-200 p-1"
            title={section.label}
            data-testid={`nav-dot-${section.id}`}
          >
            {/* Label - shows on hover (desktop only) */}
            <span 
              className={`hidden lg:block text-xs font-medium text-stone-500 bg-white px-2 py-1 rounded shadow-sm border border-stone-100 whitespace-nowrap transition-all duration-200 ${
                isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
              }`}
            >
              {section.label}
            </span>

            {/* Simple dot - larger when active */}
            <div 
              className={`rounded-full transition-all duration-200 ${
                isActive 
                  ? 'w-3 h-3 sm:w-4 sm:h-4 bg-stone-600' 
                  : 'w-2 h-2 sm:w-2.5 sm:h-2.5 bg-stone-400 hover:bg-stone-500 hover:w-2.5 hover:h-2.5 sm:hover:w-3 sm:hover:h-3'
              }`}
            />
          </button>
        );
      })}
      </nav>
    </>
  );
};

export default SectionNavigator;

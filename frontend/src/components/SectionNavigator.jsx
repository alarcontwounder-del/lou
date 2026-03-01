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

            {/* Dot - simple circle for inactive, larger with icon for active */}
            {isActive ? (
              <div className="w-7 h-7 bg-stone-400 rounded-full shadow-sm flex items-center justify-center">
                {Icon && <Icon />}
              </div>
            ) : (
              <div className="w-2 h-2 bg-stone-300 rounded-full hover:bg-stone-400 hover:w-2.5 hover:h-2.5 transition-all duration-200" />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default SectionNavigator;

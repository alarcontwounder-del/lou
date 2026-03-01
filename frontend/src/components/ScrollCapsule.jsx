import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export const ScrollCapsule = () => {
  const [showUpArrow, setShowUpArrow] = useState(false);
  const [showDownArrow, setShowDownArrow] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      // Show up arrow if scrolled down
      setShowUpArrow(scrollTop > 100);
      // Show down arrow if not at bottom
      setShowDownArrow(scrollTop + clientHeight < scrollHeight - 100);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollUp = () => {
    window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
  };

  const scrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
  };

  return (
    <div className="fixed right-2 top-1/2 -translate-y-1/2 z-40">
      {/* Capsule container - always visible */}
      <div className="flex flex-col items-center bg-stone-800/80 backdrop-blur-sm rounded-full py-1.5 px-0.5 shadow-lg">
        {/* Up button */}
        <button
          onClick={scrollUp}
          disabled={!showUpArrow}
          className={`p-1.5 rounded-full transition-all duration-200 ${
            showUpArrow 
              ? 'text-white hover:bg-white/20 cursor-pointer' 
              : 'text-stone-600 cursor-not-allowed'
          }`}
          aria-label="Scroll up"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        
        {/* Divider line */}
        <div className="w-3 h-px bg-stone-600 my-0.5" />
        
        {/* Down button */}
        <button
          onClick={scrollDown}
          disabled={!showDownArrow}
          className={`p-1.5 rounded-full transition-all duration-200 ${
            showDownArrow 
              ? 'text-white hover:bg-white/20 cursor-pointer' 
              : 'text-stone-600 cursor-not-allowed'
          }`}
          aria-label="Scroll down"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ScrollCapsule;

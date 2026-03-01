import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export const ScrollCapsule = () => {
  const [isVisible, setIsVisible] = useState(false);
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
    <div
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {/* Hover trigger area - invisible but larger */}
      <div className="absolute -inset-4 cursor-pointer" />
      
      {/* Capsule container */}
      <div
        className={`flex flex-col items-center bg-stone-800/90 backdrop-blur-sm rounded-full py-2 px-1 shadow-lg transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}
      >
        {/* Up button */}
        <button
          onClick={scrollUp}
          disabled={!showUpArrow}
          className={`p-2 rounded-full transition-all duration-200 ${
            showUpArrow 
              ? 'text-white hover:bg-white/20 cursor-pointer' 
              : 'text-stone-600 cursor-not-allowed'
          }`}
          aria-label="Scroll up"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        
        {/* Divider line */}
        <div className="w-4 h-px bg-stone-600 my-1" />
        
        {/* Down button */}
        <button
          onClick={scrollDown}
          disabled={!showDownArrow}
          className={`p-2 rounded-full transition-all duration-200 ${
            showDownArrow 
              ? 'text-white hover:bg-white/20 cursor-pointer' 
              : 'text-stone-600 cursor-not-allowed'
          }`}
          aria-label="Scroll down"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ScrollCapsule;

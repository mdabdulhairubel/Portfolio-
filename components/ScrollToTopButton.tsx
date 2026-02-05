import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-24 right-6 z-[60] w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 transform ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-10 scale-50 pointer-events-none'
      } bg-gray-900/80 backdrop-blur-xl border border-gray-800 text-primary shadow-2xl hover:bg-primary hover:text-gray-950 hover:-translate-y-2 group`}
      aria-label="Scroll to top"
    >
      <ChevronUp 
        size={28} 
        className="transition-transform duration-300 group-hover:-translate-y-1" 
      />
      
      {/* Subtle background pulse effect */}
      <span className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping-slow -z-10 group-hover:hidden"></span>
    </button>
  );
};

export default ScrollToTopButton;
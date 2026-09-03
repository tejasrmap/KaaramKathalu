import React, { useEffect, useState } from 'react';

export const ScrollProgressIndicator: React.FC = () => {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (docHeight > 0) {
        const percentage = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));
        setScrollPercentage(percentage);
        setIsVisible(scrollY > 50);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed right-1.5 top-0 bottom-0 w-1.5 pointer-events-none z-[9999] flex flex-col justify-between py-6 transition-opacity duration-300"
      aria-hidden="true"
    >
      {/* Terracotta position point indicator */}
      <div 
        className="w-2 h-7 rounded-full bg-warm-accent shadow-md transition-transform duration-75 ease-out -ml-0.5"
        style={{
          transform: `translateY(${(scrollPercentage / 100) * (window.innerHeight - 80)}px)`
        }}
      />
    </div>
  );
};

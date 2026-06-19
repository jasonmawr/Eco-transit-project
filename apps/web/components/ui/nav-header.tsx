'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface NavItem {
  label: string;
  targetId: string;
  isUpcoming?: boolean;
}

interface NavHeaderProps {
  items: NavItem[];
  activeSection: string;
  onUpcomingClick: (feature: string) => void;
  onItemClick?: (targetId: string) => void;
}

export function NavHeader({ items, activeSection, onUpcomingClick, onItemClick }: NavHeaderProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Refs for scroll and items
  const containerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement | null>(null);

  // Fades visibility states
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  // Drag states
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftState = useRef(0);
  const [dragged, setDragged] = useState(false);

  // Event handlers for drag
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    isMouseDown.current = true;
    startX.current = e.pageX - container.offsetLeft;
    scrollLeftState.current = container.scrollLeft;
    setDragged(false);
    container.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current) return;
    const container = containerRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const walk = x - startX.current;
    if (Math.abs(walk) > 6) {
      setDragged(true);
    }
    container.scrollLeft = scrollLeftState.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isMouseDown.current = false;
    const container = containerRef.current;
    if (container) {
      container.style.cursor = 'grab';
    }
    // Tiny timeout to make sure click intercept runs before clearing dragged
    setTimeout(() => {
      setDragged(false);
    }, 50);
  };

  const handleScroll = (e: React.MouseEvent, targetId: string) => {
    if (dragged) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    if (onItemClick) {
      onItemClick(targetId);
    }
  };

  // Update left/right visual gradients
  const updateFades = () => {
    const container = containerRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftFade(scrollLeft > 5);
    setShowRightFade(scrollLeft + clientWidth < scrollWidth - 5);
  };

  // Scroll to active item helper (smooth internal scrollTo)
  const scrollToActive = () => {
    const container = containerRef.current;
    const activeElement = activeItemRef.current;
    if (container && activeElement) {
      const containerWidth = container.clientWidth;
      const activeWidth = activeElement.clientWidth;
      const activeLeft = activeElement.offsetLeft;
      
      const targetScrollLeft = activeLeft - (containerWidth / 2) + (activeWidth / 2);
      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Setup passive wheel listener and scroll/resize fade listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const nativeWheelHandler = (e: WheelEvent) => {
      const isOverflow = container.scrollWidth > container.clientWidth;
      if (isOverflow && e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', nativeWheelHandler, { passive: false });
    container.addEventListener('scroll', updateFades);
    window.addEventListener('resize', updateFades);
    
    // Initial check
    updateFades();

    return () => {
      container.removeEventListener('wheel', nativeWheelHandler);
      container.removeEventListener('scroll', updateFades);
      window.removeEventListener('resize', updateFades);
    };
  }, [items]);

  // Center active tab on section change or loading
  useEffect(() => {
    const timer = setTimeout(scrollToActive, 100);
    return () => clearTimeout(timer);
  }, [activeSection]);

  return (
    <div className="relative w-full h-full flex items-center overflow-hidden">
      
      {/* Left Fade visual indicator */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-20 transition-opacity duration-300 ${
          showLeftFade ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Right Fade visual indicator */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-20 transition-opacity duration-300 ${
          showRightFade ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Scrollable Container with Drag listeners */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className="w-full overflow-x-auto no-scrollbar py-1 select-none cursor-grab flex items-center justify-start min-w-0"
      >
        <nav className="relative flex items-center space-x-1 py-1 px-1 bg-eco-soft/50 rounded-full border border-eco-mint/30 shrink-0 mx-auto w-max max-w-none flex">
          {items.map((item, index) => {
            const isUpcoming = item.isUpcoming;
            const isActive = activeSection === item.targetId;

            return (
              <div
                key={index}
                ref={(el) => {
                  if (isActive) {
                    activeItemRef.current = el;
                  }
                }}
                className="relative shrink-0 flex items-center justify-center"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Slide-over cursor pill backdrop */}
                {hoveredIndex === index && (
                  <motion.div
                    layoutId="nav-hover-pill"
                    className="absolute inset-0 bg-eco-accentGreen rounded-full z-0 border border-eco-accentGreenDeep/10"
                    transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                  />
                )}

                {/* Permanent Active indicator backdrop if NOT hovered */}
                {isActive && hoveredIndex !== index && (
                  <div
                    className="absolute inset-0 bg-eco-primary rounded-full z-0 border border-eco-primaryDeep/10 shadow-sm"
                  />
                )}

                {isUpcoming ? (
                  <button
                    type="button"
                    onClick={() => onUpcomingClick(item.label)}
                    className={`relative z-10 h-9 sm:h-10 px-2 sm:px-3 md:px-[18px] text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-1 focus:outline-none transition-colors duration-200 cursor-not-allowed whitespace-nowrap shrink-0 ${
                      hoveredIndex === index ? 'text-eco-ink' : 'text-eco-muted'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className={`text-[7px] font-black uppercase px-1.5 py-0.2 rounded-md tracking-widest ${
                      hoveredIndex === index ? 'bg-eco-ink text-white' : 'bg-amber-100 text-amber-800'
                    }`}>
                      Sắp ra mắt
                    </span>
                  </button>
                ) : (
                  <a
                    href={`#${item.targetId}`}
                    onClick={(e) => handleScroll(e, item.targetId)}
                    className={`relative z-10 h-9 sm:h-10 px-2 sm:px-3 md:px-[18px] text-[10px] sm:text-xs font-black uppercase tracking-wider inline-flex items-center justify-center whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-primary rounded-full transition-all duration-200 shrink-0 ${
                      isActive
                        ? hoveredIndex === index 
                          ? 'text-eco-ink font-extrabold'
                          : 'text-white font-extrabold'
                        : hoveredIndex === index
                        ? 'text-eco-ink font-bold'
                        : 'text-eco-primary hover:text-eco-primaryDeep font-bold'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="flex flex-col items-center justify-center relative leading-none py-1 shrink-0">
                      <span>{item.label}</span>
                      {/* Subtle active dot indicator */}
                      {isActive && (
                        <span className={`absolute -bottom-1 w-1 h-1 rounded-full ${isActive && hoveredIndex !== index ? 'bg-eco-accentGreen animate-pulse' : 'bg-eco-primary'}`} />
                      )}
                    </div>
                  </a>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

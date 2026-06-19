'use client';

import React, { useState } from 'react';
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

  const handleScroll = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    if (onItemClick) {
      onItemClick(targetId);
    }
  };

  return (
    <nav className="relative flex items-center space-x-1 py-1 px-1 bg-eco-soft/50 rounded-full border border-eco-mint/30 select-none overflow-x-auto no-scrollbar max-w-full shrink-0 mx-auto w-max max-w-none flex">
      {items.map((item, index) => {
        const isUpcoming = item.isUpcoming;
        const isActive = activeSection === item.targetId;

        return (
          <div
            key={index}
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
  );
}

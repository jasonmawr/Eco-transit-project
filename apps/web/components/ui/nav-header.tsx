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
  onUpcomingClick: (feature: string) => void;
  onItemClick?: (targetId: string) => void;
}

export function NavHeader({ items, onUpcomingClick, onItemClick }: NavHeaderProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleScroll = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    if (onItemClick) {
      onItemClick(targetId);
    }
  };

  return (
    <nav className="relative flex items-center space-x-1 py-1 px-1 bg-eco-soft/50 rounded-full border border-eco-mint/30 select-none">
      {items.map((item, index) => {
        const isUpcoming = item.isUpcoming;

        return (
          <div
            key={index}
            className="relative"
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

            {isUpcoming ? (
              <button
                type="button"
                onClick={() => onUpcomingClick(item.label)}
                className={`relative z-10 px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center space-x-1 focus:outline-none transition-colors duration-200 cursor-not-allowed ${
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
                className={`relative z-10 px-4 py-2 text-xs font-black uppercase tracking-wider block focus:outline-none transition-colors duration-200 ${
                  hoveredIndex === index ? 'text-eco-ink' : 'text-eco-primary hover:text-eco-primaryDeep'
                }`}
              >
                {item.label}
              </a>
            )}
          </div>
        );
      })}
    </nav>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
  value: string;
  label: string;
  icon?: string;
}

interface FluidDropdownProps {
  label?: string;
  placeholder: string;
  items: DropdownItem[];
  value: string;
  onChange: (value: string) => void;
  icon?: string;
}

export function FluidDropdown({
  label,
  placeholder,
  items,
  value,
  onChange,
  icon,
}: FluidDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedItem = items.find((item) => item.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (itemValue: string) => {
    onChange(itemValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="flex flex-col space-y-1.5 w-full select-none text-left">
      {label && (
        <label className="text-[10px] font-black text-eco-muted uppercase tracking-widest flex items-center space-x-1">
          {icon && <span>{icon}</span>}
          <span>{label}</span>
        </label>
      )}

      <div className="relative">
        {/* Toggle Button trigger */}
        <button
          type="button"
          onClick={handleToggle}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className="w-full flex items-center justify-between pl-4 pr-3.5 py-3 bg-white border border-eco-mint rounded-2xl text-xs font-bold text-eco-ink shadow-sm hover:bg-eco-soft transition-colors focus:outline-none focus:ring-2 focus:ring-eco-primary/30"
        >
          <div className="flex items-center space-x-2">
            {selectedItem?.icon && <span className="text-sm">{selectedItem.icon}</span>}
            <span className={selectedItem ? 'text-eco-ink' : 'text-eco-muted font-semibold'}>
              {selectedItem ? selectedItem.label : placeholder}
            </span>
          </div>
          
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="text-eco-muted"
          >
            <ChevronDown size={15} />
          </motion.div>
        </button>

        {/* Dropdown Options List Container */}
        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 4, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              role="listbox"
              className="absolute z-50 w-full bg-white border border-eco-mint/80 rounded-2xl shadow-xl p-1.5 space-y-1 max-h-[200px] overflow-y-auto"
            >
              {items.map((item) => {
                const isActive = item.value === value;
                return (
                  <li
                    key={item.value}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleSelect(item.value)}
                    className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-eco-primary text-white' 
                        : 'text-eco-ink hover:bg-eco-accentGreen hover:text-eco-ink'
                    }`}
                  >
                    {item.icon && <span className="text-sm shrink-0">{item.icon}</span>}
                    <span>{item.label}</span>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

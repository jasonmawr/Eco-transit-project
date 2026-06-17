'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, Search, Check, MapPin, Train } from 'lucide-react';

interface Station {
  id: string;
  name: string;
  lineName: string;
}

interface StationComboboxProps {
  label?: string;
  placeholder: string;
  stations: Station[];
  value: string;
  onChange: (value: string) => void;
  icon?: string;
}

// Helper function to remove Vietnamese diacritics for accents-insensitive search
function removeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export function StationCombobox({
  label,
  placeholder,
  stations,
  value,
  onChange,
  icon,
}: StationComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const selectedStation = useMemo(() => {
    return stations.find((st) => st.id === value);
  }, [stations, value]);

  // Accent-insensitive and case-insensitive filtering
  const filteredStations = useMemo(() => {
    if (!searchQuery.trim()) return stations;
    const cleanQuery = removeAccents(searchQuery.toLowerCase());
    return stations.filter((st) => {
      const cleanName = removeAccents(st.name.toLowerCase());
      const cleanLine = removeAccents(st.lineName.toLowerCase());
      return cleanName.includes(cleanQuery) || cleanLine.includes(cleanQuery);
    });
  }, [stations, searchQuery]);

  // Adjust focused index when filtered list changes
  useEffect(() => {
    setFocusedIndex(0);
  }, [filteredStations]);

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

  // Keyboard navigation & search logic
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        // Focus search input after opening
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => 
          filteredStations.length > 0 ? (prev + 1) % filteredStations.length : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => 
          filteredStations.length > 0 ? (prev - 1 + filteredStations.length) % filteredStations.length : 0
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredStations.length > 0 && filteredStations[focusedIndex]) {
          onChange(filteredStations[focusedIndex].id);
          setIsOpen(false);
          setSearchQuery('');
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;
      case 'Tab':
        // Let natural tab navigation happen but close dropdown
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Scroll focused item into view in dropdown list
  useEffect(() => {
    if (isOpen && listRef.current) {
      const focusedElement = listRef.current.children[focusedIndex] as HTMLElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, isOpen]);

  const handleSelect = (stationId: string) => {
    onChange(stationId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
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
        {/* Toggle Trigger Box */}
        <button
          type="button"
          onClick={handleTriggerClick}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`w-full flex items-center justify-between pl-4 pr-3.5 py-3 bg-white border rounded-2xl text-xs font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-eco-primary/30 ${
            isOpen ? 'border-eco-primary ring-2 ring-eco-primary/10' : 'border-eco-mint hover:bg-eco-soft'
          }`}
        >
          <div className="flex items-center space-x-2.5 truncate">
            <span className="text-eco-primary text-sm shrink-0">
              {selectedStation ? '🚉' : '📍'}
            </span>
            <div className="flex flex-col text-left truncate leading-tight">
              {selectedStation ? (
                <>
                  <span className="text-eco-ink text-xs font-black truncate">
                    {selectedStation.name}
                  </span>
                  <span className="text-[9px] text-eco-muted font-bold tracking-wider mt-0.5">
                    {selectedStation.lineName}
                  </span>
                </>
              ) : (
                <span className="text-eco-muted font-semibold">{placeholder}</span>
              )}
            </div>
          </div>
          
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 20 }}
            className="text-eco-muted shrink-0 ml-2"
          >
            <ChevronDown size={15} />
          </motion.div>
        </button>

        {/* Dropdown Options List */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 4, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="absolute z-50 w-full bg-white border border-eco-primary/10 rounded-2xl shadow-xl p-1.5 flex flex-col max-h-[280px] overflow-hidden"
            >
              {/* Custom Search Input Panel */}
              <div className="relative flex items-center px-2 py-1.5 border-b border-eco-mint/60 mb-1.5">
                <Search size={14} className="absolute left-4.5 text-eco-muted" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập tên ga để tìm kiếm..."
                  className="w-full pl-8 pr-3 py-2 bg-eco-soft border border-eco-mint rounded-xl text-xs font-bold text-eco-ink placeholder-eco-muted focus:outline-none focus:border-eco-primary focus:bg-white transition-colors"
                />
              </div>

              {/* Station Lists */}
              <ul
                ref={listRef}
                role="listbox"
                className="overflow-y-auto flex-1 space-y-0.5 max-h-[180px] pr-0.5"
              >
                {filteredStations.length > 0 ? (
                  filteredStations.map((station, index) => {
                    const isSelected = station.id === value;
                    const isFocused = index === focusedIndex;
                    
                    return (
                      <li
                        key={station.id}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(station.id)}
                        onMouseEnter={() => setFocusedIndex(index)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                          isSelected
                            ? 'bg-eco-primary text-white font-black'
                            : isFocused
                            ? 'bg-eco-accentGreen/15 border-l-4 border-eco-accentGreen text-eco-ink font-bold pl-2.5'
                            : 'text-eco-ink hover:bg-eco-soft hover:font-bold'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <Train size={13} className={isSelected ? 'text-white' : 'text-eco-primary'} />
                          <div className="flex flex-col text-left leading-tight truncate">
                            <span className="truncate">{station.name}</span>
                            <span className={`text-[8px] font-bold tracking-wider mt-0.5 ${
                              isSelected ? 'text-white/80' : 'text-eco-muted'
                            }`}>
                              {station.lineName}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <Check size={14} className="text-white shrink-0 ml-2" />
                        )}
                      </li>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-[11px] text-eco-muted font-bold">
                    🔍 Không tìm thấy ga/trạm nào
                  </div>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

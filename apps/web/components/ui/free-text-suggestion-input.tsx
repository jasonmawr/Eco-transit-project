'use client';

import React, { useState, useEffect, useRef } from 'react';

interface FreeTextSuggestionInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  name: string;
  maxLength?: number;
  required?: boolean;
  suggestions: string[];
  label: string;
}

// Helper function to remove Vietnamese diacritics for search comparisons
function removeDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export default function FreeTextSuggestionInput({
  value,
  onChange,
  placeholder,
  name,
  maxLength = 50,
  required = false,
  suggestions,
  label
}: FreeTextSuggestionInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on value (accent-insensitive & case-insensitive)
  const valueClean = removeDiacritics(value || '').toLowerCase();
  const filtered = suggestions.filter((item) =>
    removeDiacritics(item).toLowerCase().includes(valueClean)
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        setActiveIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
        break;
      case 'Enter':
        if (isOpen && filtered.length > 0 && activeIndex >= 0 && activeIndex < filtered.length) {
          e.preventDefault();
          onChange(filtered[activeIndex]);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const selectSuggestion = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className="space-y-1 relative w-full">
      <label className="text-[10px] font-black text-eco-ink uppercase tracking-wider block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        name={name}
        required={required}
        value={value}
        onFocus={() => {
          setIsOpen(true);
          setActiveIndex(0);
        }}
        onKeyDown={handleKeyDown}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setActiveIndex(0);
        }}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen && filtered.length > 0}
        aria-autocomplete="list"
        aria-controls={`${name}-suggestions`}
        className="w-full bg-white border border-gray-200 focus:border-eco-primary focus:ring-1 focus:ring-eco-primary outline-none px-4 py-2.5 rounded-2xl text-xs text-eco-ink font-medium transition-all"
      />

      {/* Suggestion list overlay with high z-index and pointer-events control */}
      {isOpen && filtered.length > 0 && (
        <div
          id={`${name}-suggestions`}
          role="listbox"
          className="absolute left-0 right-0 mt-1 bg-white border border-eco-primary/10 rounded-2xl shadow-2xl z-[100] overflow-y-auto max-h-48 py-1.5 no-scrollbar"
        >
          {filtered.map((item, idx) => {
            const isHighlighted = idx === activeIndex;
            return (
              <div
                key={item}
                role="option"
                aria-selected={isHighlighted}
                onClick={() => selectSuggestion(item)}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`w-full text-left px-4 py-2 text-xs font-semibold cursor-pointer transition-colors duration-150 ${
                  isHighlighted
                    ? 'bg-eco-mint text-eco-primary font-bold'
                    : 'text-eco-ink hover:bg-eco-soft'
                }`}
              >
                {item}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

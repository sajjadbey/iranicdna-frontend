import React, { useState, useEffect, useRef } from 'react';
import { Filter, ChevronDown } from 'lucide-react';

interface Props {
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

export const LocationSelector: React.FC<Props> = ({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder = 'All' 
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isMobile && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef, isMobile]);
  
  const handleSelect = (optionValue: string | null) => {
    onChange(optionValue);
    if (!isMobile) {
        setIsOpen(false);
    }
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-teal-200 mb-2 flex items-center gap-1">
        <Filter size={14} /> {label}
      </label>
      {isMobile ? (

        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="w-full rounded-lg bg-teal-900/70 text-teal-100 px-4 py-2 border border-teal-600 focus:ring-2 focus:ring-amber-500"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (

        <div className="relative" ref={dropdownRef}>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-left rounded-lg px-4 py-3 bg-teal-900/70 text-teal-100 flex justify-between items-center ring-1 ring-teal-600 hover:ring-teal-500 transition-shadow"
          >
            <span>{value ?? placeholder}</span>
            <ChevronDown 
              size={16} 
              className={`text-teal-300 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
            />
          </button>

          {isOpen && (
            <div 

              className="absolute z-10 w-full mt-2 flex flex-col space-y-1 p-2
              bg-teal-950/95 shadow-2xl rounded-lg border border-teal-700 backdrop-blur-sm"
            >

              <button
                onClick={() => handleSelect(null)}
                className="text-sm rounded-md px-3 py-2 bg-amber-800/80 text-white font-medium hover:bg-amber-700 transition-colors"
              >
                {placeholder}
              </button>
              
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`text-sm rounded-md px-3 py-2 w-full text-left truncate transition-colors ${
                    value === option ? 'bg-amber-700 text-white hover:bg-amber-600' : 'bg-teal-800/60 text-teal-100 hover:bg-teal-700/80'
                  }`}
                  title={option}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
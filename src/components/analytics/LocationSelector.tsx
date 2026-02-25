// LocationSelector.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    label: string;
    options: string[];
    subOptionsMap?: Record<string, string[]>;
    value: string | null;
    subValue?: string | null;
    onChange: (value: string | null) => void;
    onSubChange?: (sub: string | null, parent: string | null) => void;
    placeholder?: string;
}

// Explicit list of locations to exclude from display
const HIDDEN_LOCATIONS = ['türk'];

export const LocationSelector: React.FC<Props> = ({ 
    label, 
    options,
    subOptionsMap,
    value,
    subValue,
    onChange,
    onSubChange,
    placeholder = 'All' 
}) => {
    const [isMobile, setIsMobile] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [openSubGroup, setOpenSubGroup] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter out hidden locations from the options
    const filteredOptions = options.filter(option => 
        !HIDDEN_LOCATIONS.includes(option.toLowerCase())
    );

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
    
    const handleSelect = (optionValue: string | null, preventClose = false) => {
        onChange(optionValue);
        if (!isMobile && !preventClose) {
            setIsOpen(false);
        }
    }

    return (
        <div className="w-full">
            <label className="flex text-sm font-medium text-teal-200 mb-2 items-center gap-1">
                <Filter size={14} /> {label}
            </label>
            {isMobile ? (

                <select
                    value={subValue ? `${value}::::${subValue}` : (value ?? '')}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (!val) {
                            onChange(null);
                            onSubChange?.(null, null);
                        } else if (val.includes('::::')) {
                            const [parent, sub] = val.split('::::');
                            onChange(parent);
                            onSubChange?.(sub, parent);
                        } else {
                            onChange(val);
                            onSubChange?.(null, val);
                        }
                    }}
                    className="w-full rounded-lg bg-teal-900/70 text-teal-100 px-4 py-2 border border-teal-600 focus:ring-2 focus:ring-amber-500"
                >
                    <option value="">{placeholder}</option>
                    {filteredOptions.map((option) => (
                        <React.Fragment key={option}>
                            <option value={option}>{option}</option>
                            {subOptionsMap?.[option] && subOptionsMap[option].map(sub => (
                                <option key={sub} value={`${option}::::${sub}`}>  {sub}</option>
                            ))}
                        </React.Fragment>
                    ))}
                </select>
            ) : (

                <div className="relative" ref={dropdownRef}>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full text-left rounded-lg px-4 py-3 bg-teal-900/70 text-teal-100 flex justify-between items-center ring-1 ring-teal-600 hover:ring-teal-500 transition-shadow"
                    >
                        <span>{subValue ?? value ?? placeholder}</span>
                        <ChevronDown 
                            size={16} 
                            className={`text-teal-300 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
                        />
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ 
                                    duration: 0.2,
                                    ease: [0.4, 0, 0.2, 1]
                                }}
                                className="absolute z-10 w-full mt-2 flex flex-col space-y-1 p-2
                                bg-teal-950/95 shadow-2xl rounded-lg border border-teal-700 backdrop-blur-sm origin-top"
                            >
                                <motion.button
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.05, duration: 0.2 }}
                                    onClick={() => handleSelect(null)}
                                    className="text-sm rounded-md px-3 py-2 bg-amber-800/80 text-white font-medium hover:bg-amber-700 transition-colors"
                                >
                                    {placeholder}
                                </motion.button>
                                
                                {filteredOptions.map((option, index) => (
                                    <React.Fragment key={option}>
                                        <motion.button
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ 
                                                delay: 0.05 + (index + 1) * 0.03,
                                                duration: 0.2 
                                            }}
                                            onClick={() => {
                                                const hasSub = !!subOptionsMap?.[option];
                                                handleSelect(option, hasSub);
                                                onSubChange?.(null, option);
                                                if (hasSub) {
                                                    setOpenSubGroup(openSubGroup === option ? null : option);
                                                }
                                            }}
                                            className={`text-sm rounded-md px-3 py-2 w-full text-left truncate transition-colors ${
                                                value === option && !subValue ? 'bg-amber-700 text-white hover:bg-amber-600' : 'bg-teal-800/60 text-teal-100 hover:bg-teal-700/80'
                                            }`}
                                            title={option}
                                        >
                                            {option} {subOptionsMap?.[option] && <ChevronDown size={14} className={`inline ml-1 transition-transform ${openSubGroup === option ? 'rotate-180' : ''}`} />}
                                        </motion.button>
                                        {subOptionsMap?.[option] && openSubGroup === option && subOptionsMap[option].map(sub => (
                                            <motion.button
                                                key={sub}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.2 }}
                                                onClick={() => {
                                                    handleSelect(option);
                                                    onSubChange?.(sub, option);
                                                }}
                                                className={`text-sm rounded-md px-3 py-2 pl-6 w-full text-left truncate transition-colors ${
                                                    subValue === sub && value === option ? 'bg-amber-700 text-white hover:bg-amber-600' : 'bg-teal-800/40 text-teal-100 hover:bg-teal-700/60'
                                                }`}
                                            >
                                                {sub}
                                            </motion.button>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};
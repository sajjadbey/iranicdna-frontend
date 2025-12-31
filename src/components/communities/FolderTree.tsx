import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Users2, Crown, Dna, Globe } from 'lucide-react';
import Twemoji from 'react-twemoji';
import type { Tribe, Clan } from '../../types';

// Comprehensive map of country names and ethnicities to their flag emojis
const COUNTRY_FLAGS: Record<string, string> = {
  // Middle East & Central Asia
  'Iran': '🇮🇷',
  'Kurd': '🇮🇷',
  'Kurdish': '🇮🇷',
  'Lur': '🇮🇷',
  'Lurish': '🇮🇷',
  'Türk': '🇮🇷',
  'Turkish': '🇹🇷',
  'Nuristani': '🇦🇫',
  'Afghanistan': '🇦🇫',
  'Afghan': '🇦🇫',
  'Pashtun': '🇦🇫',
  'Pashto': '🇦🇫',
  'Tajikistan': '🇹🇯',
  'Tajik': '🇹🇯',
  'Uzbekistan': '🇺🇿',
  'Uzbek': '🇺🇿',
  'Turkmenistan': '🇹🇲',
  'Turkmen': '🇹🇲',
  'Pakistan': '🇵🇰',
  'Pakistani': '🇵🇰',
  'Turkey': '🇹🇷',
  'Turk': '🇹🇷',
  'Azerbaijan': '🇦🇿',
  'Azerbaijani': '🇦🇿',
  'Azeri': '🇦🇿',
  'Iraq': '🇮🇶',
  'Iraqi': '🇮🇶',
  'Arab': '🇮🇶',
  'Arabic': '🇸🇦',
  'Syria': '🇸🇾',
  'Syrian': '🇸🇾',
  'Armenia': '🇦🇲',
  'Armenian': '🇦🇲',
  'Georgia': '🇬🇪',
  'Georgian': '🇬🇪',
  'Kazakhstan': '🇰🇿',
  'Kazakh': '🇰🇿',
  'Kyrgyzstan': '🇰🇬',
  'Kyrgyz': '🇰🇬',
  'Saudi Arabia': '🇸🇦',
  'Saudi': '🇸🇦',
  'UAE': '🇦🇪',
  'United Arab Emirates': '🇦🇪',
  'Kuwait': '🇰🇼',
  'Kuwaiti': '🇰🇼',
  'Bahrain': '🇧🇭',
  'Qatar': '🇶🇦',
  'Oman': '🇴🇲',
  'Yemen': '🇾🇪',
  'Jordan': '🇯🇴',
  'Lebanon': '🇱🇧',
  'Lebanese': '🇱🇧',
  'Israel': '🇮🇱',
  'Palestine': '🇵🇸',
  'Palestinian': '🇵🇸',
  
  // South Asia
  'India': '🇮🇳',
  'Indian': '🇮🇳',
  'Bangladesh': '🇧🇩',
  'Bengali': '🇧🇩',
  'Nepal': '🇳🇵',
  'Nepali': '🇳🇵',
  'Bhutan': '🇧🇹',
  'Sri Lanka': '🇱🇰',
  'Maldives': '🇲🇻',
  
  // East Asia
  'China': '🇨🇳',
  'Chinese': '🇨🇳',
  'Japan': '🇯🇵',
  'Japanese': '🇯🇵',
  'Korea': '🇰🇷',
  'South Korea': '🇰🇷',
  'Korean': '🇰🇷',
  'North Korea': '🇰🇵',
  'Mongolia': '🇲🇳',
  'Mongolian': '🇲🇳',
  
  // Russia & Eastern Europe
  'Russia': '🇷🇺',
  'Russian': '🇷🇺',
  'Ukraine': '🇺🇦',
  'Ukrainian': '🇺🇦',
  'Belarus': '🇧🇾',
  'Moldova': '🇲🇩',
  
  // Europe
  'Germany': '🇩🇪',
  'German': '🇩🇪',
  'France': '🇫🇷',
  'French': '🇫🇷',
  'Italy': '🇮🇹',
  'Italian': '🇮🇹',
  'Spain': '🇪🇸',
  'Spanish': '🇪🇸',
  'Portugal': '🇵🇹',
  'Portuguese': '🇵🇹',
  'United Kingdom': '🇬🇧',
  'UK': '🇬🇧',
  'Britain': '🇬🇧',
  'British': '🇬🇧',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'Ireland': '🇮🇪',
  'Greek': '🇬🇷',
  'Greece': '🇬🇷',
  'Poland': '🇵🇱',
  'Polish': '🇵🇱',
  'Romania': '🇷🇴',
  'Romanian': '🇷🇴',
  'Czech Republic': '🇨🇿',
  'Czech': '🇨🇿',
  'Hungary': '🇭🇺',
  'Hungarian': '🇭🇺',
  'Austria': '🇦🇹',
  'Austrian': '🇦🇹',
  'Switzerland': '🇨🇭',
  'Swiss': '🇨🇭',
  'Sweden': '🇸🇪',
  'Swedish': '🇸🇪',
  'Norway': '🇳🇴',
  'Norwegian': '🇳🇴',
  'Denmark': '🇩🇰',
  'Danish': '🇩🇰',
  'Finland': '🇫🇮',
  'Finnish': '🇫🇮',
  'Netherlands': '🇳🇱',
  'Dutch': '🇳🇱',
  'Belgium': '🇧🇪',
  'Belgian': '🇧🇪',
  
  // Balkans
  'Albania': '🇦🇱',
  'Albanian': '🇦🇱',
  'Bosnia': '🇧🇦',
  'Bosnia and Herzegovina': '🇧🇦',
  'Croatia': '🇭🇷',
  'Croatian': '🇭🇷',
  'Serbia': '🇷🇸',
  'Serbian': '🇷🇸',
  'Montenegro': '🇲🇪',
  'North Macedonia': '🇲🇰',
  'Macedonia': '🇲🇰',
  'Bulgaria': '🇧🇬',
  'Bulgarian': '🇧🇬',
  'Kosovo': '🇽🇰',
  'Slovenia': '🇸🇮',
  'Slovenian': '🇸🇮',
  
  // Africa (selection)
  'Egypt': '🇪🇬',
  'Egyptian': '🇪🇬',
  'Morocco': '🇲🇦',
  'Moroccan': '🇲🇦',
  'Algeria': '🇩🇿',
  'Algerian': '🇩🇿',
  'Tunisia': '🇹🇳',
  'Tunisian': '🇹🇳',
  'Libya': '🇱🇾',
  'Ethiopia': '🇪🇹',
  'Ethiopian': '🇪🇹',
  'Somalia': '🇸🇴',
  'Somali': '🇸🇴',
  'Kenya': '🇰🇪',
  'South Africa': '🇿🇦',
  'Nigeria': '🇳🇬',
};

// Function to get flag emoji for a country or ethnicity
const getCountryFlag = (countryName: string): string | null => {
  // Check if country name ends with "Tribes" (ethnicity grouping)
  if (countryName.includes('Tribes')) {
    return null; // No flag for ethnicity groupings
  }
  
  // Direct match (case-sensitive)
  if (COUNTRY_FLAGS[countryName]) {
    return COUNTRY_FLAGS[countryName];
  }
  
  // Try case-insensitive match
  const lowerCountryName = countryName.toLowerCase();
  const matchedKey = Object.keys(COUNTRY_FLAGS).find(
    key => key.toLowerCase() === lowerCountryName
  );
  
  if (matchedKey) {
    return COUNTRY_FLAGS[matchedKey];
  }
  
  // Try partial match (country name contains or is contained in the key)
  const partialMatchKey = Object.keys(COUNTRY_FLAGS).find(
    key => {
      const lowerKey = key.toLowerCase();
      return lowerCountryName.includes(lowerKey) || lowerKey.includes(lowerCountryName);
    }
  );
  
  if (partialMatchKey) {
    return COUNTRY_FLAGS[partialMatchKey];
  }
  
  return null;
};

interface CountryHierarchy {
  country: string;
  tribes: {
    tribe: Tribe;
    clans: Clan[];
  }[];
}

interface FolderTreeProps {
  hierarchy: CountryHierarchy[];
  onTribeClick: (tribe: Tribe) => void;
  onClanClick: (clan: Clan) => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  hierarchy,
  onTribeClick,
  onClanClick,
}) => {
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());
  const [expandedTribes, setExpandedTribes] = useState<Set<string>>(new Set());

  const toggleCountry = (countryName: string) => {
    const newExpanded = new Set(expandedCountries);
    if (newExpanded.has(countryName)) {
      newExpanded.delete(countryName);
    } else {
      newExpanded.add(countryName);
    }
    setExpandedCountries(newExpanded);
  };

  const toggleTribe = (tribeName: string) => {
    const newExpanded = new Set(expandedTribes);
    if (newExpanded.has(tribeName)) {
      newExpanded.delete(tribeName);
    } else {
      newExpanded.add(tribeName);
    }
    setExpandedTribes(newExpanded);
  };

  // Calculate totals
  const totalTribes = hierarchy.reduce((sum, c) => sum + c.tribes.length, 0);
  const totalClans = hierarchy.reduce((sum, c) => 
    sum + c.tribes.reduce((clanSum, t) => clanSum + t.clans.length, 0), 0
  );

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-slate-900/40 rounded-2xl border-2 border-teal-600/30 backdrop-blur-sm overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900/60 to-cyan-900/60 px-3 sm:px-6 py-3 sm:py-4 border-b-2 border-teal-600/30">
          <div className="flex items-center gap-2 sm:gap-3">
            <Globe className="text-teal-300 flex-shrink-0" size={20} />
            <h2 className="text-base sm:text-xl font-bold text-teal-100 truncate">
              Communities by Region
            </h2>
            <div className="ml-auto text-xs sm:text-sm text-teal-300/80 whitespace-nowrap">
              {totalTribes} tribes, {totalClans} clans
            </div>
          </div>
        </div>

        {/* Tree Content */}
        <div className="p-3 sm:p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {hierarchy.length === 0 ? (
            <div className="text-center py-12 text-teal-400/60">
              No communities available
            </div>
          ) : (
            <div className="space-y-2">
              {hierarchy.map((countryData, countryIndex) => {
                const isCountryExpanded = expandedCountries.has(countryData.country);
                const countryTribes = countryData.tribes;

                return (
                  <motion.div
                    key={countryData.country}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: countryIndex * 0.05, duration: 0.3 }}
                    className="relative"
                  >
                    {/* Country Row */}
                    <div className="group">
                      <div
                        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-xl hover:bg-teal-900/30 transition-all border border-transparent hover:border-teal-600/40 cursor-pointer"
                        onClick={() => toggleCountry(countryData.country)}
                      >
                        {/* Country Icon/Flag */}
                        {(() => {
                          const flag = getCountryFlag(countryData.country);
                          if (flag) {
                            return (
                              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-blue-700/50 to-blue-900/50 flex items-center justify-center flex-shrink-0 text-2xl">
                                <Twemoji options={{ className: 'emoji-flag' }}>
                                  {flag}
                                </Twemoji>
                              </div>
                            );
                          }
                          return (
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-blue-700/50 to-blue-900/50 flex items-center justify-center flex-shrink-0">
                              <Globe className="text-blue-300" size={18} />
                            </div>
                          );
                        })()}

                        {/* Expand/Collapse Icon */}
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                          <motion.div
                            animate={{ rotate: isCountryExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="text-teal-400 hover:text-teal-300" size={16} />
                          </motion.div>
                        </div>

                        {/* Country Name */}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm sm:text-base font-bold text-blue-100 group-hover:text-blue-50 transition-colors truncate">
                            {countryData.country}
                          </span>
                        </div>

                        {/* Badges Container */}
                        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                          {/* Tribe Count Badge */}
                          <div className="px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-teal-900/40 border border-teal-600/30">
                            <span className="text-xs font-semibold text-teal-300">
                              {countryTribes.length} {countryTribes.length === 1 ? 'tribe' : 'tribes'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tribes List */}
                      <AnimatePresence mode="wait">
                        {isCountryExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ 
                              height: 'auto', 
                              opacity: 1,
                              transition: {
                                height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                                opacity: { duration: 0.3, delay: 0.1 }
                              }
                            }}
                            exit={{ 
                              height: 0, 
                              opacity: 0,
                              transition: {
                                height: { duration: 0.3, ease: [0.4, 0, 0.2, 1], delay: 0.1 },
                                opacity: { duration: 0.2 }
                              }
                            }}
                            className="overflow-hidden"
                          >
                            <div className="ml-4 sm:ml-8 mt-1 space-y-2 border-l-2 border-blue-700/30 pl-2 sm:pl-4">
                              {countryTribes.map((tribeData, tribeIndex) => {
                                const tribe = tribeData.tribe;
                                const tribeClans = tribeData.clans;
                                const isTribeExpanded = expandedTribes.has(tribe.name);
                                const hasClan = tribeClans.length > 0;

                                return (
                                  <motion.div
                                    key={tribe.name}
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ 
                                      opacity: 1, 
                                      x: 0,
                                      transition: {
                                        delay: tribeIndex * 0.08,
                                        duration: 0.4,
                                        ease: [0.4, 0, 0.2, 1]
                                      }
                                    }}
                                    exit={{ 
                                      opacity: 0, 
                                      x: 30,
                                      transition: {
                                        delay: (countryTribes.length - tribeIndex - 1) * 0.05,
                                        duration: 0.3,
                                        ease: [0.4, 0, 1, 1]
                                      }
                                    }}
                                    className="relative"
                                  >
                                    {/* Tribe Row */}
                                    <div className="group/tribe">
                                      <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-teal-900/20 transition-all border border-transparent hover:border-teal-600/30">
                                        {/* Tribe Icon */}
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-teal-700/50 to-teal-900/50 flex items-center justify-center flex-shrink-0">
                                          <Crown className="text-teal-300" size={14} />
                                        </div>

                                        {/* Expand/Collapse Icon */}
                                        {hasClan && (
                                          <div
                                            className="w-5 h-5 flex items-center justify-center cursor-pointer flex-shrink-0"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleTribe(tribe.name);
                                            }}
                                          >
                                            <motion.div
                                              animate={{ rotate: isTribeExpanded ? 90 : 0 }}
                                              transition={{ duration: 0.2 }}
                                            >
                                              <ChevronRight className="text-teal-400 hover:text-teal-300" size={14} />
                                            </motion.div>
                                          </div>
                                        )}

                                        {/* Tribe Name - opens modal */}
                                        <div
                                          className="flex-1 min-w-0 cursor-pointer"
                                          onClick={() => onTribeClick(tribe)}
                                        >
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                                            <span className="text-xs sm:text-sm font-semibold text-teal-100 group-hover/tribe:text-teal-50 transition-colors hover:underline truncate">
                                              {tribe.name}
                                            </span>
                                            {tribe.ethnicities && tribe.ethnicities.length > 0 && (
                                              <span className="text-xs text-teal-400/70 italic truncate">
                                                ({tribe.ethnicities.join(', ')})
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {/* Badges Container */}
                                        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                                          {/* Sample Count Badge */}
                                          {tribe.sample_count !== undefined && tribe.sample_count > 0 && (
                                            <div className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-amber-900/40 border border-amber-600/30 flex items-center gap-1">
                                              <Dna className="text-amber-300" size={12} />
                                              <span className="text-xs font-semibold text-amber-300">
                                                {tribe.sample_count}
                                              </span>
                                            </div>
                                          )}

                                          {/* Clan Count Badge */}
                                          {hasClan && (
                                            <div className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-cyan-900/40 border border-cyan-600/30">
                                              <span className="text-xs font-semibold text-cyan-300">
                                                {tribeClans.length}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Clans List */}
                                      <AnimatePresence mode="wait">
                                        {isTribeExpanded && hasClan && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ 
                                              height: 'auto', 
                                              opacity: 1,
                                              transition: {
                                                height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                                                opacity: { duration: 0.25, delay: 0.05 }
                                              }
                                            }}
                                            exit={{ 
                                              height: 0, 
                                              opacity: 0,
                                              transition: {
                                                height: { duration: 0.25, ease: [0.4, 0, 0.2, 1], delay: 0.05 },
                                                opacity: { duration: 0.15 }
                                              }
                                            }}
                                            className="overflow-hidden"
                                          >
                                            <div className="ml-4 sm:ml-6 mt-1 space-y-1 border-l-2 border-teal-700/30 pl-2 sm:pl-3">
                                              {tribeClans.map((clan, clanIndex) => (
                                                <motion.div
                                                  key={clan.name}
                                                  initial={{ opacity: 0, x: 20 }}
                                                  animate={{ 
                                                    opacity: 1, 
                                                    x: 0,
                                                    transition: {
                                                      delay: clanIndex * 0.06,
                                                      duration: 0.3,
                                                      ease: [0.4, 0, 0.2, 1]
                                                    }
                                                  }}
                                                  exit={{ 
                                                    opacity: 0, 
                                                    x: 20,
                                                    transition: {
                                                      delay: (tribeClans.length - clanIndex - 1) * 0.04,
                                                      duration: 0.25,
                                                      ease: [0.4, 0, 1, 1]
                                                    }
                                                  }}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    onClanClick(clan);
                                                  }}
                                                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-cyan-900/20 transition-all cursor-pointer group/clan border border-transparent hover:border-cyan-600/30"
                                                >
                                                  {/* Clan Icon */}
                                                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br from-cyan-800/40 to-teal-800/40 flex items-center justify-center border border-cyan-600/20 flex-shrink-0">
                                                    <Users2 className="text-cyan-400" size={10} />
                                                  </div>

                                                  {/* Clan Name */}
                                                  <div className="flex-1 min-w-0">
                                                    <div className="text-xs sm:text-sm font-medium text-cyan-100 group-hover/clan:text-cyan-50 transition-colors truncate">
                                                      {clan.name}
                                                    </div>
                                                    {clan.common_ancestor && (
                                                      <div className="text-xs text-cyan-400/60 truncate hidden sm:block">
                                                        {clan.common_ancestor}
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* Sample Count Badge */}
                                                  {clan.sample_count !== undefined && clan.sample_count > 0 && (
                                                    <div className="px-1.5 sm:px-2 py-0.5 rounded-lg bg-amber-900/40 border border-amber-600/30 flex items-center gap-1 flex-shrink-0">
                                                      <Dna className="text-amber-300" size={10} />
                                                      <span className="text-xs font-semibold text-amber-300">
                                                        {clan.sample_count}
                                                      </span>
                                                    </div>
                                                  )}

                                                  {/* Info indicator */}
                                                  <div className="text-xs text-cyan-400/40 group-hover/clan:text-cyan-400/70 transition-colors flex-shrink-0">
                                                    →
                                                  </div>
                                                </motion.div>
                                              ))}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-teal-900/40 to-cyan-900/40 px-3 sm:px-6 py-2 sm:py-3 border-t-2 border-teal-600/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-0 text-xs text-teal-300/70">
            <span className="hidden sm:block">Click to expand/collapse hierarchy</span>
            <span className="text-center">Click on items for details</span>
          </div>
        </div>
      </div>
    </div>
  );
};
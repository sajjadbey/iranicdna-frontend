import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, Loader2, Building2, Map as MapIcon } from 'lucide-react';
import { type Sample, type City } from '../../types';
import { generateUniqueColors } from '../../utils/colors';
import { graphqlService } from '../../services/graphqlService';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Province {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface ProvinceStats {
  name: string;
  sampleCount: number;
  dominantHaplogroup: string | null;
  haplogroupCounts: Record<string, number>;
  coordinates: [number, number];
}

interface CityStats {
  name: string;
  sampleCount: number;
  dominantHaplogroup: string | null;
  haplogroupCounts: Record<string, number>;
  coordinates: [number, number];
}

interface Props {
  samples: Sample[];
  selectedProvince: string | null;
  selectedCity: string | null;
  onProvinceClick?: (province: string) => void;
}


// Function to create a pie chart SVG icon
const createPieChartIcon = (
  haplogroupCounts: Record<string, number>,
  colorMap: Record<string, string>,
  size: number,
  isSelected: boolean
): L.DivIcon => {
  const total = Object.values(haplogroupCounts).reduce((sum, count) => sum + count, 0);
  const entries = Object.entries(haplogroupCounts).sort((a, b) => b[1] - a[1]);
  
  const borderColor = isSelected ? '#fbbf24' : '#5eead4';
  const borderWidth = isSelected ? 3 : 2;
  
  // Special case: if there's only one haplogroup, just draw a filled circle
  if (entries.length === 1) {
    const [haplogroup] = entries[0];
    const color = colorMap[haplogroup];
    
    const svgContent = `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="rgba(15, 23, 42, 0.8)" stroke="${borderColor}" stroke-width="${borderWidth}" />
        <circle cx="50" cy="50" r="45" fill="${color}" opacity="0.9" />
        <circle cx="50" cy="50" r="48" fill="none" stroke="${borderColor}" stroke-width="${borderWidth}" />
      </svg>
    `;
    
    return L.divIcon({
      html: svgContent,
      className: 'pie-chart-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }
  
  // Create SVG pie chart for multiple haplogroups
  let currentAngle = -90; // Start from top
  const slices = entries.map(([haplogroup, count]) => {
    const percentage = count / total;
    const angle = percentage * 360;
    const endAngle = currentAngle + angle;
    
    // Calculate path for pie slice
    const startX = 50 + 45 * Math.cos((currentAngle * Math.PI) / 180);
    const startY = 50 + 45 * Math.sin((currentAngle * Math.PI) / 180);
    const endX = 50 + 45 * Math.cos((endAngle * Math.PI) / 180);
    const endY = 50 + 45 * Math.sin((endAngle * Math.PI) / 180);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const path = `M 50 50 L ${startX} ${startY} A 45 45 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
    
    currentAngle = endAngle;
    
    return { path, color: colorMap[haplogroup] };
  });
  
  const svgContent = `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="rgba(15, 23, 42, 0.8)" stroke="${borderColor}" stroke-width="${borderWidth}" />
      ${slices.map(slice => `<path d="${slice.path}" fill="${slice.color}" opacity="0.9" />`).join('')}
      <circle cx="50" cy="50" r="48" fill="none" stroke="${borderColor}" stroke-width="${borderWidth}" />
    </svg>
  `;
  
  return L.divIcon({
    html: svgContent,
    className: 'pie-chart-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Component to handle map view updates
const MapViewController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const MapCard: React.FC<Props> = ({ samples, selectedProvince, selectedCity, onProvinceClick }) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewLevel, setViewLevel] = useState<'province' | 'city'>('province');
  
  // Reset view level when selections change
  useEffect(() => {
    if (!selectedProvince) {
      setViewLevel('province');
    }
  }, [selectedProvince, selectedCity]);

  // Fetch provinces and cities from GraphQL
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const provincesData = await graphqlService.fetchProvinces();
        
        const provincesFormatted: Province[] = provincesData.map(p => ({
          name: p.name,
          country: p.country.name,
          latitude: p.latitude || 0,
          longitude: p.longitude || 0,
          capital: null
        }));
        
        setProvinces(provincesFormatted);
        setCities([]);
        setError(null);
      } catch (err) {
        console.error('[DEBUG:MapCard] Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create province coordinates map from fetched data
  const provinceCoordinates = useMemo(() => {
    const coordsMap: Record<string, [number, number]> = {};
    provinces.forEach((province) => {
      coordsMap[province.name] = [province.latitude, province.longitude];
    });
    return coordsMap;
  }, [provinces]);

  // Create city coordinates map from fetched data
  const cityCoordinates = useMemo(() => {
    const coordsMap: Record<string, [number, number]> = {};
    cities.forEach((city) => {
      if (city.latitude !== null && city.longitude !== null) {
        coordsMap[city.name] = [city.latitude, city.longitude];
      }
    });
    return coordsMap;
  }, [cities]);

  // Calculate province statistics
  const provinceStats = useMemo<ProvinceStats[]>(() => {
    console.log('[DEBUG:MapCard] Calculating province stats...');
    console.log('[DEBUG:MapCard] - isLoading:', isLoading);
    console.log('[DEBUG:MapCard] - provinceCoordinates keys:', Object.keys(provinceCoordinates).length);
    console.log('[DEBUG:MapCard] - samples count:', samples.length);
    console.log('[DEBUG:MapCard] - selectedCity:', selectedCity);
    console.log('[DEBUG:MapCard] - selectedProvince:', selectedProvince);
    
    // Don't calculate stats if provinces aren't loaded yet
    if (isLoading || Object.keys(provinceCoordinates).length === 0) {
      console.log('[DEBUG:MapCard] Returning empty stats - loading or no coordinates');
      return [];
    }
    
    // If a specific city is selected, don't show province markers
    if (selectedCity) {
      console.log('[DEBUG:MapCard] Returning empty stats - city selected');
      return [];
    }
    
    const statsMap = new Map() as Map<string, ProvinceStats>;
    
    samples.forEach((sample) => {
      const province = sample.province || 'Unknown';
      const haplogroup = sample.y_dna?.root_haplogroup;
      const count = sample.count ?? 1;
      
      // If a province is selected, only show data for that province
      if (selectedProvince && province !== selectedProvince) {
        return;
      }
      
      // Skip if we don't have coordinates for this province
      const coords = provinceCoordinates[province];
      if (!coords || coords.length !== 2 || coords[0] == null || coords[1] == null) {
        return;
      }
      
      if (!statsMap.has(province)) {
        statsMap.set(province, {
          name: province,
          sampleCount: 0,
          dominantHaplogroup: null,
          haplogroupCounts: {},
          coordinates: coords,
        });
      }
      
      const stats = statsMap.get(province)!;
      stats.sampleCount += count;
      
      if (haplogroup) {
        stats.haplogroupCounts[haplogroup] = (stats.haplogroupCounts[haplogroup] || 0) + count;
      }
    });
    
    // Determine dominant haplogroup for each province
    statsMap.forEach((stats: ProvinceStats) => {
      const entries = Object.entries(stats.haplogroupCounts);
      if (entries.length > 0) {
        entries.sort((a, b) => b[1] - a[1]);
        stats.dominantHaplogroup = entries[0][0];
      }
    });
    
    return Array.from(statsMap.values());
  }, [samples, provinceCoordinates, isLoading, selectedProvince, selectedCity]);

  // Calculate city statistics when a province is selected
  const cityStats = useMemo<CityStats[]>(() => {
    // Only show cities when a province is selected
    if (!selectedProvince || isLoading || Object.keys(cityCoordinates).length === 0) {
      return [];
    }
    
    const statsMap = new Map() as Map<string, CityStats>;
    
    samples.forEach((sample) => {
      const city = sample.city || 'Unknown';
      const haplogroup = sample.y_dna?.root_haplogroup;
      const count = sample.count ?? 1;
      
      // If a specific city is selected, only include samples from that city
      if (selectedCity && city !== selectedCity) {
        return;
      }
      
      // Skip if we don't have coordinates for this city
      const coords = cityCoordinates[city];
      if (!coords || coords.length !== 2 || coords[0] == null || coords[1] == null) {
        return;
      }
      
      if (!statsMap.has(city)) {
        statsMap.set(city, {
          name: city,
          sampleCount: 0,
          dominantHaplogroup: null,
          haplogroupCounts: {},
          coordinates: coords,
        });
      }
      
      const stats = statsMap.get(city)!;
      stats.sampleCount += count;
      
      if (haplogroup) {
        stats.haplogroupCounts[haplogroup] = (stats.haplogroupCounts[haplogroup] || 0) + count;
      }
    });
    
    // Determine dominant haplogroup for each city
    statsMap.forEach((stats: CityStats) => {
      const entries = Object.entries(stats.haplogroupCounts);
      if (entries.length > 0) {
        entries.sort((a, b) => b[1] - a[1]);
        stats.dominantHaplogroup = entries[0][0];
      }
    });
    
    return Array.from(statsMap.values());
  }, [samples, cityCoordinates, isLoading, selectedProvince, selectedCity]);

  // Generate colors for haplogroups
  const allHaplogroups = useMemo(() => {
    const haplogroups = new Set<string>();
    provinceStats.forEach((stats) => {
      Object.keys(stats.haplogroupCounts).forEach((hg) => haplogroups.add(hg));
    });
    cityStats.forEach((stats) => {
      Object.keys(stats.haplogroupCounts).forEach((hg) => haplogroups.add(hg));
    });
    return Array.from(haplogroups);
  }, [provinceStats, cityStats]);

  const colorMap = useMemo(() => generateUniqueColors(allHaplogroups), [allHaplogroups]);

  const maxSamples = useMemo(() => {
    const provinceMax = Math.max(...provinceStats.map((s) => s.sampleCount), 0);
    const cityMax = Math.max(...cityStats.map((s) => s.sampleCount), 0);
    return Math.max(provinceMax, cityMax, 1);
  }, [provinceStats, cityStats]);

  // Calculate map center and zoom based on selected city, province, or all data
  const { mapCenter, mapZoom } = useMemo(() => {
    // If a specific city is selected, center on that city
    if (selectedCity && cityCoordinates[selectedCity]) {
      const coords = cityCoordinates[selectedCity];
      if (coords && coords.length === 2 && coords[0] != null && coords[1] != null) {
        return {
          mapCenter: coords as [number, number],
          mapZoom: 11,
        };
      }
    }
    
    // If a province is selected (but no city), center on that province
    if (selectedProvince && provinceCoordinates[selectedProvince]) {
      const coords = provinceCoordinates[selectedProvince];
      if (coords && coords.length === 2 && coords[0] != null && coords[1] != null) {
        return {
          mapCenter: coords as [number, number],
          mapZoom: 8,
        };
      }
    }
    
    // Default to Iran's center
    return {
      mapCenter: [32.4279, 53.6880] as [number, number],
      mapZoom: 5,
    };
  }, [selectedCity, selectedProvince, cityCoordinates, provinceCoordinates]);

  // Check if we have cities available for the selected province
  // IMPORTANT: This must be called BEFORE any early returns to avoid hook order issues
  const hasCitiesInProvince = useMemo(() => {
    if (!selectedProvince) return false;
    return cities.some(city => city.province === selectedProvince);
  }, [selectedProvince, cities]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-slate-800/60 rounded-2xl p-6 border border-teal-700/30">
        <h3 className="text-xl font-bold text-teal-200 mb-4 flex items-center gap-2">
          <MapPin size={20} />
          Geographic Distribution
        </h3>
        <div className="flex items-center justify-center py-20 text-teal-400">
          <Loader2 className="animate-spin mr-2" size={24} />
          <span>Loading map data...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-slate-800/60 rounded-2xl p-6 border border-teal-700/30">
        <h3 className="text-xl font-bold text-teal-200 mb-4 flex items-center gap-2">
          <MapPin size={20} />
          Geographic Distribution
        </h3>
        <div className="text-center py-8 text-red-400">
          Error loading map: {error}
        </div>
      </div>
    );
  }

  if (provinceStats.length === 0 && cityStats.length === 0) {
    return (
      <div className="bg-slate-800/60 rounded-2xl p-6 border border-teal-700/30">
        <h3 className="text-xl font-bold text-teal-200 mb-4 flex items-center gap-2">
          <MapPin size={20} />
          Geographic Distribution
        </h3>
        <div className="text-center py-8 text-teal-400">
          No geographic data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/60 rounded-2xl p-6 border border-teal-700/30">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-teal-200 flex items-center gap-2">
          <MapPin size={20} />
          <span className="hidden sm:inline">Geographic Distribution</span>
          <span className="sm:hidden">Distribution</span>
          {selectedProvince && (provinceStats.length > 0 || cityStats.length > 0) && (
            <span className="text-xs sm:text-sm font-normal text-teal-300/70">
              {selectedCity 
                ? `(${selectedCity})`
                : `(${selectedProvince})`
              }
            </span>
          )}
        </h3>
        
        {/* View Level Toggle - only show when province is selected and has cities */}
        {selectedProvince && !selectedCity && hasCitiesInProvince && (
          <div className="flex items-center gap-1 sm:gap-2 bg-slate-900/60 rounded-lg p-1 border border-teal-700/30 w-full sm:w-auto">
            <button
              onClick={() => setViewLevel('province')}
              className={`flex items-center justify-center gap-1.5 px-4 sm:px-3 py-2 sm:py-1.5 rounded text-sm sm:text-xs font-medium transition-all flex-1 sm:flex-initial ${
                viewLevel === 'province'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-teal-300 hover:text-teal-100'
              }`}
            >
              <MapIcon size={16} className="sm:w-3.5 sm:h-3.5" />
              <span>Province</span>
            </button>
            <button
              onClick={() => setViewLevel('city')}
              className={`flex items-center justify-center gap-1.5 px-4 sm:px-3 py-2 sm:py-1.5 rounded text-sm sm:text-xs font-medium transition-all flex-1 sm:flex-initial ${
                viewLevel === 'city'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-teal-300 hover:text-teal-100'
              }`}
            >
              <Building2 size={16} className="sm:w-3.5 sm:h-3.5" />
              <span>Cities</span>
            </button>
          </div>
        )}
      </div>
      
      <div className="h-[400px] sm:h-[500px] rounded-xl overflow-hidden border border-teal-700/30">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <MapViewController center={mapCenter} zoom={mapZoom} />
          
          {/* Dark theme tile layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {/* Province pie chart markers - only show in province view */}
          {viewLevel === 'province' && provinceStats.map((stats) => {
            const size = Math.max(40, Math.min(80, (stats.sampleCount / maxSamples) * 80));
            const isSelected = selectedProvince === stats.name;
            const icon = createPieChartIcon(stats.haplogroupCounts, colorMap, size, isSelected);
            
            return (
              <Marker
                key={`province-${stats.name}`}
                position={stats.coordinates}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    onProvinceClick?.(stats.name);
                  },
                }}
              >
                <Popup>
                  <div className="text-slate-900 p-2 min-w-[200px]">
                    <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                      <MapPin size={16} />
                      {stats.name}
                    </h4>
                    <p className="text-sm mb-2">
                      <strong>Samples:</strong> {stats.sampleCount}
                    </p>
                    {stats.dominantHaplogroup && (
                      <p className="text-sm mb-2">
                        <strong>Dominant:</strong>{' '}
                        <span
                          className="px-2 py-0.5 rounded text-white font-medium"
                          style={{ backgroundColor: colorMap[stats.dominantHaplogroup] }}
                        >
                          {stats.dominantHaplogroup}
                        </span>
                      </p>
                    )}
                    <div className="text-sm mt-2">
                      <strong>Haplogroups:</strong>
                      <ul className="mt-1 space-y-1">
                        {Object.entries(stats.haplogroupCounts)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([hg, count]: [string, number]) => (
                            <li key={hg} className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: colorMap[hg] }}
                              />
                              {hg}: {count as React.ReactNode}
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          
          {/* City pie chart markers (when a province is selected and city view is active) */}
          {viewLevel === 'city' && cityStats.map((stats) => {
            const size = Math.max(50, Math.min(100, (stats.sampleCount / maxSamples) * 100));
            const isSelected = selectedCity === stats.name;
            const icon = createPieChartIcon(stats.haplogroupCounts, colorMap, size, isSelected);
            
            return (
              <Marker
                key={`city-${stats.name}`}
                position={stats.coordinates}
                icon={icon}
              >
                <Popup>
                  <div className="text-slate-900 p-2 min-w-[200px]">
                    <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                      <MapPin size={16} />
                      {stats.name}
                    </h4>
                    <p className="text-sm mb-2">
                      <strong>Samples:</strong> {stats.sampleCount}
                    </p>
                    {stats.dominantHaplogroup && (
                      <p className="text-sm mb-2">
                        <strong>Dominant:</strong>{' '}
                        <span
                          className="px-2 py-0.5 rounded text-white font-medium"
                          style={{ backgroundColor: colorMap[stats.dominantHaplogroup] }}
                        >
                          {stats.dominantHaplogroup}
                        </span>
                      </p>
                    )}
                    <div className="text-sm mt-2">
                      <strong>Haplogroups:</strong>
                      <ul className="mt-1 space-y-1">
                        {Object.entries(stats.haplogroupCounts)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([hg, count]: [string, number]) => (
                            <li key={hg} className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: colorMap[hg] }}
                              />
                              {hg}: {count as React.ReactNode}
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
      
      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-teal-700/30">
        <p className="text-xs text-teal-300/70 mb-2">
          Circle size represents sample count • Color shows dominant haplogroup
          {selectedProvince && cityStats.length > 0 && ' • City-level view'}
          {selectedProvince && provinceStats.length > 0 && cityStats.length === 0 && ' • Province-level view'}
        </p>
        <div className="flex flex-wrap gap-2">
          {allHaplogroups.slice(0, 8).map((hg) => (
            <div
              key={hg}
              className="flex items-center gap-1 text-xs"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colorMap[hg] }}
              />
              <span className="text-teal-200">{hg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
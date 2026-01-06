// MapCard.tsx

import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, Loader2 } from 'lucide-react';
import { type Sample, type Province, type City } from '../../types';
import { generateUniqueColors } from '../../utils/colors';
import { API_ENDPOINTS } from '../../config/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

  // Fetch provinces and cities from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [provincesData, citiesData] = await Promise.all([
          fetch(API_ENDPOINTS.provinces).then(res => {
            if (!res.ok) throw new Error('Failed to fetch provinces');
            return res.json();
          }),
          fetch(API_ENDPOINTS.cities).then(res => {
            if (!res.ok) throw new Error('Failed to fetch cities');
            return res.json();
          })
        ]);
        setProvinces(provincesData);
        setCities(citiesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
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
  const provinceStats = useMemo(() => {
    // Don't calculate stats if provinces aren't loaded yet or if we're showing cities
    if (isLoading || Object.keys(provinceCoordinates).length === 0 || selectedProvince) {
      return [];
    }
    
    const statsMap = new Map<string, ProvinceStats>();
    
    samples.forEach((sample) => {
      const province = sample.province || 'Unknown';
      const haplogroup = sample.y_dna?.root_haplogroup;
      const count = sample.count ?? 1;
      
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
    statsMap.forEach((stats) => {
      const entries = Object.entries(stats.haplogroupCounts);
      if (entries.length > 0) {
        entries.sort((a, b) => b[1] - a[1]);
        stats.dominantHaplogroup = entries[0][0];
      }
    });
    
    return Array.from(statsMap.values());
  }, [samples, provinceCoordinates, isLoading, selectedProvince]);

  // Calculate city statistics when a province is selected
  const cityStats = useMemo(() => {
    // Only show cities when a province is selected
    if (!selectedProvince || isLoading || Object.keys(cityCoordinates).length === 0) {
      return [];
    }
    
    const statsMap = new Map<string, CityStats>();
    
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
    statsMap.forEach((stats) => {
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
        <h3 className="text-xl font-bold text-teal-200 mb-4 flex items-center gap-2">
          <MapPin size={20} />
          Geographic Distribution
          {selectedProvince && cityStats.length > 0 && (
            <span className="text-sm font-normal text-teal-300/70">
              {selectedCity 
                ? `(Showing ${selectedCity})`
                : `(Showing cities in ${selectedProvince})`
              }
            </span>
          )}
        </h3>
      
      <div className="h-[500px] rounded-xl overflow-hidden border border-teal-700/30">
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
          
          {/* Province pie chart markers (when no province is selected) */}
          {provinceStats.map((stats) => {
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
                          .map(([hg, count]) => (
                            <li key={hg} className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: colorMap[hg] }}
                              />
                              {hg}: {count}
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          
          {/* City pie chart markers (when a province is selected but no specific city) */}
          {cityStats.map((stats) => {
            const size = Math.max(30, Math.min(60, (stats.sampleCount / maxSamples) * 60));
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
                          .map(([hg, count]) => (
                            <li key={hg} className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: colorMap[hg] }}
                              />
                              {hg}: {count}
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
          {selectedProvince && cityStats.length > 0 && ' • Showing city-level data'}
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
import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import { type Sample } from '../../types';
import { generateUniqueColors } from '../../utils/colors';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ProvinceStats {
  name: string;
  sampleCount: number;
  dominantHaplogroup: string | null;
  haplogroupCounts: Record<string, number>;
  coordinates: [number, number];
}

interface Props {
  samples: Sample[];
  selectedProvince: string | null;
  onProvinceClick?: (province: string) => void;
}

// Approximate coordinates for Iranian provinces (latitude, longitude)
const PROVINCE_COORDINATES: Record<string, [number, number]> = {
  'Tehran': [35.6892, 51.3890],
  'Isfahan': [32.6546, 51.6680],
  'Shiraz': [29.5918, 52.5836],
  'Fars': [29.5918, 52.5836],
  'Tabriz': [38.0800, 46.2919],
  'East Azerbaijan': [38.0800, 46.2919],
  'West Azerbaijan': [37.4550, 45.0000],
  'Mashhad': [36.2605, 59.6168],
  'Khorasan': [36.2605, 59.6168],
  'Khuzestan': [31.3203, 48.6693],
  'Ahvaz': [31.3203, 48.6693],
  'Kerman': [30.2839, 57.0834],
  'Kermanshah': [34.3142, 47.0650],
  'Qom': [34.6416, 50.8746],
  'Yazd': [31.8974, 54.3569],
  'Ardabil': [38.2498, 48.2933],
  'Hamadan': [34.7992, 48.5146],
  'Zanjan': [36.6736, 48.4787],
  'Qazvin': [36.2688, 50.0041],
  'Semnan': [35.5769, 53.3920],
  'Gilan': [37.2808, 49.5926],
  'Mazandaran': [36.5659, 52.6783],
  'Golestan': [37.2895, 55.1376],
  'Bushehr': [28.9684, 50.8385],
  'Hormozgan': [27.1865, 56.2773],
  'Sistan and Baluchestan': [27.5295, 60.5820],
  'Chaharmahal and Bakhtiari': [31.9613, 50.8454],
  'Kohgiluyeh and Boyer-Ahmad': [30.6509, 51.6050],
  'Lorestan': [33.5819, 48.3623],
  'Markazi': [34.6149, 49.7008],
  'Ilam': [33.6374, 46.4227],
  'Kurdistan': [35.9553, 47.1362],
  'North Khorasan': [37.4711, 57.3317],
  'South Khorasan': [32.8663, 59.2164],
  'Alborz': [35.9968, 50.9289],
};

// Function to create a pie chart SVG icon
const createPieChartIcon = (
  haplogroupCounts: Record<string, number>,
  colorMap: Record<string, string>,
  size: number,
  isSelected: boolean
): L.DivIcon => {
  const total = Object.values(haplogroupCounts).reduce((sum, count) => sum + count, 0);
  const entries = Object.entries(haplogroupCounts).sort((a, b) => b[1] - a[1]);
  
  // Create SVG pie chart
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
  
  const borderColor = isSelected ? '#fbbf24' : '#5eead4';
  const borderWidth = isSelected ? 3 : 2;
  
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

export const MapCard: React.FC<Props> = ({ samples, selectedProvince, onProvinceClick }) => {
  // Calculate province statistics
  const provinceStats = useMemo(() => {
    const statsMap = new Map<string, ProvinceStats>();
    
    samples.forEach((sample) => {
      const province = sample.province || 'Unknown';
      const haplogroup = sample.y_dna?.root_haplogroup;
      const count = sample.count ?? 1;
      
      // Skip if we don't have coordinates for this province
      if (!PROVINCE_COORDINATES[province]) return;
      
      if (!statsMap.has(province)) {
        statsMap.set(province, {
          name: province,
          sampleCount: 0,
          dominantHaplogroup: null,
          haplogroupCounts: {},
          coordinates: PROVINCE_COORDINATES[province],
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
  }, [samples]);

  // Generate colors for haplogroups
  const allHaplogroups = useMemo(() => {
    const haplogroups = new Set<string>();
    provinceStats.forEach((stats) => {
      Object.keys(stats.haplogroupCounts).forEach((hg) => haplogroups.add(hg));
    });
    return Array.from(haplogroups);
  }, [provinceStats]);

  const colorMap = useMemo(() => generateUniqueColors(allHaplogroups), [allHaplogroups]);

  const maxSamples = useMemo(() => {
    return Math.max(...provinceStats.map((s) => s.sampleCount), 1);
  }, [provinceStats]);

  // Calculate map center and zoom based on selected province or all data
  const { mapCenter, mapZoom } = useMemo(() => {
    if (selectedProvince && PROVINCE_COORDINATES[selectedProvince]) {
      return {
        mapCenter: PROVINCE_COORDINATES[selectedProvince] as [number, number],
        mapZoom: 8,
      };
    }
    // Default to Iran's center
    return {
      mapCenter: [32.4279, 53.6880] as [number, number],
      mapZoom: 5,
    };
  }, [selectedProvince]);

  if (provinceStats.length === 0) {
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
          
          {/* Province pie chart markers */}
          {provinceStats.map((stats) => {
            const size = Math.max(40, Math.min(80, (stats.sampleCount / maxSamples) * 80));
            const isSelected = selectedProvince === stats.name;
            const icon = createPieChartIcon(stats.haplogroupCounts, colorMap, size, isSelected);
            
            return (
              <Marker
                key={stats.name}
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
        </MapContainer>
      </div>
      
      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-teal-700/30">
        <p className="text-xs text-teal-300/70 mb-2">
          Circle size represents sample count • Color shows dominant haplogroup
        </p>
        <div className="flex flex-wrap gap-2">
          {allHaplogroups.slice(0, 8).map((hg) => (
            <div key={hg} className="flex items-center gap-1 text-xs">
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
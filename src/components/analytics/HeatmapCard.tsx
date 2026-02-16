import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, useMap, GeoJSON } from 'react-leaflet';
import { MapPin, Flame, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { HaplogroupSelector } from './HaplogroupSelector';
import type { GeoJsonObject, Feature } from 'geojson';
import 'leaflet/dist/leaflet.css';
import { API_ENDPOINTS } from '../../config/api';
import { cachedFetch } from '../../utils/apiCache';

interface GeoJSONGeometry {
  type: string;
  coordinates: number[][][][];
}

interface HeatmapPoint {
  province: string;
  country: string;
  latitude: number;
  longitude: number;
  geometry: GeoJSONGeometry;
  sample_count: number;
  haplogroup?: string;
}

interface Props {
  selectedCountry?: string | null;
  selectedEthnicity?: string | null;
}

// Component to handle map view updates
const MapViewController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Normal CDF approximation for p-value calculation
const normalCDF = (x: number): number => {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
};

// Color scale based on shrunk frequency - Red and shades of red
const getColor = (shrunkFreq: number): string => {
  if (shrunkFreq >= 0.7) return '#7f1d1d'; // Very dark red - High
  if (shrunkFreq >= 0.5) return '#991b1b'; // Dark red - Medium-high
  if (shrunkFreq >= 0.3) return '#dc2626'; // Red - Medium
  if (shrunkFreq >= 0.15) return '#ef4444'; // Light red - Medium-low
  if (shrunkFreq >= 0.05) return '#f87171'; // Lighter red - Low
  return '#fca5a5'; // Very light red - Very low
};

export const HeatmapCard: React.FC<Props> = ({ 
  selectedCountry, 
  selectedEthnicity 
}) => {
  const [selectedHaplogroup, setSelectedHaplogroup] = useState<string | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [totalData, setTotalData] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch heatmap data with optimized filtering
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch haplogroup-specific data using root haplogroup filter
        const haplogroupParams = new URLSearchParams();
        if (selectedHaplogroup) {
          // Use y_dna_root parameter to get all subclades
          haplogroupParams.append('haplogroup', selectedHaplogroup);
        }
        if (selectedCountry) haplogroupParams.append('country', selectedCountry);
        if (selectedEthnicity) haplogroupParams.append('ethnicity', selectedEthnicity);
        
        const haplogroupUrl = `${API_ENDPOINTS.haplogroupHeatmap}?${haplogroupParams.toString()}`;
        console.log('[DEBUG:HeatmapCard] Fetching haplogroup data from:', haplogroupUrl);
        
        const haplogroupData = await cachedFetch<HeatmapPoint[]>(haplogroupUrl, {
          cacheOptions: { 
            ttl: 60 * 60 * 1000, // Cache for 60 minutes (heatmap data is stable)
            maxRetries: 4
          }
        });
        
        console.log('[DEBUG:HeatmapCard] Haplogroup data received:', haplogroupData?.length, haplogroupData);
        
        // Fetch total data (without haplogroup filter) for percentage calculation
        const totalParams = new URLSearchParams();
        if (selectedCountry) totalParams.append('country', selectedCountry);
        if (selectedEthnicity) totalParams.append('ethnicity', selectedEthnicity);
        
        const totalUrl = `${API_ENDPOINTS.haplogroupHeatmap}?${totalParams.toString()}`;
        console.log('[DEBUG:HeatmapCard] Fetching total data from:', totalUrl);
        
        const totalDataResult = await cachedFetch<HeatmapPoint[]>(totalUrl, {
          cacheOptions: { 
            ttl: 60 * 60 * 1000, // Cache for 60 minutes
            maxRetries: 4
          }
        });
        
        console.log('[DEBUG:HeatmapCard] Total data received:', totalDataResult?.length, totalDataResult);
        
        setHeatmapData(haplogroupData || []);
        setTotalData(totalDataResult || []);
      } catch (err) {
        console.error('[DEBUG:HeatmapCard] Failed to fetch heatmap data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load heatmap data');
        setHeatmapData([]);
        setTotalData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedHaplogroup, selectedCountry, selectedEthnicity]);

  // Calculate Empirical Bayes shrunk frequencies and statistics
  const statisticalData = useMemo(() => {
    console.log('[DEBUG:HeatmapCard] Calculating statistical data...');
    console.log('[DEBUG:HeatmapCard] - selectedHaplogroup:', selectedHaplogroup);
    console.log('[DEBUG:HeatmapCard] - heatmapData length:', heatmapData.length);
    console.log('[DEBUG:HeatmapCard] - totalData length:', totalData.length);
    
    if (!selectedHaplogroup) {
      console.log('[DEBUG:HeatmapCard] No haplogroup selected');
      return [];
    }
    
    if (heatmapData.length === 0 || totalData.length === 0) {
      console.log('[DEBUG:HeatmapCard] No data available');
      return [];
    }
    
    // Create a map of location to total samples
    const totalByLocation = new Map<string, number>();
    totalData.forEach(point => {
      const key = `${point.province}-${point.country}`;
      totalByLocation.set(key, point.sample_count);
    });
    
    // Calculate raw frequencies
    const rawData = heatmapData.map(point => {
      const key = `${point.province}-${point.country}`;
      const total = totalByLocation.get(key) || point.sample_count;
      const frequency = total > 0 ? point.sample_count / total : 0;
      
      return {
        ...point,
        totalSamples: total,
        rawFrequency: frequency,
        successes: point.sample_count,
        trials: total
      };
    }).filter(p => p.totalSamples > 0);
    
    if (rawData.length === 0) return [];
    
    // Estimate global parameters for Beta prior using method of moments
    const globalMean = rawData.reduce((sum, p) => sum + p.rawFrequency, 0) / rawData.length;
    const globalVariance = rawData.reduce((sum, p) => 
      sum + Math.pow(p.rawFrequency - globalMean, 2), 0
    ) / rawData.length;
    
    // Prevent division by zero and ensure valid parameters
    const safeMean = Math.max(0.001, Math.min(0.999, globalMean));
    const safeVariance = Math.max(0.0001, Math.min(safeMean * (1 - safeMean) * 0.9, globalVariance));
    
    // Calculate Beta parameters: α and β
    const temp = safeMean * (1 - safeMean) / safeVariance - 1;
    const alpha = Math.max(0.5, safeMean * temp);
    const beta = Math.max(0.5, (1 - safeMean) * temp);
    
    // Calculate shrunk frequencies and confidence intervals
    return rawData.map(point => {
      // Empirical Bayes shrunk estimate (posterior mean)
      const shrunkFrequency = (point.successes + alpha) / (point.trials + alpha + beta);
      
      // Wilson score confidence interval (95%)
      const z = 1.96; // 95% CI
      const p = point.rawFrequency;
      const n = point.trials;
      
      if (n === 0) {
        return {
          ...point,
          shrunkFrequency: 0,
          lowerCI: 0,
          upperCI: 0,
          pValue: 1,
          isSignificant: false,
          uncertainty: 1
        };
      }
      
      const denominator = 1 + z * z / n;
      const center = (p + z * z / (2 * n)) / denominator;
      const margin = z * Math.sqrt((p * (1 - p) / n + z * z / (4 * n * n))) / denominator;
      
      const lowerCI = Math.max(0, center - margin);
      const upperCI = Math.min(1, center + margin);
      
      // Two-tailed binomial test p-value (approximate using normal approximation)
      const expectedSuccesses = n * globalMean;
      const stdDev = Math.sqrt(n * globalMean * (1 - globalMean));
      const zScore = stdDev > 0 ? Math.abs(point.successes - expectedSuccesses) / stdDev : 0;
      const pValue = 2 * (1 - normalCDF(zScore));
      
      const isSignificant = pValue < 0.05;
      
      // Uncertainty measure: width of confidence interval
      const uncertainty = upperCI - lowerCI;
      
      return {
        ...point,
        shrunkFrequency,
        lowerCI,
        upperCI,
        pValue,
        isSignificant,
        uncertainty
      };
    });
  }, [heatmapData, totalData, selectedHaplogroup]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSamples = statisticalData.reduce((sum, point) => sum + point.sample_count, 0);
    const maxShrunkFreq = Math.max(...statisticalData.map(p => p.shrunkFrequency), 0);
    const avgShrunkFreq = statisticalData.length > 0 
      ? statisticalData.reduce((sum, p) => sum + p.shrunkFrequency, 0) / statisticalData.length 
      : 0;
    const locations = statisticalData.length;
    const significantLocations = statisticalData.filter(p => p.isSignificant).length;
    
    return { totalSamples, maxShrunkFreq, avgShrunkFreq, locations, significantLocations };
  }, [statisticalData]);

  // Calculate map center based on data
  const mapCenter = useMemo((): [number, number] => {
    if (statisticalData.length === 0) {
      return [32.4279, 53.6880]; // Default to Iran center
    }
    
    const validPoints = statisticalData.filter(p => 
      !isNaN(p.latitude) && !isNaN(p.longitude) && 
      isFinite(p.latitude) && isFinite(p.longitude)
    );
    
    if (validPoints.length === 0) {
      return [32.4279, 53.6880]; // Default to Iran center
    }
    
    const avgLat = validPoints.reduce((sum, p) => sum + p.latitude, 0) / validPoints.length;
    const avgLng = validPoints.reduce((sum, p) => sum + p.longitude, 0) / validPoints.length;
    
    // Ensure valid coordinates
    if (isNaN(avgLat) || isNaN(avgLng) || !isFinite(avgLat) || !isFinite(avgLng)) {
      return [32.4279, 53.6880];
    }
    
    return [avgLat, avgLng];
  }, [statisticalData]);

  const formatCount = (count: number): string => count.toLocaleString();

  if (error) {
    return (
      <div className="bg-slate-800/60 rounded-2xl p-6 border border-teal-700/30">
        <h3 className="text-xl font-bold text-teal-200 mb-4 flex items-center gap-2">
          <Flame size={20} />
          Haplogroup Heatmap
        </h3>
        <div className="text-center py-8 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/60 rounded-2xl p-6 border border-teal-700/30">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-teal-200 flex items-center gap-2 mb-4">
          <Flame size={20} />
          Haplogroup Heatmap
        </h3>
        
        {/* Haplogroup Selector */}
        <div className="max-w-md">
          <HaplogroupSelector
            value={selectedHaplogroup}
            onChange={setSelectedHaplogroup}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Flame size={20} className="text-amber-400" />
          </motion.div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        <div className="bg-teal-900/40 rounded-lg p-3 border border-teal-700/30">
          <div className="text-xs text-teal-300 mb-1">
            {selectedHaplogroup ? `${selectedHaplogroup} Samples` : 'Total Samples'}
          </div>
          <div className="text-lg font-bold text-teal-100">{formatCount(stats.totalSamples)}</div>
        </div>
        <div className="bg-teal-900/40 rounded-lg p-3 border border-teal-700/30">
          <div className="text-xs text-teal-300 mb-1">Locations</div>
          <div className="text-lg font-bold text-teal-100">{stats.locations}</div>
        </div>
        <div className="bg-teal-900/40 rounded-lg p-3 border border-teal-700/30">
          <div className="text-xs text-teal-300 mb-1">Avg Frequency</div>
          <div className="text-lg font-bold text-teal-100">
            {(stats.avgShrunkFreq * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-teal-900/40 rounded-lg p-3 border border-teal-700/30">
          <div className="text-xs text-teal-300 mb-1">Significant</div>
          <div className="text-lg font-bold text-teal-100 flex items-center gap-1">
            <TrendingUp size={16} className="text-amber-400" />
            {stats.significantLocations}
          </div>
        </div>
      </div>

      {!selectedHaplogroup ? (
        <div className="text-center py-16 text-teal-400 bg-slate-700/30 rounded-xl border border-teal-700/20">
          <Flame className="mx-auto mb-4 text-teal-500" size={56} />
          <p className="text-lg font-semibold mb-2">Select a Haplogroup</p>
          <p className="text-sm text-teal-500">
            Choose a haplogroup from the selector above to view its geographic distribution
          </p>
        </div>
      ) : statisticalData.length === 0 || loading ? (
        <div className="text-center py-12 text-teal-400 bg-slate-700/30 rounded-xl border border-teal-700/20">
          <MapPin className="mx-auto mb-3 text-teal-500" size={48} />
          <p>
            {loading 
              ? 'Loading heatmap data...'
              : `No geographic data available for ${selectedHaplogroup}`}
          </p>
        </div>
      ) : (
        <div className="h-[500px] rounded-xl overflow-hidden border border-teal-700/30" style={{ minHeight: '500px' }}>
          <MapContainer
            center={mapCenter}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
            key={`${mapCenter[0]}-${mapCenter[1]}`}
          >
            <MapViewController center={mapCenter} zoom={5} />
            
            {/* Dark theme tile layer */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {/* GeoJSON polygons colored by shrunk frequency */}
            {statisticalData.map((point) => {
              const color = getColor(point.shrunkFrequency);
              const fillOpacity = Math.max(0.3, 1 - point.uncertainty);
              const borderColor = '#334155'; // slate-700 - contrasts with red
              const borderWeight = 1.5;
              
              const featureData: Feature = {
                type: 'Feature',
                properties: {
                  province: point.province,
                  country: point.country,
                  rawFrequency: point.rawFrequency,
                  shrunkFrequency: point.shrunkFrequency,
                  lowerCI: point.lowerCI,
                  upperCI: point.upperCI,
                  sampleCount: point.sample_count,
                  totalSamples: point.totalSamples,
                  pValue: point.pValue,
                  isSignificant: point.isSignificant
                },
                geometry: point.geometry as any
              };
              
              return (
                <GeoJSON
                  key={`${point.province}-${point.country}`}
                  data={featureData as GeoJsonObject}
                  style={{
                    fillColor: color,
                    fillOpacity: fillOpacity,
                    color: borderColor,
                    weight: borderWeight,
                    opacity: 0.6
                  }}
                  onEachFeature={(feature, layer) => {
                    const props = feature.properties;
                    if (!props) return;
                    
                    layer.bindPopup(`
                      <div class="text-slate-900 p-2 max-w-[90vw] sm:min-w-[250px]">
                        <h4 class="font-bold text-base sm:text-lg mb-2 flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="flex-shrink-0">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          <span class="break-words">${props.province}, ${props.country}</span>
                        </h4>
                        
                        <div class="space-y-1 text-xs sm:text-sm">
                          <p class="flex flex-wrap items-center gap-1">
                            <strong class="whitespace-nowrap">Raw Frequency:</strong> 
                            <span>${(props.rawFrequency * 100).toFixed(2)}%</span>
                          </p>
                          <p class="flex flex-wrap items-center gap-1">
                            <strong class="whitespace-nowrap">Adjusted Frequency:</strong> 
                            <span class="font-semibold" style="color: ${color}">
                              ${(props.shrunkFrequency * 100).toFixed(2)}%
                            </span>
                          </p>
                          <p class="flex flex-wrap items-center gap-1">
                            <strong class="whitespace-nowrap">95% CI:</strong> 
                            <span class="break-all">[${(props.lowerCI * 100).toFixed(2)}%, ${(props.upperCI * 100).toFixed(2)}%]</span>
                          </p>
                          <p class="flex flex-wrap items-center gap-1">
                            <strong class="whitespace-nowrap">Sample Size:</strong> 
                            <span>${formatCount(props.sampleCount)} / ${formatCount(props.totalSamples)}</span>
                          </p>
                          <p class="flex flex-wrap items-center gap-1">
                            <strong class="whitespace-nowrap">P-value:</strong> 
                            <span>${props.pValue < 0.001 ? '<0.001' : props.pValue.toFixed(3)}</span>
                            ${props.isSignificant ? '<span class="ml-1 px-1.5 py-0.5 bg-amber-400 text-white text-[10px] sm:text-xs rounded font-semibold whitespace-nowrap">Significant</span>' : ''}
                          </p>
                        </div>
                        
                        <div class="mt-2 pt-2 border-t border-slate-300 text-[10px] sm:text-xs text-slate-600">
                          <p>Color = adjusted frequency</p>
                          <p>Opacity = confidence</p>
                        </div>
                      </div>
                    `, {
                      maxWidth: 300,
                      className: 'leaflet-popup-mobile-friendly'
                    });
                    
                    // Add hover effect
                    layer.on({
                      mouseover: (e) => {
                        const layer = e.target;
                        layer.setStyle({
                          weight: borderWeight + 1,
                          fillOpacity: Math.min(1, fillOpacity + 0.2),
                          opacity: 1
                        });
                      },
                      mouseout: (e) => {
                        const layer = e.target;
                        layer.setStyle({
                          weight: borderWeight,
                          fillOpacity: fillOpacity,
                          opacity: 0.6
                        });
                      }
                    });
                  }}
                />
              );
            })}
          </MapContainer>
        </div>
      )}

      {/* Legend */}
      {statisticalData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-teal-700/30 space-y-3">
          {/* Color scale */}
          <div>
            <p className="text-xs text-teal-300/70 mb-2">Adjusted Frequency Scale (Empirical Bayes)</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-teal-300">0%</span>
              <div className="flex-1 h-3 rounded-full flex">
                <div className="flex-1" style={{ backgroundColor: '#fca5a5' }} />
                <div className="flex-1" style={{ backgroundColor: '#f87171' }} />
                <div className="flex-1" style={{ backgroundColor: '#ef4444' }} />
                <div className="flex-1" style={{ backgroundColor: '#dc2626' }} />
                <div className="flex-1" style={{ backgroundColor: '#991b1b' }} />
                <div className="flex-1" style={{ backgroundColor: '#7f1d1d' }} />
              </div>
              <span className="text-xs text-teal-300">100%</span>
            </div>
          </div>
          
          {/* Legend items */}
          <div className="grid grid-cols-2 gap-2 text-xs text-teal-300">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc2626' }} />
              <span>Province fill = adjusted frequency</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border" style={{ backgroundColor: '#dc2626', borderColor: '#334155' }} />
              <span>Dark slate border for definition</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded opacity-30" style={{ backgroundColor: '#dc2626' }} />
              <span>Lower opacity = higher uncertainty</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-amber-400" />
              <span>{stats.significantLocations} significant hotspots</span>
            </div>
          </div>
          
          {/* Top locations by shrunk frequency */}
          {selectedHaplogroup && statisticalData.length > 0 && (
            <div>
              <p className="text-xs text-teal-300/70 mb-2">Highest Frequency Locations (Adjusted):</p>
              <div className="flex flex-wrap gap-2">
                {statisticalData
                  .sort((a, b) => b.shrunkFrequency - a.shrunkFrequency)
                  .slice(0, 5)
                  .map((point) => (
                    <div
                      key={`${point.province}-${point.country}`}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${
                        point.isSignificant 
                          ? 'bg-amber-900/40 border-amber-700/50' 
                          : 'bg-teal-900/40 border-teal-700/30'
                      }`}
                    >
                      <MapPin size={12} className={point.isSignificant ? 'text-amber-400' : 'text-teal-400'} />
                      <span className="text-teal-200">{point.province}</span>
                      <span className="text-teal-400">
                        {(point.shrunkFrequency * 100).toFixed(1)}%
                      </span>
                      <span className="text-teal-500 text-[10px]">
                        (n={formatCount(point.totalSamples)})
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
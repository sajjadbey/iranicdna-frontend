import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';
import { MapPin, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { HaplogroupSelector } from './HaplogroupSelector';
import 'leaflet/dist/leaflet.css';

const API_BASE = 'https://qizilbash.ir/genetics';

interface HeatmapPoint {
  province: string;
  country: string;
  latitude: number;
  longitude: number;
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

export const HeatmapCard: React.FC<Props> = ({ 
  selectedCountry, 
  selectedEthnicity 
}) => {
  const [selectedHaplogroup, setSelectedHaplogroup] = useState<string | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch heatmap data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        if (selectedHaplogroup) params.append('haplogroup', selectedHaplogroup);
        if (selectedCountry) params.append('country', selectedCountry);
        if (selectedEthnicity) params.append('ethnicity', selectedEthnicity);
        
        const url = `${API_BASE}/haplogroup/heatmap/?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: HeatmapPoint[] = await res.json();
        setHeatmapData(data || []);
      } catch (err) {
        console.error('Failed to fetch heatmap data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load heatmap data');
        setHeatmapData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedHaplogroup, selectedCountry, selectedEthnicity]);

  // Convert data to heatmap format
  const heatmapPoints = useMemo(() => {
    return heatmapData.map(point => ({
      lat: point.latitude,
      lng: point.longitude,
      intensity: point.sample_count
    }));
  }, [heatmapData]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSamples = heatmapData.reduce((sum, point) => sum + point.sample_count, 0);
    const maxSamples = Math.max(...heatmapData.map(p => p.sample_count), 0);
    const locations = heatmapData.length;
    
    return { totalSamples, maxSamples, locations };
  }, [heatmapData]);

  // Calculate map center based on data
  const mapCenter = useMemo((): [number, number] => {
    if (heatmapData.length === 0) {
      return [32.4279, 53.6880]; // Default to Iran center
    }
    
    const validPoints = heatmapData.filter(p => 
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
  }, [heatmapData]);

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
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4"
      >
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center justify-between mb-4"
      >
        
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Flame size={20} className="text-amber-400" />
          </motion.div>
        )}
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-3 gap-4 mb-4"
      >
        <div className="bg-teal-900/40 rounded-lg p-3 border border-teal-700/30">
          <div className="text-xs text-teal-300 mb-1">Total Samples</div>
          <div className="text-lg font-bold text-teal-100">{formatCount(stats.totalSamples)}</div>
        </div>
        <div className="bg-teal-900/40 rounded-lg p-3 border border-teal-700/30">
          <div className="text-xs text-teal-300 mb-1">Locations</div>
          <div className="text-lg font-bold text-teal-100">{stats.locations}</div>
        </div>
        <div className="bg-teal-900/40 rounded-lg p-3 border border-teal-700/30">
          <div className="text-xs text-teal-300 mb-1">Max Samples</div>
          <div className="text-lg font-bold text-teal-100">{formatCount(stats.maxSamples)}</div>
        </div>
      </motion.div>

      {heatmapData.length === 0 || loading ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-12 text-teal-400 bg-slate-700/30 rounded-xl border border-teal-700/20"
        >
          <MapPin className="mx-auto mb-3 text-teal-500" size={48} />
          <p>
            {loading 
              ? 'Loading heatmap data...'
              : selectedHaplogroup 
                ? `No geographic data available for ${selectedHaplogroup}` 
                : 'Select a haplogroup to view heatmap'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-[500px] rounded-xl overflow-hidden border border-teal-700/30"
        >
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
            
            {/* Heatmap layer */}
            {heatmapPoints.length > 0 && (
              <HeatmapLayer
                points={heatmapPoints}
                longitudeExtractor={(point: any) => point.lng}
                latitudeExtractor={(point: any) => point.lat}
                intensityExtractor={(point: any) => point.intensity}
                radius={25}
                blur={15}
                max={stats.maxSamples}
                gradient={{
                  0.0: '#0d9488',
                  0.3: '#14b8a6',
                  0.5: '#fbbf24',
                  0.7: '#f59e0b',
                  1.0: '#dc2626'
                }}
              />
            )}
          </MapContainer>
        </motion.div>
      )}

      {/* Legend */}
      {heatmapData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-4 pt-4 border-t border-teal-700/30"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-teal-300/70">
              Intensity Scale
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-teal-300">Low</span>
              <div className="w-32 h-3 rounded-full" style={{
                background: 'linear-gradient(to right, #0d9488, #14b8a6, #fbbf24, #f59e0b, #dc2626)'
              }} />
              <span className="text-xs text-teal-300">High</span>
            </div>
          </div>
          
          {/* Top locations */}
          {heatmapData.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-teal-300/70 mb-2">Top Locations:</p>
              <div className="flex flex-wrap gap-2">
                {heatmapData
                  .slice(0, 5)
                  .map((point, index) => (
                    <motion.div
                      key={`${point.province}-${point.country}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                      className="flex items-center gap-1 text-xs bg-teal-900/40 px-2 py-1 rounded border border-teal-700/30"
                    >
                      <MapPin size={12} className="text-amber-400" />
                      <span className="text-teal-200">{point.province}</span>
                      <span className="text-teal-400">({formatCount(point.sample_count)})</span>
                    </motion.div>
                  ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
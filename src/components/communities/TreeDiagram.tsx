import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, Users2, Crown, Sparkles } from 'lucide-react';
import type { Tribe, Clan } from '../../types';

interface TreeDiagramProps {
  tribes: Tribe[];
  clansByTribe: Record<string, Clan[]>;
  onTribeClick: (tribe: Tribe) => void;
  onClanClick: (clan: Clan) => void;
}

export const TreeDiagram: React.FC<TreeDiagramProps> = ({
  tribes,
  clansByTribe,
  onTribeClick,
  onClanClick,
}) => {
  // Calculate node sizes based on clan count
  const getNodeSize = (clanCount: number) => {
    const minSize = 240;
    const maxSize = 380;
    const maxClans = Math.max(...tribes.map(t => (clansByTribe[t.name] || []).length));
    if (maxClans === 0) return minSize;
    const ratio = clanCount / maxClans;
    return minSize + (maxSize - minSize) * ratio;
  };

  // Calculate initial zoom based on content and screen
  const calculateInitialZoom = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Calculate total width needed
    let totalContentWidth = 0;
    let maxContentHeight = 0;
    
    tribes.forEach((tribe, index) => {
      const tribeClans = clansByTribe[tribe.name] || [];
      const clanCount = tribeClans.length;
      const tribeNodeWidth = getNodeSize(clanCount);
      
      // Clans width: 240px per clan + 32px gap between clans (gap-8)
      const clansWidth = clanCount > 0 ? clanCount * 240 + (clanCount - 1) * 32 : 0;
      
      // Take the maximum of tribe width and clans width
      const sectionWidth = Math.max(tribeNodeWidth, clansWidth);
      totalContentWidth += sectionWidth;
      
      // Add gap between tribes (80px = gap-20)
      if (index < tribes.length - 1) {
        totalContentWidth += 80;
      }
      
      // Calculate height: tribe card (180px) + gap (24*4=96px) + connection (20*4=80px) + clans (if any)
      const sectionHeight = 180 + 96 + (clanCount > 0 ? 80 + 160 : 0); // 160px for clan cards
      maxContentHeight = Math.max(maxContentHeight, sectionHeight);
    });
    
    // Add padding
    const horizontalPadding = screenWidth < 768 ? 80 : 160;
    const verticalPadding = 200; // Top and bottom padding
    
    const availableWidth = screenWidth - horizontalPadding;
    const availableHeight = screenHeight - verticalPadding;
    
    // Calculate zoom to fit both width and height
    const widthZoom = totalContentWidth > availableWidth ? availableWidth / totalContentWidth : 1;
    const heightZoom = maxContentHeight > availableHeight ? availableHeight / maxContentHeight : 1;
    
    // Use the smaller zoom to ensure everything fits
    const calculatedZoom = Math.min(widthZoom, heightZoom, 1);
    
    // No minimum zoom limit - allow zooming out as much as needed
    return calculatedZoom;
  };

  const [zoom, setZoom] = useState(() => calculateInitialZoom());
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [hoveredTribe, setHoveredTribe] = useState<string | null>(null);
  const [hoveredClan, setHoveredClan] = useState<string | null>(null);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.1)); // Allow zooming out to 10%
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Only zoom if Ctrl key is pressed, otherwise allow normal scrolling
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((prev) => Math.max(0.1, Math.min(2, prev + delta)));
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setZoom(calculateInitialZoom());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [tribes, clansByTribe]);

  return (
    <div className="relative">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #14b8a6 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleZoomIn}
          className="p-3 rounded-xl bg-gradient-to-br from-slate-700/80 to-slate-800/80 hover:from-slate-600/90 hover:to-slate-700/90 border-2 border-teal-600/40 hover:border-teal-500/60 transition-all backdrop-blur-md shadow-lg shadow-teal-900/20"
          title="Zoom In"
        >
          <ZoomIn className="text-teal-300" size={22} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleZoomOut}
          className="p-3 rounded-xl bg-gradient-to-br from-slate-700/80 to-slate-800/80 hover:from-slate-600/90 hover:to-slate-700/90 border-2 border-teal-600/40 hover:border-teal-500/60 transition-all backdrop-blur-md shadow-lg shadow-teal-900/20"
          title="Zoom Out"
        >
          <ZoomOut className="text-teal-300" size={22} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleResetZoom}
          className="p-3 rounded-xl bg-gradient-to-br from-slate-700/80 to-slate-800/80 hover:from-slate-600/90 hover:to-slate-700/90 border-2 border-teal-600/40 hover:border-teal-500/60 transition-all backdrop-blur-md shadow-lg shadow-teal-900/20"
          title="Reset View"
        >
          <Maximize2 className="text-teal-300" size={22} />
        </motion.button>
      </div>

      {/* Zoomable Container */}
      <div
        className={`overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ minHeight: '700px' }}
      >
        <motion.div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
            transformOrigin: 'center top',
          }}
          className="py-16"
        >
          <div className="flex gap-20 justify-center items-start px-8">
            {tribes.map((tribe, tribeIndex) => {
              const tribeClans = clansByTribe[tribe.name] || [];
              const clanCount = tribeClans.length;
              const nodeSize = getNodeSize(clanCount);
              const isHovered = hoveredTribe === tribe.name;

              return (
                <motion.div
                  key={tribe.name}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: tribeIndex * 0.2, duration: 0.6, type: 'spring' }}
                  className="flex flex-col items-center"
                >
                  {/* Tribe Card */}
                  <div className="relative mb-24 pt-8">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onTribeClick(tribe)}
                      onMouseEnter={() => setHoveredTribe(tribe.name)}
                      onMouseLeave={() => setHoveredTribe(null)}
                      className="relative cursor-pointer group"
                    >
                      {/* Animated glow effect - only on hover */}
                      <motion.div
                        animate={{
                          opacity: isHovered ? [0.3, 0.6, 0.3] : 0,
                          scale: isHovered ? [1, 1.1, 1] : 1,
                        }}
                        transition={{
                          opacity: { duration: isHovered ? 2 : 0.3, repeat: isHovered ? Infinity : 0 },
                          scale: { duration: isHovered ? 2 : 0.3, repeat: isHovered ? Infinity : 0 }
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 rounded-3xl blur-2xl"
                      />

                      {/* Crown icon - positioned above card */}
                      <motion.div
                        animate={{ rotate: isHovered ? [0, -10, 10, 0] : 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-xl border-4 border-slate-900 z-10"
                      >
                        <Crown className="text-teal-100" size={32} />
                      </motion.div>

                      {/* Main card */}
                      <div
                        className="relative bg-gradient-to-br from-teal-900/95 via-cyan-900/95 to-teal-950/95 rounded-3xl px-8 py-10 shadow-2xl backdrop-blur-sm border-2 border-teal-600/40 overflow-hidden"
                        style={{ minWidth: `${nodeSize}px`, minHeight: '180px' }}
                      >
                        {/* Decorative pattern overlay */}
                        <div className="absolute inset-0 opacity-5" style={{
                          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, #14b8a6 10px, #14b8a6 11px)`
                        }} />

                        {/* Decorative corner ornaments - inside card */}
                        <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-teal-500/40" />
                        <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-teal-500/40" />
                        <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-teal-500/40" />
                        <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-teal-500/40" />

                        <div className="text-center relative z-10 pt-2">
                          <h3 className="text-2xl md:text-3xl font-bold text-teal-100 mb-2 drop-shadow-lg leading-tight" style={{ fontFamily: 'Cinzel, serif' }}>
                            {tribe.name}
                          </h3>
                          {tribe.ethnicity && (
                            <p className="text-sm md:text-base text-teal-300/90 mb-4 italic leading-snug" style={{ fontFamily: 'Lato, sans-serif' }}>
                              {tribe.ethnicity}
                            </p>
                          )}
                          
                          {/* Divider */}
                          <div className="flex items-center justify-center gap-2 my-3">
                            <div className="h-px w-8 bg-gradient-to-r from-transparent to-teal-500/50" />
                            <Sparkles className="text-teal-500" size={14} />
                            <div className="h-px w-8 bg-gradient-to-l from-transparent to-teal-500/50" />
                          </div>

                          <div className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-950/60 border border-teal-600/40 shadow-lg">
                            <Users2 className="text-teal-400" size={18} />
                            <span className="text-sm font-semibold text-teal-200" style={{ fontFamily: 'Lato, sans-serif' }}>
                              {clanCount} {clanCount === 1 ? 'Clan' : 'Clans'}
                            </span>
                          </div>
                        </div>

                        {/* Shine effect */}
                        <motion.div
                          animate={{
                            x: isHovered ? ['-100%', '200%'] : '-100%',
                          }}
                          transition={{ duration: 1.5, ease: 'easeInOut' }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                        />
                      </div>
                    </motion.div>

                    {/* Connection line down from tribe */}
                    {clanCount > 0 && (
                      <div className="absolute left-1/2 -bottom-24 w-0.5 h-24 bg-teal-500 -translate-x-px" />
                    )}
                  </div>

                  {/* Clans Level */}
                  {clanCount > 0 && (
                    <div className="relative w-full flex justify-center">
                      <div className="relative inline-flex gap-8">
                        {/* Connection lines container */}
                        <div className="absolute left-0 right-0 top-0 h-20 pointer-events-none">
                          {/* Horizontal line */}
                          {clanCount > 1 && (
                            <div
                              className="absolute h-0.5 bg-teal-500 top-0"
                              style={{
                                left: `calc(50% - ${(clanCount - 1) * 124}px)`,
                                width: `${(clanCount - 1) * 248}px`,
                              }}
                            />
                          )}

                          {/* Vertical lines to each clan */}
                          {tribeClans.map((_, index) => {
                            const offset = (index - (clanCount - 1) / 2) * 248;
                            return (
                              <div
                                key={index}
                                className="absolute w-0.5 h-20 bg-teal-500"
                                style={{
                                  left: `calc(50% + ${offset}px)`,
                                  top: 0,
                                }}
                              />
                            );
                          })}
                        </div>

                        {/* Clans cards */}
                        <div className="flex gap-8 pt-20">
                          {tribeClans.map((clan, clanIndex) => {
                            const isClanHovered = hoveredClan === clan.name;
                            
                            return (
                              <motion.div
                                key={clan.name}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: tribeIndex * 0.2 + 0.7 + clanIndex * 0.15, duration: 0.5 }}
                              >
                                <motion.div
                                  whileHover={{ scale: 1.08, y: -6 }}
                                  whileTap={{ scale: 0.96 }}
                                  onClick={() => onClanClick(clan)}
                                  onMouseEnter={() => setHoveredClan(clan.name)}
                                  onMouseLeave={() => setHoveredClan(null)}
                                  className="relative cursor-pointer group w-[240px]"
                                >
                                  {/* Glow effect - only on hover */}
                                  <motion.div
                                    animate={{
                                      opacity: isClanHovered ? [0.2, 0.4, 0.2] : 0,
                                      scale: isClanHovered ? [1, 1.05, 1] : 1,
                                    }}
                                    transition={{
                                      opacity: { duration: isClanHovered ? 1.5 : 0.3, repeat: isClanHovered ? Infinity : 0 },
                                      scale: { duration: isClanHovered ? 1.5 : 0.3, repeat: isClanHovered ? Infinity : 0 }
                                    }}
                                    className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl blur-xl"
                                  />

                                  {/* Clan card */}
                                  <div className="relative bg-gradient-to-br from-cyan-800/80 via-teal-800/80 to-cyan-900/80 rounded-2xl px-7 py-6 shadow-xl backdrop-blur-sm border-2 border-teal-600/40 overflow-hidden">
                                    {/* Decorative pattern */}
                                    <div className="absolute inset-0 opacity-10" style={{
                                      backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 8px, #14b8a6 8px, #14b8a6 9px)`
                                    }} />

                                    <div className="text-center relative z-10">
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mx-auto mb-3 shadow-md">
                                        <Users2 className="text-teal-100" size={20} />
                                      </div>
                                      
                                      <h4 className="text-xl font-bold text-teal-100 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                                        {clan.name}
                                      </h4>
                                      {clan.common_ancestor && (
                                        <p className="text-xs text-teal-300/80 line-clamp-2 italic" style={{ fontFamily: 'Lato, sans-serif' }}>
                                          {clan.common_ancestor}
                                        </p>
                                      )}
                                    </div>

                                    {/* Shine effect */}
                                    <motion.div
                                      animate={{
                                        x: isClanHovered ? ['-100%', '200%'] : '-100%',
                                      }}
                                      transition={{ duration: 1, ease: 'easeInOut' }}
                                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                                    />
                                  </div>
                                </motion.div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Zoom indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute bottom-6 right-6 px-4 py-2 rounded-xl bg-gradient-to-br from-slate-700/80 to-slate-800/80 border-2 border-teal-600/40 backdrop-blur-md shadow-lg"
      >
        <span className="text-sm text-teal-200 font-semibold" style={{ fontFamily: 'Lato, sans-serif' }}>
          {Math.round(zoom * 100)}%
        </span>
      </motion.div>
    </div>
  );
};
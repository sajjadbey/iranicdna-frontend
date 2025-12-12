import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, ChevronRight, Dna } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'https://qizilbash.ir/genetics';

interface HaplogroupNode {
  name: string;
  root_haplogroup: string | null;
  children: HaplogroupNode[];
}

interface HaplogroupCount {
  haplogroup: string;
  total_count: number;
  direct_count: number;
  subclade_count: number;
  subclades: string[];
}

interface Props {
  value: string | null;
  onChange: (value: string | null) => void;
}

export const HaplogroupSelector: React.FC<Props> = ({ value, onChange }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [haplogroupTree, setHaplogroupTree] = useState<HaplogroupNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [haplogroupCounts, setHaplogroupCounts] = useState<Record<string, HaplogroupCount>>({});
  const [loading, setLoading] = useState(true);
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

  // Fetch haplogroup tree and counts
  useEffect(() => {
    const fetchTreeAndCounts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/haplogroup/all/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: HaplogroupNode[] = await res.json();
        
        // Fetch counts for all root haplogroups
        const rootHaplogroups = data.map(node => node.name);
        const countPromises = rootHaplogroups.map(async (name) => {
          try {
            const countRes = await fetch(`${API_BASE}/haplogroup/?name=${encodeURIComponent(name)}`);
            if (!countRes.ok) return null;
            const countData: HaplogroupCount = await countRes.json();
            return { name, count: countData };
          } catch {
            return null;
          }
        });
        
        const counts = await Promise.all(countPromises);
        const countsMap: Record<string, HaplogroupCount> = {};
        counts.forEach(item => {
          if (item) countsMap[item.name] = item.count;
        });
        
        // Sort tree by total_count (highest to lowest)
        const sortedData = [...data].sort((a, b) => {
          const countA = countsMap[a.name]?.total_count || 0;
          const countB = countsMap[b.name]?.total_count || 0;
          return countB - countA;
        });
        
        setHaplogroupTree(sortedData);
        setHaplogroupCounts(countsMap);
      } catch (err) {
        console.error('Failed to fetch haplogroup tree:', err);
        setHaplogroupTree([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTreeAndCounts();
  }, []);

  // Fetch count for a haplogroup (for children when expanded)
  const fetchCount = async (name: string) => {
    if (haplogroupCounts[name]) return;
    
    try {
      const res = await fetch(`${API_BASE}/haplogroup/?name=${encodeURIComponent(name)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: HaplogroupCount = await res.json();
      setHaplogroupCounts(prev => ({ ...prev, [name]: data }));
    } catch (err) {
      console.error(`Failed to fetch count for ${name}:`, err);
    }
  };

  const toggleNode = (name: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
        // Fetch counts for children when expanding
        const node = findNodeByName(haplogroupTree, name);
        if (node && node.children) {
          node.children.forEach(child => fetchCount(child.name));
        }
      }
      return newSet;
    });
  };

  const handleSelect = (haplogroupName: string | null, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    onChange(haplogroupName);
    if (!isMobile) {
      setIsOpen(false);
    }
  };
  
  // Helper to find node in tree
  const findNodeByName = (nodes: HaplogroupNode[], name: string): HaplogroupNode | null => {
    for (const node of nodes) {
      if (node.name === name) return node;
      if (node.children) {
        const found = findNodeByName(node.children, name);
        if (found) return found;
      }
    }
    return null;
  };

  const formatCount = (count: number): string => count.toLocaleString();

  const renderNode = (node: HaplogroupNode, depth: number = 0): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.name);
    const count = haplogroupCounts[node.name];
    const isSelected = value === node.name;

    return (
      <div key={node.name} className="w-full">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className={`w-full text-left rounded-md px-3 py-2 flex items-center gap-2 transition-colors ${
            isSelected 
              ? 'bg-amber-700 text-white hover:bg-amber-600' 
              : 'bg-teal-800/60 text-teal-100 hover:bg-teal-700/80'
          }`}
          style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => toggleNode(node.name, e)}
              className="flex-shrink-0 p-0.5 hover:bg-teal-700/50 rounded"
            >
              {isExpanded ? (
                <ChevronDown size={14} className="text-teal-300" />
              ) : (
                <ChevronRight size={14} className="text-teal-300" />
              )}
            </button>
          ) : (
            <span className="w-3.5" />
          )}
          
          <button
            onClick={(e) => handleSelect(node.name, e)}
            className="flex-1 flex items-center gap-2 text-left"
          >
            <Dna size={14} className="flex-shrink-0" />
            
            <span className="flex-1 truncate text-sm font-medium">
              {node.name}
            </span>
            
            {count && (
              <span className="text-xs text-teal-300 flex-shrink-0">
                {formatCount(count.total_count)}
              </span>
            )}
          </button>
        </motion.div>

        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1 space-y-1"
          >
            {node.children
              .sort((a, b) => {
                const countA = haplogroupCounts[a.name]?.total_count || 0;
                const countB = haplogroupCounts[b.name]?.total_count || 0;
                return countB - countA;
              })
              .map(child => renderNode(child, depth + 1))}
          </motion.div>
        )}
      </div>
    );
  };

  // Flatten tree for mobile select
  const flattenTree = (nodes: HaplogroupNode[], depth: number = 0): { name: string; depth: number }[] => {
    const result: { name: string; depth: number }[] = [];
    nodes.forEach(node => {
      result.push({ name: node.name, depth });
      if (node.children && node.children.length > 0) {
        result.push(...flattenTree(node.children, depth + 1));
      }
    });
    return result;
  };

  const flatOptions = useMemo(() => flattenTree(haplogroupTree), [haplogroupTree]);

  if (loading) {
    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-teal-200 mb-2 flex items-center gap-1">
          <Dna size={14} /> Haplogroup
        </label>
        <div className="w-full rounded-lg bg-teal-900/70 text-teal-100 px-4 py-2 border border-teal-600 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Dna size={16} className="text-teal-400" />
          </motion.div>
          <span className="ml-2 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-teal-200 mb-2 flex items-center gap-1">
        <Dna size={14} /> Haplogroup
      </label>
      {isMobile ? (
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="w-full rounded-lg bg-teal-900/70 text-teal-100 px-4 py-2 border border-teal-600 focus:ring-2 focus:ring-amber-500"
        >
          <option value="">All Haplogroups</option>
          {flatOptions.map((option) => (
            <option key={option.name} value={option.name}>
              {'  '.repeat(option.depth)}
              {option.name}
            </option>
          ))}
        </select>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-left rounded-lg px-4 py-3 bg-teal-900/70 text-teal-100 flex justify-between items-center ring-1 ring-teal-600 hover:ring-teal-500 transition-shadow"
          >
            <span className="flex items-center gap-2">
              <Dna size={16} />
              {value ?? 'All Haplogroups'}
            </span>
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
                className="absolute z-10 w-full mt-2 max-h-[400px] overflow-y-auto flex flex-col space-y-1 p-2
                bg-teal-950/95 shadow-2xl rounded-lg border border-teal-700 backdrop-blur-sm origin-top custom-scrollbar"
              >
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05, duration: 0.2 }}
                  onClick={(e) => handleSelect(null, e)}
                  className="text-sm rounded-md px-3 py-2 bg-amber-800/80 text-white font-medium hover:bg-amber-700 transition-colors"
                >
                  Clear Selection
                </motion.button>
                
                {haplogroupTree.map(node => renderNode(node))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
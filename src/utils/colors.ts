// src/utils/colors.ts

export const PALETTE = [
  '#26A69A', // Teal
  '#0288D1', // Cyan Blue
  '#7B1FA2', // Deep Purple
  '#FFA000', // Amber
  '#D84315', // Deep Orange
  '#4CAF50', // Green
  '#5E35B1', // Indigo
  '#8D6E63', // Brown
  '#E64A19', // Orange-Red
  '#0097A7', // Dark Cyan
  '#C2185B', // Pink
  '#689F38', // Light Green
  '#512CA3', // 
  '#F57C00', // Orange
  '#22DD22',
  '#72CC22',
  '#8D2E63'
];

// NEW: Generate unique colors for a dataset (no duplicates)
export const generateUniqueColors = (keys: string[]): Record<string, string> => {
  const assignments: Record<string, string> = {};
  const usedIndices = new Set<number>();
  
  // Sort keys for consistent assignment order
  const sortedKeys = [...keys].sort();
  
  for (const key of sortedKeys) {
    // Calculate base index from hash
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash << 5) - hash + key.charCodeAt(i);
    const baseIndex = Math.abs(hash) % PALETTE.length;
    
    // Find next available index if base is taken
    let finalIndex = baseIndex;
    let offset = 0;
    while (usedIndices.has(finalIndex) && offset < PALETTE.length) {
      offset++;
      finalIndex = (baseIndex + offset) % PALETTE.length;
    }
    
    assignments[key] = PALETTE[finalIndex];
    usedIndices.add(finalIndex);
  }
  
  return assignments;
};

// Legacy function (kept for backward compatibility)
export const colorFor = (key: string): string => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash << 5) - hash + key.charCodeAt(i);
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

export const fmt = (n: number): string => n.toLocaleString();
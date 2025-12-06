export const PALETTE = [
  '#26A69A', // Teal-400 (primary)
  '#0288D1', // Cyan Blue - clearly distinct from teal
  '#7B1FA2', // Deep Purple - adds warm contrast
  '#FFA000', // Amber-700 (accent)
  '#D84315', // Deep Orange - vibrant, distinct from amber
  '#4CAF50', // Fresh Green - completely different family
  '#5E35B1', // Indigo - blue-purple, distinct from other blues
  '#8D6E63', // Brown - neutral tone
  '#E64A19', // Orange-Red - bold accent
  '#0097A7', // Dark Cyan - teal variant but distinct enough
];

export const colorFor = (key: string): string => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash << 5) - hash + key.charCodeAt(i);
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

export const fmt = (n: number): string => n.toLocaleString();
export const PALETTE = [
  '#26A69A', // Teal-400
  '#1E887D', // Teal-600
  '#00897B', // Teal-700
  '#00796B', // Deep teal
  '#FFA000', // Amber-700
  '#F57C00', // Amber-800
  '#D97706', // Amber-600
  '#8D6E63', // Brown-500
  '#4E342E', // Brown-800
  '#26A69A',
];

export const colorFor = (key: string): string => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash << 5) - hash + key.charCodeAt(i);
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

export const fmt = (n: number): string => n.toLocaleString();
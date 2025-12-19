import * as THREE from 'three';
import type { HelixConfig } from '../../types/dna-background';

/**
 * Calculate position on helix strand
 */
export function getHelixPosition(
  t: number,
  radius: number,
  height: number,
  offset: number = 0
): THREE.Vector3 {
  const angle = t * Math.PI * 2 + offset;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const y = (t - 0.5) * height;
  
  return new THREE.Vector3(x, y, z);
}

/**
 * Generate helix strand points
 */
export function generateHelixPoints(
  config: HelixConfig,
  offset: number = 0
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const totalPoints = config.turns * config.pointsPerTurn;
  
  for (let i = 0; i <= totalPoints; i++) {
    const t = i / totalPoints;
    points.push(getHelixPosition(t, config.radius, config.height, offset));
  }
  
  return points;
}

/**
 * Generate base pair positions
 */
export function generateBasePairPositions(
  config: HelixConfig
): Array<{ start: THREE.Vector3; end: THREE.Vector3 }> {
  const pairs: Array<{ start: THREE.Vector3; end: THREE.Vector3 }> = [];
  const totalPoints = config.turns * config.pointsPerTurn;
  const pairInterval = 4; // Create a base pair every 4 points
  
  for (let i = 0; i <= totalPoints; i += pairInterval) {
    const t = i / totalPoints;
    const pos1 = getHelixPosition(t, config.radius, config.height, 0);
    const pos2 = getHelixPosition(t, config.radius, config.height, Math.PI);
    
    pairs.push({ start: pos1, end: pos2 });
  }
  
  return pairs;
}

/**
 * Smooth lerp for camera movement
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

/**
 * Generate random particle positions around helix
 */
export function generateParticlePositions(
  count: number,
  spread: number,
  height: number
): Float32Array {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const angle = Math.random() * Math.PI * 2;
    const radius = spread * (0.5 + Math.random() * 0.5);
    
    positions[i3] = Math.cos(angle) * radius;
    positions[i3 + 1] = (Math.random() - 0.5) * height;
    positions[i3 + 2] = Math.sin(angle) * radius;
  }
  
  return positions;
}
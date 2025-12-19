import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ColorScheme, HelixConfig } from '../../types/dna-background';
import { generateHelixPoints, generateBasePairPositions } from './utils';

interface DNAHelixProps {
  config: HelixConfig;
  colors: ColorScheme;
  animationSpeed: number;
}

export function DNAHelix({ config, colors, animationSpeed }: DNAHelixProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Generate helix geometry
  const { strand1Points, strand2Points, basePairs } = useMemo(() => {
    return {
      strand1Points: generateHelixPoints(config, 0),
      strand2Points: generateHelixPoints(config, Math.PI),
      basePairs: generateBasePairPositions(config),
    };
  }, [config]);
  
  // Animate rotation
  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1 * animationSpeed;
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Strand 1 */}
      {strand1Points.map((point, i) => (
        <mesh key={`strand1-${i}`} position={point}>
          <sphereGeometry args={[config.strandRadius, 8, 8]} />
          <meshStandardMaterial
            color={colors.strand1}
            emissive={colors.strand1}
            emissiveIntensity={0.5}
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>
      ))}
      
      {/* Strand 2 */}
      {strand2Points.map((point, i) => (
        <mesh key={`strand2-${i}`} position={point}>
          <sphereGeometry args={[config.strandRadius, 8, 8]} />
          <meshStandardMaterial
            color={colors.strand2}
            emissive={colors.strand2}
            emissiveIntensity={0.5}
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>
      ))}
      
      {/* Base Pairs */}
      {basePairs.map((pair, i) => {
        const midpoint = new THREE.Vector3()
          .addVectors(pair.start, pair.end)
          .multiplyScalar(0.5);
        const direction = new THREE.Vector3().subVectors(pair.end, pair.start);
        const length = direction.length();
        
        // Create rotation to align cylinder with base pair
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction.normalize()
        );
        
        return (
          <mesh
            key={`basepair-${i}`}
            position={midpoint}
            quaternion={quaternion}
          >
            <cylinderGeometry args={[0.08, 0.08, length, 8]} />
            <meshStandardMaterial
              color={colors.basePairs}
              emissive={colors.basePairs}
              emissiveIntensity={0.3}
              roughness={0.4}
              metalness={0.6}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateParticlePositions } from './utils';

interface ParticlesProps {
  count: number;
  color: string;
  spread: number;
  height: number;
  animationSpeed: number;
}

export function Particles({ count, color, spread, height, animationSpeed }: ParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Generate particle positions
  const positions = useMemo(
    () => generateParticlePositions(count, spread, height),
    [count, spread, height]
  );
  
  // Create random velocities for each particle
  const velocities = useMemo(() => {
    const vels = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      vels[i3] = (Math.random() - 0.5) * 0.02;
      vels[i3 + 1] = (Math.random() - 0.5) * 0.02;
      vels[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    return vels;
  }, [count]);
  
  // Animate particles
  useFrame((_state, delta) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        
        // Update positions
        positions[i3] += velocities[i3] * delta * 60 * animationSpeed;
        positions[i3 + 1] += velocities[i3 + 1] * delta * 60 * animationSpeed;
        positions[i3 + 2] += velocities[i3 + 2] * delta * 60 * animationSpeed;
        
        // Wrap around boundaries
        const x = positions[i3];
        const y = positions[i3 + 1];
        const z = positions[i3 + 2];
        const radius = Math.sqrt(x * x + z * z);
        
        if (radius > spread * 1.5) {
          const angle = Math.atan2(z, x);
          positions[i3] = Math.cos(angle) * spread * 0.5;
          positions[i3 + 2] = Math.sin(angle) * spread * 0.5;
        }
        
        if (Math.abs(y) > height / 2) {
          positions[i3 + 1] = -y;
        }
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Rotate particle system slowly
      pointsRef.current.rotation.y += delta * 0.05 * animationSpeed;
    }
  });
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
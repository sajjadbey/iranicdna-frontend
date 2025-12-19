import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { DNAHelix } from './DNAHelix';
import { Particles } from './Particles';
import type { ColorScheme, HelixConfig, ParticleConfig } from '../../types/dna-background';
import { lerp } from './utils';

interface SceneProps {
  helixConfig: HelixConfig;
  particleConfig: ParticleConfig;
  colors: ColorScheme;
  animationSpeed: number;
  mouseInteraction: boolean;
}

export function Scene({
  helixConfig,
  particleConfig,
  colors,
  animationSpeed,
  mouseInteraction,
}: SceneProps) {
  const { camera } = useThree();
  const mousePosition = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  
  // Handle mouse movement
  useEffect(() => {
    if (!mouseInteraction) return;
    
    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      };
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseInteraction]);
  
  // Animate camera based on mouse position
  useFrame(() => {
    if (mouseInteraction) {
      // Calculate target rotation based on mouse position
      targetRotation.current.x = mousePosition.current.y * 0.3;
      targetRotation.current.y = mousePosition.current.x * 0.3;
      
      // Smooth lerp to target rotation
      currentRotation.current.x = lerp(
        currentRotation.current.x,
        targetRotation.current.x,
        0.05
      );
      currentRotation.current.y = lerp(
        currentRotation.current.y,
        targetRotation.current.y,
        0.05
      );
      
      // Apply rotation to camera
      camera.position.x = Math.sin(currentRotation.current.y) * 8;
      camera.position.y = currentRotation.current.x * 2;
      camera.position.z = Math.cos(currentRotation.current.y) * 8;
      camera.lookAt(0, 0, 0);
    }
  });
  
  return (
    <>
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.3} />
      
      {/* Point lights for dramatic effect */}
      <pointLight position={[5, 5, 5]} intensity={1} color={colors.strand1} />
      <pointLight position={[-5, -5, -5]} intensity={0.8} color={colors.strand2} />
      <pointLight position={[0, 8, 0]} intensity={0.5} color={colors.particles} />
      
      {/* DNA Helix */}
      <DNAHelix
        config={helixConfig}
        colors={colors}
        animationSpeed={animationSpeed}
      />
      
      {/* Particles */}
      <Particles
        count={particleConfig.count}
        color={colors.particles}
        spread={particleConfig.spread}
        height={helixConfig.height}
        animationSpeed={animationSpeed}
      />
    </>
  );
}
"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Float, Environment } from "@react-three/drei";
import * as THREE from "three";

function Orb({ color = "#E8C040", speed = 1, distort = 0.4 }: { color?: string; speed?: number; distort?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.1 * speed;
    }
    if (coreRef.current) {
      coreRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.05);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group>
        {/* The Outer Energy Shell */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[1, 64, 64]} />
          <MeshDistortMaterial
            color={color}
            speed={speed * 2}
            distort={distort}
            radius={1}
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.6}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* The Glowing Core */}
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={10} 
            toneMapped={false}
          />
        </mesh>

        {/* Ambient Glow Light */}
        <pointLight color={color} intensity={5} distance={3} />
      </group>
    </Float>
  );
}

export function CourseAsset({ className, color, speed, distort }: { className?: string; color?: string; speed?: number; distort?: number }) {
  return (
    <div className={className}>
      <Canvas gl={{ alpha: true }} camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        
        {/* Abstract environment instead of city */}
        <Environment preset="night" />
        
        <Orb color={color} speed={speed} distort={distort} />
      </Canvas>
    </div>
  );
}

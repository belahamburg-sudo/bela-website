"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Float, PerspectiveCamera, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function Crystal({ color = "#E8C040" }: { color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.2;
      meshRef.current.rotation.y = t * 0.3;
    }
    if (glowRef.current) {
      glowRef.current.intensity = 1.5 + Math.sin(t * 2) * 0.5;
    }
  });

  const isGold = color === "#E8C040";

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <group>
        <mesh ref={meshRef}>
          <octahedronGeometry args={[1, 2]} />
          <MeshDistortMaterial
            color={color}
            speed={2}
            distort={0.3}
            radius={1}
            metalness={1}
            roughness={0.05}
            emissive={isGold ? "#442200" : "#222222"}
            emissiveIntensity={0.5}
          />
        </mesh>
        <pointLight ref={glowRef} color={color} intensity={2} distance={5} />
      </group>
    </Float>
  );
}

export function GoldCrystal({ className, color }: { className?: string; color?: string }) {
  return (
    <div className={className}>
      <Canvas shadows gl={{ alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} />
        
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#ffffff" castShadow />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#E8C040" />
        
        {/* This makes it look gold/metallic */}
        <Environment preset="city" />
        
        <Crystal color={color} />
        
        <ContactShadows 
          position={[0, -1.5, 0]} 
          opacity={0.4} 
          scale={10} 
          blur={2} 
          far={4.5} 
        />
      </Canvas>
    </div>
  );
}

"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function GoldmineBackground() {
  const groupRef = useRef<THREE.Group>(null);

  // Create gold cubes/rocks
  const cubes = useMemo(() => {
    const items = [];
    for (let i = 0; i < 30; i++) {
      items.push({
        x: (Math.random() - 0.5) * 60,
        y: (Math.random() - 0.5) * 60,
        z: (Math.random() - 0.5) * 60,
        scale: 0.5 + Math.random() * 1.5,
        speed: 0.3 + Math.random() * 0.7,
      });
    }
    return items;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = state.clock.getElapsedTime() * 0.02;
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Gold cubes as rocks */}
      {cubes.map((cube, i) => (
        <mesh key={i} position={[cube.x, cube.y, cube.z]} scale={cube.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#D4AF37"
            metalness={0.8}
            roughness={0.2}
            emissive="#F0B429"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}

      {/* Center golden orb (mine glow) */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshStandardMaterial
          color="#000000"
          transparent
          opacity={0.1}
          emissive="#F0B429"
          emissiveIntensity={0.15}
        />
      </mesh>
    </group>
  );
}

function GoldParticles() {
  const points = useMemo(() => {
    const p = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      p[i * 3] = (Math.random() - 0.5) * 80;
      p[i * 3 + 1] = (Math.random() - 0.5) * 80;
      p[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    return p;
  }, []);

  const ref = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#F0B429"
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  );
}

export function SpatialBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <Canvas camera={{ position: [0, 0, 25], fov: 50 }}>
        <ambientLight intensity={0.4} color="#F0B429" />
        <directionalLight position={[10, 10, 10]} intensity={0.6} color="#ffffff" />
        <pointLight position={[-15, -15, -15]} intensity={0.3} color="#F0B429" />
        <GoldmineBackground />
        <GoldParticles />
      </Canvas>
    </div>
  );
}

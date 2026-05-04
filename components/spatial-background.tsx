"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function EpicGoldField() {
  const groupRef = useRef<THREE.Group>(null);

  // Dynamic particle field
  const particles = useMemo(() => {
    const items = [];
    for (let i = 0; i < 120; i++) {
      items.push({
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        z: (Math.random() - 0.5) * 200,
        scale: 0.2 + Math.random() * 1,
        speed: 0.3 + Math.random() * 1.2,
        angle: Math.random() * Math.PI * 2,
        id: i,
      });
    }
    return items;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = state.clock.getElapsedTime() * 0.015;
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.025;
      groupRef.current.rotation.z = state.clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Dynamic gold ore formations */}
      {particles.map((particle) => (
        <FloatingOreMesh key={particle.id} particle={particle} />
      ))}

      {/* Pulsing central energy core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[15, 32, 32]} />
        <meshStandardMaterial
          color="#000000"
          transparent
          opacity={0.2}
          emissive="#F0B429"
          emissiveIntensity={0.4}
          wireframe={false}
        />
      </mesh>
    </group>
  );
}

function FloatingOreMesh({ particle }: { particle: any }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.getElapsedTime();
      ref.current.position.x = particle.x + Math.sin(time * particle.speed) * 20;
      ref.current.position.y = particle.y + Math.cos(time * particle.speed * 0.7) * 20;
      ref.current.position.z = particle.z + Math.sin(time * particle.speed * 0.5) * 20;
      ref.current.rotation.x += 0.01;
      ref.current.rotation.y += 0.015;
      
      const brightness = 0.4 + Math.sin(time * particle.speed) * 0.6;
      if (ref.current.material instanceof THREE.MeshStandardMaterial) {
        ref.current.material.emissiveIntensity = brightness;
      }
    }
  });

  return (
    <mesh ref={ref} scale={particle.scale}>
      <octahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color="#C8922A"
        emissive="#F0B429"
        emissiveIntensity={0.5}
        metalness={0.85}
        roughness={0.15}
        wireframe={false}
      />
    </mesh>
  );
}

function DashboardParticles() {
  const ref = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const count = 800;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 150;

      const hue = Math.random() > 0.8 ? 0.12 : 0.08; // Gold colors
      colors[i * 3] = Math.random() * 0.5 + 0.6;
      colors[i * 3 + 1] = Math.random() * 0.3 + 0.4;
      colors[i * 3 + 2] = Math.random() * 0.1;
    }

    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (ref.current && ref.current.geometry.attributes.position) {
      const positions = ref.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += (Math.random() - 0.5) * 0.3;
        positions[i + 1] += (Math.random() - 0.5) * 0.3;
        positions[i + 2] += (Math.random() - 0.5) * 0.3;
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
          usage={THREE.DynamicDrawUsage}
        />
        <bufferAttribute attach="attributes-color" args={[particles.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.25}
        vertexColors={true}
        sizeAttenuation
        transparent
        opacity={0.6}
      />
    </points>
  );
}

export function SpatialBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <Canvas camera={{ position: [0, 0, 80], fov: 50 }}>
        <color attach="background" args={["#050403"]} />
        <fog attach="fog" args={["#050403", 50, 200]} />
        
        <ambientLight intensity={0.3} color="#F0B429" />
        <pointLight position={[60, 60, 60]} intensity={1.2} color="#FFE99D" />
        <pointLight position={[-60, -60, -60]} intensity={0.8} color="#F0B429" />
        
        <EpicGoldField />
        <DashboardParticles />
      </Canvas>
    </div>
  );
}

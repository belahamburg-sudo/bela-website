"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function FloatingCard({
  position,
  rotation,
  color,
  scale = 1,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + position[0]) * 0.15;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2 + position[1]) * 0.08;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
        <boxGeometry args={[1.6, 1.0, 0.04]} />
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.6}
          transparent
          opacity={0.15}
        />
      </mesh>
    </Float>
  );
}

function ParticleField() {
  const count = 120;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8 - 4;
    }
    return arr;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.015;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#d6a84f" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#d6a84f" />
      <pointLight position={[-5, -3, 3]} intensity={0.4} color="#ffffff" />

      <ParticleField />

      <FloatingCard position={[3.5, 1.2, -2]} rotation={[0.1, -0.3, 0.05]} color="#d6a84f" scale={1.1} />
      <FloatingCard position={[4.2, -1.0, -3]} rotation={[-0.05, 0.2, -0.08]} color="#ffffff" scale={0.85} />
      <FloatingCard position={[-4.5, 0.5, -4]} rotation={[0.08, 0.35, 0.04]} color="#d6a84f" scale={0.9} />
      <FloatingCard position={[-3.8, -1.8, -2.5]} rotation={[-0.1, -0.2, 0.06]} color="#ffffff" scale={0.75} />
      <FloatingCard position={[1.5, 3.0, -5]} rotation={[0.15, 0.1, -0.05]} color="#d6a84f" scale={0.7} />
    </>
  );
}

export default function ProductCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      style={{ background: "transparent" }}
      dpr={[1, 1.5]}
    >
      <Scene />
    </Canvas>
  );
}

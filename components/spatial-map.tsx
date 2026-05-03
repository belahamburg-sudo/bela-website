"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function Topography() {
  const meshRef = useRef<THREE.Points>(null);
  
  const count = 50;
  const sep = 0.4;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * count * 3);
    for (let x = 0; x < count; x++) {
      for (let z = 0; z < count; z++) {
        pos[(x * count + z) * 3 + 0] = (x - count / 2) * sep;
        pos[(x * count + z) * 3 + 1] = 0;
        pos[(x * count + z) * 3 + 2] = (z - count / 2) * sep;
      }
    }
    return pos;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      const pos = meshRef.current.geometry.attributes.position.array as Float32Array;
      for (let x = 0; x < count; x++) {
        for (let z = 0; z < count; z++) {
          const idx = (x * count + z) * 3 + 1;
          const xPos = pos[(x * count + z) * 3 + 0];
          const zPos = pos[(x * count + z) * 3 + 2];
          pos[idx] = Math.sin(xPos * 0.5 + t) * Math.cos(zPos * 0.5 + t) * 0.5;
        }
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#F0B429"
        transparent
        opacity={0.3}
        sizeAttenuation={true}
      />
    </points>
  );
}

export function SpatialMap() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-40">
      <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
        <Topography />
      </Canvas>
    </div>
  );
}

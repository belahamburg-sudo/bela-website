"use client";

import { Suspense, type ComponentType, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Html, Line, Stars, Text } from "@react-three/drei";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  LocateFixed,
  MousePointer2,
  Route,
} from "lucide-react";
import * as THREE from "three";
import {
  FREE_COURSE_REWARD_POINTS,
  getAvatarById,
  getMemberLevel,
} from "@/lib/avatar-system";

type RoadmapMilestone = {
  id: string;
  sector: number;
  pos: [number, number, number];
  title: string;
  subtitle: string;
  points: number;
  color: string;
};

type MoveVector = {
  x: number;
  z: number;
};

const ROADMAP_MILESTONES: RoadmapMilestone[] = [
  {
    id: "start",
    sector: 1,
    pos: [-8, 0, 4.5],
    title: "Start Camp",
    subtitle: "Profil aktiviert",
    points: 0,
    color: "#22C55E",
  },
  {
    id: "lesson",
    sector: 2,
    pos: [-5.2, 0, -0.7],
    title: "Lesson Ridge",
    subtitle: "Erste Lektionen",
    points: 120,
    color: "#38BDF8",
  },
  {
    id: "course",
    sector: 3,
    pos: [-1.2, 0, 2.8],
    title: "Course Gate",
    subtitle: "Kurs freigeschaltet",
    points: 280,
    color: "#F0B429",
  },
  {
    id: "forge",
    sector: 4,
    pos: [3.1, 0, -1.8],
    title: "Avatar Forge",
    subtitle: "Neue Charaktere",
    points: 520,
    color: "#EAB308",
  },
  {
    id: "reward",
    sector: 5,
    pos: [7, 0, 2.7],
    title: "Reward Cavern",
    subtitle: "Rewards öffnen",
    points: 900,
    color: "#A855F7",
  },
  {
    id: "free-course",
    sector: 6,
    pos: [10.6, 0, -2.4],
    title: "Free Course Peak",
    subtitle: "Gratis Kurs",
    points: FREE_COURSE_REWARD_POINTS,
    color: "#F97316",
  },
  {
    id: "summit",
    sector: 7,
    pos: [13.4, 0, 1.8],
    title: "Goldmaster Summit",
    subtitle: "Finaler Status",
    points: 1700,
    color: "#FFE99D",
  },
];

const WORLD_BOUNDS = {
  minX: -10,
  maxX: 15,
  minZ: -4.8,
  maxZ: 6.2,
};

const ZERO_VECTOR: MoveVector = { x: 0, z: 0 };

function getRoadmapIndex(points: number) {
  return ROADMAP_MILESTONES.reduce((currentIndex, milestone, milestoneIndex) => {
    return points >= milestone.points ? milestoneIndex : currentIndex;
  }, 0);
}

function terrainHeight(x: number, z: number) {
  return Math.sin(x * 0.45) * 0.12 + Math.cos(z * 0.7) * 0.08;
}

function avatarColors(accent: string) {
  const matches = accent.match(/#[0-9a-fA-F]{6}/g) ?? [];
  return {
    primary: matches[0] ?? "#F0B429",
    secondary: matches[1] ?? "#7A4F00",
  };
}

function RoadSurface() {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
      ROADMAP_MILESTONES.map((milestone) => {
        const [x, , z] = milestone.pos;
          return new THREE.Vector3(x, terrainHeight(x, z) + 0.08, z);
      })
      ),
    []
  );

  const curvePoints = useMemo(() => {
    return curve.getPoints(90);
  }, [curve]);

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 96, 0.08, 10, false]} />
        <meshStandardMaterial
          color="#F0B429"
          emissive="#F0B429"
          emissiveIntensity={1.25}
          roughness={0.24}
          metalness={0.4}
        />
      </mesh>
      <Line
        points={curvePoints}
        color="#FFE99D"
        lineWidth={5}
        transparent
        opacity={0.95}
      />
      {curvePoints.map((point, index) => {
        if (index % 4 !== 0) return null;
        return (
          <mesh key={`${point.x}-${point.z}`} position={[point.x, point.y - 0.02, point.z]} receiveShadow>
            <boxGeometry args={[0.52, 0.055, 0.52]} />
            <meshStandardMaterial color="#F0B429" emissive="#7A4F00" transparent opacity={0.72} />
          </mesh>
        );
      })}
    </group>
  );
}

function Terrain() {
  const decor = useMemo(
    () => [
      [-9.2, 5.8, 0.4],
      [-7.4, -2.6, 0.25],
      [-3.8, 4.7, 0.3],
      [-0.2, -3.6, 0.42],
      [2.2, 4.4, 0.22],
      [5.5, -3.4, 0.36],
      [8.8, 5.1, 0.28],
      [12.4, -3.8, 0.5],
      [14.2, 4.3, 0.32],
    ] as const,
    []
  );

  // Animated falling gold particles
  const fallingGold = useMemo(() => {
    const particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: -15 + Math.random() * 35,
        z: -6 + Math.random() * 12,
        speed: 0.5 + Math.random() * 1.5,
        scale: 0.08 + Math.random() * 0.2,
        delay: Math.random() * Math.PI * 2,
      });
    }
    return particles;
  }, []);

  return (
    <group>
      {/* Floor: Dark stone mine floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.5, -0.1, 0.7]} receiveShadow>
        <planeGeometry args={[30, 15, 32, 16]} />
        <meshStandardMaterial
          color="#1b1208"
          emissive="#130b04"
          emissiveIntensity={0.28}
          roughness={0.88}
          metalness={0.08}
        />
      </mesh>

      {/* Left mine wall */}
      <mesh position={[-15, 1, 0.7]} receiveShadow castShadow>
        <boxGeometry args={[1, 8, 15]} />
        <meshStandardMaterial
          color="#0f0a06"
          emissive="#1a1200"
          emissiveIntensity={0.15}
          roughness={0.92}
        />
      </mesh>

      {/* Right mine wall */}
      <mesh position={[20, 1, 0.7]} receiveShadow castShadow>
        <boxGeometry args={[1, 8, 15]} />
        <meshStandardMaterial
          color="#0f0a06"
          emissive="#1a1200"
          emissiveIntensity={0.15}
          roughness={0.92}
        />
      </mesh>

      {/* Animated falling gold: particle system */}
      {fallingGold.map((particle, i) => (
        <FallingGoldParticle 
          key={`gold-${i}`}
          x={particle.x}
          z={particle.z}
          scale={particle.scale}
          speed={particle.speed}
          delay={particle.delay}
        />
      ))}

      {/* Dramatic cave formations on walls */}
      {[...Array(6)].map((_, i) => (
        <mesh key={`cave-${i}`} position={[-14 + i * 5, 1.5 + Math.sin(i) * 0.8, -4 + (i % 2) * 8]} castShadow>
          <coneGeometry args={[0.8, 2, 8]} />
          <meshStandardMaterial
            color="#0a0604"
            emissive="#2a1f00"
            emissiveIntensity={0.1}
            roughness={0.9}
          />
        </mesh>
      ))}

      {/* Support pillars: goldmine architecture */}
      {[...Array(5)].map((_, i) => (
        <mesh key={`pillar-${i}`} position={[-10 + i * 6, 1, -3 + (i % 2) * 6]} castShadow receiveShadow>
          <cylinderGeometry args={[0.35, 0.45, 3.5, 8]} />
          <meshStandardMaterial
            color="#1a1410"
            emissive="#2a1f00"
            emissiveIntensity={0.15}
            roughness={0.8}
            metalness={0.4}
          />
        </mesh>
      ))}

      {/* Gold deposits scattered on ground */}
      {decor.map(([x, z, scale], index) => (
        <Float key={`${x}-${z}`} speed={1.2 + index * 0.08} floatIntensity={0.25} rotationIntensity={0.35}>
          <mesh position={[x, terrainHeight(x, z) + scale * 0.42, z]} scale={scale} castShadow>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color={index % 3 === 0 ? "#FFD76A" : "#765426"}
              emissive={index % 3 === 0 ? "#F0B429" : "#2a1806"}
              emissiveIntensity={index % 3 === 0 ? 1.1 : 0.28}
              roughness={0.38}
              metalness={0.65}
            />
          </mesh>
        </Float>
      ))}

      {/* Ambient goldmine atmosphere glow */}
      <mesh position={[2.5, 1.5, 0.7]}>
        <sphereGeometry args={[20, 16, 16]} />
        <meshStandardMaterial
          color="#000000"
          transparent
          opacity={0.12}
          emissive="#F0B429"
          emissiveIntensity={0.08}
        />
      </mesh>
    </group>
  );
}

function FallingGoldParticle({
  x,
  z,
  scale,
  speed,
  delay,
}: {
  x: number;
  z: number;
  scale: number;
  speed: number;
  delay: number;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.getElapsedTime();
      ref.current.position.y = 6 - ((time * speed + delay) % 8);
      ref.current.rotation.x = time * 1.5;
      ref.current.rotation.z = time * 2;
    }
  });

  return (
    <group ref={ref} position={[x, 0, z]}>
      <mesh scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#FFD76A"
          emissive="#F0B429"
          emissiveIntensity={1.2}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

function MilestoneNode({
  milestone,
  isComplete,
  isActive,
  isReachable,
  onSelect,
}: {
  milestone: RoadmapMilestone;
  isComplete: boolean;
  isActive: boolean;
  isReachable: boolean;
  onSelect: () => void;
}) {
  const [x, , z] = milestone.pos;
  const y = terrainHeight(x, z);
  const glow = isActive ? 3.2 : isComplete ? 1.35 : isReachable ? 0.45 : 0.12;

  return (
    <group position={[x, y, z]}>
      <mesh
        position={[0, 0.03, 0]}
        castShadow
        receiveShadow
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <cylinderGeometry args={[0.86, 0.98, 0.14, 32]} />
        <meshStandardMaterial
          color={isComplete || isActive ? milestone.color : isReachable ? "#3a260d" : "#15100a"}
          emissive={isComplete || isActive ? milestone.color : "#000000"}
          emissiveIntensity={glow}
          metalness={0.72}
          roughness={0.22}
        />
      </mesh>

      <mesh position={[0, 0.48, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.9, 16]} />
        <meshStandardMaterial color={isComplete || isActive ? "#F0B429" : "#6f501d"} emissive="#3D2500" emissiveIntensity={0.35} />
      </mesh>

      <Float speed={2.6} floatIntensity={isActive ? 0.9 : 0.38} rotationIntensity={1.2}>
        <mesh position={[0, 1.08, 0]} castShadow>
          <octahedronGeometry args={[0.44, 0]} />
          <meshStandardMaterial
            color={isComplete || isReachable ? milestone.color : "#262019"}
            emissive={isComplete || isActive ? milestone.color : "#050403"}
            emissiveIntensity={isActive ? 4.2 : isComplete ? 1.3 : isReachable ? 0.45 : 0.18}
            metalness={1}
            roughness={0.05}
          />
        </mesh>
      </Float>

      <Text
        position={[0, 0.22, 0.72]}
        fontSize={0.26}
        color={isComplete || isActive ? "#FFF6D8" : "#6d5b3e"}
        anchorX="center"
        anchorY="middle"
        rotation={[-0.72, 0, 0]}
      >
        {milestone.sector}
      </Text>

      <Html position={[0, 1.55, 0]} center distanceFactor={8} occlude={false}>
        <button
          type="button"
          onClick={onSelect}
          className={`pointer-events-auto min-w-[154px] border px-3 py-2 text-left backdrop-blur-xl transition-all ${
            isActive
              ? "border-gold-300 bg-gold-300 text-obsidian shadow-[0_0_28px_rgba(200,146,42,0.35)]"
              : "border-gold-300/35 bg-black/85 text-cream shadow-[0_14px_30px_rgba(0,0,0,0.55)] hover:border-gold-300/70 hover:bg-gold-300/10"
          }`}
        >
          <span className="block font-heading text-lg uppercase leading-none tracking-tight">
            {milestone.title}
          </span>
          <span className={`mt-1 block font-mono text-[8px] uppercase tracking-[0.16em] ${isActive ? "text-obsidian/70" : "text-gold-300/45"}`}>
            {isComplete ? "Unlocked" : `${milestone.points} XP`} / {milestone.subtitle}
          </span>
        </button>
      </Html>
    </group>
  );
}

function AvatarWalker({
  avatarId,
  startIndex,
  targetIndex,
  buttonVector,
  onSectorChange,
  onCancelTarget,
  onTargetReached,
}: {
  avatarId: string;
  startIndex: number;
  targetIndex: number | null;
  buttonVector: MoveVector;
  onSectorChange: (index: number) => void;
  onCancelTarget: () => void;
  onTargetReached: () => void;
}) {
  const avatar = getAvatarById(avatarId);
  const colors = avatarColors(avatar.accent);
  const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${avatar.id}&backgroundColor=transparent&scale=110`;
  const groupRef = useRef<THREE.Group>(null);
  const velocityRef = useRef(new THREE.Vector3());
  const pressedRef = useRef(new Set<string>());
  const activeTargetRef = useRef<THREE.Vector3 | null>(null);
  const lastSectorRef = useRef(startIndex);
  const manualCancelRef = useRef(false);
  const { camera } = useThree();

  useEffect(() => {
    const start = ROADMAP_MILESTONES[startIndex].pos;
    if (groupRef.current) {
      groupRef.current.position.set(start[0], terrainHeight(start[0], start[2]) + 0.32, start[2]);
    }
    lastSectorRef.current = startIndex;
    onSectorChange(startIndex);
  }, [startIndex, onSectorChange]);

  useEffect(() => {
    if (targetIndex === null) {
      activeTargetRef.current = null;
      return;
    }

    const target = ROADMAP_MILESTONES[targetIndex].pos;
    activeTargetRef.current = new THREE.Vector3(
      target[0],
      terrainHeight(target[0], target[2]) + 0.32,
      target[2]
    );
    manualCancelRef.current = false;
  }, [targetIndex]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
        event.preventDefault();
        pressedRef.current.add(key);
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      pressedRef.current.delete(event.key.toLowerCase());
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      document.body.style.cursor = "";
    };
  }, []);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    let inputX = buttonVector.x;
    let inputZ = buttonVector.z;
    const pressed = pressedRef.current;

    if (pressed.has("a") || pressed.has("arrowleft")) inputX -= 1;
    if (pressed.has("d") || pressed.has("arrowright")) inputX += 1;
    if (pressed.has("w") || pressed.has("arrowup")) inputZ -= 1;
    if (pressed.has("s") || pressed.has("arrowdown")) inputZ += 1;

    const manualInput = Math.abs(inputX) + Math.abs(inputZ) > 0;
    const desired = new THREE.Vector3(inputX, 0, inputZ);

    if (manualInput && activeTargetRef.current) {
      activeTargetRef.current = null;
      if (!manualCancelRef.current) {
        manualCancelRef.current = true;
        onCancelTarget();
      }
    }

    if (!manualInput && activeTargetRef.current) {
      desired.subVectors(activeTargetRef.current, group.position);
      desired.y = 0;

      if (desired.length() < 0.18) {
        activeTargetRef.current = null;
        onTargetReached();
      }
    }

    const velocity = velocityRef.current;
    if (desired.lengthSq() > 0.001) {
      desired.normalize().multiplyScalar(manualInput ? 4.1 : 3.2);
      velocity.lerp(desired, Math.min(1, delta * 8));
    } else {
      velocity.lerp(new THREE.Vector3(0, 0, 0), Math.min(1, delta * 6));
    }

    group.position.addScaledVector(velocity, delta);
    group.position.x = THREE.MathUtils.clamp(group.position.x, WORLD_BOUNDS.minX, WORLD_BOUNDS.maxX);
    group.position.z = THREE.MathUtils.clamp(group.position.z, WORLD_BOUNDS.minZ, WORLD_BOUNDS.maxZ);
    group.position.y = terrainHeight(group.position.x, group.position.z) + 0.32;

    if (velocity.lengthSq() > 0.04) {
      group.rotation.y = Math.atan2(velocity.x, velocity.z);
    }

    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < ROADMAP_MILESTONES.length; i += 1) {
      const [x, , z] = ROADMAP_MILESTONES[i].pos;
      const distance = (group.position.x - x) ** 2 + (group.position.z - z) ** 2;
      if (distance < nearestDistance) {
        nearestIndex = i;
        nearestDistance = distance;
      }
    }

    if (nearestIndex !== lastSectorRef.current) {
      lastSectorRef.current = nearestIndex;
      onSectorChange(nearestIndex);
    }

    const cameraTarget = new THREE.Vector3(group.position.x, group.position.y + 1.1, group.position.z);
    const desiredCamera = new THREE.Vector3(group.position.x - 4.2, group.position.y + 5.8, group.position.z + 7.4);
    camera.position.lerp(desiredCamera, Math.min(1, delta * 2.8));
    camera.lookAt(cameraTarget);
  });

  return (
    <group ref={groupRef} scale={1.12}>
      <Html position={[0, 2.05, 0]} center distanceFactor={7} occlude={false}>
        <div className="pointer-events-none relative h-16 w-16">
          <div className={`absolute inset-0 rounded-[20px] border border-gold-300/40 bg-gradient-to-br ${avatar.accent} shadow-[0_16px_36px_rgba(200,146,42,0.28)]`} />
          <div className="absolute inset-1 flex items-center justify-center rounded-[17px] border border-white/15 text-sm font-black text-obsidian">
            {avatar.badge}
          </div>
          <Image
            src={avatarUrl}
            alt={avatar.name}
            width={64}
            height={64}
            unoptimized
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain p-1"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>
      </Html>

      <mesh position={[0, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.72, 14]} />
        <meshStandardMaterial color="#5c3f18" emissive="#2a1604" emissiveIntensity={0.3} roughness={0.55} metalness={0.2} />
      </mesh>

      <mesh position={[0, 0.78, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.42, 0.78, 20]} />
        <meshStandardMaterial color={colors.secondary} emissive={colors.secondary} emissiveIntensity={0.28} roughness={0.45} metalness={0.35} />
      </mesh>

      <mesh position={[0, 1.22, 0]} castShadow>
        <sphereGeometry args={[0.34, 28, 28]} />
        <meshStandardMaterial color={colors.primary} emissive={colors.primary} emissiveIntensity={0.25} roughness={0.36} metalness={0.25} />
      </mesh>

      <mesh position={[0, 1.46, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.32, 0.18, 28]} />
        <meshStandardMaterial color="#F0B429" emissive="#3D2500" emissiveIntensity={0.55} roughness={0.32} metalness={0.75} />
      </mesh>

      <mesh position={[0.42, 0.83, 0.02]} rotation={[0, 0, -0.35]} castShadow>
        <boxGeometry args={[0.12, 0.74, 0.12]} />
        <meshStandardMaterial color={colors.primary} roughness={0.42} />
      </mesh>
      <mesh position={[-0.42, 0.83, 0.02]} rotation={[0, 0, 0.35]} castShadow>
        <boxGeometry args={[0.12, 0.74, 0.12]} />
        <meshStandardMaterial color={colors.primary} roughness={0.42} />
      </mesh>

      <pointLight color={colors.primary} intensity={4.2} distance={7} />
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[0.5, 0.72, 36]} />
        <meshBasicMaterial color="#F0B429" transparent opacity={0.42} />
      </mesh>
    </group>
  );
}

function RoadmapScene({
  currentPoints,
  avatarId,
  startIndex,
  activeIndex,
  targetIndex,
  buttonVector,
  onSectorChange,
  onSelectMilestone,
  onCancelTarget,
  onTargetReached,
}: {
  currentPoints: number;
  avatarId: string;
  startIndex: number;
  activeIndex: number;
  targetIndex: number | null;
  buttonVector: MoveVector;
  onSectorChange: (index: number) => void;
  onSelectMilestone: (index: number) => void;
  onCancelTarget: () => void;
  onTargetReached: () => void;
}) {
  const progressIndex = getRoadmapIndex(currentPoints);

  return (
    <>
      <color attach="background" args={["#0b0603"]} />
      <fog attach="fog" args={["#0b0603", 18, 48]} />
      <ambientLight intensity={1.15} />
      <hemisphereLight args={["#fff0b8", "#120805", 1.05]} />
      <directionalLight position={[5, 13, 8]} intensity={3} castShadow />
      <pointLight position={[-8, 6, 5]} color="#F0B429" intensity={6.5} distance={16} />
      <pointLight position={[8, 5, -4]} color="#38BDF8" intensity={2.6} distance={10} />
      <Environment preset="city" />
      <Stars radius={80} depth={34} count={1000} factor={2.6} saturation={0} fade speed={0.35} />

      <Terrain />
      <RoadSurface />

      {ROADMAP_MILESTONES.map((milestone, index) => (
        <MilestoneNode
          key={milestone.id}
          milestone={milestone}
          isComplete={currentPoints >= milestone.points}
          isActive={index === activeIndex}
          isReachable={index <= progressIndex + 1}
          onSelect={() => onSelectMilestone(index)}
        />
      ))}

      <AvatarWalker
        avatarId={avatarId}
        startIndex={startIndex}
        targetIndex={targetIndex}
        buttonVector={buttonVector}
        onSectorChange={onSectorChange}
        onCancelTarget={onCancelTarget}
        onTargetReached={onTargetReached}
      />
    </>
  );
}

function MoveButton({
  label,
  vector,
  icon: Icon,
  onMove,
}: {
  label: string;
  vector: MoveVector;
  icon: ComponentType<{ className?: string }>;
  onMove: (vector: MoveVector) => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        onMove(vector);
      }}
      onPointerUp={(event) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        onMove(ZERO_VECTOR);
      }}
      onPointerCancel={() => onMove(ZERO_VECTOR)}
      onPointerLeave={() => onMove(ZERO_VECTOR)}
      className="flex h-10 w-10 items-center justify-center border border-gold-300/20 bg-black/65 text-gold-300 backdrop-blur-md transition-colors hover:border-gold-300/50 hover:bg-gold-300 hover:text-obsidian"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export function GameRoadmap({ currentPoints, avatarId }: { currentPoints: number; avatarId: string }) {
  const progressIndex = useMemo(() => getRoadmapIndex(currentPoints), [currentPoints]);
  const [activeIndex, setActiveIndex] = useState(progressIndex);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [buttonVector, setButtonVector] = useState<MoveVector>(ZERO_VECTOR);
  const memberLevel = getMemberLevel(currentPoints);
  const activeMilestone = ROADMAP_MILESTONES[activeIndex] ?? ROADMAP_MILESTONES[progressIndex];
  const targetMilestone = targetIndex === null ? null : ROADMAP_MILESTONES[targetIndex];
  const finalPoints = ROADMAP_MILESTONES[ROADMAP_MILESTONES.length - 1].points;
  const roadmapProgress = Math.min(100, Math.round((currentPoints / finalPoints) * 100));

  useEffect(() => {
    setActiveIndex(progressIndex);
    setTargetIndex(null);
  }, [progressIndex]);

  const selectMilestone = useCallback((index: number) => {
    setTargetIndex(index);
  }, []);

  const goToNextMilestone = useCallback(() => {
    setTargetIndex((currentTarget) => {
      const baseIndex = currentTarget ?? activeIndex;
      return Math.min(ROADMAP_MILESTONES.length - 1, baseIndex + 1);
    });
  }, [activeIndex]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050403]">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center bg-[#050403] text-gold-300 font-mono text-[10px] uppercase tracking-[0.2em]">
            3D-Roadmap wird geladen...
          </div>
        }
      >
        <Canvas
          shadows
          dpr={[1, 1.8]}
          camera={{ position: [-6, 7, 10], fov: 45 }}
          gl={{ alpha: false, antialias: true }}
          style={{ background: "#0b0603" }}
          onCreated={({ gl, scene }) => {
            gl.setClearColor("#0b0603", 1);
            scene.background = new THREE.Color("#0b0603");
          }}
        >
          <RoadmapScene
            currentPoints={currentPoints}
            avatarId={avatarId}
            startIndex={progressIndex}
            activeIndex={activeIndex}
            targetIndex={targetIndex}
            buttonVector={buttonVector}
            onSectorChange={setActiveIndex}
            onSelectMilestone={selectMilestone}
            onCancelTarget={() => setTargetIndex(null)}
            onTargetReached={() => setTargetIndex(null)}
          />
        </Canvas>
      </Suspense>

      <div className="pointer-events-none absolute inset-0 z-[2] opacity-35 [background-image:linear-gradient(rgba(200,146,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(200,146,42,0.06)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="pointer-events-none absolute inset-x-4 top-4 z-10 flex flex-col gap-3 md:inset-x-6 md:flex-row md:items-start md:justify-between">
        <div className="tac-panel tac-corners max-w-[360px] border-gold-300/20 bg-black/70 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-gold-300/70">
            <MousePointer2 className="h-3.5 w-3.5" />
            <p className="tac-label text-[8px] uppercase tracking-widest">Walk Mode</p>
          </div>
          <p className="mt-2 font-heading text-2xl uppercase leading-none text-cream">
            {activeMilestone.title}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-cream/35">
            Sektor {activeMilestone.sector} / {ROADMAP_MILESTONES.length}
            {targetMilestone ? ` · Auto-Walk: ${targetMilestone.title}` : " · WASD oder Pfeiltasten"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-right sm:flex">
          <div className="tac-panel tac-corners border-gold-300/20 bg-black/70 px-4 py-3 backdrop-blur-xl">
            <p className="tac-label mb-1 text-[8px] uppercase tracking-widest">Roadmap</p>
            <p className="font-heading text-2xl leading-none text-gold-300">{roadmapProgress}%</p>
          </div>
          <div className="tac-panel tac-corners border-gold-300/20 bg-black/70 px-4 py-3 backdrop-blur-xl">
            <p className="tac-label mb-1 text-[8px] uppercase tracking-widest">Level</p>
            <p className="font-heading text-2xl leading-none text-cream">
              {memberLevel.current.level} <span className="text-gold-300/45">/ 7</span>
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-end gap-3 md:bottom-6 md:left-6">
        <div className="pointer-events-auto grid grid-cols-3 gap-1">
          <div />
          <MoveButton label="Vorwärts laufen" vector={{ x: 0, z: -1 }} icon={ChevronUp} onMove={setButtonVector} />
          <div />
          <MoveButton label="Links laufen" vector={{ x: -1, z: 0 }} icon={ChevronLeft} onMove={setButtonVector} />
          <MoveButton label="Rückwärts laufen" vector={{ x: 0, z: 1 }} icon={ChevronDown} onMove={setButtonVector} />
          <MoveButton label="Rechts laufen" vector={{ x: 1, z: 0 }} icon={ChevronRight} onMove={setButtonVector} />
        </div>

        <div className="pointer-events-auto flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setTargetIndex(progressIndex)}
            className="flex items-center gap-2 border border-gold-300/20 bg-black/70 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-cream/70 backdrop-blur-xl transition-colors hover:border-gold-300/50 hover:text-gold-300"
          >
            <LocateFixed className="h-3.5 w-3.5" />
            Zu meinem Stand
          </button>
          <button
            type="button"
            onClick={goToNextMilestone}
            className="flex items-center gap-2 border border-gold-300/20 bg-black/70 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-cream/70 backdrop-blur-xl transition-colors hover:border-gold-300/50 hover:text-gold-300"
          >
            <Route className="h-3.5 w-3.5" />
            Nächster Sektor
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useRef, useState, useMemo } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera, useCursor, Html, Edges, PerformanceMonitor, AdaptiveDpr } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, ChromaticAberration, Noise as PPNoise } from '@react-three/postprocessing';
import { LayerMaterial, Color, Depth, Noise } from 'lamina';
import { Physics, RigidBody } from '@react-three/rapier';

const interactiveBuildings = [
  {
    id: 'about',
    label: 'ABOUT',
    code: 'SEC_01 // IDENTITY',
    position: [-4, 0, -4],
    color: '#0284c7',
    accent: '#38bdf8',
    scale: [2.4, 7.0, 2.4],
    type: 'tower'
  },
  {
    id: 'education',
    label: 'EDUCATION',
    code: 'SEC_02 // ACADEMY',
    position: [4, 0, -4],
    color: '#2563eb',
    accent: '#60a5fa',
    scale: [2.8, 6.4, 2.4],
    type: 'block'
  },
  {
    id: 'skills',
    label: 'SKILLS',
    code: 'SEC_03 // ARSENAL',
    position: [-4, 0, 4],
    color: '#3b82f6',
    accent: '#38bdf8',
    scale: [2.4, 7.5, 2.4],
    type: 'antenna'
  },
  {
    id: 'projects',
    label: 'PROJECTS',
    code: 'SEC_04 // ARCHIVE',
    position: [4, 0, 4],
    color: '#0ea5e9',
    accent: '#7dd3fc',
    scale: [2.8, 6.8, 2.8],
    type: 'tiered'
  },
  {
    id: 'contact',
    label: 'CONTACT',
    code: 'SEC_05 // UPLINK',
    position: [12, 0, -4],
    color: '#38bdf8',
    accent: '#38bdf8',
    scale: [2.4, 6.0, 2.4],
    type: 'pavilion'
  }
];

const globalTrafficState = { zGreen: true, timer: 0 };

function CyberSky() {
  return (
    <mesh scale={100}>
      <sphereGeometry args={[1, 64, 64]} />
      <LayerMaterial side={THREE.BackSide}>
        <Color color="#010206" alpha={1} mode="normal" />
        <Depth colorA="#1e1b4b" colorB="#010206" alpha={0.7} mode="add" near={0} far={100} origin={[0, -20, 0]} />
        <Noise colorA="#4338ca" colorB="#000000" alpha={0.1} mode="add" scale={10} />
      </LayerMaterial>
    </mesh>
  );
}

// Warm yellow animated window textures (restored from original)
const createWindowGroup = () => {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');

  const windows = [];
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      windows.push({
        x: x * 32 + 4,
        y: y * 32 + 4,
        val: Math.random(),
        target: Math.random() > 0.65 ? 1 : 0,
        speed: Math.random() * 0.05 + 0.01,
        color: Math.random() > 0.5 ? '254, 240, 138' : '253, 224, 71'
      });
    }
  }

  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipMapLinearFilter;

  const update = () => {
    ctx.fillStyle = '#05070e';
    ctx.fillRect(0, 0, 128, 128);

    let changed = false;
    windows.forEach((w) => {
      if (Math.abs(w.val - w.target) > 0.01) {
        w.val += (w.target - w.val) * w.speed;
        changed = true;
      } else if (Math.random() > 0.98) {
        w.target = Math.random() > 0.65 ? 1 : 0;
      }

      if (w.val > 0.05) {
        ctx.fillStyle = `rgba(${w.color}, ${w.val})`;
        ctx.shadowBlur = 14 * w.val;
        ctx.shadowColor = `rgba(${w.color}, 1)`;
        ctx.fillRect(w.x, w.y, 24, 26);
      } else {
        ctx.fillStyle = '#0b0f19';
        ctx.shadowBlur = 0;
        ctx.fillRect(w.x, w.y, 24, 26);
      }
    });
    if (changed) t.needsUpdate = true;
  };

  return { texture: t, update };
};

const windowTextures = Array.from({ length: 6 }, createWindowGroup);

const createAsphaltTexture = () => {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 30000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#2c2c2c' : '#555555';
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(50, 50);
  t.needsUpdate = true;
  return t;
};
const asphaltTexture = createAsphaltTexture();

function AnimatedWindows() {
  const timerRef = useRef(0);
  useFrame((_, delta) => {
    timerRef.current += delta;
    if (timerRef.current > 0.1) {
      windowTextures.forEach((wt) => wt.update());
      timerRef.current = 0;
    }
  });
  return null;
}

// Helper for multi-face building box with warm yellow windows on the 4 vertical walls and dark roof/floor
function WindowedBox({ args, position = [0, 0, 0], tex, wallColor = '#111827', emissiveIntensity = 1.9, edgeColor, edgeOpacity = 0.4 }) {
  const localTex = useMemo(() => {
    const t = tex.clone();
    t.needsUpdate = true;
    t.repeat.set(Math.max(1, args[0] / 1.4), Math.max(1, args[1] / 1.4));
    return t;
  }, [tex, args[0], args[1]]);

  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial attach="material-0" color={wallColor} roughness={0.25} metalness={0.85} map={localTex} emissiveMap={localTex} emissive="#ffffff" emissiveIntensity={emissiveIntensity} />
      <meshStandardMaterial attach="material-1" color={wallColor} roughness={0.25} metalness={0.85} map={localTex} emissiveMap={localTex} emissive="#ffffff" emissiveIntensity={emissiveIntensity} />
      <meshStandardMaterial attach="material-2" color="#090d16" roughness={0.4} metalness={0.7} />
      <meshStandardMaterial attach="material-3" color="#090d16" roughness={0.4} metalness={0.7} />
      <meshStandardMaterial attach="material-4" color={wallColor} roughness={0.25} metalness={0.85} map={localTex} emissiveMap={localTex} emissive="#ffffff" emissiveIntensity={emissiveIntensity} />
      <meshStandardMaterial attach="material-5" color={wallColor} roughness={0.25} metalness={0.85} map={localTex} emissiveMap={localTex} emissive="#ffffff" emissiveIntensity={emissiveIntensity} />
      {edgeColor && <Edges color={edgeColor} threshold={15} transparent opacity={edgeOpacity} />}
    </mesh>
  );
}

// Blinking red aviation warning light on skyscraper rooftops
function AviationBeacon({ position, phaseOffset = 0 }) {
  const bulbRef = useRef();
  useFrame((state) => {
    if (bulbRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 4 + phaseOffset) > 0.2 ? 1.0 : 0.15;
      bulbRef.current.material.opacity = pulse;
    }
  });
  return (
    <mesh ref={bulbRef} position={position}>
      <sphereGeometry args={[0.07, 12, 12]} />
      <meshBasicMaterial color="#ef4444" transparent opacity={1} toneMapped={false} />
    </mesh>
  );
}

function Streetlights() {
  const lights = useMemo(() => {
    const arr = [];
    const SPACING = 8.0;
    for (let i = -4; i < 4; i++) {
      for (let j = -4; j <= 4; j++) {
        const x = (i + 0.5) * SPACING;
        const z = j * SPACING;
        arr.push({ pos: [x, 0, z + 1.8], rot: 0 });
        arr.push({ pos: [x, 0, z - 1.8], rot: Math.PI });
      }
    }
    for (let i = -4; i <= 4; i++) {
      for (let j = -4; j < 4; j++) {
        const x = i * SPACING;
        const z = (j + 0.5) * SPACING;
        arr.push({ pos: [x + 1.8, 0, z], rot: Math.PI / 2 });
        arr.push({ pos: [x - 1.8, 0, z], rot: -Math.PI / 2 });
      }
    }
    return arr;
  }, []);

  return (
    <group>
      {lights.map((l, i) => (
        <group key={i} position={[l.pos[0], 0.06, l.pos[2]]} rotation={[0, l.rot, 0]}>
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.03, 0.05, 3]} />
            <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 3, -0.3]}>
            <cylinderGeometry args={[0.02, 0.03, 0.8]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 2.95, -0.6]}>
            <sphereGeometry args={[0.08]} />
            <meshStandardMaterial color="#ffffff" emissive="#fef08a" emissiveIntensity={4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function InteractiveBuilding({ data, onClick, isZooming }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const [w, h, d] = data.scale;

  useFrame((state, delta) => {
    if (!groupRef.current || isZooming) return;
    const targetY = hovered ? 0.35 : 0;
    groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetY, 10, delta);
  });

  const tex = useMemo(() => {
    const master = windowTextures[Math.floor(Math.random() * windowTextures.length)].texture;
    const t = master.clone();
    t.needsUpdate = true;
    t.offset.set(Math.random(), Math.random());
    return t;
  }, []);

  const edgeColor = hovered ? '#7dd3fc' : data.accent;
  const edgeOpacity = hovered ? 0.95 : 0.42;
  const winGlow = hovered ? 2.4 : 1.9;
  const wallColor = hovered ? '#172554' : '#0f172a';

  return (
    <group
      position={[data.position[0], 0, data.position[2]]}
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onClick(data);
      }}
    >
      {/* Street-Level Lobby Podium */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[w * 1.12, 0.5, d * 1.12]} />
        <meshStandardMaterial color="#0b1120" metalness={0.85} roughness={0.2} />
        <Edges color={edgeColor} threshold={15} transparent opacity={edgeOpacity} />
      </mesh>
      {/* Subtle Blue/Cyan Podium Perimeter Trim */}
      <mesh position={[0, 0.51, 0]}>
        <boxGeometry args={[w * 1.14, 0.04, d * 1.14]} />
        <meshBasicMaterial color={edgeColor} transparent opacity={hovered ? 1 : 0.65} toneMapped={false} />
      </mesh>

      {/* 1. ABOUT — Stepped Empire Skyscraper */}
      {data.type === 'tower' && (
        <group>
          {/* Main Tower Shaft with Warm Yellow Windows */}
          <WindowedBox
            args={[w * 0.92, h * 0.58, d * 0.92]}
            position={[0, 0.5 + (h * 0.58) / 2, 0]}
            tex={tex}
            wallColor={wallColor}
            emissiveIntensity={winGlow}
            edgeColor={edgeColor}
            edgeOpacity={edgeOpacity}
          />
          {/* Mid Setback Tier */}
          <WindowedBox
            args={[w * 0.72, h * 0.24, d * 0.72]}
            position={[0, 0.5 + h * 0.58 + (h * 0.24) / 2, 0]}
            tex={tex}
            wallColor={wallColor}
            emissiveIntensity={winGlow}
            edgeColor={edgeColor}
            edgeOpacity={edgeOpacity}
          />
          {/* Upper Crown Tier */}
          <WindowedBox
            args={[w * 0.5, h * 0.12, d * 0.5]}
            position={[0, 0.5 + h * 0.82 + (h * 0.12) / 2, 0]}
            tex={tex}
            wallColor={wallColor}
            emissiveIntensity={winGlow}
            edgeColor={edgeColor}
            edgeOpacity={edgeOpacity}
          />
          {/* Mechanical Penthouse & Spire */}
          <mesh position={[0, 0.5 + h * 0.96, 0]}>
            <boxGeometry args={[w * 0.3, 0.25, d * 0.3]} />
            <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.2} />
            <Edges color={edgeColor} transparent opacity={edgeOpacity} />
          </mesh>
          <mesh position={[0, 0.5 + h * 0.96 + 0.55, 0]}>
            <cylinderGeometry args={[0.02, 0.05, 1.1, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>
          <AviationBeacon position={[0, 0.5 + h * 0.96 + 1.12, 0]} phaseOffset={0} />
        </group>
      )}

      {/* 2. EDUCATION — Twin High-Rise Skybridge Towers */}
      {data.type === 'block' && (
        <group>
          {/* Left High-Rise Tower */}
          <WindowedBox
            args={[w * 0.4, h * 0.88, d * 0.86]}
            position={[-w * 0.28, 0.5 + (h * 0.88) / 2, 0]}
            tex={tex}
            wallColor={wallColor}
            emissiveIntensity={winGlow}
            edgeColor={edgeColor}
            edgeOpacity={edgeOpacity}
          />
          {/* Right High-Rise Tower */}
          <WindowedBox
            args={[w * 0.4, h * 0.88, d * 0.86]}
            position={[w * 0.28, 0.5 + (h * 0.88) / 2, 0]}
            tex={tex}
            wallColor={wallColor}
            emissiveIntensity={winGlow}
            edgeColor={edgeColor}
            edgeOpacity={edgeOpacity}
          />
          {/* Mid-Level Glass Skybridge */}
          <WindowedBox
            args={[w * 0.24, h * 0.12, d * 0.55]}
            position={[0, 0.5 + h * 0.42, 0]}
            tex={tex}
            wallColor={wallColor}
            emissiveIntensity={winGlow}
            edgeColor={edgeColor}
            edgeOpacity={edgeOpacity}
          />
          {/* Upper Penthouse Skybridge */}
          <WindowedBox
            args={[w * 0.72, h * 0.12, d * 0.65]}
            position={[0, 0.5 + h * 0.76, 0]}
            tex={tex}
            wallColor={wallColor}
            emissiveIntensity={winGlow}
            edgeColor={edgeColor}
            edgeOpacity={edgeOpacity}
          />
          {/* Rooftop Mechanical Louvers */}
          <mesh position={[-w * 0.28, 0.5 + h * 0.88 + 0.15, 0]}>
            <boxGeometry args={[w * 0.28, 0.3, d * 0.6]} />
            <meshStandardMaterial color="#090d16" metalness={0.8} roughness={0.3} />
            <Edges color={edgeColor} transparent opacity={edgeOpacity} />
          </mesh>
          <mesh position={[w * 0.28, 0.5 + h * 0.88 + 0.15, 0]}>
            <boxGeometry args={[w * 0.28, 0.3, d * 0.6]} />
            <meshStandardMaterial color="#090d16" metalness={0.8} roughness={0.3} />
            <Edges color={edgeColor} transparent opacity={edgeOpacity} />
          </mesh>
          <AviationBeacon position={[-w * 0.28, 0.5 + h * 0.88 + 0.38, 0]} phaseOffset={1.2} />
          <AviationBeacon position={[w * 0.28, 0.5 + h * 0.88 + 0.38, 0]} phaseOffset={1.2} />
        </group>
      )}

      {/* 3. SKILLS — Tapered Setback Tech Skyscraper */}
      {data.type === 'antenna' && (
        <group>
          {/* Base High-Rise Volume */}
          <WindowedBox
            args={[w * 0.94, h * 0.45, d * 0.94]}
            position={[0, 0.5 + (h * 0.45) / 2, 0]}
            tex={tex}
            wallColor={wallColor}
            emissiveIntensity={winGlow}
            edgeColor={edgeColor}
            edgeOpacity={edgeOpacity}
          />
          {/* Mid Tapered Volume */}
          <WindowedBox
            args={[w * 0.76, h * 0.3, d * 0.76]}
            position={[0, 0.5 + h * 0.45 + (h * 0.3) / 2, 0]}
            tex={tex}
            wallColor={wallColor}
            emissiveIntensity={winGlow}
            edgeColor={edgeColor}
            edgeOpacity={edgeOpacity}
          />
          {/* Upper Crown Volume */}
          <WindowedBox
            args={[w * 0.56, h * 0.18, d * 0.56]}
            position={[0, 0.5 + h * 0.75 + (h * 0.18) / 2, 0]}
            tex={tex}
            wallColor={wallColor}
            emissiveIntensity={winGlow}
            edgeColor={edgeColor}
            edgeOpacity={edgeOpacity}
          />
          {/* Twin Rooftop Telecom Masts */}
          <mesh position={[-w * 0.14, 0.5 + h * 0.93 + 0.5, 0]}>
            <cylinderGeometry args={[0.02, 0.04, 1.0, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[w * 0.14, 0.5 + h * 0.93 + 0.35, 0]}>
            <cylinderGeometry args={[0.015, 0.035, 0.7, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
          <AviationBeacon position={[-w * 0.14, 0.5 + h * 0.93 + 1.04, 0]} phaseOffset={2.1} />
        </group>
      )}

      {/* 4. PROJECTS — Cantilevered Corporate HQ Skyscraper */}
      {data.type === 'tiered' && (
        <group>
          {/* Primary Tall Tower Core */}
          <WindowedBox
            args={[w * 0.62, h * 0.92, d * 0.62]}
            position={[-w * 0.14, 0.5 + (h * 0.92) / 2, -d * 0.1]}
            tex={tex}
            wallColor={wallColor}
            emissiveIntensity={winGlow}
            edgeColor={edgeColor}
            edgeOpacity={edgeOpacity}
          />
          {/* Secondary Mid-Rise Wing */}
          <WindowedBox
            args={[w * 0.56, h * 0.62, d * 0.68]}
            position={[w * 0.2, 0.5 + (h * 0.62) / 2, d * 0.12]}
            tex={tex}
            wallColor={wallColor}
            emissiveIntensity={winGlow}
            edgeColor={edgeColor}
            edgeOpacity={edgeOpacity}
          />
          {/* Cantilevered Upper Sky-Deck */}
          <WindowedBox
            args={[w * 0.88, h * 0.14, d * 0.58]}
            position={[0.08, 0.5 + h * 0.74, 0]}
            tex={tex}
            wallColor={wallColor}
            emissiveIntensity={winGlow}
            edgeColor={edgeColor}
            edgeOpacity={edgeOpacity}
          />
          {/* Rooftop Helipad on Primary Core */}
          <mesh position={[-w * 0.14, 0.5 + h * 0.92 + 0.03, -d * 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[w * 0.22, 24]} />
            <meshBasicMaterial color="#1e293b" />
          </mesh>
          <AviationBeacon position={[-w * 0.38, 0.5 + h * 0.92 + 0.1, -d * 0.34]} phaseOffset={3.0} />
        </group>
      )}

      {/* 5. CONTACT — Terraced Media & Comms Tower */}
      {data.type === 'pavilion' && (
        <group>
          {/* Lower Tower Shaft */}
          <WindowedBox
            args={[w * 0.88, h * 0.55, d * 0.88]}
            position={[0, 0.5 + (h * 0.55) / 2, 0]}
            tex={tex}
            wallColor={wallColor}
            emissiveIntensity={winGlow}
            edgeColor={edgeColor}
            edgeOpacity={edgeOpacity}
          />
          {/* Upper Setback Shaft */}
          <WindowedBox
            args={[w * 0.66, h * 0.32, d * 0.66]}
            position={[0, 0.5 + h * 0.55 + (h * 0.32) / 2, 0]}
            tex={tex}
            wallColor={wallColor}
            emissiveIntensity={winGlow}
            edgeColor={edgeColor}
            edgeOpacity={edgeOpacity}
          />
          {/* Architectural Media Band */}
          <mesh position={[0, 0.5 + h * 0.55, 0]}>
            <boxGeometry args={[w * 0.92, 0.12, d * 0.92]} />
            <meshBasicMaterial color={edgeColor} transparent opacity={hovered ? 0.95 : 0.6} toneMapped={false} />
          </mesh>
          {/* Penthouse Broadcast Box & Mast */}
          <mesh position={[0, 0.5 + h * 0.87 + 0.18, 0]}>
            <boxGeometry args={[w * 0.4, 0.36, d * 0.4]} />
            <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.2} />
            <Edges color={edgeColor} transparent opacity={edgeOpacity} />
          </mesh>
          <mesh position={[0, 0.5 + h * 0.87 + 0.7, 0]}>
            <cylinderGeometry args={[0.02, 0.045, 0.8, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>
          <AviationBeacon position={[0, 0.5 + h * 0.87 + 1.12, 0]} phaseOffset={4.2} />
        </group>
      )}

      {/* Top Building Label (Positioned cleanly in camera view) */}
      <Html
        position={[0, h + 1.5, 0]}
        center
        transform
        distanceFactor={15}
      >
        <div
          className="px-2.5 py-1 rounded-md border backdrop-blur-md transition-all duration-300 flex items-center gap-1.5"
          style={{
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            backgroundColor: hovered ? 'rgba(7, 11, 20, 0.95)' : 'rgba(10, 14, 26, 0.82)',
            borderColor: hovered ? data.accent : 'rgba(56, 189, 248, 0.45)',
            boxShadow: hovered
              ? `0 0 18px ${data.accent}80`
              : '0 4px 10px rgba(0, 0, 0, 0.6)'
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: data.accent,
              boxShadow: `0 0 6px ${data.accent}`
            }}
          />
          <span className="font-extrabold tracking-wider uppercase text-white text-xs">
            {data.label}
          </span>
        </div>
      </Html>

      {/* Blue/Cyan Hover Tooltip Centered on the Middle of the Building Body */}
      {hovered && (
        <Html position={[0, h * 0.48, 0]} center className="pointer-events-none z-50">
          <div
            className="px-3.5 py-1.5 rounded-lg backdrop-blur-xl border text-center whitespace-nowrap flex flex-col items-center"
            style={{
              backgroundColor: 'rgba(8, 15, 30, 0.94)',
              borderColor: data.accent,
              boxShadow: `0 0 20px ${data.accent}77`
            }}
          >
            <span
              className="block text-[9px] font-semibold tracking-widest uppercase opacity-90"
              style={{ color: data.accent }}
            >
              Enter Building
            </span>
            <span className="text-xs font-bold text-[#e0f2fe]">
              Click to enter
            </span>
          </div>
        </Html>
      )}

      {hovered && <pointLight position={[0, h * 0.5, 0]} color="#fef08a" intensity={5} distance={16} />}
    </group>
  );
}

// Constants for City Grid
const ROAD_WIDTH = 3.0;
const BLOCK_SIZE = 5.0;
const SPACING = ROAD_WIDTH + BLOCK_SIZE;

function BuildingMesh({ b }) {
  const tex = useMemo(() => {
    const master = windowTextures[Math.floor(Math.random() * windowTextures.length)].texture;
    const t = master.clone();
    t.needsUpdate = true;
    t.repeat.set(b.scale[0] / 2, b.scale[1] / 2);
    t.offset.set(Math.random(), Math.random());
    return t;
  }, [b.scale]);

  return (
    <group position={b.position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={b.scale} />
        <meshStandardMaterial attach="material-0" color={b.color} roughness={0.2} metalness={0.9} map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={1.8} />
        <meshStandardMaterial attach="material-1" color={b.color} roughness={0.2} metalness={0.9} map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={1.8} />
        <meshStandardMaterial attach="material-2" color="#050505" roughness={0.5} metalness={0.5} />
        <meshStandardMaterial attach="material-3" color="#050505" roughness={0.5} metalness={0.5} />
        <meshStandardMaterial attach="material-4" color={b.color} roughness={0.2} metalness={0.9} map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={1.8} />
        <meshStandardMaterial attach="material-5" color={b.color} roughness={0.2} metalness={0.9} map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={1.8} />
      </mesh>
      {/* Sleek roof cap & rooftop AC units */}
      <mesh position={[0, b.scale[1] / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[b.scale[0] * 0.9, b.scale[2] * 0.9]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      {b.hasRoofUnit && (
        <mesh position={[b.scale[0] * 0.18, b.scale[1] / 2 + 0.12, -b.scale[2] * 0.15]}>
          <boxGeometry args={[0.35, 0.22, 0.35]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
      )}
      {b.hasNeon && (
        <mesh position={[b.scale[0] / 2 + 0.01, 0, 0]}>
          <planeGeometry args={[0.05, b.scale[1] * 0.9]} />
          <meshBasicMaterial color={new THREE.Color(b.neonColor).multiplyScalar(2)} toneMapped={false} />
        </mesh>
      )}
      {b.hasBillboard && (
        <group position={[0, b.scale[1] * 0.22, b.scale[2] / 2 + 0.02]}>
          <mesh>
            <planeGeometry args={[Math.min(1.8, b.scale[0] * 0.78), 0.95]} />
            <meshBasicMaterial color={b.neonColor} transparent opacity={0.85} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[Math.min(1.8, b.scale[0] * 0.78) + 0.1, 1.05]} />
            <meshBasicMaterial color="#111111" />
          </mesh>
        </group>
      )}
    </group>
  );
}

function AmbientCityGrid() {
  const { blocks, roadSegments, intersections, parks, sidewalks } = useMemo(() => {
    const bldgs = [];
    const rSegs = [];
    const inters = [];
    const parkLocs = [];
    const swLocs = [];

    const colors = ['#080808', '#111111', '#1a1a1a', '#050505'];

    for (let i = -4; i <= 4; i++) {
      for (let j = -4; j <= 4; j++) {
        inters.push([i * SPACING, j * SPACING]);
        if (i < 4) rSegs.push({ pos: [(i + 0.5) * SPACING, 0, j * SPACING], scale: [BLOCK_SIZE, ROAD_WIDTH] });
        if (j < 4) rSegs.push({ pos: [i * SPACING, 0, (j + 0.5) * SPACING], scale: [ROAD_WIDTH, BLOCK_SIZE] });
        if (i < 4 && j < 4) swLocs.push([(i + 0.5) * SPACING, 0.03, (j + 0.5) * SPACING]);
      }
    }

    // Dedicated pocket park / night plaza coordinates to bring life to city blocks
    const parkCoords = new Set(['-12,-4', '-4,12', '12,4', '-12,12']);

    for (let xIdx = -3; xIdx <= 3; xIdx++) {
      for (let zIdx = -3; zIdx <= 3; zIdx++) {
        const centerX = xIdx * SPACING + SPACING / 2;
        const centerZ = zIdx * SPACING + SPACING / 2;

        const isInteractiveBlock = interactiveBuildings.some(
          (b) => Math.abs(b.position[0] - centerX) < 1 && Math.abs(b.position[2] - centerZ) < 1
        );
        if (isInteractiveBlock) continue;

        if (parkCoords.has(`${centerX},${centerZ}`)) {
          parkLocs.push([centerX, 0.04, centerZ]);
          continue;
        }

        for (let dx of [-1.2, 1.2]) {
          for (let dz of [-1.2, 1.2]) {
            if (Math.random() > 0.85) continue;

            const bx = centerX + dx;
            const bz = centerZ + dz;
            const height = Math.random() * 2.8 + 1.8;
            const scale = [Math.random() * 1.4 + 1.2, height, Math.random() * 1.4 + 1.2];
            const hasNeon = Math.random() > 0.65;
            const neonColor = ['#38bdf8', '#a78bfa', '#f472b6', '#34d399', '#fde047'][Math.floor(Math.random() * 5)];

            bldgs.push({
              position: [bx, height / 2, bz],
              scale,
              color: colors[Math.floor(Math.random() * colors.length)],
              hasNeon,
              neonColor,
              hasBillboard: Math.random() > 0.82,
              hasRoofUnit: Math.random() > 0.4
            });
          }
        }
      }
    }
    return { blocks: bldgs, roadSegments: rSegs, intersections: inters, parks: parkLocs, sidewalks: swLocs };
  }, []);

  return (
    <group>
      {/* Ground plane */}
      <RigidBody type="fixed">
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial map={asphaltTexture} color="#888888" roughness={1} />
        </mesh>
      </RigidBody>

      {/* Sidewalks */}
      {sidewalks.map((pos, i) => (
        <mesh key={`sw-${i}`} position={pos} receiveShadow>
          <boxGeometry args={[BLOCK_SIZE, 0.06, BLOCK_SIZE]} />
          <meshStandardMaterial map={asphaltTexture} color="#777777" roughness={0.9} />
        </mesh>
      ))}

      {/* Roads with Warm Yellow Markings & Cyan Edge Lines */}
      <group position={[0, 0.01, 0]}>
        {intersections.map((pos, i) => (
          <group key={`int-${i}`} position={[pos[0], 0, pos[1]]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[ROAD_WIDTH, ROAD_WIDTH]} />
              <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
            </mesh>
            {/* Intersection Square Border (Restored Warm Yellow) */}
            <group position={[0, 0.01, 0]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 1.3]}>
                <planeGeometry args={[2.7, 0.1]} />
                <meshBasicMaterial color="#fde047" transparent opacity={0.4} />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1.3]}>
                <planeGeometry args={[2.7, 0.1]} />
                <meshBasicMaterial color="#fde047" transparent opacity={0.4} />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.3, 0, 0]}>
                <planeGeometry args={[0.1, 2.7]} />
                <meshBasicMaterial color="#fde047" transparent opacity={0.4} />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.3, 0, 0]}>
                <planeGeometry args={[0.1, 2.7]} />
                <meshBasicMaterial color="#fde047" transparent opacity={0.4} />
              </mesh>
            </group>
            {/* Yellow X */}
            <group position={[0, 0.015, 0]}>
              <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
                <planeGeometry args={[3.6, 0.1]} />
                <meshBasicMaterial color="#fde047" transparent opacity={0.4} />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, -Math.PI / 4]}>
                <planeGeometry args={[3.6, 0.1]} />
                <meshBasicMaterial color="#fde047" transparent opacity={0.4} />
              </mesh>
            </group>
          </group>
        ))}
        {roadSegments.map((r, i) => {
          const isX = r.scale[0] > r.scale[1];
          return (
            <group key={`seg-${i}`} position={[r.pos[0], 0, r.pos[2]]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={r.scale} />
                <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
              </mesh>
              {/* Center lane divider (Restored Warm Yellow) */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <planeGeometry args={[isX ? r.scale[0] : 0.1, isX ? 0.1 : r.scale[1]]} />
                <meshBasicMaterial color="#fde047" transparent opacity={0.5} />
              </mesh>
              {/* Edge glow lines */}
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[isX ? 0 : ROAD_WIDTH / 2 - 0.15, 0.01, isX ? ROAD_WIDTH / 2 - 0.15 : 0]}
              >
                <planeGeometry args={[isX ? r.scale[0] : 0.05, isX ? 0.05 : r.scale[1]]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
              </mesh>
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[isX ? 0 : -(ROAD_WIDTH / 2 - 0.15), 0.01, isX ? -(ROAD_WIDTH / 2 - 0.15) : 0]}
              >
                <planeGeometry args={[isX ? r.scale[0] : 0.05, isX ? 0.05 : r.scale[1]]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
              </mesh>
            </group>
          );
        })}
      </group>

      {blocks.map((b, i) => (
        <BuildingMesh key={`bldg-${i}`} b={b} />
      ))}

      {/* Illuminated Night Parks & Plazas */}
      {parks.map((p, i) => (
        <group key={`park-${i}`} position={p}>
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[4.6, 4.6]} />
            <meshStandardMaterial color="#0f1f1c" roughness={0.9} />
          </mesh>
          {/* Illuminated Fountain / Plaza Centerpiece */}
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.55, 0.65, 0.32, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.36, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.06, 16]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.75} toneMapped={false} />
          </mesh>
          {/* Corner Trees with Warm Ground Uplights */}
          {[
            [-1.5, -1.5],
            [1.5, -1.5],
            [-1.5, 1.5],
            [1.5, 1.5]
          ].map(([tx, tz], idx) => (
            <group key={idx} position={[tx, 0, tz]}>
              <mesh position={[0, 0.35, 0]} castShadow>
                <cylinderGeometry args={[0.06, 0.09, 0.7]} />
                <meshStandardMaterial color="#3f2e21" roughness={0.9} />
              </mesh>
              <mesh position={[0, 0.85, 0]} castShadow>
                <sphereGeometry args={[0.42, 12, 12]} />
                <meshStandardMaterial color="#10b981" roughness={0.7} emissive="#065f46" emissiveIntensity={0.6} />
              </mesh>
              <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.25, 12]} />
                <meshBasicMaterial color="#fef08a" transparent opacity={0.5} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

// Elevated Monorail / Sky-Train gliding across the outer city avenues
function SkyTrain() {
  const train1Ref = useRef();
  const train2Ref = useRef();

  useFrame((state, delta) => {
    if (train1Ref.current) {
      train1Ref.current.position.x += 14 * delta;
      if (train1Ref.current.position.x > 65) train1Ref.current.position.x = -65;
    }
    if (train2Ref.current) {
      train2Ref.current.position.z -= 12 * delta;
      if (train2Ref.current.position.z < -65) train2Ref.current.position.z = 65;
    }
  });

  return (
    <group>
      {/* Elevated Track 1 (Runs along X at Z = -16, Y = 3.8) */}
      <mesh position={[0, 3.8, -16]}>
        <boxGeometry args={[130, 0.14, 0.5]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 3.88, -15.74]}>
        <boxGeometry args={[130, 0.03, 0.04]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} />
      </mesh>
      <mesh ref={train1Ref} position={[-30, 4.05, -16]}>
        {[-1.5, 0, 1.5].map((offset, idx) => (
          <group key={idx} position={[offset, 0, 0]}>
            <mesh>
              <boxGeometry args={[1.35, 0.32, 0.38]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Warm Yellow Passenger Cabin Window Strip */}
            <mesh position={[0, 0.03, 0]}>
              <boxGeometry args={[1.2, 0.12, 0.4]} />
              <meshBasicMaterial color="#fef08a" toneMapped={false} />
            </mesh>
          </group>
        ))}
      </mesh>

      {/* Elevated Track 2 (Runs along Z at X = -16, Y = 4.4) */}
      <mesh position={[-16, 4.4, 0]}>
        <boxGeometry args={[0.5, 0.14, 130]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-15.74, 4.48, 0]}>
        <boxGeometry args={[0.04, 0.03, 130]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} />
      </mesh>
      <mesh ref={train2Ref} position={[-16, 4.65, 30]}>
        {[-1.5, 0, 1.5].map((offset, idx) => (
          <group key={idx} position={[0, 0, offset]}>
            <mesh>
              <boxGeometry args={[0.38, 0.32, 1.35]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.03, 0]}>
              <boxGeometry args={[0.4, 0.12, 1.2]} />
              <meshBasicMaterial color="#fef08a" toneMapped={false} />
            </mesh>
          </group>
        ))}
      </mesh>
    </group>
  );
}

function Car({ carData }) {
  const carRef = useRef();
  const sirenRef = useRef();

  useFrame((state, delta) => {
    if (carRef.current) {
      const currentPos = carData.isZAxis ? carRef.current.position.z : carRef.current.position.x;
      const nextPos = currentPos + carData.speed * delta;

      let shouldStop = false;
      const nearestIntersection = Math.round(nextPos / SPACING) * SPACING;
      const distToIntersection = Math.abs(nextPos - nearestIntersection);

      if (distToIntersection < 2.0 && distToIntersection > 1.0) {
        const isApproaching = Math.abs(nextPos - nearestIntersection) < Math.abs(currentPos - nearestIntersection);
        if (isApproaching) {
          const lightIsGreen = carData.isZAxis ? globalTrafficState.zGreen : !globalTrafficState.zGreen;
          if (!lightIsGreen) {
            shouldStop = true;
          }
        }
      }

      if (!shouldStop) {
        if (carData.isZAxis) {
          carRef.current.position.z = nextPos;
          if (carRef.current.position.z > 60) carRef.current.position.z = -60;
          if (carRef.current.position.z < -60) carRef.current.position.z = 60;
        } else {
          carRef.current.position.x = nextPos;
          if (carRef.current.position.x > 60) carRef.current.position.x = -60;
          if (carRef.current.position.x < -60) carRef.current.position.x = 60;
        }
      }
    }
    if (sirenRef.current && carData.type === 'police') {
      const isBlue = Math.sin(state.clock.elapsedTime * 18) > 0;
      sirenRef.current.material.color.set(isBlue ? '#38bdf8' : '#ef4444');
    }
  });

  const isForward = carData.speed > 0;
  const rotation = carData.isZAxis ? 0 : Math.PI / 2;
  const length = carData.type === 'bus' ? 1.3 : 0.7;
  const height = carData.type === 'bus' ? 0.36 : 0.25;
  const frontZ = isForward ? length / 2 + 0.01 : -(length / 2 + 0.01);
  const backZ = isForward ? -(length / 2 + 0.01) : length / 2 + 0.01;

  return (
    <group
      ref={carRef}
      position={carData.isZAxis ? [carData.fixedAxisPos, 0.15, carData.startPos] : [carData.startPos, 0.15, carData.fixedAxisPos]}
      rotation={[0, rotation, 0]}
    >
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[0.35, height, length]} />
        <meshStandardMaterial color={carData.color} roughness={0.15} metalness={0.85} />
      </mesh>
      {/* Taxi Glowing Roof Sign */}
      {carData.type === 'taxi' && (
        <mesh position={[0, 0.36, 0]}>
          <boxGeometry args={[0.14, 0.06, 0.18]} />
          <meshBasicMaterial color="#fef08a" toneMapped={false} />
        </mesh>
      )}
      {/* Police Flashing Lightbar */}
      {carData.type === 'police' && (
        <mesh ref={sirenRef} position={[0, 0.36, 0]}>
          <boxGeometry args={[0.24, 0.05, 0.1]} />
          <meshBasicMaterial color="#38bdf8" toneMapped={false} />
        </mesh>
      )}
      {/* Bus Lit Passenger Windows */}
      {carData.type === 'bus' && (
        <mesh position={[0, 0.24, 0]}>
          <boxGeometry args={[0.37, 0.12, 1.05]} />
          <meshBasicMaterial color="#fef08a" toneMapped={false} />
        </mesh>
      )}
      <mesh position={[0.1, 0.2, frontZ]}>
        <planeGeometry args={[0.08, 0.08]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh position={[-0.1, 0.2, frontZ]}>
        <planeGeometry args={[0.08, 0.08]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh position={[0.1, 0.2, backZ]}>
        <planeGeometry args={[0.08, 0.08]} />
        <meshBasicMaterial color="#ff0000" toneMapped={false} />
      </mesh>
      <mesh position={[-0.1, 0.2, backZ]}>
        <planeGeometry args={[0.08, 0.08]} />
        <meshBasicMaterial color="#ff0000" toneMapped={false} />
      </mesh>
    </group>
  );
}

function Traffic() {
  const initialCars = useMemo(() => {
    const cars = [];
    const roads = [-32, -24, -16, -8, 0, 8, 16, 24, 32];

    for (let i = 0; i < 48; i++) {
      const isZAxis = Math.random() > 0.5;
      const roadPos = roads[Math.floor(Math.random() * roads.length)];

      const isPositiveLane = Math.random() > 0.5;
      const laneOffset = isPositiveLane ? 0.6 : -0.6;
      const fixedAxisPos = roadPos + laneOffset;

      const startPos = Math.random() * 120 - 60;
      const roll = Math.random();
      let type = 'car';
      let color = ['#ffffff', '#ff3333', '#3388ff', '#111111', '#cccccc'][Math.floor(Math.random() * 5)];
      let speed = (Math.random() * 6 + 4) * (isPositiveLane ? 1 : -1);

      if (roll > 0.88) {
        type = 'bus';
        color = '#1e3a8a';
        speed = (Math.random() * 3 + 3.5) * (isPositiveLane ? 1 : -1);
      } else if (roll > 0.72) {
        type = 'taxi';
        color = '#facc15';
      } else if (roll > 0.65) {
        type = 'police';
        color = '#0f172a';
        speed = (Math.random() * 7 + 6) * (isPositiveLane ? 1 : -1);
      }

      cars.push({ isZAxis, fixedAxisPos, startPos, speed, color, type });
    }
    return cars;
  }, []);

  useFrame((state, delta) => {
    globalTrafficState.timer += delta;
    if (globalTrafficState.timer > 4) {
      globalTrafficState.zGreen = !globalTrafficState.zGreen;
      globalTrafficState.timer = 0;
    }
  });

  return (
    <group>
      {initialCars.map((car, i) => (
        <Car key={i} carData={car} />
      ))}
    </group>
  );
}

function Pedestrian({ data }) {
  const pedRef = useRef();

  useFrame((state, delta) => {
    if (pedRef.current) {
      if (data.isZAxis) {
        pedRef.current.position.z += data.speed * delta;
        if (pedRef.current.position.z > 60) pedRef.current.position.z = -60;
        if (pedRef.current.position.z < -60) pedRef.current.position.z = 60;
      } else {
        pedRef.current.position.x += data.speed * delta;
        if (pedRef.current.position.x > 60) pedRef.current.position.x = -60;
        if (pedRef.current.position.x < -60) pedRef.current.position.x = 60;
      }

      pedRef.current.position.y = 0.2 + Math.abs(Math.sin(state.clock.elapsedTime * 10 + data.phase)) * 0.05;
    }
  });

  return (
    <group
      ref={pedRef}
      position={[data.isZAxis ? data.fixedAxisPos : data.startPos, 0.2, data.isZAxis ? data.startPos : data.fixedAxisPos]}
    >
      <mesh castShadow>
        <capsuleGeometry args={[0.08, 0.2, 4, 8]} />
        <meshStandardMaterial color={data.color} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Pedestrians() {
  const peds = useMemo(() => {
    const arr = [];
    const sidewalks = [-25.8, -22.2, -17.8, -14.2, -9.8, -6.2, -1.8, 1.8, 6.2, 9.8, 14.2, 17.8, 22.2, 25.8];
    for (let i = 0; i < 85; i++) {
      const isZAxis = Math.random() > 0.5;
      const fixedAxisPos = sidewalks[Math.floor(Math.random() * sidewalks.length)];
      const startPos = Math.random() * 120 - 60;
      const speed = (Math.random() * 1.5 + 0.5) * (Math.random() > 0.5 ? 1 : -1);
      const color = `hsl(${Math.random() * 360}, 50%, 42%)`;
      const phase = Math.random() * Math.PI * 2;
      arr.push({ isZAxis, fixedAxisPos, startPos, speed, color, phase });
    }
    return arr;
  }, []);

  return (
    <group>
      {peds.map((p, i) => (
        <Pedestrian key={i} data={p} />
      ))}
    </group>
  );
}

function TrafficLights() {
  const intersections = useMemo(() => {
    const ints = [];
    for (let x = -24; x <= 24; x += 8) {
      for (let z = -24; z <= 24; z += 8) {
        ints.push([x, z]);
      }
    }
    return ints;
  }, []);

  const [zGreen, setZGreen] = useState(true);
  const lastStateRef = useRef(true);

  useFrame(() => {
    if (globalTrafficState.zGreen !== lastStateRef.current) {
      lastStateRef.current = globalTrafficState.zGreen;
      setZGreen(globalTrafficState.zGreen);
    }
  });

  return (
    <group>
      {intersections.map((pos, i) => (
        <group key={i} position={[pos[0], 0, pos[1]]}>
          {/* Light pole for Z-axis traffic (faces Z) */}
          <group position={[-1.8, 0, -1.8]}>
            <mesh position={[0, 1.5, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 3]} />
              <meshStandardMaterial color="#222" />
            </mesh>
            <mesh position={[0, 2.8, 0]}>
              <boxGeometry args={[0.2, 0.6, 0.2]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            <mesh position={[0, 2.9, 0.11]}>
              <sphereGeometry args={[0.08]} />
              <meshBasicMaterial color={!zGreen ? '#ff0000' : '#440000'} />
            </mesh>
            <mesh position={[0, 2.7, 0.11]}>
              <sphereGeometry args={[0.08]} />
              <meshBasicMaterial color={zGreen ? '#00ff00' : '#004400'} />
            </mesh>
          </group>

          {/* Light pole for X-axis traffic (faces X) */}
          <group position={[1.8, 0, 1.8]} rotation={[0, Math.PI / 2, 0]}>
            <mesh position={[0, 1.5, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 3]} />
              <meshStandardMaterial color="#222" />
            </mesh>
            <mesh position={[0, 2.8, 0]}>
              <boxGeometry args={[0.2, 0.6, 0.2]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            <mesh position={[0, 2.9, 0.11]}>
              <sphereGeometry args={[0.08]} />
              <meshBasicMaterial color={zGreen ? '#ff0000' : '#440000'} />
            </mesh>
            <mesh position={[0, 2.7, 0.11]}>
              <sphereGeometry args={[0.08]} />
              <meshBasicMaterial color={!zGreen ? '#00ff00' : '#004400'} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

function MovingClouds() {
  const cloudsRef = useRef([]);

  const cloudsData = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 20; i++) {
      arr.push({
        pos: [Math.random() * 100 - 50, Math.random() * 10 + 15, Math.random() * 80 - 40],
        scale: Math.random() * 2 + 1.5,
        speed: Math.random() * 1 + 0.5,
        opacity: Math.random() * 0.15 + 0.05
      });
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    cloudsRef.current.forEach((cloud, i) => {
      if (cloud) {
        cloud.position.x += cloudsData[i].speed * delta;
        if (cloud.position.x > 50) cloud.position.x = -50;
      }
    });
  });

  return (
    <group>
      {cloudsData.map((data, i) => (
        <group key={i} ref={(el) => (cloudsRef.current[i] = el)} position={data.pos}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[data.scale, 16, 16]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={data.opacity} />
          </mesh>
          <mesh position={[data.scale * 0.8, -data.scale * 0.2, 0]}>
            <sphereGeometry args={[data.scale * 0.7, 16, 16]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={data.opacity} />
          </mesh>
          <mesh position={[-data.scale * 0.8, -data.scale * 0.2, 0]}>
            <sphereGeometry args={[data.scale * 0.6, 16, 16]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={data.opacity} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CameraRig({ targetBuilding, onZoomComplete }) {
  const introTimer = useRef(0);

  useFrame((state, delta) => {
    introTimer.current += delta;

    if (targetBuilding) {
      const midY = targetBuilding.scale[1] * 0.55;
      const targetPos = new THREE.Vector3(
        targetBuilding.position[0] + 6,
        midY + 5,
        targetBuilding.position[2] + 6
      );
      state.camera.position.lerp(targetPos, 0.05);
      state.camera.lookAt(targetBuilding.position[0], midY, targetBuilding.position[2]);

      if (state.camera.position.distanceTo(targetPos) < 0.5) {
        onZoomComplete();
      }
    } else {
      // Hold close inside the skyline while LoadingScreen finishes (~1.1s), then smoothly pan out to [25, 25, 25]
      const isOpening = introTimer.current < 1.1;
      const targetX = isOpening ? 9 : 25 + state.pointer.x * 5;
      const targetY = isOpening ? 5.5 : 25 + state.pointer.y * 5;
      const targetZ = isOpening ? 9 : 25 + state.pointer.x * 3;
      const dampSpeed = isOpening ? 3.5 : 1.6;

      state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetX, dampSpeed, delta);
      state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetY, dampSpeed, delta);
      state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetZ, dampSpeed, delta);
      state.camera.lookAt(0, 1.8, 0);
    }
  });
  return null;
}

function Hovercars() {
  const cars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 24; i++) {
      arr.push({
        pos: [Math.random() * 120 - 60, Math.random() * 10 + 12, Math.random() * 120 - 60],
        speed: (Math.random() * 15 + 8) * (Math.random() > 0.5 ? 1 : -1),
        isX: Math.random() > 0.5,
        color: ['#38bdf8', '#f472b6', '#fde047'][Math.floor(Math.random() * 3)]
      });
    }
    return arr;
  }, []);

  const carsRef = useRef([]);

  useFrame((state, delta) => {
    carsRef.current.forEach((car, i) => {
      if (car) {
        if (cars[i].isX) {
          car.position.x += cars[i].speed * delta;
          if (car.position.x > 60) car.position.x = -60;
          if (car.position.x < -60) car.position.x = 60;
        } else {
          car.position.z += cars[i].speed * delta;
          if (car.position.z > 60) car.position.z = -60;
          if (car.position.z < -60) car.position.z = 60;
        }
      }
    });
  });

  return (
    <group>
      {cars.map((c, i) => (
        <group key={i} ref={(el) => (carsRef.current[i] = el)} position={c.pos}>
          <mesh>
            <sphereGeometry args={[0.2]} />
            <meshBasicMaterial color={c.color} />
          </mesh>
          <mesh position={[c.isX ? (c.speed > 0 ? -0.4 : 0.4) : 0, 0, !c.isX ? (c.speed > 0 ? -0.4 : 0.4) : 0]}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color={c.color} transparent opacity={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function BackgroundCity() {
  const bgBldgs = useMemo(() => {
    const bldgs = [];
    const count = 350;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 90 + 50;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const w = Math.random() * 5 + 3;
      const d = Math.random() * 5 + 3;
      const h = Math.random() * 30 + 10;
      const hasCrown = Math.random() > 0.45;
      const hasLitWindow = Math.random() > 0.5;
      bldgs.push({ pos: [x, h / 2 - 0.1, z], scale: [w, h, d], hasCrown, hasLitWindow });
    }
    return bldgs;
  }, []);

  return (
    <group>
      {bgBldgs.map((b, i) => (
        <group key={i} position={b.pos}>
          <mesh castShadow={false} receiveShadow={false}>
            <boxGeometry args={b.scale} />
            <meshBasicMaterial color="#020305" map={windowTextures[i % windowTextures.length].texture} />
          </mesh>
          {b.hasCrown && (
            <mesh position={[0, b.scale[1] * 0.58, 0]} castShadow={false} receiveShadow={false}>
              <boxGeometry args={[b.scale[0] * 0.65, b.scale[1] * 0.2, b.scale[2] * 0.65]} />
              <meshBasicMaterial color="#020305" map={windowTextures[(i + 1) % windowTextures.length].texture} />
            </mesh>
          )}
          {b.hasLitWindow && (
            <mesh position={[0, b.scale[1] / 2 - 2, b.scale[2] / 2 + 0.1]}>
              <planeGeometry args={[0.5, 0.5]} />
              <meshBasicMaterial color="#fde047" transparent opacity={0.5} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

export default function CityScene({ onEnter, onExit3D }) {
  const shouldReduceMotion = useReducedMotion();
  const [zoomingTo, setZoomingTo] = useState(null);
  const [lowPerf, setLowPerf] = useState(false);

  const ambientIntensity = 0.8;
  const fogDensity = 25;
  const glitchIntensity = 0.1;

  const handleBuildingClick = (buildingData) => {
    setZoomingTo(buildingData);
    if (shouldReduceMotion) {
      onEnter(buildingData.id);
    }
  };

  const handleZoomComplete = () => {
    if (zoomingTo) {
      onEnter(zoomingTo.id);
    }
  };

  return (
    <motion.div
      className="w-full h-[100dvh] relative bg-[#0f172a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Top-Right Button to Return to Static Portfolio View */}
      {onExit3D && !zoomingTo && (
        <div className="fixed top-6 right-6 z-40">
          <button
            onClick={onExit3D}
            className="px-4 py-2 rounded-full bg-[#141821]/85 backdrop-blur-xl border border-white/15 text-xs font-semibold tracking-wider uppercase text-slate-200 hover:text-white hover:border-[#38bdf8] transition-all duration-200 shadow-lg cursor-pointer"
          >
            ← Standard View
          </button>
        </div>
      )}

      {/* 3D Canvas (Clamped DPR + Adaptive Performance Monitor for Lower-End Devices) */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows={!lowPerf} dpr={[1, 1.5]}>
          <PerformanceMonitor
            onDecline={() => setLowPerf(true)}
            onIncline={() => setLowPerf(false)}
          />
          <AdaptiveDpr pixelated />
          <PerspectiveCamera makeDefault position={[9, 5.5, 9]} fov={30} />
          <CyberSky />
          <fog attach="fog" args={['#010206', fogDensity, 80]} />

          <ambientLight intensity={ambientIntensity} color="#ffffff" />
          <directionalLight
            position={[20, 40, 20]}
            intensity={0.2}
            color="#4338ca"
            castShadow={!lowPerf}
            shadow-mapSize={lowPerf ? [1024, 1024] : [2048, 2048]}
          />
          <pointLight position={[0, 20, 0]} intensity={0.3} color="#818cf8" distance={80} />

          {!lowPerf && (
            <EffectComposer>
              <Bloom luminanceThreshold={0.8} mipmapBlur intensity={1.2} radius={0.6} />
              <PPNoise opacity={0.03} />
              <ChromaticAberration offset={[0.002 * glitchIntensity, 0.002 * glitchIntensity]} />
            </EffectComposer>
          )}

          <Stars radius={60} depth={50} count={3000} factor={4} saturation={1} fade speed={1} />

          <Physics>
            <AmbientCityGrid />
            <SkyTrain />
            <Traffic />
            <Pedestrians />
            <TrafficLights />
            <AnimatedWindows />
            <Streetlights />
            <MovingClouds />
            <BackgroundCity />
            <Hovercars />

            {/* Interactive Skyscrapers */}
            <group>
              {interactiveBuildings.map((b) => (
                <InteractiveBuilding key={b.id} data={b} onClick={handleBuildingClick} isZooming={!!zoomingTo} />
              ))}
            </group>
          </Physics>

          <CameraRig targetBuilding={zoomingTo} onZoomComplete={handleZoomComplete} />
        </Canvas>
      </div>

      {/* Floating Glassmorphism Bottom Taskbar */}
      <AnimatePresence>
        {!zoomingTo && (
          <motion.div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="bg-[#141821]/80 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl flex items-center gap-1">
              {interactiveBuildings.map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleBuildingClick(b)}
                  className="group relative px-5 py-2 text-sm font-semibold rounded-full transition-all duration-200"
                >
                  <div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0 pointer-events-none"
                    style={{ backgroundColor: b.color, boxShadow: `0 0 20px ${b.color}99` }}
                  />
                  <span className="relative z-10 text-zinc-400 group-hover:text-white group-hover:font-bold transition-all duration-200 uppercase tracking-wide">
                    {b.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
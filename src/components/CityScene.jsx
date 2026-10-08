import React, { useRef, useState, useMemo } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera, useCursor, Html } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, ChromaticAberration, Noise as PPNoise } from '@react-three/postprocessing';
import { LayerMaterial, Color, Depth, Noise } from 'lamina';
import { Geometry, Base, Subtraction } from '@react-three/csg';
import { Physics, RigidBody } from '@react-three/rapier';
import { useControls } from 'leva';

// 5 Interactive Buildings located at Block Centers (combinations of +/- 4, +/- 12)
const interactiveBuildings = [
  { id: 'about', label: 'ABOUT', position: [-4, 3, -4], color: '#38bdf8', scale: [2, 6, 2], type: 'tower' },
  { id: 'education', label: 'EDUCATION', position: [4, 2.5, -4], color: '#a78bfa', scale: [3, 5, 2.5], type: 'block' },
  { id: 'skills', label: 'SKILLS', position: [-4, 3.5, 4], color: '#f472b6', scale: [2, 7, 2], type: 'antenna' },
  { id: 'projects', label: 'PROJECTS', position: [4, 2.8, 4], color: '#34d399', scale: [3.5, 5.6, 3.5], type: 'tiered' },
  { id: 'contact', label: 'CONTACT', position: [12, 2, -4], color: '#fbbf24', scale: [2.5, 4, 2.5], type: 'pavilion' }
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



const createWindowGroup = () => {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  
  const windows = [];
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      windows.push({
        x: x * 32 + 4, y: y * 32 + 4,
        val: Math.random(),
        target: Math.random() > 0.7 ? 1 : 0,
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
    ctx.fillStyle = '#020202';
    ctx.fillRect(0, 0, 128, 128);
    
    let changed = false;
    windows.forEach(w => {
       if (Math.abs(w.val - w.target) > 0.01) {
         w.val += (w.target - w.val) * w.speed;
         changed = true;
       } else if (Math.random() > 0.98) {
         w.target = Math.random() > 0.7 ? 1 : 0;
       }

       if (w.val > 0.05) {
         ctx.fillStyle = `rgba(${w.color}, ${w.val})`; 
         ctx.shadowBlur = 15 * w.val;
         ctx.shadowColor = `rgba(${w.color}, 1)`;
         ctx.fillRect(w.x, w.y, 24, 28);
       } else {
         ctx.fillStyle = '#0a0a0a';
         ctx.shadowBlur = 0;
         ctx.fillRect(w.x, w.y, 24, 28);
       }
    });
    if (changed) t.needsUpdate = true;
  };

  return { texture: t, update };
};

const windowTextures = Array.from({ length: 6 }, createWindowGroup);

const createAsphaltTexture = () => {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#444444'; // Darker base gray
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 30000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#333333' : '#666666';
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
  useFrame(() => {
    windowTextures.forEach(wt => wt.update());
  });
  return null;
}

function Streetlights() {
  const lights = useMemo(() => {
    const arr = [];
    const SPACING = 8.0; // ROAD_WIDTH + BLOCK_SIZE = 3.0 + 5.0 = 8.0
    for (let i = -4; i < 4; i++) {
      for (let j = -4; j <= 4; j++) {
        // X-axis road segments (runs along X, between intersections)
        const x = (i + 0.5) * SPACING;
        const z = j * SPACING;
        arr.push({ pos: [x, 0, z + 1.8], rot: 0 }); // facing -Z
        arr.push({ pos: [x, 0, z - 1.8], rot: Math.PI }); // facing +Z
      }
    }
    for (let i = -4; i <= 4; i++) {
      for (let j = -4; j < 4; j++) {
        // Z-axis road segments (runs along Z, between intersections)
        const x = i * SPACING;
        const z = (j + 0.5) * SPACING;
        arr.push({ pos: [x + 1.8, 0, z], rot: Math.PI/2 }); // facing -X
        arr.push({ pos: [x - 1.8, 0, z], rot: -Math.PI/2 }); // facing +X
      }
    }
    return arr;
  }, []);

  return (
    <group>
      {lights.map((l, i) => (
        <group key={i} position={[l.pos[0], 0.06, l.pos[2]]} rotation={[0, l.rot, 0]}>
          {/* Pole */}
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.03, 0.05, 3]} />
            <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Arm */}
          <mesh position={[0, 3, -0.3]}>
            <cylinderGeometry args={[0.02, 0.03, 0.8]} rotation={[Math.PI/2, 0, 0]} />
            <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Bulb */}
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

  useFrame((state, delta) => {
    if (!groupRef.current || isZooming) return;
    const targetY = hovered ? data.position[1] + 0.4 : data.position[1];
    groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetY, 10, delta);
  });

  const tex = useMemo(() => {
    const master = windowTextures[Math.floor(Math.random() * windowTextures.length)].texture;
    const t = master.clone();
    t.needsUpdate = true;
    t.repeat.set(data.scale[0] / 2, data.scale[1] / 2);
    t.offset.set(Math.random(), Math.random());
    return t;
  }, [data.scale]);

  return (
    <group 
      position={data.position} 
      ref={groupRef}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onClick(data); }}
    >
      {/* Main Building Body with CSG Architecture */}
      <mesh castShadow receiveShadow>
        <Geometry>
          <Base>
            <boxGeometry args={data.scale} />
          </Base>
          {data.type === 'tower' && (
            <>
              {/* Slanted roof */}
              <Subtraction position={[0, data.scale[1]/2, 0]} rotation={[0, 0, Math.PI/6]}>
                <boxGeometry args={[data.scale[0]*2, data.scale[0], data.scale[2]*2]} />
              </Subtraction>
              {/* Mid-section cutout tunnel */}
              <Subtraction position={[0, data.scale[1]*0.1, 0]}>
                <boxGeometry args={[data.scale[0]*0.5, data.scale[1]*0.3, data.scale[2]*1.1]} />
              </Subtraction>
            </>
          )}
          {data.type === 'block' && (
            <>
              {/* Massive Archway */}
              <Subtraction position={[0, -data.scale[1]/2, 0]}>
                <cylinderGeometry args={[data.scale[0]*0.35, data.scale[0]*0.35, data.scale[2]*1.1, 32]} rotation={[Math.PI/2, 0, 0]} />
              </Subtraction>
              {/* Corner stepping left */}
              <Subtraction position={[-data.scale[0]/2, data.scale[1]/2, 0]}>
                <boxGeometry args={[data.scale[0]*0.6, data.scale[1]*0.4, data.scale[2]*1.1]} />
              </Subtraction>
              {/* Corner stepping right */}
              <Subtraction position={[data.scale[0]/2, data.scale[1]/2, 0]}>
                <boxGeometry args={[data.scale[0]*0.6, data.scale[1]*0.4, data.scale[2]*1.1]} />
              </Subtraction>
            </>
          )}
          {data.type === 'antenna' && (
            <>
              {/* Diamond cut out of the sides to make it a cross */}
              <Subtraction position={[data.scale[0]/2, 0, data.scale[2]/2]} rotation={[0, Math.PI/4, 0]}>
                <boxGeometry args={[data.scale[0]*0.9, data.scale[1]*1.1, data.scale[2]*0.9]} />
              </Subtraction>
              <Subtraction position={[-data.scale[0]/2, 0, -data.scale[2]/2]} rotation={[0, Math.PI/4, 0]}>
                <boxGeometry args={[data.scale[0]*0.9, data.scale[1]*1.1, data.scale[2]*0.9]} />
              </Subtraction>
              {/* Spherical hole near top */}
              <Subtraction position={[0, data.scale[1]*0.25, 0]}>
                <sphereGeometry args={[data.scale[0]*0.4, 32, 32]} />
              </Subtraction>
            </>
          )}
          {data.type === 'tiered' && (
            <>
              {/* Left tier cut */}
              <Subtraction position={[-data.scale[0]/2, data.scale[1]*0.7, 0]}>
                <boxGeometry args={[data.scale[0]*0.4, data.scale[1]*0.6, data.scale[2]*1.1]} />
              </Subtraction>
              {/* Right tier cut */}
              <Subtraction position={[data.scale[0]/2, data.scale[1]*0.7, 0]}>
                <boxGeometry args={[data.scale[0]*0.4, data.scale[1]*0.6, data.scale[2]*1.1]} />
              </Subtraction>
              {/* Front tier cut */}
              <Subtraction position={[0, data.scale[1]*0.4, data.scale[2]/2]}>
                <boxGeometry args={[data.scale[0]*1.1, data.scale[1]*0.8, data.scale[2]*0.4]} />
              </Subtraction>
            </>
          )}
          {data.type === 'pavilion' && (
            <>
              {/* Cut corners to make a cross / plus shape */}
              <Subtraction position={[data.scale[0]/2, 0, data.scale[2]/2]}>
                <boxGeometry args={[data.scale[0]*0.55, data.scale[1]*1.1, data.scale[2]*0.55]} />
              </Subtraction>
              <Subtraction position={[-data.scale[0]/2, 0, data.scale[2]/2]}>
                <boxGeometry args={[data.scale[0]*0.55, data.scale[1]*1.1, data.scale[2]*0.55]} />
              </Subtraction>
              <Subtraction position={[data.scale[0]/2, 0, -data.scale[2]/2]}>
                <boxGeometry args={[data.scale[0]*0.55, data.scale[1]*1.1, data.scale[2]*0.55]} />
              </Subtraction>
              <Subtraction position={[-data.scale[0]/2, 0, -data.scale[2]/2]}>
                <boxGeometry args={[data.scale[0]*0.55, data.scale[1]*1.1, data.scale[2]*0.55]} />
              </Subtraction>
              {/* Center hollow cutout */}
              <Subtraction position={[0, -data.scale[1]/2, 0]}>
                <boxGeometry args={[data.scale[0]*0.3, data.scale[1]*1.2, data.scale[2]*0.3]} />
              </Subtraction>
            </>
          )}
        </Geometry>
        <meshStandardMaterial color="#0a0a0a" roughness={0.1} metalness={0.9} map={tex} emissiveMap={tex} emissive={hovered ? data.color : "#ffffff"} emissiveIntensity={hovered ? 3.0 : 1.8} />
      </mesh>
      
      {/* Illuminated Base / Entrance */}
      <mesh position={[0, -data.scale[1]/2 + 0.4, data.scale[2]/2 + 0.01]}>
        <planeGeometry args={[data.scale[0] * 0.8, 0.8]} />
        <meshBasicMaterial color={data.color} toneMapped={false} transparent opacity={0.8} />
      </mesh>

      {/* Architectural Roof Crown */}
      <mesh position={[0, data.scale[1]/2 + 0.25, 0]}>
        <boxGeometry args={[data.scale[0]*0.7, 0.5, data.scale[2]*0.7]} />
        <meshStandardMaterial color="#050505" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, data.scale[1]/2 + 0.25, 0]}>
        <boxGeometry args={[data.scale[0]*0.72, 0.1, data.scale[2]*0.72]} />
        <meshBasicMaterial color={data.color} toneMapped={false} />
      </mesh>

      <Html
        position={[0, data.scale[1] / 2 + 1.0, 0]}
        center
        transform
        distanceFactor={15}
      >
        <div 
          className="font-black tracking-[0.3em] uppercase"
          style={{ 
            color: hovered ? '#ffffff' : data.color,
            textShadow: hovered 
              ? `0 0 5px #ffffff, 0 0 10px ${data.color}, 0 0 20px ${data.color}, 0 0 40px ${data.color}` 
              : `0 0 5px ${data.color}, 0 0 10px ${data.color}`,
            transition: 'all 0.3s ease',
            pointerEvents: 'none',
            fontSize: '12px',
            whiteSpace: 'nowrap'
          }}
        >
          {data.label}
        </div>
      </Html>
      
      {hovered && <pointLight position={[0, 0, 0]} color={data.color} intensity={8} distance={20} />}
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
      {/* Sleek roof light edge */}
      <mesh position={[0, b.scale[1]/2 + 0.01, 0]}>
         <planeGeometry args={[b.scale[0]*0.9, b.scale[2]*0.9]} />
         <meshBasicMaterial color="#111" rotation={[-Math.PI/2, 0, 0]} />
      </mesh>
      {b.hasNeon && (
        <mesh position={[b.scale[0]/2 + 0.01, 0, 0]}>
          <planeGeometry args={[0.05, b.scale[1] * 0.9]} />
          <meshBasicMaterial color={new THREE.Color(b.neonColor).multiplyScalar(2)} toneMapped={false} />
        </mesh>
      )}
      {b.hasBillboard && (
        <mesh position={[0, b.scale[1]*0.2, b.scale[2]/2 + 0.02]}>
          <planeGeometry args={[Math.min(2, b.scale[0] * 0.8), 2]} />
          <meshBasicMaterial color="#111111" />
          <mesh position={[0, 0, -0.01]}>
             <planeGeometry args={[Math.min(2, b.scale[0] * 0.8) + 0.1, 2.1]} />
             <meshBasicMaterial color="#222" />
          </mesh>
        </mesh>
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
    
    // Generate Intersections and Roads explicitly to avoid overlap
    for (let i = -4; i <= 4; i++) {
       for (let j = -4; j <= 4; j++) {
          inters.push([i * SPACING, j * SPACING]);
          if (i < 4) rSegs.push({ pos: [(i + 0.5) * SPACING, 0, j * SPACING], scale: [BLOCK_SIZE, ROAD_WIDTH] });
          if (j < 4) rSegs.push({ pos: [i * SPACING, 0, (j + 0.5) * SPACING], scale: [ROAD_WIDTH, BLOCK_SIZE] });
          if (i < 4 && j < 4) swLocs.push([(i + 0.5) * SPACING, 0.03, (j + 0.5) * SPACING]);
       }
    }

    for (let xIdx = -3; xIdx <= 3; xIdx++) {
      for (let zIdx = -3; zIdx <= 3; zIdx++) {
        const centerX = xIdx * SPACING + (SPACING / 2); 
        const centerZ = zIdx * SPACING + (SPACING / 2);

        const isInteractiveBlock = interactiveBuildings.some(b => 
          Math.abs(b.position[0] - centerX) < 1 && Math.abs(b.position[2] - centerZ) < 1
        );
        if (isInteractiveBlock) continue;



        for(let dx of [-1.2, 1.2]) {
            for(let dz of [-1.2, 1.2]) {
                if (Math.random() > 0.85) continue; 
                
                const bx = centerX + dx;
                const bz = centerZ + dz;
                const height = Math.random() * 3 + 2.0; // Shorter buildings
                const scale = [Math.random() * 1.5 + 1.2, height, Math.random() * 1.5 + 1.2];
                const hasNeon = Math.random() > 0.7;
                const neonColor = ['#38bdf8', '#a78bfa', '#f472b6', '#34d399'][Math.floor(Math.random() * 4)];
                
                bldgs.push({
                    position: [bx, height / 2, bz],
                    scale,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    hasNeon, neonColor,
                    hasBillboard: Math.random() > 0.85
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

      {/* Roads */}
      <group position={[0, 0.01, 0]}>
         {intersections.map((pos, i) => (
           <group key={`int-${i}`} position={[pos[0], 0, pos[1]]}>
             <mesh rotation={[-Math.PI/2, 0, 0]} receiveShadow>
                <planeGeometry args={[ROAD_WIDTH, ROAD_WIDTH]} />
                <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
             </mesh>
             {/* Intersection Square Border */}
             <group position={[0, 0.01, 0]}>
               <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 1.3]}>
                  <planeGeometry args={[2.7, 0.1]} />
                  <meshBasicMaterial color="#fde047" transparent opacity={0.4} />
               </mesh>
               <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, -1.3]}>
                  <planeGeometry args={[2.7, 0.1]} />
                  <meshBasicMaterial color="#fde047" transparent opacity={0.4} />
               </mesh>
               <mesh rotation={[-Math.PI/2, 0, 0]} position={[1.3, 0, 0]}>
                  <planeGeometry args={[0.1, 2.7]} />
                  <meshBasicMaterial color="#fde047" transparent opacity={0.4} />
               </mesh>
               <mesh rotation={[-Math.PI/2, 0, 0]} position={[-1.3, 0, 0]}>
                  <planeGeometry args={[0.1, 2.7]} />
                  <meshBasicMaterial color="#fde047" transparent opacity={0.4} />
               </mesh>
             </group>
             {/* Yellow X */}
             <group position={[0, 0.015, 0]}>
               <mesh rotation={[-Math.PI/2, 0, Math.PI/4]}>
                  <planeGeometry args={[3.6, 0.1]} />
                  <meshBasicMaterial color="#fde047" transparent opacity={0.4} />
               </mesh>
               <mesh rotation={[-Math.PI/2, 0, -Math.PI/4]}>
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
               <mesh rotation={[-Math.PI/2, 0, 0]} receiveShadow>
                  <planeGeometry args={r.scale} />
                  <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
               </mesh>
               {/* Center lane divider */}
               <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.01, 0]}>
                  <planeGeometry args={[isX ? r.scale[0] : 0.1, isX ? 0.1 : r.scale[1]]} />
                  <meshBasicMaterial color="#fde047" transparent opacity={0.5} />
               </mesh>
               {/* Edge glow lines */}
               <mesh rotation={[-Math.PI/2, 0, 0]} position={[isX ? 0 : (ROAD_WIDTH/2 - 0.15), 0.01, isX ? (ROAD_WIDTH/2 - 0.15) : 0]}>
                  <planeGeometry args={[isX ? r.scale[0] : 0.05, isX ? 0.05 : r.scale[1]]} />
                  <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
               </mesh>
               <mesh rotation={[-Math.PI/2, 0, 0]} position={[isX ? 0 : -(ROAD_WIDTH/2 - 0.15), 0.01, isX ? -(ROAD_WIDTH/2 - 0.15) : 0]}>
                  <planeGeometry args={[isX ? r.scale[0] : 0.05, isX ? 0.05 : r.scale[1]]} />
                  <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
               </mesh>
             </group>
           );
         })}
      </group>

      {blocks.map((b, i) => <BuildingMesh key={`bldg-${i}`} b={b} />)}
      
      {parks.map((p, i) => (
        <group key={`park-${i}`} position={p}>
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
            <planeGeometry args={[4.8, 4.8]} />
            <meshStandardMaterial color="#0a0a0a" roughness={1} />
          </mesh>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.6, 0.6]} />
            <meshStandardMaterial color="#222" roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} />
            <pointLight color="#38bdf8" intensity={2} distance={8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Car({ carData }) {
  const carRef = useRef();
  
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
  });

  const isForward = carData.speed > 0;
  const rotation = carData.isZAxis ? 0 : Math.PI / 2;

  return (
    <group 
      ref={carRef}
      position={carData.isZAxis ? [carData.fixedAxisPos, 0.15, carData.startPos] : [carData.startPos, 0.15, carData.fixedAxisPos]}
      rotation={[0, rotation, 0]}
    >
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[0.35, 0.25, 0.7]} />
        <meshStandardMaterial color={carData.color} roughness={0.1} metalness={0.9} />
      </mesh>
      <mesh position={[0.1, 0.2, isForward ? 0.36 : -0.36]}>
         <planeGeometry args={[0.08, 0.08]} />
         <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh position={[-0.1, 0.2, isForward ? 0.36 : -0.36]}>
         <planeGeometry args={[0.08, 0.08]} />
         <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh position={[0.1, 0.2, isForward ? -0.36 : 0.36]}>
         <planeGeometry args={[0.08, 0.08]} />
         <meshBasicMaterial color="#ff0000" toneMapped={false} />
      </mesh>
      <mesh position={[-0.1, 0.2, isForward ? -0.36 : 0.36]}>
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
    
    for (let i = 0; i < 35; i++) {
      const isZAxis = Math.random() > 0.5; 
      const roadPos = roads[Math.floor(Math.random() * roads.length)];
      
      const isPositiveLane = Math.random() > 0.5;
      const laneOffset = isPositiveLane ? 0.6 : -0.6;
      const fixedAxisPos = roadPos + laneOffset;
      
      const startPos = Math.random() * 120 - 60;
      const speed = (Math.random() * 6 + 4) * (isPositiveLane ? 1 : -1);
      
      const color = ['#ffffff', '#ff3333', '#3388ff', '#111111', '#cccccc'][Math.floor(Math.random() * 5)];
      cars.push({ isZAxis, fixedAxisPos, startPos, speed, color });
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
      {initialCars.map((car, i) => <Car key={i} carData={car} />)}
    </group>
  );
}

function Pedestrian({ data }) {
  const pedRef = useRef();
  const [bob, setBob] = useState(Math.random() * Math.PI);

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
      
      setBob(b => b + delta * 10);
      pedRef.current.position.y = 0.2 + Math.abs(Math.sin(bob)) * 0.05;
    }
  });

  return (
    <group ref={pedRef} position={[data.isZAxis ? data.fixedAxisPos : data.startPos, 0.2, data.isZAxis ? data.startPos : data.fixedAxisPos]}>
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
    for(let i=0; i<60; i++) {
      const isZAxis = Math.random() > 0.5;
      const fixedAxisPos = sidewalks[Math.floor(Math.random() * sidewalks.length)];
      const startPos = Math.random() * 120 - 60;
      const speed = (Math.random() * 1.5 + 0.5) * (Math.random() > 0.5 ? 1 : -1);
      const color = `hsl(${Math.random() * 360}, 40%, 30%)`;
      arr.push({ isZAxis, fixedAxisPos, startPos, speed, color });
    }
    return arr;
  }, []);

  return <group>{peds.map((p, i) => <Pedestrian key={i} data={p} />)}</group>;
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

  useFrame(() => {
    setZGreen(globalTrafficState.zGreen);
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
          <group position={[1.8, 0, 1.8]} rotation={[0, Math.PI/2, 0]}>
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
        <group key={i} ref={el => cloudsRef.current[i] = el} position={data.pos}>
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
  useFrame((state, delta) => {
    if (targetBuilding) {
      const targetPos = new THREE.Vector3(
        targetBuilding.position[0] + 6, 
        targetBuilding.position[1] + 6, 
        targetBuilding.position[2] + 6
      );
      state.camera.position.lerp(targetPos, 0.05);
      state.camera.lookAt(targetBuilding.position[0], targetBuilding.position[1], targetBuilding.position[2]);
      
      if (state.camera.position.distanceTo(targetPos) < 0.5) {
        onZoomComplete();
      }
    } else {
      const targetX = 25 + (state.pointer.x * 5);
      const targetY = 25 + (state.pointer.y * 5);
      const targetZ = 25 + (state.pointer.x * 3);
      
      state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetX, 2, delta);
      state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetY, 2, delta);
      state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetZ, 2, delta);
      state.camera.lookAt(0, 0, 0);
    }
  });
  return null;
}

function Hovercars() {
  const cars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 20; i++) {
      arr.push({
        pos: [Math.random() * 120 - 60, Math.random() * 10 + 12, Math.random() * 120 - 60],
        speed: (Math.random() * 15 + 8) * (Math.random() > 0.5 ? 1 : -1),
        isX: Math.random() > 0.5,
        color: Math.random() > 0.5 ? '#38bdf8' : '#f472b6'
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
        <group key={i} ref={el => carsRef.current[i] = el} position={c.pos}>
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
      const radius = Math.random() * 90 + 50; // Between 50 and 140 distance
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      const w = Math.random() * 5 + 3;
      const d = Math.random() * 5 + 3;
      const h = Math.random() * 30 + 10;
      bldgs.push({ pos: [x, h/2 - 0.1, z], scale: [w, h, d] });
    }
    return bldgs;
  }, []);

  return (
    <group>
      {bgBldgs.map((b, i) => (
        <mesh key={i} position={b.pos} castShadow={false} receiveShadow={false}>
          <Geometry>
            <Base>
               <boxGeometry args={b.scale} />
            </Base>
            <Subtraction position={[b.scale[0]/2, b.scale[1]/2, b.scale[2]/2]}>
               <boxGeometry args={[b.scale[0]*0.8, b.scale[1]*0.5, b.scale[2]*0.8]} />
            </Subtraction>
          </Geometry>
          <meshBasicMaterial color="#020305" map={windowTextures[i % windowTextures.length].texture} />
          {/* Add a few random lit windows on background buildings */}
          {Math.random() > 0.5 && (
             <mesh position={[0, b.scale[1]/2 - 2, b.scale[2]/2 + 0.1]}>
               <planeGeometry args={[0.5, 0.5]} />
               <meshBasicMaterial color="#fde047" transparent opacity={0.5} />
             </mesh>
          )}
        </mesh>
      ))}
    </group>
  );
}

export default function CityScene({ onEnter }) {
  const shouldReduceMotion = useReducedMotion();
  const [zoomingTo, setZoomingTo] = useState(null);

  const { ambientIntensity, fogDensity, glitchIntensity } = useControls({
    ambientIntensity: { value: 0.25, min: 0, max: 2, step: 0.05 },
    fogDensity: { value: 15, min: 1, max: 50, step: 1 },
    glitchIntensity: { value: 0.5, min: 0, max: 2, step: 0.1 },
  });

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
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[25, 25, 25]} fov={30} />
          <CyberSky />
          <fog attach="fog" args={['#010206', fogDensity, 80]} />
          
          <ambientLight intensity={ambientIntensity} color="#ffffff" />
          <directionalLight position={[20, 40, 20]} intensity={0.2} color="#4338ca" castShadow shadow-mapSize={[2048, 2048]} />
          <pointLight position={[0, 20, 0]} intensity={0.3} color="#818cf8" distance={80} />
          
          <EffectComposer>
            <Bloom luminanceThreshold={0.8} mipmapBlur intensity={1.2} radius={0.6} />
            <PPNoise opacity={0.03} />
            <ChromaticAberration offset={[0.002 * glitchIntensity, 0.002 * glitchIntensity]} />
          </EffectComposer>
          
          <Stars radius={60} depth={50} count={3000} factor={4} saturation={1} fade speed={1} />
          
          <Physics>
            <AmbientCityGrid />
          <Traffic />
          <Pedestrians />
          <TrafficLights />
          <AnimatedWindows />
          <Streetlights />
          <MovingClouds />
          <BackgroundCity />
          <Hovercars />
          
          {/* Interactive Buildings */}
          <group>
            {interactiveBuildings.map((b) => (
              <InteractiveBuilding key={b.id} data={b} onClick={handleBuildingClick} isZooming={!!zoomingTo} />
            ))}
          </group>
          </Physics>

          <CameraRig targetBuilding={zoomingTo} onZoomComplete={handleZoomComplete} />
        </Canvas>
      </div>

      {/* Hero Overlay */}
      <AnimatePresence>
        {!zoomingTo && (
          <motion.div 
            className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-end p-8 md:p-16 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
            transition={{ duration: 1.2, delay: 0.2 }}
          >
            <div className="flex flex-col items-start w-full pointer-events-auto">
              <motion.div 
                className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 w-full max-w-2xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-sm md:text-xl font-light text-slate-200 leading-relaxed tracking-wide drop-shadow-xl border-l-2 border-white/20 pl-6 py-2 bg-black/20 backdrop-blur-sm rounded-r-lg">
                  Explore the intersection of logic and imagination.<br/>
                  Click on the illuminated headquarters to discover.
                </p>
                
                <button 
                  className="group relative px-8 py-4 bg-white/5 text-white font-semibold text-xs tracking-[0.2em] uppercase overflow-hidden border border-white/10 rounded-full hover:bg-white/10 transition-all duration-500 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] mt-4 md:mt-0"
                  onClick={() => handleBuildingClick(interactiveBuildings[3])}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    ENTER CITY
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/20 group-hover:ring-white/40 transition-all duration-500"></div>
                  <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

import React, { useRef, useState, useMemo } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera, useCursor, Html } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// 5 Interactive Buildings located at Block Centers (combinations of +/- 4, +/- 12)
const interactiveBuildings = [
  { id: 'about', label: 'ABOUT', position: [-4, 2, -4], color: '#3b82f6', scale: [2, 4, 2], type: 'tower' },
  { id: 'education', label: 'EDUCATION', position: [4, 1.5, -4], color: '#8b5cf6', scale: [2.5, 3, 2.5], type: 'block' },
  { id: 'skills', label: 'SKILLS', position: [-4, 2.5, 4], color: '#ec4899', scale: [2, 5, 2], type: 'antenna' },
  { id: 'projects', label: 'PROJECTS', position: [4, 1.8, 4], color: '#10b981', scale: [3, 3.6, 3], type: 'windows' },
  { id: 'contact', label: 'CONTACT', position: [12, 1.2, -4], color: '#f59e0b', scale: [2, 2.4, 2], type: 'cozy' }
];

function InteractiveBuilding({ data, onClick, isZooming }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useCursor(hovered);

  useFrame((state, delta) => {
    if (!meshRef.current || isZooming) return;
    const targetY = hovered ? data.position[1] + 0.5 : data.position[1];
    meshRef.current.position.y = THREE.MathUtils.damp(meshRef.current.position.y, targetY, 10, delta);
  });

  return (
    <group 
      position={data.position} 
      ref={meshRef}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onClick(data);
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={data.scale} />
        <meshStandardMaterial color={data.color} roughness={0.2} metalness={0.5} emissive={hovered ? data.color : '#000000'} emissiveIntensity={hovered ? 0.5 : 0} />
      </mesh>
      
      {/* Neon Sign */}
      <Html
        position={[0, data.scale[1] / 2 + 0.6, 0]}
        center
        transform
        distanceFactor={15}
      >
        <div 
          className="font-bold tracking-[0.3em] uppercase text-white bg-slate-900/80 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10"
          style={{ 
            fontFamily: 'Outfit',
            pointerEvents: 'none',
            boxShadow: hovered ? `0 0 20px ${data.color}` : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          {data.label}
        </div>
      </Html>
      
      {hovered && <pointLight position={[0, 0, 1.5]} color={data.color} intensity={5} distance={10} />}
    </group>
  );
}

// Constants for City Grid
const ROAD_WIDTH = 2.5;
const BLOCK_SIZE = 5.5;
const SPACING = ROAD_WIDTH + BLOCK_SIZE; // 8

// Generate Building Window Textures
const createBuildingTextures = () => {
  const textures = [];
  
  // Texture 1: Office Building (Blue/Slate)
  const c1 = document.createElement('canvas');
  c1.width = 256; c1.height = 256;
  const ctx1 = c1.getContext('2d');
  ctx1.fillStyle = '#0f172a';
  ctx1.fillRect(0, 0, 256, 256);
  for(let x=10; x<256; x+=30) {
    for(let y=10; y<256; y+=35) {
      if(Math.random() > 0.5) {
        ctx1.fillStyle = ['#fef08a', '#e0f2fe', '#fde047'][Math.floor(Math.random()*3)];
        ctx1.shadowBlur = 15; ctx1.shadowColor = ctx1.fillStyle;
      } else {
        ctx1.fillStyle = '#020617';
        ctx1.shadowBlur = 0;
      }
      ctx1.fillRect(x, y, 20, 25);
    }
  }
  const t1 = new THREE.CanvasTexture(c1);
  t1.wrapS = t1.wrapT = THREE.RepeatWrapping;
  textures.push(t1);

  // Texture 2: NY Brick Style
  const c2 = document.createElement('canvas');
  c2.width = 256; c2.height = 256;
  const ctx2 = c2.getContext('2d');
  ctx2.fillStyle = '#451a03'; // dark brick
  ctx2.fillRect(0, 0, 256, 256);
  for(let x=16; x<256; x+=48) {
    for(let y=16; y<256; y+=40) {
      if(Math.random() > 0.4) {
        ctx2.fillStyle = '#fef08a';
        ctx2.shadowBlur = 10; ctx2.shadowColor = ctx2.fillStyle;
      } else {
        ctx2.fillStyle = '#1a0d00';
        ctx2.shadowBlur = 0;
      }
      ctx2.fillRect(x, y, 24, 28);
    }
  }
  const t2 = new THREE.CanvasTexture(c2);
  t2.wrapS = t2.wrapT = THREE.RepeatWrapping;
  textures.push(t2);

  // Texture 3: Modern Glass
  const c3 = document.createElement('canvas');
  c3.width = 256; c3.height = 256;
  const ctx3 = c3.getContext('2d');
  ctx3.fillStyle = '#082f49'; 
  ctx3.fillRect(0, 0, 256, 256);
  for(let x=4; x<256; x+=16) {
    for(let y=4; y<256; y+=20) {
      if(Math.random() > 0.7) {
        ctx3.fillStyle = '#7dd3fc';
        ctx3.shadowBlur = 5; ctx3.shadowColor = ctx3.fillStyle;
      } else {
        ctx3.fillStyle = '#03101a';
        ctx3.shadowBlur = 0;
      }
      ctx3.fillRect(x, y, 12, 16);
    }
  }
  const t3 = new THREE.CanvasTexture(c3);
  t3.wrapS = t3.wrapT = THREE.RepeatWrapping;
  textures.push(t3);

  return textures;
};
const buildingTextures = createBuildingTextures();

// Generate Road Textures
const roadTextureVertical = (() => {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, 128, 512);
  
  ctx.fillStyle = '#eab308';
  for(let y=0; y<512; y+=64) {
    ctx.fillRect(60, y+16, 8, 32);
  }
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(8, 0, 4, 512);
  ctx.fillRect(116, 0, 4, 512);
  
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
})();

const roadTextureHorizontal = (() => {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, 512, 128);
  
  ctx.fillStyle = '#eab308';
  for(let x=0; x<512; x+=64) {
    ctx.fillRect(x+16, 60, 32, 8);
  }
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 8, 512, 4);
  ctx.fillRect(0, 116, 512, 4);
  
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
})();

function BuildingMesh({ b }) {
  const tex = useMemo(() => {
    const t = buildingTextures[b.texIndex].clone();
    t.needsUpdate = true;
    t.repeat.set(b.scale[0], b.scale[1]);
    return t;
  }, [b.scale, b.texIndex]);

  return (
    <group position={b.position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={b.scale} />
        <meshStandardMaterial 
          map={tex} 
          emissiveMap={tex} 
          emissive="#ffffff" 
          emissiveIntensity={0.6}
          color={b.color} 
          roughness={0.7} 
          metalness={0.3} 
        />
      </mesh>
      {/* Roof detailing */}
      <mesh position={[0, b.scale[1]/2 + 0.1, 0]} castShadow>
        <boxGeometry args={[b.scale[0] * 0.8, 0.2, b.scale[2] * 0.8]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      {b.hasNeon && (
        <mesh position={[b.scale[0]/2 + 0.01, 0, b.scale[2]/2 + 0.01]} rotation={[0, Math.PI/4, 0]}>
          <planeGeometry args={[0.05, b.scale[1] * 0.9]} />
          <meshBasicMaterial color={new THREE.Color(b.neonColor).multiplyScalar(4)} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

function AmbientCityGrid() {
  const { blocks, roads } = useMemo(() => {
    const bldgs = [];
    const roadPlanes = [];
    
    // Generate roads
    for (let i = -4; i <= 4; i++) {
       const pos = i * SPACING;
       roadPlanes.push({ pos: [pos, 0.01, 0], scale: [ROAD_WIDTH, 120], rot: [-Math.PI/2, 0, 0] });
       roadPlanes.push({ pos: [0, 0.02, pos], scale: [120, ROAD_WIDTH], rot: [-Math.PI/2, 0, 0] });
    }

    // Generate buildings inside blocks
    const colors = ['#1e293b', '#334155', '#0f172a', '#475569', '#2d3748'];
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
                const height = Math.random() * 6 + 2.5; // Taller buildings for NY feel
                const scale = [Math.random() * 1.5 + 1.2, height, Math.random() * 1.5 + 1.2];
                const hasNeon = Math.random() > 0.7;
                const neonColor = ['#f472b6', '#38bdf8', '#a78bfa', '#34d399'][Math.floor(Math.random() * 4)];
                
                bldgs.push({
                    position: [bx, height / 2, bz],
                    scale,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    hasNeon, neonColor,
                    texIndex: Math.floor(Math.random() * 3)
                });
            }
        }
      }
    }
    return { blocks: bldgs, roads: roadPlanes };
  }, []);

  return (
    <group>
      {roads.map((r, i) => {
         const isVertical = r.scale[0] === ROAD_WIDTH;
         const tex = isVertical ? roadTextureVertical.clone() : roadTextureHorizontal.clone();
         tex.needsUpdate = true;
         if (isVertical) {
           tex.repeat.set(1, r.scale[1] / 10);
         } else {
           tex.repeat.set(r.scale[0] / 10, 1);
         }

         return (
         <group key={`road-${i}`} position={r.pos} rotation={r.rot}>
            {/* Street with Markings */}
            <mesh receiveShadow>
               <planeGeometry args={r.scale} />
               <meshStandardMaterial map={tex} roughness={0.8} />
            </mesh>
            
            {/* Sidewalks */}
            <mesh position={[isVertical ? ROAD_WIDTH/2 + 0.6 : 0, isVertical ? 0 : ROAD_WIDTH/2 + 0.6, 0.01]} receiveShadow>
               <planeGeometry args={isVertical ? [1.2, r.scale[1]] : [r.scale[0], 1.2]} />
               <meshStandardMaterial color="#666666" roughness={1} />
            </mesh>
            <mesh position={[isVertical ? -ROAD_WIDTH/2 - 0.6 : 0, isVertical ? 0 : -ROAD_WIDTH/2 - 0.6, 0.01]} receiveShadow>
               <planeGeometry args={isVertical ? [1.2, r.scale[1]] : [r.scale[0], 1.2]} />
               <meshStandardMaterial color="#666666" roughness={1} />
            </mesh>
         </group>
      )})}

      {blocks.map((b, i) => <BuildingMesh key={`bldg-${i}`} b={b} />)}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#020617" />
      </mesh>
    </group>
  );
}

function Car({ carData }) {
  const carRef = useRef();
  
  useFrame((state, delta) => {
    if (carRef.current) {
      if (carData.isZAxis) {
        carRef.current.position.z += carData.speed * delta;
        if (carRef.current.position.z > 60) carRef.current.position.z = -60;
        if (carRef.current.position.z < -60) carRef.current.position.z = 60;
      } else {
        carRef.current.position.x += carData.speed * delta;
        if (carRef.current.position.x > 60) carRef.current.position.x = -60;
        if (carRef.current.position.x < -60) carRef.current.position.x = 60;
      }
    }
  });

  const isForward = carData.speed > 0;
  const rotation = carData.isZAxis ? 0 : Math.PI / 2;

  return (
    <group 
      ref={carRef}
      position={carData.isZAxis ? [carData.fixedAxisPos, 0.2, carData.startPos] : [carData.startPos, 0.2, carData.fixedAxisPos]}
      rotation={[0, rotation, 0]}
    >
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[0.4, 0.3, 0.8]} />
        <meshStandardMaterial color={carData.color} roughness={0.2} metalness={0.8} />
      </mesh>
      
      {/* Headlights */}
      <mesh position={[0.15, 0.2, isForward ? 0.41 : -0.41]}>
         <planeGeometry args={[0.1, 0.1]} />
         <meshBasicMaterial color={new THREE.Color('#ffffff').multiplyScalar(6)} toneMapped={false} />
      </mesh>
      <mesh position={[-0.15, 0.2, isForward ? 0.41 : -0.41]}>
         <planeGeometry args={[0.1, 0.1]} />
         <meshBasicMaterial color={new THREE.Color('#ffffff').multiplyScalar(6)} toneMapped={false} />
      </mesh>

      {/* Taillights */}
      <mesh position={[0.15, 0.2, isForward ? -0.41 : 0.41]}>
         <planeGeometry args={[0.1, 0.1]} />
         <meshBasicMaterial color={new THREE.Color('#ff0000').multiplyScalar(5)} toneMapped={false} />
      </mesh>
      <mesh position={[-0.15, 0.2, isForward ? -0.41 : 0.41]}>
         <planeGeometry args={[0.1, 0.1]} />
         <meshBasicMaterial color={new THREE.Color('#ff0000').multiplyScalar(5)} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Traffic() {
  const initialCars = useMemo(() => {
    const cars = [];
    const roads = [-24, -16, -8, 0, 8, 16, 24];
    
    for (let i = 0; i < 80; i++) {
      const isZAxis = Math.random() > 0.5; 
      const roadPos = roads[Math.floor(Math.random() * roads.length)];
      
      const isPositiveLane = Math.random() > 0.5;
      const laneOffset = isPositiveLane ? 0.5 : -0.5;
      const fixedAxisPos = roadPos + laneOffset;
      
      const startPos = Math.random() * 120 - 60;
      const speed = (Math.random() * 10 + 6) * (isPositiveLane ? 1 : -1);
      
      const color = ['#ffffff', '#ff3333', '#3333ff', '#111111', '#ffcc00'][Math.floor(Math.random() * 5)];
      cars.push({ isZAxis, fixedAxisPos, startPos, speed, color });
    }
    return cars;
  }, []);

  return (
    <group>
      {initialCars.map((car, i) => <Car key={i} carData={car} />)}
    </group>
  );
}

function StreetLights() {
  const lights = useMemo(() => {
    const l = [];
    const roadLines = [-24, -16, -8, 0, 8, 16, 24];
    
    roadLines.forEach(rx => {
       for(let z = -30; z <= 30; z += 8) {
          l.push([rx + 1.4, 2, z]);
          l.push([rx - 1.4, 2, z]);
       }
    });
    roadLines.forEach(rz => {
       for(let x = -30; x <= 30; x += 8) {
          if (Math.abs(x % 8) < 2) continue; // skip intersections mostly
          l.push([x, 2, rz + 1.4]); 
          l.push([x, 2, rz - 1.4]); 
       }
    });
    return l;
  }, []);

  return (
    <group>
      {lights.map((pos, i) => (
        <group key={i} position={pos}>
           <mesh position={[0, -1, 0]}>
              <cylinderGeometry args={[0.04, 0.08, 2]} />
              <meshStandardMaterial color="#222" />
           </mesh>
           <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.15]} />
              <meshBasicMaterial color={new THREE.Color('#fef08a').multiplyScalar(5)} toneMapped={false} />
           </mesh>
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

export default function CityScene({ onEnter }) {
  const shouldReduceMotion = useReducedMotion();
  const [zoomingTo, setZoomingTo] = useState(null);

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
          <color attach="background" args={['#17162b']} />
          <fog attach="fog" args={['#17162b', 20, 90]} />
          
          <ambientLight intensity={1.5} color="#a5b4fc" />
          <directionalLight position={[20, 40, 20]} intensity={3} color="#818cf8" castShadow shadow-mapSize={[2048, 2048]} />
          <pointLight position={[0, 15, 0]} intensity={2.5} color="#f472b6" distance={50} />
          
          <EffectComposer>
            <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
          </EffectComposer>
          
          <Stars radius={60} depth={50} count={3000} factor={4} saturation={1} fade speed={2} />
          
          <AmbientCityGrid />
          <Traffic />
          <StreetLights />
          <MovingClouds />
          
          {/* Interactive Buildings */}
          <group>
            {interactiveBuildings.map((b) => (
              <InteractiveBuilding key={b.id} data={b} onClick={handleBuildingClick} isZooming={!!zoomingTo} />
            ))}
          </group>

          <CameraRig targetBuilding={zoomingTo} onZoomComplete={handleZoomComplete} />
        </Canvas>
      </div>

      {/* Hero Overlay */}
      <AnimatePresence>
        {!zoomingTo && (
          <motion.div 
            className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex justify-between items-center w-full pointer-events-auto">
               <div className="text-2xl font-black tracking-[0.2em] text-white mix-blend-screen">XEON.STUDIO</div>
               <div className="text-sm font-mono text-slate-300 tracking-widest hidden md:block px-4 py-1 border border-white/20 rounded-full backdrop-blur-md">GAMIFIED PORTFOLIO</div>
            </div>

            <div className="flex flex-col items-start w-full mt-auto mb-16 md:mb-24 pointer-events-auto">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mb-4"
              >
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, 0.5, -0.5, 0] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                >
                  <h1 
                    className="text-[10vw] md:text-[6vw] leading-[0.85] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-200 to-pink-300 uppercase"
                    style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}
                  >
                    Interactive<br />Developer
                  </h1>
                </motion.div>
              </motion.div>
              <motion.div 
                className="flex flex-col md:flex-row items-start md:items-center gap-8 mt-8 w-full"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-base md:text-xl font-medium text-slate-200 max-w-md leading-relaxed tracking-wide drop-shadow-lg">
                  Building vibrant, logic-driven digital experiences. 
                </p>
                <div className="hidden md:block w-16 h-[2px] bg-indigo-400"></div>
                <button 
                  className="group relative px-10 py-5 bg-indigo-600/20 text-white font-bold tracking-[0.2em] uppercase overflow-hidden border border-indigo-400/50 rounded-full hover:border-indigo-400 transition-all duration-500 backdrop-blur-lg shadow-[0_0_20px_rgba(129,140,248,0.2)]"
                  onClick={() => handleBuildingClick(interactiveBuildings[3])}
                >
                  <span className="relative z-10 transition-colors duration-500 group-hover:text-black">START EXPERIENCE</span>
                  <div className="absolute inset-0 bg-indigo-400 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0"></div>
                </button>
              </motion.div>
            </div>
            
            <div className="absolute bottom-12 right-12 text-white hidden md:flex flex-col items-center gap-6">
               <div className="text-xs font-bold tracking-[0.3em] rotate-90 origin-right translate-y-[-30px] text-indigo-300">DISCOVER</div>
               <div className="w-[2px] h-20 bg-white/10 overflow-hidden relative rounded-full">
                  <motion.div 
                    className="w-full h-1/2 bg-indigo-400 rounded-full"
                    animate={{ y: [0, 80] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                  />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

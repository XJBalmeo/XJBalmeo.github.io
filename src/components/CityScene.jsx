import React, { useRef, useState, useMemo } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera, useCursor, Html } from '@react-three/drei';
import * as THREE from 'three';

// 5 Interactive Buildings
const interactiveBuildings = [
  { id: 'about', label: 'ABOUT', position: [-4, 2, -4], color: '#1e293b', scale: [1.5, 4, 1.5], type: 'tower' },
  { id: 'education', label: 'EDUCATION', position: [0, 1.5, -3], color: '#141b2d', scale: [2, 3, 2], type: 'block' },
  { id: 'skills', label: 'SKILLS', position: [4, 2.5, -4], color: '#293548', scale: [1.5, 5, 1.5], type: 'antenna' },
  { id: 'projects', label: 'PROJECTS', position: [-2, 1.8, 2], color: '#1e293b', scale: [2.5, 3.6, 2.5], type: 'windows' },
  { id: 'contact', label: 'CONTACT', position: [3, 1.2, 3], color: '#141b2d', scale: [1.5, 2.4, 1.5], type: 'cozy' }
];

function InteractiveBuilding({ data, onClick, isZooming }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useCursor(hovered);

  useFrame((state, delta) => {
    if (!meshRef.current || isZooming) return;
    const targetY = hovered ? data.position[1] + 0.3 : data.position[1];
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
        <meshStandardMaterial color={hovered ? '#38bdf8' : data.color} roughness={0.3} metalness={0.2} />
      </mesh>
      
      {/* Neon Sign */}
      <Html
        position={[0, data.scale[1] / 2 + 0.4, 0]}
        center
        transform
        distanceFactor={15}
      >
        <div 
          className="font-bold tracking-widest text-[#f472b6] bg-slate-900/50 px-2 py-1 rounded-full backdrop-blur-md"
          style={{ 
            fontFamily: 'Outfit',
            textShadow: '0 0 5px #f472b6, 0 0 10px #f472b6',
            pointerEvents: 'none'
          }}
        >
          {data.label}
        </div>
      </Html>
      
      {hovered && <pointLight position={[0, 0, 1.5]} color="#38bdf8" intensity={2} distance={3} />}
    </group>
  );
}

function AmbientCityGrid() {
  // Generate a grid of ambient background buildings
  const grid = useMemo(() => {
    const bldgs = [];
    const gridSize = 12; // 12x12 grid
    const spacing = 2; // space between buildings
    const colors = ['#0f172a', '#141b2d', '#0a0e1a'];

    for (let x = -gridSize; x <= gridSize; x += spacing) {
      for (let z = -gridSize; z <= gridSize; z += spacing) {
        // Leave gaps for roads and interactive buildings
        if (Math.abs(x) < 5 && Math.abs(z) < 5 && Math.random() > 0.3) continue;
        // Occasional empty lots
        if (Math.random() > 0.8) continue;
        
        const height = Math.random() * 2 + 0.5;
        bldgs.push({
          position: [x, height / 2, z],
          scale: [Math.random() * 0.8 + 0.6, height, Math.random() * 0.8 + 0.6],
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }
    return bldgs;
  }, []);

  return (
    <group>
      {grid.map((b, i) => (
        <mesh key={i} position={b.position} castShadow receiveShadow>
          <boxGeometry args={b.scale} />
          <meshStandardMaterial color={b.color} roughness={0.7} />
        </mesh>
      ))}
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#050810" />
      </mesh>
    </group>
  );
}

function CameraRig({ targetBuilding, onZoomComplete }) {
  useFrame((state, delta) => {
    if (targetBuilding) {
      // Zoom into the selected building from a high angle
      const targetPos = new THREE.Vector3(
        targetBuilding.position[0] + 5, 
        targetBuilding.position[1] + 5, 
        targetBuilding.position[2] + 5
      );
      state.camera.position.lerp(targetPos, 0.05);
      state.camera.lookAt(targetBuilding.position[0], targetBuilding.position[1], targetBuilding.position[2]);
      
      // If close enough, complete zoom
      if (state.camera.position.distanceTo(targetPos) < 0.5) {
        onZoomComplete();
      }
    } else {
      // Isometric default view: [20, 20, 20] looking at center
      // Idle mouse parallax
      const targetX = 20 + (state.pointer.x * 3);
      const targetY = 20 + (state.pointer.y * 3);
      const targetZ = 20 + (state.pointer.x * 2);
      
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
      className="w-full h-[100dvh] relative bg-[#0a0e1a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} 
      transition={{ duration: 0.6 }}
    >
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[20, 20, 20]} fov={25} />
          <color attach="background" args={['#0a0e1a']} />
          <fog attach="fog" args={['#0a0e1a', 20, 60]} />
          
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
          <pointLight position={[0, 5, 0]} intensity={1} color="#f6c94e" distance={15} />
          
          <Stars radius={50} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
          
          <AmbientCityGrid />
          
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
            className="absolute inset-0 flex flex-col justify-end pb-12 px-8 md:px-24 z-10 pointer-events-none"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
          >
            <div className="max-w-xl bg-[#0a0e1a]/60 p-8 rounded-3xl backdrop-blur-md border border-slate-800 pointer-events-auto shadow-2xl">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-text-primary mb-2">XEON BALMEO</h1>
              <p className="text-lg text-slate-400 mb-4 font-mono tracking-wide">Computer Science Student</p>
              <p className="text-base text-slate-300 mb-6 leading-relaxed">
                Specializing in logic-driven applications & web development.
              </p>
              <button 
                className="px-6 py-2 bg-accent text-slate-950 font-bold rounded-full hover:bg-accent-dim transition-colors duration-300 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                onClick={() => handleBuildingClick(interactiveBuildings[3])}
              >
                Explore Projects &rarr;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

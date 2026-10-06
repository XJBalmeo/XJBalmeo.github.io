import React, { useRef, useState, useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera, Environment, useCursor, Text } from '@react-three/drei';
import * as THREE from 'three';

const buildingsData = [
  { id: 'about', label: 'ABOUT', position: [-6, 2, -2], color: '#1e293b', scale: [2, 4, 2], type: 'tower' },
  { id: 'education', label: 'EDUCATION', position: [-2.5, 1.5, 0], color: '#141b2d', scale: [3, 3, 2], type: 'block' },
  { id: 'skills', label: 'SKILLS', position: [1.5, 2.5, -1], color: '#293548', scale: [2, 5, 2], type: 'antenna' },
  { id: 'projects', label: 'PROJECTS', position: [5.5, 1.8, 0], color: '#1e293b', scale: [3, 3.6, 2], type: 'windows' },
  { id: 'contact', label: 'CONTACT', position: [9, 1.2, -1.5], color: '#141b2d', scale: [2, 2.4, 2], type: 'cozy' }
];

function Building({ data, onClick, isZooming }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useCursor(hovered);

  useFrame((state, delta) => {
    if (!meshRef.current || isZooming) return;
    // Springy hover effect on Y axis
    const targetY = hovered ? data.position[1] + 0.3 : data.position[1];
    meshRef.current.position.y = THREE.MathUtils.damp(meshRef.current.position.y, targetY, 10, delta);
  });

  return (
    <group 
      position={data.position} 
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
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
      <Text
        position={[0, data.scale[1] / 2 + 0.4, 1.1]}
        fontSize={0.4}
        color="#f472b6"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NJtEtq.woff"
      >
        {data.label}
      </Text>
      
      {/* Little glow on hover */}
      {hovered && <pointLight position={[0, 0, 1.5]} color="#38bdf8" intensity={2} distance={3} />}
    </group>
  );
}

function AmbientCars() {
  const carsRef = useRef();

  useFrame((state) => {
    if (carsRef.current) {
      carsRef.current.children.forEach((car, i) => {
        const speed = i % 2 === 0 ? 0.1 : -0.12;
        car.position.x += speed;
        if (car.position.x > 15) car.position.x = -15;
        if (car.position.x < -15) car.position.x = 15;
      });
    }
  });

  return (
    <group ref={carsRef} position={[0, 0.2, 3]}>
      {/* Car 1 */}
      <mesh position={[-5, 0, 0]}>
        <boxGeometry args={[0.8, 0.3, 0.4]} />
        <meshStandardMaterial color="#374151" />
        <pointLight position={[0.5, 0, 0]} color="#fef3c7" intensity={0.5} distance={2} />
        <pointLight position={[-0.5, 0, 0]} color="#ef4444" intensity={0.5} distance={2} />
      </mesh>
      {/* Car 2 */}
      <mesh position={[5, 0, 1]}>
        <boxGeometry args={[0.8, 0.3, 0.4]} />
        <meshStandardMaterial color="#1e293b" />
        <pointLight position={[-0.5, 0, 0]} color="#fef3c7" intensity={0.5} distance={2} />
        <pointLight position={[0.5, 0, 0]} color="#ef4444" intensity={0.5} distance={2} />
      </mesh>
    </group>
  );
}

function CameraRig({ targetBuilding, onZoomComplete }) {
  useFrame((state, delta) => {
    if (targetBuilding) {
      // Zoom into the selected building
      const targetPos = new THREE.Vector3(targetBuilding.position[0], targetBuilding.position[1], targetBuilding.position[2] + 4);
      state.camera.position.lerp(targetPos, 0.1);
      state.camera.lookAt(targetBuilding.position[0], targetBuilding.position[1], targetBuilding.position[2]);
      
      // If close enough, complete zoom
      if (state.camera.position.distanceTo(targetPos) < 0.5) {
        onZoomComplete();
      }
    } else {
      // Default pan based on mouse
      const targetX = (state.pointer.x * 2);
      const targetY = 4 + (state.pointer.y * 1);
      
      state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetX, 2, delta);
      state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetY, 2, delta);
      state.camera.lookAt(0, 2, 0);
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
          <PerspectiveCamera makeDefault position={[0, 4, 15]} fov={45} />
          <color attach="background" args={['#0a0e1a']} />
          <fog attach="fog" args={['#0a0e1a', 10, 30]} />
          
          <ambientLight intensity={0.2} />
          <directionalLight position={[10, 20, 5]} intensity={1} castShadow shadow-mapSize={[1024, 1024]} />
          
          <Stars radius={50} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
          
          {/* Street */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 4]} receiveShadow>
            <planeGeometry args={[100, 4]} />
            <meshStandardMaterial color="#0f0f0f" />
          </mesh>
          
          {/* Buildings */}
          <group position={[-1.5, 0, 0]}>
            {buildingsData.map((b) => (
              <Building key={b.id} data={b} onClick={handleBuildingClick} isZooming={!!zoomingTo} />
            ))}
          </group>

          <AmbientCars />

          <CameraRig targetBuilding={zoomingTo} onZoomComplete={handleZoomComplete} />
        </Canvas>
      </div>

      {/* Hero Overlay */}
      <AnimatePresence>
        {!zoomingTo && (
          <motion.div 
            className="absolute inset-0 flex flex-col justify-center px-8 md:px-24 z-10 pointer-events-none mt-[-20dvh]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
          >
            <div className="max-w-2xl bg-[#0a0e1a]/40 p-8 rounded-3xl backdrop-blur-sm border border-slate-800">
              <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-text-primary mb-2">XEON BALMEO</h1>
              <p className="text-xl text-slate-400 mb-6 font-mono tracking-wide">Computer Science Student</p>
              <p className="text-lg text-slate-300 max-w-[50ch] mb-8 leading-relaxed">
                Specializing in logic-driven applications & web development.
              </p>
              <button 
                className="pointer-events-auto px-8 py-3 bg-accent text-slate-950 font-bold rounded-full hover:bg-accent-dim transition-colors duration-300 shadow-[0_0_20px_rgba(56,189,248,0.4)]"
                onClick={() => handleBuildingClick(buildingsData[3])}
              >
                Explore My World &rarr;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

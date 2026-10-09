import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Text, Float, PresentationControls, useCursor, Html, Environment } from '@react-three/drei';

const CONTENT_MAP = {
  about: {
    id: '01',
    title: 'ABOUT DISTRICT',
    statLabel: 'Developer Status',
    statValue: 'ACTIVE',
    items: [
      { id: '1', badge: 'bg', title: 'Background', desc: 'A passionate developer bridging the gap between web design and 3D experiences. I love crafting interfaces that push the boundaries of the browser.', position: [-4, -0.5, -2] },
      { id: '2', badge: 'ph', title: 'Philosophy', desc: 'Creating intuitive, immersive, and premium digital environments. Form and function must coexist in perfect harmony.', position: [0, -0.5, -4] },
      { id: '3', badge: 'lc', title: 'Location', desc: 'Based in the digital realm, constantly learning and exploring new technologies.', position: [4, -0.5, -2] }
    ]
  },
  education: {
    id: '02',
    title: 'EDU DISTRICT',
    statLabel: 'Degree Program',
    statValue: 'IN PROGRESS',
    items: [
      { id: '1', badge: 'cs', title: 'University', desc: 'Currently studying Computer Science and Web Development, focusing on modern architectures.', position: [-3, -0.5, -3] },
      { id: '2', badge: 'st', title: 'Self-Taught', desc: 'Mastered Three.js, React, and Framer Motion through dedicated practice and personal projects.', position: [3, -0.5, -3] }
    ]
  },
  skills: {
    id: '03',
    title: 'SKILL DISTRICT',
    statLabel: 'Primary Stack',
    statValue: 'REACT 3D',
    items: [
      { id: '1', badge: 'fe', title: 'Frontend', desc: 'React, Vue, Tailwind CSS, Framer Motion - Building responsive and fluid UIs.', position: [-4, -0.5, -2] },
      { id: '2', badge: '3d', title: '3D Web', desc: 'Three.js, React Three Fiber, WebGL - Bringing the z-axis to the browser.', position: [0, -0.5, -4] },
      { id: '3', badge: 'be', title: 'Backend', desc: 'Node.js, Express, PostgreSQL - Structuring robust and scalable server architectures.', position: [4, -0.5, -2] }
    ]
  },
  projects: {
    id: '04',
    title: 'WORK DISTRICT',
    statLabel: 'Total Deployed',
    statValue: '24 APPS',
    items: [
      { id: '1', badge: 'p1', title: 'Cyber City', desc: 'An interactive 3D portfolio website. You are currently exploring it!', position: [-4, -0.5, -2] },
      { id: '2', badge: 'p2', title: 'E-Commerce', desc: 'A modern, high-performance storefront with dynamic product configurators.', position: [0, -0.5, -4] },
      { id: '3', badge: 'p3', title: 'Dashboard', desc: 'Real-time analytics dashboard with WebSockets and 3D data visualization.', position: [4, -0.5, -2] }
    ]
  },
  contact: {
    id: '05',
    title: 'CONTACT DISTRICT',
    statLabel: 'Response Rate',
    statValue: '< 24 HRS',
    items: [
      { id: '1', badge: '@', title: 'Email', desc: 'Reach out to me at: hello@xeonbalmeo.com', position: [-3, -0.5, -3] },
      { id: '2', badge: '#', title: 'Social', desc: 'Find me on LinkedIn, GitHub, and Twitter @XeonBalmeo', position: [3, -0.5, -3] }
    ]
  }
};

function Pedestal({ data, onClick }) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  
  const accentColor = "#38bdf8";

  return (
    <group position={data.position} scale={[1.2, 1.2, 1.2]}>
      {/* Dark Slate Base */}
      <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 1.5, 2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.5} />
      </mesh>
      
      {/* Massive Computer Monitor / Screen representation */}
      <mesh position={[0, 1, -0.6]} castShadow>
        <boxGeometry args={[1.8, 1.2, 0.2]} />
        <meshStandardMaterial color="#020617" roughness={0.2} metalness={0.8} />
      </mesh>
      
      {/* Screen glow */}
      <mesh position={[0, 1, -0.49]}>
        <planeGeometry args={[1.7, 1.1]} />
        <meshBasicMaterial color={accentColor} transparent opacity={hovered ? 0.9 : 0.3} />
      </mesh>

      {/* Floating Interactive Core */}
      <Float speed={4} rotationIntensity={0.5} floatIntensity={0.8}>
        <mesh 
          position={[0, 2, 0.2]} 
          onClick={(e) => { e.stopPropagation(); onClick(data); }}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshPhysicalMaterial 
            color={hovered ? "#FFFFFF" : accentColor} 
            transmission={0.9} 
            roughness={0.1}
            emissive={accentColor}
            emissiveIntensity={hovered ? 3 : 1}
          />
          <pointLight color={accentColor} intensity={hovered ? 3 : 1.5} distance={5} />
        </mesh>
      </Float>

      {/* 3D Label */}
      <Text position={[0, 0, 1.1]} fontSize={0.25} color="white" anchorX="center" anchorY="middle">
        {data.title}
      </Text>
      
      {hovered && (
        <Html position={[0, 2.8, 0.2]} center className="pointer-events-none">
          <div className="bg-[#38bdf8] text-black px-4 py-2 rounded-lg font-bold text-sm shadow-[0_0_20px_rgba(56,189,248,0.5)] whitespace-nowrap">
            <span className="block text-[10px] opacity-80 uppercase tracking-widest">Connect</span>
            Access Terminal
          </div>
        </Html>
      )}
    </group>
  );
}

function Room() {
  return (
    <group>
      {/* Office Floor */}
      <mesh position={[0, -1, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.8} />
      </mesh>
      
      {/* Background Holographic Data Servers to fill the space */}
      {Array.from({ length: 10 }).map((_, i) => (
        <group key={i} position={[-18 + i * 4, 3, -6 - (i%2)*2]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.5, 8, 1.5]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0, 0.76]}>
            <planeGeometry args={[0.1, 6]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.6 + Math.random()*0.4} />
          </mesh>
        </group>
      ))}

      {/* Back Wall */}
      <mesh position={[0, 6, -10]} receiveShadow>
        <boxGeometry args={[50, 15, 1]} />
        <meshStandardMaterial color="#080b12" roughness={0.9} />
      </mesh>
      
      {/* Exit Door */}
      <group position={[-12, 1.5, -9.4]}>
        <mesh>
          <boxGeometry args={[4, 5, 0.2]} />
          <meshStandardMaterial color="#1A202C" />
        </mesh>
        <mesh position={[0, 2.5, 0.2]}>
          <planeGeometry args={[1.5, 0.5]} />
          <meshBasicMaterial color="#000" />
        </mesh>
        <Text position={[0, 2.5, 0.21]} fontSize={0.3} color="#38bdf8" anchorX="center" anchorY="middle" font="https://fonts.gstatic.com/s/spacemono/v12/i7dPIFZifjKcF5UAWdDRYEF8RXi4EwQ.woff">
          EXIT {'>'}
        </Text>
      </group>

      <ambientLight intensity={1.5} color="#151821" />
      <directionalLight position={[5, 10, 5]} intensity={2} color="#ffffff" castShadow />
      <spotLight position={[0, 15, 5]} angle={0.8} penumbra={0.5} intensity={80} color="#fffaed" castShadow />
      <Environment preset="city" />
    </group>
  );
}

export default function BuildingInterior({ buildingId, onExit }) {
  const content = CONTENT_MAP[buildingId] || CONTENT_MAP['about'];
  const [activeToast, setActiveToast] = useState(null);

  return (
    <motion.div
      className="absolute inset-0 bg-[#11141C] z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      <div className="absolute top-6 left-6 z-[60] flex items-center gap-3">
        {/* Original Geometric XEON Logo */}
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="absolute inset-0 border-[3px] border-white/80 rounded-sm rotate-45 transition-transform duration-1000 hover:rotate-90"></div>
          <div className="absolute w-3 h-3 bg-[#38bdf8] rounded-sm shadow-[0_0_15px_#38bdf8]"></div>
        </div>
        <div className="text-2xl font-black tracking-[0.2em] text-white flex items-baseline gap-1 uppercase drop-shadow-md">
          XEON_OS
        </div>
      </div>

      <button 
        onClick={onExit}
        className="absolute top-6 right-6 z-[60] px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-white/15 text-white text-xs font-semibold rounded-full backdrop-blur-md transition-all flex items-center gap-2"
      >
        Back to City
      </button>

      <div className="w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas shadows camera={{ position: [0, 4, 10], fov: 45 }}>
          <fog attach="fog" args={['#11141C', 10, 30]} />
          
          <PresentationControls 
            global 
            config={{ mass: 1, tension: 170, friction: 26 }} 
            rotation={[0, 0, 0]} 
            polar={[-Math.PI / 12, Math.PI / 12]} 
            azimuth={[-Math.PI / 8, Math.PI / 8]}
          >
            <Room />
            <group position={[0, -0.5, 0]}>
              {content.items.map(item => (
                <Pedestal 
                  key={item.id} 
                  data={item} 
                  onClick={setActiveToast} 
                />
              ))}
            </group>
          </PresentationControls>
        </Canvas>
      </div>

      {/* Dual-Tone Modal / Toast Overlay (Persona Studio Inspired) */}
      <AnimatePresence>
        {activeToast && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-[#F9F9F8] rounded-[24px] shadow-2xl max-w-3xl w-full overflow-hidden flex border border-gray-200/50 text-black relative"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Left Vertical Sidebar */}
              <div className="w-12 border-r border-gray-200/80 flex flex-col items-center py-6 justify-between bg-gray-50/50">
                <div className="w-2.5 h-2.5 bg-[#38bdf8] rounded-full"></div>
                <div 
                  className="font-mono text-[10px] tracking-widest text-gray-400 uppercase select-none whitespace-nowrap"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  XEON_OS · {content.title} · 41.9°N / 12.5°E
                </div>
              </div>

              {/* Main Modal Content */}
              <div className="flex-1 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 font-mono text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                      <div className="w-1.5 h-1.5 bg-[#38bdf8] rounded-full"></div>
                      {content.title} {content.id} / 05
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setActiveToast(null)}
                        className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 transition"
                      >
                        &#10005;
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col md:flex-row gap-8">
                    {/* Content Left */}
                    <div className="flex-1">
                      <div className="w-10 h-10 bg-[#38bdf8] rounded-xl flex items-center justify-center font-black text-white mb-4">
                        {activeToast.badge}
                      </div>
                      <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {activeToast.title}
                      </h2>
                      <p className="text-gray-600 text-sm leading-relaxed mt-3">
                        {activeToast.desc}
                      </p>
                      
                      <div className="flex gap-1 mt-6">
                        <div className="h-1.5 flex-1 bg-[#38bdf8] rounded-full"></div>
                        <div className="h-1.5 flex-1 bg-gray-200 rounded-full"></div>
                        <div className="h-1.5 flex-1 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>

                    {/* Stats Right */}
                    <div className="w-full md:w-64">
                      <div className="uppercase text-[10px] font-mono text-gray-400 tracking-wider mb-1">DATA TYPE</div>
                      <div className="text-sm font-bold text-gray-900 mb-4">STRING / COMPONENT</div>
                      
                      <div className="bg-[#0A0A0C] text-white p-5 rounded-2xl flex justify-between items-center mt-2 shadow-inner">
                        <div className="font-mono text-xs text-gray-400">{content.statLabel}</div>
                        <div className="text-[#38bdf8] font-bold font-mono text-sm">{content.statValue}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="font-mono text-[10px] text-gray-400 uppercase tracking-widest pt-6 mt-6 border-t border-gray-200 flex justify-between">
                  <span>ID: {activeToast.id}</span>
                  <span>STATUS: SECURE</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

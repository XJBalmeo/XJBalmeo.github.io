import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import NightSky from './NightSky';
import AmbientCity from './AmbientCity';

const buildings = [
  { id: 'about', label: 'ABOUT', type: 'tower' },
  { id: 'education', label: 'EDUCATION', type: 'block' },
  { id: 'skills', label: 'SKILLS', type: 'antenna' },
  { id: 'projects', label: 'PROJECTS', type: 'windows' },
  { id: 'contact', label: 'CONTACT', type: 'cozy' }
];

export default function CityScene({ onEnter }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div 
      className="w-full min-h-[100dvh] relative flex flex-col justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 2 }} // Zoom-in transition effect when clicking a building
      transition={{ duration: 0.6, type: 'spring', bounce: 0 }}
    >
      <NightSky />
      <AmbientCity />

      {/* Hero Overlay */}
      <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-24 z-10 pointer-events-none mt-[-10dvh]">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
          className="max-w-2xl"
        >
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-text-primary mb-2">XEON BALMEO</h1>
          <p className="text-xl text-slate-400 mb-6 font-mono tracking-wide">Computer Science Student</p>
          <p className="text-lg text-slate-500 max-w-[50ch] mb-8 leading-relaxed">
            Specializing in logic-driven applications & web development.
          </p>
          <button 
            className="pointer-events-auto px-8 py-3 bg-accent text-slate-950 font-bold rounded-full hover:bg-accent-dim transition-colors duration-300"
            onClick={() => onEnter('projects')}
          >
            Explore My World &rarr;
          </button>
        </motion.div>
      </div>

      {/* Building Skyline */}
      <div className="relative z-20 flex items-end justify-center gap-2 md:gap-6 px-4 pb-[40px] h-[400px]">
        {buildings.map((b, i) => (
          <Building 
            key={b.id} 
            building={b} 
            index={i} 
            onClick={() => onEnter(b.id)} 
            shouldReduceMotion={shouldReduceMotion} 
          />
        ))}
      </div>

      {/* Street Level */}
      <div className="absolute bottom-0 left-0 w-full h-[40px] bg-[#0f0f0f] z-30 border-t border-slate-800 flex items-center overflow-hidden">
        {/* Cars */}
        <div className="absolute w-6 h-2 bg-slate-700 rounded-sm top-2 left-0" style={{ animation: 'driveRight 15s linear infinite' }}>
           <div className="absolute right-0 top-0 w-1 h-2 bg-car-headlight rounded-r-sm shadow-[2px_0_10px_rgba(254,243,199,0.8)]" />
           <div className="absolute left-0 top-0 w-1 h-2 bg-car-taillight rounded-l-sm shadow-[-2px_0_10px_rgba(239,68,68,0.8)]" />
        </div>
        <div className="absolute w-6 h-2 bg-slate-800 rounded-sm bottom-2 right-0" style={{ animation: 'driveLeft 12s linear infinite', animationDelay: '2s' }}>
           <div className="absolute left-0 top-0 w-1 h-2 bg-car-headlight rounded-l-sm shadow-[-2px_0_10px_rgba(254,243,199,0.8)]" />
           <div className="absolute right-0 top-0 w-1 h-2 bg-car-taillight rounded-r-sm shadow-[2px_0_10px_rgba(239,68,68,0.8)]" />
        </div>
      </div>
    </motion.div>
  );
}

function Building({ building, index, onClick, shouldReduceMotion }) {
  // Determine shape based on type
  let width = "w-24 md:w-32";
  let height = "h-[200px] md:h-[280px]";
  let cols = 3;
  let rows = 6;

  if (building.type === 'tower') {
    width = "w-20 md:w-28";
    height = "h-[250px] md:h-[350px]";
    cols = 2;
    rows = 8;
  } else if (building.type === 'block') {
    width = "w-32 md:w-48";
    height = "h-[180px] md:h-[240px]";
    cols = 5;
    rows = 4;
  } else if (building.type === 'cozy') {
    width = "w-24 md:w-32";
    height = "h-[150px] md:h-[180px]";
    cols = 3;
    rows = 3;
  }

  // Generate windows
  const windows = Array.from({ length: cols * rows }).map((_, i) => ({
    id: i,
    delay: Math.random() * 5
  }));

  return (
    <motion.div
      onClick={onClick}
      className={`relative cursor-pointer bg-building-dark border-t border-l border-building-light ${width} ${height} flex flex-col items-center pt-6 group`}
      whileHover={shouldReduceMotion ? {} : { y: -8 }}
      transition={{ type: "spring", duration: 0.45, bounce: 0 }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 + (index * 0.1), type: 'spring', bounce: 0 }}
    >
      {/* Neon Sign */}
      <div 
        className="absolute -top-12 text-center w-full font-bold text-sm md:text-md tracking-widest text-neon-sign"
        style={{ textShadow: '0 0 5px var(--color-neon-sign), 0 0 20px var(--color-neon-sign)' }}
      >
        {building.label}
      </div>

      {/* Windows Grid */}
      <div 
        className="w-full h-full p-2 md:p-4 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {windows.map(w => (
          <div 
            key={w.id} 
            className="w-full aspect-square bg-window-off rounded-sm"
            style={{ 
              animation: `windowToggle ${5 + w.delay * 2}s infinite step-end`,
              animationDelay: `${w.delay}s`
            }}
          />
        ))}
      </div>
      
      {/* Door */}
      <div className="absolute bottom-0 w-8 h-12 bg-slate-900 border-t border-x border-slate-700" />
    </motion.div>
  );
}

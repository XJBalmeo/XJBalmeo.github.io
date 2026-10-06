import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion';

const floors = [
  { id: 'about', label: '1', name: 'About' },
  { id: 'education', label: '2', name: 'Edu' },
  { id: 'skills', label: '3', name: 'Skills' },
  { id: 'projects', label: '4', name: 'Proj' },
  { id: 'contact', label: '5', name: 'Contact' },
];

export default function Elevator() {
  const { scrollYProgress } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  const [activeFloor, setActiveFloor] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Map scroll progress (0 to 1) to active floor index (0 to 4)
    const floorIndex = Math.min(Math.floor(latest * floors.length), floors.length - 1);
    setActiveFloor(floorIndex);
  });

  const scrollToFloor = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <div className="fixed top-0 left-0 h-full w-[80px] md:w-[120px] bg-elevator-metal border-r border-slate-700 z-40 flex flex-col items-center py-8 shadow-2xl">
      {/* Elevator Track/Shaft line */}
      <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-slate-900 -translate-x-1/2 z-0" />

      {/* Buttons */}
      <div className="relative z-10 flex flex-col gap-6 w-full px-2 mt-20">
        {floors.map((floor, i) => (
          <button
            key={floor.id}
            onClick={() => scrollToFloor(floor.id)}
            className={`w-full aspect-square md:aspect-auto md:py-4 rounded-xl flex flex-col items-center justify-center transition-colors border ${
              activeFloor === i 
                ? 'bg-accent text-slate-900 border-accent shadow-[0_0_15px_rgba(56,189,248,0.5)]' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            <span className="text-xl md:text-2xl font-bold font-mono">{floor.label}</span>
            <span className="hidden md:block text-[10px] uppercase font-bold tracking-widest mt-1 opacity-80">{floor.name}</span>
          </button>
        ))}
      </div>

      {/* Moving Elevator Car Indicator */}
      {!shouldReduceMotion && (
        <motion.div 
          className="absolute w-12 h-16 md:w-20 md:h-24 bg-slate-800 rounded-md border-2 border-slate-600 shadow-xl overflow-hidden flex items-center justify-center -translate-x-1/2 left-1/2 z-20 pointer-events-none"
          style={{ top: '60%' }} // Initial visual position
          animate={{
            // Simplified animation for the car visual
            y: `calc(${(activeFloor / (floors.length - 1)) * 60}vh - 30vh)`
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          {/* Elevator Doors */}
          <motion.div 
            className="absolute left-0 top-0 bottom-0 w-[48%] bg-elevator-door border-r border-slate-900/50"
            animate={{ x: activeFloor >= 0 ? '-90%' : '0%' }} // Door open
            transition={{ delay: 0.2 }}
          />
          <motion.div 
            className="absolute right-0 top-0 bottom-0 w-[48%] bg-elevator-door border-l border-slate-900/50"
            animate={{ x: activeFloor >= 0 ? '90%' : '0%' }} // Door open
            transition={{ delay: 0.2 }}
          />
        </motion.div>
      )}
    </div>
  );
}

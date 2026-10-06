import React from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

export default function AmbientCity() {
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  
  // Subtle parallax based on scroll (though in City view, it doesn't scroll much, 
  // but it's good practice for general ambient feel)
  const yOffset = useTransform(scrollY, [0, 1000], [0, 50]);

  // Generate some simple background blocks
  const buildings = React.useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      width: Math.random() * 80 + 40,
      height: Math.random() * 200 + 100,
      left: Math.random() * 100, // percentage
      opacity: Math.random() * 0.3 + 0.1,
    }));
  }, []);

  return (
    <motion.div 
      className="absolute bottom-[40px] left-0 w-full h-[300px] pointer-events-none z-0"
      style={{ y: shouldReduceMotion ? 0 : yOffset }}
    >
      {buildings.map(b => (
        <div
          key={b.id}
          className="absolute bottom-0 bg-building-dark"
          style={{
            left: `${b.left}%`,
            width: `${b.width}px`,
            height: `${b.height}px`,
            opacity: b.opacity
          }}
        />
      ))}
    </motion.div>
  );
}

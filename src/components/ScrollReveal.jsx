import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function ScrollReveal({ children, delay = 0, className = '' }) {
  const shouldReduceMotion = useReducedMotion();

  // Jakub Krehel / Jhey Tompkins style reveal (blur + translate + fixed duration)
  const initial = shouldReduceMotion 
    ? { opacity: 0 } 
    : { opacity: 0, y: 24, filter: 'blur(8px)' };
    
  const whileInView = shouldReduceMotion 
    ? { opacity: 1 } 
    : { opacity: 1, y: 0, filter: 'blur(0px)' };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={whileInView}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1] // Custom ease
      }}
    >
      {children}
    </motion.div>
  );
}

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '@react-three/drei';

export default function LoadingScreen() {
  const { progress, active } = useProgress();
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (progress === 100 || !active) {
      const timeout = setTimeout(() => setShow(false), 1200);
      return () => clearTimeout(timeout);
    }
  }, [progress, active]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-[#11141C] flex flex-col items-center justify-center text-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1, ease: 'easeInOut' } }}
        >
          <div className="flex flex-col items-center w-full max-w-md px-8 relative">
            
            <motion.h1 
              className="text-4xl md:text-5xl font-bold tracking-tight text-white flex items-baseline gap-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Xeon<span className="w-2.5 h-2.5 bg-[#FACC15] rounded-full inline-block ml-1 shadow-[0_0_15px_rgba(250,204,21,0.6)]"></span>
            </motion.h1>
            
            <motion.p 
              className="text-xs tracking-[0.15em] text-[#8E95A5] uppercase font-mono mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              WEB PORTFOLIO
            </motion.p>
            
            <div className="w-64 h-1.5 bg-white/10 mt-8 relative overflow-hidden rounded-full">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-[#FACC15] shadow-[0_0_10px_rgba(250,204,21,0.5)] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <motion.div 
              className="font-mono text-xs text-[#FACC15] mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {Math.round(progress)}%
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

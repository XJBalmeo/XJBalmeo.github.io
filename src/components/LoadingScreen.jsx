import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '@react-three/drei';

export default function LoadingScreen() {
  const { progress, active } = useProgress();
  const [show, setShow] = useState(true);
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (active && progress < 100) {
      setDisplayProgress(Math.max(15, Math.round(progress)));
    } else {
      const fillTimer = setTimeout(() => setDisplayProgress(100), 150);
      const hideTimer = setTimeout(() => setShow(false), 1150);
      return () => {
        clearTimeout(fillTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [progress, active]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center text-white select-none overflow-hidden pointer-events-none"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.15 }
          }}
        >
          {/* Backdrop that clears away as the camera pans out into the 3D city */}
          <motion.div
            className="absolute inset-0 bg-[#0a0e1a]"
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: 1.15,
              transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] }
            }}
          />

          {/* Subtle radial skyline glow behind the name */}
          <motion.div
            className="absolute w-[38rem] h-[38rem] rounded-full pointer-events-none blur-3xl opacity-20"
            style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }}
            exit={{ scale: 2.5, opacity: 0, transition: { duration: 1.1 } }}
          />

          {/* Centerpiece Typography that zooms/pans through into the city on exit */}
          <motion.div
            className="relative z-10 flex flex-col items-center px-6 text-center"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              scale: 5.5,
              opacity: 0,
              filter: 'blur(14px)',
              transition: { duration: 1.15, ease: [0.22, 1, 0.36, 1] }
            }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* Simple "PORTFOLIO" label above the name */}
            <span className="text-xs sm:text-sm md:text-base font-semibold tracking-[0.45em] text-[#38bdf8] uppercase mb-3 md:mb-4">
              PORTFOLIO
            </span>

            {/* Giant Name Acting as the Loading Bar Itself */}
            <div className="relative inline-block">
              {/* Unfilled Dim Base Name */}
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-[0.14em] text-white/10 uppercase whitespace-nowrap">
                XEON BALMEO
              </h1>

              {/* Illuminated Fill Layer Driven by Loading Progress */}
              <div
                className="absolute inset-0 overflow-hidden transition-[clip-path] duration-300 ease-out"
                style={{
                  clipPath: `inset(0 ${100 - displayProgress}% 0 0)`
                }}
              >
                <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-[0.14em] text-white uppercase whitespace-nowrap drop-shadow-[0_0_28px_rgba(56,189,248,0.45)]">
                  XEON BALMEO
                </h1>
              </div>
            </div>

            {/* Minimal Progress Counter Below */}
            <div className="mt-6 flex items-center gap-3">
              <div className="w-32 sm:w-44 h-[2px] bg-white/10 overflow-hidden rounded-full">
                <div
                  className="h-full bg-[#38bdf8] shadow-[0_0_10px_#38bdf8] transition-all duration-300 ease-out"
                  style={{ width: `${displayProgress}%` }}
                />
              </div>
              <span className="font-mono text-xs sm:text-sm tracking-[0.2em] text-[#bae6fd] w-10 text-right">
                {displayProgress}%
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
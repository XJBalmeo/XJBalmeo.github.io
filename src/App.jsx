import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StaticPortfolio from './components/StaticPortfolio';
import CityScene from './components/CityScene';
import BuildingInterior from './components/BuildingInterior';
import LoadingScreen from './components/LoadingScreen';

export default function App() {
  const [is3DMode, setIs3DMode] = useState(false);
  const [activeBuilding, setActiveBuilding] = useState(null);
  const [bootKey, setBootKey] = useState(0);

  const handleEnterCity = () => {
    setActiveBuilding(null);
    setBootKey((prev) => prev + 1);
    setIs3DMode(true);
  };

  const handleExitToStatic = () => {
    setActiveBuilding(null);
    setIs3DMode(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 selection:bg-[#38bdf8]/30 selection:text-white">
      <AnimatePresence mode="wait">
        {!is3DMode ? (
          <motion.div
            key="static-portfolio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
          >
            <StaticPortfolio onEnterCity={handleEnterCity} />
          </motion.div>
        ) : (
          <motion.div
            key="3d-world"
            className="w-full h-[100dvh] overflow-hidden relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
          >
            {/* LoadingScreen triggers when the user clicks "Enter the City of Xeon" */}
            <LoadingScreen key={`loader-${bootKey}`} />

            <AnimatePresence mode="wait">
              {activeBuilding === null ? (
                <CityScene
                  key="city"
                  onEnter={(id) => setActiveBuilding(id)}
                  onExit3D={handleExitToStatic}
                />
              ) : (
                <BuildingInterior
                  key="interior"
                  buildingId={activeBuilding}
                  onExit={() => setActiveBuilding(null)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
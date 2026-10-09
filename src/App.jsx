import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import CityScene from './components/CityScene';
import BuildingInterior from './components/BuildingInterior';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [activeBuilding, setActiveBuilding] = useState(null);

  const handleEnterBuilding = (buildingId) => {
    setActiveBuilding(buildingId);
  };

  const handleExitBuilding = () => {
    setActiveBuilding(null);
  };

  return (
    <div className="w-full min-h-[100dvh] bg-night-sky text-slate-100 overflow-hidden relative">
      <LoadingScreen />
      <AnimatePresence mode="wait">
        {!activeBuilding ? (
          <CityScene key="city" onEnter={handleEnterBuilding} />
        ) : (
          <BuildingInterior key="interior" buildingId={activeBuilding} onExit={handleExitBuilding} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Elevator from './Elevator';
import AboutFloor from '../sections/AboutFloor';
import EducationFloor from '../sections/EducationFloor';
import SkillsFloor from '../sections/SkillsFloor';
import ProjectsFloor from '../sections/ProjectsFloor';
import ContactFloor from '../sections/ContactFloor';

export default function BuildingInterior({ buildingId, onExit }) {
  const shouldReduceMotion = useReducedMotion();

  // Scroll to the specific floor on mount
  useEffect(() => {
    const el = document.getElementById(buildingId);
    if (el) {
      // Small delay to allow enter animation to settle before scrolling
      setTimeout(() => {
        el.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
      }, 100);
    }
  }, [buildingId, shouldReduceMotion]);

  return (
    <motion.div
      className="relative w-full bg-slate-900"
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20, filter: shouldReduceMotion ? 'blur(0px)' : 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -12, filter: shouldReduceMotion ? 'blur(0px)' : 'blur(4px)' }}
      transition={{ type: "spring", duration: 0.5, bounce: 0 }}
    >
      {/* Back to City Button */}
      <button 
        onClick={onExit}
        className="fixed top-6 right-6 z-50 px-6 py-2 bg-slate-800 text-slate-200 border border-slate-700 rounded-full hover:bg-slate-700 transition-colors shadow-lg"
      >
        &larr; Back to City
      </button>

      {/* Elevator Side Navigation */}
      <Elevator />

      {/* Floors Content */}
      <div className="pl-[80px] md:pl-[120px] w-full">
        <AboutFloor id="about" />
        <EducationFloor id="education" />
        <SkillsFloor id="skills" />
        <ProjectsFloor id="projects" />
        <ContactFloor id="contact" />
      </div>
    </motion.div>
  );
}

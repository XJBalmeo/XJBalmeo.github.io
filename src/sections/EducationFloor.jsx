import React from 'react';
import { ScrollReveal } from '../components/ScrollReveal';
import { motion, useReducedMotion } from 'framer-motion';

export default function EducationFloor({ id }) {
  const shouldReduceMotion = useReducedMotion();

  const courses = [
    "Design and Analysis of Algorithms",
    "Operating Systems",
    "Statistics and Probability",
    "Information Management",
    "Data Communications and Networking"
  ];

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
  };

  return (
    <section id={id} className="min-h-[100dvh] flex items-center justify-center p-6 md:p-16 border-b border-slate-800 relative">
      {/* Background hint */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'url(images/pup_background.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      
      <div className="max-w-4xl w-full z-10">
        <ScrollReveal>
          <p className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-4">Floor 2 &mdash; Education</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-16 text-slate-100">Academic Journey</h2>
        </ScrollReveal>

        {/* Timeline style */}
        <div className="relative pl-8 md:pl-0">
          {/* Vertical line */}
          <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-px bg-slate-700 -translate-x-1/2" />

          <ScrollReveal delay={0.2} className="relative flex flex-col md:flex-row items-start justify-center gap-8 md:gap-16">
            
            {/* Logo Node */}
            <div className="absolute left-[39px] md:left-1/2 top-0 -translate-x-1/2 bg-slate-900 border-4 border-slate-900 rounded-full z-10 w-20 h-20 shadow-xl overflow-hidden">
              <img src="images/pup_logo.png" alt="PUP Logo" className="w-full h-full object-cover bg-white" />
            </div>

            {/* Content Left (Empty on mobile) */}
            <div className="hidden md:block flex-1 text-right pt-4 pr-12">
              <h3 className="text-2xl font-bold text-slate-100">BS Computer Science</h3>
              <p className="text-accent font-mono mt-1">2023 &mdash; Present</p>
            </div>

            {/* Content Right */}
            <div className="flex-1 pt-4 md:pl-12 ml-16 md:ml-0">
              <div className="md:hidden mb-4">
                <h3 className="text-2xl font-bold text-slate-100">BS Computer Science</h3>
                <p className="text-accent font-mono mt-1">2023 &mdash; Present</p>
              </div>
              
              <h4 className="text-lg text-slate-300 font-bold mb-4">Polytechnic University of the Philippines</h4>
              
              <p className="text-slate-400 mb-6">
                Current academic focus on computational theory, systems architecture, and data engineering.
              </p>

              {/* Staggered list for courses */}
              <motion.ul 
                className="flex flex-col gap-3"
                variants={shouldReduceMotion ? {} : listVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                {courses.map(course => (
                  <motion.li 
                    key={course}
                    variants={shouldReduceMotion ? {} : itemVariants}
                    className="flex items-center gap-3 text-slate-300 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700 w-fit"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {course}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

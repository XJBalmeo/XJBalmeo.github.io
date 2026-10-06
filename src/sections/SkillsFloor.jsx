import React from 'react';
import { ScrollReveal } from '../components/ScrollReveal';
import { motion, useReducedMotion } from 'framer-motion';

export default function SkillsFloor({ id }) {
  const shouldReduceMotion = useReducedMotion();

  const skillCategories = [
    {
      title: "Programming",
      items: ["Java", "Python", "JavaScript"]
    },
    {
      title: "Web Tech",
      items: ["HTML", "CSS", "React", "Tailwind CSS", "Framer Motion"]
    },
    {
      title: "Tools",
      items: ["Git", "GitHub", "VS Code"]
    }
  ];

  return (
    <section id={id} className="min-h-[100dvh] flex items-center justify-center p-6 md:p-16 border-b border-slate-800">
      <div className="max-w-5xl w-full">
        <ScrollReveal>
          <div className="text-center md:text-left mb-16">
            <p className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-4">Floor 3 &mdash; Departments</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-100">Technical Arsenal</h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {skillCategories.map((cat, index) => (
            <ScrollReveal key={cat.title} delay={index * 0.1 + 0.1}>
              <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-8 h-full shadow-lg hover:border-slate-500 hover:bg-slate-800/60 transition-colors">
                <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                  {cat.title}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {cat.items.map(item => (
                    <span 
                      key={item} 
                      className="px-4 py-2 bg-slate-900/80 text-slate-300 rounded-lg text-sm border border-slate-700 font-mono"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

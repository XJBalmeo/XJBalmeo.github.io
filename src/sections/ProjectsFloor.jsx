import React from 'react';
import { ScrollReveal } from '../components/ScrollReveal';

export default function ProjectsFloor({ id }) {
  const projects = [
    {
      title: "Basis Finder",
      desc: "A tool to discover and map vectors. Built for Linear Algebra concepts.",
      tech: ["Python", "Algorithms", "Math"],
      image: "images/basis_finder.png",
      link: "#"
    },
    {
      title: "Portfolio Web",
      desc: "This immersive, scroll-driven interactive portfolio inspired by cityscapes.",
      tech: ["React", "Tailwind", "Framer Motion"],
      image: "images/xeon_transparent.png",
      link: "#"
    }
  ];

  return (
    <section id={id} className="min-h-[100dvh] flex items-center justify-center p-6 md:p-16 border-b border-slate-800">
      <div className="max-w-6xl w-full">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-4">Floor 4 &mdash; Gallery</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-100">Featured Work</h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {projects.map((proj, i) => (
            <ScrollReveal key={proj.title} delay={i * 0.1 + 0.1}>
              <div className="group bg-slate-900 border border-slate-700 rounded-[12px] overflow-hidden flex flex-col hover:border-slate-500 transition-colors">
                
                {/* Image container */}
                <div className="relative aspect-video overflow-hidden bg-slate-800">
                  <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors z-10" />
                  <img 
                    src={proj.image} 
                    alt={proj.title} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  />
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-slate-100 mb-3 group-hover:text-accent transition-colors">{proj.title}</h3>
                  <p className="text-slate-400 mb-6 flex-grow">{proj.desc}</p>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
                    <div className="flex flex-wrap gap-2">
                      {proj.tech.map(t => (
                        <span key={t} className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                    <a href={proj.link} className="text-sm font-bold text-accent hover:text-accent-dim uppercase tracking-wider">
                      View &rarr;
                    </a>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

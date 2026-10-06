import React from 'react';
import { ScrollReveal } from '../components/ScrollReveal';

export default function AboutFloor({ id }) {
  return (
    <section id={id} className="min-h-[100dvh] flex items-center justify-center p-6 md:p-16 border-b border-slate-800">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Col - Photo */}
        <ScrollReveal delay={0.1}>
          <div className="relative aspect-[4/5] max-w-sm mx-auto lg:max-w-none rounded-[12px] bg-slate-800 border border-slate-700 overflow-hidden shadow-2xl">
            {/* Soft inner glow from glassmorphism approximation */}
            <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] pointer-events-none" />
            <img 
              src="images/xeon_transparent.png" 
              alt="Xeon Balmeo" 
              className="w-full h-full object-cover object-bottom"
            />
          </div>
        </ScrollReveal>

        {/* Right Col - Info */}
        <div className="flex flex-col gap-8">
          <ScrollReveal delay={0.2}>
            <div>
              <p className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-4">Floor 1 &mdash; About Me</p>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-slate-100">Xeon Balmeo</h2>
              <p className="text-xl text-slate-400 font-mono mb-6">Bacoor City, Cavite</p>
              <p className="text-lg text-slate-300 leading-relaxed max-w-[50ch]">
                Currently specializing in logic-driven applications, exploring data structures, and expanding stack in Web Development. Focused on building performant and visually immersive digital experiences.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fact Cards */}
              <div className="p-5 rounded-[12px] bg-slate-800/50 border border-slate-700">
                <h3 className="text-sm text-slate-400 font-bold mb-2 uppercase tracking-wider">Gaming</h3>
                <p className="text-slate-200">Valorant, League of Legends</p>
              </div>
              <div className="p-5 rounded-[12px] bg-slate-800/50 border border-slate-700">
                <h3 className="text-sm text-slate-400 font-bold mb-2 uppercase tracking-wider">On Repeat</h3>
                <p className="text-slate-200">"Who Knows" &mdash; Daniel Caesar</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

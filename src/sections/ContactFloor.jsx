import React from 'react';
import { ScrollReveal } from '../components/ScrollReveal';

export default function ContactFloor({ id }) {
  return (
    <section id={id} className="min-h-[100dvh] flex items-center justify-center p-6 md:p-16">
      <div className="max-w-4xl w-full">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-4">Floor 5 &mdash; Lobby</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-100 mb-6">Let's Connect</h2>
            <p className="text-xl text-slate-400 max-w-[40ch] mx-auto">
              Looking to collaborate or just want to say hi? My inbox is always open.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="bg-slate-800/80 border border-slate-700 rounded-[12px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            {/* Warm glow behind form */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-window-glow/10 rounded-full blur-3xl -z-10" />
            
            <form className="flex flex-col gap-6 relative z-10" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-bold text-slate-300">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-accent transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-bold text-slate-300">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-accent transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-sm font-bold text-slate-300">Message</label>
                <textarea 
                  id="message" 
                  rows="4"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="Hello Xeon..."
                ></textarea>
              </div>

              <button 
                type="submit"
                className="self-start px-8 py-4 bg-accent text-slate-950 font-bold rounded-full hover:bg-accent-dim transition-colors duration-300"
              >
                Send Message
              </button>
            </form>
          </div>
        </ScrollReveal>

        {/* Footer / Socials */}
        <ScrollReveal delay={0.4} className="mt-20 border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 font-mono text-sm">&copy; {new Date().getFullYear()} Xeon Balmeo</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-slate-200 transition-colors">GitHub</a>
            <a href="#" className="text-slate-400 hover:text-slate-200 transition-colors">LinkedIn</a>
            <a href="#" className="text-slate-400 hover:text-slate-200 transition-colors">Twitter</a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  GraduationCap,
  Code2,
  FolderGit2,
  Mail,
  ExternalLink,
  ArrowUpRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

// lucide-react v1.52+ removed Github & Linkedin — using inline SVGs instead
function Github({ size = 24, className = '', strokeWidth = 2, ...props }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function Linkedin({ size = 24, className = '', strokeWidth = 2, ...props }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

// ============================================================================
// PORTFOLIO DATA (Edit your details here)
// ============================================================================
const PROFILE = {
  name: 'Xeon Balmeo',
  role: 'Computer Science Student & Software Developer',
  location: 'Bacoor City, Cavite, Philippines',
  tagline:
    'Building clean software systems, full-stack web applications, and interactive 3D experiences.',
  bio: [
    'I am an undergraduate Computer Science student at the Polytechnic University of the Philippines (PUP) passionate about software engineering, algorithmic problem-solving, and modern web development.',
    'Whether architecting clean, minimal interfaces or experimenting with interactive 3D graphics on the web, I focus on writing maintainable code that performs well across devices.'
  ],
  quickFacts: [
    { label: 'Base', value: 'Bacoor City, Cavite' },
    { label: 'Degree', value: 'BS Computer Science' },
    { label: 'Focus', value: 'Data Science & Agentic Development' },
    { label: 'Interests', value: 'Gaming, Music & Systems' }
  ],
  socials: {
    email: 'xjbalmeo24@gmail.com',
    github: 'https://github.com/',
    linkedin: 'https://linkedin.com/'
  }
};

const EDUCATION = [
  {
    institution: 'Polytechnic University of the Philippines (PUP)',
    degree: 'Bachelor of Science in Computer Science',
    period: '2023 — Present',
    location: 'Sta. Mesa, Manila',
    description:
      'Focusing on core computer science foundations, software engineering, data structures, linear algebra, and full-stack application development.',
    coursework: [
      'Data Structures & Algorithms',
      'Object-Oriented Programming',
      'Discrete Structures',
      'Linear Algebra & Computational Math',
      'Web Development',
      'Database Management Systems'
    ]
  },
  {
    institution: 'Senior High School — STEM Strand (Mock Entry)',
    degree: 'Science, Technology, Engineering, and Mathematics',
    period: '2021 — 2023',
    location: 'Cavite, Philippines',
    description:
      'Graduated with honors. Built foundational programming projects and participated in mathematics and computing workshops.',
    coursework: ['Pre-Calculus', 'Basic Calculus', 'Empowerment Technologies', 'Capstone Research']
  }
];

const SKILL_CATEGORIES = [
  {
    title: 'Programming Languages',
    items: ['JavaScript (ES6+)', 'Python', 'Java', 'C / C++', 'SQL', 'HTML5 & CSS3']
  },
  {
    title: 'Frameworks & Libraries',
    items: ['React', 'Tailwind CSS', 'Three.js / React Three Fiber', 'Framer Motion', 'Node.js']
  },
  {
    title: 'Tools & Workflow',
    items: ['Git & GitHub', 'Vite', 'VS Code', 'Linux / Bash', 'Figma', 'Playwright']
  }
];

const PROJECTS = [
  {
    title: 'City of Xeon — 3D Interactive Portfolio',
    category: 'Web3D / React Three Fiber',
    description:
      'An interactive 3D cyberpunk city portfolio where every section is an architectural skyscraper you can click on and enter, paired with this lightweight static portfolio mode.',
    tech: ['React 19', 'Three.js', 'React Three Fiber', 'Tailwind CSS', 'Framer Motion'],
    liveUrl: '#top',
    repoUrl: 'https://github.com/',
    is3DTrigger: true
  },
  {
    title: 'Basis Finder',
    category: 'Python / Computational Mathematics',
    description:
      'A linear algebra utility built in Python that computes row-reduced echelon forms (RREF), column space, null space, and basis vectors for user-defined matrices.',
    tech: ['Python', 'NumPy', 'Linear Algebra', 'CLI / GUI'],
    liveUrl: 'https://github.com/',
    repoUrl: 'https://github.com/'
  },
  {
    title: 'TaskFlow Academic Tracker (Mock Project)',
    category: 'Full-Stack Web Application',
    description:
      'A minimalist productivity and coursework tracker designed for university students to organize deadlines, syllabus milestones, and study sprints.',
    tech: ['React', 'Tailwind CSS', 'Local Storage / REST API', 'Vite'],
    liveUrl: 'https://github.com/',
    repoUrl: 'https://github.com/'
  },
  {
    title: 'Algorithm Visualizer Suite (Mock Project)',
    category: 'Interactive Educational Tool',
    description:
      'Step-by-step interactive visualizations for classic graph traversal (BFS, DFS, Dijkstra) and sorting algorithms with adjustable playback speed.',
    tech: ['JavaScript', 'HTML5 Canvas', 'CSS Grid', 'Algorithms'],
    liveUrl: 'https://github.com/',
    repoUrl: 'https://github.com/'
  }
];

// ============================================================================
// COMPONENT
// ============================================================================
export default function StaticPortfolio({ onEnterCity }) {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 4000);
    e.target.reset();
  };

  return (
    <div id="top" className="min-h-screen bg-[#0a0e1a] text-slate-200 font-sans">
      {/* Sticky Minimal Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#0a0e1a]/85 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <a
            href="#top"
            className="text-sm font-bold tracking-[0.2em] text-white uppercase hover:text-[#38bdf8] transition-colors"
          >
            XEON BALMEO
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm text-slate-400">
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#education" className="hover:text-white transition-colors">
              Education
            </a>
            <a href="#skills" className="hover:text-white transition-colors">
              Skills
            </a>
            <a href="#projects" className="hover:text-white transition-colors">
              Projects
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Contact
            </a>
          </nav>

          <button
            onClick={onEnterCity}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/40 hover:bg-[#38bdf8] hover:text-slate-950 transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(56,189,248,0.15)]"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Enter the City of Xeon</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        {/* Hero Section */}
        <section className="py-20 md:py-28 border-b border-slate-800/70">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#38bdf8] mb-4">
                <MapPin className="w-3.5 h-3.5" />
                <span>{PROFILE.location}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white">
                {PROFILE.name}
              </h1>

              <p className="mt-3 text-lg sm:text-xl text-slate-300 font-medium">
                {PROFILE.role}
              </p>

              <p className="mt-4 text-slate-400 leading-relaxed">
                {PROFILE.tagline}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <button
                  onClick={onEnterCity}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg text-sm font-semibold bg-[#38bdf8] text-slate-950 hover:bg-[#7dd3fc] transition-all duration-200 cursor-pointer shadow-[0_0_25px_rgba(56,189,248,0.3)]"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Enter the City of Xeon</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <a
                  href="#projects"
                  className="px-5 py-3 rounded-lg text-sm font-medium bg-slate-900 text-slate-200 border border-slate-800 hover:border-slate-700 hover:text-white transition-colors"
                >
                  View Projects
                </a>

                <a
                  href="#contact"
                  className="px-5 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Contact Me
                </a>
              </div>
            </div>

            {/* Minimal 3D Mode Callout Card */}
            <div className="w-full md:w-72 p-5 rounded-xl bg-slate-900/70 border border-slate-800/90 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#38bdf8] mb-2">
                  <span>INTERACTIVE 3D MODE</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-base font-semibold text-white">
                  Explore the 3D Skyline
                </h2>
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                  Prefer an immersive experience? Switch to the interactive 3D city where each section is a skyscraper you can enter.
                </p>
              </div>

              <button
                onClick={onEnterCity}
                className="mt-5 w-full py-2.5 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider bg-slate-800 hover:bg-[#38bdf8] text-slate-200 hover:text-slate-950 border border-slate-700 hover:border-[#38bdf8] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Enter the City of Xeon</span>
              </button>
            </div>
          </div>
        </section>

        {/* 1. About Section */}
        <section id="about" className="py-16 md:py-20 border-b border-slate-800/70 scroll-mt-16">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#38bdf8] mb-2">
            <span>01</span>
            <span>/</span>
            <span>About</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">About Me</h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4 text-slate-300 leading-relaxed">
              {PROFILE.bio.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
              {PROFILE.quickFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80"
                >
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    {fact.label}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    {fact.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2. Education Section */}
        <section id="education" className="py-16 md:py-20 border-b border-slate-800/70 scroll-mt-16">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#38bdf8] mb-2">
            <span>02</span>
            <span>/</span>
            <span>Education</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <GraduationCap className="w-7 h-7 text-[#38bdf8]" />
            <span>Academic Background</span>
          </h2>

          <div className="mt-8 space-y-6">
            {EDUCATION.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/80"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h3 className="text-lg font-bold text-white">{item.degree}</h3>
                  <span className="text-xs font-mono text-[#38bdf8]">{item.period}</span>
                </div>

                <div className="mt-1 text-sm text-slate-300 font-medium">
                  {item.institution} · <span className="text-slate-400">{item.location}</span>
                </div>

                <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {item.coursework.map((course) => (
                    <span
                      key={course}
                      className="px-2.5 py-1 rounded-md text-xs bg-slate-800/80 text-slate-300 border border-slate-700/60"
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Skills Section */}
        <section id="skills" className="py-16 md:py-20 border-b border-slate-800/70 scroll-mt-16">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#38bdf8] mb-2">
            <span>03</span>
            <span>/</span>
            <span>Skills</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Code2 className="w-7 h-7 text-[#38bdf8]" />
            <span>Technical Skills</span>
          </h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {SKILL_CATEGORIES.map((group) => (
              <div
                key={group.title}
                className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/80"
              >
                <h3 className="text-base font-semibold text-white mb-4">
                  {group.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-200 border border-slate-700/70"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Projects Section */}
        <section id="projects" className="py-16 md:py-20 border-b border-slate-800/70 scroll-mt-16">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#38bdf8] mb-2">
            <span>04</span>
            <span>/</span>
            <span>Projects</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <FolderGit2 className="w-7 h-7 text-[#38bdf8]" />
            <span>Selected Projects</span>
          </h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROJECTS.map((project) => (
              <div
                key={project.title}
                className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-mono text-[#38bdf8] mb-1">
                    {project.category}
                  </div>
                  <h3 className="text-lg font-bold text-white">{project.title}</h3>
                  <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="mt-6">
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs font-medium">
                    {project.is3DTrigger ? (
                      <button
                        onClick={onEnterCity}
                        className="inline-flex items-center gap-1.5 text-[#38bdf8] hover:underline cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Launch 3D City View</span>
                      </button>
                    ) : (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Live Demo</span>
                      </a>
                    )}

                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Source Code</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Contact Section */}
        <section id="contact" className="py-16 md:py-24 scroll-mt-16">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#38bdf8] mb-2">
            <span>05</span>
            <span>/</span>
            <span>Contact</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Mail className="w-7 h-7 text-[#38bdf8]" />
            <span>Get In Touch</span>
          </h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
                Have a question, internship opportunity, or project collaboration in mind? Feel free to send a message or reach out directly through my links below.
              </p>

              <div className="pt-2 space-y-3 text-sm">
                <a
                  href={`mailto:${PROFILE.socials.email}`}
                  className="flex items-center gap-3 text-slate-300 hover:text-[#38bdf8] transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#38bdf8]" />
                  <span>{PROFILE.socials.email}</span>
                </a>
                <a
                  href={PROFILE.socials.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-slate-300 hover:text-[#38bdf8] transition-colors"
                >
                  <Github className="w-4 h-4 text-[#38bdf8]" />
                  <span>github.com/xeonbalmeo</span>
                </a>
                <a
                  href={PROFILE.socials.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-slate-300 hover:text-[#38bdf8] transition-colors"
                >
                  <Linkedin className="w-4 h-4 text-[#38bdf8]" />
                  <span>linkedin.com/in/xeonbalmeo</span>
                </a>
              </div>
            </div>

            <form
              onSubmit={handleFormSubmit}
              className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-4"
            >
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can I help you?"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-5 rounded-lg text-sm font-semibold bg-[#38bdf8] text-slate-950 hover:bg-[#7dd3fc] transition-colors cursor-pointer"
              >
                Send Message
              </button>

              {formSubmitted && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Message received! I will get back to you soon.</span>
                </div>
              )}
            </form>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-800/80 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Xeon Balmeo. All rights reserved.</span>
          <button
            onClick={onEnterCity}
            className="text-slate-400 hover:text-[#38bdf8] transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Enter the City of Xeon</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
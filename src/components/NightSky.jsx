import React from 'react';

export default function NightSky() {
  // Generate random stars once
  const stars = React.useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 60, // Keep stars mostly in the sky, not street level
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-night-sky to-slate-900">
      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white opacity-80"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `twinkle 4s infinite ease-in-out`,
            animationDelay: `${star.delay}s`
          }}
        />
      ))}
      
      {/* Moon */}
      <div 
        className="absolute top-12 right-12 w-24 h-24 rounded-full bg-yellow-50 opacity-90"
        style={{
          boxShadow: '0 0 40px 10px rgba(255, 255, 200, 0.2), 0 0 100px 20px rgba(255, 255, 200, 0.1)'
        }}
      />
    </div>
  );
}

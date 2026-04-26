import React from 'react';

export default function StudyGames() {
  const launchGame = () => {
    window.open('https://blazes.io', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <button 
        onClick={launchGame}
        className="group relative px-24 py-10 rounded-[32px] overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(249,115,22,0.3)]"
      >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-amber-400 to-red-500 animate-gradient-flow" />
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />

        {/* Text */}
        <span className="relative z-10 text-white font-black text-4xl tracking-tighter drop-shadow-lg">
          PLAY BLAZES.IO
        </span>

        {/* Subtle Inner Glow */}
        <div className="absolute inset-0 rounded-[32px] border-2 border-white/20 pointer-events-none" />
      </button>

      <style>{`
        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-flow {
          background-size: 200% 200%;
          animation: gradient-flow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

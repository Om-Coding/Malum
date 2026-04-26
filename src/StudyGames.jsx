import React from 'react';

export default function StudyGames() {
  const launchGame = () => {
    window.open('https://blazes.io', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 space-y-8">
      {/* Theme Aware Label */}
      <div className="text-center space-y-1">
        <h2 className="text-sm font-black theme-text opacity-50 uppercase tracking-[0.4em]">
          External Arena
        </h2>
        <div className="h-1 w-12 bg-orange-500 mx-auto rounded-full" />
      </div>

      <button 
        onClick={launchGame}
        className="group relative px-20 py-10 rounded-[32px] overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95 shadow-[0_20px_60px_rgba(249,115,22,0.4)]"
      >
        {/* Intense Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F97316] via-[#FBBF24] to-[#EF4444] animate-gradient-flow" />
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />

        {/* Text - Switched to BLACK for maximum readability on bright colors */}
        <span className="relative z-10 text-black font-black text-4xl tracking-tighter">
          PLAY BLAZES.IO
        </span>

        {/* Subtle Inner Border */}
        <div className="absolute inset-0 rounded-[32px] border-2 border-black/5 pointer-events-none" />
      </button>

      <p className="text-xs font-medium theme-text opacity-40">
        Opens in a new window for best performance
      </p>

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
        .theme-text {
          color: var(--text-primary, #000);
        }
        :root[class~="dark"] .theme-text {
          color: #fff;
        }
      `}</style>
    </div>
  );
}

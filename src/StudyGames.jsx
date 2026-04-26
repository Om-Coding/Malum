import React from 'react';
import { Flame, ExternalLink } from 'lucide-react';

export default function StudyGames() {
  const launchGame = () => {
    window.open('https://blazes.io', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[800px] h-[800px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'radial-gradient(circle, rgba(252,211,77,0.08) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <button 
        onClick={launchGame}
        className="group relative w-full max-w-2xl aspect-[16/9] rounded-[40px] overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
        style={{ background: 'var(--bg-elevated)', border: '2px solid var(--border-color)' }}
      >
        {/* Animated Glow Overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'radial-gradient(circle at 50% 50%, rgba(252,211,77,0.15) 0%, transparent 70%)' }} />

        <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-6 p-12">
          <div className="w-32 h-32 rounded-[32px] bg-amber-500/10 flex items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.2)] group-hover:shadow-[0_0_80px_rgba(245,158,11,0.4)] transition-all duration-500">
            <Flame className="w-16 h-16 text-amber-500 animate-pulse" />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-5xl font-black theme-text tracking-tightest">BLAZES.IO</h1>
            <p className="theme-text-muted font-medium text-lg">Click anywhere to enter the arena</p>
          </div>

          <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-amber-500 text-black font-black text-xl shadow-xl group-hover:bg-amber-400 transition-colors">
            LAUNCH GAME
            <ExternalLink className="w-6 h-6" />
          </div>
        </div>

        {/* Decorative corner accents */}
        <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-amber-500/30 rounded-tl-2xl" />
        <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-amber-500/30 rounded-br-2xl" />
      </button>

      <style>{`
        .tracking-tightest { letter-spacing: -0.05em; }
      `}</style>
    </div>
  );
}

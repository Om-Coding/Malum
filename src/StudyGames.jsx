import React from 'react';
import { Flame, ExternalLink, Sparkles } from 'lucide-react';

export default function StudyGames() {
  const launchGame = () => {
    window.open('https://blazes.io', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/20 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-red-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Glassmorphic Portal */}
      <button 
        onClick={launchGame}
        className="group relative w-full max-w-3xl aspect-[16/9] rounded-[48px] overflow-hidden transition-all duration-700 hover:scale-[1.03] active:scale-[0.97] shadow-[0_32px_80px_rgba(0,0,0,0.4)]"
        style={{ 
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Animated Gradient Border Overlay */}
        <div className="absolute inset-0 p-[2px] opacity-20 group-hover:opacity-100 transition-opacity duration-1000">
           <div className="w-full h-full rounded-[46px] bg-gradient-to-br from-orange-500 via-amber-300 to-red-500 animate-gradient-xy" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center space-y-8 p-12 bg-black/40 rounded-[46px]">
          
          {/* Hero Icon with Extreme Glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/40 blur-[40px] group-hover:blur-[60px] transition-all duration-700 animate-pulse" />
            <div className="relative w-36 h-36 rounded-[40px] bg-gradient-to-br from-orange-500 to-amber-300 flex items-center justify-center shadow-2xl transform group-hover:rotate-6 transition-transform duration-500">
              <Flame className="w-20 h-20 text-black animate-bounce-slow" />
              <Sparkles className="absolute -top-4 -right-4 w-10 h-10 text-white animate-spin-slow opacity-80" />
            </div>
          </div>

          {/* Text Elements */}
          <div className="text-center space-y-4">
            <h1 className="text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-100 to-orange-400 drop-shadow-2xl">
              BLAZES.IO
            </h1>
            <p className="text-orange-200/60 font-bold text-xl uppercase tracking-[0.2em] group-hover:text-amber-200 transition-colors">
              Enter the Arena • Feel the Heat
            </p>
          </div>

          {/* Interactive Button */}
          <div className="relative group/btn mt-4">
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-600 to-amber-400 rounded-2xl blur-lg opacity-40 group-hover:opacity-100 transition-all duration-300" />
            <div className="relative flex items-center gap-4 px-12 py-5 rounded-2xl bg-white text-black font-black text-2xl shadow-2xl transition-all group-hover/btn:px-16">
              LAUNCH GAME
              <ExternalLink className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </div>

        {/* Floating Particles (Simulated with div elements) */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-float-particle opacity-20" />
        <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-orange-400 rounded-full animate-float-particle opacity-20" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-amber-200 rounded-full animate-float-particle opacity-20" style={{ animationDelay: '3s' }} />
      </button>

      <style>{`
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float-particle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
        }
        .animate-gradient-xy { background-size: 400% 400%; animation: gradient-xy 3s linear infinite; }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        .animate-float-particle { animation: float-particle 4s linear infinite; }
        .tracking-tightest { letter-spacing: -0.05em; }
      `}</style>
    </div>
  );
}

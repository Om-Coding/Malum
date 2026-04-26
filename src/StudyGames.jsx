import React from 'react';
import { Flame, ExternalLink, Sparkles, Zap, Star } from 'lucide-react';

export default function StudyGames() {
  const launchGame = () => {
    window.open('https://blazes.io', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden bg-black/20">
      {/* Hyper-Colorful Nebula Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/30 blur-[140px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/30 blur-[140px] animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-[-20%] left-[10%] w-[50%] h-[50%] rounded-full bg-pink-600/30 blur-[140px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-[0%] right-[20%] w-[40%] h-[40%] rounded-full bg-cyan-600/20 blur-[120px] animate-pulse" style={{ animationDuration: '7s' }} />
      </div>

      {/* Main Rainbow Portal */}
      <button 
        onClick={launchGame}
        className="group relative w-full max-w-3xl aspect-[16/9] rounded-[56px] overflow-hidden transition-all duration-700 hover:scale-[1.04] active:scale-[0.96] shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
      >
        {/* Animated Spectrum Border */}
        <div className="absolute inset-0 p-[3px]">
           <div className="w-full h-full rounded-[53px] bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-purple-500 to-red-500 animate-spectrum-flow" />
        </div>

        {/* content glass layer */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center space-y-10 p-12 bg-black/60 backdrop-blur-3xl rounded-[53px]">
          
          {/* Multi-Color Glow Icon */}
          <div className="relative">
            <div className="absolute -inset-10 bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-500 blur-[60px] opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative w-40 h-40 rounded-[44px] bg-gradient-to-br from-white via-amber-200 to-orange-400 flex items-center justify-center shadow-2xl overflow-hidden">
               {/* Inner glow animation */}
               <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-pink-400/20 animate-pulse" />
               <Flame className="w-24 h-24 text-black animate-bounce-slow" />
            </div>
            {/* Floating side icons */}
            <Star className="absolute -top-6 -left-6 w-10 h-10 text-yellow-400 animate-spin-slow" />
            <Zap className="absolute -bottom-6 -right-6 w-10 h-10 text-cyan-400 animate-pulse" />
          </div>

          {/* Shimmering Rainbow Text */}
          <div className="text-center space-y-6">
            <h1 className="text-8xl font-black italic tracking-tighter animate-rainbow-text relative">
              BLAZES.IO
              <span className="absolute inset-0 blur-lg opacity-40 animate-rainbow-text">BLAZES.IO</span>
            </h1>
            <div className="flex items-center justify-center gap-4">
               <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-pink-500" />
               <p className="text-white font-black text-2xl uppercase tracking-[0.3em] flex gap-2">
                 <span className="text-pink-400">PURE</span>
                 <span className="text-cyan-400">ENERGY</span>
               </p>
               <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-cyan-500" />
            </div>
          </div>

          {/* Hyper-Colorful Launch Button */}
          <div className="relative mt-4">
            <div className="absolute -inset-2 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-2xl blur opacity-70 group-hover:blur-md transition-all animate-spectrum-flow" />
            <div className="relative flex items-center gap-6 px-16 py-6 rounded-2xl bg-white text-black font-black text-3xl shadow-2xl transition-all group-hover:scale-110">
              PLAY NOW
              <ExternalLink className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Interactive Rainbow Particles */}
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-2 h-2 rounded-full animate-multi-float"
            style={{
              background: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'][i],
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              animationDelay: `${i * 0.5}s`,
              boxShadow: `0 0 10px ${['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'][i]}`
            }}
          />
        ))}
      </button>

      <style>{`
        @keyframes spectrum-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes rainbow-text {
          0% { color: #ff0000; text-shadow: 0 0 20px rgba(255,0,0,0.5); }
          20% { color: #ffff00; text-shadow: 0 0 20px rgba(255,255,0,0.5); }
          40% { color: #00ff00; text-shadow: 0 0 20px rgba(0,255,0,0.5); }
          60% { color: #00ffff; text-shadow: 0 0 20px rgba(0,255,255,0.5); }
          80% { color: #ff00ff; text-shadow: 0 0 20px rgba(255,0,255,0.5); }
          100% { color: #ff0000; text-shadow: 0 0 20px rgba(255,0,0,0.5); }
        }
        @keyframes multi-float {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          50% { opacity: 0.8; transform: translateY(-50px) scale(1.5); }
          100% { transform: translateY(-100px) scale(0); opacity: 0; }
        }
        .animate-spectrum-flow { background-size: 300% 300%; animation: spectrum-flow 4s var(--tw-border-opacity, 1) infinite linear; }
        .animate-rainbow-text { animation: rainbow-text 4s linear infinite; }
        .animate-multi-float { animation: multi-float 3s infinite ease-in-out; }
        .animate-bounce-slow { animation: bounce 2s infinite ease-in-out; }
        .animate-spin-slow { animation: spin 10s linear infinite; }
      `}</style>
    </div>
  );
}

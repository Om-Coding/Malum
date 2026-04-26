import React, { useState } from 'react';
import {
  Gamepad2, Flame, ChevronRight, X as XIcon
} from 'lucide-react';

const GAMES = [
  {
    id: 'blazes', label: 'Blazes.io', icon: Flame, color: '#FCD34D', glow: 'rgba(252,211,77,0.4)',
    desc: 'The ultimate high-speed arena. Join the battle at Blazes.io and show your skills!',
    tags: ['Multiplayer', 'Action', 'Fast-Paced'],
  },
];

export default function StudyGames() {
  const [activeGame, setActiveGame] = useState(null);
  const game = GAMES.find(g => g.id === activeGame);

  return (
    <div className="min-h-screen theme-bg theme-text">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full -top-32 -left-32"
          style={{ background: 'radial-gradient(circle, rgba(252,211,77,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto p-6 md:p-10 space-y-8">
        {/* Header */}
        <header className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(252,211,77,0.3)]"
            style={{ background: 'linear-gradient(135deg, #F97316, #FCD34D)' }}>
            <Gamepad2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black malum-text-gradient">Study Games</h1>
            <p className="text-sm theme-text-secondary font-medium">Ready for the arena? Launch your game below.</p>
          </div>
          {activeGame && (
            <button onClick={() => setActiveGame(null)}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
              <XIcon className="w-4 h-4" /> Exit
            </button>
          )}
        </header>

        {/* Game Selector Grid */}
        {!activeGame && (
          <div className="max-w-md mx-auto">
            {GAMES.map((g, i) => (
              <button key={g.id} onClick={() => setActiveGame(g.id)}
                className="group w-full rounded-3xl p-8 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  animation: `fadeInUp 0.4s ease ${i * 0.08}s both`,
                }}>
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 30% 30%, ${g.glow.replace('0.4)', '0.08)')}, transparent 70%)` }} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: `${g.color}18`, boxShadow: `0 0 20px ${g.glow}` }}>
                      <g.icon className="w-8 h-8" style={{ color: g.color }} />
                    </div>
                    <div className="p-3 rounded-xl opacity-100 transition-all"
                      style={{ background: `${g.color}15`, color: g.color }}>
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                  <h3 className="font-black theme-text text-2xl mb-3">{g.label}</h3>
                  <p className="text-sm theme-text-secondary leading-relaxed mb-6">{g.desc}</p>
                  <div className="flex gap-2 flex-wrap">
                    {g.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-black px-3 py-1.5 rounded-full"
                        style={{ background: `${g.color}12`, border: `1px solid ${g.color}28`, color: g.color }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Active Game Portal */}
        {activeGame && game && (
          <div className="space-y-6" style={{ animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <div className="rounded-3xl p-12 text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
              <div className="flex flex-col items-center justify-center space-y-8">
                <div className="w-24 h-24 rounded-3xl bg-amber-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                  <Flame className="w-12 h-12 text-amber-500 animate-pulse" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-4xl font-black theme-text tracking-tighter">LAUNCH BLAZES.IO</h2>
                  <p className="theme-text-muted max-w-sm mx-auto">Get ready for the arena. The game will open in a new window for the best performance.</p>
                </div>
                <a href="https://blazes.io" target="_blank" rel="noopener noreferrer" 
                  className="group relative px-16 py-6 rounded-2xl bg-amber-500 text-black font-black text-2xl hover:scale-105 transition-all shadow-2xl">
                  PLAY NOW
                  <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .malum-text-gradient { background: linear-gradient(135deg, #F97316, #FCD34D); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}</style>
    </div>
  );
}

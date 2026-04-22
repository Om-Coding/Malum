import React, { useState } from 'react';
import {
  TrendingUp, X, ExternalLink, Settings, Landmark, MonitorCheck,
  ChevronDown, ChevronUp, ShieldAlert, GraduationCap
} from 'lucide-react';

/* ─── MAIN ───────────────────────────────────────────────────────── */
export default function Gradescout() {
  const [gradingUrl, setGradingUrl] = useState(() => localStorage.getItem('classroom_grading_url') || '');
  const [gradingInput, setGradingInput] = useState('');
  const [showPortal, setShowPortal] = useState(true);
  const [editingUrl, setEditingUrl] = useState(!gradingUrl);

  const savePortal = () => {
    if (!gradingInput.trim()) return;
    let url = gradingInput.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    setGradingUrl(url);
    localStorage.setItem('classroom_grading_url', url);
    setEditingUrl(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-[500px] h-[500px] rounded-full -top-20 -right-20"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full bottom-0 -left-20"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-6 md:p-10 space-y-8">

        {/* ── Header ── */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 0 30px rgba(16,185,129,0.4)' }}>
              <TrendingIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black malum-text-gradient">GradeScout</h1>
              <p className="text-sm theme-text-secondary font-medium">Access your official school portal</p>
            </div>
          </div>
        </header>

        {/* ── Main Portal Connector ── */}
        <div className="rounded-3xl overflow-hidden theme-bg-elevated border theme-border shadow-2xl">
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.1)' }}>
                <Landmark className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="font-black theme-text text-base">Official Grade Portal</p>
                <p className="text-xs theme-text-muted">
                  {gradingUrl ? 'Connected to your school server' : 'Connect your school portal (PowerSchool, Infinite Campus, etc.)'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {gradingUrl && !editingUrl && (
                <a href={gradingUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}>
                  <ExternalLink className="w-4 h-4" />Launch
                </a>
              )}
              <button
                onClick={() => { setEditingUrl(!editingUrl); setGradingInput(gradingUrl); }}
                className="p-2 rounded-xl theme-bg border theme-border theme-text-muted hover:theme-text transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="px-6 pb-6 border-t theme-border">
            {(!gradingUrl || editingUrl) ? (
              <div className="pt-6 space-y-4 max-w-lg mx-auto text-center">
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <MonitorCheck className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-black theme-text">Connect your School</h3>
                <p className="text-sm theme-text-secondary">Paste your school's grading portal URL below to access it directly within Malum.</p>
                
                <div className="flex gap-2">
                  <input
                    type="text" placeholder="e.g. powerschool.yourschool.edu"
                    value={gradingInput}
                    onChange={e => setGradingInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && savePortal()}
                    className="flex-1 px-4 py-3 rounded-xl theme-bg border theme-border theme-text font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-sm"
                  />
                  <button onClick={savePortal}
                    className="px-6 py-3 rounded-xl text-white font-black text-sm transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', boxShadow: '0 4px 16px rgba(139,92,246,0.35)' }}>
                    Save
                  </button>
                </div>
                {gradingUrl && (
                  <button onClick={() => setEditingUrl(false)} className="text-xs font-bold theme-text-muted hover:theme-text underline">
                    Cancel editing
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
                  <ShieldAlert className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm theme-text font-bold">Portal Preview</p>
                    <p className="text-xs theme-text-secondary leading-relaxed">
                      If the preview is blank, your school's firewall is blocking embedded pages. Use the <strong>Launch</strong> button at the top right to open your grades in a new tab.
                    </p>
                  </div>
                </div>
                
                <div className="relative rounded-2xl overflow-hidden shadow-inner" style={{ height: '600px', background: 'var(--bg-faint)' }}>
                  <iframe 
                    src={gradingUrl} 
                    title="School Portal" 
                    className="absolute inset-0 w-full h-full border-0 z-10"
                    sandbox="allow-same-origin allow-scripts allow-forms" 
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center -z-0 opacity-20">
                    <GraduationCap className="w-16 h-16 theme-text-muted mb-3" />
                    <p className="text-sm theme-text-muted font-bold tracking-widest uppercase">Grade Portal Loading…</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Info Footer ── */}
        <div className="text-center py-4">
          <p className="text-xs theme-text-muted font-medium flex items-center justify-center gap-1.5">
            <ShieldAlert className="w-3 h-3" />
            Your data is stored locally on your device. Malum does not track your portal credentials.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

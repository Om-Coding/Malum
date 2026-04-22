import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap, Plus, X, Sparkles, Send, Loader2, CheckCircle2,
  Circle, Calendar, BookOpen, Trash2, Edit2, Check, Brain,
  AlertCircle, TrendingUp, MessageSquare, Eye, RefreshCw, Copy, Star
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_ROOT = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:5000';

const STATUS_CONFIG = {
  'Not Started': { color: '#6B7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.25)' },
  'In Progress':  { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)'  },
  'Submitted':    { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',   border: 'rgba(59,130,246,0.3)'  },
  'Accepted':     { color: '#10B981', bg: 'rgba(16,185,129,0.12)',   border: 'rgba(16,185,129,0.3)'  },
  'Rejected':     { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',    border: 'rgba(239,68,68,0.25)'  },
  'Waitlisted':   { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)',   border: 'rgba(139,92,246,0.3)'  },
  'Deferred':     { color: '#EC4899', bg: 'rgba(236,72,153,0.12)',   border: 'rgba(236,72,153,0.3)'  },
};

const TASK_CATEGORIES = [
  'Common App Essay','Supplemental Essays','Recommendation Letters',
  'Standardized Tests','Transcripts','Financial Aid','Portfolio','Interview','Other'
];

/* ─── Score Ring ─────────────────────────────────────────────────── */
function ScoreRing({ score, label, color }) {
  const r = 28, circ = 2 * Math.PI * r;
  const offset = circ - (score / 10) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
          <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)', filter: `drop-shadow(0 0 5px ${color}80)` }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-black" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-[10px] font-bold theme-text-muted text-center leading-tight">{label}</span>
    </div>
  );
}

/* ─── Essay Writing Studio ──────────────────────────────────────── */
function EssayStudio() {
  const [essay, setEssay] = useState('');
  const [essayType, setEssayType] = useState('Common App Personal Statement');
  const [targetCollege, setTargetCollege] = useState('');
  const [grading, setGrading] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [grade, setGrade] = useState(null);
  const [suggestion, setSuggestion] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  const essayTypes = [
    'Common App Personal Statement', 'Why This College', 'Extracurricular / Activity',
    'Creative / Uncommon Prompt', 'Community / Identity', 'Challenge / Failure',
    'Research / Academic Interest', 'Short Answer (150 words or less)',
  ];

  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;
  const wordLimit = essayType.includes('Short Answer') ? 150 : 650;
  const wordPct = Math.min((wordCount / wordLimit) * 100, 100);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, aiLoading]);

  /* Grade */
  const analyzeEssay = async () => {
    if (!essay.trim()) return;
    setGrading(true); setGrade(null);
    const prompt = `You are an expert college admissions essay coach. Analyze this ${essayType} essay${targetCollege ? ` for ${targetCollege}` : ''}.

Return ONLY a valid JSON object, no markdown fences, no extra text:
{"overallScore":<1-10 integer>,"grade":"<A+|A|A-|B+|B|B-|C+|C|D|F>","scores":{"hook":<1-10>,"voice":<1-10>,"structure":<1-10>,"specificity":<1-10>,"impact":<1-10>,"conclusion":<1-10>},"verdict":"<punchy 1-sentence verdict under 15 words>","strengths":["<s1>","<s2>","<s3>"],"improvements":["<fix1>","<fix2>","<fix3>"],"rewriteSuggestion":"<rewrite opening 1-3 sentences to be more compelling>","admissionsOfficerPOV":"<1 paragraph AO perspective>","wordCountFeedback":"<1 sentence on length>"}

ESSAY TO ANALYZE:
${essay}`;
    try {
      const res = await fetch(`${API_ROOT}/api/study`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
      const data = await res.json();
      const raw = (data.result || '').replace(/```json/g, '').replace(/```/g, '').trim();
      setGrade(JSON.parse(raw));
    } catch {
      setGrade({ error: 'Could not analyze. Make sure the backend is running.' });
    }
    setGrading(false);
  };

  /* AI writing actions */
  const aiActions = [
    { id: 'continue', emoji: '✍️', label: 'Continue',     prompt: (e) => `Continue writing this college essay, adding 2-3 compelling sentences that match the existing voice and style exactly. Output only the new sentences:\n\n${e}` },
    { id: 'improve',  emoji: '✨', label: 'Improve All',  prompt: (e) => `Rewrite this college essay to be significantly more compelling, specific, and emotionally resonant. Keep the same core story. Output only the improved essay:\n\n${e}` },
    { id: 'hook',     emoji: '🎣', label: 'Better Hook',  prompt: (e) => `Rewrite only the opening paragraph to have a much more specific, gripping hook. Output only the new opening paragraph:\n\n${e}` },
    { id: 'shorten',  emoji: '✂️', label: 'Tighten',      prompt: (e) => `Condense this essay to be tighter and more impactful. Remove filler and weak sentences. Output only the condensed essay:\n\n${e}` },
    { id: 'conclude', emoji: '🏁', label: 'Conclude',     prompt: (e) => `Write a powerful, memorable concluding paragraph for this essay that ties back to the opening and leaves a lasting impression. Output only the conclusion:\n\n${e}` },
  ];

  const runAIAction = async (action) => {
    if (!essay.trim() || suggestLoading) return;
    setSuggestLoading(true); setSuggestion(''); setAccepted(false);
    try {
      const res = await fetch(`${API_ROOT}/api/study`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: action.prompt(essay) }) });
      const data = await res.json();
      setSuggestion(data.result || '');
    } catch { setSuggestion('Error generating suggestion.'); }
    setSuggestLoading(false);
  };

  const applySuggestion = (mode) => {
    if (!suggestion) return;
    if (mode === 'append') setEssay(e => e.trimEnd() + '\n\n' + suggestion);
    else setEssay(suggestion);
    setSuggestion(''); setAccepted(true);
    setTimeout(() => setAccepted(false), 2000);
  };

  /* Chat */
  const sendChat = async () => {
    if (!chatInput.trim() || aiLoading) return;
    const msg = chatInput.trim(); setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setAiLoading(true);
    try {
      const ctx = essay.trim()
        ? `Student is writing a ${essayType}${targetCollege ? ` for ${targetCollege}` : ''}. Their current essay:\n\n${essay}\n\n---\nStudent asks: ${msg}`
        : `You are an expert college essay coach. Student asks: ${msg}`;
      const res = await fetch(`${API_ROOT}/api/study`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: `You are an expert college admissions essay coach. Be specific, actionable, and encouraging. ${ctx}` }) });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'ai', text: data.result || 'No response.' }]);
    } catch { setChatMessages(prev => [...prev, { role: 'error', text: 'Could not reach AI.' }]); }
    setAiLoading(false);
  };

  const copyGrade = () => {
    if (!grade || grade.error) return;
    navigator.clipboard.writeText(`Grade: ${grade.grade} (${grade.overallScore}/10)\n${grade.verdict}\n\nStrengths:\n${grade.strengths.map(s => '• ' + s).join('\n')}\n\nImprovements:\n${grade.improvements.map(s => '• ' + s).join('\n')}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const scoreColors = { hook: '#F59E0B', voice: '#EC4899', structure: '#3B82F6', specificity: '#10B981', impact: '#8B5CF6', conclusion: '#F97316' };
  const gradeColor = grade && !grade.error ? grade.overallScore >= 8 ? '#10B981' : grade.overallScore >= 6 ? '#F59E0B' : '#EF4444' : '#8B5CF6';

  const quickChatPrompts = ['What story should I tell?', 'Is my voice authentic?', 'How do I stand out?', 'What should I cut?'];

  return (
    <div className="space-y-4">
      {/* Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider theme-text-muted mb-1">Essay Type</label>
          <select value={essayType} onChange={e => setEssayType(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl theme-bg border theme-border theme-text text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/30">
            {essayTypes.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider theme-text-muted mb-1">Target College (optional)</label>
          <input value={targetCollege} onChange={e => setTargetCollege(e.target.value)} placeholder="e.g. MIT, Harvard, Stanford..."
            className="w-full px-3 py-2.5 rounded-xl theme-bg border theme-border theme-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30" />
        </div>
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">

        {/* ── LEFT: Editor ── */}
        <div className="space-y-3">

          {/* Editor box */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(139,92,246,0.25)' }}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(139,92,246,0.05)' }}>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#EF4444', opacity: 0.7 }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#F59E0B', opacity: 0.7 }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#10B981', opacity: 0.7 }} />
                <span className="text-xs font-black theme-text-muted ml-2">My Essay</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${wordPct}%`, background: wordCount > wordLimit ? '#EF4444' : wordCount > wordLimit * 0.85 ? '#F59E0B' : 'linear-gradient(90deg,#8B5CF6,#EC4899)' }} />
                </div>
                <span className="text-xs font-bold tabular-nums" style={{ color: wordCount > wordLimit ? '#EF4444' : wordCount > wordLimit * 0.85 ? '#F59E0B' : 'rgba(255,255,255,0.4)' }}>
                  {wordCount}/{wordLimit} words
                </span>
                {accepted && <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" />Applied!</span>}
              </div>
            </div>

            {/* Text area */}
            <textarea
              value={essay}
              onChange={e => setEssay(e.target.value)}
              placeholder={`Start writing your ${essayType} here...\n\nTip: Write freely — use the AI tools below to continue, improve, and grade as you go.`}
              className="w-full px-5 py-4 focus:outline-none resize-none theme-text bg-transparent leading-relaxed text-sm"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', lineHeight: '1.9', minHeight: '380px', caretColor: '#A78BFA' }}
            />
          </div>

          {/* AI tools */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider theme-text-muted mb-2 pl-1">✦ AI Writing Tools</p>
            <div className="flex flex-wrap gap-2">
              {aiActions.map(a => (
                <button key={a.id} onClick={() => runAIAction(a)}
                  disabled={!essay.trim() || suggestLoading}
                  className="flex flex-col items-start px-3 py-2 rounded-xl transition-all hover:scale-105 disabled:opacity-40"
                  style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <span className="text-xs font-black" style={{ color: '#A78BFA' }}>{a.emoji} {a.label}</span>
                </button>
              ))}
              {suggestLoading && (
                <div className="flex items-center gap-2 px-3 py-2">
                  <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                  <span className="text-xs theme-text-muted">Writing...</span>
                </div>
              )}
            </div>
          </div>

          {/* Suggestion preview */}
          {suggestion && !suggestLoading && (
            <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)', animation: 'slideDown 0.25s ease' }}>
              <p className="text-xs font-black text-indigo-400 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" />AI Suggestion</p>
              <p className="text-sm leading-relaxed italic" style={{ color: 'rgba(255,255,255,0.82)', fontFamily: 'Georgia, serif' }}>
                {suggestion.length > 600 ? suggestion.slice(0, 600) + '…' : suggestion}
              </p>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => applySuggestion('replace')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}>
                  <Check className="w-3.5 h-3.5" /> Replace Essay
                </button>
                <button onClick={() => applySuggestion('append')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818CF8' }}>
                  + Append
                </button>
                <button onClick={() => setSuggestion('')}
                  className="px-3 py-2 rounded-xl text-xs font-bold theme-text-muted hover:text-red-400 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Discard
                </button>
              </div>
            </div>
          )}

          {/* Grade button */}
          <button onClick={analyzeEssay} disabled={grading || !essay.trim()}
            className="w-full py-4 rounded-2xl text-white font-black text-base transition-all hover:scale-[1.01] disabled:opacity-40 flex items-center justify-center gap-3"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', boxShadow: '0 4px 24px rgba(139,92,246,0.45)' }}>
            {grading ? <><Loader2 className="w-5 h-5 animate-spin" /> Grading...</> : <><Star className="w-5 h-5" /> Grade My Essay</>}
          </button>
        </div>

        {/* ── RIGHT: Grade + Chat ── */}
        <div className="space-y-4">

          {/* Empty state */}
          {!grade && !grading && (
            <div className="rounded-2xl p-8 text-center space-y-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(236,72,153,0.1))', border: '1px solid rgba(139,92,246,0.2)' }}>
                <Star className="w-8 h-8" style={{ color: '#A78BFA' }} />
              </div>
              <p className="font-black theme-text">Your Grade Appears Here</p>
              <p className="text-sm theme-text-muted leading-relaxed">
                Write your essay on the left, then click <span className="font-bold" style={{ color: '#A78BFA' }}>Grade My Essay</span> for detailed scores, strengths, improvements, and an admissions officer perspective.
              </p>
            </div>
          )}

          {/* Grading loading */}
          {grading && (
            <div className="rounded-2xl p-8 text-center space-y-4" style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(139,92,246,0.25)' }}>
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-[3px] border-purple-500/20 border-t-purple-500 animate-spin" />
                <div className="absolute inset-2 rounded-full border-[3px] border-pink-500/20 border-t-pink-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.4s' }} />
                <div className="absolute inset-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <p className="font-black theme-text">Analyzing your essay...</p>
              <p className="text-sm theme-text-muted">Hook · Voice · Structure · Specificity · Impact · Conclusion</p>
            </div>
          )}

          {/* Grade results */}
          {grade && !grade.error && (
            <div className="space-y-3" style={{ animation: 'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
              {/* Headline */}
              <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: `linear-gradient(135deg,${gradeColor}12,${gradeColor}06)`, border: `1px solid ${gradeColor}35` }}>
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg,${gradeColor},transparent)` }} />
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
                    style={{ background: `${gradeColor}18`, border: `2px solid ${gradeColor}45`, boxShadow: `0 0 24px ${gradeColor}30` }}>
                    <span className="text-3xl font-black" style={{ color: gradeColor }}>{grade.grade}</span>
                    <span className="text-[10px] font-bold" style={{ color: gradeColor, opacity: 0.7 }}>{grade.overallScore}/10</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black theme-text text-base leading-tight mb-1">{grade.verdict}</p>
                    <p className="text-xs theme-text-muted">{grade.wordCountFeedback}</p>
                  </div>
                  <button onClick={copyGrade} className="p-2 rounded-xl flex-shrink-0 transition-all hover:scale-110"
                    style={{ background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.07)', border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`, color: copied ? '#10b981' : 'rgba(255,255,255,0.5)' }}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Score rings */}
              <div className="rounded-2xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
                <p className="text-[10px] font-black uppercase tracking-wider theme-text-muted mb-3">Dimension Breakdown</p>
                <div className="flex flex-wrap gap-4 justify-around">
                  {Object.entries(grade.scores).map(([key, val]) => (
                    <ScoreRing key={key} score={val} label={key.charAt(0).toUpperCase() + key.slice(1)} color={scoreColors[key] || '#8B5CF6'} />
                  ))}
                </div>
              </div>

              {/* Strengths */}
              <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <p className="font-black text-xs flex items-center gap-1.5 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> What's Working</p>
                <ul className="space-y-1.5">
                  {grade.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs theme-text-secondary leading-relaxed">
                      <span className="text-emerald-400 flex-shrink-0 font-bold">✓</span>{s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <p className="font-black text-xs flex items-center gap-1.5 text-amber-400"><TrendingUp className="w-3.5 h-3.5" /> Improve These</p>
                <ul className="space-y-1.5">
                  {grade.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs theme-text-secondary leading-relaxed">
                      <span className="text-amber-400 flex-shrink-0 font-bold">→</span>{s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hook rewrite */}
              <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' }}>
                <p className="font-black text-xs text-indigo-400 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Stronger Opening</p>
                <p className="text-xs leading-relaxed italic" style={{ color: 'rgba(255,255,255,0.82)', fontFamily: 'Georgia, serif' }}>"{grade.rewriteSuggestion}"</p>
                <button onClick={() => { setEssay(e => grade.rewriteSuggestion + '\n\n' + e); }}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818CF8' }}>
                  Use this opening ↗
                </button>
              </div>

              {/* AO POV */}
              <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.2)' }}>
                <p className="font-black text-xs text-pink-400 flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Admissions Officer Says</p>
                <p className="text-xs theme-text-secondary leading-relaxed">{grade.admissionsOfficerPOV}</p>
              </div>

              <button onClick={() => setGrade(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 mx-auto"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.5)' }}>
                <RefreshCw className="w-3.5 h-3.5" /> Clear Grade
              </button>
            </div>
          )}

          {grade?.error && (
            <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300 font-medium">{grade.error}</p>
            </div>
          )}

          {/* ── AI Writing Coach Chat ── */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(139,92,246,0.06)' }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}>
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-black text-sm theme-text">AI Writing Coach</span>
              <span className="text-xs theme-text-muted ml-1">— ask anything</span>
            </div>

            <div className="p-3 space-y-3 overflow-y-auto custom-scrollbar" style={{ maxHeight: '280px' }}>
              {chatMessages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-xs theme-text-muted text-center py-1">Chat while you write — your essay is always in context</p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickChatPrompts.map((p, i) => (
                      <button key={i} onClick={() => setChatInput(p)}
                        className="text-[11px] px-2.5 py-1.5 rounded-lg font-semibold transition-all hover:scale-105"
                        style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#A78BFA' }}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black"
                    style={{ background: msg.role === 'user' ? '#7C3AED' : 'rgba(139,92,246,0.15)', color: msg.role === 'user' ? 'white' : '#A78BFA' }}>
                    {msg.role === 'user' ? 'You' : '✦'}
                  </div>
                  <div className={`rounded-xl p-2.5 text-xs font-medium leading-relaxed max-w-[85%] ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                    style={{ background: msg.role === 'user' ? '#7C3AED' : 'rgba(255,255,255,0.04)', border: msg.role !== 'user' ? '1px solid rgba(255,255,255,0.06)' : undefined, color: msg.role === 'user' ? 'white' : 'rgba(255,255,255,0.78)' }}>
                    {msg.role === 'ai'
                      ? <div className="prose prose-invert prose-xs max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown></div>
                      : msg.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
                    <span className="text-[10px] font-black text-purple-400">✦</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Loader2 className="w-3 h-3 text-purple-400 animate-spin" />
                    <span className="text-xs theme-text-muted">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex gap-2">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                  placeholder="Ask your AI coach..."
                  className="flex-1 px-3 py-2 rounded-xl text-xs font-medium focus:outline-none theme-text"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,92,246,0.25)', caretColor: '#A78BFA' }}
                  disabled={aiLoading} />
                <button onClick={sendChat} disabled={!chatInput.trim() || aiLoading}
                  className="p-2 rounded-xl text-white transition-all hover:scale-110 disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)' }}>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── College Card ──────────────────────────────────────────────── */
function CollegeCard({ college, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...college });
  const cfg = STATUS_CONFIG[college.status] || STATUS_CONFIG['Not Started'];
  const save = () => { onUpdate({ ...college, ...form }); setEditing(false); };
  const tiers = ['Dream', 'Target', 'Safety'];

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg group"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
      <div className="h-0.5" style={{ background: `linear-gradient(90deg,${cfg.color},transparent)` }} />
      <div className="p-5">
        {editing ? (
          <div className="space-y-3">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-sm font-bold theme-bg border theme-border theme-text focus:outline-none" placeholder="College name" />
            <div className="grid grid-cols-2 gap-2">
              <select value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })}
                className="px-3 py-2 rounded-xl text-sm font-semibold theme-bg border theme-border theme-text focus:outline-none">
                {tiers.map(t => <option key={t}>{t}</option>)}
              </select>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="px-3 py-2 rounded-xl text-sm font-semibold theme-bg border theme-border theme-text focus:outline-none">
                {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-sm theme-bg border theme-border theme-text focus:outline-none" />
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs theme-bg border theme-border theme-text focus:outline-none resize-none" rows={2} placeholder="Notes..." />
            <div className="flex gap-2">
              <button onClick={save} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-white font-black text-xs"
                style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)' }}><Check className="w-3.5 h-3.5" /> Save</button>
              <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-xl text-xs font-bold theme-text-muted theme-bg-elevated border theme-border">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-black theme-text text-base truncate">{college.name}</h3>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ background: college.tier === 'Dream' ? 'rgba(236,72,153,0.12)' : college.tier === 'Safety' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: college.tier === 'Dream' ? '#EC4899' : college.tier === 'Safety' ? '#10B981' : '#F59E0B', border: `1px solid ${college.tier === 'Dream' ? 'rgba(236,72,153,0.3)' : college.tier === 'Safety' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                    {college.tier === 'Dream' ? '⭐ ' : college.tier === 'Safety' ? '✅ ' : '🎯 '}{college.tier}
                  </span>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                  {college.status}
                </span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg theme-text-muted hover:text-blue-400 hover:bg-blue-500/10 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => onDelete(college.id)} className="p-1.5 rounded-lg theme-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            {college.deadline && (
              <div className="flex items-center gap-1.5 text-xs theme-text-muted mb-2">
                <Calendar className="w-3 h-3" />Deadline: {new Date(college.deadline + 'T12:00:00').toLocaleDateString()}
              </div>
            )}
            {college.notes && <p className="text-xs theme-text-muted leading-relaxed line-clamp-2">{college.notes}</p>}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Task Item ─────────────────────────────────────────────────── */
function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all group ${task.done ? 'opacity-60' : ''}`}
      style={{ background: task.done ? 'rgba(16,185,129,0.04)' : 'var(--bg-elevated)', borderColor: task.done ? 'rgba(16,185,129,0.15)' : 'var(--border-color)' }}>
      <button onClick={() => onToggle(task.id)} className="flex-shrink-0 hover:scale-110 transition-all">
        {task.done ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5 theme-text-muted" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold theme-text truncate ${task.done ? 'line-through opacity-60' : ''}`}>{task.name}</p>
        {task.category && <p className="text-xs theme-text-muted">{task.category}</p>}
      </div>
      {task.dueDate && (
        <span className="text-xs theme-text-muted flex-shrink-0 flex items-center gap-1">
          <Calendar className="w-3 h-3" />{new Date(task.dueDate + 'T12:00:00').toLocaleDateString()}
        </span>
      )}
      <button onClick={() => onDelete(task.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 theme-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────── */
export default function CollegeAI() {
  const [activeTab, setActiveTab] = useState('list');
  const [colleges, setColleges] = useState(() => {
    try { return JSON.parse(localStorage.getItem('malum_colleges') || '[]'); } catch { return []; }
  });
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('malum_app_tasks') || '[]'); } catch { return []; }
  });
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `# 🎓 Welcome to Malum College AI!\n\nI'm your personal college application advisor. Here's how I can help:\n\n- ✍️ **Essay Studio** — Write, improve, and grade your essays with AI (see the Essay tab!)\n- 🏫 **College research** — Ask about any school's culture, requirements, or fit\n- 📊 **Chance evaluation** — Tell me your GPA, test scores, and I'll advise\n- 📋 **Application strategy** — Building your school list, timeline, and priorities\n- 🎤 **Interview prep** — Practice common admissions questions\n\nWhat would you like help with?`
  }]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [showAddCollege, setShowAddCollege] = useState(false);
  const [collegeForm, setCollegeForm] = useState({ name: '', tier: 'Target', status: 'Not Started', deadline: '', notes: '' });
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskForm, setTaskForm] = useState({ name: '', category: 'Common App Essay', dueDate: '' });

  useEffect(() => { localStorage.setItem('malum_colleges', JSON.stringify(colleges)); }, [colleges]);
  useEffect(() => { localStorage.setItem('malum_app_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const addCollege = (e) => {
    e.preventDefault();
    if (!collegeForm.name.trim()) return;
    setColleges([...colleges, { id: Date.now().toString(), ...collegeForm }]);
    setCollegeForm({ name: '', tier: 'Target', status: 'Not Started', deadline: '', notes: '' });
    setShowAddCollege(false);
  };
  const deleteCollege = id => setColleges(colleges.filter(c => c.id !== id));
  const updateCollege = updated => setColleges(colleges.map(c => c.id === updated.id ? updated : c));
  const addTask = (e) => {
    e.preventDefault();
    if (!taskForm.name.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), done: false, ...taskForm }]);
    setTaskForm({ name: '', category: 'Common App Essay', dueDate: '' });
    setShowAddTask(false);
  };
  const toggleTask = id => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = id => setTasks(tasks.filter(t => t.id !== id));

  const sendMessage = async () => {
    if (!prompt.trim() || loading) return;
    const userMsg = prompt.trim(); setPrompt('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch(`${API_ROOT}/api/study`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: `You are an expert college counselor with deep knowledge of US college admissions. Respond helpfully and specifically to: ${userMsg}` }) });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.result || 'No response.' }]);
    } catch { setMessages(prev => [...prev, { role: 'system', content: 'Error: Could not reach AI.' }]); }
    setLoading(false);
  };

  const tabs = [
    { id: 'list',      icon: BookOpen,    label: 'College List'  },
    { id: 'checklist', icon: CheckCircle2, label: 'Checklist'    },
    { id: 'essay',     icon: Eye,         label: '✦ Essay Studio' },
    { id: 'ai',        icon: Brain,       label: 'AI Advisor'    },
  ];

  const stats = {
    total: colleges.length,
    dream: colleges.filter(c => c.tier === 'Dream').length,
    target: colleges.filter(c => c.tier === 'Target').length,
    safety: colleges.filter(c => c.tier === 'Safety').length,
    accepted: colleges.filter(c => c.status === 'Accepted').length,
    tasksDone: tasks.filter(t => t.done).length,
  };

  const quickPrompts = [
    '✍️ Help me brainstorm a Common App essay topic',
    '📊 Evaluate my chances at MIT (3.9 GPA, 1520 SAT)',
    '🏫 What makes Stanford different from Harvard?',
    '🎤 Give me 5 common college interview questions',
  ];

  return (
    <div className="min-h-screen theme-bg theme-text">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-[500px] h-[500px] rounded-full -top-20 -right-20" style={{ background: 'radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full bottom-0 -left-20" style={{ background: 'radial-gradient(circle,rgba(236,72,153,0.05) 0%,transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6 md:p-10 space-y-6">
        {/* Header */}
        <header className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 0 30px rgba(139,92,246,0.5)' }}>
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black malum-text-gradient">College AI</h1>
            <p className="text-sm theme-text-secondary font-medium">Track, write, and perfect your college applications</p>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: 'Total', value: stats.total, color: '#8B5CF6' },
            { label: 'Dream', value: stats.dream, color: '#EC4899' },
            { label: 'Target', value: stats.target, color: '#F59E0B' },
            { label: 'Safety', value: stats.safety, color: '#10B981' },
            { label: 'Accepted', value: stats.accepted, color: '#10B981' },
            { label: 'Tasks Done', value: `${stats.tasksDone}/${tasks.length}`, color: '#3B82F6' },
          ].map((s, i) => (
            <div key={i} className="theme-bg-elevated border theme-border rounded-xl p-3 text-center">
              <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] font-bold theme-text-muted uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl theme-bg-elevated border theme-border overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-black transition-all whitespace-nowrap min-w-fit"
              style={{
                background: activeTab === tab.id ? 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(99,102,241,0.08))' : 'transparent',
                color: activeTab === tab.id ? '#8B5CF6' : 'var(--text-secondary)',
                boxShadow: activeTab === tab.id ? 'inset 0 0 0 1px rgba(139,92,246,0.3)' : 'none',
              }}>
              <tab.icon className="w-4 h-4" /><span className="hidden sm:inline">{tab.label}</span><span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* ── COLLEGE LIST ── */}
        {activeTab === 'list' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-black theme-text flex items-center gap-2"><BookOpen className="w-5 h-5 text-purple-400" />My College List</h2>
              <button onClick={() => setShowAddCollege(!showAddCollege)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(99,102,241,0.08))', border: '1px solid rgba(139,92,246,0.3)', color: '#8B5CF6' }}>
                {showAddCollege ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showAddCollege ? 'Cancel' : 'Add College'}
              </button>
            </div>
            {showAddCollege && (
              <form onSubmit={addCollege} className="rounded-2xl p-5 space-y-3" style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(139,92,246,0.2)', animation: 'slideDown 0.25s ease' }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input value={collegeForm.name} onChange={e => setCollegeForm({ ...collegeForm, name: e.target.value })} placeholder="College/University name *" required
                    className="sm:col-span-3 px-4 py-2.5 rounded-xl theme-bg border theme-border theme-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30" />
                  <select value={collegeForm.tier} onChange={e => setCollegeForm({ ...collegeForm, tier: e.target.value })}
                    className="px-3 py-2.5 rounded-xl theme-bg border theme-border theme-text text-sm font-semibold focus:outline-none">
                    {['Dream', 'Target', 'Safety'].map(t => <option key={t}>{t}</option>)}
                  </select>
                  <select value={collegeForm.status} onChange={e => setCollegeForm({ ...collegeForm, status: e.target.value })}
                    className="px-3 py-2.5 rounded-xl theme-bg border theme-border theme-text text-sm font-semibold focus:outline-none">
                    {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
                  </select>
                  <input type="date" value={collegeForm.deadline} onChange={e => setCollegeForm({ ...collegeForm, deadline: e.target.value })}
                    className="px-3 py-2.5 rounded-xl theme-bg border theme-border theme-text text-sm focus:outline-none" />
                </div>
                <textarea value={collegeForm.notes} onChange={e => setCollegeForm({ ...collegeForm, notes: e.target.value })} placeholder="Notes (optional)" rows={2}
                  className="w-full px-4 py-2.5 rounded-xl theme-bg border theme-border theme-text text-sm focus:outline-none resize-none" />
                <button type="submit" className="w-full py-3 rounded-xl text-white font-black text-sm"
                  style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 20px rgba(139,92,246,0.4)' }}>Add to List</button>
              </form>
            )}
            {colleges.length === 0 ? (
              <div className="text-center py-16 rounded-3xl theme-bg-elevated border theme-border">
                <GraduationCap className="w-12 h-12 mx-auto text-purple-500/40 mb-4" />
                <h3 className="font-bold theme-text mb-2">No colleges added yet</h3>
                <p className="text-sm theme-text-muted">Add your dream, target, and safety schools.</p>
              </div>
            ) : (
              <>
                {['Dream', 'Target', 'Safety'].map(tier => {
                  const tc = colleges.filter(c => c.tier === tier);
                  if (!tc.length) return null;
                  const colors = { Dream: '#EC4899', Target: '#F59E0B', Safety: '#10B981' };
                  return (
                    <div key={tier} className="space-y-3">
                      <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: colors[tier] }}>
                        {tier === 'Dream' ? '⭐' : tier === 'Target' ? '🎯' : '✅'} {tier} Schools — {tc.length}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {tc.map(c => <CollegeCard key={c.id} college={c} onUpdate={updateCollege} onDelete={deleteCollege} />)}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ── CHECKLIST ── */}
        {activeTab === 'checklist' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-black theme-text flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-purple-400" />Application Checklist</h2>
              <button onClick={() => setShowAddTask(!showAddTask)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(99,102,241,0.08))', border: '1px solid rgba(139,92,246,0.3)', color: '#8B5CF6' }}>
                {showAddTask ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showAddTask ? 'Cancel' : 'Add Task'}
              </button>
            </div>
            {tasks.length > 0 && (
              <div className="theme-bg-elevated border theme-border rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black theme-text text-sm">Progress</span>
                  <span className="font-bold text-sm" style={{ color: stats.tasksDone === tasks.length ? '#10B981' : '#8B5CF6' }}>
                    {stats.tasksDone}/{tasks.length}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${tasks.length > 0 ? (stats.tasksDone / tasks.length) * 100 : 0}%`, background: 'linear-gradient(90deg,#8B5CF6,#EC4899)' }} />
                </div>
              </div>
            )}
            {showAddTask && (
              <form onSubmit={addTask} className="rounded-2xl p-5 space-y-3" style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(139,92,246,0.2)', animation: 'slideDown 0.25s ease' }}>
                <input value={taskForm.name} onChange={e => setTaskForm({ ...taskForm, name: e.target.value })} placeholder="Task name *" required
                  className="w-full px-4 py-2.5 rounded-xl theme-bg border theme-border theme-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30" />
                <div className="grid grid-cols-2 gap-3">
                  <select value={taskForm.category} onChange={e => setTaskForm({ ...taskForm, category: e.target.value })}
                    className="px-3 py-2.5 rounded-xl theme-bg border theme-border theme-text text-sm font-semibold focus:outline-none">
                    {TASK_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="px-3 py-2.5 rounded-xl theme-bg border theme-border theme-text text-sm focus:outline-none" />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl text-white font-black text-sm"
                  style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 16px rgba(139,92,246,0.4)' }}>Add Task</button>
              </form>
            )}
            {tasks.length === 0 && !showAddTask && (
              <div className="text-center py-8">
                <button onClick={() => {
                  const defaults = ['Common App Essay', 'Finalize college list', 'Request recommendation letters', 'Prepare SAT/ACT scores', 'FAFSA / Financial Aid form', 'School-specific supplemental essays', 'Gather official transcripts', 'Compile extracurricular list', 'Scholarship research', 'Submit applications']
                    .map((name, i) => ({ id: (Date.now() + i).toString(), name, category: TASK_CATEGORIES[Math.min(i, TASK_CATEGORIES.length - 1)], dueDate: '', done: false }));
                  setTasks(defaults);
                }} className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm mx-auto hover:scale-105 transition-all"
                  style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 16px rgba(139,92,246,0.4)' }}>
                  <Sparkles className="w-4 h-4" /> Load Default Checklist
                </button>
              </div>
            )}
            {tasks.length > 0 && (
              <div className="space-y-4">
                {TASK_CATEGORIES.map(cat => {
                  const catTasks = tasks.filter(t => t.category === cat);
                  if (!catTasks.length) return null;
                  return (
                    <div key={cat} className="space-y-2">
                      <p className="text-xs font-black uppercase tracking-wider theme-text-muted pl-1">{cat}</p>
                      {catTasks.map(t => <TaskItem key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} />)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ESSAY STUDIO ── */}
        {activeTab === 'essay' && <EssayStudio />}

        {/* ── AI ADVISOR ── */}
        {activeTab === 'ai' && (
          <div className="flex flex-col rounded-3xl overflow-hidden border theme-border" style={{ height: '65vh', background: 'var(--bg-elevated)' }}>
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: msg.role === 'user' ? '#7C3AED' : 'rgba(139,92,246,0.15)' }}>
                    {msg.role === 'user' ? <span className="text-white text-xs font-black">You</span> : <Brain className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div className="rounded-2xl p-4 max-w-[80%] text-sm font-medium leading-relaxed"
                    style={{ background: msg.role === 'user' ? '#7C3AED' : 'rgba(255,255,255,0.04)', border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.07)' : undefined, color: msg.role === 'user' ? 'white' : undefined }}>
                    {msg.role === 'assistant'
                      ? <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown></div>
                      : msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
                    <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm p-4 flex items-center gap-2 text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                    <span className="theme-text-secondary">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="px-5 py-2 flex gap-2 flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {quickPrompts.map((p, i) => (
                <button key={i} onClick={() => setPrompt(p.replace(/^[^\s]+\s/, ''))}
                  className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all hover:scale-105"
                  style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#A78BFA' }}>{p}</button>
              ))}
            </div>
            <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-end gap-2 rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,92,246,0.3)' }}>
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Ask your college counselor AI..."
                  className="flex-1 bg-transparent text-sm font-medium focus:outline-none resize-none py-2 px-2 theme-text" rows={1} disabled={loading} />
                <button onClick={sendMessage} disabled={!prompt.trim() || loading}
                  className="p-2.5 rounded-xl text-white transition-all hover:scale-110 disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 16px rgba(139,92,246,0.4)' }}>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

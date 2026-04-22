import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Sparkles, Brain, Loader2, ChevronRight, Zap,
  BookOpen, FlaskConical, Globe, Lightbulb, HelpCircle,
  MessageSquare, ChevronDown, ChevronUp, Copy, Check,
  ArrowRight, Star, History, X, RefreshCw, Atom
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const API_ROOT = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:5000';

/* ── Search result card ── */
function ResultCard({ result, query }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(result.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-color)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
    }}>
      {/* Top answer strip */}
      <div className="p-6 border-b theme-border" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))' }}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 0 16px rgba(99,102,241,0.5)' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider" style={{ color: '#818CF8' }}>Antigravity AI Answer</p>
              <p className="text-xs theme-text-muted">{result.mode === 'deep' ? 'Deep Research Mode' : 'Quick Answer'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
              style={{ background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.06)', color: copied ? '#10b981' : 'rgba(255,255,255,0.5)', border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
              {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
          </div>
        </div>

        <div className="prose prose-invert prose-sm max-w-none leading-relaxed" style={{ maxHeight: expanded ? 'none' : '280px', overflow: 'hidden' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
            {result.answer}
          </ReactMarkdown>
        </div>

        {result.answer.length > 800 && (
          <button onClick={() => setExpanded(!expanded)}
            className="mt-3 flex items-center gap-1.5 text-xs font-bold transition-all hover:scale-105"
            style={{ color: '#818CF8' }}>
            {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> Show more</>}
          </button>
        )}
      </div>

      {/* Follow-up actions */}
      {result.followUps && result.followUps.length > 0 && (
        <div className="p-4 space-y-2">
          <p className="text-xs font-black uppercase tracking-wider theme-text-muted mb-3">Related Questions</p>
          <div className="space-y-1.5">
            {result.followUps.map((q, i) => (
              <button key={i} onClick={() => result.onFollowUp(q)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all hover:scale-[1.01] group"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <ChevronRight className="w-4 h-4 flex-shrink-0 theme-text-muted group-hover:text-indigo-400 transition-colors" />
                <span className="theme-text-secondary group-hover:theme-text transition-colors">{q}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Search History Item ── */
function HistoryItem({ item, onClick, onDelete }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all hover:scale-[1.01] group"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <History className="w-4 h-4 theme-text-muted flex-shrink-0" />
      <span className="flex-1 min-w-0 text-sm font-medium theme-text-secondary group-hover:theme-text transition-colors truncate">{item.query}</span>
      <button onClick={e => { e.stopPropagation(); onDelete(item.id); }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 hover:text-red-400 theme-text-muted transition-all">
        <X className="w-3 h-3" />
      </button>
    </button>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────── */
export default function Antigravity() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [mode, setMode] = useState('quick'); // 'quick' | 'deep' | 'explain' | 'quiz'
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('malum_search_history') || '[]'); } catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef(null);
  const resultsEndRef = useRef(null);

  const modes = [
    { id: 'quick', icon: Zap, label: 'Quick', color: '#F59E0B', desc: 'Fast, concise answer' },
    { id: 'deep', icon: Brain, label: 'Deep Research', color: '#6366F1', desc: 'Multi-paragraph analysis' },
    { id: 'explain', icon: Lightbulb, label: 'Explain Simply', color: '#10B981', desc: 'Simple language' },
    { id: 'quiz', icon: HelpCircle, label: 'Quiz Me', color: '#EC4899', desc: 'Turn it into a quiz' },
  ];

  const suggestions = [
    { icon: Atom, text: 'How does quantum entanglement work?', color: '#6366F1' },
    { icon: BookOpen, text: 'Causes and effects of World War I', color: '#F59E0B' },
    { icon: FlaskConical, text: 'Explain CRISPR gene editing', color: '#10B981' },
    { icon: Globe, text: 'What is the prisoner\'s dilemma?', color: '#EC4899' },
    { icon: Brain, text: 'How does long-term memory work?', color: '#8B5CF6' },
    { icon: Star, text: 'Explain the Drake equation', color: '#F97316' },
  ];

  useEffect(() => {
    if (results.length > 0) resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [results]);

  const buildPrompt = (q, m) => {
    const prompts = {
      quick: `Answer the following question concisely but completely. Use markdown with headers, bold key terms, and bullet points where helpful. Be accurate and educational.\n\nQuestion: ${q}`,
      deep: `Perform a deep research analysis on the following topic. Write a comprehensive, multi-section response with:
- An executive summary
- Background/history
- Key concepts explained in depth
- Multiple perspectives or interpretations
- Real-world applications or examples
- Common misconceptions
- Conclusion

Use rich markdown formatting with headers, subheaders, bold, and lists.\n\nTopic: ${q}`,
      explain: `Explain the following concept as if talking to a curious 14-year-old. Use simple, everyday language, relatable analogies, and avoid jargon. Make it engaging and memorable. Use markdown.\n\nConcept: ${q}`,
      quiz: `Create an educational quiz about the following topic. Include:
1. A brief explanation of the topic (2-3 sentences)
2. 5 multiple choice questions with 4 options each
3. Answers clearly marked with ✓
4. A brief explanation for each answer

Format in clean markdown.\n\nTopic: ${q}`,
    };
    return prompts[m] || prompts.quick;
  };

  const generateFollowUps = (q, answer) => {
    // Simple heuristic follow-ups based on query type
    return [
      `What are the real-world applications of ${q}?`,
      `How does ${q} relate to everyday life?`,
      `What are common misconceptions about ${q}?`,
    ];
  };

  const search = async (searchQuery = query, searchMode = mode) => {
    if (!searchQuery.trim() || loading) return;
    const q = searchQuery.trim();
    setLoading(true);
    setShowHistory(false);

    // Add to history
    const newHistory = [{ id: Date.now().toString(), query: q, mode: searchMode }, ...history.filter(h => h.query !== q)].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('malum_search_history', JSON.stringify(newHistory));

    try {
      const res = await fetch(`${API_ROOT}/api/study`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: buildPrompt(q, searchMode) })
      });
      const data = await res.json();
      const answer = data.result || 'No answer generated.';

      const newResult = {
        id: Date.now().toString(),
        query: q,
        mode: searchMode,
        answer,
        followUps: generateFollowUps(q, answer),
        onFollowUp: (followQ) => { setQuery(followQ); search(followQ, searchMode); },
      };
      setResults(prev => [newResult, ...prev]);
    } catch {
      setResults(prev => [{
        id: Date.now().toString(),
        query: q,
        mode: searchMode,
        answer: '❌ Could not reach the AI backend. Please make sure the server is running on port 5000.',
        followUps: [],
        onFollowUp: () => { },
      }, ...prev]);
    }
    setLoading(false);
  };

  const clearResults = () => setResults([]);
  const deleteHistory = (id) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('malum_search_history', JSON.stringify(updated));
  };

  const isFirstSearch = results.length === 0 && !loading;

  return (
    <div className="min-h-screen theme-bg theme-text overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[700px] h-[700px] rounded-full -top-40 -left-40"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute w-[500px] h-[500px] rounded-full -bottom-20 -right-20"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* ── Hero ── */}
        {isFirstSearch && (
          <div className="text-center space-y-4 pt-12 pb-6" style={{ animation: 'fadeInUp 0.5s ease' }}>
            <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 0 50px rgba(99,102,241,0.5)' }}>
              <Atom className="w-10 h-10 text-white" style={{ animation: 'spin-slow 8s linear infinite' }} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black malum-text-gradient mb-2">Antigravity</h1>
              <p className="theme-text-secondary font-medium text-base">AI-powered search built for students. Ask anything.</p>
            </div>
          </div>
        )}

        {/* ── Search Bar ── */}
        <div className="space-y-3">
          {/* Mode selector */}
          <div className="flex gap-2 flex-wrap">
            {modes.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all hover:scale-105"
                style={{
                  background: mode === m.id ? `${m.color}18` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${mode === m.id ? m.color + '40' : 'rgba(255,255,255,0.08)'}`,
                  color: mode === m.id ? m.color : 'rgba(255,255,255,0.45)',
                  boxShadow: mode === m.id ? `0 0 12px ${m.color}25` : 'none',
                }}>
                <m.icon className="w-3.5 h-3.5" />
                {m.label}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative">
            <div className="flex items-center gap-3 rounded-2xl p-3 transition-all"
              style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(99,102,241,0.4)', boxShadow: '0 0 30px rgba(99,102,241,0.12)' }}>
              <Search className="w-5 h-5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setShowHistory(e.target.value.length === 0 && history.length > 0); }}
                onFocus={() => setShowHistory(query.length === 0 && history.length > 0)}
                onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                onKeyDown={e => { if (e.key === 'Enter') search(); if (e.key === 'Escape') setShowHistory(false); }}
                placeholder={`Search with ${modes.find(m2 => m2.id === mode)?.label}...`}
                className="flex-1 bg-transparent text-sm font-medium focus:outline-none theme-text"
                style={{ caretColor: '#6366F1' }}
              />
              {query && (
                <button onClick={() => { setQuery(''); setShowHistory(false); inputRef.current?.focus(); }}
                  className="p-1 rounded-lg theme-text-muted hover:theme-text transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => search()} disabled={!query.trim() || loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-black text-sm transition-all hover:scale-105 disabled:opacity-40 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 4px 16px rgba(99,102,241,0.45)' }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>

            {/* History dropdown */}
            {showHistory && history.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl p-3 space-y-1.5 z-20"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', boxShadow: '0 16px 40px rgba(0,0,0,0.3)', animation: 'slideDown 0.2s ease' }}>
                <div className="flex items-center justify-between px-2 mb-2">
                  <p className="text-xs font-black uppercase tracking-wider theme-text-muted">Recent Searches</p>
                  <button onClick={() => { setHistory([]); localStorage.removeItem('malum_search_history'); setShowHistory(false); }}
                    className="text-xs font-bold theme-text-muted hover:text-red-400 transition-colors">Clear all</button>
                </div>
                {history.slice(0, 6).map(item => (
                  <HistoryItem key={item.id} item={item} onClick={() => { setQuery(item.query); search(item.query, item.mode); }} onDelete={deleteHistory} />
                ))}
              </div>
            )}
          </div>

          {/* Quick mode description */}
          <p className="text-xs theme-text-muted text-center">
            {modes.find(m => m.id === mode)?.desc}
          </p>
        </div>

        {/* ── Suggestions (only on empty state) ── */}
        {isFirstSearch && (
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-wider text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>Try asking</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => { setQuery(s.text); search(s.text, mode); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:scale-[1.02] group"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', animation: `fadeInUp 0.4s ease ${0.05 * i}s both` }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}15` }}>
                    <s.icon className="w-4 h-4" style={{ color: s.color }} />
                  </div>
                  <span className="text-sm font-medium theme-text-secondary group-hover:theme-text transition-colors flex-1 min-w-0 leading-tight">{s.text}</span>
                  <ArrowRight className="w-4 h-4 theme-text-muted opacity-0 group-hover:opacity-100 flex-shrink-0 transition-all group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="rounded-2xl p-8 text-center space-y-4" style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(99,102,241,0.25)', animation: 'fadeIn 0.3s ease' }}>
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              <div className="absolute inset-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <div>
              <p className="font-black theme-text text-base">
                {mode === 'deep' ? '🔬 Performing deep research...' :
                  mode === 'quiz' ? '🎯 Building your quiz...' :
                    mode === 'explain' ? '💡 Simplifying the concept...' :
                      '⚡ Finding your answer...'}
              </p>
              <p className="text-sm theme-text-muted mt-1">Gemini AI is analyzing "{query}"</p>
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {results.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black theme-text">{results.length} result{results.length !== 1 ? 's' : ''}</p>
              <button onClick={clearResults} className="flex items-center gap-1.5 text-xs font-bold theme-text-muted hover:text-red-400 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Clear results
              </button>
            </div>
            {results.map(result => (
              <ResultCard key={result.id} result={result} query={result.query} />
            ))}
            <div ref={resultsEndRef} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>
    </div>
  );
}

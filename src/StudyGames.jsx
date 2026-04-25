import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Gamepad2, Zap, Brain, TextCursorInput, Layers, Trophy, Star,
  RotateCcw, ChevronRight, Clock, Target, Flame, Check, X as XIcon,
  Sparkles, Loader2, ArrowRight, Play, SkipForward, FileText as FileIcon,
  Youtube, Gamepad, Lock, Unlock, Monitor
} from 'lucide-react';

const API_ROOT = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:5000';

/* ════════════════════════════════════════════════════════════════
   GAME 1 — Speed Math
═══════════════════════════════════════════════════════════════════ */
function SpeedMath() {
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState(null);
  const [input, setInput] = useState('');
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [difficulty, setDifficulty] = useState('medium');
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('malum_math_hs') || '0'));
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const difficulties = {
    easy:   { ops: ['+', '-'], max: 12, label: '😊 Easy' },
    medium: { ops: ['+', '-', '×'], max: 20, label: '🤔 Medium' },
    hard:   { ops: ['+', '-', '×', '÷'], max: 50, label: '🔥 Hard' },
  };

  const genQuestion = useCallback(() => {
    const cfg = difficulties[difficulty];
    const op = cfg.ops[Math.floor(Math.random() * cfg.ops.length)];
    let a = Math.floor(Math.random() * cfg.max) + 1;
    let b = Math.floor(Math.random() * cfg.max) + 1;
    let answer;
    if (op === '+') answer = a + b;
    else if (op === '-') { if (a < b) [a, b] = [b, a]; answer = a - b; }
    else if (op === '×') answer = a * b;
    else { b = Math.floor(Math.random() * 10) + 1; a = b * (Math.floor(Math.random() * 10) + 1); answer = a / b; }
    setQuestion({ text: `${a} ${op} ${b}`, answer });
    setInput('');
    setFeedback(null);
  }, [difficulty]);

  const startGame = () => {
    setScore(0); setStreak(0); setTimeLeft(60); setRunning(true);
    genQuestion();
    timerRef.current = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { clearInterval(timerRef.current); setRunning(false); return 0; }
      return t - 1;
    }), 1000);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  useEffect(() => {
    if (!running && score > 0) {
      if (score > highScore) { setHighScore(score); localStorage.setItem('malum_math_hs', String(score)); }
    }
  }, [running]);

  const submit = () => {
    if (!running || !question || input === '') return;
    const correct = parseFloat(input) === question.answer;
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      const pts = 10 + streak * 2;
      setScore(s => s + pts);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
    setTimeout(genQuestion, 300);
  };

  const timerColor = timeLeft > 30 ? '#10B981' : timeLeft > 10 ? '#F59E0B' : '#EF4444';

  return (
    <div className="space-y-5">
      {!running && timeLeft === 60 && (
        <div className="text-center space-y-4 pb-2">
          <div className="flex gap-2 justify-center flex-wrap">
            {Object.entries(difficulties).map(([key, cfg]) => (
              <button key={key} onClick={() => setDifficulty(key)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{
                  background: difficulty === key ? 'linear-gradient(135deg, #F97316, #EF4444)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${difficulty === key ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  color: difficulty === key ? 'white' : 'rgba(255,255,255,0.6)',
                }}>
                {cfg.label}
              </button>
            ))}
          </div>
          <button onClick={startGame}
            className="flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-black text-lg mx-auto transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #F97316, #EF4444)', boxShadow: '0 0 30px rgba(249,115,22,0.5)' }}>
            <Play className="w-6 h-6 fill-white" /> Start Game
          </button>
          {highScore > 0 && <p className="text-sm theme-text-muted">🏆 High Score: <span className="font-black text-amber-400">{highScore}</span></p>}
        </div>
      )}

      {running && question && (
        <div className="space-y-5">
          {/* HUD */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-black text-orange-400">{score} pts</div>
              {streak > 1 && <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}><Flame className="w-3.5 h-3.5" />×{streak}</div>}
            </div>
            <div className="text-3xl font-black font-mono" style={{ color: timerColor, textShadow: `0 0 15px ${timerColor}60` }}>{timeLeft}s</div>
          </div>
          {/* Progress */}
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(timeLeft / 60) * 100}%`, background: `linear-gradient(90deg, ${timerColor}, ${timerColor}80)` }} />
          </div>
          {/* Question */}
          <div className={`rounded-2xl py-10 text-center transition-all duration-200 ${feedback === 'correct' ? 'scale-105' : feedback === 'wrong' ? 'scale-95' : ''}`}
            style={{
              background: feedback === 'correct' ? 'rgba(16,185,129,0.15)' : feedback === 'wrong' ? 'rgba(239,68,68,0.12)' : 'var(--bg-elevated)',
              border: `2px solid ${feedback === 'correct' ? 'rgba(16,185,129,0.4)' : feedback === 'wrong' ? 'rgba(239,68,68,0.35)' : 'rgba(249,115,22,0.3)'}`,
              boxShadow: feedback === 'correct' ? '0 0 30px rgba(16,185,129,0.3)' : 'none',
            }}>
            <p className="text-5xl font-black theme-text tracking-tight">{question.text} = ?</p>
            {streak >= 3 && <p className="text-xs mt-2 font-bold" style={{ color: '#F97316' }}>🔥 {streak} in a row! +{streak * 2} bonus pts each</p>}
          </div>
          {/* Input */}
          <div className="flex gap-2">
            <input ref={inputRef} type="number" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              className="flex-1 px-5 py-4 rounded-2xl text-2xl font-black text-center focus:outline-none theme-text"
              style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(249,115,22,0.35)', caretColor: '#F97316' }}
              placeholder="?" autoFocus />
            <button onClick={submit} className="px-6 py-4 rounded-2xl text-white font-black transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #F97316, #EF4444)' }}>
              <Check className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {!running && timeLeft === 0 && (
        <div className="text-center space-y-4 py-4">
          <div className="text-6xl font-black" style={{ color: '#F97316' }}>{score}</div>
          <p className="font-black theme-text text-xl">Time's Up!</p>
          {score >= highScore && score > 0 && <p className="text-emerald-400 font-bold">🎉 New High Score!</p>}
          <p className="text-sm theme-text-muted">Streak ended at ×{streak}</p>
          <button onClick={() => { setTimeLeft(60); setScore(0); setStreak(0); setRunning(false); setQuestion(null); setFeedback(null); }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold mx-auto hover:scale-105 transition-all"
            style={{ background: 'linear-gradient(135deg, #F97316, #EF4444)', boxShadow: '0 0 20px rgba(249,115,22,0.4)' }}>
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   GAME 2 — Word Scramble
═══════════════════════════════════════════════════════════════════ */
const WORD_BANK = [
  { word: 'MITOSIS', hint: 'Cell division producing identical cells' },
  { word: 'PHOTOSYNTHESIS', hint: 'Plants converting sunlight to energy' },
  { word: 'ALGORITHM', hint: 'Step-by-step problem-solving procedure' },
  { word: 'DEMOCRACY', hint: 'Government by the people' },
  { word: 'METAPHOR', hint: 'Literary comparison without like/as' },
  { word: 'RENAISSANCE', hint: '14th–17th century cultural rebirth' },
  { word: 'HYPOTHESIS', hint: 'Testable scientific prediction' },
  { word: 'OSMOSIS', hint: 'Water movement across membranes' },
  { word: 'LONGITUDE', hint: 'East-west geographic coordinate' },
  { word: 'CATALYST', hint: 'Substance that speeds up a reaction' },
  { word: 'PYTHAGOREAN', hint: 'a² + b² = c² theorem' },
  { word: 'EVOLUTION', hint: 'Change in species over time' },
  { word: 'ALLITERATION', hint: 'Repeating consonant sounds' },
  { word: 'GRAVITATIONAL', hint: 'Relating to the force of attraction' },
  { word: 'CHROMOSOME', hint: 'DNA-containing structure in nuclei' },
];

function scramble(word) {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const result = arr.join('');
  return result === word ? scramble(word) : result;
}

function WordScramble() {
  const [wordIndex, setWordIndex] = useState(() => Math.floor(Math.random() * WORD_BANK.length));
  const [scrambled, setScrambled] = useState('');
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('malum_scramble_hs') || '0'));
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const loadWord = useCallback((idx) => {
    const w = WORD_BANK[idx % WORD_BANK.length];
    setScrambled(scramble(w.word));
    setInput(''); setFeedback(null); setShowHint(false);
  }, []);

  const startGame = () => {
    const idx = Math.floor(Math.random() * WORD_BANK.length);
    setWordIndex(idx); setScore(0); setStreak(0); setTimeLeft(45);
    setRunning(true); setGameOver(false); loadWord(idx);
    timerRef.current = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { clearInterval(timerRef.current); setRunning(false); setGameOver(true); return 0; }
      return t - 1;
    }), 1000);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  useEffect(() => {
    if (gameOver && score > highScore) { setHighScore(score); localStorage.setItem('malum_scramble_hs', String(score)); }
  }, [gameOver]);

  const nextWord = () => {
    const idx = (wordIndex + 1) % WORD_BANK.length;
    setWordIndex(idx); loadWord(idx);
    setTimeLeft(t => Math.min(t + 10, 45));
  };

  const check = () => {
    if (!running) return;
    const current = WORD_BANK[wordIndex % WORD_BANK.length];
    if (input.toUpperCase() === current.word) {
      const pts = 100 + streak * 20 - (showHint ? 30 : 0);
      setScore(s => s + Math.max(pts, 10));
      setStreak(s => s + 1);
      setFeedback('correct');
      setTimeout(nextWord, 600);
    } else {
      setStreak(0);
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 600);
    }
  };

  const current = WORD_BANK[wordIndex % WORD_BANK.length];

  return (
    <div className="space-y-5">
      {!running && !gameOver && (
        <div className="text-center space-y-4 pb-2">
          <p className="text-sm theme-text-muted max-w-sm mx-auto">Unscramble academic vocabulary words. Hints cost -30pts. Each correct answer adds +10s.</p>
          {highScore > 0 && <p className="text-sm theme-text-muted">🏆 High Score: <span className="font-black text-amber-400">{highScore}</span></p>}
          <button onClick={startGame}
            className="flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-black text-lg mx-auto hover:scale-105 transition-all"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', boxShadow: '0 0 30px rgba(59,130,246,0.5)' }}>
            <Play className="w-6 h-6 fill-white" /> Start Game
          </button>
        </div>
      )}

      {running && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-black text-blue-400">{score} pts</div>
            {streak > 1 && <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black" style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.3)' }}><Flame className="w-3.5 h-3.5" />×{streak}</div>}
            <div className="text-3xl font-black font-mono" style={{ color: timeLeft > 20 ? '#10B981' : timeLeft > 10 ? '#F59E0B' : '#EF4444' }}>{timeLeft}s</div>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full transition-all duration-1000 rounded-full" style={{ width: `${(timeLeft / 45) * 100}%`, background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)' }} />
          </div>
          {/* Scrambled word */}
          <div className={`rounded-2xl py-10 text-center relative transition-all duration-200 ${feedback === 'correct' ? 'scale-105' : feedback === 'wrong' ? 'scale-95' : ''}`}
            style={{
              background: feedback === 'correct' ? 'rgba(16,185,129,0.15)' : feedback === 'wrong' ? 'rgba(239,68,68,0.1)' : 'var(--bg-elevated)',
              border: `2px solid ${feedback === 'correct' ? 'rgba(16,185,129,0.4)' : feedback === 'wrong' ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.25)'}`,
            }}>
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Unscramble this word</p>
            <div className="flex justify-center gap-2 flex-wrap px-4">
              {scrambled.split('').map((ch, i) => (
                <div key={i} className="w-10 h-12 rounded-xl flex items-center justify-center text-xl font-black"
                  style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#93C5FD' }}>
                  {ch}
                </div>
              ))}
            </div>
            {showHint && <p className="text-sm mt-4 font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>💡 {current.hint}</p>}
          </div>
          {/* Controls */}
          <div className="flex gap-2">
            <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && check()}
              className="flex-1 px-5 py-4 rounded-2xl text-xl font-black text-center uppercase focus:outline-none theme-text tracking-widest"
              style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(59,130,246,0.35)', caretColor: '#3B82F6' }}
              placeholder="TYPE HERE" maxLength={20} />
            <button onClick={check} className="px-5 py-4 rounded-2xl text-white font-black hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}><Check className="w-5 h-5" /></button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowHint(true)} disabled={showHint}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-40"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }}>
              💡 Hint (-30pts)
            </button>
            <button onClick={nextWord} className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
              <span className="flex items-center justify-center gap-1"><SkipForward className="w-4 h-4" /> Skip</span>
            </button>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="text-center space-y-4 py-4">
          <div className="text-6xl font-black" style={{ color: '#3B82F6' }}>{score}</div>
          <p className="font-black theme-text text-xl">Time's Up!</p>
          {score >= highScore && score > 0 && <p className="text-emerald-400 font-bold">🎉 New High Score!</p>}
          <button onClick={startGame} className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold mx-auto hover:scale-105 transition-all"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', boxShadow: '0 0 20px rgba(59,130,246,0.4)' }}>
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   GAME 3 — AI Trivia
═══════════════════════════════════════════════════════════════════ */
function AITrivia() {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef(null);

  const suggestedTopics = ['World History', 'Biology', 'Chemistry', 'Math', 'Literature', 'Geography', 'Physics', 'Computer Science'];

  const generateQuiz = async (t = topic) => {
    if (!t.trim()) return;
    setLoading(true); setQuestions([]); setCurrent(0); setSelected(null); setScore(0); setDone(false); setTimedOut(false);
    try {
      const res = await fetch(`${API_ROOT}/api/study`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Create 8 trivia questions about "${t}" for a student quiz game. Return ONLY a JSON array (no extra text):
[{
  "question": "Question text",
  "options": ["A", "B", "C", "D"],
  "correct": 0,
  "fact": "One interesting fact about the answer in 1 sentence"
}]
Make questions educational, varied in difficulty, and ensure options are clearly distinct.`
        })
      });
      const data = await res.json();
      const raw = (data.result || '').replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(raw);
      setQuestions(parsed);
      startTimer();
    } catch { setQuestions([]); }
    setLoading(false);
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    setTimeLeft(15);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setTimedOut(true); setSelected(-1); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const answer = (idx) => {
    if (selected !== null) return;
    clearInterval(timerRef.current);
    setSelected(idx);
    setTimedOut(false);
    if (idx === questions[current]?.correct) setScore(s => s + 1);
  };

  const next = () => {
    if (current + 1 >= questions.length) { setDone(true); clearInterval(timerRef.current); return; }
    setCurrent(c => c + 1); setSelected(null); setTimedOut(false);
    startTimer();
  };

  const q = questions[current];
  const timerColor = timeLeft > 8 ? '#10B981' : timeLeft > 4 ? '#F59E0B' : '#EF4444';

  return (
    <div className="space-y-5">
      {!loading && questions.length === 0 && !done && (
        <div className="space-y-4">
          <p className="text-sm theme-text-muted text-center">Enter any topic and Gemini AI will generate 8 trivia questions instantly.</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {suggestedTopics.map(t => (
              <button key={t} onClick={() => { setTopic(t); generateQuiz(t); }}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#34D399' }}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && generateQuiz()}
              placeholder="Enter any topic for trivia..."
              className="flex-1 px-4 py-3 rounded-xl theme-bg border theme-border theme-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            <button onClick={() => generateQuiz()} disabled={!topic.trim()}
              className="px-5 py-3 rounded-xl text-white font-black text-sm hover:scale-105 transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)', boxShadow: '0 4px 16px rgba(16,185,129,0.4)' }}>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-12 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center animate-bounce"
            style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)', boxShadow: '0 0 25px rgba(16,185,129,0.5)' }}>
            <Brain className="w-7 h-7 text-white" />
          </div>
          <p className="font-black theme-text">Generating {topic} trivia...</p>
          <p className="text-sm theme-text-muted">Gemini AI is crafting 8 questions for you</p>
        </div>
      )}

      {!loading && questions.length > 0 && !done && q && (
        <div className="space-y-4">
          {/* HUD */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-black theme-text-muted">{current + 1} / {questions.length}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-emerald-400">Score: {score}/{current + (selected !== null ? 1 : 0)}</span>
              <div className="text-xl font-black font-mono" style={{ color: timerColor, textShadow: `0 0 10px ${timerColor}60` }}>{timeLeft}s</div>
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${((current) / questions.length) * 100}%`, background: 'linear-gradient(90deg, #10B981, #3B82F6)' }} />
          </div>
          {/* Timer bar */}
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(timeLeft / 15) * 100}%`, background: timerColor }} />
          </div>

          {/* Question */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <p className="font-black theme-text text-base leading-relaxed">{q.question}</p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {q.options.map((opt, i) => {
              let bg = 'var(--bg-elevated)', border = 'var(--border-color)', color = 'var(--text-primary)';
              if (selected !== null || timedOut) {
                if (i === q.correct) { bg = 'rgba(16,185,129,0.15)'; border = 'rgba(16,185,129,0.4)'; color = '#34D399'; }
                else if (i === selected && selected !== q.correct) { bg = 'rgba(239,68,68,0.12)'; border = 'rgba(239,68,68,0.3)'; color = '#F87171'; }
                else { color = 'rgba(255,255,255,0.3)'; }
              }
              return (
                <button key={i} onClick={() => answer(i)} disabled={selected !== null || timedOut}
                  className="px-4 py-3.5 rounded-xl text-sm font-semibold text-left transition-all hover:scale-[1.01] disabled:cursor-default flex items-center gap-3"
                  style={{ background: bg, border: `1px solid ${border}`, color }}>
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black" style={{ background: 'rgba(255,255,255,0.08)' }}>{['A','B','C','D'][i]}</span>
                  {opt}
                  {(selected !== null || timedOut) && i === q.correct && <Check className="w-4 h-4 ml-auto flex-shrink-0 text-emerald-400" />}
                  {selected !== null && i === selected && selected !== q.correct && <XIcon className="w-4 h-4 ml-auto flex-shrink-0 text-red-400" />}
                </button>
              );
            })}
          </div>

          {(selected !== null || timedOut) && (
            <div className="space-y-3">
              {q.fact && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <p className="text-xs font-black text-indigo-400 mb-1">💡 Did you know?</p>
                  <p className="text-sm theme-text-secondary">{q.fact}</p>
                </div>
              )}
              {timedOut && <p className="text-center text-sm font-bold text-amber-400">⏱ Time ran out! The answer was <span className="text-emerald-400">{q.options[q.correct]}</span></p>}
              <button onClick={next} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-black hover:scale-[1.01] transition-all"
                style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)', boxShadow: '0 4px 16px rgba(16,185,129,0.35)' }}>
                {current + 1 >= questions.length ? '🏁 See Results' : <>Next Question <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          )}
        </div>
      )}

      {done && (
        <div className="text-center space-y-5 py-4">
          <div className="text-7xl font-black" style={{ color: score >= questions.length * 0.8 ? '#10B981' : score >= questions.length * 0.5 ? '#F59E0B' : '#EF4444' }}>
            {score}/{questions.length}
          </div>
          <p className="font-black theme-text text-xl">
            {score === questions.length ? '🎉 Perfect Score!' : score >= questions.length * 0.8 ? '⭐ Excellent!' : score >= questions.length * 0.5 ? '👍 Good job!' : '📚 Keep studying!'}
          </p>
          <p className="text-sm theme-text-muted">Topic: <span className="font-bold theme-text">{topic}</span></p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => generateQuiz()} className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)', boxShadow: '0 0 20px rgba(16,185,129,0.4)' }}>
              <RotateCcw className="w-4 h-4" /> Retry Same Topic
            </button>
            <button onClick={() => { setQuestions([]); setTopic(''); setDone(false); }}
              className="px-6 py-3 rounded-xl text-sm font-bold hover:scale-105 transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
              New Topic
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   GAME 4 — Memory Match (Flashcard pairs)
═══════════════════════════════════════════════════════════════════ */
const MEMORY_SETS = [
  { id: 'elements', label: '⚗️ Elements', pairs: [['H', 'Hydrogen'], ['He', 'Helium'], ['Li', 'Lithium'], ['O', 'Oxygen'], ['N', 'Nitrogen'], ['C', 'Carbon'], ['Fe', 'Iron'], ['Au', 'Gold']] },
  { id: 'capitals', label: '🌍 Capitals', pairs: [['France', 'Paris'], ['Japan', 'Tokyo'], ['Brazil', 'Brasília'], ['Germany', 'Berlin'], ['India', 'New Delhi'], ['Egypt', 'Cairo'], ['Canada', 'Ottawa'], ['Australia', 'Canberra']] },
  { id: 'vocab', label: '📚 Vocab', pairs: [['Ephemeral', 'Short-lived'], ['Eloquent', 'Well-spoken'], ['Ubiquitous', 'Everywhere'], ['Benevolent', 'Kind'], ['Ambiguous', 'Unclear'], ['Diligent', 'Hardworking'], ['Resilient', 'Tough'], ['Pragmatic', 'Practical']] },
  { id: 'math', label: '📐 Math', pairs: [['π', '3.14159'], ['e', '2.71828'], ['sin(90°)', '1'], ['cos(0°)', '1'], ['√144', '12'], ['2¹⁰', '1024'], ['0!', '1'], ['log(100)', '2']] },
];

function MemoryMatch() {
  const [setId, setSetId] = useState('elements');
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const initGame = useCallback((sid = setId) => {
    const set = MEMORY_SETS.find(s => s.id === sid);
    const flat = set.pairs.flatMap(([a, b]) => [
      { id: `a-${a}`, text: a, pairKey: a },
      { id: `b-${a}`, text: b, pairKey: a },
    ]);
    // Shuffle
    for (let i = flat.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flat[i], flat[j]] = [flat[j], flat[i]];
    }
    setCards(flat); setFlipped([]); setMatched([]); setMoves(0); setGameOver(false);
    setStartTime(Date.now()); setElapsed(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
  }, [setId]);

  useEffect(() => { initGame(); return () => clearInterval(timerRef.current); }, []);

  useEffect(() => {
    if (cards.length > 0 && matched.length === cards.length / 2) {
      clearInterval(timerRef.current); setGameOver(true);
    }
  }, [matched, cards]);

  const flip = (card) => {
    if (flipped.length === 2 || flipped.find(c => c.id === card.id) || matched.includes(card.pairKey)) return;
    const newFlipped = [...flipped, card];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      if (newFlipped[0].pairKey === newFlipped[1].pairKey) {
        setMatched(m => [...m, newFlipped[0].pairKey]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  const isFlipped = (card) => flipped.find(c => c.id === card.id) || matched.includes(card.pairKey);
  const isMatched = (card) => matched.includes(card.pairKey);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-4">
      {/* Set selector */}
      <div className="flex gap-2 flex-wrap">
        {MEMORY_SETS.map(s => (
          <button key={s.id} onClick={() => { setSetId(s.id); initGame(s.id); }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
            style={{
              background: setId === s.id ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${setId === s.id ? 'rgba(236,72,153,0.4)' : 'rgba(255,255,255,0.1)'}`,
              color: setId === s.id ? '#EC4899' : 'rgba(255,255,255,0.5)',
            }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold theme-text-muted">Moves: <span className="font-black theme-text">{moves}</span></span>
        <span className="font-bold theme-text-muted">Matched: <span className="font-black text-pink-400">{matched.length}/{cards.length / 2}</span></span>
        <span className="font-bold font-mono theme-text-muted">{formatTime(elapsed)}</span>
        <button onClick={() => initGame()} className="p-1.5 rounded-lg theme-text-muted hover:scale-110 hover:text-pink-400 transition-all"><RotateCcw className="w-4 h-4" /></button>
      </div>

      {/* Cards grid */}
      {!gameOver && (
        <div className="grid grid-cols-4 gap-2.5">
          {cards.map(card => {
            const faceUp = isFlipped(card);
            const done = isMatched(card);
            return (
              <button key={card.id} onClick={() => flip(card)} disabled={done}
                className="aspect-square rounded-xl text-sm font-black transition-all duration-400 relative overflow-hidden"
                style={{
                  perspective: '600px',
                  background: done ? 'rgba(16,185,129,0.12)' : faceUp ? 'rgba(236,72,153,0.12)' : 'rgba(255,255,255,0.05)',
                  border: done ? '1px solid rgba(16,185,129,0.35)' : faceUp ? '1px solid rgba(236,72,153,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  color: done ? '#34D399' : faceUp ? '#F9A8D4' : 'transparent',
                  transform: faceUp || done ? 'scale(1.03)' : 'scale(1)',
                  boxShadow: done ? '0 0 12px rgba(16,185,129,0.3)' : faceUp ? '0 0 12px rgba(236,72,153,0.3)' : 'none',
                }}>
                {faceUp || done ? card.text : '?'}
              </button>
            );
          })}
        </div>
      )}

      {gameOver && (
        <div className="text-center space-y-4 py-4">
          <div className="text-5xl font-black text-pink-400">🎉 {formatTime(elapsed)}</div>
          <p className="font-black theme-text text-xl">All matched in <span className="text-pink-400">{moves} moves</span>!</p>
          <button onClick={() => initGame()} className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold mx-auto hover:scale-105 transition-all"
            style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)', boxShadow: '0 0 20px rgba(236,72,153,0.4)' }}>
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   GAME 5 — Playable Unlocker (YouTube Playables & Slide Q&A)
   Mechanic: Answer 3-5 questions to unlock a YouTube Playable
   ══════════════════════════════════════════════════════════════════ */
function PlayableUnlocker({ onExit }) {
  const [step, setStep] = useState('setup'); // 'setup' | 'playing' | 'quiz' | 'finished'
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameUrl, setGameUrl] = useState('HGeu_F8v9-Y'); // Video ID now
  const [customGameUrl, setCustomGameUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPaused, setIsPaused] = useState(false);
  
  const timerRef = useRef(null);
  const playerRef = useRef(null);

  const gameOptions = [
    { name: 'Slither.io World', id: 'HGeu_F8v9-Y', type: 'youtube' },
    { name: 'Crossy Road', url: 'https://scratch.mit.edu/projects/630043516/embed', type: 'web' },
    { name: 'Geometry Dash', url: 'https://scratch.mit.edu/projects/105500895/embed', type: 'web' },
    { name: 'Doodle Jump', url: 'https://scratch.mit.edu/projects/23675037/embed', type: 'web' },
    { name: 'Hextris (Classic)', url: 'https://hextris.io/', type: 'web' }
  ];

  const [activeUrl, setActiveUrl] = useState('');

  // Handle URL generation
  useEffect(() => {
    const selected = gameOptions.find(o => o.id === gameUrl || o.url === gameUrl);
    if (selected) {
      if (selected.type === 'youtube') setActiveUrl(`https://www.youtube.com/embed/${selected.id}?autoplay=1&mute=1&origin=${window.location.origin}`);
      else setActiveUrl(selected.url);
    } else if (gameUrl.length > 5) {
      // Custom URL handling
      setActiveUrl(gameUrl);
    }
  }, [gameUrl]);

  // Initialize YT Player
  useEffect(() => {
    if (step === 'playing' && !playerRef.current) {
      window.onYouTubeIframeAPIReady = () => {
        playerRef.current = new window.YT.Player('yt-player', {
          videoId: gameUrl,
          playerVars: { 'autoplay': 1, 'controls': 1, 'origin': window.location.origin },
          events: {
            'onReady': (e) => e.target.playVideo(),
          }
        });
      };
      if (window.YT && window.YT.Player) {
        window.onYouTubeIframeAPIReady();
      }
    }
  }, [step, gameUrl]);

  // Timer logic
  useEffect(() => {
    if (step === 'playing' && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setStep('quiz');
            if (playerRef.current?.pauseVideo) playerRef.current.pauseVideo();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step, isPaused]);

  const handleStart = () => {
    if (questions.length === 0) {
      alert("Please upload your slides first so I can prepare your questions!");
      return;
    }
    setStep('playing');
    setTimeLeft(60);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setTimeout(() => {
      generateQuestions(`Educational content from ${file.name}`);
    }, 1000);
  };

  const generateQuestions = async (context) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_ROOT}/api/study`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Create 3 study questions based on: "${context}". Return ONLY JSON: [{"question": "text", "options": ["A", "B", "C", "D"], "correct": 0}]`
        })
      });
      const data = await res.json();
      const raw = (data.result || '').replace(/```json|```/g, '').trim();
      setQuestions(JSON.parse(raw));
    } catch (err) { alert("Error generating questions."); }
    setLoading(false);
  };

  const handleAnswer = (idx) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    const correct = idx === questions[currentQ].correct;
    setTimeout(() => {
      if (correct) {
        if (currentQ + 1 < questions.length) {
          setCurrentQ(c => c + 1);
          setSelectedAnswer(null);
        } else {
          // Finished all questions, resume playing!
          setStep('playing');
          setTimeLeft(60); // Give another minute
          setCurrentQ(0);
          setSelectedAnswer(null);
          if (playerRef.current?.playVideo) playerRef.current.playVideo();
        }
      } else {
        alert("Incorrect! Review your slides and try again.");
        setSelectedAnswer(null);
      }
    }, 1500);
  };

  if (step === 'setup') {
    return (
      <div className="space-y-6 py-4">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black theme-text">1 Minute Play → Quiz Challenge</h3>
          <p className="text-sm theme-text-muted">Play for 60 seconds, then answer questions from your slides to keep playing!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl border theme-border theme-bg-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-orange-400 flex items-center gap-2"><FileIcon className="w-4 h-4"/> Step 1: Slides</span>
              {questions.length > 0 && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-black">READY</span>}
            </div>
            <label className="block w-full cursor-pointer">
              <div className="py-8 border-2 border-dashed theme-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-orange-400/50 transition-all">
                {loading ? <Loader2 className="w-8 h-8 text-orange-400 animate-spin" /> : <Monitor className="w-8 h-8 text-orange-400" />}
                <span className="text-xs font-bold theme-text-muted">{loading ? 'Analyzing...' : 'Upload Slides (PDF/PPT)'}</span>
              </div>
              <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.ppt,.pptx,.txt" />
            </label>
          </div>

          <div className="p-6 rounded-2xl border theme-border theme-bg-card space-y-4">
            <span className="font-bold text-blue-400 flex items-center gap-2"><Gamepad className="w-4 h-4"/> Step 2: Game</span>
            <div className="space-y-2">
              {gameOptions.map((opt) => (
                <button key={opt.id || opt.url} onClick={() => setGameUrl(opt.id || opt.url)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between border theme-border hover:bg-white/5 transition-all"
                  style={{ borderColor: (gameUrl === opt.id || gameUrl === opt.url) ? '#3B82F6' : '' }}>
                  {opt.name}
                  {(gameUrl === opt.id || gameUrl === opt.url) && <Check className="w-4 h-4 text-blue-400" />}
                </button>
              ))}
              <input type="text" placeholder="Or paste YouTube ID (e.g. dQw4w9WgXcQ)"
                value={customGameUrl} onChange={(e) => { setCustomGameUrl(e.target.value); setGameUrl(e.target.value); }}
                className="w-full px-4 py-2 rounded-xl text-[10px] theme-bg border theme-border theme-text focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onExit} className="flex-1 py-4 rounded-2xl font-black text-sm border theme-border theme-text-muted hover:bg-white/5 transition-all">
            QUIT AND GO BACK
          </button>
          <button onClick={handleStart} disabled={loading || questions.length === 0}
            className="flex-[2] py-4 rounded-2xl text-white font-black text-lg hover:scale-[1.01] transition-all disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, #F97316, #3B82F6)', boxShadow: '0 8px 32px rgba(249,115,22,0.3)' }}>
            START SESSION
          </button>
        </div>
      </div>
    );
  }

  if (step === 'playing') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-orange-500/30 flex items-center justify-center font-black text-orange-400">
              {timeLeft}
            </div>
            <span className="font-black theme-text uppercase tracking-widest text-sm">Game Session Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs font-bold theme-text-muted">
              <Clock className="w-4 h-4" /> Challenge in {timeLeft}s
            </div>
            <button onClick={onExit} className="p-2 hover:bg-white/5 rounded-lg transition-all text-red-500/60 hover:text-red-500">
               <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden border-4 border-orange-500/20 bg-black aspect-video shadow-2xl">
          {gameOptions.find(o => o.id === gameUrl)?.type === 'youtube' ? (
            <div id="yt-player" className="w-full h-full"></div>
          ) : (
            <iframe key={activeUrl} src={activeUrl} className="w-full h-full" frameBorder="0" 
              allow="autoplay; encrypted-media; gyroscope; picture-in-picture; accelerometer" 
              allowFullScreen />
          )}
        </div>
      </div>
    );
  }

  if (step === 'quiz') {
    const q = questions[currentQ];
    return (
      <div className="max-w-xl mx-auto space-y-8 py-4">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
             <Lock className="w-8 h-8 text-amber-500 animate-pulse" />
          </div>
          <h3 className="text-2xl font-black theme-text">TIME IS UP!</h3>
          <p className="text-sm theme-text-muted">Answer these 3 questions from your slides to unlock another 60 seconds of playtime.</p>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl border-2 border-amber-500/20 bg-amber-500/5">
             <h4 className="text-lg font-black theme-text leading-tight">{q?.question}</h4>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {q?.options.map((opt, i) => {
              const isCorrect = i === q.correct;
              const isSelected = i === selectedAnswer;
              let style = { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' };
              if (selectedAnswer !== null) {
                if (isCorrect) style = { background: 'rgba(16,185,129,0.1)', border: '1px solid #10B981', color: '#10B981' };
                else if (isSelected) style = { background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', color: '#EF4444' };
                else style.opacity = 0.4;
              }
              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={selectedAnswer !== null}
                  className="p-4 rounded-xl text-sm font-bold text-left transition-all"
                  style={style}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={onExit} className="w-full py-3 mt-4 rounded-xl text-[10px] font-black theme-text-muted hover:text-red-400 transition-all">
          GIVE UP AND EXIT SESSION
        </button>
      </div>
    );
  }
}


/* ════════════════════════════════════════════════════════════════
   MAIN STUDY GAMES PAGE
═══════════════════════════════════════════════════════════════════ */
const GAMES = [
  {
    id: 'math', label: 'Speed Math', icon: Zap, color: '#F97316', glow: 'rgba(249,115,22,0.4)',
    desc: 'Solve math problems as fast as possible. Earn combo bonuses for streaks. 60 seconds on the clock!',
    tags: ['Mental Math', 'Speed', 'Arithmetic'],
  },
  {
    id: 'scramble', label: 'Word Scramble', icon: TextCursorInput, color: '#3B82F6', glow: 'rgba(59,130,246,0.4)',
    desc: 'Unscramble academic vocabulary before the timer runs out. Hints cost points!',
    tags: ['Vocabulary', 'Spelling', 'Academic'],
  },
  {
    id: 'trivia', label: 'AI Trivia', icon: Brain, color: '#10B981', glow: 'rgba(16,185,129,0.4)',
    desc: 'Pick any topic and Gemini generates 8 quiz questions instantly. Beat the 15-second timer!',
    tags: ['Trivia', 'Any Topic', 'AI-Powered'],
  },
  {
    id: 'memory', label: 'Memory Match', icon: Layers, color: '#EC4899', glow: 'rgba(236,72,153,0.4)',
    desc: 'Match paired cards — elements, world capitals, vocab, and math. Fewer moves = better score!',
    tags: ['Memory', 'Science', 'Vocabulary'],
  },
  {
    id: 'playables', label: 'YouTube Playables', icon: Youtube, color: '#EF4444', glow: 'rgba(239,68,68,0.4)',
    desc: 'Unlock your favorite YouTube mini-games by answering questions from your own study slides!',
    tags: ['Gaming', 'Slides', 'Unlockable'],
  },
];

export default function StudyGames() {
  const [activeGame, setActiveGame] = useState(null);

  const game = GAMES.find(g => g.id === activeGame);

  return (
    <div className="min-h-screen theme-bg theme-text">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full -top-32 -left-32"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute w-[500px] h-[500px] rounded-full -bottom-20 -right-20"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.04) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto p-6 md:p-10 space-y-8">
        {/* Header */}
        <header className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F97316, #EC4899)', boxShadow: '0 0 30px rgba(249,115,22,0.5)' }}>
            <Gamepad2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black malum-text-gradient">Study Games</h1>
            <p className="text-sm theme-text-secondary font-medium">Learn while you play — 4 brain-boosting games</p>
          </div>
          {activeGame && (
            <button onClick={() => setActiveGame(null)}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
              <XIcon className="w-4 h-4" /> Exit Game
            </button>
          )}
        </header>

        {/* Game Selector Grid */}
        {!activeGame && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {GAMES.map((g, i) => (
              <button key={g.id} onClick={() => setActiveGame(g.id)}
                className="group rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  animation: `fadeInUp 0.4s ease ${i * 0.08}s both`,
                }}>
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 30% 30%, ${g.glow.replace('0.4)', '0.08)')}, transparent 70%)` }} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: `${g.color}18`, boxShadow: `0 0 16px ${g.glow}` }}>
                      <g.icon className="w-6 h-6" style={{ color: g.color }} />
                    </div>
                    <div className="p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                      style={{ background: `${g.color}15`, color: g.color }}>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                  <h3 className="font-black theme-text text-xl mb-2">{g.label}</h3>
                  <p className="text-sm theme-text-secondary leading-relaxed mb-4">{g.desc}</p>
                  <div className="flex gap-2 flex-wrap">
                    {g.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-black px-2.5 py-1 rounded-full"
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

        {/* Active Game */}
        {activeGame && game && (
          <div className="space-y-6" style={{ animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}>
            {/* Game header */}
            <div className="flex items-center gap-4 px-5 py-4 rounded-2xl"
              style={{ background: `${game.color}0d`, border: `1px solid ${game.color}28` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${game.color}18`, boxShadow: `0 0 16px ${game.glow}` }}>
                <game.icon className="w-5 h-5" style={{ color: game.color }} />
              </div>
              <div>
                <h2 className="font-black theme-text">{game.label}</h2>
                <p className="text-xs theme-text-muted">{game.desc}</p>
              </div>
            </div>

            {/* Game content */}
            <div className="rounded-2xl p-6" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
              {activeGame === 'math' && <SpeedMath onExit={() => setActiveGame(null)} />}
              {activeGame === 'scramble' && <WordScramble onExit={() => setActiveGame(null)} />}
              {activeGame === 'trivia' && <AITrivia onExit={() => setActiveGame(null)} />}
              {activeGame === 'memory' && <MemoryMatch onExit={() => setActiveGame(null)} />}
              {activeGame === 'playables' && <PlayableUnlocker onExit={() => setActiveGame(null)} />}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}

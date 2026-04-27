import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Sparkles, BookOpen, Loader2, Bot, User, Paperclip, X,
  Headphones, Play, Pause, CircleCheck, CheckCircle2, Mic, MicOff,
  Square, FileText, Clock, Volume2, Settings2, ChevronDown, ChevronUp,
  RotateCcw, SkipBack, SkipForward, Star, Layers, Copy, Check,
  RefreshCw, Brain, Zap, ChevronRight, ChevronLeft
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const API_ROOT = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:5000';

/* ════════════════════════════════════════════════════════════════
   AUDIO OVERVIEW COMPONENT — full rewrite with voice customization
═══════════════════════════════════════════════════════════════════ */
function AudioOverviewComponent({ podcast, quiz }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLine, setCurrentLine] = useState(-1);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [allVoices, setAllVoices] = useState([]);
  const [progress, setProgress] = useState(0); // 0-100
  const playingRef = useRef(false);
  const currentLineRef = useRef(-1);

  // Voice customization state
  const [host1Voice, setHost1Voice] = useState('');
  const [host2Voice, setHost2Voice] = useState('');
  const [rate, setRate] = useState(1.0);
  const [pitch1, setPitch1] = useState(1.0);
  const [pitch2, setPitch2] = useState(1.08);
  const [volume, setVolume] = useState(1.0);
  const audioObjRef = useRef(null);

  // Load available voices
  useEffect(() => {
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        setAllVoices(v);
        // Auto-select best voices (Neural/Natural first)
        const findBestVoice = (isMale) => {
          const regex = isMale 
            ? /natural|neural|google uk english male|microsoft david|alex|daniel|guy/i 
            : /natural|neural|google uk english female|microsoft zira|samantha|emma|siri|jenny/i;
          
          return v.find(x => regex.test(x.name) && x.lang.startsWith('en')) 
            || v.find(x => regex.test(x.name))
            || v.find(x => (isMale ? /male/i.test(x.name) : /female/i.test(x.name)))
            || v[isMale ? 0 : 1] || v[0];
        };

        const preferredMale = findBestVoice(true);
        const preferredFemale = findBestVoice(false);
        setHost1Voice(preferredMale?.name || '');
        setHost2Voice(preferredFemale?.name || '');
      }
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  const getVoiceByName = (name) => allVoices.find(v => v.name === name) || allVoices[0];

  const speakLine = useCallback((line, index) => {
    return new Promise(async (resolve) => {
      if (!playingRef.current) { resolve(); return; }
      currentLineRef.current = index;
      setCurrentLine(index);
      setProgress(Math.round((index / podcast.length) * 100));

      // Check if we should use OpenAI TTS or Web Speech API
      if (line.voice) {
        try {
          const resp = await fetch(`${API_ROOT}/api/tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: line.text, voice: line.voice })
          });
          if (!resp.ok) throw new Error('TTS failed');
          const blob = await resp.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audioObjRef.current = audio;
          audio.volume = volume;
          audio.playbackRate = rate;
          audio.onended = () => {
            URL.revokeObjectURL(url);
            setTimeout(resolve, 400 + Math.random() * 400);
          };
          audio.onerror = resolve;
          audio.play();
          return;
        } catch (err) {
          console.error('OpenAI TTS Error, falling back:', err);
        }
      }

      // Fallback to Web Speech API
      const utterance = new SpeechSynthesisUtterance(line.text);
      utterance.voice = line.host === '1' ? getVoiceByName(host1Voice) : getVoiceByName(host2Voice);
      
      const jitter = (Math.random() - 0.5) * 0.05; 
      utterance.rate = rate + jitter;
      utterance.pitch = (line.host === '1' ? pitch1 : pitch2) + jitter;
      utterance.volume = volume;
      utterance.onend = () => {
        setTimeout(resolve, 300 + Math.random() * 500);
      };
      utterance.onerror = resolve;
      window.speechSynthesis.speak(utterance);
    });
  }, [host1Voice, host2Voice, rate, pitch1, pitch2, volume, allVoices, podcast.length]);

  const handlePlay = async () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      playingRef.current = false;
      setIsPlaying(false);
      return;
    }
    playingRef.current = true;
    setIsPlaying(true);
    setShowQuiz(false);

    for (let i = 0; i < podcast.length; i++) {
      if (!playingRef.current) break;
      await speakLine(podcast[i], i);
    }

    playingRef.current = false;
    setIsPlaying(false);
    setCurrentLine(-1);
    setProgress(100);
    if (playingRef.current !== false) setShowQuiz(true);
    else setTimeout(() => setShowQuiz(true), 400);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    if (audioObjRef.current) {
      audioObjRef.current.pause();
      audioObjRef.current = null;
    }
    playingRef.current = false;
    setIsPlaying(false);
    setCurrentLine(-1);
    setProgress(0);
  };

  const handleQuizAnswer = (qIndex, oIndex) => {
    if (quizAnswers[qIndex] !== undefined) return;
    setQuizAnswers(prev => ({ ...prev, [qIndex]: oIndex }));
  };

  if (!podcast || !Array.isArray(podcast)) {
    return <div className="text-red-400 p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>Error: AI script failed to generate.</div>;
  }

  const estimatedMins = Math.ceil(podcast.reduce((a, l) => a + l.text.split(' ').length, 0) / 130 / rate);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Podcast Player Header */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.3)' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 0 25px rgba(99,102,241,0.6)' }}>
            <Headphones className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black theme-text premium-heading">Malum Audio Overview</h3>
            <p className="text-sm font-medium" style={{ color: 'var(--text-faint)' }}>
              {podcast.length} segments · ~{estimatedMins} min at {rate.toFixed(1)}x
            </p>
          </div>
          <button
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            className="p-2.5 rounded-xl transition-all hover:scale-110"
            style={{
              background: showVoiceSettings ? 'rgba(99,102,241,0.3)' : 'var(--bg-faint)',
              border: `1px solid ${showVoiceSettings ? 'rgba(99,102,241,0.5)' : 'var(--border-faint)'}`,
              color: showVoiceSettings ? '#818CF8' : 'var(--text-faint)'
            }}
            title="Voice Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }} />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button onClick={handleStop} disabled={!isPlaying}
            className="p-2.5 rounded-xl disabled:opacity-40 transition-all hover:scale-110"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
            <Square className="w-4 h-4" />
          </button>
          <button onClick={handlePlay}
            className="flex items-center gap-2.5 px-8 py-3 rounded-full font-black text-sm transition-all hover:scale-105"
            style={{
              background: isPlaying
                ? 'linear-gradient(135deg, rgba(239,68,68,0.9), rgba(220,38,38,0.9))'
                : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              boxShadow: isPlaying ? '0 0 25px rgba(239,68,68,0.5)' : '0 0 25px rgba(99,102,241,0.6)',
              color: 'white'
            }}>
            {isPlaying ? <><Pause className="w-5 h-5 fill-white" /> Pause</> : <><Play className="w-5 h-5 fill-white" /> Play Podcast</>}
          </button>
          <button onClick={() => setShowQuiz(!showQuiz)}
            className="p-2.5 rounded-xl transition-all hover:scale-110"
            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Voice Settings Panel */}
      {showVoiceSettings && (
        <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--bg-faint)', border: '1px solid var(--border-faint)', animation: 'slideDown 0.25s ease' }}>
          <h4 className="font-black text-sm theme-text-secondary">🎙️ Voice Customization</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Host 1 voice */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Alex (Host 1)</label>
              <select value={host1Voice} onChange={e => setHost1Voice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: 'white' }}>
                {allVoices.map(v => <option key={v.name} value={v.name} style={{ background: '#1a1a2e' }}>{v.name} ({v.lang})</option>)}
              </select>
              <label className="text-xs font-semibold flex justify-between" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <span>Pitch</span><span>{pitch1.toFixed(1)}</span>
              </label>
              <input type="range" min="0.5" max="2" step="0.05" value={pitch1} onChange={e => setPitch1(parseFloat(e.target.value))}
                className="w-full accent-indigo-500" />
            </div>

            {/* Host 2 voice */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Sam (Host 2)</label>
              <select value={host2Voice} onChange={e => setHost2Voice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none"
                style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: 'white' }}>
                {allVoices.map(v => <option key={v.name} value={v.name} style={{ background: '#1a1a2e' }}>{v.name} ({v.lang})</option>)}
              </select>
              <label className="text-xs font-semibold flex justify-between" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <span>Pitch</span><span>{pitch2.toFixed(1)}</span>
              </label>
              <input type="range" min="0.5" max="2" step="0.05" value={pitch2} onChange={e => setPitch2(parseFloat(e.target.value))}
                className="w-full accent-purple-500" />
            </div>
          </div>

          {/* Global controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold flex justify-between" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <span>Speed</span><span>{rate.toFixed(2)}x</span>
              </label>
              <input type="range" min="0.5" max="2" step="0.05" value={rate} onChange={e => setRate(parseFloat(e.target.value))}
                className="w-full accent-orange-400" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold flex justify-between" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <span>Volume</span><span>{Math.round(volume * 100)}%</span>
              </label>
              <input type="range" min="0" max="1" step="0.05" value={volume} onChange={e => setVolume(parseFloat(e.target.value))}
                className="w-full accent-emerald-400" />
            </div>
          </div>
        </div>
      )}

      {/* Transcript */}
    <div className="rounded-2xl p-5 space-y-4 max-h-[420px] overflow-y-auto custom-scrollbar"
        style={{ background: 'var(--bg-faint)', border: '1px solid var(--border-faint)' }}>
        {podcast.map((line, idx) => (
          <div key={idx} className={`flex flex-col transition-all duration-300 ${line.host === '1' ? 'items-start' : 'items-end'} ${currentLine !== -1 && currentLine !== idx ? 'opacity-25' : 'opacity-100'}`}>
            <span className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-faint)' }}>
              {line.name} • <span className="opacity-60">{line.host === '1' ? 'Interviewer' : 'Expert Deep-Dive'}</span>
            </span>
            <div className={`px-4 py-3 rounded-2xl max-w-[88%] text-sm font-medium leading-relaxed ${line.host === '1'
              ? 'rounded-tl-sm'
              : 'rounded-tr-sm'
            }`}
              style={{
                background: line.host === '1'
                  ? (currentLine === idx ? 'linear-gradient(135deg, #6366F1, #4F46E5)' : 'rgba(99,102,241,0.2)')
                  : (currentLine === idx ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)' : 'rgba(139,92,246,0.2)'),
                color: currentLine === idx ? 'white' : 'var(--text-secondary)',
                boxShadow: currentLine === idx ? (line.host === '1' ? '0 0 20px rgba(99,102,241,0.4)' : '0 0 20px rgba(139,92,246,0.4)') : 'none',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: currentLine === idx ? 'scale(1.02)' : 'scale(1)',
              }}>
              {line.text}
            </div>
          </div>
        ))}
      </div>

      {/* Quiz */}
      {!showQuiz && quiz && (
        <button onClick={() => setShowQuiz(true)}
          className="w-full py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          style={{ border: '2px dashed rgba(99,102,241,0.35)', color: '#818CF8', background: 'rgba(99,102,241,0.05)' }}>
          <Sparkles className="w-4 h-4" /> Skip to Knowledge Check
        </button>
      )}

      {showQuiz && quiz && (
        <div className="space-y-5 mt-2">
          <h3 className="text-2xl font-black theme-text flex items-center gap-2 premium-heading">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" /> Knowledge Check
          </h3>
          {quiz.map((q, qIndex) => {
            const answered = quizAnswers[qIndex] !== undefined;
            const isCorrect = answered && quizAnswers[qIndex] === q.correctAnswerIndex;
            return (
              <div key={qIndex} className="premium-card p-6 relative overflow-hidden"
                style={{ boxShadow: `0 20px 40px rgba(0,0,0,0.4)` }}>
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: 'linear-gradient(180deg, #6366F1, #8B5CF6)' }} />
                <p className="text-base font-bold theme-text mb-4 pl-2">{q.question}</p>
                <div className="space-y-2.5 pl-2">
                  {q.options.map((opt, oIndex) => {
                    let bg = 'rgba(255,255,255,0.04)', border = 'rgba(255,255,255,0.08)', color = 'rgba(255,255,255,0.75)';
                    if (answered) {
                      if (oIndex === q.correctAnswerIndex) { bg = 'rgba(16,185,129,0.12)'; border = 'rgba(16,185,129,0.3)'; color = '#34d399'; }
                      else if (oIndex === quizAnswers[qIndex]) { bg = 'rgba(239,68,68,0.1)'; border = 'rgba(239,68,68,0.25)'; color = '#f87171'; }
                      else { color = 'rgba(255,255,255,0.3)'; }
                    }
                    return (
                      <button key={oIndex} onClick={() => handleQuizAnswer(qIndex, oIndex)} disabled={answered}
                        className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between"
                        style={{ background: bg, border: `1px solid ${border}`, color }}>
                        <span>{opt}</span>
                        {answered && oIndex === q.correctAnswerIndex && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                {answered && (
                  <div className="mt-4 pl-2 p-3 rounded-xl text-sm font-medium"
                    style={{ background: isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, color: isCorrect ? '#6EE7B7' : '#FCA5A5' }}>
                    <span className="font-black text-xs uppercase tracking-wider block mb-1">{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</span>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   LECTURE RECORDER COMPONENT
═══════════════════════════════════════════════════════════════════ */
function LectureRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [notes, setNotes] = useState('');
  const [generatingNotes, setGeneratingNotes] = useState(false);
  const [savedRecordings, setSavedRecordings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('malum_recordings') || '[]'); } catch { return []; }
  });
  const [viewingRecording, setViewingRecording] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const transcriptRef = useRef('');
  const audioInputRef = useRef(null);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t + ' ';
        else interim += t;
      }
      if (final) {
        transcriptRef.current += final;
        setTranscript(transcriptRef.current);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (e) => console.error('Speech recognition error:', e);
    recognition.start();
    recognitionRef.current = recognition;

    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    setIsRecording(true);
    setIsPaused(false);
  };

  const pauseRecording = () => {
    recognitionRef.current?.stop();
    clearInterval(timerRef.current);
    setIsPaused(true);
  };

  const resumeRecording = () => {
    recognitionRef.current?.start();
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    setIsPaused(false);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    clearInterval(timerRef.current);
    setIsRecording(false);
    setIsPaused(false);
    setInterimTranscript('');

    // Auto-save recording if transcript exists
    if (transcriptRef.current.trim()) {
      const id = Date.now().toString();
      const rec = {
        id,
        date: new Date().toLocaleDateString(),
        duration: formatTime(seconds),
        transcript: transcriptRef.current.trim(),
        notes: '',
      };
      const updated = [rec, ...savedRecordings].slice(0, 10);
      setSavedRecordings(updated);
      localStorage.setItem('malum_recordings', JSON.stringify(updated));
      setCurrentId(id);
    }
  };

  const generateNotes = async (targetId = null, customTranscript = null) => {
    const textToProcess = customTranscript || transcriptRef.current;
    if (!textToProcess.trim()) return;
    
    setGeneratingNotes(true);
    if (!targetId) setNotes('');
    
    try {
      const res = await fetch(`${API_ROOT}/api/study`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are an expert note-taker. Convert the following lecture transcript into clear, well-structured study notes. Use headers, bullet points, key terms in bold, and a summary section at the end.\n\nTRANSCRIPT:\n${textToProcess}`
        })
      });
      const data = await res.json();
      const notesText = data.result || 'Could not generate notes.';
      
      if (!targetId) setNotes(notesText);

      // Update saved recordings
      const idToUpdate = targetId || currentId;
      const updated = savedRecordings.map(r => 
        r.id === idToUpdate ? { ...r, notes: notesText } : r
      );
      
      // If notes were generated for current session but it wasn't saved yet (unlikely due to stop auto-save)
      if (idToUpdate && !savedRecordings.find(r => r.id === idToUpdate)) {
        // Fallback for current session save
        const rec = {
          id: idToUpdate,
          date: new Date().toLocaleDateString(),
          duration: formatTime(seconds),
          transcript: textToProcess,
          notes: notesText,
        };
        saveToLocalStorage([rec, ...savedRecordings]);
      } else {
        saveToLocalStorage(updated);
      }
    } catch (err) { 
      console.error(err);
      if (!targetId) setNotes('Error generating notes. Check that the backend is running.'); 
    }
    setGeneratingNotes(false);
  };

  const saveToLocalStorage = (data) => {
    const limited = data.slice(0, 12);
    setSavedRecordings(limited);
    localStorage.setItem('malum_recordings', JSON.stringify(limited));
  };

  const handleImportAudio = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { alert('File too large (max 25MB).'); return; }

    setIsImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target.result.split(',')[1];
        const res = await fetch(`${API_ROOT}/api/study`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: "Please transcribe this lecture audio precisely and then generate structured study notes from it. Separate them with markers like ---TRANSCRIPT--- and ---NOTES---.",
            fileData: { base64, mimeType: file.type }
          })
        });
        const data = await res.json();
        const result = data.result || '';
        
        // Parse transcript and notes
        const tMatch = result.match(/---TRANSCRIPT---([\s\S]*?)---NOTES---/i);
        const nMatch = result.match(/---NOTES---([\s\S]*)/i);
        
        let importedTranscript = tMatch ? tMatch[1].trim() : result.split('---NOTES---')[0].trim();
        let importedNotes = nMatch ? nMatch[1].trim() : (result.includes('---NOTES---') ? result.split('---NOTES---')[1].trim() : 'AI processed the audio but could not separate transcript from notes.');

        const rec = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString() + ' (Imported)',
          duration: '--:--',
          transcript: importedTranscript,
          notes: importedNotes,
        };
        saveToLocalStorage([rec, ...savedRecordings]);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert('Error importing audio file.');
    }
    setIsImporting(false);
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const copyNotes = () => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setTranscript(''); setNotes(''); setSeconds(0);
    transcriptRef.current = '';
    setInterimTranscript('');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Recorder controls */}
      <div className="rounded-2xl p-6 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(99,102,241,0.06))', border: `1px solid ${isRecording ? 'rgba(239,68,68,0.4)' : 'var(--border-faint)'}` }}>

        {/* Recording pulse ring */}
        {isRecording && !isPaused && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-4 border-red-500/20 animate-ping absolute" />
            <div className="w-24 h-24 rounded-full border-2 border-red-500/30 animate-ping absolute" style={{ animationDelay: '0.3s' }} />
          </div>
        )}

        <div className="relative z-10">
          {/* Timer */}
          <div className="text-5xl font-black mb-2 font-mono" style={{ color: isRecording ? (isPaused ? '#F59E0B' : '#EF4444') : 'var(--text-faint-muted)' }}>
            {formatTime(seconds)}
          </div>
          <p className="text-sm font-semibold mb-6" style={{ color: 'var(--text-faint)' }}>
            {!isRecording ? 'Press record to start capturing your lecture' : isPaused ? '⏸ Recording paused' : '🔴 Recording live — speak clearly'}
          </p>

          <div className="flex items-center justify-center gap-3">
            {!isRecording ? (
              <>
                <button onClick={startRecording}
                  className="flex items-center gap-3 px-8 py-4 rounded-full text-white font-black text-base transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', boxShadow: '0 0 30px rgba(239,68,68,0.5)' }}>
                  <Mic className="w-6 h-6" /> Start Recording
                </button>
                <button onClick={() => audioInputRef.current?.click()} disabled={isImporting}
                  className="flex items-center gap-2 px-6 py-4 rounded-full text-white/90 font-bold text-sm transition-all hover:scale-105 hover:bg-white/10"
                  style={{ border: '1px solid var(--border-faint)', background: 'var(--bg-faint)' }}>
                  {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  <span>{isImporting ? 'Processing Audio...' : 'Import Audio'}</span>
                </button>
                <input type="file" ref={audioInputRef} onChange={handleImportAudio} className="hidden" accept="audio/*" />
              </>
            ) : (
              <>
                <button onClick={isPaused ? resumeRecording : pauseRecording}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-black transition-all hover:scale-105"
                  style={{ background: isPaused ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'rgba(245,158,11,0.85)', boxShadow: isPaused ? '0 0 20px rgba(239,68,68,0.4)' : '0 0 20px rgba(245,158,11,0.4)' }}>
                  {isPaused ? <><Mic className="w-4 h-4" /> Resume</> : <><MicOff className="w-4 h-4" /> Pause</>}
                </button>
                <button onClick={stopRecording}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-black transition-all hover:scale-105"
                  style={{ background: 'rgba(99,99,99,0.6)', border: '1px solid var(--border-faint)' }}>
                  <Square className="w-4 h-4" /> Stop
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Live transcript */}
      {(transcript || interimTranscript) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-black theme-text text-sm uppercase tracking-wider">Live Transcript</h3>
            <button onClick={clearAll} className="text-xs font-bold theme-text-muted hover:text-red-400 transition-colors flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          </div>
          <div className="rounded-2xl p-4 max-h-48 overflow-y-auto custom-scrollbar text-sm font-medium leading-relaxed"
            style={{ background: 'var(--bg-faint)', border: '1px solid var(--border-faint)', color: 'var(--text-secondary)' }}>
            {transcript}
            {interimTranscript && <span style={{ color: 'var(--text-faint-muted)' }}>{interimTranscript}</span>}
          </div>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-faint-muted)' }}>
            <span>{transcript.split(' ').filter(Boolean).length} words</span>
            {!isRecording && transcript && (
              <button onClick={generateNotes} disabled={generatingNotes}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-black text-xs transition-all hover:scale-105 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>
                {generatingNotes ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</> : <><Sparkles className="w-3.5 h-3.5" /> Generate Notes with AI</>}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Generated notes */}
      {(notes || generatingNotes) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-black theme-text text-sm uppercase tracking-wider">AI Study Notes</h3>
            {notes && (
              <button onClick={copyNotes} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                style={{ background: copied ? 'rgba(16,185,129,0.12)' : 'var(--bg-faint)', color: copied ? '#10b981' : 'var(--text-faint)', border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'var(--border-faint)'}` }}>
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            )}
          </div>
          <div className="rounded-2xl p-5" style={{ background: 'var(--bg-faint)', border: '1px solid rgba(99,102,241,0.2)' }}>
            {generatingNotes ? (
              <div className="flex items-center gap-3 text-indigo-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-semibold text-sm">Gemini is generating structured notes...</span>
              </div>
            ) : (
              <div className="prose theme-text prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Saved recordings */}
      {savedRecordings.length > 0 && !viewingRecording && (
        <div className="space-y-3">
          <h3 className="font-black theme-text text-sm uppercase tracking-wider">Past Recordings</h3>
          <div className="space-y-2">
            {savedRecordings.map(rec => (
              <button key={rec.id} onClick={() => setViewingRecording(rec)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:scale-[1.01]"
                style={{ background: 'var(--bg-faint)', border: '1px solid var(--border-faint)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <Mic className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold theme-text text-sm truncate">{rec.date} — {rec.duration}</p>
                    {!rec.notes && (
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase">No Notes</span>
                    )}
                  </div>
                  <p className="text-xs theme-text-muted truncate">{rec.transcript.slice(0, 80)}...</p>
                </div>
                {!rec.notes ? (
                  <button onClick={(e) => { e.stopPropagation(); generateNotes(rec.id, rec.transcript); }}
                    className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                    title="Generate Notes">
                    <Sparkles className="w-4 h-4" />
                  </button>
                ) : (
                  <ChevronRight className="w-4 h-4 theme-text-muted flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {viewingRecording && (
        <div className="space-y-3">
          <button onClick={() => setViewingRecording(null)} className="flex items-center gap-2 text-sm font-bold theme-text-muted hover:theme-text transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Recordings
          </button>
          <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <p className="text-xs font-black uppercase tracking-wider" style={{ color: '#818CF8' }}>Transcript</p>
            <p className="text-sm leading-relaxed theme-text-secondary">{viewingRecording.transcript}</p>
          </div>
          <div className="prose theme-text prose-sm max-w-none rounded-2xl p-5" style={{ background: 'var(--bg-faint)', border: '1px solid var(--border-faint)' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{viewingRecording.notes}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   STUDY GUIDE MAKER COMPONENT
═══════════════════════════════════════════════════════════════════ */
function StudyGuideMaker() {
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState('comprehensive');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [guide, setGuide] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [activeFlashcard, setActiveFlashcard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState('guide'); // 'guide' | 'flashcards'
  const fileInputRef = useRef(null);

  const formats = [
    { id: 'comprehensive', label: '📚 Comprehensive', desc: 'Full study guide with all sections' },
    { id: 'flashcards', label: '🃏 Flashcards Only', desc: 'Q&A cards for memorization' },
    { id: 'summary', label: '⚡ Quick Summary', desc: 'Concise key points only' },
    { id: 'outline', label: '🗂️ Outline', desc: 'Hierarchical topic breakdown' },
  ];

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setFile({ file: f, base64: ev.target.result.split(',')[1], mimeType: f.type, name: f.name });
    };
    reader.readAsDataURL(f);
  };

  const generate = async () => {
    if (!topic.trim() && !file) return;
    setLoading(true);
    setGuide(''); setFlashcards([]);

    const formatInstructions = {
      comprehensive: `Create a comprehensive study guide with:
1. **Overview** — Brief intro
2. **Key Concepts** — Explain each major concept with examples
3. **Key Terms** — Glossary of important vocabulary (bold term, definition)
4. **Important Formulas/Rules** (if applicable)
5. **Practice Questions** — 5 questions with answers
6. **Summary** — 3–5 bullet recap
Return in rich Markdown.`,
      flashcards: `Create 12 flashcard questions and answers. Return ONLY a JSON array like:
[{"front":"Question","back":"Answer"},...]
No extra text, just the JSON array.`,
      summary: `Create a concise study summary with only the most important key points. Use bullet points, bold key terms. Keep it under 400 words.`,
      outline: `Create a hierarchical outline of this topic. Use # for main topics, ## for subtopics, - for details. Include 3–4 main sections with 3–5 subtopics each.`
    };

    try {
      const payload = {
        prompt: `${formatInstructions[format]}\n\nTOPIC: ${topic || 'the uploaded document'}`,
      };
      if (file) payload.fileData = { base64: file.base64, mimeType: file.mimeType };

      const res = await fetch(`${API_ROOT}/api/study`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const result = data.result || '';

      if (format === 'flashcards') {
        try {
          const clean = result.replace(/^```json\n?/m, '').replace(/^```\n?/m, '').replace(/```$/m, '').trim();
          const cards = JSON.parse(clean);
          setFlashcards(cards);
          setActiveView('flashcards');
          setActiveFlashcard(0);
          setFlipped(false);
        } catch {
          setGuide(result);
          setActiveView('guide');
        }
      } else {
        setGuide(result);
        setActiveView('guide');
      }
    } catch { setGuide('Error generating study guide. Check that the backend is running.'); }
    setLoading(false);
  };

  const copyGuide = () => {
    navigator.clipboard.writeText(guide);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Input Panel */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--bg-faint)', border: '1px solid var(--border-faint)' }}>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #EC4899, #F43F5E)', boxShadow: '0 0 16px rgba(236,72,153,0.4)' }}>
            <Layers className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-black theme-text">Study Guide Generator</h3>
        </div>

        <input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="Topic or concept (e.g. 'Photosynthesis', 'French Revolution', 'Quadratic equations')"
          className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all theme-text"
          style={{ background: 'var(--bg-faint)', border: '1px solid var(--border-faint)', focusBorderColor: '#EC4899' }}
          onKeyDown={e => e.key === 'Enter' && generate()}
        />

        {/* File upload */}
        <div className="flex items-center gap-2">
          <button onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
            style={{ background: 'var(--bg-faint)', border: '1px solid var(--border-faint)', color: 'var(--text-faint)' }}>
            <Paperclip className="w-3.5 h-3.5" />
            {file ? file.name : 'Attach Notes (optional)'}
          </button>
          {file && <button onClick={() => setFile(null)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"><X className="w-3.5 h-3.5" /></button>}
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFile} accept="image/*,application/pdf,text/plain" />
        </div>

        {/* Format selector */}
        <div className="grid grid-cols-2 gap-2">
          {formats.map(f => (
            <button key={f.id} onClick={() => setFormat(f.id)}
              className="flex flex-col items-start px-3 py-2.5 rounded-xl text-left transition-all text-xs font-bold border"
              style={{
                background: format === f.id ? 'rgba(236,72,153,0.1)' : 'var(--bg-faint)',
                borderColor: format === f.id ? 'rgba(236,72,153,0.4)' : 'var(--border-faint)',
                color: format === f.id ? '#EC4899' : 'var(--text-faint)',
              }}>
              <span>{f.label}</span>
              <span className="font-normal opacity-70 mt-0.5">{f.desc}</span>
            </button>
          ))}
        </div>

        <button onClick={generate} disabled={loading || (!topic.trim() && !file)}
          className="w-full py-3 rounded-xl text-white font-black text-sm transition-all hover:scale-[1.01] disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #EC4899, #F43F5E)', boxShadow: '0 4px 20px rgba(236,72,153,0.4)' }}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Study Guide</>}
        </button>
      </div>

      {/* Output — Guide */}
      {guide && activeView === 'guide' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-black theme-text text-sm uppercase tracking-wider">Your Study Guide</h3>
            <button onClick={copyGuide} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
              style={{ background: copied ? 'rgba(16,185,129,0.12)' : 'var(--bg-faint)', color: copied ? '#10b981' : 'var(--text-faint)', border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'var(--border-faint)'}` }}>
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
          </div>
          <div className="rounded-2xl p-5 prose theme-text prose-sm max-w-none"
            style={{ background: 'var(--bg-faint)', border: '1px solid rgba(236,72,153,0.15)' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{guide}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Output — Flashcards */}
      {flashcards.length > 0 && activeView === 'flashcards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black theme-text text-sm uppercase tracking-wider">Flashcards ({flashcards.length})</h3>
            <span className="text-xs theme-text-muted">{activeFlashcard + 1} / {flashcards.length}</span>
          </div>

          {/* Card */}
          <div className="relative h-52 cursor-pointer" onClick={() => setFlipped(!flipped)}
            style={{ perspective: '1000px' }}>
            <div className="absolute inset-0 transition-all duration-500"
              style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)' }}>
              {/* Front */}
              <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 text-center"
                style={{ backfaceVisibility: 'hidden', background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(244,63,94,0.08))', border: '1px solid rgba(236,72,153,0.3)' }}>
                <span className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#EC4899', opacity: 0.7 }}>Question</span>
                <p className="text-base font-bold theme-text leading-relaxed">{flashcards[activeFlashcard]?.front}</p>
                <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Tap to reveal answer</p>
              </div>
              {/* Back */}
              <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 text-center"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.08))', border: '1px solid rgba(16,185,129,0.3)' }}>
                <span className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#10B981', opacity: 0.7 }}>Answer</span>
                <p className="text-base font-bold theme-text leading-relaxed">{flashcards[activeFlashcard]?.back}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button onClick={() => { setActiveFlashcard(Math.max(0, activeFlashcard - 1)); setFlipped(false); }}
              disabled={activeFlashcard === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-30"
              style={{ background: 'var(--bg-faint)', color: 'var(--text-secondary)', border: '1px solid var(--border-faint)' }}>
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <button onClick={() => { setFlipped(false); setTimeout(() => setFlipped(false), 0); }}
              className="p-2 rounded-xl transition-all hover:scale-110"
              style={{ background: 'var(--bg-faint)', color: 'var(--text-faint)', border: '1px solid var(--border-faint)' }}>
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => { setActiveFlashcard(Math.min(flashcards.length - 1, activeFlashcard + 1)); setFlipped(false); }}
              disabled={activeFlashcard === flashcards.length - 1}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-30"
              style={{ background: 'var(--bg-faint)', color: 'var(--text-secondary)', border: '1px solid var(--border-faint)' }}>
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* All cards mini-grid */}
          <div className="flex flex-wrap gap-2 pt-2">
            {flashcards.map((_, i) => (
              <button key={i} onClick={() => { setActiveFlashcard(i); setFlipped(false); }}
                className="w-8 h-8 rounded-lg text-xs font-black transition-all hover:scale-110"
                style={{
                  background: i === activeFlashcard ? 'linear-gradient(135deg, #EC4899, #F43F5E)' : 'var(--bg-faint)',
                  color: i === activeFlashcard ? 'white' : 'var(--text-faint)',
                  border: `1px solid ${i === activeFlashcard ? 'rgba(236,72,153,0.5)' : 'var(--border-faint)'}`,
                }}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN STUDY COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function Study() {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `# 👋 Welcome to Malum Study Corner!\n\nI'm your **AI Study Assistant** powered by Gemini. Here's what you can do:\n\n- 💬 **Ask me anything** — explanations, practice problems, essay feedback\n- 📎 **Upload files** — I'll analyze your notes, textbooks, or images\n- 🎙️ **Record lectures** using the Recorder tab\n- 📖 **Generate study guides & flashcards** in the Study Guide tab\n- 🎧 Ask me to create an **Audio Overview podcast** of any topic\n\nWhat shall we study today?`
    }
  ]);
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [podcastTone, setPodcastTone] = useState('educational'); // educational, casual, dramatic
  const [podcastDepth, setPodcastDepth] = useState('standard'); // standard, deep
  const [showPodcastConfig, setShowPodcastConfig] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const tabs = [
    { id: 'chat', icon: Bot, label: 'AI Chat', color: '#6366F1' },
    { id: 'record', icon: Mic, label: 'Record Lecture', color: '#EF4444' },
    { id: 'guide', icon: Layers, label: 'Study Guide', color: '#EC4899' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (selected.size > 20 * 1024 * 1024) { alert('File too large (max 20MB).'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result.split(',')[1];
      setFile({ file: selected, base64, mimeType: selected.type, previewUrl: selected.type.startsWith('image/') ? ev.target.result : null });
    };
    reader.readAsDataURL(selected);
  };

  const handleRun = async (e) => {
    e?.preventDefault();
    if ((!prompt.trim() && !file) || loading) return;
    const currentPrompt = prompt.trim() || 'Please analyze this file.';
    const currentFile = file;
    setPrompt(''); setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setMessages(prev => [...prev, { role: 'user', content: currentPrompt, fileName: currentFile?.file?.name, imageUrl: currentFile?.previewUrl }]);
    setLoading(true);
    try {
      const payload = { prompt: currentPrompt };
      if (currentFile?.base64) payload.fileData = { base64: currentFile.base64, mimeType: currentFile.mimeType };
      const resp = await fetch(`${API_ROOT}/api/study`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.error || `Error ${resp.status}`);
      setMessages(prev => [...prev, { role: 'assistant', content: data.result || 'No response.' }]);
    } catch (err) {
      console.error('Study API Error:', err);
      setMessages(prev => [...prev, { role: 'system', content: `Connection Error: ${err.message}. (Target: ${API_ROOT})` }]);
    }
    setLoading(false);
  };

  const handleAudioOverview = async () => {
    if ((!prompt.trim() && !file) || loading) { alert('Enter a topic or attach a file to generate a podcast!'); return; }
    const currentPrompt = prompt.trim();
    const currentFile = file;
    setPrompt(''); setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setMessages(prev => [...prev, {
      role: 'user',
      content: currentPrompt ? `🎧 Generate Audio Overview: "${currentPrompt}"` : '🎧 Generate Audio Overview from uploaded file',
      fileName: currentFile?.file?.name, imageUrl: currentFile?.previewUrl
    }]);
    setLoading(true);
    try {
      const payload = { 
        prompt: currentPrompt,
        tone: podcastTone,
        detail: podcastDepth
      };
      if (currentFile?.base64) payload.fileData = { base64: currentFile.base64, mimeType: currentFile.mimeType };
      const resp = await fetch(`${API_ROOT}/api/audio-overview`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.error || 'Server error');
      setMessages(prev => [...prev, { role: 'assistant', isAudioOverview: true, podcast: data.result?.podcast || [], quiz: data.result?.quiz || [] }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'system', content: `Podcast Error: ${err.message}` }]);
    }
    setLoading(false);
  };

  const quickPrompts = [
    '🧠 Explain this like I\'m 15',
    '🧪 Give me 5 practice questions',
    '📝 Summarize in bullet points',
    '⚡ Create a mind map outline',
  ];

  return (
    <div className="flex flex-col h-full theme-bg relative">
      {/* Header */}
      <div className="flex-none px-4 pt-4 pb-0 z-10">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 0 20px rgba(99,102,241,0.5)' }}>
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black theme-text premium-heading">Study Corner <span className="text-[10px] opacity-30 font-mono ml-2">v2.1.0-HQ</span></h1>
              <p className="text-xs theme-text-muted">AI-powered learning tools</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl mb-0" style={{ background: 'var(--bg-faint)', border: '1px solid var(--border-faint)' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-black transition-all"
                style={{
                  background: activeTab === tab.id ? `linear-gradient(135deg, ${tab.color}25, ${tab.color}12)` : 'transparent',
                  color: activeTab === tab.id ? tab.color : 'var(--text-faint)',
                  boxShadow: activeTab === tab.id ? `inset 0 0 0 1px ${tab.color}40` : 'none',
                  opacity: activeTab === tab.id ? 1 : 0.8
                }}>
                <tab.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content: Record & Guide */}
      {activeTab !== 'chat' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            {activeTab === 'record' && <LectureRecorder />}
            {activeTab === 'guide' && <StudyGuideMaker />}
          </div>
        </div>
      )}

      {/* Chat tab */}
      {activeTab === 'chat' && (
        <>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-6 pb-4 pt-2">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 w-full ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-none w-9 h-9 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : msg.role === 'system' ? 'bg-red-900/50' : 'border border-indigo-500/30'}`}
                    style={{ background: msg.role === 'assistant' ? 'rgba(99,102,241,0.15)' : undefined }}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : msg.role === 'system' ? <span className="text-red-400 font-black text-xs">!</span> : <Bot className="w-4 h-4 text-indigo-400" />}
                  </div>

                  <div className={`rounded-2xl shadow-sm ${msg.role === 'user' ? 'rounded-tr-sm ml-auto' : 'rounded-tl-sm mr-auto'}`}
                    style={{
                      background: msg.role === 'user' ? '#4f46e5' : msg.role === 'system' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-elevated)',
                      border: msg.role === 'assistant' ? '1px solid var(--border-color)' : msg.role === 'system' ? '1px solid rgba(239, 68, 68, 0.2)' : 'none',
                      color: msg.role === 'user' ? 'white' : msg.role === 'system' ? '#f87171' : 'inherit',
                      padding: msg.isAudioOverview ? 0 : '1rem',
                      maxWidth: msg.isAudioOverview ? '100%' : '80%',
                    }}>
                    {(msg.imageUrl || msg.fileName) && (
                      <div className="mb-3 p-2 rounded-xl border theme-border w-fit" style={{ background: 'var(--bg-faint)' }}>
                        {msg.imageUrl
                          ? <img src={msg.imageUrl} alt="Uploaded" className="max-h-48 rounded object-contain" />
                          : <div className="flex items-center gap-2 px-2 py-1 text-sm theme-text-secondary"><Paperclip className="w-4 h-4" /><span className="truncate max-w-[200px]">{msg.fileName}</span></div>}
                      </div>
                    )}
                    <div className={`${msg.isAudioOverview ? 'w-full' : ''} ${msg.role === 'user' ? '' : 'prose theme-text prose-sm max-w-none leading-relaxed'}`}>
                      {msg.role === 'assistant'
                        ? msg.isAudioOverview
                          ? <AudioOverviewComponent podcast={msg.podcast} quiz={msg.quiz} />
                          : <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{msg.content}</ReactMarkdown>
                        : msg.content}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 flex-row">
                  <div className="flex-none w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                    <Bot className="w-4 h-4 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm p-4 flex items-center gap-3 theme-bg-elevated border theme-border">
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                    <span className="text-sm theme-text-secondary font-medium">Gemini is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <div className="flex-none p-4 pb-6 border-t theme-border relative z-20" style={{ background: 'var(--bg-primary)' }}>
            <div className="max-w-4xl mx-auto space-y-3">
              {/* Quick prompts */}
              <div className="flex gap-2 flex-wrap">
                {quickPrompts.map((p, i) => (
                  <button key={i} onClick={() => { setPrompt(p.replace(/^[^\s]+\s/, '')); }}
                    className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all hover:scale-105"
                    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--accent-blue)' }}>
                    {p}
                  </button>
                ))}
              </div>

              {/* File preview */}
              {file && (
                <div className="flex items-center gap-3 ml-1">
                  <div className="relative flex items-center gap-3 px-3 py-2 rounded-xl pr-10"
                    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}>
                    {file.previewUrl
                      ? <img src={file.previewUrl} alt="Preview" className="w-10 h-10 rounded object-cover" />
                      : <div className="w-10 h-10 rounded flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}><Paperclip className="w-4 h-4 text-indigo-400" /></div>}
                    <div>
                      <p className="text-sm font-semibold theme-text">{file.file.name}</p>
                      <p className="text-xs theme-text-secondary">{(file.file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={() => setFile(null)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-red-500/20 text-red-400 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Input row */}
              <div className="flex items-end gap-2 rounded-2xl p-2" style={{ background: 'var(--bg-faint)', border: '1px solid rgba(99,102,241,0.3)', boxShadow: '0 0 20px rgba(99,102,241,0.1)' }}>
                <button onClick={() => fileInputRef.current?.click()} disabled={loading}
                  className="p-2.5 rounded-xl transition-all hover:scale-110 flex-shrink-0"
                  style={{ background: 'var(--bg-faint)', color: 'var(--text-faint)' }}>
                  <Paperclip className="w-4 h-4" />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf,text/plain" />

                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRun(); } }}
                  placeholder="Message Gemini — ask anything, upload a file, or request a podcast..."
                  className="flex-1 bg-transparent text-sm font-medium focus:outline-none resize-none py-2 leading-normal theme-text"
                  rows={Math.min(prompt.split('\n').length, 5) || 1}
                  disabled={loading}
                  style={{ caretColor: '#818CF8' }}
                />

                <div className="flex gap-1.5 flex-shrink-0">
                  <div className="relative">
                    <button onClick={handleAudioOverview} disabled={(!prompt.trim() && !file) || loading}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-white font-bold text-xs transition-all hover:scale-105 disabled:opacity-40"
                      style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
                      <Headphones className="w-4 h-4" />
                      <span className="hidden sm:inline">Podcast</span>
                    </button>
                    <button onClick={() => setShowPodcastConfig(!showPodcastConfig)}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-white text-black border border-indigo-200 shadow-lg hover:scale-110 transition-all pointer-events-auto">
                      <Settings2 className="w-3 h-3" />
                    </button>
                    {showPodcastConfig && (
                      <div className="absolute bottom-full right-0 mb-3 w-48 p-4 rounded-2xl theme-bg-elevated border theme-border shadow-2xl z-50 animate-slideUp">
                        <h4 className="text-[10px] font-black theme-text-muted mb-3 tracking-widest uppercase">Podcast Tuning</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-bold theme-text-secondary block mb-1.5">Mood & Tone</label>
                            <div className="grid grid-cols-2 gap-1.5">
                              {['educational', 'casual', 'dramatic', 'energetic'].map(t => (
                                <button key={t} onClick={() => setPodcastTone(t)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold capitalize border transition-all ${podcastTone === t ? 'bg-indigo-500 text-white border-indigo-400' : 'theme-bg-faint theme-text-muted border-transparent'}`}>
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold theme-text-secondary block mb-1.5">Podcast Length</label>
                            <div className="grid grid-cols-2 gap-1.5">
                              {['standard', 'extra'].map(d => (
                                <button key={d} onClick={() => setPodcastDepth(d)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold capitalize border transition-all ${podcastDepth === d ? 'bg-indigo-500 text-white border-indigo-400' : 'theme-bg-faint theme-text-muted border-transparent'}`}>
                                  {d === 'extra' ? 'Deep Dive (30m)' : 'Standard (5m)'}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <button onClick={handleRun} disabled={(!prompt.trim() && !file) || loading}
                    className="p-2.5 rounded-xl text-white transition-all hover:scale-110 disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

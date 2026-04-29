import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Calendar, TrendingUp, Sparkles, Award, Users, Brain,
  ArrowRight, CheckCircle, Zap, Target, Clock, FileText, Bot,
  BarChart3, Star, Flame, Hash, Shield, MessageCircle
} from 'lucide-react';
import { useTheme } from './ThemeContext';

// Animated counter
function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const animate = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * target));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// Study Streak component
function StudyStreakCard({ navigate }) {
  const streak = parseInt(localStorage.getItem('studyStreak') || '0');
  const today = new Date().toDateString();
  const lastStudy = localStorage.getItem('lastStudyDate');
  const isActiveToday = lastStudy === today;

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  return (
    <div
      className="premium-card p-6 md:p-7 relative overflow-hidden cursor-pointer group transition-all hover:-translate-y-1"
      style={{ border: '1px solid rgba(255,107,0,0.2)', background: 'linear-gradient(135deg, rgba(255,107,0,0.06), rgba(139,92,246,0.04))' }}
      onClick={() => navigate('/study')}
    >
      {/* glow pulse */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.15) 0%, transparent 70%)', filter: 'blur(20px)' }} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8E53)', boxShadow: '0 0 24px rgba(255,107,0,0.4)' }}>
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest theme-text-muted">Study Streak</p>
            <p className="text-3xl font-black theme-text">{streak} <span className="text-base font-bold text-orange-400">days</span></p>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${isActiveToday ? 'text-emerald-400' : 'text-orange-400'}`}
          style={{ background: isActiveToday ? 'rgba(16,185,129,0.1)' : 'rgba(255,107,0,0.1)', border: `1px solid ${isActiveToday ? 'rgba(16,185,129,0.25)' : 'rgba(255,107,0,0.25)'}` }}>
          {isActiveToday ? '✓ Active' : 'Study Now →'}
        </div>
      </div>

      {/* Weekly bar */}
      <div className="flex gap-1.5">
        {days.map((d, i) => {
          const isToday = i === todayIdx;
          const isPast = i < todayIdx;
          const isActive = isPast || isToday;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full h-2 rounded-full transition-all"
                style={{
                  background: isActive
                    ? `linear-gradient(90deg, #FF6B00, #FF8E53)`
                    : 'var(--bg-faint)',
                  boxShadow: isActive ? '0 0 8px rgba(255,107,0,0.4)' : 'none',
                  opacity: isToday ? 1 : isPast ? 0.7 : 0.3
                }} />
              <span className="text-[9px] font-black theme-text-muted">{d}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const MalumHomePage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [userName, setUserName] = useState('');

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setUserName(user.name || 'Student');
    } catch {
      setUserName('Student');
    }
  }, []);

  const features = [
    {
      title: 'Study Corner',
      description: 'AI chat, lecture recorder, study guides, flashcards, and audio podcasts. Everything you need to ace any subject.',
      icon: Brain,
      path: '/study',
      gradient: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
      glow: 'rgba(139,92,246,0.35)',
      color: '#8B5CF6',
      tags: ['AI Chat', 'Lecture Recorder', 'Flashcards', 'Audio Podcasts'],
      badge: '🔥 Most Used',
    },
    {
      title: 'Classroom',
      description: 'Track every assignment from your teachers and Google Classroom in one unified, color-coded dashboard.',
      icon: Users,
      path: '/classroom',
      gradient: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
      glow: 'rgba(59,130,246,0.35)',
      color: '#3B82F6',
      tags: ['Google Classroom sync', 'Assignment tracking', 'Due dates'],
    },
    {
      title: 'Schedule',
      description: 'AI-powered daily planner and calendar. Get smart study time suggestions and never miss a deadline.',
      icon: Calendar,
      path: '/schedule',
      gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
      glow: 'rgba(245,158,11,0.35)',
      color: '#F59E0B',
      tags: ['AI planner', 'Calendar view', 'Deadline reminders'],
    },
    {
      title: 'GradeScout',
      description: 'GPA calculator, grade trends, letter grade breakdown, and optional school portal sync to see your official grades.',
      icon: TrendingUp,
      path: '/gradescout',
      gradient: 'linear-gradient(135deg, #10B981, #3B82F6)',
      glow: 'rgba(16,185,129,0.35)',
      color: '#10B981',
      tags: ['GPA calculator', 'Grade trends', 'School portal sync'],
    },
  ];

  const stats = [
    { label: 'Active Students', value: 2400, suffix: '+', icon: Users, color: '#8B5CF6' },
    { label: 'AI Queries / Day', value: 98, suffix: 'K', icon: Zap, color: '#FF6B00' },
    { label: 'Assignments Tracked', value: 500, suffix: 'K+', icon: CheckCircle, color: '#3B82F6' },
    { label: 'Uptime', value: 99, suffix: '%', icon: Shield, color: '#10B981' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden transition-colors duration-500" style={{ background: 'var(--bg-primary)' }}>

      {/* Subtle ambient glows only — no noisy grid/scanlines */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[900px] h-[900px] rounded-full"
          style={{ top: '-300px', left: '-200px', background: 'radial-gradient(circle, rgba(255,107,0,0.05) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        <div className="absolute w-[700px] h-[700px] rounded-full"
          style={{ top: '200px', right: '-200px', background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        <div className="absolute w-[600px] h-[600px] rounded-full"
          style={{ bottom: '0', left: '30%', background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 65%)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 w-full">

        {/* ====== HERO ====== */}
        <section className="pt-10 pb-12 px-6 md:px-10 xl:px-16">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">

              {/* Left: text */}
              <div className="flex-1">
                {/* Greeting pill */}
                <div className="inline-flex items-center gap-2.5 mb-6 px-5 py-2.5 rounded-full malum-fadeInUp stagger-1"
                  style={{ background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.18)' }}>
                  <span className="text-xl" style={{ animation: 'wiggle 2s ease-in-out infinite 1s' }}>👋</span>
                  <span className="font-black text-sm text-orange-400 tracking-wide">
                    Welcome back, <span className="text-white">{userName}</span>
                  </span>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 12px #10B981', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>

                <h1 className="text-5xl md:text-6xl xl:text-7xl font-black leading-[0.95] tracking-tight mb-6 malum-fadeInUp stagger-2">
                  <span className="block theme-text mb-1">Your Academic</span>
                  <span className="block shimmer-text">Command Center</span>
                </h1>

                <p className="text-lg md:text-xl theme-text-secondary font-medium leading-relaxed mb-8 max-w-xl malum-fadeInUp stagger-3">
                  Assignments, AI study tools, grades, and scheduling — all in one place so you can{' '}
                  <span className="malum-text-gradient font-bold">focus on what matters.</span>
                </p>

                <div className="flex flex-wrap gap-3 malum-fadeInUp stagger-4">
                  <button onClick={() => navigate('/study')} className="btn-primary">
                    <Sparkles className="h-5 w-5" />
                    Start Studying
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  <button onClick={() => navigate('/classroom')}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-105"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-faint)', color: 'var(--text-primary)' }}>
                    <Users className="h-5 w-5 text-blue-400" />
                    View Classroom
                  </button>
                </div>
              </div>

              {/* Right: streak + quick stats */}
              <div className="flex-1 max-w-md w-full lg:max-w-sm xl:max-w-md malum-fadeInUp stagger-3">
                <StudyStreakCard navigate={navigate} />

                <div className="grid grid-cols-2 gap-3 mt-3">
                  {[
                    { label: 'Study Tools', value: '6+', color: '#8B5CF6', icon: Brain },
                    { label: 'AI-Powered', value: '100%', color: '#FF6B00', icon: Zap },
                  ].map((s, i) => (
                    <div key={i} className="premium-card p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${s.color}15` }}>
                        <s.icon className="w-5 h-5" style={{ color: s.color }} />
                      </div>
                      <div>
                        <p className="text-xl font-black theme-text">{s.value}</p>
                        <p className="text-[10px] font-bold theme-text-muted uppercase tracking-wider">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====== STATS ROW ====== */}
        <section className="px-6 md:px-10 xl:px-16 pb-14">
          <div className="max-w-screen-xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((s, i) => (
                <div key={i} className="premium-card p-5 flex items-center gap-4 malum-fadeInUp"
                  style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${s.color}15` }}>
                    <s.icon className="w-6 h-6" style={{ color: s.color }} />
                  </div>
                  <div>
                    <div className="text-2xl font-black malum-text-gradient">
                      <AnimatedCounter target={s.value} suffix={s.suffix} />
                    </div>
                    <div className="text-[10px] font-black theme-text-muted uppercase tracking-wider">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== FEATURES GRID ====== */}
        <section className="px-6 md:px-10 xl:px-16 pb-14">
          <div className="max-w-screen-xl mx-auto">

            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3"
                  style={{ background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.2)' }}>
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs font-black text-orange-400 uppercase tracking-wider">Your Tools</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black theme-text leading-tight">
                  Everything in <span className="malum-text-gradient">one dashboard</span>
                </h2>
              </div>
              <p className="hidden md:block theme-text-muted text-sm font-medium max-w-xs text-right">
                Click any card to jump straight into that module
              </p>
            </div>

            {/* 2-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {features.map((f, i) => (
                <button
                  key={f.path}
                  onClick={() => navigate(f.path)}
                  className="text-left group premium-card p-7 relative overflow-hidden transition-all duration-400 hover:-translate-y-2 ripple malum-fadeInUp"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    border: `1px solid var(--border-faint)`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.border = `1px solid ${f.color}40`;
                    e.currentTarget.style.boxShadow = `0 20px 60px ${f.glow}`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.border = `1px solid var(--border-faint)`;
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  {/* Corner gradient */}
                  <div className="absolute top-0 right-0 w-36 h-36 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity duration-400 pointer-events-none"
                    style={{ background: f.gradient }} />

                  {/* Badge */}
                  {f.badge && (
                    <span className="absolute top-5 right-5 text-[10px] font-black px-2.5 py-1 rounded-full text-white"
                      style={{ background: f.gradient, boxShadow: `0 0 12px ${f.glow}` }}>
                      {f.badge}
                    </span>
                  )}

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-400 group-hover:scale-110 group-hover:rotate-3"
                      style={{ background: f.gradient, boxShadow: `0 8px 24px ${f.glow}` }}>
                      <f.icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Title + arrow */}
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-black theme-text group-hover:translate-x-0.5 transition-transform duration-300">{f.title}</h3>
                      <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
                        style={{ color: f.color }} />
                    </div>

                    <p className="theme-text-secondary text-sm md:text-base leading-relaxed mb-5">{f.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {f.tags.map((tag, j) => (
                        <span key={j} className="text-xs font-bold px-3 py-1.5 rounded-full transition-all group-hover:scale-105"
                          style={{
                            background: `${f.color}10`,
                            border: `1px solid ${f.color}25`,
                            color: f.color,
                            transitionDelay: `${j * 0.04}s`,
                          }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ====== STREAK FEATURE CALLOUT ====== */}
        <section className="px-6 md:px-10 xl:px-16 pb-16">
          <div className="max-w-screen-xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  emoji: '🎯',
                  title: 'Snap & Solve',
                  desc: 'Coming soon — photograph any problem and get a step-by-step AI explanation.',
                  color: '#8B5CF6',
                  tag: 'Coming Soon'
                },
                {
                  emoji: '👥',
                  title: 'Study Groups',
                  desc: 'Share flashcard sets, quiz each other, and study with friends in real time.',
                  color: '#3B82F6',
                  tag: 'Coming Soon'
                },
                {
                  emoji: '📊',
                  title: 'Weekly Recap',
                  desc: 'A shareable card with your study hours, GPA trend, and streak — post it to your story.',
                  color: '#10B981',
                  tag: 'Coming Soon'
                },
              ].map((item, i) => (
                <div key={i} className="premium-card p-6 flex flex-col gap-3 malum-fadeInUp"
                  style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="text-3xl">{item.emoji}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-black theme-text">{item.title}</h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                        style={{ background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}30` }}>
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-sm theme-text-muted leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== BOTTOM CTA ====== */}
        <section className="px-6 md:px-10 xl:px-16 pb-16">
          <div className="max-w-screen-xl mx-auto">
            <div className="rounded-3xl p-10 md:p-14 relative overflow-hidden text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255,107,0,0.08), rgba(139,92,246,0.06))',
                border: '1px solid rgba(255,107,0,0.15)',
              }}>
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.12) 0%, transparent 70%)', filter: 'blur(24px)' }} />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', filter: 'blur(24px)' }} />
              </div>
              <div className="relative z-10">
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current text-amber-400"
                      style={{ filter: 'drop-shadow(0 0 5px rgba(245,158,11,0.7))', animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <h2 className="text-3xl md:text-5xl font-black theme-text mb-3">
                  Ready to <span className="malum-text-gradient">level up</span>?
                </h2>
                <p className="theme-text-secondary font-medium mb-8 max-w-lg mx-auto text-base md:text-lg leading-relaxed">
                  Pick any tool above to get started. Malum is your academic superpower — free, forever.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button onClick={() => navigate('/study')} className="btn-primary">
                    <Sparkles className="h-5 w-5" />
                    Open Study Corner
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  <button onClick={() => navigate('/contact')}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-105"
                    style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', color: '#8B5CF6' }}>
                    <MessageCircle className="h-5 w-5" />
                    Contact Us
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
      <div className="h-16" />
    </div>
  );
};

export default MalumHomePage;
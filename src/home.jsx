import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, TrendingUp, Sparkles, Award, Users, Brain, ArrowRight, CheckCircle, Zap, Target, Clock, FileText, Bot, BarChart3, Star, Flame, Atom, GraduationCap } from 'lucide-react';
import { useTheme } from './ThemeContext';

// Floating particle component
function Particle({ style }) {
  return <div className="particle" style={style} />;
}

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

const MalumHomePage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [userName, setUserName] = useState('');
  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setUserName(user.name || 'Student');
    } catch {
      setUserName('Student');
    }
  }, []);

  // Generate particles (only for dark mode)
  const particles = isDark ? Array.from({ length: 20 }, (_, i) => ({
    width: `${Math.random() * 4 + 2}px`,
    height: `${Math.random() * 4 + 2}px`,
    left: `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 15 + 10}s`,
    animationDelay: `${Math.random() * 10}s`,
    background: i % 3 === 0
      ? 'rgba(255,107,0,0.6)'
      : i % 3 === 1
        ? 'rgba(139,92,246,0.6)'
        : 'rgba(59,130,246,0.5)',
  })) : [];

  const features = [
    {
      title: 'Study Corner',
      description: 'Your AI-powered study companion. Upload documents and files for instant AI analysis, get explanations on tough topics, and use the built-in study tools to prepare for exams.',
      icon: Brain,
      path: '/study',
      gradient: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
      glowColor: isDark ? 'rgba(139,92,246,0.4)' : 'transparent',
      borderHover: isDark ? 'rgba(139,92,246,0.5)' : 'rgba(139,92,246,0.2)',
      highlights: ['AI document analysis', 'Topic explanations', 'Exam preparation tools'],
      badge: 'Most Popular',
      badgeColor: '#8B5CF6',
      stat: '50+',
      statLabel: 'Topics',
    },
    {
      title: 'Classroom',
      description: 'Connect your Google Classroom account and see every assignment across all your classes in one unified dashboard. Track upcoming, missing, and completed work.',
      icon: Users,
      path: '/classroom',
      gradient: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
      glowColor: isDark ? 'rgba(59,130,246,0.4)' : 'transparent',
      borderHover: isDark ? 'rgba(59,130,246,0.5)' : 'rgba(59,130,246,0.2)',
      highlights: ['Google Classroom sync', 'Global to-do list', 'Assignment tracking'],
      stat: '∞',
      statLabel: 'Classes',
    },
    {
      title: 'Schedule',
      description: 'Plan your days with a built-in calendar and daily planner powered by Gemini AI. Get smart suggestions for study time and never miss a deadline again.',
      icon: Calendar,
      path: '/schedule',
      gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
      glowColor: isDark ? 'rgba(245,158,11,0.4)' : 'transparent',
      borderHover: isDark ? 'rgba(245,158,11,0.5)' : 'rgba(245,158,11,0.2)',
      highlights: ['AI daily planner', 'Calendar view', 'Deadline reminders'],
      stat: '24/7',
      statLabel: 'Planning',
    },
    {
      title: 'GradeScout',
      description: 'Track your grades across all courses with a built-in GPA calculator, letter grade breakdown, weighted averages, and animated grade rings. Connect your school portal for official grades.',
      icon: TrendingUp,
      path: '/gradescout',
      gradient: 'linear-gradient(135deg, #10B981, #3B82F6)',
      glowColor: 'rgba(16,185,129,0.4)',
      borderHover: 'rgba(16,185,129,0.5)',
      highlights: ['GPA calculator', 'Letter grade tracking', 'School portal integration'],
      stat: 'A+',
      statLabel: 'Grades',
    },
    {
      title: 'Learning Corner',
      description: 'Explore structured courses with units and subtopics, then test yourself with AI-generated quizzes. When stuck, ask the AI tutor to break down any concept.',
      icon: Award,
      path: '/khan',
      gradient: 'linear-gradient(135deg, #EC4899, #F43F5E)',
      glowColor: 'rgba(236,72,153,0.4)',
      borderHover: 'rgba(236,72,153,0.5)',
      highlights: ['Structured courses', 'AI-generated quizzes', 'AI doubt resolver'],
      badge: 'New',
      badgeColor: '#EC4899',
      stat: '100+',
      statLabel: 'Courses',
    },
    {
      title: 'Antigravity',
      description: 'AI-powered smart search built for students. Get instant deep research, simple explanations, or turn any topic into an interactive quiz — all in one beautiful interface.',
      icon: Atom,
      path: '/antigravity',
      gradient: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
      glowColor: 'rgba(99,102,241,0.4)',
      borderHover: 'rgba(99,102,241,0.5)',
      highlights: ['Deep Research mode', 'Explain Simply mode', 'Quiz Me mode'],
      badge: 'New',
      badgeColor: '#6366F1',
      stat: '∞',
      statLabel: 'Answers',
    },
    {
      title: 'College AI',
      description: 'Your personal college application advisor. Track your college list by tier, manage your application checklist, and chat with an AI counselor for essay help and admissions strategy.',
      icon: GraduationCap,
      path: '/college',
      gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
      glowColor: 'rgba(139,92,246,0.4)',
      borderHover: 'rgba(139,92,246,0.5)',
      highlights: ['College list tracker', 'Application checklist', 'AI essay advisor'],
      badge: 'New',
      badgeColor: '#8B5CF6',
      stat: '🎓',
      statLabel: 'Admission',
    },
  ];

  const stats = [
    { label: 'Active Students', value: 2400, suffix: '+' },
    { label: 'AI Interactions', value: 98, suffix: 'K' },
    { label: 'Assignments Tracked', value: 500, suffix: 'K+' },
    { label: 'Uptime', value: 99, suffix: '%' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden transition-colors duration-500" style={{ background: 'var(--bg-primary)' }}>

      {/* === PARTICLE FIELD === */}
      <div className="particle-container fixed inset-0 z-0">
        {particles.map((p, i) => <Particle key={i} style={p} />)}
      </div>

      {/* === AMBIENT GLOWS === */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[800px] h-[800px] rounded-full float"
          style={{ top: '-200px', left: '-100px', background: 'radial-gradient(circle, rgba(255,107,0,0.07) 0%, transparent 70%)', filter: 'blur(40px)', animationDelay: '0s' }}
        />
        <div className="absolute w-[600px] h-[600px] rounded-full float-reverse"
          style={{ top: '100px', right: '-100px', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', filter: 'blur(40px)', animationDelay: '2s' }}
        />
        <div className="absolute w-[500px] h-[500px] rounded-full float"
          style={{ bottom: '0', left: '30%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', filter: 'blur(40px)', animationDelay: '4s' }}
        />
      </div>

      {/* === MAIN CONTENT === */}
      <div className="relative z-10 w-full">

        {/* ====== HERO SECTION ====== */}
        <section className="relative pt-28 pb-16 px-4 overflow-hidden">
          <div className="max-w-5xl mx-auto text-center">

            {/* Greeting pill */}
            <div className="inline-flex items-center gap-3 mb-10 hero-pill malum-fadeInUp stagger-1"
              style={{ background: 'var(--bg-faint)', border: '1px solid var(--border-faint)' }}>
              <span className="text-2xl" style={{ animation: 'wiggle 2s ease-in-out infinite 1s' }}>👋</span>
              <span className="theme-text font-bold text-sm">
                Welcome back, <span className="malum-text-gradient">{userName}</span>!
              </span>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981', animation: 'pulse 2s ease-in-out infinite' }} />
              <span className="text-xs font-semibold" style={{ color: '#10B981' }}>Online</span>
            </div>

            {/* Main headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-none tracking-tight mb-8 malum-fadeInUp stagger-2">
              <span className="block mb-2 theme-text" style={{ textShadow: '0 4px 40px rgba(0,0,0,0.2)' }}>
                Your Academic
              </span>
              <span className="block shimmer-text">
                Command Center
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl leading-relaxed max-w-3xl mx-auto font-medium theme-text-secondary mb-14 malum-fadeInUp stagger-3">
              Malum brings together everything you need for school into one app — assignments, study tools,
              schedule, grades, and courses — so you can{' '}
              <span className="malum-text-gradient font-bold">focus on what matters.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 malum-fadeInUp stagger-4">
              <button
                onClick={() => navigate('/study')}
                className="btn-primary ripple"
              >
                <Sparkles className="h-5 w-5" />
                Start Studying
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/classroom')}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm transition-all hover:scale-105 hover:-translate-y-1"
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  backdropFilter: 'blur(12px)',
                  color: 'var(--text-primary)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                }}
              >
                <Users className="h-5 w-5 text-blue-400" />
                View Classroom
              </button>
            </div>
          </div>
        </section>

        {/* ====== FEATURE PILLS ====== */}
        <section className="px-4 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-3 malum-fadeInUp stagger-5">
              {[
                { icon: Bot, text: 'AI Study Assistant', color: '#8B5CF6' },
                { icon: CheckCircle, text: 'Assignment Tracker', color: '#3B82F6' },
                { icon: Clock, text: 'Smart Scheduling', color: '#F59E0B' },
                { icon: BarChart3, text: 'Grade Access', color: '#10B981' },
                { icon: FileText, text: 'Course Library', color: '#EC4899' },
                { icon: Zap, text: 'AI-Powered', color: '#FF6B00' },
              ].map((pill, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full cursor-default transition-all hover:scale-105 hover:-translate-y-1"
                  style={{
                    background: `${pill.color}12`,
                    border: `1px solid ${pill.color}25`,
                    backdropFilter: 'blur(12px)',
                    animationDelay: `${i * 0.07}s`,
                  }}
                >
                  <pill.icon className="h-4 w-4 flex-shrink-0" style={{ color: pill.color, filter: `drop-shadow(0 0 6px ${pill.color})` }} />
                  <span className="theme-text font-bold text-sm">{pill.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== STATS ROW ====== */}
        <section className="px-4 pb-32">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="text-center p-6 rounded-2xl malum-fadeInUp frosted-card"
                  style={{ animationDelay: `${0.4 + i * 0.1}s` }}
                >
                  <div className="text-3xl font-black malum-text-gradient mb-1">
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-xs font-semibold theme-text-muted uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== FEATURE DEEP DIVES ====== */}
        <section className="px-4 pb-28">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20 malum-fadeInUp" style={{ animationDelay: '0.5s' }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{ background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.2)' }}>
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Everything You Need</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black theme-text mb-4">
                One Dashboard.{' '}
                <span className="malum-text-gradient">Infinite Potential.</span>
              </h2>
              <p className="theme-text-secondary font-medium text-base max-w-2xl mx-auto">
                Each tool is built to solve a real problem students deal with every day. Click any card to jump straight in.
              </p>
            </div>

            <div className="space-y-7">
              {features.map((feature, index) => (
                <button
                  key={feature.path}
                  onClick={() => navigate(feature.path)}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className="w-full text-left group malum-fadeInUp ripple"
                  style={{ animationDelay: `${0.55 + index * 0.1}s` }}
                >
                  <div
                    className="relative rounded-2xl p-8 md:p-10 overflow-hidden transition-all duration-500"
                    style={{
                      background: hoveredFeature === index
                        ? `linear-gradient(135deg, ${feature.glowColor.replace('0.4', '0.06')} 0%, var(--bg-elevated) 100%)`
                        : 'var(--bg-elevated)',
                      border: `1px solid ${hoveredFeature === index ? feature.borderHover : 'var(--border-color)'}`,
                      boxShadow: hoveredFeature === index
                        ? `0 20px 60px ${feature.glowColor}, 0 0 0 1px ${feature.glowColor.replace('0.4', '0.15')}`
                        : '0 4px 20px rgba(0,0,0,0.2)',
                      transform: hoveredFeature === index ? 'translateY(-8px) scale(1.01)' : 'translateY(0) scale(1)',
                    }}
                  >
                    {/* Shimmer overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                      style={{ background: `linear-gradient(135deg, transparent 20%, ${feature.glowColor.replace('0.4', '0.08')} 50%, transparent 80%)` }} />

                    {/* Corner decoration */}
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                      style={{ background: feature.gradient }} />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
                      {/* Icon + Stat */}
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                          style={{
                            background: feature.gradient,
                            boxShadow: hoveredFeature === index ? `0 0 30px ${feature.glowColor}` : `0 8px 24px ${feature.glowColor.replace('0.4', '0.3')}`,
                          }}
                        >
                          <feature.icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-center hidden md:block">
                          <div className="text-2xl font-black" style={{ background: feature.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {feature.stat}
                          </div>
                          <div className="text-[10px] font-bold theme-text-muted uppercase tracking-wider">{feature.statLabel}</div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl md:text-2xl font-black theme-text group-hover:translate-x-1 transition-transform duration-300">
                            {feature.title}
                          </h3>
                          {feature.badge && (
                            <span
                              className="text-[11px] font-black px-2.5 py-1 rounded-full text-white"
                              style={{ background: feature.badgeColor, boxShadow: `0 0 12px ${feature.glowColor}`, animation: 'pulse 2s ease-in-out infinite' }}
                            >
                              {feature.badge}
                            </span>
                          )}
                          <ArrowRight
                            className="h-5 w-5 theme-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300"
                            style={{ color: feature.glowColor.replace(', 0.4)', '').replace('rgba(', 'rgb(') }}
                          />
                        </div>
                        <p className="theme-text-secondary font-medium text-sm md:text-base leading-relaxed mb-4">
                          {feature.description}
                        </p>

                        {/* Highlights */}
                        <div className="flex flex-wrap gap-2">
                          {feature.highlights.map((h, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all group-hover:scale-105"
                              style={{
                                background: hoveredFeature === index ? feature.glowColor.replace('0.4', '0.12') : 'var(--bg-faint)',
                                border: `1px solid ${hoveredFeature === index ? feature.borderHover.replace('0.5', '0.3') : 'var(--border-faint)'}`,
                                color: 'var(--text-primary)',
                                transitionDelay: `${i * 0.05}s`,
                              }}
                            >
                              <Zap className="h-3 w-3" style={{ color: feature.glowColor.replace(', 0.4)', '').replace('rgba(', 'rgb(') }} />
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ====== BOTTOM CTA ====== */}
        <section className="px-4 pb-32">
          <div className="max-w-3xl mx-auto text-center malum-fadeInUp" style={{ animationDelay: '0.9s' }}>
            <div
              className="relative rounded-3xl p-12 overflow-hidden"
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,107,0,0.2)',
                boxShadow: '0 0 80px rgba(255,107,0,0.1), inset 0 0 60px rgba(139,92,246,0.05)',
              }}
            >
              {/* Animated BG shapes */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full float" style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.15) 0%, transparent 70%)', filter: 'blur(20px)' }} />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full float-reverse" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', filter: 'blur(20px)' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full spin-slow" style={{ background: 'conic-gradient(from 0deg, rgba(255,107,0,0.05), transparent, rgba(139,92,246,0.05), transparent)', filter: 'blur(10px)' }} />
              </div>

              <div className="relative z-10">
                {/* Star rating */}
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current text-amber-400" style={{ filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.8))', animationDelay: `${i * 0.1}s`, animation: 'fadeInScale 0.5s ease forwards' }} />
                  ))}
                </div>
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center pulse-glow"
                  style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8E53)', boxShadow: '0 0 40px rgba(255,107,0,0.5)' }}>
                  <Sparkles className="h-8 w-8 text-white" style={{ animation: 'wiggle 3s ease-in-out infinite' }} />
                </div>
                <h3 className="text-2xl md:text-4xl font-black theme-text mb-3">
                  Ready to <span className="malum-text-gradient">level up</span>?
                </h3>
                <p className="theme-text-secondary font-medium mb-8 max-w-lg mx-auto text-base leading-relaxed">
                  Pick any tool from the sidebar or tap a card above to jump right in.
                  Malum is your academic superpower.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => navigate('/study')}
                    className="btn-primary"
                  >
                    <Sparkles className="h-5 w-5" />
                    Open Study Corner
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => navigate('/khan')}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-105"
                    style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.3)', color: '#ec4899' }}
                  >
                    <Award className="h-5 w-5" />
                    Explore Courses
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default MalumHomePage;
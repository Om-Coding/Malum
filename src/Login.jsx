import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, BookOpen, GraduationCap, ArrowRight, ArrowLeft, Landmark, Check, Zap, Brain, Award, Star, Heart, MessageCircle, Globe, Shield, Rocket, Send } from 'lucide-react';

/* ─── Role Picker Step ───────────────────────────────────────── */
function RolePicker({ onSelect }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [hovered, setHovered] = useState(null);
  const [subEmail, setSubEmail] = useState('');
  const [subSent, setSubSent] = useState(false);

  const roles = [
    {
      id: 'student',
      label: 'Student',
      desc: 'Join classes, track assignments, and access AI study tools.',
      icon: BookOpen,
      gradient: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
      glow: 'rgba(139,92,246,0.5)',
      border: 'rgba(139,92,246,0.4)',
      perks: ['AI Study Corner', 'Assignment Tracker', 'Smart Scheduler'],
      emoji: '📚',
    },
    {
      id: 'teacher',
      label: 'Teacher',
      desc: 'Create classes, assign work, and track student progress.',
      icon: GraduationCap,
      gradient: 'linear-gradient(135deg, #FF6B00, #FF8E53)',
      glow: 'rgba(255,107,0,0.5)',
      border: 'rgba(255,107,0,0.4)',
      perks: ['Create Classes', 'Send Assignments', 'Progress Analytics'],
      emoji: '🎓',
    },
  ];

  const features = [
    { icon: Brain, label: 'AI-Powered Study', desc: 'Chat, flashcards & podcasts', color: '#8B5CF6' },
    { icon: Rocket, label: 'College Prep', desc: 'Essay studio & application tracker', color: '#EC4899' },
    { icon: Shield, label: 'Grade Tracking', desc: 'Connect your school portal', color: '#10B981' },
    { icon: Star, label: 'Smart Scheduler', desc: 'Calendar & Google sync', color: '#F59E0B' },
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (subEmail.trim()) {
      setSubSent(true);
      setSubEmail('');
      setTimeout(() => setSubSent(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0a0a1a 0%, #0d1117 30%, #0f0a1e 60%, #0a0e1a 100%)' }}>

      {/* Animated mesh gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[800px] h-[800px] rounded-full"
          style={{ top: '-200px', left: '-200px', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 60%)', filter: 'blur(80px)', animation: 'float 12s ease-in-out infinite' }} />
        <div className="absolute w-[600px] h-[600px] rounded-full"
          style={{ top: '20%', right: '-150px', background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 60%)', filter: 'blur(80px)', animation: 'float 15s ease-in-out infinite reverse' }} />
        <div className="absolute w-[500px] h-[500px] rounded-full"
          style={{ bottom: '-100px', left: '30%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 60%)', filter: 'blur(80px)', animation: 'float 10s ease-in-out infinite' }} />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">

          {/* Hero */}
          <div className="text-center mb-14 fadeInUp">
            <div className="inline-flex items-center gap-3 mb-6">
              <img src="/malum-logo-round.png" alt="Malum" className="object-cover rounded-full overflow-hidden"
                style={{ width: '60px', height: '60px', clipPath: 'circle(50%)', filter: 'drop-shadow(0 0 20px rgba(255,107,0,0.5))' }} />
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 premium-heading" style={{ letterSpacing: '-0.04em', lineHeight: 1 }}>
              Your academic<br />
              <span className="malum-text-gradient">command center.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-medium max-w-xl mx-auto leading-relaxed">
              AI study tools, assignment tracking, college prep, and more — all in one beautiful platform built for students who aim higher.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12 fadeInUp" style={{ animationDelay: '0.08s' }}>
            {features.map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center p-4 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${f.color}18` }}>
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <p className="text-sm font-bold text-white mb-0.5">{f.label}</p>
                <p className="text-[11px] text-gray-500 font-medium">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Role Picker Title */}
          <div className="text-center mb-6 fadeInUp" style={{ animationDelay: '0.12s' }}>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-2">Get Started</p>
            <h2 className="text-2xl md:text-3xl font-black text-white premium-heading">Choose your role</h2>
          </div>

          {/* Role cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 fadeInUp" style={{ animationDelay: '0.16s' }}>
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => onSelect(role.id)}
                onMouseEnter={() => setHovered(role.id)}
                onMouseLeave={() => setHovered(null)}
                className="relative text-left rounded-2xl p-7 md:p-8 group overflow-hidden transition-all duration-500"
                style={{
                  background: hovered === role.id
                    ? `linear-gradient(165deg, ${role.glow.replace('0.5', '0.1')}, rgba(255,255,255,0.03))`
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${hovered === role.id ? role.border : 'rgba(255,255,255,0.06)'}`,
                  transform: hovered === role.id ? 'translateY(-6px)' : 'translateY(0)',
                  boxShadow: hovered === role.id ? `0 20px 60px ${role.glow.replace('0.5', '0.15')}` : 'none',
                }}
              >
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full pointer-events-none transition-all duration-700"
                  style={{
                    background: `radial-gradient(circle, ${role.glow.replace('0.5', '0.08')} 0%, transparent 70%)`,
                    opacity: hovered === role.id ? 1 : 0.2,
                    transform: hovered === role.id ? 'translate(10%, -20%)' : 'translate(30%, -40%)'
                  }} />

                <div className="relative z-10">
                  {/* Icon + Title */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-3 group-hover:scale-110"
                      style={{ background: role.gradient, boxShadow: `0 0 30px ${role.glow}` }}>
                      <role.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white premium-heading">{role.label}</h3>
                      <p className="text-sm text-gray-400 font-medium">{role.desc}</p>
                    </div>
                  </div>

                  {/* Perks */}
                  <ul className="space-y-2 mb-5">
                    {role.perks.map((perk, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm font-semibold text-gray-300">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: role.gradient }}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        {perk}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="flex items-center gap-2 font-black text-sm uppercase tracking-widest transition-all duration-300"
                    style={{
                      color: hovered === role.id ? 'white' : 'rgba(255,255,255,0.3)',
                      transform: hovered === role.id ? 'translateX(4px)' : 'translateX(0)',
                    }}>
                    Continue as {role.label}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer: Subscription + Contact */}
      <footer className="relative z-10 border-t border-white/[0.05]"
        style={{ background: 'rgba(0,0,0,0.3)' }}>
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">

            {/* Newsletter */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Stay Updated</h3>
              </div>
              <p className="text-sm text-gray-400 font-medium mb-4">
                Get notified about new AI features, study tools, and platform updates.
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={subEmail}
                    onChange={e => setSubEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>
                <button type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8E53)', boxShadow: '0 4px 16px rgba(255,107,0,0.3)' }}>
                  {subSent ? <><Check className="w-4 h-4" /> Sent!</> : <><Send className="w-4 h-4" /> Subscribe</>}
                </button>
              </form>
            </div>

            {/* Contact */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Contact</h3>
              </div>
              <div className="space-y-2.5">
                <a href="mailto:support@malum.app" className="flex items-center gap-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                  support@malum.app
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  <Globe className="w-3.5 h-3.5" />
                  @malumapp
                </a>
                <a href="https://discord.gg" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  <Heart className="w-3.5 h-3.5" />
                  Join our Discord
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 pt-6 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <img src="/malum-logo-round.png" alt="Malum" className="rounded-full" style={{ width: '20px', height: '20px', clipPath: 'circle(50%)' }} />
              <span className="text-xs font-bold text-gray-500">Malum — Your Academic Command Center</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
              <span>Privacy</span>
              <span>Terms</span>
              <span>© 2026 Malum</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .fadeInUp {
          opacity: 0;
          animation: fadeInUpKf 0.7s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes fadeInUpKf {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ─── Main Login Component ───────────────────────────────────── */
const MalumLogin = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  // Step: 'role' → 'form'
  const [step, setStep] = useState('role');
  const [role, setRole] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    gradingUrl: '',
  });

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep('form');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password, confirmPassword: formData.confirmPassword, role };

      const apiRoot = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiRoot}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        setLoading(false);
        return;
      }

      // Ensure role is honoured (login returns stored role; signup uses selected role)
      const userRecord = { ...data.user, role: data.user.role || role };
      localStorage.setItem('user', JSON.stringify(userRecord));

      if (formData.gradingUrl) {
        let url = formData.gradingUrl.trim();
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        localStorage.setItem('classroom_grading_url', url);
      }

      setLoading(false);
      navigate('/home');
    } catch (err) {
      // Fallback: backend offline → store locally (dev mode)
      if (formData.email && formData.password) {
        localStorage.setItem('user', JSON.stringify({
          email: formData.email,
          name: formData.name || formData.email.split('@')[0],
          role,
        }));
        if (formData.gradingUrl) {
          let url = formData.gradingUrl.trim();
          if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
          localStorage.setItem('classroom_grading_url', url);
        }
        setLoading(false);
        navigate('/home');
        return;
      }
      setError('Could not reach server. Make sure the backend is running.');
      setLoading(false);
    }
  };

  /* ── Role Picker screen ── */
  if (step === 'role') return <RolePicker onSelect={handleRoleSelect} />;

  /* ── Form screen ── */
  const isTeacher = role === 'teacher';
  const accentColor = isTeacher ? '#FF6B00' : '#8B5CF6';
  const accentGlow = isTeacher ? 'rgba(255,107,0,0.4)' : 'rgba(139,92,246,0.4)';
  const accentGradient = isTeacher
    ? 'linear-gradient(135deg, #FF6B00, #FF8E53)'
    : 'linear-gradient(135deg, #8B5CF6, #6366F1)';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden transition-colors duration-500"
      style={{ background: 'var(--bg-primary)' }}>

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[700px] h-[700px] rounded-full"
          style={{
            top: '-150px', left: isTeacher ? '-150px' : 'auto', right: isTeacher ? 'auto' : '-150px',
            background: isDark ? `radial-gradient(circle, ${accentGlow.replace('0.4', '0.06')} 0%, transparent 70%)` : 'transparent',
            filter: 'blur(40px)',
          }} />
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Back + Logo */}
        <div className="flex items-center gap-4 mb-8 fadeInUp">
          <button
            onClick={() => setStep('role')}
            className="flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-all hover:-translate-x-1 theme-text-muted hover:theme-text"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <img src="/malum-logo-round.png" alt="Malum" className="object-cover rounded-full overflow-hidden" style={{ width: '32px', height: '32px', clipPath: 'circle(50%)', filter: isDark ? `drop-shadow(0 0 8px ${accentGlow})` : 'none' }} />
            <span className="font-black text-xl malum-text-gradient">Malum</span>
          </div>
        </div>

        {/* Role badge */}
        <div className="flex items-center gap-2.5 mb-6 fadeInUp" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: `${accentGlow.replace('0.4', '0.12')}`, border: `1px solid ${accentGlow.replace('0.4', '0.3')}` }}>
            {isTeacher
              ? <GraduationCap className="w-4 h-4" style={{ color: accentColor }} />
              : <BookOpen className="w-4 h-4" style={{ color: accentColor }} />}
            <span className="text-xs font-black uppercase tracking-wider" style={{ color: accentColor }}>
              {isTeacher ? 'Teacher' : 'Student'}
            </span>
          </div>
          <div className="h-px flex-1 theme-border opacity-30" />
        </div>

        {/* Card */}
        <div className="premium-card overflow-hidden fadeInUp" style={{
          animationDelay: '0.1s',
          boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)`,
        }}>
          {/* Tab switcher */}
          <div className="flex border-b theme-border">
            {['Login', 'Sign Up'].map((tab, i) => {
              const active = (i === 0) === isLogin;
              return (
                <button
                  key={tab}
                  onClick={() => { setIsLogin(i === 0); setError(''); }}
                  className="flex-1 py-4 text-sm font-black transition-all"
                  style={{
                    color: active ? accentColor : 'var(--text-muted)',
                    borderBottom: active ? `2px solid ${accentColor}` : '2px solid transparent',
                    background: active ? `${accentGlow.replace('0.4', '0.06')}` : 'transparent',
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit} className="p-7 space-y-4">
            <div className="mb-6">
              <h2 className="text-3xl font-black theme-text mb-2 premium-heading">
                {isLogin ? 'Welcome back 👋' : 'Create your account 🎉'}
              </h2>
              <p className="text-sm font-medium theme-text-secondary">
                {isLogin ? `Sign in to continue as a ${role}` : `Join Malum as a ${role}`}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Name (signup only) */}
            {!isLogin && (
              <Field label="Full Name" icon={User} accentColor={accentColor} accentGlow={accentGlow}>
                <input
                  type="text" name="name" value={formData.name}
                  onChange={handleChange} placeholder="Your full name"
                  required={!isLogin}
                  className="w-full pl-12 pr-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all theme-text bg-transparent"
                  style={{ border: '1px solid var(--border-faint)' }}
                />
              </Field>
            )}

            {/* Email */}
            <Field label="Email Address" icon={Mail} accentColor={accentColor} accentGlow={accentGlow}>
              <input
                type="email" name="email" value={formData.email}
                onChange={handleChange} placeholder={isTeacher ? 'teacher@school.edu' : 'student@example.com'}
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all theme-text bg-transparent"
                style={{ border: '1px solid var(--border-faint)' }}
              />
            </Field>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider theme-text-muted">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password" value={formData.password}
                  onChange={handleChange} placeholder="Enter your password"
                  required
                  className="w-full pl-12 pr-11 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all theme-text bg-transparent"
                  style={{ border: '1px solid var(--border-faint)' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors theme-text-muted hover:theme-text">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (signup only) */}
            {!isLogin && (
              <Field label="Confirm Password" icon={Lock} accentColor={accentColor} accentGlow={accentGlow}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword" value={formData.confirmPassword}
                  onChange={handleChange} placeholder="Re-enter password"
                  required={!isLogin}
                  className="w-full pl-12 pr-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all theme-text bg-transparent"
                  style={{ border: '1px solid var(--border-faint)' }}
                />
              </Field>
            )}

            {/* Grading URL (optional, student only) */}
            {!isTeacher && (
              <Field label="Grading Portal URL (Optional)" icon={Landmark} accentColor={accentColor} accentGlow={accentGlow}>
                <input
                  type="text" name="gradingUrl" value={formData.gradingUrl}
                  onChange={handleChange} placeholder="powerschool.yourschool.edu"
                  className="w-full pl-12 pr-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all theme-text bg-transparent"
                  style={{ border: '1px solid var(--border-faint)' }}
                />
              </Field>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-black text-white text-sm transition-all flex items-center justify-center gap-2.5 mt-2"
              style={{
                background: loading ? 'rgba(255,255,255,0.1)' : accentGradient,
                boxShadow: loading ? 'none' : `0 0 30px ${accentGlow}, 0 8px 24px ${accentGlow.replace('0.4', '0.3')}`,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white" style={{ animation: 'spin 0.8s linear infinite' }} />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Perks reminder */}
            <div className="flex items-center justify-center gap-4 pt-2">
              {(isTeacher
                ? [{ icon: Zap, text: 'Create Classes' }, { icon: Award, text: 'Track Progress' }]
                : [{ icon: Brain, text: 'AI Tools' }, { icon: Zap, text: 'Smart Study' }]
              ).map((p, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs font-semibold theme-text-muted">
                  <p.icon className="w-3.5 h-3.5" style={{ color: accentColor, opacity: 0.7 }} />
                  {p.text}
                </div>
              ))}
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .fadeInUp { opacity: 0; animation: fadeInUpKf 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes fadeInUpKf {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: var(--text-faint-muted); }
        input:focus { border-color: ${accentColor} !important; box-shadow: 0 0 0 3px ${accentGlow.replace('0.4', '0.15')}; }
      `}</style>
    </div>
  );
};

/* ─── Reusable field wrapper ─────────────────────────────────── */
function Field({ label, icon: Icon, accentColor, accentGlow, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-black uppercase tracking-wider theme-text-muted">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none theme-text-muted" />
        {children}
      </div>
    </div>
  );
}

export default MalumLogin;
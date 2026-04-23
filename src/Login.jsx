import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, BookOpen, GraduationCap, ArrowRight, ArrowLeft, Landmark, Check, Zap, Brain, Award } from 'lucide-react';

/* ─── Role Picker Step ───────────────────────────────────────── */
function RolePicker({ onSelect }) {
  const [hovered, setHovered] = useState(null);

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: '#070710' }}>

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full top-[-100px] left-[-100px]"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'float 8s ease-in-out infinite' }} />
        <div className="absolute w-[500px] h-[500px] rounded-full bottom-[-100px] right-[-100px]"
          style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'float 10s ease-in-out infinite reverse' }} />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        {/* Logo */}
        <div className="text-center mb-12 fadeInUp">
          <div className="inline-flex items-center gap-3 mb-4">
            <img src="/malum-logo-round.png" alt="Malum" className="object-contain rounded-full" style={{ width: '56px', height: '56px', filter: isDark ? 'drop-shadow(0 0 16px rgba(255,107,0,0.5))' : 'none' }} />
            <span className="text-4xl font-black malum-text-gradient">Malum</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            Welcome! Who are you?
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', fontWeight: 500 }}>
            Choose your role to get started. You can always switch later.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 fadeInUp" style={{ animationDelay: '0.1s' }}>
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => onSelect(role.id)}
              onMouseEnter={() => setHovered(role.id)}
              onMouseLeave={() => setHovered(null)}
              className="relative text-left rounded-3xl p-7 transition-all duration-400 overflow-hidden ripple"
              style={{
                background: hovered === role.id
                  ? `linear-gradient(160deg, ${role.glow.replace('0.5', '0.08')}, rgba(255,255,255,0.02))`
                  : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${hovered === role.id ? role.border : 'rgba(255,255,255,0.07)'}`,
                boxShadow: (isDark && hovered === role.id) ? `0 20px 60px ${role.glow.replace('0.5', '0.25')}` : (hovered === role.id ? '0 10px 30px rgba(0,0,0,0.1)' : '0 4px 20px rgba(0,0,0,0.1)'),
                transform: hovered === role.id ? 'translateY(-8px) scale(1.01)' : 'translateY(0) scale(1)',
              }}
            >
              {/* Corner glow */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none transition-opacity duration-400"
                style={{ background: role.glow.replace('0.5', '0.12'), filter: 'blur(20px)', opacity: hovered === role.id ? 1 : 0 }} />

              <div className="relative z-10">
                {/* Icon + emoji */}
                <div className="flex items-start justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300"
                    style={{
                      background: role.gradient,
                      boxShadow: (isDark && hovered === role.id) ? `0 0 30px ${role.glow}` : 'none',
                      transform: hovered === role.id ? 'scale(1.1) rotate(3deg)' : 'scale(1) rotate(0deg)',
                    }}>
                    <role.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-3xl" style={{ animation: hovered === role.id ? 'wiggle 0.6s ease-in-out' : 'none' }}>
                    {role.emoji}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-white mb-2">{role.label}</h2>
                <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.55)', lineHeight: '1.6' }}>{role.desc}</p>

                {/* Perks */}
                <ul className="space-y-2 mb-6">
                  {role.perks.map((perk, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm font-semibold"
                      style={{ color: 'rgba(255,255,255,0.75)' }}>
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: role.gradient }}>
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                      {perk}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex items-center gap-2 font-bold text-sm transition-all duration-300"
                  style={{
                    color: hovered === role.id ? role.border.replace('0.4', '1') : 'rgba(255,255,255,0.4)',
                    transform: hovered === role.id ? 'translateX(4px)' : 'translateX(0)',
                  }}>
                  Continue as {role.label}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Malum · Your Academic Command Center
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
        .fadeInUp {
          opacity: 0;
          animation: fadeInUpKf 0.7s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes fadeInUpKf {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ripple { position: relative; overflow: hidden; }
        .ripple::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, rgba(255,255,255,0.08) 10%, transparent 10.01%);
          background-repeat: no-repeat;
          background-position: 50%;
          transform: scale(10,10);
          opacity: 0;
          transition: transform .5s, opacity .8s;
        }
        .ripple:active::after { transform: scale(0,0); opacity: 0.2; transition: 0s; }
      `}</style>
    </div>
  );
}

/* ─── Main Login Component ───────────────────────────────────── */
const MalumLogin = () => {
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: '#070710' }}>

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
            className="flex items-center gap-2 text-sm font-semibold transition-all hover:-translate-x-1"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <img src="/malum-logo-round.png" alt="Malum" className="object-contain rounded-full" style={{ width: '32px', height: '32px', filter: isDark ? `drop-shadow(0 0 8px ${accentGlow})` : 'none' }} />
            <span className="font-black text-lg malum-text-gradient">Malum</span>
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
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Card */}
        <div className="rounded-3xl overflow-hidden fadeInUp" style={{
          animationDelay: '0.1s',
          background: 'rgba(255,255,255,0.035)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)`,
        }}>
          {/* Tab switcher */}
          <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['Login', 'Sign Up'].map((tab, i) => {
              const active = (i === 0) === isLogin;
              return (
                <button
                  key={tab}
                  onClick={() => { setIsLogin(i === 0); setError(''); }}
                  className="flex-1 py-4 text-sm font-black transition-all"
                  style={{
                    color: active ? accentColor : 'rgba(255,255,255,0.35)',
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
              <h2 className="text-2xl font-black text-white mb-1">
                {isLogin ? 'Welcome back 👋' : 'Create your account 🎉'}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', fontWeight: 500 }}>
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
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all text-white"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </Field>
            )}

            {/* Email */}
            <Field label="Email Address" icon={Mail} accentColor={accentColor} accentGlow={accentGlow}>
              <input
                type="email" name="email" value={formData.email}
                onChange={handleChange} placeholder={isTeacher ? 'teacher@school.edu' : 'student@example.com'}
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all text-white"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </Field>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password" value={formData.password}
                  onChange={handleChange} placeholder="Enter your password"
                  required
                  className="w-full pl-11 pr-11 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all text-white"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
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
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all text-white"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </Field>
            )}

            {/* Grading URL (optional, student only) */}
            {!isTeacher && (
              <Field label="Grading Portal URL (Optional)" icon={Landmark} accentColor={accentColor} accentGlow={accentGlow}>
                <input
                  type="text" name="gradingUrl" value={formData.gradingUrl}
                  onChange={handleChange} placeholder="powerschool.yourschool.edu"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all text-white"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
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
                <div key={i} className="flex items-center gap-1.5 text-xs font-semibold"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
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
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:focus { border-color: ${accentColor} !important; box-shadow: 0 0 0 3px ${accentGlow.replace('0.4', '0.15')}; }
      `}</style>
    </div>
  );
};

/* ─── Reusable field wrapper ─────────────────────────────────── */
function Field({ label, icon: Icon, accentColor, accentGlow, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-black uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
        {children}
      </div>
    </div>
  );
}

export default MalumLogin;
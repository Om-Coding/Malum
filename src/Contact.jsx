import React, { useState } from 'react';
import { Mail, MessageCircle, Heart, Globe, Sparkles, Send, Check, Phone, Clock, Star, Users, Zap, Shield, ArrowRight, ExternalLink, Info, BookOpen, Rocket, Brain, Award, Target } from 'lucide-react';

export default function Contact() {
  const [activeTab, setActiveTab] = useState('about');
  const [subEmail, setSubEmail] = useState('');
  const [subSent, setSubSent] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (subEmail.trim()) {
      setSubSent(true);
      setSubEmail('');
      setTimeout(() => setSubSent(false), 3000);
    }
  };

  const handleFeedback = (e) => {
    e.preventDefault();
    if (feedbackText.trim()) {
      setFeedbackSent(true);
      setFeedbackText('');
      setFeedbackName('');
      setFeedbackEmail('');
      setTimeout(() => setFeedbackSent(false), 3000);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-[500px] h-[500px] rounded-full -top-20 -right-20"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full bottom-0 -left-20"
          style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.04) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-6 md:p-10 space-y-8">

        {/* Header */}
        <header>
          <div className="page-header mb-4">
            <div className="page-header-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}>
              <Info className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="page-header-title malum-text-gradient">Malum Info Hub</h1>
              <p className="page-header-subtitle">Learn about us, get in touch, and stay updated</p>
            </div>
          </div>

          {/* Mini Nav */}
          <div className="mini-nav">
            <button onClick={() => setActiveTab('about')} className={`mini-nav-item ${activeTab === 'about' ? 'active' : ''}`}>
              <BookOpen className="nav-icon" />
              About Us
            </button>
            <button onClick={() => setActiveTab('contact')} className={`mini-nav-item ${activeTab === 'contact' ? 'active' : ''}`}>
              <MessageCircle className="nav-icon" />
              Contact
            </button>
            <button onClick={() => setActiveTab('subscribe')} className={`mini-nav-item ${activeTab === 'subscribe' ? 'active' : ''}`}>
              <Sparkles className="nav-icon" />
              Subscribe
            </button>
          </div>
        </header>

        {/* ═══════════════ ABOUT TAB ═══════════════ */}
        {activeTab === 'about' && (
          <div className="space-y-8 malum-fadeInUp">

            {/* Hero mission */}
            <div className="premium-card p-8 md:p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8E53)', boxShadow: '0 0 40px rgba(255,107,0,0.3)' }}>
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black theme-text mb-3">Built for Students Who Aim Higher</h2>
              <p className="text-base theme-text-secondary max-w-2xl mx-auto leading-relaxed">
                Malum is an all-in-one academic platform that combines AI-powered study tools, assignment tracking, college preparation, and smart scheduling into one beautiful experience. We believe every student deserves access to intelligent tools that make learning more effective and engaging.
              </p>
            </div>

            {/* Platform stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Active Students', value: '2,500+', icon: Users, color: '#8B5CF6' },
                { label: 'AI Queries / Day', value: '10K+', icon: Zap, color: '#FF6B00' },
                { label: 'Uptime', value: '99.9%', icon: Shield, color: '#10B981' },
                { label: 'Avg. Rating', value: '4.9★', icon: Star, color: '#F59E0B' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:-translate-y-0.5"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${s.color}15` }}>
                    <s.icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="text-lg font-black theme-text">{s.value}</p>
                    <p className="text-[10px] font-bold theme-text-muted uppercase tracking-wider">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Key features */}
            <div>
              <h3 className="text-lg font-black theme-text mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-400" />
                What Makes Malum Different
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: Brain, title: 'AI Study Corner', desc: 'Chat with AI about any topic, record lectures and get instant transcripts, generate flashcards and study guides automatically.', color: '#8B5CF6' },
                  { icon: Award, title: 'College Prep Suite', desc: 'Track college applications, get AI-powered essay feedback, manage checklists, and receive personalized advice.', color: '#EC4899' },
                  { icon: BookOpen, title: 'Learning Corner', desc: 'Structured courses with quizzes across Math, Science, History, and more. Track progress and earn streaks.', color: '#3B82F6' },
                  { icon: Shield, title: 'Grade Tracking', desc: 'Connect your school grading portal and automatically track your GPA, assignments, and academic progress.', color: '#10B981' },
                  { icon: Zap, title: 'Smart Scheduler', desc: 'Calendar with Google Calendar sync, smart reminders, and automatic scheduling based on your priorities.', color: '#F59E0B' },
                  { icon: Rocket, title: 'Antigravity Search', desc: 'AI-powered search engine built for students. Quick answers, deep research, quizzes, and simple explanations.', color: '#6366F1' },
                ].map((f, i) => (
                  <div key={i} className="premium-card p-5 flex gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${f.color}15` }}>
                      <f.icon className="w-5 h-5" style={{ color: f.color }} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black theme-text mb-1">{f.title}</h4>
                      <p className="text-xs theme-text-secondary leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team / values */}
            <div className="premium-card p-6 md:p-8">
              <h3 className="text-lg font-black theme-text mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                Our Values
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Student First', desc: 'Every feature is designed with students in mind. We test with real students and iterate based on feedback.', emoji: '🎓' },
                  { title: 'Privacy Focused', desc: 'Your data stays yours. We never sell personal information and use encryption for everything.', emoji: '🔒' },
                  { title: 'Always Free', desc: 'Core tools are free forever. We believe quality education tools should be accessible to everyone.', emoji: '💜' },
                ].map((v, i) => (
                  <div key={i} className="p-4 rounded-xl" style={{ background: 'var(--bg-faint)', border: '1px solid var(--border-faint)' }}>
                    <div className="text-2xl mb-2">{v.emoji}</div>
                    <h4 className="text-sm font-black theme-text mb-1">{v.title}</h4>
                    <p className="text-xs theme-text-muted leading-relaxed">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ CONTACT TAB ═══════════════ */}
        {activeTab === 'contact' && (
          <div className="space-y-6 malum-fadeInUp">

            {/* Contact cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="mailto:support@malum.app"
                className="premium-card p-5 flex items-center gap-4 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(59,130,246,0.1)' }}>
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-black theme-text">support@malum.app</p>
                  <p className="text-xs theme-text-muted">General support & questions</p>
                </div>
                <ArrowRight className="w-5 h-5 theme-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              <a href="mailto:feedback@malum.app"
                className="premium-card p-5 flex items-center gap-4 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(16,185,129,0.1)' }}>
                  <MessageCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-black theme-text">feedback@malum.app</p>
                  <p className="text-xs theme-text-muted">Feature requests & ideas</p>
                </div>
                <ArrowRight className="w-5 h-5 theme-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>

            {/* Social links */}
            <div className="premium-card p-6">
              <h3 className="text-sm font-black uppercase tracking-wider theme-text-muted mb-4">Community & Social</h3>
              <div className="space-y-2">
                {[
                  { icon: Globe, label: '@malumapp', href: 'https://twitter.com', desc: 'Follow us on X for updates' },
                  { icon: Heart, label: 'Discord Community', href: 'https://discord.gg', desc: 'Join 500+ students studying together' },
                  { icon: ExternalLink, label: 'GitHub', href: 'https://github.com', desc: 'Open source & transparent' },
                ].map((s, i) => (
                  <a key={i} href={s.href} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl transition-all hover:-translate-y-0.5 group"
                    style={{ background: 'var(--bg-faint)', border: '1px solid var(--border-faint)' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(139,92,246,0.1)' }}>
                      <s.icon className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold theme-text">{s.label}</p>
                      <p className="text-[10px] theme-text-muted">{s.desc}</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 theme-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>

            {/* Feedback Form */}
            <div className="premium-card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(16,185,129,0.1)' }}>
                  <Send className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black theme-text">Send Us Feedback</h3>
                  <p className="text-xs theme-text-muted">We read every message — help us make Malum better</p>
                </div>
              </div>

              <form onSubmit={handleFeedback} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider theme-text-muted mb-1.5">Name</label>
                    <input type="text" value={feedbackName} onChange={e => setFeedbackName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-medium theme-text focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                      style={{ background: 'var(--bg-faint)', border: '1px solid var(--border-faint)' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider theme-text-muted mb-1.5">Email</label>
                    <input type="email" value={feedbackEmail} onChange={e => setFeedbackEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-medium theme-text focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                      style={{ background: 'var(--bg-faint)', border: '1px solid var(--border-faint)' }} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider theme-text-muted mb-1.5">Message</label>
                  <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)}
                    placeholder="Bug reports, feature ideas, questions — anything goes..."
                    required rows={4}
                    className="w-full px-4 py-2.5 rounded-xl text-sm font-medium theme-text resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                    style={{ background: 'var(--bg-faint)', border: '1px solid var(--border-faint)' }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs theme-text-muted">{feedbackText.length}/1000</span>
                  <button type="submit" disabled={!feedbackText.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: feedbackText.trim() ? '0 4px 16px rgba(16,185,129,0.3)' : 'none' }}>
                    {feedbackSent ? <><Check className="w-4 h-4" /> Sent!</> : <><Send className="w-4 h-4" /> Send Feedback</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ═══════════════ SUBSCRIBE TAB ═══════════════ */}
        {activeTab === 'subscribe' && (
          <div className="space-y-6 malum-fadeInUp">

            {/* Newsletter hero */}
            <div className="premium-card p-8 md:p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8E53)', boxShadow: '0 0 40px rgba(255,107,0,0.3)' }}>
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black theme-text mb-3">Stay in the Loop</h2>
              <p className="text-base theme-text-secondary max-w-lg mx-auto leading-relaxed mb-6">
                Get notified about new AI features, study tools, platform updates, and tips to boost your academic performance.
              </p>

              <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" />
                  <input type="email" value={subEmail} onChange={e => setSubEmail(e.target.value)}
                    placeholder="your@email.com" required
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium theme-text focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                    style={{ background: 'var(--bg-faint)', border: '1px solid var(--border-faint)' }} />
                </div>
                <button type="submit"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8E53)', boxShadow: '0 4px 16px rgba(255,107,0,0.3)' }}>
                  {subSent ? <><Check className="w-4 h-4" /> Done!</> : <><Send className="w-4 h-4" /> Subscribe</>}
                </button>
              </form>

              <div className="flex items-center justify-center gap-5 mt-5">
                {[
                  { icon: Shield, text: 'No spam ever' },
                  { icon: Clock, text: 'Max 1x/week' },
                  { icon: Heart, text: 'Free forever' },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs font-semibold theme-text-muted">
                    <p.icon className="w-3.5 h-3.5" />
                    {p.text}
                  </div>
                ))}
              </div>
            </div>

            {/* What you'll get */}
            <div>
              <h3 className="text-lg font-black theme-text mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-400" />
                What You'll Get
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Feature Announcements', desc: 'Be the first to try new AI tools, study modes, and platform improvements.', emoji: '🚀' },
                  { title: 'Study Tips', desc: 'Curated tips on effective studying, time management, and academic success.', emoji: '📚' },
                  { title: 'Community Updates', desc: 'Events, competitions, and ways to connect with other students on Malum.', emoji: '🤝' },
                ].map((item, i) => (
                  <div key={i} className="premium-card p-5">
                    <div className="text-2xl mb-3">{item.emoji}</div>
                    <h4 className="text-sm font-black theme-text mb-1">{item.title}</h4>
                    <p className="text-xs theme-text-muted leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-4 border-t theme-border">
          <p className="text-xs theme-text-muted">
            Built with 💜 for students who aim higher · © 2026 Malum
          </p>
        </div>
      </div>
    </div>
  );
}

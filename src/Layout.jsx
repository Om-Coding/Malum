import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, Calendar, TrendingUp, Sparkles, Award, Users, Menu, X, LogOut, Settings, Sun, Moon, Globe, MessageSquare, Palette, Check, ChevronRight, GraduationCap, Zap, Atom, Brain, Gamepad2, Folder, ChevronDown } from 'lucide-react';
import { useTheme } from './ThemeContext';

const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

function SettingsPanel({ isOpen, onClose, isDark }) {
    const { theme, setTheme } = useTheme();
    const [activeSection, setActiveSection] = useState('customize');
    const [language, setLanguage] = useState(() => localStorage.getItem('malum_language') || 'en');
    const [feedback, setFeedback] = useState('');
    const [toast, setToast] = useState('');

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000); };

    if (!isOpen) return null;

    const sections = [
        { id: 'customize', label: 'Customize', icon: Palette, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30' },
        { id: 'languages', label: 'Languages', icon: Globe, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
        { id: 'feedback', label: 'Feedback', icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[70]"
                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className="fixed top-20 right-0 z-[75] w-full sm:w-[420px] max-h-[calc(100vh-80px)] flex flex-col overflow-hidden premium-card !rounded-none !rounded-l-3xl border-white/10"
                style={{
                    background: isDark
                        ? 'linear-gradient(160deg, rgba(10,10,25,0.98) 0%, rgba(7,7,16,0.98) 100%)'
                        : 'linear-gradient(160deg, rgba(255,255,255,0.98) 0%, rgba(240,244,255,0.98) 100%)',
                    boxShadow: isDark
                        ? '-20px 0 60px rgba(0,0,0,0.6), -4px 0 20px rgba(139,92,246,0.05)'
                        : '-20px 0 60px rgba(99,102,241,0.1)',
                    animation: 'slideInRight 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
            >
                {/* Decorative top glow */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, height: '2px',
                    background: 'linear-gradient(90deg, transparent, #8B5CF6, #FF6B00, transparent)',
                    opacity: 0.7,
                }} />

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}` }}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366f1)', boxShadow: '0 0 16px rgba(139,92,246,0.5)' }}>
                            <Settings className="w-4 h-4 text-white" style={{ animation: 'spin-slow 8s linear infinite' }} />
                        </div>
                        <div>
                            <span className="font-black text-lg theme-text premium-heading">Settings</span>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 opacity-50">Configuration</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl transition-all theme-text-secondary hover:text-white"
                        style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}` }}>
                    {sections.map((s, i) => (
                        <button
                            key={s.id}
                            onClick={() => setActiveSection(s.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all flex-1 justify-center border ${activeSection === s.id
                                ? `${s.bg} ${s.color} ${s.border}`
                                : 'border-transparent theme-text-muted hover:theme-text-secondary'
                            }`}
                            style={{ animationDelay: `${i * 0.05}s` }}
                        >
                            <s.icon className="w-3.5 h-3.5" />
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Toast */}
                {toast && (
                    <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-emerald-400 text-xs font-bold"
                        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', animation: 'slideUp 0.3s ease' }}>
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                            <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                        {toast}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">

                    {/* Customize */}
                    {activeSection === 'customize' && (
                        <div className="space-y-4 fadeInScale">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] theme-text-muted px-1">Appearance</p>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    {
                                        id: 'dark', label: 'Dark', desc: 'Easy on the eyes',
                                        icon: Moon, iconColor: 'text-violet-400',
                                        iconBg: 'from-gray-800 to-gray-950',
                                        activeRing: 'border-violet-500',
                                        activeShadow: '0 0 20px rgba(139,92,246,0.25)',
                                        badgeBg: 'bg-violet-500',
                                    },
                                    {
                                        id: 'light', label: 'Light', desc: 'Clean & bright',
                                        icon: Sun, iconColor: 'text-amber-500',
                                        iconBg: 'from-amber-50 to-orange-50',
                                        activeRing: 'border-amber-500',
                                        activeShadow: '0 0 20px rgba(245,158,11,0.25)',
                                        badgeBg: 'bg-amber-500',
                                    },
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTheme(t.id)}
                                        className={`relative rounded-2xl p-4 text-left transition-all border-2 ${theme === t.id ? t.activeRing : 'theme-border'}`}
                                        style={{
                                            background: 'var(--bg-faint)',
                                            boxShadow: theme === t.id ? t.activeShadow : 'none',
                                        }}
                                    >
                                        {theme === t.id && (
                                            <div className={`absolute top-2.5 right-2.5 w-5 h-5 ${t.badgeBg} rounded-full flex items-center justify-center`} style={{ boxShadow: '0 0 10px currentColor', animation: 'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.iconBg} flex items-center justify-center mb-3 border border-white/10`}>
                                            <t.icon className={`w-5 h-5 ${t.iconColor}`} />
                                        </div>
                                        <p className="font-black text-sm theme-text">{t.label}</p>
                                        <p className="text-[11px] theme-text-muted mt-0.5">{t.desc}</p>
                                    </button>
                                ))}
                            </div>

                            {/* Accent Palette */}
                            <div className="rounded-2xl p-4 space-y-3" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}` }}>
                                <p className="text-xs font-bold theme-text-secondary">Accent Color</p>
                                <div className="flex gap-2.5">
                                    {[
                                        { cls: 'bg-violet-500', shadow: '0 0 12px rgba(139,92,246,0.7)' },
                                        { cls: 'bg-blue-500', shadow: '0 0 12px rgba(59,130,246,0.7)' },
                                        { cls: 'bg-emerald-500', shadow: '0 0 12px rgba(16,185,129,0.7)' },
                                        { cls: 'bg-rose-500', shadow: '0 0 12px rgba(244,63,94,0.7)' },
                                        { cls: 'bg-amber-500', shadow: '0 0 12px rgba(245,158,11,0.7)' },
                                        { cls: 'bg-cyan-500', shadow: '0 0 12px rgba(6,182,212,0.7)' },
                                    ].map((c, i) => (
                                        <button key={i}
                                            className={`w-7 h-7 rounded-full ${c.cls} transition-all hover:scale-125`}
                                            style={{ boxShadow: i === 0 ? c.shadow : 'none' }}
                                        />
                                    ))}
                                </div>
                                <p className="text-[11px] theme-text-muted">Coming soon</p>
                            </div>
                        </div>
                    )}

                    {/* Languages */}
                    {activeSection === 'languages' && (
                        <div className="space-y-3 fadeInScale">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] theme-text-muted px-1">Display Language</p>
                            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                                {LANGUAGES.map((lang, i) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => { setLanguage(lang.code); localStorage.setItem('malum_language', lang.code); showToast(`Language set to ${lang.name}`); }}
                                        className="w-full flex items-center justify-between px-4 py-3 text-left transition-all"
                                        style={{
                                            borderBottom: i < LANGUAGES.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` : 'none',
                                            background: language === lang.code ? (isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.05)') : 'transparent',
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{lang.flag}</span>
                                            <span className="text-sm font-semibold theme-text">{lang.name}</span>
                                        </div>
                                        {language === lang.code ? (
                                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center" style={{ boxShadow: '0 0 10px rgba(59,130,246,0.5)', animation: 'scaleIn 0.3s ease' }}>
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        ) : (
                                            <ChevronRight className="w-4 h-4 theme-text-muted opacity-50" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Feedback */}
                    {activeSection === 'feedback' && (
                        <div className="space-y-3 fadeInScale">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] theme-text-muted px-1">Send Feedback</p>
                            <div className="rounded-2xl p-4 space-y-3" style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                                <p className="text-sm theme-text-secondary">Help us make Malum better. We read every message.</p>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Bug reports, feature ideas, anything..."
                                    className="w-full h-28 rounded-xl p-3 text-sm resize-none focus:outline-none transition-all theme-text"
                                    style={{
                                        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                    }}
                                />
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] theme-text-muted">{feedback.length}/500</span>
                                    <button
                                        onClick={() => { if (feedback.trim()) { showToast('Thanks for your feedback!'); setFeedback(''); } }}
                                        disabled={!feedback.trim()}
                                        className="px-4 py-2 rounded-xl text-white text-xs font-bold transition-all disabled:opacity-40"
                                        style={{
                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                            boxShadow: feedback.trim() ? '0 0 20px rgba(16,185,129,0.4)' : 'none',
                                        }}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const [openFolders, setOpenFolders] = useState(['Study']); // Study open by default

    const toggleFolder = (name) => {
        setOpenFolders(prev => prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]);
    };

    useEffect(() => {
        setSidebarOpen(false);
        setSettingsOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const el = document.querySelector('main');
        if (!el) return;
        const handleScroll = () => setScrolled(el.scrollTop > 10);
        el.addEventListener('scroll', handleScroll);
        return () => el.removeEventListener('scroll', handleScroll);
    }, []);

    const isTeacher = (() => {
        try {
            const saved = localStorage.getItem('user');
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.role === 'teacher';
            }
        } catch { }
        return false;
    })();

    const navGroups = [
        {
            title: 'MAIN',
            items: [
                { to: '/home', icon: Home, label: 'Home', color: '#FF6B00', glow: 'rgba(255,107,0,0.4)' },
                { to: '/classroom', icon: Users, label: 'Classroom', color: '#3B82F6', glow: 'rgba(59,130,246,0.4)' },
                { to: '/schedule', icon: Calendar, label: 'Schedule', color: '#F59E0B', glow: 'rgba(245,158,11,0.4)' },
                { to: '/gradescout', icon: TrendingUp, label: 'GradeScout', color: '#10B981', glow: 'rgba(16,185,129,0.4)' },
            ]
        },
        {
            title: 'STUDY',
            isFolder: true,
            icon: Folder,
            color: '#8B5CF6',
            items: [
                { to: '/study', icon: BookOpen, label: 'Study Corner', color: '#8B5CF6', glow: 'rgba(139,92,246,0.4)' },
                { to: '/college', icon: Brain, label: 'College AI', color: '#8B5CF6', glow: 'rgba(139,92,246,0.4)' },
                { to: '/antigravity', icon: Atom, label: 'Antigravity', color: '#6366F1', glow: 'rgba(99,102,241,0.4)' },
                { to: '/khan', icon: Award, label: 'Learning Corner', color: '#EC4899', glow: 'rgba(236,72,153,0.4)' },
            ]
        },
        {
            title: 'EXTRA',
            isFolder: true,
            icon: Folder,
            color: '#F97316',
            items: [
                { to: '/games', icon: Gamepad2, label: 'Study Games', color: '#F97316', glow: 'rgba(249,115,22,0.4)' },
                ...(isTeacher ? [{ to: '/teacher', icon: GraduationCap, label: 'Teacher Dashboard', color: '#06B6D4', glow: 'rgba(6,182,212,0.4)' }] : []),
                { to: '#settings', icon: Settings, label: 'Settings', isAction: true, color: '#6366F1', glow: 'rgba(99,102,241,0.4)' },
            ]
        },
    ];

    const NavContent = ({ onItemClick }) => (
        <div className="space-y-1 px-2">
            {/* Brand in sidebar */}
            <div className="flex items-center gap-3.5 px-4 py-6 mb-4">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-lg" style={{ background: isDark ? 'rgba(255,107,0,0.4)' : 'transparent', animation: 'glow-breathe 4s infinite' }} />
                    <img src="/malum-logo-round.png" alt="Malum" className="relative z-10 object-cover rounded-full overflow-hidden" style={{ width: '48px', height: '48px', clipPath: 'circle(50%)', filter: isDark ? 'drop-shadow(0 0 12px rgba(255,107,0,0.6))' : 'none' }} />
                </div>
                <div>
                    <span className="font-black text-2xl malum-text-gradient block leading-none">Malum</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] theme-text-muted opacity-40">System Active</span>
                </div>
            </div>

            <div style={{ height: '1px', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', marginBottom: '16px', marginInline: '16px' }} />

            {navGroups.map((group, groupIdx) => {
                const isOpen = openFolders.includes(group.title);
                return (
                    <div key={group.title} className="mb-4 last:mb-0">
                        {group.isFolder ? (
                            <button
                                onClick={() => toggleFolder(group.title)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group hover:bg-white/5 mb-1"
                                style={{ color: group.color }}
                            >
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-110 flex-shrink-0"
                                    style={{ background: `${group.color}15` }}>
                                    <group.icon className="h-4 w-4" style={{ color: group.color }} />
                                </div>
                                <span className="font-black text-[10px] tracking-[0.2em] flex-1 text-left uppercase">
                                    {group.title}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                            </button>
                        ) : (
                            <p className="px-4 mb-2 text-[10px] font-black theme-text-muted tracking-[0.2em] opacity-40">
                                {group.title}
                            </p>
                        )}
                        <div className={`space-y-1 transition-all duration-300 overflow-hidden ${isOpen || !group.isFolder ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            {group.items.map((item, i) => (
                                <div key={item.to} className={`${group.isFolder ? 'pl-4' : ''} w-full`} style={{ animationDelay: `${(groupIdx * 4 + i) * 0.04}s` }}>
                                    {item.isAction ? (
                                        <button
                                            onClick={() => { onItemClick(); setSettingsOpen(true); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all nav-item-animate group"
                                            style={{ color: 'var(--text-secondary)' }}
                                        >
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                                                style={{ background: `${item.color}18` }}>
                                                <item.icon className="h-4 w-4" style={{ color: item.color }} />
                                            </div>
                                            <span className="font-semibold text-sm flex-1 text-left">{item.label}</span>
                                        </button>
                                    ) : (
                                        <NavLink
                                            to={item.to}
                                            onClick={onItemClick}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 nav-item-animate group ${isActive ? 'premium-card' : ''}`
                                            }
                                            style={({ isActive }) => ({
                                                background: isActive
                                                    ? `linear-gradient(135deg, ${item.color}1a, ${item.color}05)`
                                                    : 'transparent',
                                                color: isActive ? 'white' : 'rgba(255,255,255,0.45)',
                                                border: isActive ? `1px solid ${item.color}40` : '1px solid transparent',
                                            })}
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 flex-shrink-0"
                                                        style={{
                                                            background: isActive ? item.color : `${item.color}15`,
                                                            boxShadow: (isDark && isActive) ? `0 0 20px ${item.glow}` : 'none',
                                                        }}>
                                                        <item.icon className="h-4 w-4" style={{ color: isActive ? 'white' : item.color, filter: (isDark && isActive) ? `drop-shadow(0 0 4px rgba(255,255,255,0.5))` : 'none' }} />
                                                    </div>
                                                    <span className={`font-bold text-sm flex-1 ${isActive ? 'premium-glow-text' : ''}`}>{item.label}</span>
                                                    {isActive && (
                                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, boxShadow: `0 0 12px ${item.color}`, animation: 'pulse-glow 2s infinite', flexShrink: 0 }} />
                                                    )}
                                                </>
                                            )}
                                        </NavLink>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="min-h-screen font-sans flex flex-col" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {/* Top Navbar */}
            <nav
                className="fixed w-full z-[60] h-20 flex items-center px-6 justify-between transition-all duration-500"
                style={{
                    background: scrolled
                        ? (isDark ? 'rgba(7,7,16,0.95)' : 'rgba(240,244,255,0.95)')
                        : (isDark ? 'rgba(7,7,16,0.7)' : 'rgba(255,255,255,0.7)'),
                    backdropFilter: 'blur(24px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(200%)',
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.1)'}`,
                    boxShadow: scrolled
                        ? (isDark ? '0 8px 40px rgba(0,0,0,0.5)' : '0 8px 40px rgba(99,102,241,0.1)')
                        : 'none',
                }}
            >
                {/* Left: menu + logo */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { setSidebarOpen(!sidebarOpen); setSettingsOpen(false); }}
                        className="p-2 rounded-xl transition-all focus:outline-none theme-text-secondary hover:theme-text group"
                        style={{ background: sidebarOpen ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'transparent' }}
                    >
                        <div style={{ transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', transform: sidebarOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </div>
                    </button>

                    <NavLink to="/home" className="font-black flex items-center gap-2 group">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full blur-md" style={{ background: isDark ? 'rgba(255,107,0,0.4)' : 'transparent', animation: isDark ? 'glow-breathe 3s ease-in-out infinite' : 'none' }} />
                            <img src="/malum-logo-round.png" alt="Malum" className="relative z-10 object-cover rounded-full overflow-hidden group-hover:rotate-12 transition-transform duration-500" style={{ width: '32px', height: '32px', clipPath: 'circle(50%)', filter: isDark ? 'drop-shadow(0 0 6px rgba(255,107,0,0.6))' : 'none' }} />
                        </div>
                        <span className="text-xl malum-text-gradient tracking-tight">Malum</span>
                    </NavLink>

                    {/* Current page indicator */}
                    <div className="hidden sm:flex items-center gap-1.5 ml-1">
                        <ChevronRight className="w-3.5 h-3.5 theme-text-muted opacity-50" />
                        <span className="text-xs font-semibold theme-text-secondary capitalize">
                            {location.pathname.replace('/', '') || 'home'}
                        </span>
                    </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-1.5">
                    {/* Sparkle badge */}
                    <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full mr-2"
                        style={{ background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.2)' }}>
                        <Zap className="w-3 h-3 text-orange-400" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                        <span className="text-[11px] font-bold text-orange-400">AI-Powered</span>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl theme-text-secondary transition-all hover:scale-110"
                        style={{ background: 'var(--bg-faint)' }}
                        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        <div style={{ transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)', transform: isDark ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
                        </div>
                    </button>

                    <button
                        onClick={() => { setSettingsOpen(!settingsOpen); setSidebarOpen(false); }}
                        className="p-2 rounded-xl transition-all hover:scale-110"
                        style={{
                            background: settingsOpen
                                ? (isDark ? 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1))' : 'rgba(139,92,246,0.1)')
                                : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                            color: settingsOpen ? '#8B5CF6' : 'var(--text-secondary)',
                            boxShadow: (isDark && settingsOpen) ? '0 0 16px rgba(139,92,246,0.3)' : 'none',
                        }}
                        title="Settings"
                    >
                        <Settings className="h-4 w-4" style={{ animation: settingsOpen ? 'spin-slow 4s linear infinite' : 'none' }} />
                    </button>
                </div>
            </nav>

            <div className="flex flex-1 pt-20 h-[calc(100vh-80px)] overflow-hidden">
                {/* Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-[55] flex">
                        <div
                            className="fixed inset-0"
                            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', animation: 'fadeInScale 0.2s ease' }}
                            onClick={() => setSidebarOpen(false)}
                        />
                        <aside
                            className="relative w-68 h-full flex flex-col pt-[80px] z-50 overflow-y-auto custom-scrollbar"
                            style={{
                                width: '272px',
                                background: isDark
                                    ? 'linear-gradient(160deg, rgba(12,12,24,0.99) 0%, rgba(8,8,18,0.99) 100%)'
                                    : 'linear-gradient(160deg, rgba(255,255,255,0.99) 0%, rgba(240,244,255,0.99) 100%)',
                                borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.12)'}`,
                                boxShadow: isDark ? '8px 0 40px rgba(0,0,0,0.5)' : '8px 0 40px rgba(99,102,241,0.1)',
                                animation: 'slideInLeft 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            }}
                        >
                            {/* Top glow strip - hide in light mode */}
                            {isDark && <div style={{ position: 'absolute', top: 80, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,107,0,0.3), transparent)' }} />}

                            <nav className="flex-1 py-4">
                                <NavContent onItemClick={() => setSidebarOpen(false)} />
                            </nav>

                            <div className="p-3" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                                <button
                                    onClick={() => { setSidebarOpen(false); navigate('/login'); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all group"
                                    style={{
                                        color: 'var(--text-secondary)',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                                        background: 'transparent',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'; }}
                                >
                                    <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                                    Logout
                                </button>
                                <p className="text-[10px] theme-text-muted text-center mt-3 font-medium">Malum v2.0 · © 2026</p>
                            </div>
                        </aside>
                    </div>
                )}

                {/* Settings Panel */}
                <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} isDark={isDark} />

                {/* Main Content */}
                <main className="flex-1 h-full overflow-y-auto custom-scrollbar relative hud-grid hud-scanline">
                    <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-10 lg:py-16">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
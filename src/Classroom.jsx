import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Calendar, GraduationCap, Sparkles, Trophy, AlertCircle, BookOpen, Zap, Hash, X, UserPlus, School } from 'lucide-react';
import GoogleClassroom from './GoogleClassroom';

const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_ROOT}/api/assignments`;

function AssignmentCard({ assignment, user, onMarkComplete, completing }) {
  const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();
  const isCompleting = completing === assignment.id;

  return (
    <div
      className="relative premium-card p-6 overflow-hidden transition-all duration-400 group theme-border"
      style={{
        boxShadow: isOverdue ? '0 10px 30px rgba(239,68,68,0.15)' : '0 10px 30px rgba(0,0,0,0.1)',
        transform: 'translateY(0)',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = isOverdue ? '0 12px 40px rgba(239,68,68,0.15)' : '0 12px 40px rgba(0,0,0,0.25)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isOverdue ? '0 4px 20px rgba(239,68,68,0.1)' : '0 4px 20px rgba(0,0,0,0.15)'; }}
    >
      {/* Top color strip */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: isOverdue ? 'linear-gradient(90deg, #ef4444, #f97316)' : 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />

      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: isOverdue ? 'radial-gradient(circle at 50% 0%, rgba(239,68,68,0.05) 0%, transparent 70%)' : 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.05) 0%, transparent 70%)' }} />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}>
                {assignment.subject}
              </span>
              {isOverdue && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', animation: 'pulse 2s ease-in-out infinite' }}>
                  <AlertCircle className="w-3 h-3" />
                  Overdue
                </span>
              )}
            </div>
            <h4 className="text-lg font-black theme-text group-hover:translate-x-0.5 transition-transform duration-300">
              {assignment.title}
            </h4>
            {assignment.description && (
              <p className="text-sm theme-text-secondary mt-1.5 leading-relaxed line-clamp-2">{assignment.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-4 text-xs theme-text-muted">
            <span className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.1)' }}>
                <GraduationCap className="w-3 h-3 text-purple-400" />
              </div>
              {assignment.teacherName}
            </span>
            {assignment.dueDate && (
              <span className={`flex items-center gap-1.5 font-semibold ${isOverdue ? 'text-red-400' : 'theme-text-muted'}`}>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${isOverdue ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                  <Calendar className={`w-3 h-3 ${isOverdue ? 'text-red-400' : 'text-amber-400'}`} />
                </div>
                {new Date(assignment.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>

          <button
            onClick={() => onMarkComplete(assignment.id)}
            disabled={isCompleting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold transition-all ripple"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              boxShadow: '0 4px 16px rgba(16,185,129,0.35)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05) translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(16,185,129,0.35)'; }}
          >
            {isCompleting ? (
              <div className="w-4 h-4 border-2 rounded-full" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin-slow 0.8s linear infinite' }} />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Classroom() {
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('user');
      if (saved) setUser(JSON.parse(saved));
    } catch { }
  }, []);

  useEffect(() => {
    if (user?.email) {
      fetchAssignments();
      fetchClasses();
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}?email=${encodeURIComponent(user.email)}&role=student`);
      const data = await res.json();
      setAssignments(data.assignments || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch(`${API_ROOT}/api/classes?email=${encodeURIComponent(user.email)}&role=student`);
      const data = await res.json();
      setClasses(data.classes || []);
    } catch { }
  };

  const joinClass = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    setJoinError('');
    setJoinSuccess('');
    try {
      const res = await fetch(`${API_ROOT}/api/classes/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode: joinCode.toUpperCase().trim(), studentEmail: user.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setJoinSuccess(`Joined "${data.class.name}" successfully! 🎉`);
        setJoinCode('');
        fetchClasses();
        fetchAssignments();
        setTimeout(() => { setJoinSuccess(''); setShowJoinModal(false); }, 2500);
      } else {
        setJoinError(data.error || 'Failed to join class');
      }
    } catch {
      setJoinError('Could not reach server.');
    }
    setJoining(false);
  };

  const markComplete = async (id) => {
    setCompleting(id);
    try {
      const res = await fetch(`${API_URL}/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      if (res.ok) fetchAssignments();
    } catch (err) {
      console.error('Error completing assignment:', err);
    } finally {
      setCompleting(null);
    }
  };

  const pendingAssignments = assignments.filter(a => !a.completions?.[user?.email]?.completed);
  const completedAssignments = assignments.filter(a => a.completions?.[user?.email]?.completed);
  const overdueCount = pendingAssignments.filter(a => a.dueDate && new Date(a.dueDate) < new Date()).length;

  return (
    <div className="min-h-screen overflow-x-hidden transition-colors duration-300" style={{ background: 'var(--bg-primary)' }}>

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-[600px] h-[600px] rounded-full float"
          style={{ top: '-100px', right: '-100px', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full float-reverse"
          style={{ bottom: '100px', left: '-80px', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-8 md:p-14 space-y-12">

        {/* HEADER */}
        <header className="malum-fadeInUp">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex flex-col mb-4">
                <span className="text-[10px] font-black theme-text-muted uppercase tracking-[0.2em] mb-3 pl-1">Unified Hub</span>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-500/10 border border-orange-500/20">
                    <FileText className="w-4 h-4 text-orange-500" />
                  </div>
                  <h1 className="text-3xl font-bold theme-text tracking-tight">Assigned to You</h1>
                </div>
                <p className="text-[10px] font-bold theme-text-muted uppercase tracking-widest mt-2">Direct from Teachers</p>
              </div>
            </div>

            {/* Join class button */}
            {user && (
              <button
                onClick={() => setShowJoinModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', boxShadow: '0 4px 16px rgba(59,130,246,0.35)' }}
              >
                <UserPlus className="w-4 h-4" />
                Join a Class
              </button>
            )}

            {/* Quick stats */}
            {user && !loading && (
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: 'Pending', value: pendingAssignments.length, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: Clock },
                  { label: 'Overdue', value: overdueCount, color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: AlertCircle },
                  { label: 'Done', value: completedAssignments.length, color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle2 },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl fadeInScale"
                    style={{ background: stat.bg, border: `1px solid ${stat.color}30`, animationDelay: `${i * 0.1}s` }}>
                    <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                    <div>
                      <div className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: stat.color, opacity: 0.8 }}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* JOIN CLASS MODAL */}
        {showJoinModal && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease' }}>
            <div className="w-full max-w-md rounded-3xl p-7 space-y-5"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', boxShadow: '0 30px 80px rgba(0,0,0,0.5)', animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', boxShadow: '0 0 20px rgba(59,130,246,0.4)' }}>
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black theme-text">Join a Class</h3>
                    <p className="text-xs theme-text-muted">Enter the code your teacher shared</p>
                  </div>
                </div>
                <button onClick={() => { setShowJoinModal(false); setJoinError(''); setJoinSuccess(''); setJoinCode(''); }}
                  className="p-2 rounded-xl theme-text-muted hover:theme-text transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {joinSuccess ? (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-emerald-400 text-sm"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                  ✅ {joinSuccess}
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={joinCode}
                      onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError(''); }}
                      onKeyDown={e => e.key === 'Enter' && joinClass()}
                      placeholder="ABC12X"
                      maxLength={6}
                      className="flex-1 px-4 py-3 rounded-xl theme-bg border theme-border theme-text font-black text-xl text-center tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all uppercase"
                    />
                    <button
                      onClick={joinClass}
                      disabled={joining || joinCode.length < 4}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-black text-sm transition-all disabled:opacity-50 hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', boxShadow: '0 4px 16px rgba(59,130,246,0.35)' }}
                    >
                      {joining
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : 'Join'}
                    </button>
                  </div>
                  {joinError && (
                    <p className="text-sm font-semibold text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />{joinError}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ENROLLED CLASSES */}
        {classes.length > 0 && (
          <div className="space-y-3 malum-fadeInUp">
            <h2 className="text-base font-black theme-text flex items-center gap-2">
              <School className="w-4 h-4 text-blue-400" />
              My Classes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {classes.map(cls => (
                <div key={cls.id} className="rounded-2xl p-5 transition-all"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(59,130,246,0.12)' }}>
                      <School className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black theme-text text-sm truncate">{cls.name}</p>
                      <p className="text-xs theme-text-muted">{cls.subject}</p>
                    </div>
                  </div>
                  <p className="text-xs theme-text-muted">Teacher: <span className="theme-text-secondary">{cls.teacherName || cls.teacherEmail}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ASSIGNED WORK */}
        {user && (
          <div className="space-y-8 malum-fadeInUp stagger-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(255,107,0,0.2), rgba(245,158,11,0.15))', border: '1px solid rgba(255,107,0,0.2)' }}>
                <GraduationCap className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black theme-text premium-heading">Assigned to You</h2>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Direct from teachers</p>
              </div>
              {!loading && assignments.length > 0 && (
                <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.2)' }}>
                  <Zap className="w-3 h-3 text-orange-400" />
                  <span className="text-xs font-bold text-orange-400">{assignments.length} total</span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full" style={{ border: '2px solid rgba(255,255,255,0.05)', borderTopColor: '#fff', animation: 'spin-slow 1s linear infinite' }} />
                </div>
                <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Synchronizing Assignments...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-12 theme-bg-elevated border theme-border rounded-xl relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-10 h-10 mx-auto mb-4 rounded-full border border-orange-500/20 flex items-center justify-center">
                    <CheckSquare className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-lg font-bold theme-text mb-1">All clear! 🎉</p>
                  <p className="text-xs font-medium theme-text-muted max-w-xs mx-auto">When your teacher assigns work, it'll appear here.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Pending */}
                {pendingAssignments.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(245,158,11,0.15)' }}>
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <h3 className="text-sm font-black theme-text-secondary uppercase tracking-wider">
                        Pending
                      </h3>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.25)' }}>
                        {pendingAssignments.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {pendingAssignments.map((a, i) => (
                        <div key={a.id} style={{ animationDelay: `${i * 0.08}s` }}>
                          <AssignmentCard
                            assignment={a}
                            user={user}
                            onMarkComplete={markComplete}
                            completing={completing}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed */}
                {completedAssignments.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(16,185,129,0.15)' }}>
                        <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <h3 className="text-sm font-black theme-text-secondary uppercase tracking-wider">
                        Completed
                      </h3>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}>
                        {completedAssignments.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {completedAssignments.map((a, i) => (
                        <div
                          key={a.id}
                          className="rounded-2xl p-4 transition-all hover:-translate-y-1 duration-300"
                          style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid rgba(16,185,129,0.15)',
                            opacity: 0.85,
                            animationDelay: `${i * 0.08}s`,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(16,185,129,0.15)', boxShadow: '0 0 12px rgba(16,185,129,0.2)' }}>
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-black theme-text truncate">{a.title}</h4>
                              <p className="text-xs font-semibold mt-0.5" style={{ color: '#10B981' }}>
                                ✓ Completed {new Date(a.completions[user.email].completedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Google Classroom Integration */}
        <div
          className="malum-fadeInUp"
          style={{ borderTop: '1px solid var(--border-color)', paddingTop: '3rem', marginTop: '1rem', animationDelay: '0.4s' }}
        >
          <GoogleClassroom />
        </div>
      </div>
    </div>
  );
}

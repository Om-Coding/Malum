import React, { useState, useEffect } from 'react';
import { Users, Shield, RefreshCw, Mail, Calendar, Hash, BookOpen, FileText, School, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [expandedRow, setExpandedRow] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [uRes, cRes, aRes] = await Promise.all([
        fetch(`${API_ROOT}/api/admin/users`),
        fetch(`${API_ROOT}/api/admin/classes`),
        fetch(`${API_ROOT}/api/admin/assignments`),
      ]);
      const uData = await uRes.json();
      const cData = await cRes.json();
      const aData = await aRes.json();
      setUsers(uData.users || []);
      setClasses(cData.classes || []);
      setAssignments(aData.assignments || []);
    } catch (err) {
      console.error(err);
      setError('Could not reach the backend. Make sure it is running.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const tabs = [
    { id: 'users', label: 'Users', icon: Users, count: users.length, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
    { id: 'classes', label: 'Classes', icon: School, count: classes.length, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
    { id: 'assignments', label: 'Assignments', icon: FileText, count: assignments.length, color: '#FF6B00', bg: 'rgba(255,107,0,0.12)' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden transition-colors duration-300" style={{ background: 'var(--bg-primary)' }}>

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-[600px] h-[600px] rounded-full"
          style={{ top: '-120px', right: '-120px', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full"
          style={{ bottom: '80px', left: '-100px', background: 'radial-gradient(circle, rgba(255,107,0,0.05) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-8 md:p-14 space-y-10">

        {/* Header */}
        <header className="malum-fadeInUp">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', boxShadow: '0 0 30px rgba(139,92,246,0.5)' }}>
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black malum-text-gradient">Admin Dashboard</h1>
                <p className="theme-text-secondary text-sm font-medium">View all backend data</p>
              </div>
            </div>
            <button
              onClick={fetchAll}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl theme-bg-elevated border theme-border theme-text-secondary hover:theme-text text-sm font-bold transition-all hover:scale-105"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 malum-fadeInUp" style={{ animationDelay: '0.1s' }}>
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="cursor-pointer rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: activeTab === tab.id ? tab.bg : 'var(--bg-elevated)',
                border: `1.5px solid ${activeTab === tab.id ? tab.color + '40' : 'var(--border-color)'}`,
                boxShadow: activeTab === tab.id ? `0 0 24px ${tab.color}20` : '0 4px 16px rgba(0,0,0,0.15)',
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: tab.bg }}>
                  <tab.icon className="w-6 h-6" style={{ color: tab.color }} />
                </div>
                <div>
                  <p className="text-3xl font-black" style={{ color: tab.color }}>{tab.count}</p>
                  <p className="text-sm font-bold theme-text-secondary">{tab.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-semibold"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full" style={{ border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8B5CF6', animation: 'spin-slow 1s linear infinite' }} />
              <div className="absolute inset-2 rounded-full" style={{ border: '3px solid rgba(255,107,0,0.2)', borderTopColor: '#FF6B00', animation: 'spin-slow 1.5s linear infinite reverse' }} />
            </div>
            <p className="theme-text-muted text-sm font-semibold">Loading backend data...</p>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {!loading && activeTab === 'users' && (
          <div className="rounded-2xl overflow-hidden malum-fadeInUp"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
            <div className="px-6 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <Users className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-black theme-text">Registered Users</h2>
              <span className="text-xs font-black px-2.5 py-1 rounded-full ml-auto"
                style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.25)' }}>
                {users.length}
              </span>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-12 h-12 mx-auto text-purple-500/30 mb-4" />
                <p className="font-bold theme-text">No users registered yet</p>
                <p className="text-sm theme-text-muted mt-1">Users will appear here after they sign up.</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {/* Table header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-black uppercase tracking-wider theme-text-muted">
                  <div className="col-span-1">#</div>
                  <div className="col-span-3">Name</div>
                  <div className="col-span-4">Email</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-2">Created</div>
                </div>
                {users.map((user, i) => (
                  <div key={user.id || i} className="grid grid-cols-12 gap-4 px-6 py-4 items-center text-sm transition-colors hover:bg-white/[0.02]">
                    <div className="col-span-1 font-black theme-text-muted">{i + 1}</div>
                    <div className="col-span-3 font-bold theme-text truncate">{user.name}</div>
                    <div className="col-span-4 font-medium theme-text-secondary truncate flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0 text-purple-400/60" />
                      {user.email}
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs font-black px-2.5 py-1 rounded-full capitalize"
                        style={{
                          background: user.role === 'teacher' ? 'rgba(255,107,0,0.12)' : 'rgba(139,92,246,0.12)',
                          color: user.role === 'teacher' ? '#FF6B00' : '#8B5CF6',
                          border: `1px solid ${user.role === 'teacher' ? 'rgba(255,107,0,0.25)' : 'rgba(139,92,246,0.25)'}`,
                        }}>
                        {user.role || 'student'}
                      </span>
                    </div>
                    <div className="col-span-2 text-xs font-medium theme-text-muted">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CLASSES TAB ── */}
        {!loading && activeTab === 'classes' && (
          <div className="rounded-2xl overflow-hidden malum-fadeInUp"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
            <div className="px-6 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <School className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-black theme-text">All Classes</h2>
              <span className="text-xs font-black px-2.5 py-1 rounded-full ml-auto"
                style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.25)' }}>
                {classes.length}
              </span>
            </div>

            {classes.length === 0 ? (
              <div className="text-center py-16">
                <School className="w-12 h-12 mx-auto text-blue-500/30 mb-4" />
                <p className="font-bold theme-text">No classes created yet</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {classes.map((cls, i) => (
                  <div key={cls.id || i}>
                    <button
                      onClick={() => setExpandedRow(expandedRow === cls.id ? null : cls.id)}
                      className="w-full grid grid-cols-12 gap-4 px-6 py-4 items-center text-sm text-left transition-colors hover:bg-white/[0.02]"
                    >
                      <div className="col-span-3 font-bold theme-text truncate">{cls.name}</div>
                      <div className="col-span-2 font-medium theme-text-secondary">{cls.subject}</div>
                      <div className="col-span-3 font-medium theme-text-secondary truncate">{cls.teacherEmail}</div>
                      <div className="col-span-2">
                        <span className="text-xs font-black px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)' }}>
                          {cls.joinCode}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center justify-between theme-text-muted text-xs font-medium">
                        {cls.studentEmails?.length || 0} students
                        {expandedRow === cls.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>
                    {expandedRow === cls.id && cls.studentEmails?.length > 0 && (
                      <div className="px-8 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {cls.studentEmails.map(email => (
                          <div key={email} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium theme-text-secondary"
                            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                            <Mail className="w-3 h-3 text-blue-400/60" />
                            {email}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ASSIGNMENTS TAB ── */}
        {!loading && activeTab === 'assignments' && (
          <div className="rounded-2xl overflow-hidden malum-fadeInUp"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
            <div className="px-6 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <FileText className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-black theme-text">All Assignments</h2>
              <span className="text-xs font-black px-2.5 py-1 rounded-full ml-auto"
                style={{ background: 'rgba(255,107,0,0.15)', color: '#FF6B00', border: '1px solid rgba(255,107,0,0.25)' }}>
                {assignments.length}
              </span>
            </div>

            {assignments.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-12 h-12 mx-auto text-orange-500/30 mb-4" />
                <p className="font-bold theme-text">No assignments yet</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {assignments.map((a, i) => {
                  const completedCount = Object.values(a.completions || {}).filter(c => c.completed).length;
                  const totalStudents = a.studentEmails?.length || 0;
                  return (
                    <div key={a.id || i} className="px-6 py-5 transition-colors hover:bg-white/[0.02]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold theme-text text-base">{a.title}</h3>
                          {a.description && <p className="text-sm theme-text-muted mt-1 line-clamp-2">{a.description}</p>}
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                              {a.subject}
                            </span>
                            <span className="text-xs font-medium theme-text-muted">by {a.teacherName || a.teacherEmail}</span>
                            {a.dueDate && <span className="text-xs font-medium theme-text-muted flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {new Date(a.dueDate).toLocaleDateString()}
                            </span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-lg font-black" style={{ color: completedCount === totalStudents && totalStudents > 0 ? '#10B981' : '#FF6B00' }}>
                              {completedCount}/{totalStudents}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-wider theme-text-muted">completed</p>
                          </div>
                          <div className="w-16 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                            <div className="h-full rounded-full transition-all"
                              style={{
                                width: `${totalStudents > 0 ? (completedCount / totalStudents) * 100 : 0}%`,
                                background: completedCount === totalStudents && totalStudents > 0 ? '#10B981' : '#FF6B00',
                              }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

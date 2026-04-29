import React, { useState, useEffect } from 'react';
import {
  GraduationCap, Plus, Send, X, Calendar, BookOpen, Users, CheckCircle2,
  Clock, Trash2, ChevronDown, ChevronUp, Mail, FileText, Sparkles, Hash,
  Copy, Check, UserPlus, School, ArrowRight, RefreshCw, AlertCircle,
  BarChart2, Award, LogOut, Eye, EyeOff
} from 'lucide-react';

const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_ROOT}/api`;

function toast_show(setToast, msg) {
  setToast(msg);
  setTimeout(() => setToast(''), 3500);
}

/* ─── Class Card ─────────────────────────────────────────────────── */
function ClassCard({ cls, onSelect, onDelete, selected }) {
  const [copied, setCopied] = useState(false);
  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cls.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={() => onSelect(cls)}
      className="relative rounded-2xl p-5 cursor-pointer transition-all duration-300 group overflow-hidden"
      style={{
        background: selected ? 'linear-gradient(135deg, rgba(255,107,0,0.12), rgba(255,142,83,0.06))' : 'var(--bg-elevated)',
        border: `1.5px solid ${selected ? 'rgba(255,107,0,0.4)' : 'var(--border-color)'}`,
        boxShadow: selected ? '0 0 24px rgba(255,107,0,0.12)' : '0 4px 16px rgba(0,0,0,0.15)',
      }}
    >
      {/* top strip */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: 'linear-gradient(90deg, #FF6B00, #FF8E53)', opacity: selected ? 1 : 0.3 }} />

      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8E53)', boxShadow: '0 0 16px rgba(255,107,0,0.35)' }}>
          <School className="w-5 h-5 text-white" />
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(cls.id); }}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <h3 className="font-black text-base theme-text mb-0.5 truncate">{cls.name}</h3>
      <p className="text-xs font-semibold theme-text-secondary mb-3">{cls.subject}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs theme-text-muted">
          <Users className="w-3.5 h-3.5" />
          <span>{cls.studentEmails?.length || 0} student{cls.studentEmails?.length !== 1 ? 's' : ''}</span>
        </div>

        <button
          onClick={copy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black transition-all"
          style={{
            background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(255,107,0,0.1)',
            border: copied ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,107,0,0.25)',
            color: copied ? '#10b981' : '#FF6B00',
          }}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : cls.joinCode}
        </button>
      </div>
    </div>
  );
}

/* ─── Stat Card ─────────────────────────────────────────────────── */
function StatCard({ icon: Icon, value, label, color, bg }) {
  return (
    <div className="theme-bg-elevated border theme-border rounded-2xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: bg }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-black theme-text">{value}</p>
        <p className="text-sm font-medium theme-text-secondary">{label}</p>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function TeacherDashboard() {
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeTab, setActiveTab] = useState('classes'); // 'classes' | 'assignments'

  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);

  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [creatingClass, setCreatingClass] = useState(false);
  const [creatingAssignment, setCreatingAssignment] = useState(false);

  const [expandedAssignmentId, setExpandedAssignmentId] = useState(null);
  const [toast, setToast] = useState('');

  const [classForm, setClassForm] = useState({ name: '', subject: 'General' });

  const [assignForm, setAssignForm] = useState({
    title: '', description: '', subject: 'General', dueDate: '',
    assignMode: 'class', // 'class' | 'email'
  });
  const [emailChips, setEmailChips] = useState([]);
  const [emailInput, setEmailInput] = useState('');

  const subjects = [
    'General', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Computer Science', 'World History', 'English', 'Economics',
    'Psychology', 'Environmental Science', 'Spanish', 'Music Theory'
  ];

  /* ── bootstrap ── */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('user');
      if (saved) setUser(JSON.parse(saved));
    } catch { }
  }, []);

  useEffect(() => {
    if (user?.email) {
      fetchClasses();
      fetchAssignments();
    }
  }, [user]);

  /* ── API helpers ── */
  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      const res = await fetch(`${API_URL}/classes?email=${encodeURIComponent(user.email)}&role=teacher`);
      const data = await res.json();
      setClasses(data.classes || []);
    } catch { }
    setLoadingClasses(false);
  };

  const fetchAssignments = async () => {
    setLoadingAssignments(true);
    try {
      const res = await fetch(`${API_URL}/assignments?email=${encodeURIComponent(user.email)}&role=teacher`);
      const data = await res.json();
      setAssignments(data.assignments || []);
    } catch { }
    setLoadingAssignments(false);
  };

  const createClass = async (e) => {
    e.preventDefault();
    if (!classForm.name.trim()) return;
    setCreatingClass(true);
    try {
      const res = await fetch(`${API_URL}/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: classForm.name, subject: classForm.subject, teacherEmail: user.email, teacherName: user.name })
      });
      const data = await res.json();
      if (res.ok) {
        toast_show(setToast, `✅ Class "${classForm.name}" created! Join code: ${data.class.joinCode}`);
        setClassForm({ name: '', subject: 'General' });
        setShowCreateClass(false);
        fetchClasses();
      } else {
        toast_show(setToast, `❌ ${data.error}`);
      }
    } catch { toast_show(setToast, '❌ Failed to create class'); }
    setCreatingClass(false);
  };

  const deleteClass = async (id) => {
    try {
      await fetch(`${API_URL}/classes/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherEmail: user.email })
      });
      toast_show(setToast, '🗑️ Class deleted');
      if (selectedClass?.id === id) setSelectedClass(null);
      fetchClasses();
    } catch { toast_show(setToast, '❌ Failed to delete class'); }
  };

  const addEmailChip = () => {
    const email = emailInput.trim().toLowerCase();
    if (email && email.includes('@') && !emailChips.includes(email)) {
      setEmailChips([...emailChips, email]);
      setEmailInput('');
    }
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') { e.preventDefault(); addEmailChip(); }
    if (e.key === 'Backspace' && !emailInput && emailChips.length > 0) setEmailChips(emailChips.slice(0, -1));
  };

  const createAssignment = async (e) => {
    e.preventDefault();
    if (!assignForm.title.trim()) return;
    if (assignForm.assignMode === 'class' && !selectedClass) {
      toast_show(setToast, '⚠️ Select a class first, or switch to manual email mode');
      return;
    }
    if (assignForm.assignMode === 'email' && emailChips.length === 0) {
      toast_show(setToast, '⚠️ Add at least one student email');
      return;
    }

    setCreatingAssignment(true);
    try {
      const body = {
        title: assignForm.title,
        description: assignForm.description,
        subject: assignForm.subject,
        dueDate: assignForm.dueDate,
        teacherEmail: user.email,
        teacherName: user.name,
      };
      if (assignForm.assignMode === 'class') {
        body.classId = selectedClass.id;
        body.className = selectedClass.name;
      } else {
        body.studentEmails = emailChips;
      }

      const res = await fetch(`${API_URL}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        const target = assignForm.assignMode === 'class' ? `class "${selectedClass.name}"` : `${emailChips.length} student(s)`;
        toast_show(setToast, `✅ "${assignForm.title}" assigned to ${target}!`);
        setAssignForm({ title: '', description: '', subject: 'General', dueDate: '', assignMode: 'class' });
        setEmailChips([]);
        setShowCreateAssignment(false);
        fetchAssignments();
      } else {
        toast_show(setToast, `❌ ${data.error}`);
      }
    } catch { toast_show(setToast, '❌ Failed to create assignment'); }
    setCreatingAssignment(false);
  };

  const deleteAssignment = async (id) => {
    try {
      await fetch(`${API_URL}/assignments/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      toast_show(setToast, '🗑️ Assignment deleted');
      fetchAssignments();
    } catch { toast_show(setToast, '❌ Failed to delete'); }
  };

  const getCompletionStats = (a) => {
    const total = a.studentEmails?.length || 0;
    const completed = Object.values(a.completions || {}).filter(c => c.completed).length;
    return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const filteredAssignments = selectedClass
    ? assignments.filter(a => a.classId === selectedClass.id)
    : assignments;

  /* ── Access guard ── */
  if (!user || user.role !== 'teacher') {
    return (
      <div className="min-h-screen flex items-center justify-center theme-bg theme-text p-6">
        <div className="text-center space-y-4">
          <GraduationCap className="w-16 h-16 mx-auto text-orange-500 opacity-50" />
          <h2 className="text-2xl font-bold">Teacher Access Only</h2>
          <p className="theme-text-secondary">Please log in as a teacher to access this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg theme-text font-sans">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-[500px] h-[500px] rounded-full -top-20 -right-20"
          style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full bottom-0 -left-20"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-10 space-y-8">

        {/* ── Header ── */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8E53)', boxShadow: '0 0 30px rgba(255,107,0,0.45)' }}>
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black malum-text-gradient">Teacher Dashboard</h1>
              <p className="text-sm theme-text-secondary font-medium">{user.name} · {user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { fetchClasses(); fetchAssignments(); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl theme-bg-elevated border theme-border theme-text-secondary hover:theme-text text-sm font-semibold transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => { setShowCreateAssignment(!showCreateAssignment); setShowCreateClass(false); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8E53)', boxShadow: '0 4px 20px rgba(255,107,0,0.35)' }}
            >
              <Send className="w-4 h-4" />
              New Assignment
            </button>
          </div>
        </header>

        {/* ── Toast ── */}
        {toast && (
          <div className="fixed top-24 right-6 z-[100] px-5 py-3 rounded-2xl font-bold text-sm shadow-2xl backdrop-blur-xl"
            style={{ background: 'rgba(16,24,39,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', animation: 'slideInRight 0.3s ease' }}>
            {toast}
          </div>
        )}

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={School} value={classes.length} label="My Classes" color="#FF6B00" bg="rgba(255,107,0,0.12)" />
          <StatCard icon={FileText} value={assignments.length} label="Assignments" color="#3B82F6" bg="rgba(59,130,246,0.12)" />
          <StatCard icon={CheckCircle2} value={assignments.reduce((a, x) => a + Object.values(x.completions || {}).filter(c => c.completed).length, 0)} label="Completions" color="#10B981" bg="rgba(16,185,129,0.12)" />
          <StatCard icon={Users} value={new Set(classes.flatMap(c => c.studentEmails || [])).size} label="Students" color="#8B5CF6" bg="rgba(139,92,246,0.12)" />
        </div>

        {/* ── Create Assignment Form ── */}
        {showCreateAssignment && (
          <div className="theme-bg-elevated border theme-border rounded-3xl p-7 space-y-5 shadow-2xl"
            style={{ animation: 'slideDown 0.3s ease' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,107,0,0.15)' }}>
                  <FileText className="w-5 h-5 text-orange-400" />
                </div>
                <h2 className="text-xl font-black theme-text">Create Assignment</h2>
              </div>
              <button onClick={() => setShowCreateAssignment(false)} className="p-2 rounded-xl theme-text-muted hover:theme-text transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={createAssignment} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Title *</label>
                <input
                  type="text" value={assignForm.title}
                  onChange={e => setAssignForm({ ...assignForm, title: e.target.value })}
                  placeholder="Assignment title"
                  className="w-full px-4 py-3 rounded-xl theme-bg border theme-border theme-text font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                  required
                />
              </div>

              {/* Subject + Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Subject</label>
                  <select
                    value={assignForm.subject}
                    onChange={e => setAssignForm({ ...assignForm, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl theme-bg border theme-border theme-text font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                  >
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Due Date</label>
                  <input
                    type="date" value={assignForm.dueDate}
                    onChange={e => setAssignForm({ ...assignForm, dueDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl theme-bg border theme-border theme-text font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Description</label>
                <textarea
                  value={assignForm.description}
                  onChange={e => setAssignForm({ ...assignForm, description: e.target.value })}
                  placeholder="Describe what students need to do..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl theme-bg border theme-border theme-text font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all resize-none"
                />
              </div>

              {/* Assign Mode Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Assign To</label>
                <div className="flex gap-2">
                  {[
                    { id: 'class', label: '📚 Entire Class', desc: 'All students in a class' },
                    { id: 'email', label: '📧 Specific Emails', desc: 'Individual students' },
                  ].map(m => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setAssignForm({ ...assignForm, assignMode: m.id })}
                      className="flex-1 flex flex-col items-center gap-1 py-3 px-3 rounded-xl text-xs font-bold border transition-all"
                      style={{
                        background: assignForm.assignMode === m.id ? 'rgba(255,107,0,0.1)' : 'transparent',
                        borderColor: assignForm.assignMode === m.id ? 'rgba(255,107,0,0.4)' : 'var(--border-color)',
                        color: assignForm.assignMode === m.id ? '#FF6B00' : 'var(--text-secondary)',
                      }}
                    >
                      <span className="font-black">{m.label}</span>
                      <span className="opacity-70 font-normal">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Class selector */}
              {assignForm.assignMode === 'class' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Select Class</label>
                  {classes.length === 0 ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl theme-bg border theme-border">
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <p className="text-sm theme-text-secondary">No classes yet. Create a class below first.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {classes.map(cls => (
                        <button
                          type="button"
                          key={cls.id}
                          onClick={() => setSelectedClass(cls)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-left"
                          style={{
                            background: selectedClass?.id === cls.id ? 'rgba(255,107,0,0.1)' : 'var(--bg-elevated)',
                            borderColor: selectedClass?.id === cls.id ? 'rgba(255,107,0,0.4)' : 'var(--border-color)',
                            color: selectedClass?.id === cls.id ? '#FF6B00' : 'var(--text-secondary)',
                          }}
                        >
                          <School className="w-3.5 h-3.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="truncate font-black">{cls.name}</p>
                            <p className="opacity-70 font-normal">{cls.studentEmails?.length || 0} students</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Email chips */}
              {assignForm.assignMode === 'email' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">
                    Student Emails * <span className="text-xs font-normal theme-text-muted ml-1">(Enter / comma to add)</span>
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 rounded-xl theme-bg border theme-border min-h-[52px] items-center focus-within:ring-2 focus-within:ring-orange-500/30 transition-all">
                    {emailChips.map(email => (
                      <span key={email} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                        style={{ background: 'rgba(255,107,0,0.12)', border: '1px solid rgba(255,107,0,0.25)', color: '#FF6B00' }}>
                        <Mail className="w-3 h-3" />
                        {email}
                        <button type="button" onClick={() => setEmailChips(emailChips.filter(e => e !== email))} className="hover:text-red-400 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="email" value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      onKeyDown={handleEmailKeyDown}
                      onBlur={addEmailChip}
                      placeholder={emailChips.length === 0 ? 'student@gmail.com' : 'Add another...'}
                      className="flex-1 min-w-[180px] bg-transparent theme-text text-sm font-medium focus:outline-none placeholder-gray-500"
                    />
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={creatingAssignment || !assignForm.title.trim()}
                className="w-full py-4 rounded-2xl text-white font-black text-base shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3 hover:scale-[1.01]"
                style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8E53)', boxShadow: '0 4px 20px rgba(255,107,0,0.35)' }}
              >
                {creatingAssignment
                  ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
                  : <><Send className="w-5 h-5" />Assign{assignForm.assignMode === 'class' && selectedClass ? ` to "${selectedClass.name}"` : ''}</>}
              </button>
            </form>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="mini-nav">
          {[
            { id: 'classes', label: 'My Classes', icon: School },
            { id: 'assignments', label: 'Assignments', icon: FileText },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`mini-nav-item ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon className="nav-icon" />
              {tab.label}
              <span className="nav-count">
                {tab.id === 'classes' ? classes.length : assignments.length}
              </span>
            </button>
          ))}
        </div>

        {/* ── CLASSES TAB ── */}
        {activeTab === 'classes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black theme-text flex items-center gap-2">
                <School className="w-5 h-5 text-orange-400" />
                Your Classes
              </h2>
              <button
                onClick={() => setShowCreateClass(!showCreateClass)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{ background: showCreateClass ? 'rgba(255,107,0,0.12)' : 'var(--bg-elevated)', border: '1px solid rgba(255,107,0,0.3)', color: '#FF6B00' }}
              >
                {showCreateClass ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showCreateClass ? 'Cancel' : 'Create Class'}
              </button>
            </div>

            {/* Create Class Form */}
            {showCreateClass && (
              <div className="theme-bg-elevated border theme-border rounded-2xl p-6 space-y-4" style={{ animation: 'slideDown 0.3s ease' }}>
                <h3 className="font-black theme-text flex items-center gap-2"><School className="w-4 h-4 text-orange-400" />New Class</h3>
                <form onSubmit={createClass} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text" value={classForm.name}
                    onChange={e => setClassForm({ ...classForm, name: e.target.value })}
                    placeholder="Class name (e.g. AP Chemistry Period 3)"
                    className="flex-1 px-4 py-3 rounded-xl theme-bg border theme-border theme-text font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                    required
                  />
                  <select
                    value={classForm.subject}
                    onChange={e => setClassForm({ ...classForm, subject: e.target.value })}
                    className="px-4 py-3 rounded-xl theme-bg border theme-border theme-text font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                  >
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    type="submit" disabled={creatingClass || !classForm.name.trim()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-black text-sm transition-all disabled:opacity-50 hover:scale-105 flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8E53)', boxShadow: '0 4px 16px rgba(255,107,0,0.35)' }}
                  >
                    {creatingClass ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                    Create
                  </button>
                </form>
                <p className="text-xs theme-text-muted">
                  A unique 6-character join code will be generated. Share it with students so they can enroll via the Classroom page.
                </p>
              </div>
            )}

            {/* Class info banner when selected */}
            {selectedClass && (
              <div className="flex items-center justify-between p-4 rounded-2xl"
                style={{ background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.2)' }}>
                <div className="flex items-center gap-3">
                  <School className="w-5 h-5 text-orange-400" />
                  <div>
                    <span className="font-black text-orange-400">{selectedClass.name}</span>
                    <span className="text-sm theme-text-secondary ml-2">· {selectedClass.studentEmails?.length || 0} students enrolled</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClass(null)}
                  className="text-xs font-bold theme-text-muted hover:theme-text transition-colors"
                >
                  Clear filter
                </button>
              </div>
            )}

            {loadingClasses ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              </div>
            ) : classes.length === 0 ? (
              <div className="text-center py-16 theme-bg-elevated border theme-border rounded-3xl">
                <School className="w-12 h-12 mx-auto text-orange-500/40 mb-4" />
                <h3 className="text-lg font-bold theme-text mb-2">No classes yet</h3>
                <p className="theme-text-secondary text-sm">Create your first class to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map(cls => (
                  <ClassCard
                    key={cls.id}
                    cls={cls}
                    onSelect={setSelectedClass}
                    onDelete={deleteClass}
                    selected={selectedClass?.id === cls.id}
                  />
                ))}
              </div>
            )}

            {/* Student roster for selected class */}
            {selectedClass && (selectedClass.studentEmails?.length || 0) > 0 && (
              <div className="theme-bg-elevated border theme-border rounded-2xl p-5 space-y-3">
                <h3 className="font-black theme-text flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-400" />
                  Enrolled Students — {selectedClass.name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedClass.studentEmails.map(email => (
                    <div key={email} className="flex items-center gap-3 px-4 py-3 rounded-xl theme-bg border theme-border">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(255,107,0,0.12)' }}>
                        <Users className="w-3.5 h-3.5 text-orange-400" />
                      </div>
                      <p className="text-sm font-medium theme-text truncate">{email}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ASSIGNMENTS TAB ── */}
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black theme-text flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-400" />
                {selectedClass ? `Assignments — ${selectedClass.name}` : 'All Assignments'}
              </h2>
              {selectedClass && (
                <button onClick={() => setSelectedClass(null)} className="text-xs font-bold theme-text-muted hover:theme-text transition-colors">
                  Show all
                </button>
              )}
            </div>

            {loadingAssignments ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="text-center py-16 theme-bg-elevated border theme-border rounded-3xl">
                <Sparkles className="w-12 h-12 mx-auto text-orange-500/40 mb-4" />
                <h3 className="text-lg font-bold theme-text mb-2">No assignments yet</h3>
                <p className="theme-text-secondary text-sm">Click "New Assignment" to assign work to your students.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAssignments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(assignment => {
                  const stats = getCompletionStats(assignment);
                  const isExpanded = expandedAssignmentId === assignment.id;
                  const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();

                  return (
                    <div key={assignment.id} className="theme-bg-elevated border theme-border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                      <button
                        onClick={() => setExpandedAssignmentId(isExpanded ? null : assignment.id)}
                        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${stats.percent === 100 ? 'bg-emerald-500/20' : isOverdue ? 'bg-red-500/20' : 'bg-orange-500/20'}`}>
                            {stats.percent === 100
                              ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              : <FileText className={`w-5 h-5 ${isOverdue ? 'text-red-400' : 'text-orange-400'}`} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base font-bold theme-text truncate">{assignment.title}</h3>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}>
                                {assignment.subject}
                              </span>
                              {assignment.className && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                                  style={{ background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.2)', color: '#FF6B00' }}>
                                  <School className="w-3 h-3" />{assignment.className}
                                </span>
                              )}
                              {assignment.dueDate && (
                                <span className={`text-xs font-medium flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'theme-text-muted'}`}>
                                  <Calendar className="w-3 h-3" />Due {new Date(assignment.dueDate).toLocaleDateString()}
                                </span>
                              )}
                              <span className="text-xs theme-text-muted flex items-center gap-1">
                                <Users className="w-3 h-3" />{assignment.studentEmails.length} student{assignment.studentEmails.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                          <div className="hidden sm:flex items-center gap-2">
                            <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${stats.percent === 100 ? 'bg-emerald-400' : stats.percent > 50 ? 'bg-orange-400' : stats.percent > 0 ? 'bg-amber-400' : 'bg-gray-600'}`}
                                style={{ width: `${stats.percent}%` }}
                              />
                            </div>
                            <span className={`text-xs font-bold ${stats.percent === 100 ? 'text-emerald-400' : stats.percent > 0 ? 'text-orange-400' : 'text-gray-500'}`}>
                              {stats.percent}%
                            </span>
                          </div>
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-6 pb-6 pt-2 border-t theme-border space-y-4" style={{ animation: 'slideDown 0.25s ease' }}>
                          {assignment.description && (
                            <p className="text-sm theme-text-secondary leading-relaxed">{assignment.description}</p>
                          )}

                          <div>
                            <p className="text-xs font-black theme-text-secondary uppercase tracking-wider mb-2">Student Progress</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {assignment.studentEmails.map(email => {
                                const done = assignment.completions?.[email]?.completed;
                                return (
                                  <div key={email} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${done ? 'bg-emerald-500/10 border-emerald-500/20' : 'theme-bg border-white/5'}`}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-500' : 'bg-white/10'}`}>
                                      {done ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Clock className="w-4 h-4 text-gray-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium theme-text truncate">{email}</p>
                                      <p className={`text-xs ${done ? 'text-emerald-400' : 'theme-text-muted'}`}>
                                        {done ? `Completed ${new Date(assignment.completions[email].completedAt).toLocaleDateString()}` : 'Pending'}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={() => deleteAssignment(assignment.id)}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}

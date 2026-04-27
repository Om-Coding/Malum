import React, { useState, useEffect, useMemo } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Video, AlignLeft, AlertCircle, Loader2, CalendarDays, MapPin, GraduationCap, FileText, Sparkles, X, BrainCircuit, CheckSquare, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_ID || '';
const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// --- MATH UTILS ---
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const parseClassroomDate = (dueDate, dueTime) => {
  if (!dueDate || !dueDate.year) return null;
  const dateObj = new Date();
  dateObj.setFullYear(dueDate.year, dueDate.month - 1, dueDate.day);
  if (dueTime) {
    dateObj.setHours(dueTime.hours || 23, dueTime.minutes || 59, 0, 0);
  } else {
    dateObj.setHours(23, 59, 59, 999);
  }
  return dateObj;
};

// --- CORE COMPONENT ---
function ScheduleCore() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [events, setEvents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(() => sessionStorage.getItem('schedule_token') || null);

  const [selectedDayItems, setSelectedDayItems] = useState({ events: [], assignments: [] });
  const [selectedDateString, setSelectedDateString] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  // Custom Todo Logic
  const [customTodos, setCustomTodos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('schedule_custom_todos') || '{}'); } catch { return {}; }
  });
  const [newTodoInput, setNewTodoInput] = useState("");

  const handleAddTodo = (e) => {
    if (e.key === 'Enter' && newTodoInput.trim()) {
      const updated = { ...customTodos };
      if (!updated[selectedDateString]) updated[selectedDateString] = [];
      updated[selectedDateString].push({ id: Date.now().toString(), text: newTodoInput.trim(), done: false });
      setCustomTodos(updated);
      localStorage.setItem('schedule_custom_todos', JSON.stringify(updated));
      setNewTodoInput("");
    }
  };

  const toggleTodo = (dateStr, id) => {
     const updated = { ...customTodos };
     updated[dateStr] = updated[dateStr].map(t => t.id === id ? { ...t, done: !t.done } : t);
     setCustomTodos(updated);
     localStorage.setItem('schedule_custom_todos', JSON.stringify(updated));
  };

  const deleteTodo = (dateStr, id) => {
     const updated = { ...customTodos };
     updated[dateStr] = updated[dateStr].filter(t => t.id !== id);
     setCustomTodos(updated);
     localStorage.setItem('schedule_custom_todos', JSON.stringify(updated));
  };

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setAccessToken(tokenResponse.access_token);
      sessionStorage.setItem('schedule_token', tokenResponse.access_token);
      fetchScheduleData(tokenResponse.access_token);
    },
    onError: (err) => {
      console.error('Login Failed:', err);
      setError('Google Login Failed. If you are on Vercel, ensure this URL is in your Google Console Authorized Redirect URIs.');
    },
    scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly https://www.googleapis.com/auth/classroom.student-submissions.me.readonly'
  });

  const fetchScheduleData = async (token) => {
    setLoading(true);
    setError(null);
    
    try {
      const start = new Date();
      start.setDate(start.getDate() - 14);
      const end = new Date();
      end.setDate(end.getDate() + 30);
      
      const calUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${start.toISOString()}&timeMax=${end.toISOString()}&singleEvents=true&orderBy=startTime&maxResults=250`;
      
      const calRes = await fetch(calUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!calRes.ok) throw new Error('API Sync Failed.');
      
      const calData = await calRes.json();
      const calEvents = calData.items || [];

      const coursesRes = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
        headers: { Authorization: `Bearer ${token}` }
      });
      let fetchedAssignments = [];
      
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        const activeCourses = coursesData.courses || [];

        await Promise.all(activeCourses.map(async (course) => {
          try {
            const [workRes, subRes] = await Promise.all([
              fetch(`https://classroom.googleapis.com/v1/courses/${course.id}/courseWork?courseWorkStates=PUBLISHED`, { headers: { Authorization: `Bearer ${token}` } }),
              fetch(`https://classroom.googleapis.com/v1/courses/${course.id}/studentSubmissions`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const workData = workRes.ok ? await workRes.json() : { courseWork: [] };
            const subData = subRes.ok ? await subRes.json() : { studentSubmissions: [] };

            const courseItems = (workData.courseWork || []).map(work => {
              const submission = (subData.studentSubmissions || []).find(sub => sub.courseWorkId === work.id);
              const isTurnedIn = submission?.state === 'TURNED_IN' || submission?.state === 'RETURNED';
              const parsedDate = parseClassroomDate(work.dueDate, work.dueTime);
              
              return {
                ...work,
                courseName: course.name,
                isTurnedIn,
                parsedDate,
                type: 'assignment'
              };
            });
            fetchedAssignments = [...fetchedAssignments, ...courseItems.filter(a => !a.isTurnedIn && a.parsedDate)];
          } catch (e) { console.warn(`Classroom fetch skipped`); }
        }));
      }

      setEvents(calEvents);
      setAssignments(fetchedAssignments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchScheduleData(accessToken);
  }, []);

  const handlePrevWeek = () => setWeekOffset(prev => prev - 1);
  const handleNextWeek = () => setWeekOffset(prev => prev + 1);
  const jumpToToday = () => setWeekOffset(0);

  const itemsByDay = useMemo(() => {
    const map = {};
    events.forEach(evt => {
      let dateStr = evt.start.dateTime ? evt.start.dateTime.split('T')[0] : evt.start.date;
      if (dateStr) {
        if (!map[dateStr]) map[dateStr] = { events: [], assignments: [] };
        map[dateStr].events.push({ ...evt, type: 'calendar' });
      }
    });
    assignments.forEach(asg => {
      const dateStr = `${asg.parsedDate.getFullYear()}-${String(asg.parsedDate.getMonth() + 1).padStart(2, '0')}-${String(asg.parsedDate.getDate()).padStart(2, '0')}`;
      if (!map[dateStr]) map[dateStr] = { events: [], assignments: [] };
      if (!map[dateStr].assignments.find(a => a.id === asg.id)) map[dateStr].assignments.push(asg);
    });
    return map;
  }, [events, assignments]);

  const weekDays = useMemo(() => {
    const days = [];
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
    startOfWeek.setDate(diff + (weekOffset * 7));
    for (let i = 0; i < 5; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekOffset]);

  if (!accessToken) {
    return (
      <div className="min-h-screen hud-grid flex items-center justify-center p-6">
        <div className="w-full max-w-2xl premium-card p-16 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
          
          <div className="relative z-10">
            <div className="w-24 h-24 mx-auto mb-10 flex items-center justify-center rounded-3xl bg-black/40 border border-white/10 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
              <CalendarDays className="w-12 h-12 text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            </div>
            
            <h1 className="text-5xl font-black text-white premium-heading mb-6 tracking-tight">Connect Hub</h1>
            <p className="text-gray-400 text-lg font-bold leading-relaxed mb-12 max-w-md mx-auto opacity-70">
              Authenticate securely via Google to pull down your exact <br/>
              Calendar Events AND missing Classroom Assignments.
            </p>
            
            <button
              onClick={() => login()}
              className="flex items-center gap-4 px-10 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
              Sync Calendar & Classes
            </button>

            {error && (
              <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3 relative z-10 w-full text-left">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hud-grid pb-20">
      <div className="max-w-[1700px] mx-auto p-6 md:p-10 space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-5xl font-black text-white premium-heading tracking-tight mb-2">Weekly Schedule</h1>
            <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-xs">
              {MONTHS[weekDays[0].getMonth()]} {weekDays[0].getFullYear()} - Week {weekOffset === 0 ? 'Current' : weekOffset > 0 ? `+${weekOffset}` : weekOffset}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => accessToken ? fetchScheduleData(accessToken) : login()}
              className="flex items-center gap-3 px-6 py-2.5 bg-black/40 border border-white/20 rounded-full text-white text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Sync Google
            </button>
            <div className="flex gap-2 bg-black/40 p-1 rounded-full border border-white/5">
              <button onClick={handlePrevWeek} className="p-2.5 hover:bg-white/10 rounded-full text-white transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={jumpToToday} className="px-4 py-1 hover:bg-white/10 rounded-full text-white text-[11px] font-black uppercase tracking-widest transition-all">
                Today
              </button>
              <button onClick={handleNextWeek} className="p-2.5 hover:bg-white/10 rounded-full text-white transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Weekly Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {weekDays.map((dayDate, idx) => {
            const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
            const dayData = itemsByDay[dateStr] || { events: [], assignments: [] };
            const isToday = dayDate.toDateString() === new Date().toDateString();
            const dayName = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][dayDate.getDay()];

            return (
              <div key={dateStr} className={`flex flex-col gap-4 p-6 rounded-3xl border border-white/5 bg-black/20 min-h-[600px] transition-all hover:bg-black/30 ${isToday ? 'ring-1 ring-orange-500/30 bg-orange-500/[0.02]' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className={`text-xs font-black tracking-widest mb-1 ${isToday ? 'text-orange-500' : 'text-gray-500'}`}>{dayName}</span>
                    <span className="text-3xl font-black text-white premium-heading leading-none">{dayDate.getDate()}</span>
                  </div>
                  {isToday && (
                    <span className="text-[10px] font-black bg-orange-500 text-black px-2 py-0.5 rounded-full uppercase tracking-widest">Today</span>
                  )}
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
                  {dayData.events.map((evt, eIdx) => {
                    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#F43F5E'];
                    const color = colors[eIdx % colors.length];
                    return (
                      <div key={evt.id} className="p-4 rounded-2xl border bg-black/40 transition-all hover:bg-black/60 group" style={{ borderLeftColor: color, borderLeftWidth: '4px', borderTopColor: 'rgba(255,255,255,0.05)', borderRightColor: 'rgba(255,255,255,0.05)', borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                        <h4 className="text-sm font-black text-white mb-2 leading-tight group-hover:text-indigo-300 transition-colors">{evt.summary}</h4>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">{evt.location || 'Classroom'}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <Clock className="w-3 h-3" style={{ color }} />
                            {evt.start.dateTime ? new Date(evt.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day'}
                          </div>
                          {evt.location && (
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              <MapPin className="w-3 h-3 text-gray-500" />
                              {evt.location.split(',')[0]}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {dayData.assignments.map((asg, aIdx) => (
                    <div key={asg.id} className="p-4 rounded-2xl border border-white/5 bg-black/40 transition-all hover:bg-black/60 group" style={{ borderLeftColor: '#F59E0B', borderLeftWidth: '4px' }}>
                      <h4 className="text-sm font-black text-white mb-2 leading-tight group-hover:text-orange-300 transition-colors">{asg.title}</h4>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">{asg.courseName}</p>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <GraduationCap className="w-3 h-3 text-orange-500" />
                        Due 11:59 PM
                      </div>
                    </div>
                  ))}

                  {dayData.events.length === 0 && dayData.assignments.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center py-20 opacity-20 grayscale">
                      <CalendarDays className="w-12 h-12 text-gray-500 mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Free Day</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Schedule() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <ScheduleCore />
    </GoogleOAuthProvider>
  );
}

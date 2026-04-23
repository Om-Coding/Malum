import React, { useState, useEffect, useMemo } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Video, AlignLeft, AlertCircle, Loader2, CalendarDays, MapPin, GraduationCap, FileText, Sparkles, X, BrainCircuit, CheckSquare } from 'lucide-react';
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [accessToken, setAccessToken] = useState(() => {
    // Optionally restore from sessionStorage if available
    return sessionStorage.getItem('schedule_token') || null;
  });
  
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

  // Gemini State
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiPlan, setGeminiPlan] = useState(null);
  const [showGeminiModal, setShowGeminiModal] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setAccessToken(codeResponse.access_token);
      sessionStorage.setItem('schedule_token', codeResponse.access_token);
      fetchScheduleData(codeResponse.access_token, currentDate);
    },
    onError: (err) => setError('Google Login Failed: Check if you are authorized in the test user list.'),
    scope: 'https://www.googleapis.com/auth/calendar.readonly ' +
           'https://www.googleapis.com/auth/classroom.courses.readonly ' +
           'https://www.googleapis.com/auth/classroom.coursework.me.readonly ' +
           'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly'
  });

  const fetchScheduleData = async (token, targetDate) => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Fetch Calendar Events
      const y = targetDate.getFullYear();
      const m = targetDate.getMonth();
      const startOfMonth = new Date(y, m, 1).toISOString();
      const endOfMonth = new Date(y, m + 1, 0, 23, 59, 59, 999).toISOString();

      const calUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startOfMonth}&timeMax=${endOfMonth}&singleEvents=true&orderBy=startTime&maxResults=250`;
      
      const calRes = await fetch(calUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!calRes.ok) throw new Error('API Sync Failed. Please check the Caution Block in the Implementation Plan to configure your OAuth Scopes and Test Users.');
      
      const calData = await calRes.json();
      const calEvents = calData.items || [];

      // 2. Fetch Classroom Assignments (Active Courses)
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
              fetch(`https://classroom.googleapis.com/v1/courses/${course.id}/courseWork/-/studentSubmissions`, { headers: { Authorization: `Bearer ${token}` } })
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

            // Only push assignments that are NOT turned in and have a due date
            fetchedAssignments = [...fetchedAssignments, ...courseItems.filter(a => !a.isTurnedIn && a.parsedDate)];
          } catch (e) {
             console.warn(`Classroom fetch skipped for ${course.name}`);
          }
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
    if (accessToken) {
       fetchScheduleData(accessToken, currentDate);
    }
  }, []);

  const handlePrevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
    if (accessToken) fetchScheduleData(accessToken, newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    setCurrentDate(newDate);
    if (accessToken) fetchScheduleData(accessToken, newDate);
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    if (accessToken) fetchScheduleData(accessToken, today);
  };

  // Group BOTH Calendar Events and Assignments by Day "YYYY-MM-DD"
  const itemsByDay = useMemo(() => {
    const map = {};
    
    // Add Calendar Events
    events.forEach(evt => {
      let dateStr = null;
      if (evt.start.dateTime) dateStr = evt.start.dateTime.split('T')[0];
      else if (evt.start.date) dateStr = evt.start.date; // all day

      if (dateStr) {
        if (!map[dateStr]) map[dateStr] = { events: [], assignments: [] };
        map[dateStr].events.push({ ...evt, type: 'calendar' });
      }
    });

    // Add Classroom Assignments (API Fetched)
    assignments.forEach(asg => {
      if (asg.parsedDate) {
        const monthOffset = asg.parsedDate.getMonth() + 1;
        const dayOffset = asg.parsedDate.getDate();
        const dateStr = `${asg.parsedDate.getFullYear()}-${String(monthOffset).padStart(2, '0')}-${String(dayOffset).padStart(2, '0')}`;
        
        if (!map[dateStr]) map[dateStr] = { events: [], assignments: [] };
        // prevent duplicates if we fallback later
        if (!map[dateStr].assignments.find(a => a.id === asg.id)) {
           map[dateStr].assignments.push(asg);
        }
      }
    });

    // FALLBACK: Aggressively pull from GoogleClassroom's LocalStorage Memory
    // This perfectly bypasses any Google Cloud API Scope blocks on the sapient-hub Client ID!
    try {
      const cachedTodos = localStorage.getItem('classroom_todos');
      if (cachedTodos) {
         const parsedTodos = JSON.parse(cachedTodos);
         parsedTodos.forEach(todo => {
            if (!todo.isTurnedIn && todo.parsedDate) {
               const d = new Date(todo.parsedDate);
               const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
               
               if (!map[dateStr]) map[dateStr] = { events: [], assignments: [] };
               // Inject if it doesn't already exist from the primary API fetch
               if (!map[dateStr].assignments.find(a => a.id === todo.id)) {
                  map[dateStr].assignments.push({
                     ...todo,
                     type: 'assignment'
                  });
               }
            }
         });
      }
    } catch(e) {}

    return map;
  }, [events, assignments]);

  const handleDayClick = (dayString) => {
    const dayData = itemsByDay[dayString] || { events: [], assignments: [] };
    setSelectedDayItems(dayData);
    setSelectedDateString(dayString);
  };

  // Keep the selected day updated if data streams in late
  useEffect(() => {
    if (selectedDateString) {
      setSelectedDayItems(itemsByDay[selectedDateString] || { events: [], assignments: [] });
    }
  }, [itemsByDay, selectedDateString]);

  // Build Gemini Day Plan
  const buildGeminiPlan = async () => {
    if (!selectedDateString || !selectedDayItems) return;
    setGeminiLoading(true);
    setShowGeminiModal(true);
    setGeminiPlan(null); // clear old plan

    const dateFormatted = new Date(selectedDateString + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    
    let promptText = `I need an hourly action plan to optimize my day for ${dateFormatted}.\n\n`;
    
    if (selectedDayItems.events.length > 0) {
      promptText += `### My Fixed Calendar Events (I MUST attend these):\n`;
      selectedDayItems.events.forEach(e => {
        const time = e.start.dateTime ? new Date(e.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day';
        promptText += `- ${e.summary} at ${time}\n`;
      });
      promptText += `\n`;
    } else {
       promptText += `### Calendar Events:\nI have no hard calendar meetings or classes today!\n\n`;
    }

    if (selectedDayItems.assignments.length > 0) {
      promptText += `### My Homework Assignments Due Today (I MUST finish these):\n`;
      selectedDayItems.assignments.forEach(a => {
        promptText += `- ${a.title} (Class: ${a.courseName})\n`;
      });
      promptText += `\n`;
    } else {
       promptText += `### Assignments Due:\nAwesome, I have no homework due today!\n\n`;
    }

    const dayTodos = customTodos[selectedDateString] || [];
    const activeTodos = dayTodos.filter(t => !t.done);
    if (activeTodos.length > 0) {
      promptText += `### My Core Daily Tasks:\n`;
      activeTodos.forEach(t => promptText += `- ${t.text}\n`);
      promptText += `\n`;
    }

    promptText += `\nAct as an elite productivity and time-management coach. Write a highly specific, hour-by-hour strict schedule that weaves my homework around my hard calendar events. Leave adequate time for lunch, breaks, and buffer time. Use a very encouraging, motivating, and highly structured tone. Format your response elegantly in Markdown. Don't be too wordy, get straight to the timetable.`;

    try {
      const resp = await fetch(`${API_ROOT}/api/study`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText })
      });

      let data;
      const rawText = await resp.text();
      try { data = rawText ? JSON.parse(rawText) : {}; } catch { data = { result: rawText }; }

      if (!resp.ok) throw new Error(data.error || 'Gemini Backend Error');
      setGeminiPlan(data.result);

    } catch (err) {
      setGeminiPlan(`**Error Generating Schedule:** ${err.message}. Ensure your backend server is running and your API keys are valid.`);
    } finally {
      setGeminiLoading(false);
    }
  };


  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem('schedule_token');
    setAccessToken(null);
    setEvents([]);
    setAssignments([]);
    setSelectedDayItems(null);
    setSelectedDateString(null);
  };

  // Build Grid Math
  const totalDays = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const calendarCells = [];
  
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(<div key={`pad-${i}`} className="bg-transparent border border-white/5 opacity-30 min-h-[140px]"></div>);
  }
  
  const today = new Date();
  for (let i = 1; i <= totalDays; i++) {
    const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const dayData = itemsByDay[dayString] || { events: [], assignments: [] };
    const dayTodos = customTodos[dayString] || [];
    
    const hasEvents = dayData.events.length > 0;
    const hasAssignments = dayData.assignments.length > 0;
    const hasActiveTodos = dayTodos.some(t => !t.done);
    const isSelected = selectedDateString === dayString;

    calendarCells.push(
      <div 
        key={`day-${i}`} 
        onClick={() => handleDayClick(dayString)}
        className={`min-h-[140px] border border-white/5 p-2 flex flex-col cursor-pointer transition-all hover:bg-white/5 relative group
          ${isToday ? 'bg-indigo-900/10' : 'bg-[#121214]'}
          ${isSelected ? 'ring-2 ring-indigo-500 z-10 bg-white/5 shadow-2xl' : ''}
        `}
      >
        <div className="flex justify-between items-start w-full">
          <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
            ${isToday ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.8)] ring-2 ring-indigo-400' : 'text-gray-400 group-hover:text-white'}
          `}>
            {i}
          </span>
          <div className="flex items-center gap-1">
             {hasEvents && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)] sm:hidden"></div>}
             {hasAssignments && <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)] sm:hidden"></div>}
             {hasActiveTodos && <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)] sm:hidden"></div>}
          </div>
        </div>

        {/* Desktop Event Bars */}
        <div className="mt-2 space-y-1.5 hidden sm:block flex-1 overflow-y-auto custom-scrollbar pr-1">
          {dayData.events.slice(0, 3).map((evt, idx) => (
            <div key={`evt-${evt.id || idx}`} className="text-xs truncate px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded font-bold shadow-sm flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-blue-500" />
              <span className="truncate">{evt.summary || 'Busy'}</span>
            </div>
          ))}
          {dayData.assignments.slice(0, 3).map((asg, idx) => (
             <div key={`asg-${asg.id || idx}`} className="text-xs truncate px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-300 rounded font-bold shadow-sm flex items-center gap-1.5">
              <GraduationCap className="w-3 h-3 text-red-500" />
              <span className="truncate">{asg.title}</span>
            </div>
          ))}
          {dayTodos.filter(t => !t.done).slice(0, 3).map((todo, idx) => (
             <div key={`todo-${todo.id || idx}`} className="text-xs truncate px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-300 rounded font-bold shadow-sm flex items-center gap-1.5">
              <CheckSquare className="w-3 h-3 text-green-500" />
              <span className="truncate">{todo.text}</span>
            </div>
          ))}
          
          {(dayData.events.length + dayData.assignments.length + dayTodos.filter(t=>!t.done).length) > 5 && (
            <div className="text-[10px] font-bold text-gray-500 text-center mt-1">
              +{dayData.events.length + dayData.assignments.length + dayTodos.filter(t=>!t.done).length - 5} more
            </div>
          )}
        </div>
      </div>
    );
  }

  // Auth Overlay
  if (!accessToken) {
    return (
       <div className="flex flex-col items-center justify-center py-32 bg-[#1A1A1D] border border-white/5 rounded-3xl p-8 text-center max-w-2xl mx-auto relative overflow-hidden group mt-10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        <CalendarDays className="w-20 h-20 text-indigo-400 mb-8 drop-shadow-lg" />
        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Connect Schedule Hub</h2>
        <p className="text-gray-400 mb-10 text-lg max-w-md">Authenticate securely via Google to pull down your exact Calendar Events AND missing Classroom Assignments.</p>
        <button
          onClick={() => login()}
          className="flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-lg"
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
    );
  }

  return (
    <div className="space-y-8 mt-6 pb-20 max-w-[1700px] mx-auto relative">
      
      {/* Gemini Modal Overlay */}
      {showGeminiModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="bg-[#111113] border border-indigo-500/30 rounded-3xl p-6 shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col items-start relative overflow-hidden">
             
             <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
             <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

             <div className="flex items-center justify-between w-full mb-6 relative z-10 border-b border-white/5 pb-4">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                    <BrainCircuit className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">Gemini Daily Scheduler</h3>
                    <p className="text-indigo-400 font-bold text-sm">Optimizing specifically for {selectedDateString}</p>
                  </div>
               </div>
               <button onClick={() => setShowGeminiModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                 <X className="w-6 h-6" />
               </button>
             </div>

             <div className="flex-1 overflow-y-auto w-full pr-2 custom-scrollbar relative z-10 text-gray-200">
                {geminiLoading ? (
                  <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                    <p className="text-lg font-bold text-gray-300 animate-pulse text-center leading-relaxed">
                      Analyzing {selectedDayItems?.assignments?.length || 0} Assignments <br/>
                      and {selectedDayItems?.events?.length || 0} Calender Events...
                    </p>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-indigo max-w-none pb-4">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {geminiPlan || "*Empty Schedule*"}
                    </ReactMarkdown>
                  </div>
                )}
             </div>
           </div>
         </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1A1A1D] p-5 rounded-2xl border border-white/5 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center rounded-xl border border-indigo-500/30">
            <CalendarDays className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">{MONTHS[month]} {year}</h1>
            <p className="text-sm font-medium text-gray-400">Classroom Deadlines & Calendar Synced</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleLogout} className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold border border-red-500/20 transition-colors flex items-center gap-2 text-sm">
            <X className="w-4 h-4" />
            Sign Out
          </button>
          <button onClick={jumpToToday} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-gray-300 border border-white/5 transition-colors">
            Today
          </button>
          <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            <button onClick={handlePrevMonth} className="p-2.5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={handleNextMonth} className="p-2.5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {loading && !events.length && !assignments.length && (
         <div className="text-center py-10 bg-[#1A1A1D] rounded-3xl border border-white/5">
           <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
           <p className="text-gray-400 font-bold animate-pulse text-lg">Synchronizing Dual APIs...</p>
         </div>
      )}

      {/* Main Grid Layout */}
      <div className="flex flex-col xl:flex-row gap-6 relative">
        {/* Left Side: Calendar Grid */}
        <div className="flex-1 bg-[#1A1A1D] rounded-3xl border border-white/5 shadow-2xl overflow-hidden p-6 relative">
          
          {loading && (events.length > 0 || assignments.length > 0) && (
             <div className="absolute top-4 right-6 flex items-center gap-2 text-indigo-400 text-xs font-bold bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
               <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
               Live Sync
             </div>
          )}

          <div className="grid grid-cols-7 gap-0 mb-2">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="text-center text-xs font-black uppercase tracking-widest text-gray-500 py-3">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-white/5 rounded-2xl overflow-hidden shadow-inner custom-scrollbar">
            {calendarCells}
          </div>
        </div>

        {/* Right Side: Agenda Details Drawer */}
        <div className={`xl:w-[450px] bg-[#1A1A1D] rounded-3xl border border-white/5 shadow-2xl flex flex-col transition-all duration-300 min-h-[500px]
          ${selectedDateString ? 'opacity-100' : 'opacity-80 blur-[2px] pointer-events-none grayscale'}
        `}>
           <div className="p-6 border-b border-white/5 flex flex-col gap-5">
              <div>
                 <h3 className="text-2xl font-black text-white drop-shadow-sm flex items-center justify-between">
                   {selectedDateString ? new Date(selectedDateString + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }) : 'Agenda'}
                 </h3>
                 <p className="text-indigo-400 font-bold text-sm mt-1">
                   {selectedDateString ? new Date(selectedDateString + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Select a day on the calendar'}
                 </p>
              </div>

              {/* ✨ GEMINI OPTIMIZATION BUTTON ✨ */}
              <button 
                onClick={buildGeminiPlan}
                disabled={!selectedDateString}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 px-6 rounded-2xl shadow-[0_4px_20px_rgba(99,102,241,0.4)] transition-all hover:scale-[1.02] flex justify-center items-center gap-3 overflow-hidden relative group"
              >
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
                <Sparkles className="w-5 h-5 text-indigo-200 group-hover:animate-pulse" />
                Plan My Day with Gemini
              </button>
           </div>

           <div className="flex-1 overflow-y-auto p-5 custom-scrollbar pb-10">
             
             {/* "Schedule Clear" Message ONLY if everything is empty */}
             {selectedDayItems && selectedDayItems.events.length === 0 && selectedDayItems.assignments.length === 0 && (customTodos[selectedDateString] || []).length === 0 && (
               <div className="text-center pt-8 pb-4 flex flex-col items-center opacity-60">
                 <CheckSquare className="w-12 h-12 text-gray-500 mb-4" />
                 <p className="text-gray-300 font-bold text-lg mb-1">Schedule Clear</p>
                 <p className="text-gray-500 font-medium text-sm">No events or assignments perfectly balanced.</p>
               </div>
             )}

             <div className="space-y-6">
                  
                  {/* Classroom Assignments Block */}
                  {selectedDayItems && selectedDayItems.assignments.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-red-400 uppercase tracking-widest pl-1 mb-2">School Deadlines</h4>
                      {selectedDayItems.assignments.map((asg, idx) => (
                        <a 
                          key={`asg-view-${asg.id || idx}`}
                          href={asg.alternateLink}
                          target="_blank"
                          rel="noreferrer"
                          className="block p-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 rounded-2xl transition-all group"
                        >
                          <div className="flex gap-4">
                            <div className="mt-1 w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30 shrink-0">
                               <GraduationCap className="w-4 h-4 text-red-500" />
                            </div>
                            <div>
                               <h5 className="text-white font-bold text-base mb-1 leading-snug group-hover:text-red-300 transition-colors">{asg.title}</h5>
                               <p className="text-xs text-red-400 font-medium">{asg.courseName}</p>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Calendar Events Block */}
                  {selectedDayItems && selectedDayItems.events.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest pl-1 mb-2 mt-4">Personal Calendar</h4>
                      {selectedDayItems.events.map((evt, idx) => (
                        <a 
                          key={`evt-view-${evt.id || idx}`}
                          href={evt.htmlLink}
                          target="_blank"
                          rel="noreferrer"
                          className="block p-4 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 rounded-2xl transition-all group"
                        >
                          <h5 className="text-white font-bold text-lg mb-2 leading-tight group-hover:text-blue-300 transition-colors">{evt.summary || '(No Title)'}</h5>
                          
                          <div className="space-y-2 text-xs font-medium text-gray-400">
                            {evt.start.dateTime && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-blue-500" />
                                {new Date(evt.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                                {' - '} 
                                {evt.end.dateTime ? new Date(evt.end.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </div>
                            )}
                            {!evt.start.dateTime && (
                               <div className="flex items-center gap-2">
                                <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                                All Day Event
                              </div>
                            )}
                            {evt.location && (
                               <div className="flex items-center gap-2 pt-1 border-t border-white/5 mt-2">
                                 <MapPin className="w-3.5 h-3.5 text-orange-400" />
                                 <span className="truncate">{evt.location}</span>
                               </div>
                            )}
                            {evt.hangoutLink && (
                               <div className="flex items-center gap-2 pt-1 border-t border-white/5 mt-2">
                                 <Video className="w-3.5 h-3.5 text-green-400" />
                                 Google Meet
                               </div>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Personal Tasks Block */}
                  <div className="space-y-3 mt-4">
                     <h4 className="text-xs font-black text-green-400 uppercase tracking-widest pl-1 mb-2">My Daily Tasks</h4>
                     
                     {/* ADD TASK INPUT */}
                     <input 
                       type="text"
                       value={newTodoInput}
                       onChange={(e) => setNewTodoInput(e.target.value)}
                       onKeyDown={handleAddTodo}
                       placeholder="Type a task and hit Enter..."
                       className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-medium text-white shadow-inner focus:outline-none focus:border-green-500/50 transition-colors"
                     />

                     {/* TASK LIST */}
                     {(customTodos[selectedDateString] || []).map(todo => (
                         <div key={todo.id} className="flex items-center justify-between p-3.5 bg-green-500/5 hover:bg-green-500/10 border border-green-500/20 rounded-2xl transition-all group/todo">
                            <div className="flex items-center gap-3">
                               <button onClick={() => toggleTodo(selectedDateString, todo.id)} className="shrink-0 transition-transform active:scale-95">
                                  {todo.done ? 
                                    <CheckSquare className="w-5 h-5 text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]" /> : 
                                    <div className="w-5 h-5 border-[2px] border-white/20 hover:border-green-500 rounded flex items-center justify-center transition-colors"></div>
                                  }
                               </button>
                               <span className={`text-sm leading-snug ${todo.done ? 'text-gray-500 line-through' : 'text-gray-200 font-bold'}`}>
                                 {todo.text}
                               </span>
                            </div>
                            <button onClick={() => deleteTodo(selectedDateString, todo.id)} className="opacity-0 group-hover/todo:opacity-100 text-white/20 hover:text-red-400 transition-all p-1">
                              <X className="w-4 h-4" />
                            </button>
                         </div>
                     ))}
                  </div>

             </div>
           </div>
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

import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { BookOpen, GraduationCap, AlertCircle, Loader2, Calendar, CheckCircle2, ListTodo, Clock, FolderOpen, FolderClosed, ChevronDown, ChevronUp, AlertOctagon, CheckSquare, Award, LogOut, RefreshCw, ExternalLink, Settings, Landmark, MonitorCheck } from 'lucide-react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// --- HELPER FUNCTIONS --- //
const formatDueDate = (parsedDate) => {
  if (!parsedDate) return "No due date";
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(parsedDate);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return `Past due (${Math.abs(diffDays)}d ago)`;
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays < 7) return `Due in ${diffDays} days`;
  
  return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const parseClassroomDate = (dueDate, dueTime) => {
  if (!dueDate) return null;
  const dateObj = new Date();
  dateObj.setFullYear(dueDate.year, dueDate.month - 1, dueDate.day);
  if (dueTime) {
    dateObj.setHours(dueTime.hours || 23, dueTime.minutes || 59, 0, 0);
  } else {
    dateObj.setHours(23, 59, 59, 999);
  }
  return dateObj;
};

const getTimelineCategory = (updateTimeStr) => {
  if (!updateTimeStr) return 'Older';
  const updateDate = new Date(updateTimeStr);
  const now = new Date();
  const diffTime = now - updateDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 7) return 'This Week';
  if (diffDays <= 14) return 'Last Week';
  return 'Older';
};

// --- CORE COMPONENT --- //
function ClassroomCore() {
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('classroom_courses');
    if (saved) {
      try {
        return JSON.parse(saved).map(course => ({
          ...course,
          assignments: (course.assignments || []).map(a => ({ ...a, parsedDate: a.parsedDate ? new Date(a.parsedDate) : null }))
        }));
      } catch (e) {}
    }
    return [];
  });
  const [globalTodos, setGlobalTodos] = useState(() => {
    const saved = localStorage.getItem('classroom_todos');
    if (saved) {
      try {
        return JSON.parse(saved).map(todo => ({ ...todo, parsedDate: todo.parsedDate ? new Date(todo.parsedDate) : null }));
      } catch (e) {}
    }
    return [];
  });
  
  const [globalCompleted, setGlobalCompleted] = useState(() => {
    const saved = localStorage.getItem('classroom_completed');
    if (saved) {
      try {
        return JSON.parse(saved).map(todo => ({ ...todo, parsedDate: todo.parsedDate ? new Date(todo.parsedDate) : null }));
      } catch (e) {}
    }
    return [];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  
  // Folder states
  const [isMissingOpen, setIsMissingOpen] = useState(() => {
    const saved = localStorage.getItem('classroom_missing_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isUpcomingOpen, setIsUpcomingOpen] = useState(() => {
    const saved = localStorage.getItem('classroom_upcoming_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isNoDueDateOpen, setIsNoDueDateOpen] = useState(() => {
    const saved = localStorage.getItem('classroom_noduedate_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [isFinishedOpen, setIsFinishedOpen] = useState(() => {
    const saved = localStorage.getItem('classroom_finished_open');
    return saved !== null ? JSON.parse(saved) : false; // Default closed
  });
  const [isFinishedThisWeekOpen, setIsFinishedThisWeekOpen] = useState(true);
  const [isFinishedOlderOpen, setIsFinishedOlderOpen] = useState(false);

  // External Grading Portal State
  const [gradingUrl, setGradingUrl] = useState(() => {
    return localStorage.getItem('classroom_grading_url') || '';
  });
  const [gradingInput, setGradingInput] = useState('');
  const [isEditingGradingUrl, setIsEditingGradingUrl] = useState(false);

  // Save state naturally
  useEffect(() => {
    if (courses.length > 0) localStorage.setItem('classroom_courses', JSON.stringify(courses));
    if (globalTodos.length > 0) localStorage.setItem('classroom_todos', JSON.stringify(globalTodos));
    if (globalCompleted.length > 0) localStorage.setItem('classroom_completed', JSON.stringify(globalCompleted));
  }, [courses, globalTodos, globalCompleted]);

  useEffect(() => { localStorage.setItem('classroom_missing_open', JSON.stringify(isMissingOpen)); }, [isMissingOpen]);
  useEffect(() => { localStorage.setItem('classroom_upcoming_open', JSON.stringify(isUpcomingOpen)); }, [isUpcomingOpen]);
  useEffect(() => { localStorage.setItem('classroom_noduedate_open', JSON.stringify(isNoDueDateOpen)); }, [isNoDueDateOpen]);
  useEffect(() => { localStorage.setItem('classroom_finished_open', JSON.stringify(isFinishedOpen)); }, [isFinishedOpen]);

  // --- LOGOUT ---
  const handleLogout = () => {
    localStorage.removeItem('classroom_courses');
    localStorage.removeItem('classroom_todos');
    localStorage.removeItem('classroom_completed');
    setAccessToken(null);
    setCourses([]);
    setGlobalTodos([]);
    setGlobalCompleted([]);
  };

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setAccessToken(codeResponse.access_token);
      fetchDashboardData(codeResponse.access_token);
    },
    onError: (err) => setError('Login Failed: ' + err.message),
    scope: 'https://www.googleapis.com/auth/classroom.courses.readonly ' +
           'https://www.googleapis.com/auth/classroom.coursework.me.readonly ' +
           'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly ' +
           'https://www.googleapis.com/auth/classroom.announcements.readonly'
  });

  const fetchDashboardData = async (token) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Active Courses
      const coursesRes = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!coursesRes.ok) throw new Error('Failed to fetch courses');
      const coursesData = await coursesRes.json();
      const activeCourses = coursesData.courses || [];
      
      let allTodos = [];
      let allCompleted = [];
      const populatedCourses = [];

      // 2. Fetch CourseWork & Submissions for Each Course
      await Promise.all(activeCourses.map(async (course) => {
        try {
          const [workRes, subRes] = await Promise.all([
            fetch(`https://classroom.googleapis.com/v1/courses/${course.id}/courseWork?courseWorkStates=PUBLISHED`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`https://classroom.googleapis.com/v1/courses/${course.id}/courseWork/-/studentSubmissions`, { headers: { Authorization: `Bearer ${token}` } })
          ]);

          const workData = workRes.ok ? await workRes.json() : { courseWork: [] };
          const subData = subRes.ok ? await subRes.json() : { studentSubmissions: [] };

          const assignments = (workData.courseWork || []).map(work => {
            const submission = (subData.studentSubmissions || []).find(sub => sub.courseWorkId === work.id);
            const isTurnedIn = submission?.state === 'TURNED_IN' || submission?.state === 'RETURNED';
            const parsedDate = parseClassroomDate(work.dueDate, work.dueTime);
            
            return {
              ...work,
              courseName: course.name,
              courseId: course.id,
              isTurnedIn,
              parsedDate,
              assignedGrade: submission?.assignedGrade,
              maxPoints: work.maxPoints,
              updateTime: submission?.updateTime
            };
          });

          // All active assignments (missing + upcoming) for the Global Dashboard
          const allActiveForCourse = assignments.filter(a => !a.isTurnedIn);
          allActiveForCourse.sort((a, b) => (a.parsedDate || new Date(8640000000000000)) - (b.parsedDate || new Date(8640000000000000)));
          
          // Course-specific assignments (strictly exclude past-due for the mini cards)
          const courseUpcomingOnly = allActiveForCourse.filter(a => {
            const isMissing = a.parsedDate && a.parsedDate < new Date();
            return !isMissing;
          });
          
          const courseFinished = assignments.filter(a => a.isTurnedIn);

          allTodos = [...allTodos, ...allActiveForCourse];
          allCompleted = [...allCompleted, ...courseFinished];
          populatedCourses.push({ ...course, assignments: courseUpcomingOnly });
        } catch (err) {
          console.warn(`Could not pull data for course ${course.id}`, err);
          populatedCourses.push({ ...course, assignments: [] });
        }
      }));

      // Sort global todos by due date chronologically
      allTodos.sort((a, b) => {
        const dateA = a.parsedDate || new Date(8640000000000000); // Push null to bottom
        const dateB = b.parsedDate || new Date(8640000000000000);
        return dateA - dateB;
      });
      
      // Sort global completed by purely chronological completion (newest first)
      allCompleted.sort((a, b) => {
        const dateA = a.updateTime ? new Date(a.updateTime) : new Date(0);
        const dateB = b.updateTime ? new Date(b.updateTime) : new Date(0);
        return dateB - dateA;
      });

      setCourses(populatedCourses);
      setGlobalTodos(allTodos);
      setGlobalCompleted(allCompleted);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!CLIENT_ID) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-amber-500/10 border border-amber-500/20 rounded-3xl p-8 text-center max-w-2xl mx-auto mt-10">
        <AlertCircle className="w-16 h-16 text-amber-500 mb-6" />
        <h2 className="text-2xl font-black text-white mb-4">Google Client ID Missing</h2>
        <p className="text-amber-200 mb-6 leading-relaxed">
          To connect with Google Classroom, you need to create an OAuth 2.0 Web Client ID in the Google Cloud Console. 
          <br /><br />
          Once created, add it to a <code>.env</code> file in your project root as:
          <br />
          <code className="bg-black/50 px-4 py-2 rounded-lg mt-2 inline-block">VITE_GOOGLE_CLIENT_ID="your-client-id"</code>
        </p>
      </div>
    );
  }

  // If no access token but we have cached data, we can render the dashboard immediately!
  // It just won't be "live" until they click refresh.
  if (!accessToken && courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 theme-bg-secondary border theme-border rounded-2xl p-8 text-center max-w-lg mx-auto mt-10 shadow-2xl transition-all duration-300">
        <GraduationCap className="w-14 h-14 text-orange-500 mb-6" />
        <h2 className="text-2xl font-bold theme-text mb-3">Connect Your Classroom</h2>
        <p className="theme-text-secondary mb-8 text-sm max-w-sm">Sign in with your Google account to build a live To-Do Dashboard for your coursework.</p>
        <button
          onClick={() => login()}
          className="flex items-center gap-3 px-8 py-3.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all duration-300 shadow-lg shadow-orange-500/20 hover:scale-105"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 brightness-0 invert" />
          Sign in with Google
        </button>
        {error && (
          <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-center gap-2 w-full text-left">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10 mt-10 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold theme-text flex items-center gap-3">
            <ListTodo className="w-6 h-6 theme-text-muted" />
            Classroom Dashboard
          </h2>
          <p className="theme-text-muted mt-1 text-sm">Synced from your Google Workspace</p>
        </div>
        <div className="flex gap-3">
          {accessToken && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-xl border border-red-500/20 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          )}
          <button 
            onClick={() => accessToken ? fetchDashboardData(accessToken) : login()} 
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-white text-sm font-medium border border-white/5"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-gray-400' : 'text-gray-500'}`} />
            {loading ? 'Syncing...' : (!accessToken ? 'Live Sync' : 'Refresh')}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-bold">{error}</span>
        </div>
      )}

      {/* Loading State Overlay / Global To-Do Dashboard */}
      <div className="bg-[#141418] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-white/5 text-gray-400 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-white">Global To-Do List</h3>
        </div>

        {loading && globalTodos.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
            <p className="font-medium animate-pulse">Aggregating coursework from all {courses.length ? courses.length : ''} classrooms...</p>
          </div>
        ) : (
          <div className="space-y-6 relative z-10 p-2">
            
            {/* MISSING FOLDER */}
            {globalTodos.filter(todo => todo.parsedDate && todo.parsedDate < new Date()).length > 0 && (
              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl overflow-hidden shadow-sm">
                <button 
                  onClick={() => setIsMissingOpen(!isMissingOpen)}
                  className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 transition-all focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    {isMissingOpen ? <FolderOpen className="w-5 h-5 text-red-500" /> : <FolderClosed className="w-5 h-5 text-red-500" />}
                    <h4 className="text-lg font-black text-red-400 flex items-center gap-2">
                      Missing Work
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        {globalTodos.filter(todo => todo.parsedDate && todo.parsedDate < new Date()).length}
                      </span>
                    </h4>
                  </div>
                  {isMissingOpen ? <ChevronUp className="w-5 h-5 text-red-400" /> : <ChevronDown className="w-5 h-5 text-red-400" />}
                </button>
                
                {isMissingOpen && (
                  <div className="p-4 space-y-3">
                    {globalTodos.filter(todo => todo.parsedDate && todo.parsedDate < new Date()).map(todo => (
                      <a 
                        key={todo.id} 
                        href={todo.alternateLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#111113] hover:bg-black/50 border border-red-500/20 hover:border-red-500/40 rounded-xl transition-all group"
                      >
                        <div className="flex flex-col mb-3 sm:mb-0">
                          <span className="text-lg font-bold text-white group-hover:text-red-400 transition-colors leading-tight line-clamp-2">{todo.title}</span>
                          <span className="text-sm text-gray-400 font-medium">for <span className="text-gray-300">{todo.courseName}</span></span>
                        </div>
                        
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-sm shrink-0 bg-red-500/10 text-red-500 border border-red-500/20">
                          <AlertOctagon className="w-4 h-4" />
                          {formatDueDate(todo.parsedDate)}
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* UPCOMING TO-DO FOLDER */}
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl overflow-hidden shadow-sm">
              <button 
                onClick={() => setIsUpcomingOpen(!isUpcomingOpen)}
                className="w-full flex items-center justify-between p-4 bg-blue-500/10 hover:bg-blue-500/20 transition-all focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  {isUpcomingOpen ? <FolderOpen className="w-5 h-5 text-blue-400" /> : <FolderClosed className="w-5 h-5 text-blue-400" />}
                  <h4 className="text-lg font-black text-blue-400 flex items-center gap-2">
                    Upcoming To-Do
                    <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {globalTodos.filter(todo => todo.parsedDate && todo.parsedDate >= new Date()).length}
                    </span>
                  </h4>
                </div>
                {isUpcomingOpen ? <ChevronUp className="w-5 h-5 text-blue-400" /> : <ChevronDown className="w-5 h-5 text-blue-400" />}
              </button>
              
              {isUpcomingOpen && (
                <div className="p-4 space-y-3">
                  {globalTodos.filter(todo => todo.parsedDate && todo.parsedDate >= new Date()).length === 0 ? (
                    <div className="text-center py-8 bg-black/40 rounded-xl border border-white/5 border-dashed">
                      <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2 opacity-50" />
                      <p className="text-gray-400 font-bold text-sm">You are completely caught up! No active upcoming assignments.</p>
                    </div>
                  ) : (
                    globalTodos.filter(todo => todo.parsedDate && todo.parsedDate >= new Date()).slice(0, 10).map(todo => (
                      <a 
                        key={todo.id} 
                        href={todo.alternateLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#111113] hover:bg-black/50 border border-white/10 hover:border-blue-500/30 rounded-xl transition-all group"
                      >
                        <div className="flex flex-col mb-3 sm:mb-0">
                          <span className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors leading-tight line-clamp-2">{todo.title}</span>
                          <span className="text-sm text-gray-400 font-medium">for <span className="text-gray-300">{todo.courseName}</span></span>
                        </div>
                        
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-sm shrink-0 bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Calendar className="w-4 h-4" />
                          {formatDueDate(todo.parsedDate)}
                        </div>
                      </a>
                    ))
                  )}

                  {globalTodos.filter(todo => todo.parsedDate && todo.parsedDate >= new Date()).length > 10 && (
                    <div className="pt-2 text-center">
                      <span className="text-xs font-bold text-gray-500">
                        +{globalTodos.filter(todo => todo.parsedDate && todo.parsedDate >= new Date()).length - 10} more future assignments hidden
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* NO DUE DATE FOLDER */}
            {globalTodos.filter(todo => !todo.parsedDate).length > 0 && (
              <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl overflow-hidden shadow-sm">
                <button 
                  onClick={() => setIsNoDueDateOpen(!isNoDueDateOpen)}
                  className="w-full flex items-center justify-between p-4 bg-purple-500/10 hover:bg-purple-500/20 transition-all focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    {isNoDueDateOpen ? <FolderOpen className="w-5 h-5 text-purple-400" /> : <FolderClosed className="w-5 h-5 text-purple-400" />}
                    <h4 className="text-lg font-black text-purple-400 flex items-center gap-2">
                      No Due Date
                      <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        {globalTodos.filter(todo => !todo.parsedDate).length}
                      </span>
                    </h4>
                  </div>
                  {isNoDueDateOpen ? <ChevronUp className="w-5 h-5 text-purple-400" /> : <ChevronDown className="w-5 h-5 text-purple-400" />}
                </button>
                
                {isNoDueDateOpen && (
                  <div className="p-4 space-y-3">
                    {globalTodos.filter(todo => !todo.parsedDate).map(todo => (
                      <a 
                        key={todo.id} 
                        href={todo.alternateLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black/5 hover:theme-bg-elevated border theme-border hover:border-purple-500/30 rounded-xl transition-all group"
                      >
                        <div className="flex flex-col mb-3 sm:mb-0">
                          <span className="text-lg font-bold theme-text group-hover:text-purple-400 transition-colors leading-tight line-clamp-2">{todo.title}</span>
                          <span className="text-sm theme-text-secondary font-medium">for <span className="theme-text">{todo.courseName}</span></span>
                        </div>
                        
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-sm shrink-0 theme-bg-elevated theme-text-secondary border theme-border">
                          <ListTodo className="w-4 h-4" />
                          No due date
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FINISHED ASSIGNMENTS FOLDER (NESTED TIMELINE BUILD) */}
            {globalCompleted.length > 0 && (
              <div className="bg-green-500/5 border border-green-500/10 rounded-2xl overflow-hidden shadow-md mt-10">
                <button 
                  onClick={() => setIsFinishedOpen(!isFinishedOpen)}
                  className="w-full flex items-center justify-between p-5 bg-green-500/10 hover:bg-green-500/20 transition-all focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    {isFinishedOpen ? <FolderOpen className="w-6 h-6 text-green-500" /> : <FolderClosed className="w-6 h-6 text-green-500" />}
                    <h4 className="text-xl font-black text-green-500 flex items-center gap-3 tracking-wide">
                      Finished Assignments
                      <span className="bg-green-500 text-white text-sm px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                        {globalCompleted.length}
                      </span>
                    </h4>
                  </div>
                  {isFinishedOpen ? <ChevronUp className="w-6 h-6 text-green-500" /> : <ChevronDown className="w-6 h-6 text-green-500" />}
                </button>
                
                {isFinishedOpen && (
                  <div className="p-5 space-y-4">
                    {['This Week', 'Last Week', 'Older'].map(timeline => {
                      const timelineTodos = globalCompleted.filter(todo => getTimelineCategory(todo.updateTime) === timeline);
                      if (timelineTodos.length === 0) return null;
                      
                      const isOpen = timeline === 'This Week' ? isFinishedThisWeekOpen : (timeline === 'Last Week' ? isFinishedLastWeekOpen : isFinishedOlderOpen);
                      const toggleOpen = () => {
                        if (timeline === 'This Week') setIsFinishedThisWeekOpen(!isOpen);
                        if (timeline === 'Last Week') setIsFinishedLastWeekOpen(!isOpen);
                        if (timeline === 'Older') setIsFinishedOlderOpen(!isOpen);
                      };

                      return (
                        <div key={timeline} className="bg-black/30 border border-green-500/10 rounded-xl overflow-hidden shadow-inner">
                          <button 
                            onClick={toggleOpen}
                            className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 transition-all text-sm font-bold theme-text-secondary focus:outline-none"
                          >
                            <span className="flex items-center gap-2 theme-text">
                              {isOpen ? <ChevronDown className="w-4 h-4 text-green-500" /> : <ChevronUp className="w-4 h-4 theme-text-muted" />}
                              {timeline}
                              <span className="text-xs font-medium theme-bg-elevated theme-text px-2.5 py-0.5 rounded-full ml-1">
                                {timelineTodos.length}
                              </span>
                            </span>
                          </button>
                          
                          {isOpen && (
                            <div className="p-3 space-y-2.5">
                              {timelineTodos.map(todo => (
                                <a 
                                  key={todo.id} 
                                  href={todo.alternateLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-transparent hover:border-green-500/30 rounded-xl transition-all group"
                                >
                                  <div className="flex flex-col mb-3 lg:mb-0 lg:pr-4 overflow-hidden">
                                    <span className="text-base font-bold text-gray-300 group-hover:text-green-400 transition-colors leading-snug line-clamp-2 line-through opacity-80 group-hover:opacity-100">{todo.title}</span>
                                    <span className="text-xs text-gray-500 font-medium mt-0.5">for <span className="text-gray-400">{todo.courseName}</span></span>
                                  </div>
                                  
                                  <div className="flex flex-row flex-wrap items-center lg:justify-end gap-2 shrink-0">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-black/40 text-gray-400 border border-white/5 shadow-inner">
                                      <CheckSquare className="w-3.5 h-3.5 text-green-500" />
                                      Turned In
                                    </div>
                                    
                                    {(todo.assignedGrade !== undefined || todo.maxPoints) && (
                                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs shadow-inner ${todo.assignedGrade !== undefined ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                        <Award className="w-3.5 h-3.5" />
                                        {todo.assignedGrade !== undefined ? `${todo.assignedGrade} / ${todo.maxPoints || 100}` : 'Pending Grade'}
                                      </div>
                                    )}
                                  </div>
                                </a>
                              ))}
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
        )}
      </div>

      {/* Specific Class Cards with Mini To-Do Lists */}
      <h3 className="text-2xl font-black theme-text mt-12 mb-6">Your Courses</h3>
      
      {!loading && courses.length === 0 && !error && (
        <div className="text-center py-20 theme-text-secondary theme-glass rounded-3xl">
          No active courses found attached to your Google Account.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="theme-glass rounded-3xl p-6 relative overflow-hidden flex flex-col h-full shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            
            <div className="h-40 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-6 flex flex-col justify-end p-5 shrink-0">
              <h3 className="text-xl font-bold text-white drop-shadow-md leading-tight line-clamp-3">{course.name}</h3>
              <p className="text-sm text-gray-300 font-medium truncate mt-1">{course.section}</p>
            </div>
            
            <div className="flex-grow space-y-4">
              <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Upcoming for Class</h4>
              
              {course.assignments && course.assignments.length > 0 ? (
                <div className="space-y-2">
                  {course.assignments.slice(0, 3).map(assignment => (
                    <a 
                      key={assignment.id}
                      href={assignment.alternateLink}
                      target="_blank"
                      rel="noreferrer"
                      className="block p-3 theme-bg-elevated hover:theme-bg-secondary border theme-border hover:border-blue-500/30 rounded-xl transition-all"
                    >
                      <p className="text-sm font-bold theme-text mb-2 leading-tight line-clamp-2">{assignment.title}</p>
                      <p className="text-xs font-medium theme-text-secondary flex items-center gap-1.5 mt-auto">
                        <Clock className="w-3 h-3 text-blue-500" />
                        {formatDueDate(assignment.parsedDate)}
                      </p>
                    </a>
                  ))}
                  {course.assignments.length > 3 && (
                    <p className="text-xs text-center text-gray-500 font-bold pt-2">
                      +{course.assignments.length - 3} more
                    </p>
                  )}
                </div>
              ) : (
                <div className="py-6 px-4 theme-bg-elevated rounded-xl border theme-border text-center h-full flex flex-col items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 theme-text-muted mb-2 opacity-20" />
                  <p className="text-xs font-bold theme-text-secondary">Nothing due right now.</p>
                </div>
              )}
            </div>

            <a 
              href={course.alternateLink} 
              target="_blank" 
              rel="noreferrer"
              className="mt-6 w-full py-3 theme-bg-elevated hover:theme-bg-secondary border theme-border rounded-xl transition-all text-sm font-bold text-center theme-text flex justify-center items-center gap-2 shrink-0 group hover:border-blue-500/30"
            >
              <BookOpen className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              Open Global Classroom
            </a>
          </div>
        ))}
      </div>

    </div>
  );
}

export default function GoogleClassroom() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID || "placeholder-client-id"}>
      <ClassroomCore />
    </GoogleOAuthProvider>
  );
}

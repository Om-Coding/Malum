// Vercel Deploy Trigger: Podcast High-Quality Update
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './ThemeContext'
import Login from './Login'
import Home from './home'
import Study from './Study'
import Khan from './Khan'
import Classroom from './Classroom'
import Schedule from './Schedule'
import Gradescout from './Gradescout'
import TeacherDashboard from './TeacherDashboard'
import CollegeAI from './CollegeAI'
import Antigravity from './Antigravity'
import StudyGames from './StudyGames'
import AdminDashboard from './AdminDashboard'
import Contact from './Contact'
import Layout from './Layout'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/study" element={<Study />} />
            <Route path="/khan" element={<Khan />} />
            <Route path="/classroom" element={<Classroom />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/gradescout" element={<Gradescout />} />
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/college" element={<CollegeAI />} />
            <Route path="/antigravity" element={<Antigravity />} />
            <Route path="/games" element={<StudyGames />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App

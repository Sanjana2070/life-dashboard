import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Networking from './pages/Networking'
import JobApps from './pages/JobApps'
import Productivity from './pages/Productivity'
import TechLearnings from './pages/TechLearnings'
import Finances from './pages/Finances'
import Mood from './pages/Mood'
import Food from './pages/Food'
import Movement from './pages/Movement'
import Habits from './pages/Habits'
import Sleep from './pages/Sleep'
import StudentLife from './pages/StudentLife'
import ContentCreation from './pages/ContentCreation'

export default function App() {
  return (
    <BrowserRouter>
      <Sidebar />
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px 36px',
          background: 'var(--bg-base)',
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/networking" element={<Networking />} />
          <Route path="/job-apps" element={<JobApps />} />
          <Route path="/productivity" element={<Productivity />} />
          <Route path="/tech-learnings" element={<TechLearnings />} />
          <Route path="/finances" element={<Finances />} />
          <Route path="/mood" element={<Mood />} />
          <Route path="/food" element={<Food />} />
          <Route path="/movement" element={<Movement />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/sleep" element={<Sleep />} />
          <Route path="/student-life" element={<StudentLife />} />
          <Route path="/content-creation" element={<ContentCreation />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

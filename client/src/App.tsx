import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Productivity from './pages/Productivity'
import Mood from './pages/Mood'
import Food from './pages/Food'
import Movement from './pages/Movement'
import Habits from './pages/Habits'
import Sleep from './pages/Sleep'
import StudentLife from './pages/StudentLife'
import SheetPage from './pages/SheetPage'

const SHEET_PAGES = [
  { path: '/networking', title: 'Networking', subtitle: 'Contacts & interaction logs' },
  { path: '/job-apps', title: 'Job Applications', subtitle: 'Application pipeline' },
  { path: '/tech-learnings', title: 'Tech Learnings', subtitle: 'Project docs & pre-NYU learnings', availableSheets: ['project-documentation', 'learnings-before-nyu'] },
  { path: '/finances', title: 'Finances', subtitle: 'Monthly expenses' },
  { path: '/content-creation', title: 'Content Creation', subtitle: 'Content plans & tracking' },
]

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
          <Route path="/productivity" element={<Productivity />} />
          <Route path="/mood" element={<Mood />} />
          <Route path="/food" element={<Food />} />
          <Route path="/movement" element={<Movement />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/sleep" element={<Sleep />} />
          <Route path="/student-life" element={<StudentLife />} />
          {SHEET_PAGES.map(p => (
            <Route
              key={p.path}
              path={p.path}
              element={<SheetPage endpoint={p.path} title={p.title} subtitle={p.subtitle} availableSheets={p.availableSheets} />}
            />
          ))}
        </Routes>
      </main>
    </BrowserRouter>
  )
}

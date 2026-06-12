import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

const TRACKERS = [
  { to: '/networking', label: 'Networking', icon: '🤝', desc: 'Contacts & interactions' },
  { to: '/job-apps', label: 'Job Applications', icon: '💼', desc: 'Application pipeline' },
  { to: '/productivity', label: 'Productivity', icon: '📊', desc: 'Browser time tracking' },
  { to: '/tech-learnings', label: 'Tech Learnings', icon: '🧠', desc: 'Projects & courses' },
  { to: '/finances', label: 'Finances', icon: '💰', desc: 'Monthly expenses' },
  { to: '/mood', label: 'Mood', icon: '🌙', desc: 'Journal & mood ratings' },
  { to: '/food', label: 'Food', icon: '🥗', desc: 'Meals & prep' },
  { to: '/movement', label: 'Movement & Dance', icon: '💃', desc: 'Exercise & dance logs' },
  { to: '/habits', label: 'Habits', icon: '✅', desc: 'Daily habit checklist' },
  { to: '/sleep', label: 'Sleep', icon: '😴', desc: 'Sleep quality log' },
  { to: '/student-life', label: 'Student Life', icon: '🎓', desc: 'NYU deadlines & events' },
  { to: '/content-creation', label: 'Content Creation', icon: '✍️', desc: 'Content plans & tracking' },
]

export default function Home() {
  return (
    <div>
      <PageHeader title="Good morning ✦" subtitle="Here's your life at a glance." />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        {TRACKERS.map(({ to, label, icon, desc }) => (
          <Link
            key={to}
            to={to}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '18px 20px',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)'
                ;(e.currentTarget as HTMLDivElement).style.background = 'var(--bg-elevated)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
                ;(e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface)'
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{label}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

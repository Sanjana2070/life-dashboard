export interface Tracker {
  to: string
  label: string
  icon: string
  desc: string
}

// Single source of truth for the sidebar nav and the home grid.
export const TRACKERS: Tracker[] = [
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

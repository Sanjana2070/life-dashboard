import PageHeader from '../components/PageHeader'

export default function StudentLife() {
  return (
    <div>
      <PageHeader title="Student Life" subtitle="NYU resources, reminders, deadlines" />
      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
        Google Sheets integration — coming in Phase 4.
      </div>
    </div>
  )
}

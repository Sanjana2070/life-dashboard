interface Props {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}

export default function StatCard({ label, value, sub, accent }: Props) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '16px 20px',
      }}
    >
      <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 6 }}>{label}</div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: accent ? 'var(--accent)' : 'var(--text-primary)',
        }}
      >
        {value}
      </div>
      {sub && <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

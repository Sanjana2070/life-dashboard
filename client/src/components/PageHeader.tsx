interface Props {
  title: string
  subtitle?: string
}

export default function PageHeader({ title, subtitle }: Props) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>{today}</div>
      <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h1>
      {subtitle && <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{subtitle}</p>}
    </div>
  )
}

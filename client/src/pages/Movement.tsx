import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import api from '../api/client'
import type { MovementLog } from '../types'

function today() {
  return new Date().toISOString().slice(0, 10)
}

const TYPES = ['walk', 'exercise', 'dance'] as const
const TYPE_ICONS: Record<string, string> = { walk: '🚶', exercise: '💪', dance: '💃' }

const INPUT_STYLE: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  color: 'var(--text-primary)',
  padding: '8px 12px',
  fontSize: 14,
  width: '100%',
  outline: 'none',
}

export default function Movement() {
  const [logs, setLogs] = useState<MovementLog[]>([])
  const [prompt, setPrompt] = useState('')
  const [form, setForm] = useState({ type: 'walk', duration_minutes: '', notes: '' })
  const [saved, setSaved] = useState(false)

  async function load() {
    const res = await api.get<{ logs: MovementLog[]; prompt: string }>(`/movement?date=${today()}`)
    setLogs(res.data.logs)
    setPrompt(res.data.prompt)
  }

  useEffect(() => { load() }, [])

  async function addLog(e: React.FormEvent) {
    e.preventDefault()
    await api.post('/movement', {
      date: today(),
      type: form.type,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : undefined,
      notes: form.notes || undefined,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
    setForm(f => ({ ...f, duration_minutes: '', notes: '' }))
    load()
  }

  async function deleteLog(id: number) {
    await api.delete(`/movement/${id}`)
    setLogs(prev => prev.filter(l => l.id !== id))
  }

  const totalMinutes = logs.reduce((sum, l) => sum + (l.duration_minutes ?? 0), 0)

  return (
    <div>
      <PageHeader title="Movement & Dance" subtitle="Exercise logs, dance classes, daily prompt" />

      {/* Daily prompt */}
      {prompt && (
        <div
          style={{
            background: 'rgba(124,131,253,0.08)',
            border: '1px solid rgba(124,131,253,0.3)',
            borderRadius: 10,
            padding: '16px 20px',
            marginBottom: 28,
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontSize: 20, flexShrink: 0 }}>✨</span>
          <div>
            <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 4, fontWeight: 600 }}>
              TODAY'S MOVEMENT PROMPT
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{prompt}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        {/* Log form */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Log movement</h2>
          <form onSubmit={addLog}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 5 }}>
                Type
              </label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                style={INPUT_STYLE}
              >
                {TYPES.map(t => (
                  <option key={t} value={t}>{TYPE_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 5 }}>
                Duration (minutes)
              </label>
              <input
                type="number"
                min={1}
                value={form.duration_minutes}
                onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
                placeholder="e.g. 30"
                style={INPUT_STYLE}
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 5 }}>
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="How did it feel? Where did you go?"
                rows={2}
                style={{ ...INPUT_STYLE, resize: 'vertical' }}
              />
            </div>
            <button
              type="submit"
              style={{
                background: saved ? 'var(--green)' : 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                padding: '8px 18px',
                fontSize: 14,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {saved ? 'Logged!' : 'Log movement'}
            </button>
          </form>
        </div>

        {/* Today's logs */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 600 }}>Today</h2>
            {totalMinutes > 0 && (
              <span style={{ fontSize: 13, color: 'var(--accent)' }}>
                {totalMinutes} min total
              </span>
            )}
          </div>

          {logs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>
              No movement logged yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {logs.map(log => (
                <div
                  key={log.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{TYPE_ICONS[log.type]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                      {log.duration_minutes && (
                        <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontWeight: 400 }}>
                          {log.duration_minutes} min
                        </span>
                      )}
                    </div>
                    {log.notes && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {log.notes}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteLog(log.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: 16,
                      padding: '0 4px',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

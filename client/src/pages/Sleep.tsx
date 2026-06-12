import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import api from '../api/client'
import type { SleepLog } from '../types'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function durationLabel(bedtime?: string, wake_time?: string) {
  if (!bedtime || !wake_time) return null
  const [bh, bm] = bedtime.split(':').map(Number)
  const [wh, wm] = wake_time.split(':').map(Number)
  let mins = (wh * 60 + wm) - (bh * 60 + bm)
  if (mins < 0) mins += 24 * 60
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m}m`
}

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

export default function Sleep() {
  const [today_entry, setTodayEntry] = useState<SleepLog | null>(null)
  const [history, setHistory] = useState<SleepLog[]>([])
  const [form, setForm] = useState({ date: today(), bedtime: '', wake_time: '', quality: '', notes: '' })
  const [saved, setSaved] = useState(false)

  async function load() {
    const [todayRes, histRes] = await Promise.all([
      api.get<SleepLog | null>(`/sleep?date=${today()}`),
      api.get<SleepLog[]>('/sleep'),
    ])
    if (todayRes.data) {
      setTodayEntry(todayRes.data)
      setForm(f => ({
        ...f,
        bedtime: todayRes.data?.bedtime ?? '',
        wake_time: todayRes.data?.wake_time ?? '',
        quality: String(todayRes.data?.quality ?? ''),
        notes: todayRes.data?.notes ?? '',
      }))
    }
    setHistory(histRes.data.slice(0, 7))
  }

  useEffect(() => { load() }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    await api.post('/sleep', {
      date: form.date,
      bedtime: form.bedtime || undefined,
      wake_time: form.wake_time || undefined,
      quality: form.quality ? Number(form.quality) : undefined,
      notes: form.notes || undefined,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    load()
  }

  const qualityColors = ['', '#ef4444', '#ff6b35', '#f59e0b', '#7c83fd', '#4caf50']

  return (
    <div>
      <PageHeader title="Sleep" subtitle="Track your sleep quality and times" />

      {/* Today quick view */}
      {today_entry && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '16px 20px',
            marginBottom: 28,
            display: 'flex',
            gap: 32,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 3 }}>BEDTIME</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{today_entry.bedtime ?? '—'}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 3 }}>WAKE TIME</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{today_entry.wake_time ?? '—'}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 3 }}>DURATION</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>
              {durationLabel(today_entry.bedtime, today_entry.wake_time) ?? '—'}
            </div>
          </div>
          {today_entry.quality && (
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 3 }}>QUALITY</div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: qualityColors[today_entry.quality],
                }}
              >
                {today_entry.quality}/5
              </div>
            </div>
          )}
        </div>
      )}

      {/* Log form */}
      <form onSubmit={save} style={{ maxWidth: 480, marginBottom: 36 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Log sleep</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 5 }}>
              Bedtime
            </label>
            <input
              type="time"
              value={form.bedtime}
              onChange={e => setForm(f => ({ ...f, bedtime: e.target.value }))}
              style={INPUT_STYLE}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 5 }}>
              Wake time
            </label>
            <input
              type="time"
              value={form.wake_time}
              onChange={e => setForm(f => ({ ...f, wake_time: e.target.value }))}
              style={INPUT_STYLE}
            />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 5 }}>
            Quality (1 = poor, 5 = great)
          </label>
          <select
            value={form.quality}
            onChange={e => setForm(f => ({ ...f, quality: e.target.value }))}
            style={{ ...INPUT_STYLE }}
          >
            <option value="">Select…</option>
            {[1, 2, 3, 4, 5].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 5 }}>
            Notes
          </label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={2}
            placeholder="Dreams, how you felt, what affected sleep…"
            style={{ ...INPUT_STYLE, resize: 'vertical', minHeight: 64 }}
          />
        </div>
        <button
          type="submit"
          style={{
            background: saved ? 'var(--green)' : 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            padding: '9px 20px',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {saved ? 'Saved!' : 'Save'}
        </button>
      </form>

      {/* 7-day history */}
      {history.length > 0 && (
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Last 7 nights</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.map(log => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '10px 16px',
                  fontSize: 13,
                }}
              >
                <span style={{ color: 'var(--text-muted)', minWidth: 90 }}>{log.date}</span>
                <span>{log.bedtime ?? '—'} → {log.wake_time ?? '—'}</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {durationLabel(log.bedtime, log.wake_time) ?? ''}
                </span>
                {log.quality && (
                  <span style={{ color: qualityColors[log.quality], marginLeft: 'auto' }}>
                    ★ {log.quality}/5
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

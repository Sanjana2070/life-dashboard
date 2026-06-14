import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import api from '../api/client'
import { today } from '../lib/util'
import { HABIT_LABELS, type HabitKey, type HabitLog } from '../types'

const HABITS = Object.keys(HABIT_LABELS) as HabitKey[]

const HABIT_ICONS: Record<HabitKey, string> = {
  read_books: '📚',
  breathwork: '🌬️',
  morning_pages: '✍️',
  movement_prompt: '💃',
  brush_twice: '🪥',
  movement_video: '🎥',
}

export default function Habits() {
  const [habits, setHabits] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const date = today()

  async function load() {
    try {
      const res = await api.get<HabitLog[]>(`/habits?date=${date}`)
      const map: Record<string, boolean> = {}
      for (const h of res.data) map[h.habit] = Boolean(h.completed)
      setHabits(map)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function toggle(habit: HabitKey) {
    const newVal = !habits[habit]
    setHabits(prev => ({ ...prev, [habit]: newVal }))
    await api.patch(`/habits/${habit}`, { date, completed: newVal })
  }

  const done = HABITS.filter(h => habits[h]).length

  return (
    <div>
      <PageHeader title="Habits" subtitle="Your 6 daily habits" />

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
          Today's progress
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              flex: 1,
              height: 8,
              background: 'var(--border)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(done / HABITS.length) * 100}%`,
                height: '100%',
                background: done === HABITS.length ? 'var(--green)' : 'var(--accent)',
                borderRadius: 4,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {done} / {HABITS.length}
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {HABITS.map(habit => {
            const checked = Boolean(habits[habit])
            return (
              <button
                key={habit}
                onClick={() => toggle(habit)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  background: checked ? 'rgba(76,175,80,0.08)' : 'var(--bg-surface)',
                  border: `1px solid ${checked ? 'var(--green)' : 'var(--border)'}`,
                  borderRadius: 10,
                  padding: '14px 18px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    border: `2px solid ${checked ? 'var(--green)' : 'var(--border)'}`,
                    background: checked ? 'var(--green)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: 13,
                    color: 'white',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                >
                  {checked && '✓'}
                </div>
                <span style={{ fontSize: 18 }}>{HABIT_ICONS[habit]}</span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: checked ? 'var(--green)' : 'var(--text-primary)',
                    textDecoration: checked ? 'line-through' : 'none',
                    opacity: checked ? 0.8 : 1,
                  }}
                >
                  {HABIT_LABELS[habit]}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

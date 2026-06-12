import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import api from '../api/client'
import type { FoodLog } from '../types'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function getMondayOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().slice(0, 10)
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const

const MEAL_ICONS: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
}

const REMINDERS = [
  { time: '12:00', label: 'Lunch', icon: '☀️' },
  { time: '17:00', label: 'Dinner', icon: '🌙' },
  { time: '20:00', label: 'Evening snack', icon: '🍎' },
]

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

export default function Food() {
  const [logs, setLogs] = useState<FoodLog[]>([])
  const [prep, setPrep] = useState<{ plan: string } | null>(null)
  const [form, setForm] = useState({ meal_type: 'breakfast', description: '' })
  const [prepForm, setPrepForm] = useState('')
  const [showPrepEdit, setShowPrepEdit] = useState(false)

  async function load() {
    const res = await api.get<{ logs: FoodLog[]; prep: { plan: string } | null }>(
      `/food?date=${today()}`
    )
    setLogs(res.data.logs)
    setPrep(res.data.prep)
    if (res.data.prep) setPrepForm(res.data.prep.plan)
  }

  useEffect(() => { load() }, [])

  async function addLog(e: React.FormEvent) {
    e.preventDefault()
    await api.post('/food/log', { date: today(), ...form })
    setForm(f => ({ ...f, description: '' }))
    load()
  }

  async function deleteLog(id: number) {
    await api.delete(`/food/log/${id}`)
    setLogs(prev => prev.filter(l => l.id !== id))
  }

  async function savePrepPlan() {
    await api.post('/food/prep', { week_start: getMondayOfWeek(new Date()), plan: prepForm })
    setShowPrepEdit(false)
    load()
  }

  const byMeal: Record<string, FoodLog[]> = {}
  for (const t of MEAL_TYPES) byMeal[t] = logs.filter(l => l.meal_type === t)

  return (
    <div>
      <PageHeader title="Food" subtitle="Meal logs & weekly prep" />

      {/* Reminders */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 28,
          flexWrap: 'wrap',
        }}
      >
        {REMINDERS.map(r => (
          <div
            key={r.time}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '10px 16px',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>{r.icon}</span>
            <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
            <span style={{ fontWeight: 600 }}>{r.time}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        {/* Log form */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Log a meal</h2>
          <form onSubmit={addLog}>
            <div style={{ marginBottom: 10 }}>
              <select
                value={form.meal_type}
                onChange={e => setForm(f => ({ ...f, meal_type: e.target.value }))}
                style={INPUT_STYLE}
              >
                {MEAL_TYPES.map(t => (
                  <option key={t} value={t}>
                    {MEAL_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="What did you eat?"
                rows={2}
                style={{ ...INPUT_STYLE, resize: 'vertical' }}
              />
            </div>
            <button
              type="submit"
              disabled={!form.description.trim()}
              style={{
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                padding: '8px 18px',
                fontSize: 14,
                cursor: 'pointer',
                opacity: !form.description.trim() ? 0.5 : 1,
              }}
            >
              Add meal
            </button>
          </form>
        </div>

        {/* Today's meals by type */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Today's meals</h2>
          {MEAL_TYPES.map(mealType => (
            <div key={mealType} style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 6,
                }}
              >
                {MEAL_ICONS[mealType]} {mealType}
              </div>
              {byMeal[mealType].length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>
                  Nothing logged
                </div>
              ) : (
                byMeal[mealType].map(log => (
                  <div
                    key={log.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      padding: '8px 12px',
                      fontSize: 13,
                      marginBottom: 4,
                    }}
                  >
                    <span>{log.description}</span>
                    <button
                      onClick={() => deleteLog(log.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: 15,
                        padding: '0 4px',
                        lineHeight: 1,
                      }}
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Meal prep */}
      <div style={{ marginTop: 32 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 600 }}>This week's meal prep</h2>
          <button
            onClick={() => setShowPrepEdit(e => !e)}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 12,
              padding: '4px 12px',
            }}
          >
            {showPrepEdit ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {showPrepEdit ? (
          <div>
            <textarea
              value={prepForm}
              onChange={e => setPrepForm(e.target.value)}
              rows={5}
              placeholder="Write your weekly meal prep plan…"
              style={{ ...INPUT_STYLE, resize: 'vertical', marginBottom: 10 }}
            />
            <button
              onClick={savePrepPlan}
              style={{
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                padding: '8px 18px',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Save plan
            </button>
          </div>
        ) : (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '14px 16px',
              fontSize: 13,
              color: prep ? 'var(--text-primary)' : 'var(--text-muted)',
              whiteSpace: 'pre-wrap',
              fontStyle: prep ? 'normal' : 'italic',
            }}
          >
            {prep?.plan ?? 'No prep plan yet. Click Edit to add one.'}
          </div>
        )}
      </div>
    </div>
  )
}

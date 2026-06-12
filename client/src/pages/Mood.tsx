import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import api from '../api/client'
import type { MoodEntry, MoodPeriod } from '../types'

function today() {
  return new Date().toISOString().slice(0, 10)
}

const PERIODS: { key: MoodPeriod; label: string; icon: string }[] = [
  { key: 'morning', label: 'Morning', icon: '🌅' },
  { key: 'afternoon', label: 'Afternoon', icon: '☀️' },
  { key: 'night', label: 'Night', icon: '🌙' },
]

const RATING_COLORS = ['', '#ef4444', '#ff6b35', '#f59e0b', '#7c83fd', '#4caf50']
const RATING_LABELS = ['', 'Very low', 'Low', 'Okay', 'Good', 'Great']

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

interface MoodBlockProps {
  period: { key: MoodPeriod; label: string; icon: string }
  entry: MoodEntry | undefined
  onSave: (period: MoodPeriod, rating: number, music: string) => void
}

function MoodBlock({ period, entry, onSave }: MoodBlockProps) {
  const [rating, setRating] = useState(entry?.rating ?? 0)
  const [music, setMusic] = useState(entry?.music_listened ?? '')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setRating(entry?.rating ?? 0)
    setMusic(entry?.music_listened ?? '')
  }, [entry])

  async function save() {
    if (!rating) return
    onSave(period.key, rating, music)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '18px 20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 20 }}>{period.icon}</span>
        <span style={{ fontWeight: 600, fontSize: 15 }}>{period.label}</span>
        {entry?.rating && (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 12,
              color: RATING_COLORS[entry.rating],
              fontWeight: 500,
            }}
          >
            {RATING_LABELS[entry.rating]}
          </span>
        )}
      </div>

      {/* 1-5 star buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => setRating(n)}
            style={{
              flex: 1,
              background: rating >= n ? RATING_COLORS[n] : 'var(--bg-elevated)',
              border: `1px solid ${rating === n ? RATING_COLORS[n] : 'var(--border)'}`,
              borderRadius: 6,
              color: rating >= n ? 'white' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              padding: '8px 0',
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            {n}
          </button>
        ))}
      </div>

      {rating > 0 && (
        <div
          style={{
            fontSize: 12,
            color: RATING_COLORS[rating],
            marginBottom: 12,
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          {RATING_LABELS[rating]}
        </div>
      )}

      <input
        type="text"
        value={music}
        onChange={e => setMusic(e.target.value)}
        placeholder="Music you're listening to…"
        style={{ ...INPUT_STYLE, marginBottom: 12 }}
      />

      <button
        onClick={save}
        disabled={!rating}
        style={{
          background: saved ? 'var(--green)' : 'var(--accent)',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          padding: '7px 16px',
          fontSize: 13,
          cursor: rating ? 'pointer' : 'not-allowed',
          opacity: rating ? 1 : 0.5,
          transition: 'background 0.2s',
          width: '100%',
        }}
      >
        {saved ? 'Saved!' : 'Save'}
      </button>
    </div>
  )
}

export default function Mood() {
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [existingJournal, setExistingJournal] = useState('')
  const [newEntry, setNewEntry] = useState('')
  const [journalSaved, setJournalSaved] = useState(false)
  const date = today()

  async function load() {
    const res = await api.get<{ entries: MoodEntry[]; journal: string }>(`/mood?date=${date}`)
    setEntries(res.data.entries)
    setExistingJournal(res.data.journal)
  }

  useEffect(() => { load() }, [])

  async function saveMood(period: MoodPeriod, rating: number, music_listened: string) {
    await api.post('/mood/rating', { date, period, rating, music_listened: music_listened || undefined })
    load()
  }

  async function saveJournal(e: React.FormEvent) {
    e.preventDefault()
    if (!newEntry.trim()) return
    await api.post('/mood/journal', { date, text: newEntry })
    setJournalSaved(true)
    setNewEntry('')
    setTimeout(() => setJournalSaved(false), 2000)
    load()
  }

  const entryByPeriod = Object.fromEntries(entries.map(e => [e.period, e])) as Record<MoodPeriod, MoodEntry | undefined>

  const TEXTAREA_STYLE: React.CSSProperties = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    padding: '12px 16px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
    resize: 'vertical',
    lineHeight: 1.6,
    marginBottom: 12,
  }

  return (
    <div>
      <PageHeader title="Mood" subtitle="How are you feeling today?" />

      {/* Three mood blocks */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginBottom: 32,
        }}
      >
        {PERIODS.map(period => (
          <MoodBlock
            key={period.key}
            period={period}
            entry={entryByPeriod[period.key]}
            onSave={saveMood}
          />
        ))}
      </div>

      {/* Journal */}
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Journal</h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          Saved to Obsidian at{' '}
          <code style={{ background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 4, fontSize: 11 }}>
            non-ingested/{date.split('-')[1]}-{date.split('-')[2]}-{date.split('-')[0]}.md
          </code>
        </p>

        {/* Existing file content */}
        {existingJournal ? (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>
              TODAY'S ENTRIES
            </div>
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '12px 16px',
                fontSize: 13,
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                color: 'var(--text-primary)',
                maxHeight: 240,
                overflowY: 'auto',
              }}
            >
              {existingJournal}
            </div>
          </div>
        ) : null}

        {/* New entry */}
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>
            {existingJournal ? 'ADD ANOTHER ENTRY' : 'NEW ENTRY'}
          </div>
          <form onSubmit={saveJournal}>
            <textarea
              value={newEntry}
              onChange={e => setNewEntry(e.target.value)}
              placeholder="Write your thoughts…"
              rows={5}
              style={TEXTAREA_STYLE}
            />
            <button
              type="submit"
              disabled={!newEntry.trim()}
              style={{
                background: journalSaved ? 'var(--green)' : 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                padding: '9px 20px',
                fontSize: 14,
                cursor: newEntry.trim() ? 'pointer' : 'not-allowed',
                opacity: newEntry.trim() ? 1 : 0.5,
                transition: 'background 0.2s',
              }}
            >
              {journalSaved ? 'Saved to Obsidian!' : 'Append to Obsidian'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

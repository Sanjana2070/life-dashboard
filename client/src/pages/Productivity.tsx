import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import api from '../api/client'
import type { ProductivityDay } from '../types'

function fmt(seconds: number) {
  if (seconds < 60) return `${seconds}s`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

const SITE_COLORS: Record<string, string> = {
  Instagram: '#e1306c',
  YouTube: '#ff0000',
  LinkedIn: '#0a66c2',
  Gmail: '#ea4335',
  'Deeplearning.ai': '#4caf50',
  Udemy: '#a435f0',
  GitHub: '#7c83fd',
  'Hacker News': '#ff6600',
  Reddit: '#ff4500',
  'Twitter/X': '#1da1f2',
  Notion: '#a0a0a0',
  Figma: '#f24e1e',
  ChatGPT: '#10a37f',
  Claude: '#7c83fd',
}

function siteColor(site: string) {
  return SITE_COLORS[site] ?? '#8888a8'
}

export default function Productivity() {
  const [today, setToday] = useState<ProductivityDay | null>(null)
  const [week, setWeek] = useState<ProductivityDay[]>([])
  const [noData, setNoData] = useState(false)

  async function load() {
    try {
      const [todayRes, weekRes] = await Promise.all([
        api.get<ProductivityDay>('/productivity/today'),
        api.get<ProductivityDay[]>('/productivity/week'),
      ])
      setToday(todayRes.data)
      setWeek(weekRes.data)
      if (Object.keys(todayRes.data.usage ?? {}).length === 0 && weekRes.data.length === 0) {
        setNoData(true)
      }
    } catch {
      setNoData(true)
    }
  }

  useEffect(() => { load() }, [])

  const chartDays = [...week].reverse()
  const maxWeekSeconds = Math.max(
    1,
    ...chartDays.map(d => Object.values(d.usage ?? {}).reduce((a, b) => a + b, 0))
  )

  return (
    <div>
      <PageHeader title="Productivity" subtitle="Browser time tracking — top 5 sites" />

      {noData ? (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '24px 28px',
            maxWidth: 520,
          }}
        >
          <div style={{ fontSize: 20, marginBottom: 12 }}>🔌</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>No data yet</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>
            Load the Chrome extension from{' '}
            <code style={{ background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 4, fontSize: 11 }}>
              chrome-extension/
            </code>{' '}
            via <strong>chrome://extensions</strong> with Developer Mode on, then browse for a bit.
            Data syncs every 30 seconds.
          </p>
        </div>
      ) : (
        <>
          {/* Today's top 5 */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Today — top sites</h2>
            {(today?.top5 ?? []).length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data for today yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 520 }}>
                {(today?.top5 ?? []).map(({ site, seconds }) => (
                  <div
                    key={site}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '12px 16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{site}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{fmt(seconds)}</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${(seconds / Math.max(...(today?.top5 ?? []).map(s => s.seconds))) * 100}%`,
                          height: '100%',
                          background: siteColor(site),
                          borderRadius: 3,
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7-day chart */}
          {chartDays.length > 0 && (
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>7-day overview</h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 120 }}>
                {chartDays.map(day => {
                  const total = Object.values(day.usage ?? {}).reduce((a, b) => a + b, 0)
                  const heightPct = (total / maxWeekSeconds) * 100
                  const top5Sites = [...(day.top5 ?? [])].slice(0, 5)
                  return (
                    <div
                      key={day.date}
                      title={`${day.date}: ${fmt(total)}`}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <div style={{ width: '100%', height: 100, display: 'flex', alignItems: 'flex-end' }}>
                        <div
                          style={{
                            width: '100%',
                            height: `${Math.max(heightPct, 4)}%`,
                            background: `linear-gradient(to top, ${siteColor(top5Sites[0]?.site ?? 'GitHub')}, ${siteColor(top5Sites[1]?.site ?? 'GitHub')}88)`,
                            borderRadius: '4px 4px 0 0',
                            minHeight: 4,
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {day.date.slice(5)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

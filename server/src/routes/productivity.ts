import { Router, Request, Response } from 'express'
import db from '../db'

const router = Router()

function top5(usage: Record<string, number>) {
  return Object.entries(usage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([site, seconds]) => ({ site, seconds }))
}

router.post('/sync', (req: Request, res: Response) => {
  const { date, data } = req.body as {
    date: string
    data: { usage: Record<string, number> }
  }
  db.prepare(
    `INSERT INTO productivity_daily (date, data_json)
     VALUES (?, ?)
     ON CONFLICT(date) DO UPDATE SET data_json = excluded.data_json, updated_at = datetime('now')`
  ).run(date, JSON.stringify(data))
  res.json({ ok: true })
})

router.get('/today', (_req: Request, res: Response) => {
  const today = new Date().toISOString().slice(0, 10)
  const row = db
    .prepare('SELECT data_json FROM productivity_daily WHERE date = ?')
    .get(today) as { data_json: string } | undefined
  if (!row) return res.json({ date: today, usage: {}, top5: [] })
  const data = JSON.parse(row.data_json)
  res.json({ date: today, usage: data.usage ?? {}, top5: top5(data.usage ?? {}) })
})

router.get('/week', (_req: Request, res: Response) => {
  const rows = db
    .prepare('SELECT date, data_json FROM productivity_daily ORDER BY date DESC LIMIT 7')
    .all() as Array<{ date: string; data_json: string }>
  const result = rows.map(r => {
    const data = JSON.parse(r.data_json)
    return { date: r.date, usage: data.usage ?? {}, top5: top5(data.usage ?? {}) }
  })
  res.json(result)
})

export default router

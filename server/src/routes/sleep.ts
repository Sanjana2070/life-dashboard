import { Router, Request, Response } from 'express'
import db from '../db'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  const date = req.query.date as string | undefined
  if (date) {
    const row = db.prepare('SELECT * FROM sleep_logs WHERE date = ?').get(date)
    res.json(row ?? null)
  } else {
    const rows = db
      .prepare('SELECT * FROM sleep_logs ORDER BY date DESC LIMIT 30')
      .all()
    res.json(rows)
  }
})

router.post('/', (req: Request, res: Response) => {
  const { date, bedtime, wake_time, quality, notes } = req.body as {
    date: string
    bedtime?: string
    wake_time?: string
    quality?: number
    notes?: string
  }
  db.prepare(
    `INSERT INTO sleep_logs (date, bedtime, wake_time, quality, notes)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       bedtime = excluded.bedtime,
       wake_time = excluded.wake_time,
       quality = excluded.quality,
       notes = excluded.notes`
  ).run(date, bedtime ?? null, wake_time ?? null, quality ?? null, notes ?? null)
  res.json({ ok: true })
})

export default router

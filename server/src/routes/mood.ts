import { Router, Request, Response } from 'express'
import db from '../db'
import { appendJournalEntry, readJournalEntry } from '../services/obsidian'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  const date = (req.query.date as string) || new Date().toISOString().slice(0, 10)
  const entries = db
    .prepare('SELECT * FROM mood_entries WHERE date = ? ORDER BY id')
    .all(date)
  const journal = readJournalEntry(date)
  res.json({ entries, journal })
})

router.get('/history', (_req: Request, res: Response) => {
  const rows = db
    .prepare('SELECT * FROM mood_entries ORDER BY date DESC, period DESC LIMIT 60')
    .all()
  res.json(rows)
})

router.post('/rating', (req: Request, res: Response) => {
  const { date, period, rating, music_listened } = req.body as {
    date: string
    period: string
    rating: number
    music_listened?: string
  }
  db.prepare(
    `INSERT INTO mood_entries (date, period, rating, music_listened)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(date, period) DO UPDATE SET
       rating = excluded.rating,
       music_listened = excluded.music_listened`
  ).run(date, period, rating, music_listened ?? null)
  res.json({ ok: true })
})

router.post('/journal', (req: Request, res: Response) => {
  const { date, text } = req.body as { date: string; text: string }
  appendJournalEntry(date, text)
  res.json({ ok: true })
})

router.get('/journal', (req: Request, res: Response) => {
  const date = (req.query.date as string) || new Date().toISOString().slice(0, 10)
  const content = readJournalEntry(date)
  res.json({ content })
})

export default router

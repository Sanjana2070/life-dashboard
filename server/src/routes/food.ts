import { Router, Request, Response } from 'express'
import db from '../db'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  const date = (req.query.date as string) || new Date().toISOString().slice(0, 10)
  const logs = db
    .prepare('SELECT * FROM food_logs WHERE date = ? ORDER BY created_at')
    .all(date)
  const prep = db
    .prepare(`SELECT * FROM meal_prep WHERE week_start = (
      SELECT MAX(week_start) FROM meal_prep WHERE week_start <= ?
    )`)
    .get(date)
  res.json({ logs, prep: prep ?? null })
})

router.post('/log', (req: Request, res: Response) => {
  const { date, meal_type, description } = req.body as {
    date: string
    meal_type: string
    description?: string
  }
  const result = db
    .prepare(
      'INSERT INTO food_logs (date, meal_type, description) VALUES (?, ?, ?)'
    )
    .run(date, meal_type, description ?? null)
  res.json({ id: result.lastInsertRowid })
})

router.delete('/log/:id', (req: Request, res: Response) => {
  db.prepare('DELETE FROM food_logs WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

router.post('/prep', (req: Request, res: Response) => {
  const { week_start, plan } = req.body as { week_start: string; plan: string }
  db.prepare(
    `INSERT INTO meal_prep (week_start, plan) VALUES (?, ?)
     ON CONFLICT(week_start) DO UPDATE SET plan = excluded.plan`
  ).run(week_start, plan)
  res.json({ ok: true })
})

export default router

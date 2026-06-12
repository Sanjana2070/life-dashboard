import { Router, Request, Response } from 'express'
import db from '../db'

const router = Router()

const FIXED_HABITS = [
  'read_books',
  'breathwork',
  'morning_pages',
  'movement_prompt',
  'brush_twice',
  'movement_video',
]

function seedHabitsForDate(date: string) {
  const insert = db.prepare(
    'INSERT OR IGNORE INTO habit_logs (date, habit, completed) VALUES (?, ?, 0)'
  )
  for (const habit of FIXED_HABITS) insert.run(date, habit)
}

router.get('/', (req: Request, res: Response) => {
  const date = (req.query.date as string) || new Date().toISOString().slice(0, 10)
  seedHabitsForDate(date)
  const rows = db
    .prepare('SELECT * FROM habit_logs WHERE date = ? ORDER BY id')
    .all(date)
  res.json(rows)
})

router.patch('/:habit', (req: Request, res: Response) => {
  const { habit } = req.params
  const { date, completed, notes } = req.body as {
    date: string
    completed: boolean
    notes?: string
  }
  db.prepare(
    `INSERT INTO habit_logs (date, habit, completed, notes)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(date, habit) DO UPDATE SET completed = excluded.completed, notes = excluded.notes`
  ).run(date, habit, completed ? 1 : 0, notes ?? null)
  res.json({ ok: true })
})

export default router

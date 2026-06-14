import { Router, Request, Response } from 'express'
import db from '../db'

const router = Router()

const PROMPTS = [
  'Do 10 minutes of stretching — focus on hips and shoulders.',
  'Go for a 20-minute walk without your phone.',
  'Put on a song and free-dance for 5 minutes.',
  'Try a 5-minute yoga flow before bed.',
  'Do a 10-minute body scan — notice where you hold tension.',
  'Stand up, roll your shoulders back, and take 5 deep breaths.',
  'Try 15 minutes of jump rope or dancing cardio.',
  "Walk to a nearby spot you've never visited before.",
  'Do a gentle 10-minute morning stretch routine.',
  'Turn on a playlist and move however feels good for 10 minutes.',
  'Find a staircase and walk up and down 5 times.',
  'Do 3 sets of 10 bodyweight squats.',
  'Walk outside for 15 minutes — notice what you see.',
  'Try a 5-minute wrist and neck stretch at your desk.',
  'Do 10 minutes of slow, mindful movement — no goal, just feel.',
]

function getDailyPrompt(date: string): string {
  return PROMPTS[new Date(date).getDate() % PROMPTS.length]
}

router.get('/', (req: Request, res: Response) => {
  const date = (req.query.date as string) || new Date().toISOString().slice(0, 10)
  const logs = db
    .prepare('SELECT * FROM movement_logs WHERE date = ? ORDER BY created_at')
    .all(date)
  const prompt = getDailyPrompt(date)
  res.json({ logs, prompt })
})

router.get('/week', (_req: Request, res: Response) => {
  const rows = db
    .prepare('SELECT * FROM movement_logs ORDER BY date DESC, created_at DESC LIMIT 50')
    .all()
  res.json(rows)
})

router.post('/', (req: Request, res: Response) => {
  const { date, type, duration_minutes, notes } = req.body as {
    date: string
    type: string
    duration_minutes?: number
    notes?: string
  }
  const result = db
    .prepare(
      'INSERT INTO movement_logs (date, type, duration_minutes, notes) VALUES (?, ?, ?, ?)'
    )
    .run(date, type, duration_minutes ?? null, notes ?? null)
  res.json({ id: result.lastInsertRowid })
})

router.delete('/:id', (req: Request, res: Response) => {
  db.prepare('DELETE FROM movement_logs WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

export default router

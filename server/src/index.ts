import express from 'express'
import cors from 'cors'
import './db' // initialise DB tables on startup

import { PORT } from './config'
import habitsRouter from './routes/habits'
import sleepRouter from './routes/sleep'
import foodRouter from './routes/food'
import movementRouter from './routes/movement'
import moodRouter from './routes/mood'
import productivityRouter from './routes/productivity'
import { sheetsRoute } from './routes/sheets'
import { sheetsStub } from './routes/sheets-stub'

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/habits', habitsRouter)
app.use('/api/sleep', sleepRouter)
app.use('/api/food', foodRouter)
app.use('/api/movement', movementRouter)
app.use('/api/mood', moodRouter)
app.use('/api/productivity', productivityRouter)

// Phase 4 — Google Sheets backed routes
app.use('/api/networking',      sheetsRoute('networking',                               'Networking'))
app.use('/api/job-apps',        sheetsRoute('applications',                             'Job Applications'))
app.use('/api/tech-learnings',  sheetsRoute(['project-documentation', 'learnings-before-nyu'], 'Tech Learnings'))
app.use('/api/finances',        sheetsRoute('finances',                                 'Finances'))
app.use('/api/content-creation',sheetsRoute('content-creation',                        'Content Creation'))

// Not yet configured — no sheet tab exists
app.use('/api/student-life',  sheetsStub('Student Life'))
app.use('/api/newsletters',   sheetsStub('Newsletters'))

app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }))

app.listen(PORT, () => {
  console.log(`Life Dashboard server running on http://localhost:${PORT}`)
})

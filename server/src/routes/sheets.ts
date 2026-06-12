import { Router, Request, Response } from 'express'
import {
  readSheet,
  readSheets,
  appendRow,
  updateRow,
  deleteRow,
  isConfigured,
} from '../services/sheets'

function notConfigured(res: Response, name: string) {
  res.status(503).json({
    error: 'not_configured',
    message: `${name} requires Google Sheets credentials. Run "npm run auth:sheets" to set up.`,
  })
}

// primarySheet: the tab new rows are appended to when no sheetName is provided in the body
export function sheetsRoute(sheetName: string | string[], displayName: string) {
  const primarySheet: string = Array.isArray(sheetName) ? sheetName[0] : sheetName
  const router = Router()

  // GET — read all rows
  router.get('/', async (_req: Request, res: Response) => {
    if (!isConfigured()) return notConfigured(res, displayName)
    try {
      const data = Array.isArray(sheetName)
        ? await readSheets(sheetName)
        : await readSheet(sheetName)
      res.json(data)
    } catch (err: unknown) {
      res.status(500).json({ error: 'sheets_error', message: (err as Error).message })
    }
  })

  // POST — append a new row
  router.post('/', async (req: Request, res: Response) => {
    if (!isConfigured()) return notConfigured(res, displayName)
    const { row, sheetName: targetSheet } = req.body as {
      row: Record<string, string>
      sheetName?: string
    }
    const target = targetSheet ?? primarySheet
    try {
      const { headers } = Array.isArray(sheetName)
        ? await readSheets(sheetName)
        : await readSheet(sheetName)
      const values = headers.map(h => row[h] ?? '')
      await appendRow(target, values)
      res.json({ ok: true })
    } catch (err: unknown) {
      res.status(500).json({ error: 'sheets_error', message: (err as Error).message })
    }
  })

  // PATCH /:rowIndex — update an existing row
  router.patch('/:rowIndex', async (req: Request, res: Response) => {
    if (!isConfigured()) return notConfigured(res, displayName)
    const rowIndex = parseInt(req.params.rowIndex as string, 10)
    const { row, sheetName: targetSheet } = req.body as {
      row: Record<string, string>
      sheetName?: string
    }
    const target = targetSheet ?? primarySheet
    try {
      const { headers } = await readSheet(target)
      const values = headers.map(h => row[h] ?? '')
      await updateRow(target, rowIndex, headers, values)
      res.json({ ok: true })
    } catch (err: unknown) {
      res.status(500).json({ error: 'sheets_error', message: (err as Error).message })
    }
  })

  // DELETE /:rowIndex — delete a row
  router.delete('/:rowIndex', async (req: Request, res: Response) => {
    if (!isConfigured()) return notConfigured(res, displayName)
    const rowIndex = parseInt(req.params.rowIndex as string, 10)
    const targetSheet = (req.query.sheet as string) ?? primarySheet
    try {
      await deleteRow(targetSheet, rowIndex)
      res.json({ ok: true })
    } catch (err: unknown) {
      res.status(500).json({ error: 'sheets_error', message: (err as Error).message })
    }
  })

  return router
}

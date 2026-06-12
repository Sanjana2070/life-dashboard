import { Router, Request, Response } from 'express'

export function sheetsStub(trackerName: string) {
  const router = Router()
  router.use((_req: Request, res: Response) => {
    res.status(503).json({
      error: 'not_configured',
      message: `${trackerName} requires Google Sheets credentials (Phase 4). Configure GOOGLE_SHEETS_ID and credentials.json to enable.`,
    })
  })
  return router
}

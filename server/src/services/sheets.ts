import fs from 'fs'
import { google } from 'googleapis'
import {
  GOOGLE_CREDENTIALS_PATH,
  SHEETS_TOKEN_PATH,
  GOOGLE_SHEETS_ID,
} from '../config'

type OAuth2Client = InstanceType<typeof google.auth.OAuth2>

// Read + write scope — re-run auth:sheets if you previously used readonly
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

// GID needed for row deletion via batchUpdate
const SHEET_GIDS: Record<string, number> = {
  'finances':              2056784380,
  'networking':            692623259,
  'applications':          1383329946,
  'project-documentation': 900408155,
  'learnings-before-nyu':  765978587,
  'content-creation':      56457541,
}

function loadCredentials() {
  if (!fs.existsSync(GOOGLE_CREDENTIALS_PATH)) return null
  return JSON.parse(fs.readFileSync(GOOGLE_CREDENTIALS_PATH, 'utf-8'))
}

function buildClient(): OAuth2Client | null {
  const creds = loadCredentials()
  if (!creds) return null
  const { client_id, client_secret, redirect_uris } = creds.installed ?? creds.web
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
}

export function getAuthClient(): OAuth2Client | null {
  const client = buildClient()
  if (!client) return null
  if (!fs.existsSync(SHEETS_TOKEN_PATH)) return null
  const token = JSON.parse(fs.readFileSync(SHEETS_TOKEN_PATH, 'utf-8'))
  client.setCredentials(token)
  return client
}

export function isConfigured(): boolean {
  return (
    fs.existsSync(GOOGLE_CREDENTIALS_PATH) &&
    fs.existsSync(SHEETS_TOKEN_PATH) &&
    Boolean(GOOGLE_SHEETS_ID)
  )
}

export interface SheetData {
  headers: string[]
  rows: Record<string, string>[]
}

function getSheets() {
  const auth = getAuthClient()
  if (!auth) throw new Error('Sheets not configured')
  return google.sheets({ version: 'v4', auth })
}

export async function readSheet(sheetName: string): Promise<SheetData> {
  const sheets = getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEETS_ID,
    range: sheetName,
  })

  const values = res.data.values ?? []
  if (values.length === 0) return { headers: [], rows: [] }

  const headers = values[0].map(String)
  const rows = values.slice(1).map(row =>
    Object.fromEntries(headers.map((h, i) => [h, String(row[i] ?? '')]))
  )
  return { headers, rows }
}

// Merges multiple tabs; adds _sheet field so edits know which tab to target
export async function readSheets(sheetNames: string[]): Promise<SheetData> {
  const results = await Promise.all(sheetNames.map(readSheet))
  const headers = results[0]?.headers ?? []
  const rows = results.flatMap((r, i) =>
    r.rows.map(row => ({ ...row, _sheet: sheetNames[i] }))
  )
  return { headers, rows }
}

// rowIndex: 0-based index into the data rows array (row 0 = sheet row 2, after header)
export async function updateRow(sheetName: string, rowIndex: number, headers: string[], values: string[]): Promise<void> {
  const sheets = getSheets()
  const sheetRow = rowIndex + 2 // skip header row; 1-indexed
  const lastCol = String.fromCharCode(65 + headers.length - 1)
  await sheets.spreadsheets.values.update({
    spreadsheetId: GOOGLE_SHEETS_ID,
    range: `${sheetName}!A${sheetRow}:${lastCol}${sheetRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  })
}

export async function appendRow(sheetName: string, values: string[]): Promise<void> {
  const sheets = getSheets()
  await sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEETS_ID,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [values] },
  })
}

// rowIndex: 0-based index into data rows array
export async function deleteRow(sheetName: string, rowIndex: number): Promise<void> {
  const sheetId = SHEET_GIDS[sheetName]
  if (sheetId === undefined) throw new Error(`Unknown sheet: ${sheetName}`)
  const sheets = getSheets()
  const startIndex = rowIndex + 1 // skip header (0-indexed in batchUpdate)
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: GOOGLE_SHEETS_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension: 'ROWS', startIndex, endIndex: startIndex + 1 },
        },
      }],
    },
  })
}

export async function runAuthFlow(): Promise<void> {
  const client = buildClient()
  if (!client) throw new Error(`Credentials file not found at ${GOOGLE_CREDENTIALS_PATH}`)

  const authUrl = client.generateAuthUrl({ access_type: 'offline', scope: SCOPES })
  console.log('\nOpen this URL in your browser and sign in as sanj2jain@gmail.com:\n')
  console.log(authUrl)
  console.log()
  console.log('After signing in, copy the full redirect URL from your browser')
  console.log('and paste it here (or just the code= value), then press Enter:\n')

  const code = await waitForCode()
  const { tokens } = await client.getToken(code)
  fs.writeFileSync(SHEETS_TOKEN_PATH, JSON.stringify(tokens, null, 2))
  console.log(`\nToken saved to ${SHEETS_TOKEN_PATH}`)
}

function waitForCode(): Promise<string> {
  return new Promise(resolve => {
    process.stdin.resume()
    process.stdin.setEncoding('utf-8')
    process.stdin.once('data', data => {
      const input = data.toString().trim()
      try {
        const url = new URL(input)
        const code = url.searchParams.get('code')
        if (code) return resolve(code)
      } catch {
        // not a URL — treat as bare code
      }
      resolve(input)
    })
  })
}

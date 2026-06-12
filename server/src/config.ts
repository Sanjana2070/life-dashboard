import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '..', '.env') })

export const PORT = parseInt(process.env.PORT || '3001', 10)

export const OBSIDIAN_VAULT_PATH =
  process.env.OBSIDIAN_VAULT_PATH ||
  'C:/Users/dance/Documents/__Obsidian/personal-wiki'

export const GOOGLE_CREDENTIALS_PATH =
  process.env.GOOGLE_CREDENTIALS_PATH || path.join(__dirname, '..', 'sheets-credentials.json')

export const SHEETS_TOKEN_PATH =
  process.env.SHEETS_TOKEN_PATH || path.join(__dirname, '..', 'sheets-token.json')

export const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID || ''

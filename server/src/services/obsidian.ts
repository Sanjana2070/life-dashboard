import fs from 'fs'
import path from 'path'
import { OBSIDIAN_VAULT_PATH } from '../config'

function journalPath(date: string): string {
  // date format: YYYY-MM-DD → file: MM-DD-YYYY.md
  const [year, month, day] = date.split('-')
  const filename = `${month}-${day}-${year}.md`
  return path.join(OBSIDIAN_VAULT_PATH, 'non-ingested', filename)
}

export function readJournalEntry(date: string): string {
  const filePath = journalPath(date)
  if (!fs.existsSync(filePath)) return ''
  return fs.readFileSync(filePath, 'utf-8')
}

export function appendJournalEntry(date: string, text: string): void {
  const filePath = journalPath(date)
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  if (fs.existsSync(filePath)) {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    fs.appendFileSync(filePath, `\n\n---\n\n**${timestamp}**\n\n${text}`, 'utf-8')
  } else {
    const [year, month, day] = date.split('-')
    const header = `# ${month}/${day}/${year}\n\n`
    fs.writeFileSync(filePath, header + text, 'utf-8')
  }
}

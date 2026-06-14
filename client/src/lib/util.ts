import type { CSSProperties } from 'react'

export function today() {
  return new Date().toISOString().slice(0, 10)
}

export const INPUT_STYLE: CSSProperties = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  color: 'var(--text-primary)',
  padding: '8px 12px',
  fontSize: 14,
  width: '100%',
  outline: 'none',
}

// Index 0 unused; 1–5 map to rating/quality scores.
export const RATING_COLORS = ['', '#ef4444', '#ff6b35', '#f59e0b', '#7c83fd', '#4caf50']

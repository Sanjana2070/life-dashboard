import { useState } from 'react'
import type { SheetActions } from '../hooks/useSheetData'

type Props = Pick<SheetActions, 'data' | 'loading' | 'notConfigured' | 'addRow' | 'editRow' | 'removeRow'> & {
  // For multi-tab pages: list of sheet tab names the user can pick from when adding
  availableSheets?: string[]
}

const CELL_INPUT: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--accent)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '4px 8px',
  fontSize: 12,
  width: '100%',
  outline: 'none',
}

const BTN_BASE: React.CSSProperties = {
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 12,
  padding: '4px 10px',
  fontWeight: 500,
}

// Strip internal _sheet field from display headers
function visibleHeaders(headers: string[]) {
  return headers.filter(h => h !== '_sheet')
}

function getSheet(row: Record<string, string>, fallback?: string) {
  return row['_sheet'] ?? fallback
}

export default function SheetTable({ data, loading, notConfigured, addRow, editRow, removeRow, availableSheets }: Props) {
  const [editingRow, setEditingRow] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Record<string, string>>({})
  const [addingRow, setAddingRow] = useState(false)
  const [addForm, setAddForm] = useState<Record<string, string>>({})
  const [addSheet, setAddSheet] = useState(availableSheets?.[0] ?? '')
  const [saving, setSaving] = useState(false)

  const headers = visibleHeaders(data.headers)

  function startEdit(rowIndex: number) {
    setEditingRow(rowIndex)
    setEditForm({ ...data.rows[rowIndex] })
  }

  function cancelEdit() {
    setEditingRow(null)
    setEditForm({})
  }

  async function saveEdit(rowIndex: number) {
    setSaving(true)
    try {
      await editRow(rowIndex, editForm, getSheet(editForm))
      setEditingRow(null)
      setEditForm({})
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(rowIndex: number) {
    if (!confirm('Delete this row from Google Sheets?')) return
    await removeRow(rowIndex, getSheet(data.rows[rowIndex]))
  }

  function startAdd() {
    const blank = Object.fromEntries(headers.map(h => [h, '']))
    setAddForm(blank)
    setAddingRow(true)
  }

  function cancelAdd() {
    setAddingRow(false)
    setAddForm({})
  }

  async function saveAdd() {
    setSaving(true)
    try {
      await addRow(addForm, availableSheets ? addSheet : undefined)
      setAddingRow(false)
      setAddForm({})
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading…</div>

  if (notConfigured) {
    return (
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '24px 28px', maxWidth: 480 }}>
        <div style={{ fontSize: 20, marginBottom: 12 }}>🔑</div>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Google Sheets not connected</div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 0 }}>
          Place <code style={{ background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 4 }}>sheets-credentials.json</code> in{' '}
          <code style={{ background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 4 }}>server/</code>, set{' '}
          <code style={{ background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 4 }}>GOOGLE_SHEETS_ID</code> in{' '}
          <code style={{ background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 4 }}>server/.env</code>, then run{' '}
          <code style={{ background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 4 }}>npm run auth:sheets</code>.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Add row button */}
      <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        {!addingRow && (
          <button onClick={startAdd} style={{ ...BTN_BASE, background: 'var(--accent)', color: 'white', padding: '6px 14px', fontSize: 13 }}>
            + Add row
          </button>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {headers.map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '8px 12px',
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', fontWeight: 600, fontSize: 11,
                  textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
              <th style={{
                padding: '8px 12px', background: 'var(--bg-surface)',
                border: '1px solid var(--border)', width: 100,
              }} />
            </tr>
          </thead>
          <tbody>
            {/* Add row form */}
            {addingRow && (
              <tr style={{ background: 'rgba(124,131,253,0.06)' }}>
                {headers.map(h => (
                  <td key={h} style={{ padding: '6px 8px', border: '1px solid var(--border)' }}>
                    <input
                      value={addForm[h] ?? ''}
                      onChange={e => setAddForm(f => ({ ...f, [h]: e.target.value }))}
                      placeholder={h}
                      style={CELL_INPUT}
                    />
                  </td>
                ))}
                <td style={{ padding: '6px 8px', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                  {availableSheets && availableSheets.length > 1 && (
                    <select
                      value={addSheet}
                      onChange={e => setAddSheet(e.target.value)}
                      style={{ ...CELL_INPUT, marginBottom: 4 }}
                    >
                      {availableSheets.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={saveAdd} disabled={saving} style={{ ...BTN_BASE, background: 'var(--green)', color: 'white' }}>
                      {saving ? '…' : 'Save'}
                    </button>
                    <button onClick={cancelAdd} style={{ ...BTN_BASE, background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {data.rows.length === 0 && !addingRow && (
              <tr>
                <td colSpan={headers.length + 1} style={{ padding: '16px 12px', border: '1px solid var(--border)', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No rows yet.
                </td>
              </tr>
            )}

            {data.rows.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'var(--bg-base)' : 'var(--bg-surface)' }}>
                {headers.map(h => (
                  <td key={h} style={{
                    padding: editingRow === i ? '6px 8px' : '9px 12px',
                    border: '1px solid var(--border)',
                    verticalAlign: 'top',
                    maxWidth: 280,
                    wordBreak: 'break-word',
                  }}>
                    {editingRow === i ? (
                      <input
                        value={editForm[h] ?? ''}
                        onChange={e => setEditForm(f => ({ ...f, [h]: e.target.value }))}
                        style={CELL_INPUT}
                      />
                    ) : (
                      row[h] || <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                ))}
                <td style={{
                  padding: '6px 8px', border: '1px solid var(--border)',
                  whiteSpace: 'nowrap', verticalAlign: 'middle',
                }}>
                  {editingRow === i ? (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => saveEdit(i)} disabled={saving} style={{ ...BTN_BASE, background: 'var(--green)', color: 'white' }}>
                        {saving ? '…' : 'Save'}
                      </button>
                      <button onClick={cancelEdit} style={{ ...BTN_BASE, background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => startEdit(i)} style={{ ...BTN_BASE, background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(i)} style={{ ...BTN_BASE, background: 'none', color: 'var(--text-muted)' }}>
                        ×
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

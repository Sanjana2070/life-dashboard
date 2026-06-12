import { useEffect, useState } from 'react'
import api from '../api/client'
import type { SheetData } from '../types'

export interface SheetActions {
  data: SheetData
  loading: boolean
  notConfigured: boolean
  reload: () => void
  addRow: (row: Record<string, string>, sheetName?: string) => Promise<void>
  editRow: (rowIndex: number, row: Record<string, string>, sheetName?: string) => Promise<void>
  removeRow: (rowIndex: number, sheetName?: string) => Promise<void>
}

export function useSheetData(endpoint: string): SheetActions {
  const [data, setData] = useState<SheetData>({ headers: [], rows: [] })
  const [loading, setLoading] = useState(true)
  const [notConfigured, setNotConfigured] = useState(false)

  function reload() {
    setLoading(true)
    api.get<SheetData>(endpoint)
      .then(res => setData(res.data))
      .catch(err => { if (err.response?.status === 503) setNotConfigured(true) })
      .finally(() => setLoading(false))
  }

  useEffect(reload, [endpoint])

  async function addRow(row: Record<string, string>, sheetName?: string) {
    await api.post(endpoint, { row, sheetName })
    reload()
  }

  async function editRow(rowIndex: number, row: Record<string, string>, sheetName?: string) {
    await api.patch(`${endpoint}/${rowIndex}`, { row, sheetName })
    reload()
  }

  async function removeRow(rowIndex: number, sheetName?: string) {
    const params = sheetName ? `?sheet=${sheetName}` : ''
    await api.delete(`${endpoint}/${rowIndex}${params}`)
    reload()
  }

  return { data, loading, notConfigured, reload, addRow, editRow, removeRow }
}

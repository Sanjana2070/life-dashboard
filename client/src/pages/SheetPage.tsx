import PageHeader from '../components/PageHeader'
import SheetTable from '../components/SheetTable'
import { useSheetData } from '../hooks/useSheetData'

interface Props {
  endpoint: string
  title: string
  subtitle?: string
  availableSheets?: string[]
}

export default function SheetPage({ endpoint, title, subtitle, availableSheets }: Props) {
  const sheet = useSheetData(endpoint)
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <SheetTable {...sheet} availableSheets={availableSheets} />
    </div>
  )
}

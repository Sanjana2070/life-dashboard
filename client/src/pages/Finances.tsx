import PageHeader from '../components/PageHeader'
import SheetTable from '../components/SheetTable'
import { useSheetData } from '../hooks/useSheetData'

export default function Finances() {
  const sheet = useSheetData('/finances')
  return (
    <div>
      <PageHeader title="Finances" subtitle="Monthly expenses" />
      <SheetTable {...sheet} />
    </div>
  )
}

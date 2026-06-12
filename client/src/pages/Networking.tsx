import PageHeader from '../components/PageHeader'
import SheetTable from '../components/SheetTable'
import { useSheetData } from '../hooks/useSheetData'

export default function Networking() {
  const sheet = useSheetData('/networking')
  return (
    <div>
      <PageHeader title="Networking" subtitle="Contacts & interaction logs" />
      <SheetTable {...sheet} />
    </div>
  )
}

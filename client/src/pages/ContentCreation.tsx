import PageHeader from '../components/PageHeader'
import SheetTable from '../components/SheetTable'
import { useSheetData } from '../hooks/useSheetData'

export default function ContentCreation() {
  const sheet = useSheetData('/content-creation')
  return (
    <div>
      <PageHeader title="Content Creation" subtitle="Content plans & tracking" />
      <SheetTable {...sheet} />
    </div>
  )
}

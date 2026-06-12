import PageHeader from '../components/PageHeader'
import SheetTable from '../components/SheetTable'
import { useSheetData } from '../hooks/useSheetData'

export default function JobApps() {
  const sheet = useSheetData('/job-apps')
  return (
    <div>
      <PageHeader title="Job Applications" subtitle="Application pipeline" />
      <SheetTable {...sheet} />
    </div>
  )
}

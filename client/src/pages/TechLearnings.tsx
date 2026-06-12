import PageHeader from '../components/PageHeader'
import SheetTable from '../components/SheetTable'
import { useSheetData } from '../hooks/useSheetData'

export default function TechLearnings() {
  const sheet = useSheetData('/tech-learnings')
  return (
    <div>
      <PageHeader title="Tech Learnings" subtitle="Project docs & pre-NYU learnings" />
      <SheetTable
        {...sheet}
        availableSheets={['project-documentation', 'learnings-before-nyu']}
      />
    </div>
  )
}

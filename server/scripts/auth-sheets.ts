import { runAuthFlow } from '../src/services/sheets'

runAuthFlow().catch(err => {
  console.error('Auth failed:', err.message)
  process.exit(1)
})

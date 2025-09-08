import { Breached } from "./components/Breached"
import { Concurrency } from "./components/Concurrency"
import { ConcurrencyHC } from "./components/ConcurrencyHC"
import { MailInbox } from "./components/MailInbox"
import { usePlannedData } from "./hooks/usePlannedData"

export function Management() {
  const { plannedData, loading, error } = usePlannedData()

  if (loading) return <p>Cargando planned data...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <Breached plannedData={plannedData} />
      <Concurrency plannedData={plannedData} />
      <MailInbox plannedData={plannedData} />
      <ConcurrencyHC plannedData={plannedData} />
    </div>
  )
}

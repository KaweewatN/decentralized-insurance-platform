import type { Metadata } from "next"
import { ParametricMonitoring } from "@/components/admin/parametric/parametric-monitoring"
import { OracleActivityLog } from "@/components/admin/parametric/oracle-activity-log"

export const metadata: Metadata = {
  title: "Parametric Insurance Monitoring | Chainsure Admin",
  description: "Monitor parametric insurance policies and oracle activity",
}

export default function ParametricMonitoringPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Parametric Insurance Monitoring</h1>
        <p className="text-muted-foreground mt-2">Monitor parametric insurance policies and oracle activity</p>
      </div>

      <div className="grid gap-6">
        <ParametricMonitoring />
        <OracleActivityLog />
      </div>
    </div>
  )
}

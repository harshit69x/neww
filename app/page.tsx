import { DashboardLayout } from "@/components/dashboard-layout"
import { InventoryDashboard } from "@/components/inventory-dashboard"

export default function Home() {
  return (
    <DashboardLayout>
      <InventoryDashboard />
    </DashboardLayout>
  )
}


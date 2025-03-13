import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardContent } from "@/components/dashboard/content"
import { DashboardOverview } from "@/components/dashboard/overview"

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <DashboardShell>
          <DashboardContent>
            <DashboardOverview />
          </DashboardContent>
        </DashboardShell>
      </div>
    </div>
  )
}


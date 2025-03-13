import type React from "react"
interface DashboardContentProps {
  children: React.ReactNode
}

export function DashboardContent({ children }: DashboardContentProps) {
  return <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">{children}</main>
}


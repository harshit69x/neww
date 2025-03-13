import type React from "react"
import { BarChart3, FileText, Home, Settings, ShoppingCart, Users } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface NavItemProps {
  href: string
  icon: React.ReactNode
  title: string
  isActive?: boolean
}

function NavItem({ href, icon, title, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
        isActive ? "bg-muted font-medium text-primary" : "text-muted-foreground",
      )}
    >
      {icon}
      {title}
    </Link>
  )
}

export function DashboardSidebar() {
  return (
    <div className="hidden border-r bg-muted/40 lg:block lg:w-64">
      <div className="flex h-full max-h-screen flex-col gap-2 p-4">
        <div className="flex-1 py-2">
          <nav className="grid gap-1 px-2 text-sm font-medium">
            <NavItem href="/admin" icon={<Home className="h-4 w-4" />} title="Dashboard" isActive />
            <NavItem href="/admin/users" icon={<Users className="h-4 w-4" />} title="Users" />
            <NavItem href="/admin/products" icon={<ShoppingCart className="h-4 w-4" />} title="Products" />
            <NavItem href="/admin/analytics" icon={<BarChart3 className="h-4 w-4" />} title="Analytics" />
            <NavItem href="/admin/content" icon={<FileText className="h-4 w-4" />} title="Content" />
            <NavItem href="/admin/settings" icon={<Settings className="h-4 w-4" />} title="Settings" />
          </nav>
        </div>
      </div>
    </div>
  )
}


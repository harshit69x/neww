"use client"

import type React from "react"

import { useState } from "react"
import { Package, LayoutDashboard, Settings, ShoppingCart, Users } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface NavItemProps {
  icon: React.ReactNode
  title: string
  isActive?: boolean
}

function NavItem({ icon, title, isActive }: NavItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
        isActive ? "bg-muted font-medium text-primary" : "text-muted-foreground",
      )}
    >
      {icon}
      {title}
    </div>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Package className="h-6 w-6" />
          <span className="text-xl font-bold">Inventory Admin</span>
        </Link>
        <button className="ml-auto block md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </header>
      <div className="flex flex-1">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-20 mt-16 w-64 transform border-r bg-background transition-transform duration-300 ease-in-out md:static md:translate-x-0",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-full max-h-screen flex-col gap-2 p-4">
            <div className="flex-1 py-2">
              <nav className="grid gap-1 px-2 text-sm font-medium">
                <NavItem icon={<LayoutDashboard className="h-4 w-4" />} title="Dashboard" isActive />
                <NavItem icon={<Package className="h-4 w-4" />} title="Inventory" />
                <NavItem icon={<ShoppingCart className="h-4 w-4" />} title="Orders" />
                <NavItem icon={<Users className="h-4 w-4" />} title="Customers" />
                <NavItem icon={<Settings className="h-4 w-4" />} title="Settings" />
              </nav>
            </div>
          </div>
        </aside>
        <main className="flex-1 overflow-x-hidden p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}


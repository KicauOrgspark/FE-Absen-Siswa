'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Key,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Download,
} from 'lucide-react'

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      label: 'Token Generation',
      href: '/admin/token',
      icon: Key,
    },
    {
      label: 'Export Data',
      href: '/admin/export',
      icon: Download,
    },
  ]

  return (
    <div
      className={cn(
        'fixed left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 ease-out flex flex-col',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700">
        {!collapsed && <h1 className="text-xl font-bold">AdminDash</h1>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-slate-800"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3',
                  isActive
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                )}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 text-red-400 hover:bg-slate-800',
            collapsed && 'justify-center'
          )}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  )
}

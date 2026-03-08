'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  UserRound, 
  Calendar, 
  DollarSign, 
  FileText, 
  Settings,
  Heart
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/staff', label: 'Staff', icon: Users },
  { href: '/patients', label: 'Patients', icon: UserRound },
  { href: '/scheduling', label: 'Scheduling', icon: Calendar },
  { href: '/payroll', label: 'Payroll', icon: DollarSign },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-950 text-white h-screen fixed left-0 top-0 flex flex-col shadow-2xl z-10">
      <div className="p-5 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">NursingCare</h1>
            <p className="text-xs text-slate-400">HR Management</p>
          </div>
        </div>
      </div>
      
      <nav className="p-3 flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-l-4 border-cyan-400'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : ''}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800/50">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-4 border border-slate-700/50">
          <p className="text-sm font-medium text-white">Need Help?</p>
          <p className="text-xs text-slate-400 mt-1">Check docs or contact</p>
        </div>
      </div>
    </aside>
  )
}

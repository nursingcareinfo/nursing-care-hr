'use client'

import { Toggle } from '@/components/ui/Toggle'

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="bg-surface-container-low/80 backdrop-blur-sm border-b border-outline-variant px-8 py-6 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-display">{title}</h1>
          {subtitle && <p className="text-on-surface-variant">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {actions}
          <Toggle />
        </div>
      </div>
    </header>
  )
}

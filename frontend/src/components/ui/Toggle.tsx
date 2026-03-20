'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToggleProps {
  className?: string
}

export function Toggle({ className }: ToggleProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (stored === 'dark' || (!stored && prefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggle = () => {
    const newValue = !isDark
    setIsDark(newValue)
    
    if (newValue) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <button
      onClick={toggle}
      className={cn(
        'p-2.5 rounded-xl transition-all duration-200',
        'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700',
        className
      )}
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Moon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
      ) : (
        <Sun className="w-5 h-5 text-slate-700" />
      )}
    </button>
  )
}

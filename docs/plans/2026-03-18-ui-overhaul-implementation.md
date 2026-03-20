# UI Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create reusable UI component library with dark mode support for consistent styling across all pages.

**Architecture:** Create shared components in `src/components/ui/`, add dark mode CSS, update layout and all pages.

**Tech Stack:** Next.js 14, Tailwind CSS, TypeScript, Lucide React

---

## Phase 1: Create UI Components

### Task 1: Create Button Component

**Files:**
- Create: `frontend/src/components/ui/Button.tsx`

**Step 1: Write the Button component**

```typescript
'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl',
      secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
      danger: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25 hover:shadow-xl'
    }
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg'
    }

    return (
      <button
        ref={ref}
        className={cn(
          'rounded-xl font-medium transition-all duration-200 inline-flex items-center justify-center gap-2',
          variants[variant],
          sizes[size],
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps }
```

**Step 2: Verify file created**

Run: `ls -la frontend/src/components/ui/Button.tsx`

**Step 3: Commit**

```bash
git add frontend/src/components/ui/Button.tsx
git commit -m "feat(ui): add Button component with variants"
```

---

### Task 2: Create Card Component

**Files:**
- Create: `frontend/src/components/ui/Card.tsx`

**Step 1: Write the Card component**

```typescript
import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl p-6 shadow-lg',
          variant === 'default' 
            ? 'bg-white shadow-slate-200/50 dark:bg-slate-800 dark:shadow-slate-900/50' 
            : 'bg-white border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
)
CardHeader.displayName = 'CardHeader'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props}>
      {children}
    </div>
  )
)
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardContent }
export type { CardProps }
```

**Step 2: Verify file created**

Run: `ls -la frontend/src/components/ui/Card.tsx`

**Step 3: Commit**

```bash
git add frontend/src/components/ui/Card.tsx
git commit -m "feat(ui): add Card component with variants"
```

---

### Task 3: Create Input Component

**Files:**
- Create: `frontend/src/components/ui/Input.tsx`

**Step 1: Write the Input component**

```typescript
import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600',
              'bg-white dark:bg-slate-800',
              'text-slate-900 dark:text-slate-100',
              'placeholder:text-slate-400 dark:placeholder:text-slate-500',
              'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              icon && 'pl-10',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
export type { InputProps }
```

**Step 2: Verify file created**

Run: `ls -la frontend/src/components/ui/Input.tsx`

**Step 3: Commit**

```bash
git add frontend/src/components/ui/Input.tsx
git commit -m "feat(ui): add Input component with label and error"
```

---

### Task 4: Create Modal Component

**Files:**
- Create: `frontend/src/components/ui/Modal.tsx`

**Step 1: Write the Modal component**

```typescript
'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className={cn(
        'relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200',
        sizes[size]
      )}>
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Verify file created**

Run: `ls -la frontend/src/components/ui/Modal.tsx`

**Step 3: Commit**

```bash
git add frontend/src/components/ui/Modal.tsx
git commit -m "feat(ui): add Modal component with animation"
```

---

### Task 5: Create Badge Component

**Files:**
- Create: `frontend/src/components/ui/Badge.tsx`

**Step 1: Write the Badge component**

```typescript
import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      default: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
export type { BadgeProps }
```

**Step 2: Verify file created**

Run: `ls -la frontend/src/components/ui/Badge.tsx`

**Step 3: Commit**

```bash
git add frontend/src/components/ui/Badge.tsx
git commit -m "feat(ui): add Badge component with variants"
```

---

### Task 6: Create Spinner Component

**Files:**
- Create: `frontend/src/components/ui/Spinner.tsx`

**Step 1: Write the Spinner component**

```typescript
import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <svg
      className={cn('animate-spin text-slate-500', sizes[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}
```

**Step 2: Verify file created**

Run: `ls -la frontend/src/components/ui/Spinner.tsx`

**Step 3: Commit**

```bash
git add frontend/src/components/ui/Spinner.tsx
git commit -m "feat(ui): add Spinner component"
```

---

### Task 7: Create Toggle Component (Dark Mode)

**Files:**
- Create: `frontend/src/components/ui/Toggle.tsx`

**Step 1: Write the Toggle component**

```typescript
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
```

**Step 2: Verify file created**

Run: `ls -la frontend/src/components/ui/Toggle.tsx`

**Step 3: Commit**

```bash
git add frontend/src/components/ui/Toggle.tsx
git commit -m "feat(ui): add Toggle component for dark mode"
```

---

### Task 8: Create utils.ts for cn helper

**Files:**
- Create: `frontend/src/lib/utils.ts`

**Step 1: Write the utils file**

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Step 2: Verify file created**

Run: `ls -la frontend/src/lib/utils.ts`

**Step 3: Commit**

```bash
git add frontend/src/lib/utils.ts
git commit -m "feat(ui): add cn utility function"
```

---

## Phase 2: Update Layout

### Task 9: Add Dark Mode CSS

**Files:**
- Modify: `frontend/src/app/globals.css`

**Step 1: Add dark mode styles**

Add to globals.css:

```css
@layer base {
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 217.2 32.6% 17.5%;
    --card-foreground: 210 40% 98%;
    --popover: 217.2 32.6% 17.5%;
    --popover-foreground: 210 40% 98%;
    --primary-foreground: 210 40% 98%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
  
  html {
    scroll-behavior: smooth;
  }
  
  body {
    @apply bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50;
  }
}
```

**Step 2: Verify changes**

Run: `grep -n "dark {" frontend/src/app/globals.css`

**Step 3: Commit**

```bash
git add frontend/src/app/globals.css
git commit -m "feat(ui): add dark mode CSS variables"
```

---

### Task 10: Update Layout with Sidebar

**Files:**
- Modify: `frontend/src/app/layout.tsx`

**Step 1: Read current layout**

Run: `cat frontend/src/app/layout.tsx`

**Step 2: Update layout**

Replace content with:

```typescript
import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'HR Manager - Home Nursing Care',
  description: 'Employee data management system for NursingCare.pk',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
```

**Step 3: Commit**

```bash
git add frontend/src/app/layout.tsx
git commit -m "feat(ui): update layout with sidebar"
```

---

### Task 11: Create Header Component

**Files:**
- Create: `frontend/src/components/Header.tsx`

**Step 1: Write Header component**

```typescript
'use client'

import { Toggle } from '@/components/ui/Toggle'

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 px-8 py-6 sticky top-0 z-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
          {subtitle && <p className="text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {actions}
          <Toggle />
        </div>
      </div>
    </header>
  )
}
```

**Step 2: Verify file created**

Run: `ls -la frontend/src/components/Header.tsx`

**Step 3: Commit**

```bash
git add frontend/src/components/Header.tsx
git commit -m "feat(ui): add Header component"
```

---

## Phase 3: Update Pages

### Task 12: Update Dashboard with new components

**Files:**
- Modify: `frontend/src/app/page.tsx`

**Step 1: Replace imports**

Change imports to use new components:

```typescript
import { Header } from '@/components/Header'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
```

**Step 2: Update loading state**

Replace loading div with:

```typescript
if (loading) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <main className="flex-1 ml-64 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Spinner />
          <span>Loading dashboard...</span>
        </div>
      </main>
    </div>
  )
}
```

**Step 3: Update main structure**

Replace header with:

```typescript
<Header 
  title="Dashboard" 
  subtitle="Welcome back! Here's your business overview."
  actions={
    <>
      <Button onClick={() => setShowAddStaff(true)}>Add Staff</Button>
      <Button variant="secondary" onClick={() => setShowAddPatient(true)}>Add Patient</Button>
    </>
  }
/>
```

Replace cards with Card components.

**Step 4: Commit**

```bash
git add frontend/src/app/page.tsx
git commit -m "feat(ui): update Dashboard with new components"
```

---

### Task 13: Update other pages

**Files:**
- Modify: `frontend/src/app/staff/page.tsx`
- Modify: `frontend/src/app/patients/page.tsx`
- Modify: `frontend/src/app/scheduling/page.tsx`
- Modify: `frontend/src/app/payroll/page.tsx`
- Modify: `frontend/src/app/reports/page.tsx`
- Modify: `frontend/src/app/settings/page.tsx`

**Step 1: For each page, add Header import and replace header**

Add to each page:

```typescript
import { Header } from '@/components/Header'
```

Replace the inline header with:

```typescript
<Header title="Staff" subtitle="Manage your nursing staff" />
```

**Step 2: Commit**

```bash
git add frontend/src/app/*/page.tsx
git commit -m "feat(ui): update all pages with Header component"
```

---

## Verification

### Run build

Run: `cd frontend && npm run build`

Expected: Build succeeds without errors

### Test dark mode

1. Open http://localhost:3000
2. Click toggle button
3. Verify dark mode activates
4. Refresh page
5. Verify dark mode persists

### Verify components

1. Check all buttons use Button component
2. Check all cards use Card component
3. Check loading shows Spinner
4. Check modals have animation

---

## Plan complete

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**

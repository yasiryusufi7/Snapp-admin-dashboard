import { createContext, useContext, useState } from 'react'
import { cx } from '../../utils/classNames'

const TabsContext = createContext(null)

export function Tabs({ value, onValueChange, children, className }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cx(className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className }) {
  return (
    <div
      role="tablist"
      className={cx('flex items-center gap-0.5 border-b border-line', className)}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children, className }) {
  const ctx = useContext(TabsContext)
  const active = ctx.value === value
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={() => ctx.onValueChange(value)}
      className={cx(
        'relative -mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors duration-150',
        active
          ? 'border-brand-600 text-ink'
          : 'border-transparent text-ink-faint hover:text-ink-soft',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className }) {
  const ctx = useContext(TabsContext)
  if (ctx.value !== value) return null
  return <div role="tabpanel" className={cx('animate-fade-in', className)}>{children}</div>
}
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </span>
      {children}
    </label>
  )
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-md border border-border bg-surface-2 p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'min-w-9 flex-1 rounded-sm px-2 py-1.5 text-xs font-bold transition-colors',
            o.value === value
              ? 'bg-primary text-black'
              : 'text-text-muted hover:text-text',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-2 px-3.5 py-2.5 text-left text-sm"
    >
      <span>{label}</span>
      <span
        className={cn(
          'relative inline-flex h-6 w-11 flex-none items-center rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-border',
        )}
      >
        <span
          className={cn(
            'inline-block size-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </span>
    </button>
  )
}

export function NumberField({
  label,
  value,
  min = 0,
  onChange,
}: {
  label: string
  value: number
  min?: number
  onChange: (v: number) => void
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
        className="w-full rounded-md border border-border bg-surface-2 px-3.5 py-2.5 text-sm outline-none focus:border-primary/60"
      />
    </Field>
  )
}

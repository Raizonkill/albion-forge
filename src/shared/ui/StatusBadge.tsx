import type { PriceStatus } from '@/shared/types/market'

const STATUS_MAP: Record<PriceStatus, { icon: string; label: string; className: string }> = {
  ok: { icon: '✓', label: 'OK', className: 'text-success' },
  stale: { icon: '⏱', label: 'Datos antiguos', className: 'text-[#f5d287]' },
  suspicious: { icon: '⚠', label: 'Sospechoso', className: 'text-error' },
  no_data: { icon: '✗', label: 'Sin datos', className: 'text-error' },
}

export function StatusBadge({
  status,
  hoursOld,
}: {
  status: PriceStatus
  hoursOld?: number | null
}) {
  const s = STATUS_MAP[status]
  return (
    <span className="inline-flex flex-col">
      <span className={s.className}>
        {s.icon} {s.label}
      </span>
      {hoursOld != null && (
        <span className="text-xs text-text-muted">{hoursOld}h atrás</span>
      )}
    </span>
  )
}

import { CITIES } from '@/config/game'
import { cn, formatSilver } from '@/lib/utils'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import type { SanitizedEntry } from '@/shared/types/market'

export function PriceTable({
  entries,
  // 'buy' tables highlight the cheapest sell order (where to buy); 'sell' tables
  // highlight the highest sell order (where to list a product).
  mode = 'buy',
  // When provided, rows become clickable to force the city used by the calculator.
  selectedCity = null,
  onSelectCity,
}: {
  entries: SanitizedEntry[]
  mode?: 'buy' | 'sell'
  selectedCity?: string | null
  onSelectCity?: (city: string) => void
}) {
  const byCity = new Map(entries.map((e) => [e.city, e]))
  const selectable = Boolean(onSelectCity)

  const sellOrders = entries
    .map((e) => e.usableSellPrice)
    .filter((p): p is number => p != null)
  const highlightSellPrice =
    sellOrders.length === 0
      ? null
      : mode === 'sell'
        ? Math.max(...sellOrders)
        : Math.min(...sellOrders)

  let bestInstantSell = -Infinity
  for (const e of entries) {
    if (e.usableInstantSellPrice != null)
      bestInstantSell = Math.max(bestInstantSell, e.usableInstantSellPrice)
  }

  return (
    <div className="overflow-auto rounded-xl border border-white/8 bg-surface">
      <table className="tabular w-full border-collapse text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-text-muted">
            <th className="px-4 py-3 text-left font-bold">Ciudad</th>
            <th className="px-4 py-3 text-right font-bold">Comprar (orden venta)</th>
            <th className="px-4 py-3 text-right font-bold">Venta inmediata (orden compra)</th>
            <th className="px-4 py-3 text-left font-bold">Estado</th>
          </tr>
        </thead>
        <tbody>
          {CITIES.map((city) => {
            const e = byCity.get(city)
            const buy = e?.usableSellPrice ?? null
            const instant = e?.usableInstantSellPrice ?? null
            const isSelected = selectedCity === city
            const canSelect = selectable && buy != null
            return (
              <tr
                key={city}
                onClick={canSelect ? () => onSelectCity!(city) : undefined}
                className={cn(
                  'border-t border-divider',
                  canSelect && 'cursor-pointer hover:bg-white/3',
                  isSelected && 'bg-primary/8',
                )}
              >
                <td
                  className={cn(
                    'px-4 py-3 font-medium',
                    isSelected && 'border-l-2 border-primary',
                  )}
                >
                  {city}
                  {isSelected && (
                    <span className="ml-2 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                      ✓ usada
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {buy != null ? (
                    <span
                      className={
                        buy === highlightSellPrice ? 'font-bold text-success' : undefined
                      }
                    >
                      {formatSilver(buy)}
                    </span>
                  ) : (
                    <span className="text-text-faint">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {instant != null ? (
                    <span
                      className={
                        instant === bestInstantSell ? 'font-bold text-primary' : undefined
                      }
                    >
                      {formatSilver(instant)}
                    </span>
                  ) : (
                    <span className="text-text-faint">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {e ? (
                    <StatusBadge status={e.status} hoursOld={e.sellHoursOld ?? e.buyHoursOld} />
                  ) : (
                    <StatusBadge status="no_data" />
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

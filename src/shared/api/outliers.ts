import type { SanitizedEntry } from '@/shared/types/market'

/**
 * Cross-city outlier detection.
 *
 * A fixed price cap can't catch troll listings: high-tier gear legitimately costs
 * millions, yet placeholder orders like 1,999,999 or int-max are pure noise. Instead
 * we compare each city against the MEDIAN of the others — a value many times the
 * median is almost certainly a troll order, not a real market price.
 */
export interface OutlierOptions {
  /** Multiple of the median above which a price is treated as a troll listing. */
  factor: number
  /** Need at least this many valid prices for the median to mean anything. */
  minSamples: number
}

export const DEFAULT_OUTLIER_OPTIONS: OutlierOptions = {
  factor: 6,
  minSamples: 3,
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

/**
 * Returns a new array where entries with a price far above the cross-city median are
 * demoted to `suspicious` and annotated. Pure; never mutates the input.
 */
export function markPriceOutliers(
  entries: SanitizedEntry[],
  options: OutlierOptions = DEFAULT_OUTLIER_OPTIONS,
): SanitizedEntry[] {
  const sells = entries
    .map((e) => e.usableSellPrice)
    .filter((p): p is number => p != null)

  if (sells.length < options.minSamples) return entries
  const threshold = median(sells) * options.factor

  return entries.map((e) => {
    if (e.usableSellPrice != null && e.usableSellPrice > threshold) {
      return {
        ...e,
        usableSellPrice: null,
        status: 'suspicious',
        warnings: [...e.warnings, 'Precio atípico (posible orden troll)'],
      }
    }
    return e
  })
}

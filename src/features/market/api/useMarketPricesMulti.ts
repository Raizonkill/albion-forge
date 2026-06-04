import { useQuery } from '@tanstack/react-query'
import { fetchPrices } from '@/shared/api/client'
import { sanitizeEntries, defaultOptions } from '@/shared/api/sanitize'
import { markPriceOutliers } from '@/shared/api/outliers'
import { CITIES } from '@/config/game'
import { useServerStore } from '@/app/store/serverStore'
import type { SanitizedEntry } from '@/shared/types/market'

export type PricesByItem = Record<string, SanitizedEntry[]>

/**
 * Live prices for several items at once (e.g. a refine's raw, previous-tier and final).
 * One batched request, then sanitize + outlier-filter PER item so cross-city detection
 * doesn't mix unrelated items.
 */
export function useMarketPricesMulti(itemIds: (string | null)[], quality: number) {
  const server = useServerStore((s) => s.server)
  const ids = itemIds.filter((id): id is string => Boolean(id))

  return useQuery<PricesByItem>({
    queryKey: ['prices-multi', server, [...ids].sort(), quality],
    enabled: ids.length > 0,
    queryFn: async ({ signal }) => {
      const raw = await fetchPrices({
        server,
        itemIds: ids,
        locations: [...CITIES],
        qualities: [quality],
        signal,
      })
      const opts = defaultOptions()
      const byItem: PricesByItem = {}
      for (const id of ids) {
        byItem[id] = markPriceOutliers(
          sanitizeEntries(
            raw.filter((e) => e.item_id === id),
            opts,
          ),
        )
      }
      return byItem
    },
  })
}

/** Cheapest city to buy (lowest usable sell-order price), or null if no data. */
export function cheapestBuy(entries: SanitizedEntry[] | undefined) {
  let best: { city: string; price: number } | null = null
  for (const e of entries ?? []) {
    if (e.usableSellPrice != null && (best === null || e.usableSellPrice < best.price)) {
      best = { city: e.city, price: e.usableSellPrice }
    }
  }
  return best
}

/** Best city to sell (highest usable sell-order price), or null if no data. */
export function bestSell(entries: SanitizedEntry[] | undefined) {
  let best: { city: string; price: number } | null = null
  for (const e of entries ?? []) {
    if (e.usableSellPrice != null && (best === null || e.usableSellPrice > best.price)) {
      best = { city: e.city, price: e.usableSellPrice }
    }
  }
  return best
}

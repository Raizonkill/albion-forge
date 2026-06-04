import { useQuery } from '@tanstack/react-query'
import { fetchPrices } from '@/shared/api/client'
import { sanitizeEntries, defaultOptions } from '@/shared/api/sanitize'
import { markPriceOutliers } from '@/shared/api/outliers'
import { CITIES } from '@/config/game'
import { useServerStore } from '@/app/store/serverStore'
import type { SanitizedEntry } from '@/shared/types/market'

/**
 * Live market prices for one item across every city, at a given quality.
 * Returns sanitized entries — the UI never sees a raw, untrusted price.
 */
export function useMarketPrices(itemId: string | null, quality: number) {
  const server = useServerStore((s) => s.server)

  return useQuery<SanitizedEntry[]>({
    queryKey: ['prices', server, itemId, quality],
    enabled: Boolean(itemId),
    queryFn: async ({ signal }) => {
      const raw = await fetchPrices({
        server,
        itemIds: [itemId as string],
        locations: [...CITIES],
        qualities: [quality],
        signal,
      })
      return markPriceOutliers(sanitizeEntries(raw, defaultOptions()))
    },
  })
}

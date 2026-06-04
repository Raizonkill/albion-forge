import { z } from 'zod'
import { aodBasePath, type ServerId } from '@/config/servers'
import type { RawMarketEntry } from '@/shared/types/market'

/**
 * Zod schema validating the raw API response at the boundary.
 * Missing numeric fields default to 0 (which the sanitize layer treats as "no data"),
 * so a malformed entry never silently becomes a free material.
 */
const marketEntrySchema = z.object({
  item_id: z.string(),
  city: z.string(),
  quality: z.number().default(1),
  sell_price_min: z.number().default(0),
  sell_price_min_date: z.string().default(''),
  sell_price_max: z.number().default(0),
  sell_price_max_date: z.string().default(''),
  buy_price_min: z.number().default(0),
  buy_price_min_date: z.string().default(''),
  buy_price_max: z.number().default(0),
  buy_price_max_date: z.string().default(''),
})

const marketResponseSchema = z.array(marketEntrySchema)

export class AodApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'AodApiError'
    this.status = status
  }
}

export interface FetchPricesParams {
  server: ServerId
  itemIds: string[]
  locations: string[]
  qualities?: number[]
  signal?: AbortSignal
}

/** API caps the URL length; chunk item IDs to stay well under it. */
const MAX_IDS_PER_REQUEST = 50

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

/**
 * Fetch current market prices. Batches item IDs across requests and concatenates
 * the validated results. Throws AodApiError on a non-OK response so React Query
 * can surface loading/error states uniformly.
 */
export async function fetchPrices({
  server,
  itemIds,
  locations,
  qualities,
  signal,
}: FetchPricesParams): Promise<RawMarketEntry[]> {
  if (itemIds.length === 0) return []

  const locationsQuery = encodeURIComponent(locations.join(','))
  const qualitiesQuery = qualities?.length
    ? `&qualities=${encodeURIComponent(qualities.join(','))}`
    : ''

  const batches = chunk(itemIds, MAX_IDS_PER_REQUEST)
  const results: RawMarketEntry[] = []

  for (const ids of batches) {
    const url = `${aodBasePath(server)}/api/v2/stats/prices/${ids.join(',')}.json?locations=${locationsQuery}${qualitiesQuery}`
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    })
    if (!res.ok) {
      throw new AodApiError(`Error ${res.status}: ${res.statusText}`, res.status)
    }
    const json = (await res.json()) as unknown
    results.push(...marketResponseSchema.parse(json))
  }

  return results
}

import { MAX_DATA_AGE_MS } from '@/config/game'
import type {
  PriceStatus,
  RawMarketEntry,
  SanitizedEntry,
} from '@/shared/types/market'

/**
 * Data sanitization layer — ported and hardened from the original prototype.
 *
 * The Albion Online Data Project is crowdsourced: prices can be zero, stale,
 * troll-listed, or absent. Treating any of those as "free" produces fake
 * infinite profit. This layer is the single gate every price passes through.
 */
export interface SanitizeOptions {
  /** Reject sell prices above this (fat-finger / market manipulation). */
  maxPrice: number
  /** Reject buy prices below this (symbolic 1-silver troll orders). */
  minBuyPrice: number
  /** Data older than this counts as stale. */
  maxDataAgeMs: number
  /** Reference time. Injected so calculations and tests are deterministic. */
  now: number
}

export const DEFAULT_SANITIZE_OPTIONS: Omit<SanitizeOptions, 'now'> = {
  maxPrice: 500_000_000,
  minBuyPrice: 10,
  maxDataAgeMs: MAX_DATA_AGE_MS,
}

// The API returns this sentinel date when no real timestamp exists.
const EMPTY_DATE_PATTERN = /^0001-01-01/

export function isValidPrice(
  price: number,
  type: 'sell' | 'buy',
  opts: Pick<SanitizeOptions, 'maxPrice' | 'minBuyPrice'>,
): boolean {
  if (!Number.isFinite(price) || price <= 0) return false
  if (type === 'sell' && price > opts.maxPrice) return false
  if (type === 'buy' && price < opts.minBuyPrice) return false
  return true
}

export function isEmptyDate(dateStr: string | undefined | null): boolean {
  return !dateStr || EMPTY_DATE_PATTERN.test(dateStr)
}

export function getHoursOld(
  dateStr: string | undefined | null,
  now: number,
): number | null {
  if (isEmptyDate(dateStr)) return null
  // The API returns UTC timestamps without a zone suffix — append Z so Date.parse
  // doesn't interpret them in the user's local timezone.
  const hasZone = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(dateStr as string)
  const ts = Date.parse(hasZone ? (dateStr as string) : `${dateStr}Z`)
  if (Number.isNaN(ts)) return null
  const ageMs = now - ts
  if (ageMs < 0) return null
  return Math.round((ageMs / 3_600_000) * 10) / 10
}

export function isFresh(
  dateStr: string | undefined | null,
  opts: Pick<SanitizeOptions, 'maxDataAgeMs' | 'now'>,
): boolean {
  const hours = getHoursOld(dateStr, opts.now)
  if (hours === null) return false
  return hours * 3_600_000 < opts.maxDataAgeMs
}

function deriveStatus(
  sellPrice: number | null,
  buyPrice: number | null,
  isFreshSell: boolean,
  isFreshBuy: boolean,
  warnings: string[],
): PriceStatus {
  const hasSell = sellPrice !== null
  const hasBuy = buyPrice !== null
  if (!hasSell && !hasBuy) return 'no_data'
  // 'suspicious' = a raw price was present but rejected as a troll/out-of-range listing.
  // (A missing side of the market is normal, not suspicious — that was a prototype bug.)
  if (warnings.some((w) => w.includes('fuera de rango') || w.includes('simbólico'))) {
    return 'suspicious'
  }
  // No fresh usable price on either side → the data we'd use is stale.
  const hasFresh = (hasSell && isFreshSell) || (hasBuy && isFreshBuy)
  if (!hasFresh) return 'stale'
  return 'ok'
}

export function sanitizeEntry(
  entry: RawMarketEntry,
  options: SanitizeOptions,
): SanitizedEntry {
  const sellPrice = isValidPrice(entry.sell_price_min, 'sell', options)
    ? entry.sell_price_min
    : null
  const buyPrice = isValidPrice(entry.buy_price_max, 'buy', options)
    ? entry.buy_price_max
    : null

  const isFreshSell = sellPrice !== null && isFresh(entry.sell_price_min_date, options)
  const isFreshBuy = buyPrice !== null && isFresh(entry.buy_price_max_date, options)

  const warnings: string[] = []
  if (entry.sell_price_min > options.maxPrice) warnings.push('Precio venta fuera de rango')
  if (entry.buy_price_max > 0 && entry.buy_price_max < options.minBuyPrice)
    warnings.push('Precio compra simbólico')
  if (entry.sell_price_min > 0 && !isFreshSell) warnings.push('Datos venta desactualizados')
  if (entry.buy_price_max > 0 && !isFreshBuy) warnings.push('Datos compra desactualizados')

  return {
    city: entry.city,
    itemId: entry.item_id,
    quality: entry.quality,
    usableSellPrice: sellPrice,
    usableInstantSellPrice: buyPrice,
    isFreshSell,
    isFreshBuy,
    sellHoursOld: getHoursOld(entry.sell_price_min_date, options.now),
    buyHoursOld: getHoursOld(entry.buy_price_max_date, options.now),
    status: deriveStatus(sellPrice, buyPrice, isFreshSell, isFreshBuy, warnings),
    warnings,
  }
}

export function sanitizeEntries(
  entries: RawMarketEntry[],
  options: SanitizeOptions,
): SanitizedEntry[] {
  return entries.map((e) => sanitizeEntry(e, options))
}

/** Build options with the current wall-clock time and prototype defaults. */
export function defaultOptions(now: number = Date.now()): SanitizeOptions {
  return { ...DEFAULT_SANITIZE_OPTIONS, now }
}

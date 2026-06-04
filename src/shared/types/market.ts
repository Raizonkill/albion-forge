/** Raw shape returned by /api/v2/stats/prices on the Albion Online Data Project. */
export interface RawMarketEntry {
  item_id: string
  city: string
  quality: number
  sell_price_min: number
  sell_price_min_date: string
  sell_price_max: number
  sell_price_max_date: string
  buy_price_min: number
  buy_price_min_date: string
  buy_price_max: number
  buy_price_max_date: string
}

export type PriceStatus = 'ok' | 'stale' | 'suspicious' | 'no_data'

/**
 * Normalized, trustworthy view of a single city/item price point.
 * The rest of the app consumes THIS, never the raw entry — an anti-corruption layer.
 */
export interface SanitizedEntry {
  city: string
  itemId: string
  quality: number
  /** sell_price_min — what sellers ask, i.e. the price to BUY material. */
  usableSellPrice: number | null
  /** buy_price_max — best open buy order, i.e. instant-sell income. */
  usableInstantSellPrice: number | null
  isFreshSell: boolean
  isFreshBuy: boolean
  sellHoursOld: number | null
  buyHoursOld: number | null
  status: PriceStatus
  warnings: string[]
}

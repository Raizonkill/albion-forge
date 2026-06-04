import { describe, expect, it } from 'vitest'
import { sanitizeEntry, type SanitizeOptions } from './sanitize'
import type { RawMarketEntry } from '@/shared/types/market'

// Fixed reference time so freshness checks are deterministic.
const NOW = Date.parse('2024-01-15T12:00:00Z')

const OPTS: SanitizeOptions = {
  maxPrice: 500_000_000,
  minBuyPrice: 10,
  maxDataAgeMs: 48 * 60 * 60 * 1000,
  now: NOW,
}

function entry(partial: Partial<RawMarketEntry>): RawMarketEntry {
  return {
    item_id: 'T4_BAG',
    city: 'Caerleon',
    quality: 1,
    sell_price_min: 0,
    sell_price_min_date: '0001-01-01T00:00:00',
    sell_price_max: 0,
    sell_price_max_date: '0001-01-01T00:00:00',
    buy_price_min: 0,
    buy_price_min_date: '0001-01-01T00:00:00',
    buy_price_max: 0,
    buy_price_max_date: '0001-01-01T00:00:00',
    ...partial,
  }
}

describe('sanitizeEntry', () => {
  it('marks a fresh, valid sell price as ok', () => {
    const r = sanitizeEntry(
      entry({ sell_price_min: 1500, sell_price_min_date: '2024-01-15T10:00:00' }),
      OPTS,
    )
    expect(r.usableSellPrice).toBe(1500)
    expect(r.isFreshSell).toBe(true)
    expect(r.sellHoursOld).toBe(2)
    expect(r.status).toBe('ok')
  })

  it('treats a zero sell price as no usable data', () => {
    const r = sanitizeEntry(entry({ sell_price_min: 0 }), OPTS)
    expect(r.usableSellPrice).toBeNull()
    expect(r.status).toBe('no_data')
  })

  it('rejects symbolic troll buy orders below minBuyPrice', () => {
    const r = sanitizeEntry(
      entry({ buy_price_max: 1, buy_price_max_date: '2024-01-15T11:00:00' }),
      OPTS,
    )
    expect(r.usableInstantSellPrice).toBeNull()
    expect(r.warnings).toContain('Precio compra simbólico')
  })

  it('flags stale data older than the freshness window', () => {
    const r = sanitizeEntry(
      entry({ sell_price_min: 1500, sell_price_min_date: '2024-01-12T10:00:00' }),
      OPTS,
    )
    expect(r.usableSellPrice).toBe(1500)
    expect(r.isFreshSell).toBe(false)
    expect(r.status).toBe('stale')
    expect(r.warnings).toContain('Datos venta desactualizados')
  })

  it('returns no hours for the empty sentinel date', () => {
    const r = sanitizeEntry(entry({ sell_price_min: 1500 }), OPTS)
    expect(r.sellHoursOld).toBeNull()
  })
})

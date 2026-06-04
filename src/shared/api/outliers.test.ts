import { describe, expect, it } from 'vitest'
import { markPriceOutliers } from './outliers'
import type { SanitizedEntry } from '@/shared/types/market'

function entry(city: string, sell: number | null): SanitizedEntry {
  return {
    city,
    itemId: 'T4_BAG',
    quality: 1,
    usableSellPrice: sell,
    usableInstantSellPrice: null,
    isFreshSell: sell != null,
    isFreshBuy: false,
    sellHoursOld: 1,
    buyHoursOld: null,
    status: sell != null ? 'ok' : 'no_data',
    warnings: [],
  }
}

describe('markPriceOutliers', () => {
  it('demotes a troll price far above the cross-city median', () => {
    const result = markPriceOutliers([
      entry('Martlock', 1_999_999),
      entry('Lymhurst', 3641),
      entry('Caerleon', 4500),
      entry('Thetford', 4164),
    ])
    const martlock = result.find((e) => e.city === 'Martlock')!
    expect(martlock.status).toBe('suspicious')
    expect(martlock.usableSellPrice).toBeNull()
    expect(martlock.warnings).toContain('Precio atípico (posible orden troll)')
    // Normal prices are untouched.
    expect(result.find((e) => e.city === 'Lymhurst')!.status).toBe('ok')
  })

  it('does nothing without enough samples to trust the median', () => {
    const input = [entry('Martlock', 1_999_999), entry('Lymhurst', 3641)]
    expect(markPriceOutliers(input)).toEqual(input)
  })

  it('keeps legitimately expensive items when prices agree', () => {
    const result = markPriceOutliers([
      entry('Martlock', 2_400_000),
      entry('Lymhurst', 2_500_000),
      entry('Caerleon', 2_600_000),
    ])
    expect(result.every((e) => e.status === 'ok')).toBe(true)
  })
})

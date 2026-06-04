import { describe, expect, it } from 'vitest'
import { refineProfit } from './refineProfit'

describe('refineProfit', () => {
  // Golden case computed by hand:
  //   T6 leather in Martlock (bonus city), no focus → effective RRR = 0.58/1.58 = 0.367089
  //   materials = 1000×4 (hide) + 2000×1 (T5 leather) = 6000
  //   effective materials = 6000 × (1 - 0.367089) = 3797.4684
  //   station fee = 164 × 0.001125 × 350 = 64.575
  //   total cost = 3862.0434
  //   net income = 5000 × (1 - 0.065) = 4675
  //   profit = 812.9566
  it('matches the hand-computed T6 leather golden case', () => {
    const r = refineProfit({
      rawPrice: 1000,
      rawQty: 4,
      prevPrice: 2000,
      prevQty: 1,
      sellPrice: 5000,
      itemValue: 164,
      stationFeePer100: 350,
      premium: true,
      returnRate: { bonusCity: true, focus: false },
      quantity: 1,
    })
    expect(r.effectiveReturnRate).toBeCloseTo(0.367089, 5)
    expect(r.effectiveMaterialsCostUnit).toBeCloseTo(3797.4684, 2)
    expect(r.stationFeeUnit).toBeCloseTo(64.575, 3)
    expect(r.totalCostUnit).toBeCloseTo(3862.0434, 2)
    expect(r.profitUnit).toBeCloseTo(812.9566, 2)
  })

  it('applies the return rate to the previous-tier material too (prototype bug fix)', () => {
    const withPrev = refineProfit({
      rawPrice: 0,
      rawQty: 0,
      prevPrice: 1000,
      prevQty: 1,
      sellPrice: 0,
      itemValue: 0,
      stationFeePer100: 0,
      premium: true,
      returnRate: { bonusCity: false, focus: false }, // eff = 0.152
      quantity: 1,
    })
    // 1000 × (1 - 0.152...) ≈ 847.46, NOT the full 1000 the prototype charged.
    expect(withPrev.effectiveMaterialsCostUnit).toBeCloseTo(847.46, 1)
  })

  it('scales by batch quantity', () => {
    const r = refineProfit({
      rawPrice: 100,
      rawQty: 2,
      prevPrice: 0,
      prevQty: 0,
      sellPrice: 500,
      itemValue: 54,
      stationFeePer100: 100,
      premium: false,
      returnRate: { bonusCity: false, focus: false },
      quantity: 10,
    })
    expect(r.profitBatch).toBeCloseTo(r.profitUnit * 10, 6)
    expect(r.investmentBatch).toBeCloseTo(r.totalCostUnit * 10, 6)
  })
})

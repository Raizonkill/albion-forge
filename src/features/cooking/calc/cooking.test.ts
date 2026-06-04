import { describe, expect, it } from 'vitest'
import { cookingProfit, type PriceAt } from './cookingProfit'
import { cookingFocusPerBatch, masteryFactor } from './cookingFocus'
import { COOKING_RECIPES } from '../data/recipes'

const soup = COOKING_RECIPES.find((r) => r.id === 'T1_MEAL_SOUP')! // Carrot ×16, 10 units

describe('cookingProfit', () => {
  it('computes the .0 profit for a hand-checked case', () => {
    // Carrot = 10 everywhere; meal .0 sells for 200 in Caerleon.
    const priceAt: PriceAt = (id, city) => {
      if (id === 'T1_CARROT') return 10
      if (id === 'T1_MEAL_SOUP' && city === 'Caerleon') return 200
      return null
    }
    const result = cookingProfit({
      recipe: soup,
      craftCity: 'Caerleon',
      cities: ['Caerleon'],
      premium: true, // tax 6.5%
      batches: 1,
      priceAt,
      itemValueFor: () => 18, // T1.0
      stationFeePer100: 350,
    })
    const e0 = result[0]
    // ingredients 160 + station 18×0.001125×350=7.0875 → investment 167.0875
    expect(e0.investment).toBeCloseTo(167.0875, 3)
    // income 200×10×0.935 = 1870 → profit 1702.9125
    expect(e0.bestProfit).toBeCloseTo(1702.9125, 2)
    expect(e0.bestCity).toBe('Caerleon')
  })

  it('yields null investment when an ingredient has no price', () => {
    const result = cookingProfit({
      recipe: soup,
      craftCity: 'Caerleon',
      cities: ['Caerleon'],
      premium: true,
      batches: 1,
      priceAt: () => null,
      itemValueFor: () => 18,
      stationFeePer100: 350,
    })
    expect(result[0].investment).toBeNull()
    expect(result[0].bestProfit).toBeNull()
  })
})

describe('cooking focus model (spec v2.7)', () => {
  // Doc case study: Kraken .2, base focus 2473.
  it('matches the three documented mastery scenarios', () => {
    expect(masteryFactor(0, 0)).toBeCloseTo(1, 5) // novato
    expect(masteryFactor(30, 20)).toBeCloseTo(0.53588, 4) // 0.5^0.9
    expect(masteryFactor(30, 120)).toBeCloseTo(0.43527, 4) // 0.5^1.2 (incl. Chef 100)
    expect(2473 * masteryFactor(30, 20)).toBeCloseTo(1325, 0)
    expect(2473 * masteryFactor(30, 120)).toBeCloseTo(1076, 0)
  })

  it('weights principal spec 2.8× vs other specs 0.3×', () => {
    // 10 levels of principal reduce focus far more than 10 levels elsewhere.
    expect(masteryFactor(10, 0)).toBeLessThan(masteryFactor(0, 10))
  })

  it('returns base focus with no mastery, scaled by enchant', () => {
    expect(cookingFocusPerBatch(560, 0, 0, 0)).toBeCloseTo(560, 5)
    expect(cookingFocusPerBatch(560, 1, 0, 0)).toBeCloseTo(560 * 1.3421, 3)
  })
})

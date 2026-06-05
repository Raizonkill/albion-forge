import { describe, expect, it } from 'vitest'
import { cookingProfit, type PriceAt } from './cookingProfit'
import { focusPerCraft, masteryFactor } from './cookingFocus'
import { COOKING_RECIPES } from '../data/recipes'

const soup = COOKING_RECIPES.find((r) => r.id === 'T1_MEAL_SOUP')! // Carrot ×16, output 10, nutrition 77

describe('cookingProfit', () => {
  it('computes the .0 profit for a hand-checked case', () => {
    // Carrot = 10 everywhere; meal .0 sells for 200 in Caerleon.
    const priceAt: PriceAt = (id, city) => {
      if (id === 'T1_CARROT') return 10
      if (id === 'T1_MEAL_SOUP' && city === 'Caerleon') return 200
      return null
    }
    const e0 = cookingProfit({
      recipe: soup,
      craftCity: 'Caerleon',
      cities: ['Caerleon'],
      premium: true, // tax 6.5%
      batches: 1,
      priceAt,
      stationFeePer100: 350,
    })[0]
    // ingredients 160 + station 77×0.001125×350 = 30.31875 → 190.31875
    expect(e0.investment).toBeCloseTo(190.31875, 3)
    // income 200×10×0.935 = 1870 → profit 1679.68125
    expect(e0.bestProfit).toBeCloseTo(1679.68125, 2)
    expect(e0.bestCity).toBe('Caerleon')
  })

  it('produces one result per available enchant level', () => {
    const results = cookingProfit({
      recipe: soup,
      craftCity: 'Caerleon',
      cities: ['Caerleon'],
      premium: true,
      batches: 1,
      priceAt: () => null,
      stationFeePer100: 350,
    })
    expect(results.length).toBe(soup.focusByEnchant.length)
    expect(results[0].investment).toBeNull() // no ingredient prices
  })
})

describe('cooking focus model (official: E = 250·principal + 30·others, B / 2^(E/10000))', () => {
  it('halves focus every 10000 efficiency points', () => {
    expect(masteryFactor(0, 0)).toBeCloseTo(1, 5)
    expect(masteryFactor(40, 0)).toBeCloseTo(0.5, 5) // E = 250×40 = 10000
    expect(masteryFactor(80, 0)).toBeCloseTo(0.25, 5) // E = 20000
    expect(masteryFactor(0, 1000 / 3)).toBeCloseTo(0.5, 5) // E = 30×(1000/3) = 10000
  })

  it('uses the 250 / 30 weighting', () => {
    // principal 30, others 20 → E = 7500 + 600 = 8100 → 2^-0.81 ≈ 0.5704
    expect(masteryFactor(30, 20)).toBeCloseTo(0.5704, 3)
    expect(focusPerCraft(2473, 30, 20)).toBeCloseTo(2473 * 0.5704, 0)
  })

  it('weights principal spec far more than other specs', () => {
    expect(masteryFactor(10, 0)).toBeLessThan(masteryFactor(0, 10))
  })
})

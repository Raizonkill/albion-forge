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

describe('cooking focus model (spec v2.7)', () => {
  // Doc case study: Kraken .2, base @craftingfocus 2473.
  it('matches the three documented mastery scenarios', () => {
    expect(masteryFactor(0, 0)).toBeCloseTo(1, 5)
    expect(masteryFactor(30, 20)).toBeCloseTo(0.53588, 4)
    expect(masteryFactor(30, 120)).toBeCloseTo(0.43527, 4)
    expect(focusPerCraft(2473, 30, 20)).toBeCloseTo(1325, 0)
    expect(focusPerCraft(2473, 30, 120)).toBeCloseTo(1076, 0)
  })

  it('weights principal spec 2.8× vs other specs 0.3×', () => {
    expect(masteryFactor(10, 0)).toBeLessThan(masteryFactor(0, 10))
  })
})

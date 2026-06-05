import { describe, expect, it } from 'vitest'
import { cookingProfit, type PriceAt } from './cookingProfit'
import { focusEfficiency, focusPerCraft, masteryFactor } from './cookingFocus'
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

describe('cooking focus model (official: E = 250·principal + 30·ΣallSpecs, B / 2^(E/10000))', () => {
  it("matches Raizon's hand-computed Guiso de Ternera Ava case", () => {
    // Specs: Guisos 95 (principal); all specs sum (incl. principal + Chef) = 622.
    // E = 250×95 + 30×622 = 42410; B = 5280 → 5280 / 2^4.241 ≈ 279.
    expect(focusEfficiency(95, 622)).toBe(42410)
    expect(focusPerCraft(5280, 95, 622)).toBeCloseTo(279, 0)
  })

  it('halves focus every 10000 efficiency points', () => {
    expect(masteryFactor(0, 0)).toBeCloseTo(1, 5)
    expect(masteryFactor(40, 0)).toBeCloseTo(0.5, 5) // E = 250×40 = 10000
    expect(masteryFactor(80, 0)).toBeCloseTo(0.25, 5) // E = 20000
  })

  it('counts the principal spec in BOTH the ×250 term and the ×30 sum', () => {
    // principal 10 with allSpecsSum=10 (only the principal) → E = 2500 + 300 = 2800
    expect(focusEfficiency(10, 10)).toBe(2800)
  })
})

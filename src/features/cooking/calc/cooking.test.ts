import { describe, expect, it } from 'vitest'
import { cookingProfit, type PriceAt } from './cookingProfit'
import { focusEfficiency, focusPerCraft, masteryFactor } from './cookingFocus'
import { COOKING_RECIPES } from '../data/recipes'

const soup = COOKING_RECIPES.find((r) => r.id === 'T1_MEAL_SOUP')! // Carrot ×16, output 10, nutrition 77
const avaStew = COOKING_RECIPES.find((r) => r.id === 'T8_MEAL_STEW_AVALON')! // uses 90 Avalon energy

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
      returnRate: 0, // no return → full material cost
    })[0]
    // ingredients 160 + station (craftValue 640 × 0.001125 × 350 = 252) → 412
    expect(e0.investment).toBeCloseTo(412, 3)
    // income 200×10×0.935 = 1870 → profit 1458
    expect(e0.bestProfit).toBeCloseTo(1458, 2)
    expect(e0.bestCity).toBe('Caerleon')
  })

  it('reduces material cost by the resource return rate', () => {
    const priceAt: PriceAt = (id, city) => {
      if (id === 'T1_CARROT') return 10
      if (id === 'T1_MEAL_SOUP' && city === 'Caerleon') return 200
      return null
    }
    const e0 = cookingProfit({
      recipe: soup,
      craftCity: 'Caerleon',
      cities: ['Caerleon'],
      premium: true,
      batches: 1,
      priceAt,
      stationFeePer100: 350,
      returnRate: 0.435, // with focus
    })[0]
    // materials 160 × (1 - 0.435) = 90.4; + station 252 = 342.4
    expect(e0.investment).toBeCloseTo(342.4, 3)
  })

  it('does NOT return Avalonian energy (paid in full)', () => {
    // Price every normal ingredient at 0; only the 90 Avalon energy units cost 100 each.
    const priceAt: PriceAt = (id) => (id === 'QUESTITEM_TOKEN_AVALON' ? 100 : 0)
    const e0 = cookingProfit({
      recipe: avaStew,
      craftCity: 'Caerleon',
      cities: ['Caerleon'],
      premium: true,
      batches: 1,
      priceAt,
      stationFeePer100: 0,
      returnRate: 0.5, // would halve a returnable cost; energy must stay full
    })[0]
    expect(e0.investment).toBeCloseTo(9000, 5) // 90 × 100, no return applied
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
      returnRate: 0.435,
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

import { describe, expect, it } from 'vitest'
import { focusPerUnit, masteryBonus, totalEfficiency } from './focusCost'

describe('focusCost', () => {
  // Golden case straight from the technical doc:
  //   specs T4=10, T5=10, T6=10, T7=0, T8=0, refining T4
  //   extra = 30×30 = 900, perTier = 10×250 = 2500, total = 3400
  //   masteryBonus = 1 - 2^(-0.34) ≈ 0.209959
  //   focusPerUnit(T4.0, base 54) = 54 × 2^(-0.34) ≈ 42.662
  const specs = { t4: 10, t5: 10, t6: 10, t7: 0, t8: 0 }

  it('computes total efficiency from specs and refined tier', () => {
    expect(totalEfficiency(specs, 4)).toBe(3400)
  })

  it('applies the exponential mastery bonus', () => {
    expect(masteryBonus(3400)).toBeCloseTo(0.209959, 5)
  })

  it('matches the doc focus-per-unit example (42.662)', () => {
    expect(focusPerUnit(4, 0, specs)).toBeCloseTo(42.662, 2)
  })

  it('returns full base focus with no mastery', () => {
    expect(focusPerUnit(6, 0, { t4: 0, t5: 0, t6: 0, t7: 0, t8: 0 })).toBeCloseTo(164, 5)
  })
})

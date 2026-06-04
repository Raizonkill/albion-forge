import { describe, expect, it } from 'vitest'
import { effectiveReturnRate, nominalReturnRate } from './returnRate'

describe('returnRate', () => {
  // The four canonical Albion refining return rates the prototype hardcoded.
  it('reproduces the four canonical effective rates', () => {
    expect(effectiveReturnRate({ bonusCity: false, focus: false })).toBeCloseTo(0.152, 2)
    expect(effectiveReturnRate({ bonusCity: true, focus: false })).toBeCloseTo(0.367, 2)
    expect(effectiveReturnRate({ bonusCity: false, focus: true })).toBeCloseTo(0.435, 2)
    expect(effectiveReturnRate({ bonusCity: true, focus: true })).toBeCloseTo(0.539, 2)
  })

  it('adds contributions in nominal space', () => {
    expect(nominalReturnRate({ bonusCity: false, focus: false })).toBeCloseTo(0.18, 5)
    expect(nominalReturnRate({ bonusCity: true, focus: true })).toBeCloseTo(1.17, 5)
  })

  it('accepts extra nominal points for future specialization', () => {
    // +20% daily bonus on top of bonus-city + focus.
    expect(
      nominalReturnRate({ bonusCity: true, focus: true, extraNominal: 0.2 }),
    ).toBeCloseTo(1.37, 5)
  })
})

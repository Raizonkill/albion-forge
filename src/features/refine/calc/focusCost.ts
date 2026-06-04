import { getItemValue } from '../data/refining'

/**
 * Focus cost model for refining — from the technical doc (documento_tecnico_foco_refinamiento).
 *
 * The "Focus" value is the focus POINTS consumed per refined unit (not resource return).
 * Mastery (specialization levels) reduces it on an exponential curve with diminishing returns:
 *
 *   efficiencyExtra = (specT4 + specT5 + specT6 + specT7 + specT8) × 30
 *   efficiencyTier  = specLevelOfRefinedTier × 250
 *   efficiencyTotal = efficiencyExtra + efficiencyTier
 *   masteryBonus    = 1 − 2^(−efficiencyTotal / 10000)
 *   focusPerUnit    = focusBase(tier, enchant) × 2^(−efficiencyTotal / 10000)
 *
 * focusBase is the same diagonal table as the item value, per the doc.
 */
export interface SpecLevels {
  t4: number
  t5: number
  t6: number
  t7: number
  t8: number
}

export const EMPTY_SPECS: SpecLevels = { t4: 0, t5: 0, t6: 0, t7: 0, t8: 0 }

const EFFICIENCY_HALF_LIFE = 10000

export function totalEfficiency(specs: SpecLevels, refinedTier: number): number {
  const sum = specs.t4 + specs.t5 + specs.t6 + specs.t7 + specs.t8
  const extra = sum * 30
  // Only T4–T8 have a refining specialization; lower tiers contribute 0.
  const byTier: Record<number, number> = {
    4: specs.t4,
    5: specs.t5,
    6: specs.t6,
    7: specs.t7,
    8: specs.t8,
  }
  const perTier = (byTier[refinedTier] ?? 0) * 250
  return extra + perTier
}

/** Fraction (0–1) by which mastery reduces the focus cost. */
export function masteryBonus(efficiencyTotal: number): number {
  return 1 - Math.pow(2, -efficiencyTotal / EFFICIENCY_HALF_LIFE)
}

/** Base focus cost for a tier/enchant, before mastery. */
export function focusBase(tier: number, enchant: number): number {
  return getItemValue(tier, enchant)
}

/** Focus points consumed per refined unit, after mastery. */
export function focusPerUnit(
  tier: number,
  enchant: number,
  specs: SpecLevels,
): number {
  const eff = totalEfficiency(specs, tier)
  return focusBase(tier, enchant) * Math.pow(2, -eff / EFFICIENCY_HALF_LIFE)
}

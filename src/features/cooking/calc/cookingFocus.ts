import { FOCUS_ENCHANT_SCALE } from '../data/recipes'

/**
 * Cooking focus cost — recipe-oriented model (spec v2.7).
 *
 *   Foco Final = Base Focus × Factor
 *   Factor     = 0.5 ^ ((2.8 × SpecPrincipal + 0.3 × ΣOtrasSpecs) / 100)
 *
 * - SpecPrincipal: mastery of the dish's own branch (e.g. Ensaladas for a salad). Weight 2.8.
 * - ΣOtrasSpecs: sum of the OTHER cooking branches + the general Chef node. Weight 0.3.
 *
 * Verified against the doc's Kraken .2 (base 2473): factor 1 / 0.53588 / 0.43527 for
 * scenarios A/B/C → 2473 / 1325 / 1076 focus per unit.
 */
const PRINCIPAL_WEIGHT = 2.8
const OTHER_WEIGHT = 0.3

export function masteryFactor(principalSpec: number, otherSpecsSum: number): number {
  return Math.pow(0.5, (PRINCIPAL_WEIGHT * principalSpec + OTHER_WEIGHT * otherSpecsSum) / 100)
}

/**
 * Focus per batch for a recipe at a given enchant.
 * Base-per-enchant is approximated as `focusBase × scale` (the doc lists exact per-enchant
 * base focus only for some high-tier/special recipes).
 */
export function cookingFocusPerBatch(
  focusBase: number,
  enchant: number,
  principalSpec: number,
  otherSpecsSum: number,
): number {
  const base = focusBase * (FOCUS_ENCHANT_SCALE[enchant] ?? 1)
  return base * masteryFactor(principalSpec, otherSpecsSum)
}

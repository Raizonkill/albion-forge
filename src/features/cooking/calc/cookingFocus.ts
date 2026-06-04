/**
 * Cooking focus cost — recipe-oriented model (spec v2.7).
 *
 *   Foco Final = BaseFocus × Factor
 *   Factor     = 0.5 ^ ((2.8 × SpecPrincipal + 0.3 × ΣOtrasSpecs) / 100)
 *
 * BaseFocus is the real per-craft @craftingfocus from ao-bin-dumps (per craft, which
 * yields recipe.output meals). SpecPrincipal = the dish's own branch (weight 2.8);
 * ΣOtrasSpecs = the other branches + the general Chef node (weight 0.3).
 *
 * Verified vs the doc's Kraken .2 (base 2473): factor 1 / 0.53588 / 0.43527.
 */
const PRINCIPAL_WEIGHT = 2.8
const OTHER_WEIGHT = 0.3

export function masteryFactor(principalSpec: number, otherSpecsSum: number): number {
  return Math.pow(0.5, (PRINCIPAL_WEIGHT * principalSpec + OTHER_WEIGHT * otherSpecsSum) / 100)
}

/** Focus consumed per craft action, after mastery. */
export function focusPerCraft(
  baseFocus: number,
  principalSpec: number,
  otherSpecsSum: number,
): number {
  return baseFocus * masteryFactor(principalSpec, otherSpecsSum)
}

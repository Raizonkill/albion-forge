/**
 * Cooking focus cost — Albion's official crafting-focus formula.
 *
 *   Foco Final = BaseFocus / 2 ^ (E / 10000)
 *   E          = 250 × SpecPrincipal + 30 × ΣOtrasSpecs
 *
 * i.e. focus halves for every 10 000 points of focus efficiency (wiki: Crafting_Focus).
 * BaseFocus is the real per-craft @craftingfocus from ao-bin-dumps. SpecPrincipal = the
 * dish's own branch (×250); ΣOtrasSpecs = every OTHER cooking spec — the other meal
 * branches plus Butcher (Carnicería), Ingredients and the Chef node — each ×30.
 *
 * Written as a base-0.5 power: 0.5 ^ ((2.5 × principal + 0.3 × others) / 100).
 */
const PRINCIPAL_WEIGHT = 2.5
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

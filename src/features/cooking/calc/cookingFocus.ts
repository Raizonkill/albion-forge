/**
 * Cooking focus cost — Albion's official crafting-focus formula.
 *
 *   Cf = B / 2 ^ (E / 10000)
 *   E  = 250 · M_principal + 30 · Σ S_i
 *
 * where:
 *  - B = base focus cost of the craft (the recipe's total @craftingfocus × output).
 *  - M_principal = the dish's own branch mastery (e.g. Guisos for a stew). ×250.
 *  - Σ S_i = sum of ALL relevant cooking specs (every branch INCLUDING the principal,
 *    plus Butcher, Ingredients and the Chef node). ×30.
 *
 * Note Σ S_i includes the principal, so that spec effectively weighs 280 (250 + 30).
 * Focus halves for every 10 000 points of efficiency (wiki: Crafting_Focus).
 */
const PRINCIPAL_WEIGHT = 250
const SPEC_WEIGHT = 30
const HALVING = 10000

/** Total focus efficiency E for a cooking action. `allSpecsSum` includes the principal. */
export function focusEfficiency(principalSpec: number, allSpecsSum: number): number {
  return PRINCIPAL_WEIGHT * principalSpec + SPEC_WEIGHT * allSpecsSum
}

export function masteryFactor(principalSpec: number, allSpecsSum: number): number {
  return Math.pow(2, -focusEfficiency(principalSpec, allSpecsSum) / HALVING)
}

/** Focus consumed per craft action, after mastery. */
export function focusPerCraft(
  baseFocus: number,
  principalSpec: number,
  allSpecsSum: number,
): number {
  return baseFocus * masteryFactor(principalSpec, allSpecsSum)
}

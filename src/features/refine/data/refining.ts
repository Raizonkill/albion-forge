import type { ResourceId } from './resources'

/**
 * Nutrition-based item value per tier/enchant, used for the station fee.
 * The table is a diagonal: T(n).e == T(n+1).(e-1). Ported and extended from the prototype.
 */
const ITEM_VALUE: Record<number, Record<number, number>> = {
  2: { 0: 18, 1: 31, 2: 54, 3: 94, 4: 164 },
  3: { 0: 31, 1: 54, 2: 94, 3: 164, 4: 287 },
  4: { 0: 54, 1: 94, 2: 164, 3: 287, 4: 503 },
  5: { 0: 94, 1: 164, 2: 287, 3: 503, 4: 880 },
  6: { 0: 164, 1: 287, 2: 503, 3: 880, 4: 1539 },
  7: { 0: 287, 1: 503, 2: 880, 3: 1539, 4: 2694 },
  8: { 0: 503, 1: 880, 2: 1539, 3: 2694, 4: 4714 },
}

export function getItemValue(tier: number, enchant: number): number {
  return ITEM_VALUE[tier]?.[enchant] ?? ITEM_VALUE[4][0]
}

export interface RefinementRecipe {
  /** Raw materials (e.g. ore) per refined unit. */
  rawQty: number
  /** Previous-tier refined materials (e.g. lower bars) per unit. */
  prevQty: number
  /** Tier of the previous-tier refined material (0 = none, for T2). */
  prevTier: number
  /** Enchant of the previous-tier refined material. */
  prevEnchant: number
}

const RAW_AMOUNTS: Record<number, { raw: number; prev: number }> = {
  2: { raw: 1, prev: 0 },
  3: { raw: 2, prev: 1 },
  4: { raw: 2, prev: 1 },
  5: { raw: 3, prev: 1 },
  6: { raw: 4, prev: 1 },
  7: { raw: 5, prev: 1 },
  8: { raw: 5, prev: 1 },
}

/**
 * Material amounts to refine one unit at the given tier/enchant.
 * Enchanted stone is the one exception — it doubles inputs per enchant level.
 */
export function getRefinementRecipe(
  tier: number,
  enchant: number,
  resource: ResourceId,
): RefinementRecipe {
  const base = RAW_AMOUNTS[tier] ?? RAW_AMOUNTS[2]
  const stoneMultiplier = resource === 'stone' && enchant > 0 ? 2 ** enchant : 1
  return {
    rawQty: base.raw * stoneMultiplier,
    prevQty: base.prev * stoneMultiplier,
    prevTier: tier === 2 ? 0 : tier - 1,
    prevEnchant: tier === 2 ? 0 : enchant,
  }
}

/**
 * Market id for a resource at a tier/enchant. Enchanted resources use the
 * `_LEVELn@n` suffix the Albion Online Data API expects.
 */
export function buildResourceId(stem: string, tier: number, enchant: number): string {
  if (enchant <= 0) return `T${tier}_${stem}`
  return `T${tier}_${stem}_LEVEL${enchant}@${enchant}`
}

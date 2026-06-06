import { COOKING_BRANCHES } from './data/recipes'

/**
 * Processing specs that are never a recipe's principal branch but still contribute
 * to focus efficiency (weight ×30): Butcher and Ingredients.
 */
export const COOKING_PROCESSING_SPECS = ['Carnicería', 'Ingredientes'] as const

/** Every cooking specialization the player can level (shown as mastery inputs). */
export const COOKING_SPECS: string[] = [...COOKING_BRANCHES, ...COOKING_PROCESSING_SPECS]

/**
 * Whether a craft resource is subject to the resource return rate.
 * In cooking, Avalonian Energy and rare fish are NOT returned; everything else
 * (normal ingredients AND fish sauces) is.
 */
export function hasResourceReturn(id: string): boolean {
  return id !== 'QUESTITEM_TOKEN_AVALON' && !/_FISH_/.test(id)
}

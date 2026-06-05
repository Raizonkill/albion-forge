import { COOKING_BRANCHES } from './data/recipes'

/**
 * Processing specs that are never a recipe's principal branch but still contribute
 * to focus efficiency (weight ×30): Butcher and Ingredients.
 */
export const COOKING_PROCESSING_SPECS = ['Carnicería', 'Ingredientes'] as const

/** Every cooking specialization the player can level (shown as mastery inputs). */
export const COOKING_SPECS: string[] = [...COOKING_BRANCHES, ...COOKING_PROCESSING_SPECS]

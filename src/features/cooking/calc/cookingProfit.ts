import { totalSalesTax } from '@/config/game'
import { SAUCE_IDS, mealItemId, type CookingRecipe } from '../data/recipes'
import { hasResourceReturn } from '../specs'

/** Returns the usable sell-order price for an item in a city, or null. */
export type PriceAt = (itemId: string, city: string) => number | null

export interface CookingParams {
  recipe: CookingRecipe
  craftCity: string
  cities: string[]
  premium: boolean
  batches: number
  priceAt: PriceAt
  stationFeePer100: number
  /** Effective resource return rate (0–1). Reduces the material cost actually spent. */
  returnRate: number
}

export interface CityProfit {
  city: string
  sellPrice: number | null
  profit: number | null
}

export interface EnchantBreakdown {
  /** Returnable materials (normal ingredients + sauce), run total, gross. */
  returnableMat: number
  /** Non-returnable materials (avalon energy, rare fish), run total. */
  nonReturnMat: number
  /** Silver returned by the resource return (run total). */
  returnValue: number
  /** Station fee, run total. */
  stationCost: number
  /** Best-city income net of tax (run total), or null. */
  income: number | null
}

export interface EnchantResult {
  enchant: number
  mealId: string
  /** Total investment for the whole batch run (ingredients + sauce + station). */
  investment: number | null
  sauceCost: number
  cityProfits: CityProfit[]
  bestProfit: number | null
  bestCity: string | null
  breakdown: EnchantBreakdown
}

const STATION_FEE_CONSTANT = 0.001125

function minAcross(priceAt: PriceAt, itemId: string, cities: string[]): number | null {
  let best: number | null = null
  for (const c of cities) {
    const p = priceAt(itemId, c)
    if (p != null && (best === null || p < best)) best = p
  }
  return best
}

function buyPrice(
  priceAt: PriceAt,
  itemId: string,
  craftCity: string,
  cities: string[],
): number | null {
  return priceAt(itemId, craftCity) ?? minAcross(priceAt, itemId, cities)
}

/**
 * Profit per enchant level, per sell city — from authoritative recipe data.
 *
 * Key facts baked in: a craft yields `recipe.output` meals (10 standard, 1 for fish);
 * enchanting adds `recipe.sauceByEnchant[level]` fish sauces (e.g. 90 for T7/T8); the
 * station fee uses the food's nutrition. Missing ingredient prices → null investment.
 */
export function cookingProfit(params: CookingParams): EnchantResult[] {
  const { recipe, craftCity, cities, premium, batches, priceAt, stationFeePer100, returnRate } =
    params
  const tax = totalSalesTax(premium)
  const keep = 1 - returnRate // fraction of materials you actually have to buy

  // Base ingredient cost per craft (same for every enchant). Split by whether the resource
  // is returned: Avalonian energy and rare fish are NOT (full price); everything else is.
  let returnableIng = 0
  let nonReturnIng = 0
  let ingredientsKnown = true
  for (const ing of recipe.ingredientes) {
    const p = buyPrice(priceAt, ing.id, craftCity, cities)
    if (p == null) {
      ingredientsKnown = false
      continue
    }
    const cost = p * ing.qty
    if (hasResourceReturn(ing.id)) returnableIng += cost
    else nonReturnIng += cost
  }

  const stationCost = recipe.nutrition * STATION_FEE_CONSTANT * stationFeePer100

  return recipe.focusByEnchant.map((_focus, enchant) => {
    const mealId = mealItemId(recipe.id, enchant)
    const sauceQty = recipe.sauceByEnchant[enchant] ?? 0
    const saucePrice =
      sauceQty > 0 ? buyPrice(priceAt, SAUCE_IDS[enchant], craftCity, cities) : 0
    const sauceCost = sauceQty > 0 ? (saucePrice ?? 0) * sauceQty : 0

    // Returnable materials (normal ingredients + sauces) are reduced by the return rate;
    // non-returnable ones (avalon energy, rare fish) and the station fee are paid in full.
    const investmentPerCraft = ingredientsKnown
      ? (returnableIng + sauceCost) * keep + nonReturnIng + stationCost
      : null
    const investment = investmentPerCraft != null ? investmentPerCraft * batches : null

    const cityProfits: CityProfit[] = cities.map((city) => {
      const sellPrice = priceAt(mealId, city)
      if (sellPrice == null || investmentPerCraft == null) {
        return { city, sellPrice, profit: null }
      }
      const incomePerCraft = sellPrice * recipe.output * (1 - tax)
      return { city, sellPrice, profit: (incomePerCraft - investmentPerCraft) * batches }
    })

    let bestProfit: number | null = null
    let bestCity: string | null = null
    let bestSell: number | null = null
    for (const cp of cityProfits) {
      if (cp.profit != null && (bestProfit === null || cp.profit > bestProfit)) {
        bestProfit = cp.profit
        bestCity = cp.city
        bestSell = cp.sellPrice
      }
    }

    const returnableMat = (returnableIng + sauceCost) * batches
    const breakdown: EnchantBreakdown = {
      returnableMat,
      nonReturnMat: nonReturnIng * batches,
      returnValue: returnableMat * returnRate,
      stationCost: stationCost * batches,
      income: bestSell != null ? bestSell * recipe.output * (1 - tax) * batches : null,
    }

    return { enchant, mealId, investment, sauceCost, cityProfits, bestProfit, bestCity, breakdown }
  })
}

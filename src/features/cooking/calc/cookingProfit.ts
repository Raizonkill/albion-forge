import { totalSalesTax } from '@/config/game'
import { parseTier } from '@/shared/game-data/items'
import {
  AVALON_ENERGY_ID,
  SAUCE_IDS,
  mealItemId,
  type CookingRecipe,
} from '../data/recipes'

/** Returns the usable sell-order price for an item in a city, or null. */
export type PriceAt = (itemId: string, city: string) => number | null

export interface CookingParams {
  recipe: CookingRecipe
  craftCity: string
  cities: string[]
  premium: boolean
  batches: number
  priceAt: PriceAt
  /** Nutrition-based item value for the station fee (approximated by tier). */
  itemValueFor: (tier: number, enchant: number) => number
  stationFeePer100: number
}

export interface CityProfit {
  city: string
  sellPrice: number | null
  profit: number | null
}

export interface EnchantResult {
  enchant: number
  mealId: string
  /** Total investment for the whole batch run (ingredients + sauce + energy + station). */
  investment: number | null
  sauceCost: number
  cityProfits: CityProfit[]
  bestProfit: number | null
  bestCity: string | null
}

function minAcross(priceAt: PriceAt, itemId: string, cities: string[]): number | null {
  let best: number | null = null
  for (const c of cities) {
    const p = priceAt(itemId, c)
    if (p != null && (best === null || p < best)) best = p
  }
  return best
}

/** Cheapest price to buy an item: at the craft city, else cheapest anywhere. */
function buyPrice(
  priceAt: PriceAt,
  itemId: string,
  craftCity: string,
  cities: string[],
): number | null {
  return priceAt(itemId, craftCity) ?? minAcross(priceAt, itemId, cities)
}

/**
 * Profit per enchant level (.0–.3), per sell city. Pure: all market data comes through
 * `priceAt`, so this is fully unit-testable. Missing ingredient prices yield a null
 * investment (and thus null profit) rather than a fake "free" cost.
 */
export function cookingProfit(params: CookingParams): EnchantResult[] {
  const { recipe, craftCity, cities, premium, batches, priceAt, itemValueFor, stationFeePer100 } =
    params
  const tier = parseTier(recipe.id) ?? 4
  const tax = totalSalesTax(premium)

  // Ingredient cost per batch (buy at craft city or cheapest). Null if any ingredient
  // has no price anywhere.
  let ingredientsCost = 0
  let ingredientsKnown = true
  for (const ing of recipe.ingredientes) {
    const p = buyPrice(priceAt, ing.id, craftCity, cities)
    if (p == null) ingredientsKnown = false
    else ingredientsCost += p * ing.qty
  }

  const energyCost = recipe.avalon
    ? (buyPrice(priceAt, AVALON_ENERGY_ID, craftCity, cities) ?? 0) * recipe.energiaAva
    : 0

  return [0, 1, 2, 3].map((enchant) => {
    const mealId = mealItemId(recipe.id, enchant)
    const sauceCost =
      enchant > 0 ? (buyPrice(priceAt, SAUCE_IDS[enchant], craftCity, cities) ?? 0) : 0
    const stationCost = itemValueFor(tier, enchant) * 0.001125 * stationFeePer100

    const investment = ingredientsKnown
      ? (ingredientsCost + sauceCost + energyCost + stationCost) * batches
      : null

    const cityProfits: CityProfit[] = cities.map((city) => {
      const sellPrice = priceAt(mealId, city)
      if (sellPrice == null || investment == null) {
        return { city, sellPrice, profit: null }
      }
      const netIncome = sellPrice * recipe.unidades * batches * (1 - tax)
      return { city, sellPrice, profit: netIncome - investment }
    })

    let bestProfit: number | null = null
    let bestCity: string | null = null
    for (const cp of cityProfits) {
      if (cp.profit != null && (bestProfit === null || cp.profit > bestProfit)) {
        bestProfit = cp.profit
        bestCity = cp.city
      }
    }

    return { enchant, mealId, investment, sauceCost, cityProfits, bestProfit, bestCity }
  })
}

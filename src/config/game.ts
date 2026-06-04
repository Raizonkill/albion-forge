/** Royal cities + the two market hubs the calculators query. */
export const CITIES = [
  'Martlock',
  'Bridgewatch',
  'Lymhurst',
  'Fort Sterling',
  'Thetford',
  'Caerleon',
  'Brecilien',
  'Black Market',
] as const

export type City = (typeof CITIES)[number]

/**
 * Market tax model (post-2023). Setup fee always applies to sell orders;
 * sales tax is reduced with Premium.
 */
export const TAX = {
  setupFee: 0.025,
  salesTaxPremium: 0.04,
  salesTaxNonPremium: 0.08,
} as const

export function totalSalesTax(premium: boolean): number {
  return TAX.setupFee + (premium ? TAX.salesTaxPremium : TAX.salesTaxNonPremium)
}

/** Freshness threshold for market data, in milliseconds (prototype used 48h). */
export const MAX_DATA_AGE_MS = 48 * 60 * 60 * 1000

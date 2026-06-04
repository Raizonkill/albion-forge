/**
 * Crafting/refining station usage fee.
 *
 * fee = itemValue × FEE_CONSTANT × stationFeePer100
 *
 * `itemValue` is the item's nutrition-based base value (from game data, NOT its market
 * price — fixing a prototype bug where cooking used the market price here). `stationFeePer100`
 * is the fee the station owner sets ("Nutrición ×100" in the prototype UI), default ~350.
 */
export const STATION_FEE_CONSTANT = 0.001125

export function stationFeeUnit(itemValue: number, stationFeePer100: number): number {
  return itemValue * STATION_FEE_CONSTANT * stationFeePer100
}

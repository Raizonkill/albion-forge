import { totalSalesTax } from '@/config/game'
import { effectiveReturnRate, type ReturnRateInput } from './returnRate'
import { stationFeeUnit } from './stationFee'

export interface RefineProfitInput {
  /** Price of one raw material unit (e.g. one ore). */
  rawPrice: number
  /** Quantity of raw material per refined unit. */
  rawQty: number
  /** Price of one previous-tier refined unit (0 if none, e.g. T2). */
  prevPrice: number
  /** Quantity of previous-tier refined material per refined unit. */
  prevQty: number
  /** Sell price of the refined product. */
  sellPrice: number
  /** Nutrition-based item value for the station fee. */
  itemValue: number
  /** Station fee rate ("Nutrición ×100"). */
  stationFeePer100: number
  premium: boolean
  returnRate: ReturnRateInput
  /** Units to refine. */
  quantity: number
}

export interface RefineProfitBreakdown {
  effectiveReturnRate: number
  /** Gross material cost per unit, before returns. */
  materialsCostUnit: number
  /** Material cost per unit after the return rate. */
  effectiveMaterialsCostUnit: number
  stationFeeUnit: number
  totalCostUnit: number
  taxRate: number
  netIncomeUnit: number
  profitUnit: number
  /** Margin on net income, as a fraction (profit / investment). */
  marginUnit: number
  investmentBatch: number
  profitBatch: number
}

/**
 * Net profit of refining, batch-aware. Both raw and previous-tier materials are
 * subject to the resource return rate — the whole point Albion players optimize for.
 */
export function refineProfit(input: RefineProfitInput): RefineProfitBreakdown {
  const rrr = effectiveReturnRate(input.returnRate)

  const materialsCostUnit = input.rawPrice * input.rawQty + input.prevPrice * input.prevQty
  const effectiveMaterialsCostUnit = materialsCostUnit * (1 - rrr)
  const fee = stationFeeUnit(input.itemValue, input.stationFeePer100)
  const totalCostUnit = effectiveMaterialsCostUnit + fee

  const taxRate = totalSalesTax(input.premium)
  const netIncomeUnit = input.sellPrice * (1 - taxRate)
  const profitUnit = netIncomeUnit - totalCostUnit
  const marginUnit = totalCostUnit > 0 ? profitUnit / totalCostUnit : 0

  return {
    effectiveReturnRate: rrr,
    materialsCostUnit,
    effectiveMaterialsCostUnit,
    stationFeeUnit: fee,
    totalCostUnit,
    taxRate,
    netIncomeUnit,
    profitUnit,
    marginUnit,
    investmentBatch: totalCostUnit * input.quantity,
    profitBatch: profitUnit * input.quantity,
  }
}

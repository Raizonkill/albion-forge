/**
 * Resource Return Rate (RRR) — the real Albion model.
 *
 * The prototype hardcoded four magic numbers (0.152 / 0.367 / 0.435 / 0.539). Those are
 * just the four corners of one continuous function. Albion builds the *nominal* return
 * rate additively, then the *effective* fraction of materials you get back (already
 * accounting for the cascade of returned-then-reprocessed resources) is:
 *
 *     effective = nominal / (1 + nominal)
 *
 * Nominal components (royal-city refining):
 *   - base royal-city bonus        18%
 *   - matching resource bonus city +40%
 *   - focus                        +59%
 *
 * Check: (0.18)/(1.18)=0.152, (0.58)/(1.58)=0.367, (0.77)/(1.77)=0.435, (1.17)/(2.17)=0.539.
 * All four prototype values fall out exactly — and now any combination does too.
 */
export const BASE_RR_NOMINAL = 0.18
export const BONUS_CITY_NOMINAL = 0.4
export const FOCUS_NOMINAL = 0.59

export interface ReturnRateInput {
  /** Refining the matching resource in its bonus royal city (e.g. leather in Martlock). */
  bonusCity: boolean
  focus: boolean
  /** Extra nominal points (e.g. future specialization or daily bonus). Default 0. */
  extraNominal?: number
}

/** Sum of nominal return-rate contributions (the number the game shows you). */
export function nominalReturnRate({
  bonusCity,
  focus,
  extraNominal = 0,
}: ReturnRateInput): number {
  return (
    BASE_RR_NOMINAL +
    (bonusCity ? BONUS_CITY_NOMINAL : 0) +
    (focus ? FOCUS_NOMINAL : 0) +
    extraNominal
  )
}

/**
 * Effective fraction of materials returned (0–1), cascade included.
 * Multiply material cost by (1 - this) to get expected material spend.
 */
export function effectiveReturnRate(input: ReturnRateInput): number {
  const n = nominalReturnRate(input)
  return n / (1 + n)
}

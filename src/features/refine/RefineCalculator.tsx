import { useNavStore } from '@/app/store/navStore'
import { useServerStore } from '@/app/store/serverStore'
import { formatSilver } from '@/lib/utils'
import { Field, NumberField, Segmented, Toggle } from '@/shared/ui/controls'
import { PriceTable } from '@/features/market/components/PriceTable'
import {
  useMarketPricesMulti,
  cheapestBuy,
  bestSell,
} from '@/features/market/api/useMarketPricesMulti'
import type { SanitizedEntry } from '@/shared/types/market'
import { totalSalesTax } from '@/config/game'
import { RESOURCE_LIST, RESOURCES, type ResourceId } from './data/resources'
import { buildResourceId, getItemValue, getRefinementRecipe } from './data/refining'
import { refineProfit } from './calc/refineProfit'
import { effectiveReturnRate } from './calc/returnRate'
import { stationFeeUnit } from './calc/stationFee'
import { focusBase, focusPerUnit, type SpecLevels } from './calc/focusCost'
import { useRefineStore } from './store'

const TIERS = [2, 3, 4, 5, 6, 7, 8].map((t) => ({ value: t, label: `T${t}` }))
const ENCHANTS = [0, 1, 2, 3, 4].map((e) => ({ value: e, label: `.${e}` }))
const SPEC_TIERS: { key: keyof SpecLevels; label: string }[] = [
  { key: 't4', label: 'T4' },
  { key: 't5', label: 'T5' },
  { key: 't6', label: 'T6' },
  { key: 't7', label: 'T7' },
  { key: 't8', label: 'T8' },
]

/** Resolve the city used for a material: a forced pick if valid, else the auto best. */
function resolveCity(
  entries: SanitizedEntry[] | undefined,
  forced: string | null,
  mode: 'buy' | 'sell',
): { city: string; price: number } | null {
  if (forced) {
    const e = entries?.find((x) => x.city === forced)
    if (e?.usableSellPrice != null) return { city: forced, price: e.usableSellPrice }
  }
  return mode === 'sell' ? bestSell(entries) : cheapestBuy(entries)
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-surface-2 px-4 py-3">
      <span className="block text-[10px] uppercase tracking-wide text-text-muted">{label}</span>
      <strong className={`tabular text-base ${accent ?? ''}`}>{value}</strong>
    </div>
  )
}

function DRow({
  label,
  value,
  accent,
  bold,
}: {
  label: string
  value: string
  accent?: string
  bold?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between gap-2 ${
        bold ? 'border-t border-divider pt-1.5 font-bold' : 'text-text-muted'
      }`}
    >
      <span>{label}</span>
      <span className={`tabular ${accent ?? ''} ${bold ? '' : ''}`}>{value}</span>
    </div>
  )
}

export function RefineCalculator() {
  const close = useNavStore((s) => s.close)
  const server = useServerStore((s) => s.server)

  // All settings live in a persisted store so the configuration survives navigation + reload.
  const {
    resourceId,
    tier,
    enchant,
    bonusCity,
    focus,
    premium,
    stationFee,
    quantity,
    specs,
    forcedRaw,
    forcedPrev,
    forcedFinal,
    update,
  } = useRefineStore()

  const meta = RESOURCES[resourceId]
  const recipe = getRefinementRecipe(tier, enchant, resourceId)

  const rawId = buildResourceId(meta.rawStem, tier, enchant)
  const prevId =
    recipe.prevTier > 0
      ? buildResourceId(meta.refinedStem, recipe.prevTier, recipe.prevEnchant)
      : null
  const finalId = buildResourceId(meta.refinedStem, tier, enchant)

  const { data, isFetching, isError, error } = useMarketPricesMulti(
    [rawId, prevId, finalId],
    1,
  )

  const rawEntries = data?.[rawId]
  const prevEntries = prevId ? data?.[prevId] : undefined
  const finalEntries = data?.[finalId]

  const rawPick = resolveCity(rawEntries, forcedRaw, 'buy')
  const prevPick = resolveCity(prevEntries, forcedPrev, 'buy')
  const finalPick = resolveCity(finalEntries, forcedFinal, 'sell')

  const prevReady = !prevId || prevPick !== null
  const canCompute = rawPick !== null && finalPick !== null && prevReady

  const breakdown = canCompute
    ? refineProfit({
        rawPrice: rawPick!.price,
        rawQty: recipe.rawQty,
        prevPrice: prevPick?.price ?? 0,
        prevQty: recipe.prevQty,
        sellPrice: finalPick!.price,
        itemValue: getItemValue(tier, enchant),
        stationFeePer100: stationFee,
        premium,
        returnRate: { bonusCity, focus },
        quantity,
      })
    : null

  // Breakdown panel: line items + Sin Foco vs Con Foco comparison (return only differs).
  const desglose =
    canCompute && rawPick && finalPick
      ? (() => {
          const tax = totalSalesTax(premium)
          const rawCost = rawPick.price * recipe.rawQty * quantity
          const prevCost = (prevPick?.price ?? 0) * recipe.prevQty * quantity
          const totalMat = rawCost + prevCost
          const ingreso = finalPick.price * quantity * (1 - tax)
          const estacion = stationFeeUnit(getItemValue(tier, enchant), stationFee) * quantity
          const rrrSin = effectiveReturnRate({ bonusCity, focus: false })
          const rrrCon = effectiveReturnRate({ bonusCity, focus: true })
          const devSin = totalMat * rrrSin
          const devCon = totalMat * rrrCon
          return {
            rawCost,
            prevCost,
            totalMat,
            ingreso,
            estacion,
            rrrSin,
            rrrCon,
            devSin,
            devCon,
            profitSin: ingreso + devSin - totalMat - estacion,
            profitCon: ingreso + devCon - totalMat - estacion,
          }
        })()
      : null

  // Focus is a per-unit cost reduced by specialization. We always show the savings (so the
  // player can decide whether to use focus); it's only actually *spent* when focus is on.
  const focusBaseUnit = focusBase(tier, enchant)
  const focusUnit = focusPerUnit(tier, enchant, specs)
  const focusSavedUnit = focusBaseUnit - focusUnit
  const focusTotal = focusUnit * quantity
  const profitPerFocus =
    focus && breakdown && focusTotal > 0 ? breakdown.profitBatch / focusTotal : null

  const toggleForced = (
    key: 'forcedRaw' | 'forcedPrev' | 'forcedFinal',
    current: string | null,
    city: string,
  ) => update({ [key]: current === city ? null : city })

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={close}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2 text-xs transition-colors hover:border-primary/50"
        >
          ← Volver al menú
        </button>
        <div>
          <h1 className="font-display text-xl">Refinamiento Optimizado</h1>
          <p className="text-sm text-text-muted">
            RRR + foco reales · precios en vivo en{' '}
            <span className="font-bold uppercase text-primary">{server}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Inputs */}
        <aside className="grid h-max gap-4 rounded-xl border border-white/8 bg-surface p-5">
          <Field label="Recurso">
            <select
              value={resourceId}
              onChange={(e) => update({ resourceId: e.target.value as ResourceId })}
              className="w-full rounded-md border border-border bg-surface-2 px-3.5 py-2.5 text-sm outline-none focus:border-primary/60"
            >
              {RESOURCE_LIST.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label} (bono: {r.bonusCity})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Tier">
            <Segmented options={TIERS} value={tier} onChange={(v) => update({ tier: v })} />
          </Field>
          <Field label="Encantamiento">
            <Segmented
              options={ENCHANTS}
              value={enchant}
              onChange={(v) => update({ enchant: v })}
            />
          </Field>

          {/* Grouped options — fixes the previously scattered toggles. */}
          <div className="grid gap-2 rounded-lg border border-border bg-surface-2/40 p-3">
            <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Opciones
            </span>
            <Toggle
              label={`Refinar en ${meta.bonusCity} (+40%)`}
              checked={bonusCity}
              onChange={(v) => update({ bonusCity: v })}
            />
            <Toggle
              label="Con foco (+59% RRR)"
              checked={focus}
              onChange={(v) => update({ focus: v })}
            />
            <Toggle label="Premium" checked={premium} onChange={(v) => update({ premium: v })} />
          </div>

          <div className="grid gap-2 rounded-lg border border-border bg-surface-2/40 p-3">
            <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Maestrías de refinamiento (0–100)
            </span>
            <div className="grid grid-cols-5 gap-2">
              {SPEC_TIERS.map(({ key, label }) => (
                  <label key={key} className="grid gap-1 text-center">
                    <span className="text-[10px] text-text-muted">{label}</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={specs[key]}
                      onChange={(e) =>
                        update({
                          specs: {
                            ...specs,
                            [key]: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                          },
                        })
                      }
                      className="w-full rounded-md border border-border bg-surface px-1.5 py-2 text-center text-sm outline-none focus:border-primary/60"
                    />
                </label>
              ))}
            </div>
          </div>

          <NumberField
            label="Tasa estación (×100)"
            value={stationFee}
            onChange={(v) => update({ stationFee: v })}
          />
          <NumberField
            label="Cantidad a refinar"
            value={quantity}
            min={1}
            onChange={(v) => update({ quantity: v })}
          />
        </aside>

        {/* Results */}
        <section className="grid gap-4">
          {isError && (
            <div className="rounded-xl border border-error/40 bg-error/5 p-6 text-sm text-error">
              Error al consultar la API: {(error as Error).message}
            </div>
          )}

          <div className="rounded-xl border border-white/8 bg-surface p-5">
            <p className="text-[11px] uppercase tracking-wide text-text-muted">
              Profit neto estimado ({quantity} u)
            </p>
            {breakdown ? (
              <div
                className={`tabular text-3xl font-bold ${
                  breakdown.profitBatch >= 0 ? 'text-success' : 'text-error'
                }`}
              >
                {breakdown.profitBatch >= 0 ? '+' : ''}
                {formatSilver(breakdown.profitBatch)}
              </div>
            ) : (
              <div className="text-2xl font-bold text-text-faint">
                {isFetching ? 'Calculando…' : '— sin datos suficientes —'}
              </div>
            )}

            {breakdown && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Metric label="Inversión" value={formatSilver(breakdown.investmentBatch)} />
                <Metric
                  label="RRR efectivo"
                  value={`${(breakdown.effectiveReturnRate * 100).toFixed(1)}%`}
                  accent="text-primary"
                />
                <Metric
                  label="Coste estación"
                  value={formatSilver(breakdown.stationFeeUnit * quantity)}
                />
                <Metric label="Impuesto" value={`${(breakdown.taxRate * 100).toFixed(1)}%`} />
                <Metric
                  label="Margen"
                  value={`${(breakdown.marginUnit * 100).toFixed(1)}%`}
                  accent={breakdown.marginUnit >= 0 ? 'text-success' : 'text-error'}
                />
                <Metric
                  label="Profit / unidad"
                  value={formatSilver(breakdown.profitUnit)}
                  accent={breakdown.profitUnit >= 0 ? 'text-success' : 'text-error'}
                />
                <Metric label="Foco base / ítem" value={focusBaseUnit.toFixed(1)} />
                <Metric
                  label="Foco con maestría / ítem"
                  value={focusUnit.toFixed(1)}
                  accent="text-primary"
                />
                <Metric
                  label="Foco ahorrado / ítem"
                  value={`${focusSavedUnit.toFixed(1)} (${focusBaseUnit > 0 ? ((focusSavedUnit / focusBaseUnit) * 100).toFixed(0) : 0}%)`}
                  accent="text-success"
                />
                {focus && (
                  <>
                    <Metric label="Foco total (lote)" value={formatSilver(focusTotal)} />
                    <Metric
                      label="Profit / foco"
                      value={profitPerFocus != null ? profitPerFocus.toFixed(2) : '—'}
                      accent={
                        profitPerFocus != null && profitPerFocus >= 0
                          ? 'text-success'
                          : 'text-error'
                      }
                    />
                  </>
                )}
              </div>
            )}

            {breakdown && rawPick && finalPick && (
              <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm leading-relaxed">
                Comprar <strong>{recipe.rawQty}×</strong> {meta.rawStem} en{' '}
                <strong className="text-blue">{rawPick.city}</strong>
                {prevId && prevPick && (
                  <>
                    , comprar <strong>{recipe.prevQty}×</strong> {meta.refinedStem} T
                    {recipe.prevTier} en <strong className="text-blue">{prevPick.city}</strong>
                  </>
                )}
                , refinar en <strong className="text-primary">{meta.bonusCity}</strong>, y vender
                en <strong className="text-success">{finalPick.city}</strong>.
                <span className="mt-1 block text-xs text-text-muted">
                  Haz clic en cualquier fila de las tablas para fijar manualmente la ciudad.
                </span>
              </div>
            )}
          </div>

          {desglose && (
            <div className="grid gap-4 rounded-xl border border-white/8 bg-surface p-5">
              <h3 className="font-display text-base text-primary">
                Desglose · {quantity}× {meta.refinedStem} T{tier}.{enchant} ·{' '}
                {(totalSalesTax(premium) * 100).toFixed(1)}% impuesto
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-white/5 bg-surface-2 p-3 text-center">
                  <span className="block text-xs text-text-muted">
                    Sin foco ({(desglose.rrrSin * 100).toFixed(1)}%)
                  </span>
                  <strong
                    className={`tabular text-lg ${
                      desglose.profitSin >= 0 ? 'text-success' : 'text-error'
                    }`}
                  >
                    {desglose.profitSin >= 0 ? '+' : ''}
                    {formatSilver(desglose.profitSin)}
                  </strong>
                </div>
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-center">
                  <span className="block text-xs text-text-muted">
                    Con foco ({(desglose.rrrCon * 100).toFixed(1)}%)
                  </span>
                  <strong
                    className={`tabular text-lg ${
                      desglose.profitCon >= 0 ? 'text-success' : 'text-error'
                    }`}
                  >
                    {desglose.profitCon >= 0 ? '+' : ''}
                    {formatSilver(desglose.profitCon)}
                  </strong>
                </div>
              </div>

              <div className="grid gap-1.5 text-sm">
                <DRow label="Costo materia prima" value={formatSilver(desglose.rawCost)} />
                {prevId && (
                  <DRow
                    label="Costo refinado anterior"
                    value={formatSilver(desglose.prevCost)}
                  />
                )}
                <DRow label="Total materiales" value={formatSilver(desglose.totalMat)} bold />
                <DRow
                  label={`Devolución sin foco (${(desglose.rrrSin * 100).toFixed(1)}%)`}
                  value={`+${formatSilver(desglose.devSin)}`}
                  accent="text-success"
                />
                <DRow
                  label={`Devolución con foco (${(desglose.rrrCon * 100).toFixed(1)}%)`}
                  value={`+${formatSilver(desglose.devCon)}`}
                  accent="text-success"
                />
                <DRow
                  label="Coste estación"
                  value={`−${formatSilver(desglose.estacion)}`}
                  accent="text-text-muted"
                />
                <DRow
                  label="Ingreso (tras impuesto)"
                  value={formatSilver(desglose.ingreso)}
                  bold
                />
              </div>

              <div className="rounded-lg border-l-2 border-primary bg-primary/5 p-3">
                <span className="block text-xs font-bold uppercase tracking-wide text-primary">
                  Fórmula
                </span>
                <p className="text-sm font-medium">
                  Profit = Ingreso + Devolución − Materiales − Estación
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  La devolución aplica solo al refinar en {meta.bonusCity} (ciudad del recurso).
                </p>
              </div>
            </div>
          )}

          {finalEntries && (
            <PriceSection
              title={`Venta — ${meta.refinedStem} T${tier}.${enchant}`}
              entries={finalEntries}
              mode="sell"
              selectedCity={finalPick?.city ?? null}
              onSelectCity={(c) => toggleForced('forcedFinal', forcedFinal, c)}
            />
          )}
          {rawEntries && (
            <PriceSection
              title={`Material bruto — ${meta.rawStem} T${tier}.${enchant} (×${recipe.rawQty})`}
              entries={rawEntries}
              selectedCity={rawPick?.city ?? null}
              onSelectCity={(c) => toggleForced('forcedRaw', forcedRaw, c)}
            />
          )}
          {prevId && prevEntries && (
            <PriceSection
              title={`Refinado previo — ${meta.refinedStem} T${recipe.prevTier} (×${recipe.prevQty})`}
              entries={prevEntries}
              selectedCity={prevPick?.city ?? null}
              onSelectCity={(c) => toggleForced('forcedPrev', forcedPrev, c)}
            />
          )}
        </section>
      </div>
    </div>
  )
}

function PriceSection({
  title,
  entries,
  mode = 'buy',
  selectedCity,
  onSelectCity,
}: {
  title: string
  entries: SanitizedEntry[]
  mode?: 'buy' | 'sell'
  selectedCity?: string | null
  onSelectCity?: (city: string) => void
}) {
  return (
    <div className="grid gap-2">
      <h3 className="font-display text-base">{title}</h3>
      <PriceTable
        entries={entries}
        mode={mode}
        selectedCity={selectedCity}
        onSelectCity={onSelectCity}
      />
    </div>
  )
}

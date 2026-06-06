import { useMemo } from 'react'
import { useNavStore } from '@/app/store/navStore'
import { useServerStore } from '@/app/store/serverStore'
import { CITIES } from '@/config/game'
import { formatSilver } from '@/lib/utils'
import { Field, NumberField, Toggle } from '@/shared/ui/controls'
import { ItemIcon } from '@/shared/ui/ItemIcon'
import { useMarketPricesMulti } from '@/features/market/api/useMarketPricesMulti'
import { COOKING_RECIPES, SAUCE_IDS, mealItemId } from './data/recipes'
import { COOKING_SPECS, hasResourceReturn } from './specs'
import { cookingProfit } from './calc/cookingProfit'
import { focusPerCraft } from './calc/cookingFocus'
import { effectiveReturnRate } from '@/features/refine/calc/returnRate'
import { useCookingStore } from './store'

const CRAFT_CITIES = CITIES.filter((c) => c !== 'Black Market')
const ENCHANT_LABELS = ['.0 Base', '.1 Salsa', '.2 Salsa', '.3 Salsa']
const ENCHANT_COLORS = ['text-text', 'text-success', 'text-blue', 'text-primary']
const SAUCE_LABELS = ['', 'Salsa básica', 'Salsa especial', 'Salsa extravagante']
const AVALON_NAME = 'Energía Avaloniana'

export function CookingCalculator() {
  const close = useNavStore((s) => s.close)
  const server = useServerStore((s) => s.server)
  const {
    recipeId,
    craftCity,
    premium,
    focus,
    stationFee,
    batches,
    branchSpecs,
    chefBase,
    update,
    setBranchSpec,
  } = useCookingStore()

  const recipe = COOKING_RECIPES.find((r) => r.id === recipeId) ?? COOKING_RECIPES[0]

  // Focus model: E = 250·principal + 30·ΣallSpecs. The ×30 sum includes EVERY cooking
  // spec — all meal branches (incl. the principal), Butcher, Ingredients and the Chef node.
  const principalSpec = branchSpecs[recipe.tipo] ?? 0
  const allSpecsSum =
    COOKING_SPECS.reduce((sum, b) => sum + (branchSpecs[b] ?? 0), 0) + chefBase

  // Resource return: using focus raises the return rate (and so lowers material cost).
  const returnRate = effectiveReturnRate({ bonusCity: false, focus })
  const keep = 1 - returnRate

  // Every id this recipe touches: ingredients (incl. avalon energy), the meal enchants
  // it actually has, and the sauces those enchants use.
  const ids = useMemo(() => {
    const levels = recipe.focusByEnchant.map((_f, i) => i)
    const meals = levels.map((e) => mealItemId(recipe.id, e))
    const sauces = levels.filter((e) => (recipe.sauceByEnchant[e] ?? 0) > 0).map((e) => SAUCE_IDS[e])
    const ing = recipe.ingredientes.map((i) => i.id)
    return [...new Set([...ing, ...meals, ...sauces])]
  }, [recipe])

  const { data, isFetching, isError, error } = useMarketPricesMulti(ids, 1)

  const priceAt = useMemo(() => {
    const maps: Record<string, Record<string, number>> = {}
    for (const [id, entries] of Object.entries(data ?? {})) {
      const cityMap: Record<string, number> = {}
      for (const e of entries) if (e.usableSellPrice != null) cityMap[e.city] = e.usableSellPrice
      maps[id] = cityMap
    }
    return (itemId: string, city: string): number | null => maps[itemId]?.[city] ?? null
  }, [data])

  // Buy price for an item: at the craft city, else cheapest anywhere (same rule the cost calc uses).
  const buyPrice = (itemId: string): number | null => {
    const atCraft = priceAt(itemId, craftCity)
    if (atCraft != null) return atCraft
    let best: number | null = null
    for (const c of CITIES) {
      const p = priceAt(itemId, c)
      if (p != null && (best === null || p < best)) best = p
    }
    return best
  }

  // Net base-material cost after return. Avalon energy / rare fish are paid in full.
  const baseGross = recipe.ingredientes.reduce(
    (acc, ing) => {
      const u = buyPrice(ing.id)
      if (u == null) return { ...acc, known: false }
      const cost = u * ing.qty
      return hasResourceReturn(ing.id)
        ? { ret: acc.ret + cost, non: acc.non, known: acc.known }
        : { ret: acc.ret, non: acc.non + cost, known: acc.known }
    },
    { ret: 0, non: 0, known: true },
  )
  const netBaseTotal = baseGross.known ? baseGross.ret * keep + baseGross.non : null

  const results = useMemo(
    () =>
      cookingProfit({
        recipe,
        craftCity,
        cities: [...CITIES],
        premium,
        batches,
        priceAt,
        stationFeePer100: stationFee,
        returnRate,
      }),
    [recipe, craftCity, premium, batches, priceAt, stationFee, returnRate],
  )

  const best = results.reduce<{ profit: number; enchant: number; city: string } | null>(
    (acc, r) =>
      r.bestProfit != null && (acc === null || r.bestProfit > acc.profit)
        ? { profit: r.bestProfit, enchant: r.enchant, city: r.bestCity! }
        : acc,
    null,
  )

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
          <h1 className="font-display text-xl">Calculadora de Cocina</h1>
          <p className="text-sm text-text-muted">
            Profit por encantamiento + foco · precios en vivo en{' '}
            <span className="font-bold uppercase text-primary">{server}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Inputs */}
        <aside className="grid h-max gap-4 rounded-xl border border-white/8 bg-surface p-5">
          <Field label="Receta">
            <select
              value={recipeId}
              onChange={(e) => update({ recipeId: e.target.value })}
              className="w-full rounded-md border border-border bg-surface-2 px-3.5 py-2.5 text-sm outline-none focus:border-primary/60"
            >
              {COOKING_RECIPES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} · {r.tipo}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Ciudad de fabricación">
            <select
              value={craftCity}
              onChange={(e) => update({ craftCity: e.target.value })}
              className="w-full rounded-md border border-border bg-surface-2 px-3.5 py-2.5 text-sm outline-none focus:border-primary/60"
            >
              {CRAFT_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-2 rounded-lg border border-border bg-surface-2/40 p-3">
            <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Opciones
            </span>
            <Toggle label="Con foco" checked={focus} onChange={(v) => update({ focus: v })} />
            <Toggle label="Premium" checked={premium} onChange={(v) => update({ premium: v })} />
          </div>

          {focus && (
            <div className="grid gap-2 rounded-lg border border-border bg-surface-2/40 p-3">
              <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Maestrías de cocina (0–100)
              </span>
              <div className="grid grid-cols-2 gap-2">
                {COOKING_SPECS.map((b) => {
                  const isPrincipal = b === recipe.tipo
                  return (
                    <label key={b} className="grid gap-1">
                      <span
                        className={`text-[10px] ${
                          isPrincipal ? 'font-bold text-primary' : 'text-text-muted'
                        }`}
                      >
                        {b}
                        {isPrincipal && ' ·principal'}
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={branchSpecs[b] ?? 0}
                        onChange={(e) =>
                          setBranchSpec(b, Math.min(100, Math.max(0, Number(e.target.value) || 0)))
                        }
                        className={`w-full rounded-md border bg-surface px-2 py-2 text-sm outline-none focus:border-primary/60 ${
                          isPrincipal ? 'border-primary/50' : 'border-border'
                        }`}
                      />
                    </label>
                  )
                })}
                <label className="grid gap-1">
                  <span className="text-[10px] text-text-muted">Chef (base)</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={chefBase}
                    onChange={(e) =>
                      update({ chefBase: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })
                    }
                    className="w-full rounded-md border border-border bg-surface px-2 py-2 text-sm outline-none focus:border-primary/60"
                  />
                </label>
              </div>
            </div>
          )}

          <NumberField
            label="Tasa estación (×100)"
            value={stationFee}
            onChange={(v) => update({ stationFee: v })}
          />
          <NumberField
            label="Batches"
            value={batches}
            min={1}
            onChange={(v) => update({ batches: v })}
          />

          {/* Ingredients + prices (per craft) */}
          <div className="grid gap-2 border-t border-divider pt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Ingredientes (.0) / crafteo
              </span>
              <span className="text-[10px] text-text-faint">en {craftCity}</span>
            </div>
            {recipe.ingredientes.map((ing) => {
              const unit = buyPrice(ing.id)
              const sub = unit != null ? unit * ing.qty : null
              const name = ing.id === 'QUESTITEM_TOKEN_AVALON' ? AVALON_NAME : ing.name
              return (
                <div key={ing.id} className="flex items-center gap-2 text-sm">
                  <ItemIcon id={ing.id} size={28} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{name}</span>
                    <span className="block text-[10px] text-text-faint">
                      {ing.qty}× {unit != null ? `@ ${formatSilver(unit)}` : '· sin precio'}
                    </span>
                  </span>
                  <span className="tabular font-medium">
                    {sub != null ? formatSilver(sub) : '—'}
                  </span>
                </div>
              )
            })}

            {recipe.sauceByEnchant.some((q) => q > 0) && (
              <div className="mt-1 grid gap-2 border-t border-divider pt-2">
                <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Salsas (por nivel)
                </span>
                {recipe.sauceByEnchant.map((qty, lvl) => {
                  if (lvl === 0 || qty <= 0) return null
                  const sid = SAUCE_IDS[lvl]
                  const unit = buyPrice(sid)
                  const sub = unit != null ? unit * qty : null
                  return (
                    <div key={lvl} className="flex items-center gap-2 text-sm">
                      <ItemIcon id={sid} size={28} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">
                          .{lvl} {SAUCE_LABELS[lvl]}
                        </span>
                        <span className="block text-[10px] text-text-faint">
                          {qty}× {unit != null ? `@ ${formatSilver(unit)}` : '· sin precio'}
                        </span>
                      </span>
                      <span className="tabular font-medium">
                        {sub != null ? formatSilver(sub) : '—'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Materials actually consumed, after the resource return */}
          <div className="grid gap-2 rounded-lg border border-success/20 bg-success/5 p-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Materiales a comprar ({batches} crafteos)
              </span>
              <span className="text-[10px] font-bold text-success">
                devolución {(returnRate * 100).toFixed(1)}%
              </span>
            </div>
            {recipe.ingredientes.map((ing) => {
              const name = ing.id === 'QUESTITEM_TOKEN_AVALON' ? AVALON_NAME : ing.name
              const returns = hasResourceReturn(ing.id)
              const netQty = (returns ? ing.qty * keep : ing.qty) * batches
              return (
                <div
                  key={ing.id}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="min-w-0 flex-1 truncate text-text-muted">
                    {name}
                    {!returns && <span className="ml-1 text-text-faint">(sin retorno)</span>}
                  </span>
                  <span className="tabular">
                    {formatSilver(netQty)}{' '}
                    <span className="text-text-faint">de {formatSilver(ing.qty * batches)}</span>
                  </span>
                </div>
              )
            })}
            <div className="mt-1 flex items-center justify-between border-t border-divider pt-2 text-sm">
              <span className="font-medium">Coste neto materiales (.0)</span>
              <span className="tabular font-bold text-success">
                {netBaseTotal != null ? formatSilver(netBaseTotal * batches) : '—'}
              </span>
            </div>
          </div>
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
              Mejor profit ({batches} crafteos · {recipe.output} u/crafteo
              {recipe.output === 1 ? ' · receta de pescado' : ''})
            </p>
            {best ? (
              <>
                <div
                  className={`tabular text-3xl font-bold ${
                    best.profit >= 0 ? 'text-success' : 'text-error'
                  }`}
                >
                  {best.profit >= 0 ? '+' : ''}
                  {formatSilver(best.profit)}
                </div>
                <p className="mt-1 text-sm text-text-muted">
                  Encantamiento <strong className="text-primary">.{best.enchant}</strong>, vender en{' '}
                  <strong className="text-success">{best.city}</strong>, fabricar en{' '}
                  <strong className="text-primary">{craftCity}</strong>.
                </p>
              </>
            ) : (
              <div className="text-2xl font-bold text-text-faint">
                {isFetching ? 'Calculando…' : '— sin datos suficientes —'}
              </div>
            )}
          </div>

          {results.map((r) => {
            const focusCraft = focus
              ? focusPerCraft(recipe.focusByEnchant[r.enchant], principalSpec, allSpecsSum)
              : 0
            const focusTotal = focusCraft * batches
            const profitPerFocus =
              r.bestProfit != null && focusTotal > 0 ? r.bestProfit / focusTotal : null
            return (
              <div key={r.enchant} className="rounded-xl border border-white/8 bg-surface">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-divider px-4 py-3">
                  <ItemIcon id={r.mealId} size={32} />
                  <span className={`font-bold ${ENCHANT_COLORS[r.enchant]}`}>
                    {ENCHANT_LABELS[r.enchant]}
                  </span>
                  {r.bestProfit != null ? (
                    <span
                      className={`tabular text-sm font-bold ${
                        r.bestProfit >= 0 ? 'text-success' : 'text-error'
                      }`}
                    >
                      mejor {r.bestProfit >= 0 ? '+' : ''}
                      {formatSilver(r.bestProfit)} · {r.bestCity}
                    </span>
                  ) : (
                    <span className="text-xs text-text-faint">sin datos</span>
                  )}
                  <span className="text-xs text-text-muted">
                    Inversión: {r.investment != null ? formatSilver(r.investment) : '—'}
                  </span>
                  {focus && (
                    <span className="text-xs text-text-muted">
                      Foco: {formatSilver(focusTotal)}{' '}
                      {profitPerFocus != null && (
                        <span className={profitPerFocus >= 0 ? 'text-success' : 'text-error'}>
                          · {profitPerFocus.toFixed(1)}/foco
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <div className="overflow-auto">
                  <table className="tabular w-full border-collapse text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-wide text-text-muted">
                        <th className="px-4 py-2 text-left font-bold">Ciudad venta</th>
                        <th className="px-4 py-2 text-right font-bold">Precio</th>
                        <th className="px-4 py-2 text-right font-bold">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.cityProfits.map((cp) => (
                        <tr key={cp.city} className="border-t border-divider">
                          <td className="px-4 py-2 font-medium">
                            {cp.city}
                            {cp.city === r.bestCity && (
                              <span className="ml-2 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                                mejor
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {cp.sellPrice != null ? (
                              formatSilver(cp.sellPrice)
                            ) : (
                              <span className="text-text-faint">—</span>
                            )}
                          </td>
                          <td
                            className={`px-4 py-2 text-right font-medium ${
                              cp.profit == null
                                ? 'text-text-faint'
                                : cp.profit >= 0
                                  ? 'text-success'
                                  : 'text-error'
                            }`}
                          >
                            {cp.profit != null
                              ? `${cp.profit >= 0 ? '+' : ''}${formatSilver(cp.profit)}`
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </section>
      </div>
    </div>
  )
}

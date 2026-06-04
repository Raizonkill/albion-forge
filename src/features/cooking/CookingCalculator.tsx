import { useMemo } from 'react'
import { useNavStore } from '@/app/store/navStore'
import { useServerStore } from '@/app/store/serverStore'
import { CITIES } from '@/config/game'
import { formatSilver } from '@/lib/utils'
import { Field, NumberField, Toggle } from '@/shared/ui/controls'
import { ItemIcon } from '@/shared/ui/ItemIcon'
import { useMarketPricesMulti } from '@/features/market/api/useMarketPricesMulti'
import { COOKING_BRANCHES, COOKING_RECIPES, SAUCE_IDS, mealItemId } from './data/recipes'
import { cookingProfit } from './calc/cookingProfit'
import { focusPerCraft } from './calc/cookingFocus'
import { useCookingStore } from './store'

const CRAFT_CITIES = CITIES.filter((c) => c !== 'Black Market')
const ENCHANT_LABELS = ['.0 Base', '.1 Salsa', '.2 Salsa', '.3 Salsa']
const ENCHANT_COLORS = ['text-text', 'text-success', 'text-blue', 'text-primary']

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

  // Focus model: principal = this dish's branch (weight 2.8); other = sum of the rest
  // of the cooking tree + the general Chef node (weight 0.3).
  const principalSpec = branchSpecs[recipe.tipo] ?? 0
  const otherSpecsSum =
    COOKING_BRANCHES.reduce(
      (sum, b) => (b === recipe.tipo ? sum : sum + (branchSpecs[b] ?? 0)),
      0,
    ) + chefBase

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
      }),
    [recipe, craftCity, premium, batches, priceAt, stationFee],
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
                {COOKING_BRANCHES.map((b) => {
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

          {/* Ingredient reference */}
          <div className="grid gap-2 border-t border-divider pt-3">
            <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Ingredientes / batch
            </span>
            {recipe.ingredientes.map((ing) => (
              <div key={ing.id} className="flex items-center gap-2 text-sm">
                <ItemIcon id={ing.id} size={28} />
                <span className="flex-1 truncate text-text-muted">{ing.name}</span>
                <span className="tabular">{ing.qty}×</span>
              </div>
            ))}
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
              ? focusPerCraft(recipe.focusByEnchant[r.enchant], principalSpec, otherSpecsSum)
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

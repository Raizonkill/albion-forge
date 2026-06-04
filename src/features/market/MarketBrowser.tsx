import { useState } from 'react'
import { useNavStore } from '@/app/store/navStore'
import { useServerStore } from '@/app/store/serverStore'
import { parseTier, type GameItem } from '@/shared/game-data/items'
import { ItemIcon } from '@/shared/ui/ItemIcon'
import { cn } from '@/lib/utils'
import { ItemSearch } from './components/ItemSearch'
import { PriceTable } from './components/PriceTable'
import { useMarketPrices } from './api/useMarketPrices'

const QUALITIES = [
  { v: 1, label: 'Normal' },
  { v: 2, label: 'Buena' },
  { v: 3, label: 'Excepcional' },
  { v: 4, label: 'Excelente' },
  { v: 5, label: 'Obra maestra' },
] as const

export function MarketBrowser() {
  const close = useNavStore((s) => s.close)
  const server = useServerStore((s) => s.server)
  const [item, setItem] = useState<GameItem | null>(null)
  const [quality, setQuality] = useState(1)

  const { data, isFetching, isError, error } = useMarketPrices(item?.id ?? null, quality)
  const tier = item ? parseTier(item.id) : null
  const hasAnyData = data?.some((e) => e.status !== 'no_data')

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
          <h1 className="font-display text-xl">Explorador de Mercado</h1>
          <p className="text-sm text-text-muted">
            Precios en vivo en <span className="font-bold uppercase text-primary">{server}</span>{' '}
            · frescura del dato incluida
          </p>
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border border-white/8 bg-surface p-5">
        <ItemSearch onSelect={setItem} />

        {item && (
          <div className="flex flex-wrap items-center gap-4 border-t border-divider pt-4">
            <ItemIcon id={item.id} quality={quality} size={56} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate font-display text-lg">{item.es}</h2>
                {tier && (
                  <span className="rounded bg-primary/15 px-1.5 py-0.5 text-xs font-bold text-primary">
                    T{tier}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-faint">{item.id}</p>
            </div>

            <div className="ml-auto flex flex-wrap gap-1 rounded-md border border-border bg-surface-2 p-1">
              {QUALITIES.map((q) => (
                <button
                  key={q.v}
                  type="button"
                  onClick={() => setQuality(q.v)}
                  className={cn(
                    'rounded px-2.5 py-1.5 text-xs font-medium transition-colors',
                    q.v === quality
                      ? 'bg-primary text-black'
                      : 'text-text-muted hover:text-text',
                  )}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {!item && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-text-muted">
          Busca un item arriba para ver sus precios por ciudad.
        </div>
      )}

      {item && (
        <section className="grid gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg">Precios por ciudad</h3>
            {isFetching && <span className="text-xs text-text-muted">Actualizando…</span>}
          </div>

          {isError && (
            <div className="rounded-xl border border-error/40 bg-error/5 p-6 text-sm text-error">
              Error al consultar la API: {(error as Error).message}
            </div>
          )}

          {!isError && data && !hasAnyData && !isFetching && (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-text-muted">
              No hay datos de mercado para este item/calidad. Prueba otra calidad o un item más
              común.
            </div>
          )}

          {!isError && data && hasAnyData && <PriceTable entries={data} />}

          {!isError && !data && isFetching && (
            <div className="rounded-xl border border-white/8 bg-surface p-10 text-center text-text-muted">
              Consultando precios…
            </div>
          )}
        </section>
      )}
    </div>
  )
}

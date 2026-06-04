import { useMemo, useState } from 'react'
import { useItems, searchItems, parseTier, type GameItem } from '@/shared/game-data/items'
import { ItemIcon } from '@/shared/ui/ItemIcon'

export function ItemSearch({ onSelect }: { onSelect: (item: GameItem) => void }) {
  const { data: items, isLoading, isError } = useItems()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const results = useMemo(
    () => (items ? searchItems(items, query) : []),
    [items, query],
  )

  return (
    <div className="relative">
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-muted">
        Buscar item
      </label>
      <input
        type="text"
        value={query}
        disabled={isLoading || isError}
        placeholder={
          isLoading ? 'Cargando índice de items…' : 'Ej. Bolsa, Cuero, T6 espada…'
        }
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        className="w-full rounded-md border border-border bg-surface-2 px-3.5 py-3 text-sm outline-none focus:border-primary/60"
      />

      {isError && (
        <p className="mt-1 text-xs text-error">No se pudo cargar el índice de items.</p>
      )}

      {open && results.length > 0 && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <ul className="absolute z-40 mt-1 max-h-80 w-full overflow-auto rounded-md border border-border bg-surface-2 shadow-[var(--shadow-md)]">
            {results.map((item) => {
              const tier = parseTier(item.id)
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(item)
                      setQuery(item.es)
                      setOpen(false)
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-primary/10"
                  >
                    <ItemIcon id={item.id} size={32} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{item.es}</span>
                      <span className="block truncate text-xs text-text-faint">
                        {item.id}
                      </span>
                    </span>
                    {tier && (
                      <span className="rounded bg-primary/15 px-1.5 py-0.5 text-xs font-bold text-primary">
                        T{tier}
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

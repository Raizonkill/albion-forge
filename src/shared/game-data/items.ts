import { useQuery } from '@tanstack/react-query'

export interface GameItem {
  id: string
  en: string
  es: string
}

/** Loads the normalized item index built by scripts/build-items.mjs (public/data/items.json). */
async function loadItems(): Promise<GameItem[]> {
  const res = await fetch('/data/items.json')
  if (!res.ok) throw new Error(`No se pudo cargar el índice de items (${res.status})`)
  return (await res.json()) as GameItem[]
}

/** Static data — never goes stale within a session. */
export function useItems() {
  return useQuery({
    queryKey: ['game-items'],
    queryFn: loadItems,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

/** Tier digit (1–8) parsed from a UniqueName like "T4_BAG", or null. */
export function parseTier(id: string): number | null {
  const m = /^T([1-8])_/.exec(id)
  return m ? Number(m[1]) : null
}

function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function norm(s: string): string {
  return stripDiacritics(s.toLowerCase()).trim()
}

/**
 * Filter items by a query against Spanish name, English name, or raw id.
 * Returns the top `limit` matches, prioritizing names that start with the query.
 */
export function searchItems(items: GameItem[], query: string, limit = 40): GameItem[] {
  const q = norm(query)
  if (q.length < 2) return []

  const scored: { item: GameItem; score: number }[] = []
  for (const item of items) {
    const es = norm(item.es)
    const en = norm(item.en)
    const id = item.id.toLowerCase()

    let score = -1
    if (es.startsWith(q) || en.startsWith(q)) score = 3
    else if (es.includes(q) || en.includes(q)) score = 2
    else if (id.includes(q)) score = 1

    if (score >= 0) scored.push({ item, score })
  }

  scored.sort((a, b) => b.score - a.score || a.item.es.localeCompare(b.item.es))
  return scored.slice(0, limit).map((s) => s.item)
}

// Downloads the Albion `ao-bin-dumps` localized item dump and normalizes it into a
// small searchable index (id + EN/ES names) under public/data/items.json.
//
// Run once (and after game patches): `npm run data:items`.
// Heavy network op (~15MB download) → produces a ~1MB asset the app actually ships.
import { writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const SOURCE =
  'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json'
// Full ItemData — used to flag which items have quality variants (maxqualitylevel > 1).
const FULL_SOURCE = 'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/items.json'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, '../public/data')
const OUT_FILE = resolve(OUT_DIR, 'items.json')

// Only tradeable game items (T1..T8 prefix). Skips quest/internal entries to keep size down.
const TRADEABLE = /^T[1-8]_/

/** Build the set of item ids that have quality variants (maxqualitylevel > 1). */
async function fetchQualitySet() {
  const res = await fetch(FULL_SOURCE)
  if (!res.ok) throw new Error(`Full dump download failed: ${res.status}`)
  const data = await res.json()
  const set = new Set()
  for (const items of Object.values(data.items)) {
    if (!Array.isArray(items)) continue
    for (const it of items) {
      if (it && Number(it['@maxqualitylevel'] ?? 1) > 1) set.add(it['@uniquename'])
    }
  }
  return set
}

function normalize(raw, qualitySet) {
  const out = []
  for (const entry of raw) {
    const id = entry?.UniqueName
    const names = entry?.LocalizedNames
    if (!id || !names || !TRADEABLE.test(id)) continue
    const en = names['EN-US']
    const es = names['ES-ES']
    if (!en && !es) continue
    const item = { id, en: en ?? es, es: es ?? en }
    if (qualitySet.has(id.split('@')[0])) item.q = 1
    out.push(item)
  }
  return out
}

async function main() {
  console.log(`Fetching ${SOURCE} ...`)
  const res = await fetch(SOURCE)
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`)
  const raw = await res.json()
  console.log(`Downloaded ${raw.length} raw entries.`)

  console.log(`Fetching quality data from ${FULL_SOURCE} ...`)
  const qualitySet = await fetchQualitySet()
  console.log(`${qualitySet.size} items have quality variants.`)

  const items = normalize(raw, qualitySet)
  console.log(`Normalized to ${items.length} tradeable items.`)
  console.log('Sample normalized:', JSON.stringify(items.slice(0, 2)))

  await mkdir(OUT_DIR, { recursive: true })
  const json = JSON.stringify(items)
  await writeFile(OUT_FILE, json, 'utf8')
  console.log(`Wrote ${OUT_FILE} (${(json.length / 1024).toFixed(0)} KB)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

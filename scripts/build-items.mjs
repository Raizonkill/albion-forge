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

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, '../public/data')
const OUT_FILE = resolve(OUT_DIR, 'items.json')

// Only tradeable game items (T1..T8 prefix). Skips quest/internal entries to keep size down.
const TRADEABLE = /^T[1-8]_/

function normalize(raw) {
  const out = []
  for (const entry of raw) {
    const id = entry?.UniqueName
    const names = entry?.LocalizedNames
    if (!id || !names || !TRADEABLE.test(id)) continue
    const en = names['EN-US']
    const es = names['ES-ES']
    if (!en && !es) continue
    out.push({ id, en: en ?? es, es: es ?? en })
  }
  return out
}

async function main() {
  console.log(`Fetching ${SOURCE} ...`)
  const res = await fetch(SOURCE)
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`)
  const raw = await res.json()
  console.log(`Downloaded ${raw.length} raw entries.`)
  console.log('Sample raw entry:', JSON.stringify(raw[0]))

  const items = normalize(raw)
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

# Albion Forge

Calculadora avanzada de economía para **Albion Online** (servidor por defecto: Americas / West).
Inspirada funcionalmente en Albion Free Market, pero con arquitectura limpia, motor de
cálculo testeado y datos validados en el borde.

## Stack

- **Vite + React 19 + TypeScript** (strict, `erasableSyntaxOnly`)
- **TanStack Query** — estado de servidor, caché y rate-limit (180 req/min de la API)
- **Zustand** (persistido) — estado de cliente (servidor seleccionado)
- **Tailwind CSS v4** — sistema de diseño vía `@theme` (tokens portados del prototipo)
- **Zod** — validación de la API en el borde
- **Vitest + Testing Library** — tests del motor de cálculo y la capa de datos

## Fuentes de datos

- **Precios:** [Albion Online Data Project](https://www.albion-online-data.com/) — hosts
  `west` / `east` / `europe`. En dev se consumen por el **proxy de Vite** (`/aod/<server>`)
  para evitar CORS. Ver `vite.config.ts`.
- **Datos estáticos del juego** (items, recetas, valores base): `ao-bin-dumps` (pendiente,
  Fase 1). Iconos: `render.albiononline.com/v1/item/{id}.png`.

## Estructura

```
src/
  app/
    providers/     AppProviders (QueryClient)
    store/         serverStore (Zustand, persistido)
  config/          servers.ts, game.ts (ciudades, impuestos, constantes)
  shared/
    api/           client.ts (fetch + Zod), sanitize.ts (+ tests)
    types/         market.ts
  features/
    shell/         ServerSelector
    refine/  craft/  cooking/  market/   (próximas fases)
  lib/             utils (cn, formatSilver)
```

**Regla de oro:** la lógica de cálculo (`features/*/calc/`) es TypeScript puro, sin React ni
fetch — recibe números, devuelve números, y se cubre con *golden tests*.

## Scripts

```bash
npm run dev        # dev server (puerto 5173, con proxy a la API)
npm run test       # Vitest
npm run build      # tsc -b + vite build
npm run data:items # descarga ao-bin-dumps → public/data/items.json (~963 KB, 9690 items)
```

## Roadmap

- [x] **Fase 0 — Cimientos:** scaffold, proxy CORS, design system, store de servidor,
      capa de sanitización tipada (+5 tests), cliente Zod. Shell con selector de servidor.
- [x] **Fase 1 — Explorador de Mercado:** índice de items (`data:items`), buscador con
      búsqueda por nombre ES/EN/id, tabla multi-ciudad con frescura, selector de calidad,
      resaltado de mejor compra/venta, y **detección de outliers** (mediana) que filtra
      órdenes troll. Estados loading/error/vacío. (+8 tests)
- [x] **Fase 2 — Refinamiento:** motor de RRR **real** (`18% + 40% bono + 59% foco`,
      `RR/(1+RR)` = cascada), fee de estación con itemValue del juego, impuestos, y profit
      por lote/unidad + margen. Fix del prototipo: la RRR se aplica también al material
      del tier previo. Calculadora completa con mejores ciudades y rutas. (+6 golden tests)
- [x] **Fase 2.1 — Foco + UX:** modelo de **costo de foco** por maestría
      (`focusPerUnit = focusBase × 2^(−efTotal/10000)`, doc técnico), inputs de maestría T4–T8,
      métricas Foco/unidad · Foco total · **Profit/foco**, toggles agrupados, y **selección de
      ciudad por clic en las 3 tablas** (material actual, tier previo, refinado). (+4 tests)
- [ ] **Fase 2.5 — Crafteo de Equipo:** reutiliza el motor con recetas de equipo + artefactos.
- [x] **Persistencia de módulos:** cada calculadora guarda su configuración en un store
      persistido (Zustand + localStorage) — al salir y volver queda exactamente igual, y
      sobrevive recargas. (`features/*/store.ts`)
- [x] **Fase 3 — Cocina:** 21 recetas estándar (T1–T8) con **IDs de ingredientes corregidos**
      al esquema actual del juego (los del prototipo estaban obsoletos), profit por
      encantamiento (.0–.3) y ciudad, foco por rama con la curva exponencial documentada,
      y profit/foco. (+4 tests). Recetas de pescado/avalonianas pendientes de datos fiables.
- [ ] **Fase 4 — Flipping + history/charts + pulido.**
- [ ] **Fase 4 — Pulido:** history/charts, shopping list, compartir por URL, PWA.

## Deuda conocida del prototipo a corregir

Ver auditoría: RRR hardcodeado a 4 constantes, `itemValue` tomado del mercado (debe venir de
`ao-bin-dumps`), datos mock inventados en fallo de API, profit/foco con bug de ciudad.

import { useNavStore } from '@/app/store/navStore'
import { ServerSelector } from '@/features/shell/ServerSelector'
import { MenuScreen } from '@/features/shell/MenuScreen'
import { MarketBrowser } from '@/features/market/MarketBrowser'
import { RefineCalculator } from '@/features/refine/RefineCalculator'
import { CookingCalculator } from '@/features/cooking/CookingCalculator'

export default function App() {
  const activeModule = useNavStore((s) => s.activeModule)

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,#2a2114_0%,#171614_42%,#121110_100%)]">
      <div className="mx-auto grid w-[min(1120px,100%)] gap-6 p-6">
        <header className="flex items-center justify-between gap-4">
          <span className="inline-flex w-max items-center rounded-full bg-blue/15 px-3 py-1.5 text-xs text-blue">
            Consola del Economista · v0.1
          </span>
          <ServerSelector />
        </header>

        {activeModule === 'market' ? (
          <MarketBrowser />
        ) : activeModule === 'refine' ? (
          <RefineCalculator />
        ) : activeModule === 'cook' ? (
          <CookingCalculator />
        ) : (
          <MenuScreen />
        )}

        <footer className="text-center text-xs text-text-faint">
          Datos vía Albion Online Data Project · proxy en{' '}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 text-text-muted">
            /aod/&lt;server&gt;
          </code>
        </footer>
      </div>
    </div>
  )
}

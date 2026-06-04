import { MODULES } from '@/config/modules'
import { useNavStore } from '@/app/store/navStore'

function BrandMark() {
  return (
    <svg
      className="size-14 flex-none text-primary"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 46 32 10l18 36M22 34h20M27 46h10" />
    </svg>
  )
}

export function MenuScreen() {
  const open = useNavStore((s) => s.open)

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 rounded-[28px] border border-white/8 bg-[linear-gradient(145deg,rgba(200,155,60,.13),rgba(23,22,20,.92))] p-8 shadow-[var(--shadow-md)]">
        <div className="flex items-center gap-4">
          <BrandMark />
          <div>
            <h1 className="font-display text-3xl leading-tight">
              Calculadora de Economía Albion
            </h1>
            <p className="mt-1 max-w-[68ch] text-text-muted">
              Monitorea mercados en tiempo real, calcula tasas de retorno (RRR) y maximiza tus
              márgenes de plata.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {MODULES.map((m) => (
          <button
            key={m.id}
            type="button"
            disabled={!m.ready}
            onClick={() => m.ready && open(m.id)}
            className="grid w-full gap-4 rounded-[22px] border border-white/8 bg-surface p-5 text-left transition-all enabled:hover:-translate-y-0.5 enabled:hover:border-primary/55 enabled:hover:bg-surface-2 enabled:hover:shadow-[var(--shadow-md)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <div className="grid size-12 place-items-center rounded-2xl bg-primary/15 text-xl">
              {m.icon}
            </div>
            <div className="grid gap-1">
              <h2 className="font-display text-lg">{m.title}</h2>
              <p className="text-sm text-text-muted">{m.description}</p>
            </div>
            <span className="inline-flex w-max items-center rounded-full bg-blue/15 px-3 py-1.5 text-xs text-blue">
              {m.tag}
            </span>
            <span className="text-xs text-text-faint">
              {m.ready ? 'Disponible →' : 'Próximamente — en construcción'}
            </span>
          </button>
        ))}
      </section>
    </div>
  )
}

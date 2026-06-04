import { useState } from 'react'
import { useServerStore } from '@/app/store/serverStore'
import { SERVERS, SERVER_LABELS, SERVER_HOSTS } from '@/config/servers'
import { cn } from '@/lib/utils'

/**
 * Server switcher. The whole data layer keys off the selected server, so this
 * lives in the app shell and writes straight to the persisted store.
 */
export function ServerSelector() {
  const server = useServerStore((s) => s.server)
  const setServer = useServerStore((s) => s.setServer)
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-4 py-2.5 transition-colors hover:border-primary/50"
      >
        <span className="size-2.5 rounded-full bg-success shadow-[0_0_8px_var(--color-success)]" />
        <span className="text-sm font-bold uppercase tracking-wider text-white">
          {server}
        </span>
        <span className="hidden text-xs text-text-muted sm:inline">
          {SERVER_HOSTS[server]}
        </span>
        <svg
          className={cn('size-4 text-text-muted transition-transform', open && 'rotate-180')}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-lg border border-border bg-surface-2 shadow-[var(--shadow-md)]">
            {SERVERS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setServer(id)
                  setOpen(false)
                }}
                className={cn(
                  'block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-primary/15',
                  id === server ? 'font-bold text-primary' : 'text-text',
                )}
              >
                {SERVER_LABELS[id]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

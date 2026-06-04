import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_SERVER, type ServerId } from '@/config/servers'

interface ServerState {
  server: ServerId
  setServer: (server: ServerId) => void
}

/**
 * Selected game server. Persisted to localStorage so a player's choice survives
 * reloads. This is the one cross-cutting piece of client state in Phase 0 —
 * every data query reads from here.
 */
export const useServerStore = create<ServerState>()(
  persist(
    (set) => ({
      server: DEFAULT_SERVER,
      setServer: (server) => set({ server }),
    }),
    { name: 'albion-forge.server' },
  ),
)

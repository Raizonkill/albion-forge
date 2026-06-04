import { create } from 'zustand'
import type { ModuleId } from '@/config/modules'

interface NavState {
  activeModule: ModuleId | null
  open: (module: ModuleId) => void
  close: () => void
}

/**
 * Lightweight in-app navigation for Phase 1 (menu ↔ module screens).
 * Will be swapped for a URL router in Phase 4 to make calculators shareable by link.
 */
export const useNavStore = create<NavState>((set) => ({
  activeModule: null,
  open: (module) => set({ activeModule: module }),
  close: () => set({ activeModule: null }),
}))

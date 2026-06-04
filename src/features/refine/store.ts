import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ResourceId } from './data/resources'
import { EMPTY_SPECS, type SpecLevels } from './calc/focusCost'

/**
 * Persisted settings for the Refine calculator. Lives outside the component so the
 * configuration survives navigating away (unmount) and full page reloads — the user's
 * setup is exactly as they left it.
 */
export interface RefineSettings {
  resourceId: ResourceId
  tier: number
  enchant: number
  bonusCity: boolean
  focus: boolean
  premium: boolean
  stationFee: number
  quantity: number
  specs: SpecLevels
  forcedRaw: string | null
  forcedPrev: string | null
  forcedFinal: string | null
}

interface RefineStore extends RefineSettings {
  update: (patch: Partial<RefineSettings>) => void
}

const DEFAULTS: RefineSettings = {
  resourceId: 'leather',
  tier: 6,
  enchant: 0,
  bonusCity: true,
  focus: true,
  premium: true,
  stationFee: 350,
  quantity: 100,
  specs: EMPTY_SPECS,
  forcedRaw: null,
  forcedPrev: null,
  forcedFinal: null,
}

export const useRefineStore = create<RefineStore>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      update: (patch) => set(patch),
    }),
    { name: 'albion-forge.refine' },
  ),
)

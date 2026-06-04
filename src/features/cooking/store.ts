import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Persisted settings for the Cooking calculator (survives navigation + reload). */
export interface CookingSettings {
  recipeId: string
  craftCity: string
  premium: boolean
  focus: boolean
  stationFee: number
  batches: number
  /** Mastery level per branch (Sopas, Guisos, …). */
  branchSpecs: Record<string, number>
  /** General Chef node level — contributes to "other specs" for every recipe. */
  chefBase: number
}

interface CookingStore extends CookingSettings {
  update: (patch: Partial<CookingSettings>) => void
  setBranchSpec: (branch: string, value: number) => void
}

const DEFAULTS: CookingSettings = {
  recipeId: 'T6_MEAL_STEW',
  craftCity: 'Caerleon',
  premium: true,
  focus: true,
  stationFee: 350,
  batches: 10,
  branchSpecs: {},
  chefBase: 0,
}

export const useCookingStore = create<CookingStore>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      update: (patch) => set(patch),
      setBranchSpec: (branch, value) =>
        set({ branchSpecs: { ...get().branchSpecs, [branch]: value } }),
    }),
    { name: 'albion-forge.cooking' },
  ),
)

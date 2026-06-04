/** The five refinable resource lines, with their bonus city and item-id stems. */
export type ResourceId = 'leather' | 'bar' | 'cloth' | 'plank' | 'stone'

export interface ResourceMeta {
  id: ResourceId
  label: string
  /** Royal city that grants the +40% refining bonus for this resource. */
  bonusCity: string
  /** Raw material id stem (e.g. HIDE → T6_HIDE). */
  rawStem: string
  /** Refined product id stem (e.g. LEATHER → T6_LEATHER). */
  refinedStem: string
}

export const RESOURCES: Record<ResourceId, ResourceMeta> = {
  leather: { id: 'leather', label: 'Cuero', bonusCity: 'Martlock', rawStem: 'HIDE', refinedStem: 'LEATHER' },
  bar: { id: 'bar', label: 'Lingotes', bonusCity: 'Thetford', rawStem: 'ORE', refinedStem: 'METALBAR' },
  cloth: { id: 'cloth', label: 'Tela', bonusCity: 'Lymhurst', rawStem: 'FIBER', refinedStem: 'CLOTH' },
  plank: { id: 'plank', label: 'Tablas', bonusCity: 'Fort Sterling', rawStem: 'WOOD', refinedStem: 'PLANKS' },
  stone: { id: 'stone', label: 'Piedra', bonusCity: 'Bridgewatch', rawStem: 'ROCK', refinedStem: 'STONEBLOCK' },
}

export const RESOURCE_LIST = Object.values(RESOURCES)

export type ModuleId = 'refine' | 'craft' | 'cook' | 'market'

export interface ModuleMeta {
  id: ModuleId
  icon: string
  title: string
  description: string
  tag: string
  ready: boolean
}

export const MODULES: ModuleMeta[] = [
  {
    id: 'market',
    icon: '📊',
    title: 'Explorador de Mercado',
    description: 'Precios en vivo por ciudad y calidad, con indicador de frescura del dato.',
    tag: 'Precios en Vivo',
    ready: true,
  },
  {
    id: 'refine',
    icon: '⛏️',
    title: 'Refinamiento Optimizado',
    description:
      'Cueros, barras, telas, tablas y bloques con tasa de retorno (RRR) real y bonos por ciudad.',
    tag: 'Producción de Recursos',
    ready: true,
  },
  {
    id: 'craft',
    icon: '⚔️',
    title: 'Crafteo de Equipo',
    description:
      'Coste de fabricación de armas, armaduras y herramientas usando devoluciones y foco.',
    tag: 'Armas y Armaduras',
    ready: false,
  },
  {
    id: 'cook',
    icon: '🍲',
    title: 'Calculadora de Cocina',
    description:
      'Profit por receta con encantamientos (.0–.3), tabla de ciudades en vivo y foco por rama.',
    tag: 'Comidas',
    ready: true,
  },
]

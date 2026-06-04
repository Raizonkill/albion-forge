/** Albion Online game servers. Market data is fully separate per server. */
export const SERVERS = ['west', 'east', 'europe'] as const

export type ServerId = (typeof SERVERS)[number]

export const DEFAULT_SERVER: ServerId = 'west'

export const SERVER_LABELS: Record<ServerId, string> = {
  west: 'América (West)',
  east: 'Asia (East)',
  europe: 'Europa (Europe)',
}

export const SERVER_HOSTS: Record<ServerId, string> = {
  west: 'west.albion-online-data.com',
  east: 'east.albion-online-data.com',
  europe: 'europe.albion-online-data.com',
}

/**
 * Dev calls go through the Vite proxy (see vite.config.ts) to dodge CORS.
 * In a real deploy this would point at an edge proxy or the host directly.
 */
export function aodBasePath(server: ServerId): string {
  return `/aod/${server}`
}

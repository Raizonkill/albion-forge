import { cn } from '@/lib/utils'

/** Albion's official item renderer. quality 1–5 picks the frame/tint. */
function iconUrl(id: string, quality = 1): string {
  return `https://render.albiononline.com/v1/item/${id}.png?quality=${quality}`
}

export function ItemIcon({
  id,
  quality = 1,
  size = 48,
  className,
}: {
  id: string
  quality?: number
  size?: number
  className?: string
}) {
  return (
    <img
      src={iconUrl(id, quality)}
      width={size}
      height={size}
      alt={id}
      loading="lazy"
      className={cn('rounded-lg bg-black/40 object-contain', className)}
    />
  )
}

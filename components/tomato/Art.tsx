'use client'

import { useEffect, useRef, useState } from 'react'
import { Plate } from '@/components/tomato/Botanical'
import type { Variety } from '@/lib/variety'
import rawManifest from '@/data/art-manifest.json'

// The manifest is generated, and its `stops` array is empty until art is added,
// which TypeScript would otherwise infer as never[].
const manifest = rawManifest as { hero: boolean; stops: string[] }

/** True when the file actually exists, so we never fire a request that 404s. */
export function hasArt(kind: 'hero' | 'stop', id?: string): boolean {
  if (kind === 'hero') return manifest.hero
  return Boolean(id && manifest.stops.includes(id))
}

/**
 * An illustration slot.
 *
 * Tries a real image first and falls back to the hand-drawn plate when the file
 * is not there, so artwork can be dropped into /public/art at any time with no
 * code change and nothing is broken while the folder is empty.
 *
 *   public/art/hero.png            — the banner illustration
 *   public/art/stops/<stop-id>.png — one per stop, square
 *
 * The mount check matters: a 404 that resolves before React attaches onError
 * never fires the handler, so the fallback has to also ask the element whether
 * it already failed. `complete && naturalWidth === 0` is that question.
 */
export function useImageFallback(src: string) {
  const ref = useRef<HTMLImageElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  useEffect(() => {
    const el = ref.current
    if (el && el.complete && el.naturalWidth === 0) setFailed(true)
  })

  return { ref, failed, onError: () => setFailed(true) }
}

export function Art({
  src,
  variety,
  size,
  className,
  alt = '',
  stopId,
}: {
  src: string
  variety: Variety
  size: number
  className?: string
  alt?: string
  stopId?: string
}) {
  const { ref, failed, onError } = useImageFallback(src)

  if (failed || !hasArt('stop', stopId)) return <Plate variety={variety} size={size} className={className} />

  return (
    // eslint-disable-next-line @next/next/no-img-element -- the fallback needs onError, which next/image does not expose
    <img
      ref={ref}
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      decoding="async"
      onError={onError}
      style={{ objectFit: 'contain' }}
    />
  )
}

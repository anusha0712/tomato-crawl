'use client'

import { useEffect, useRef, useState } from 'react'
import type { TransitLegOut } from '@/app/api/transit/route'

export type TransitState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; legs: Record<string, TransitLegOut> }
  /** No key configured. Not an error — the deep links still work. */
  | { status: 'unconfigured' }
  | { status: 'error' }

export function legKey(fromId: string, toId: string): string {
  return `${fromId}>${toId}`
}

/**
 * Fetches real transit legs for the current route.
 *
 * Deliberately debounced: reordering a route fires several changes in a row and
 * each request costs a Google call. Nothing is fetched until the route settles.
 */
export function useTransitLegs(stopIds: string[]): TransitState {
  const [state, setState] = useState<TransitState>({ status: 'idle' })
  const signature = stopIds.join('>')
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const ids = signature ? signature.split('>') : []
    if (ids.length < 2) {
      setState({ status: 'idle' })
      return
    }

    const timer = setTimeout(() => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setState({ status: 'loading' })

      fetch('/api/transit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
        signal: controller.signal,
      })
        .then(async (res) => {
          if (res.status === 501) {
            setState({ status: 'unconfigured' })
            return
          }
          if (!res.ok) throw new Error(String(res.status))
          const data = await res.json()
          const byKey: Record<string, TransitLegOut> = {}
          for (const leg of data.legs ?? []) byKey[legKey(leg.fromId, leg.toId)] = leg
          setState({ status: 'ready', legs: byKey })
        })
        .catch((err) => {
          if (err?.name === 'AbortError') return
          setState({ status: 'error' })
        })
    }, 600)

    return () => clearTimeout(timer)
  }, [signature])

  useEffect(() => () => abortRef.current?.abort(), [])

  return state
}

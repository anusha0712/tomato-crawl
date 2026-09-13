'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { Stop } from '@/data/stops'
import styles from './MapView.module.css'

interface Props {
  stops: Stop[]
  routeIds: string[]
  focusId?: string
  onSelect: (id: string) => void
}

/**
 * Leaflet's bundled marker PNGs break under bundlers and would be a raster
 * asset in a project that draws everything by hand, so markers are divIcons
 * built from inline SVG. They read theme tokens like any other component.
 */
function pinIcon(index: number | null, held: boolean, active: boolean): L.DivIcon {
  const label = index !== null ? String(index + 1) : ''
  const cls = [styles.pin, active ? styles.pinActive : '', held ? styles.pinHeld : '']
    .filter(Boolean)
    .join(' ')

  return L.divIcon({
    className: styles.pinWrap,
    iconSize: [30, 38],
    iconAnchor: [15, 36],
    popupAnchor: [0, -32],
    html: `
      <span class="${cls}">
        <svg viewBox="0 0 30 38" width="30" height="38" aria-hidden="true" focusable="false">
          <path d="M15 37c0-9 10-12.6 10-22A10 10 0 0 0 5 15c0 9.4 10 13 10 22Z"
                fill="currentColor" stroke="var(--bg)" stroke-width="1.8"/>
          ${
            label
              ? `<text x="15" y="19.5" text-anchor="middle" font-size="12" font-weight="700"
                   font-family="var(--font-ui), monospace" fill="var(--marker-ink)">${label}</text>`
              : `<circle cx="15" cy="15" r="3.6" fill="var(--bg)"/>`
          }
        </svg>
      </span>`,
  })
}

export default function MapView({ stops, routeIds, focusId, onSelect }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  // Create the map once.
  useEffect(() => {
    if (!hostRef.current || mapRef.current) return

    const map = L.map(hostRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    // Scroll-wheel zoom hijacks page scroll, so it is opt-in by click.
    map.on('click', () => map.scrollWheelZoom.enable())
    map.on('mouseout', () => map.scrollWheelZoom.disable())

    mapRef.current = map
    layerRef.current = L.layerGroup().addTo(map)
    map.setView([40.72, -73.98], 12)



    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
      markersRef.current.clear()
    }
  }, [])

  // Redraw markers and the route line whenever the data changes.
  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return

    layer.clearLayers()
    markersRef.current.clear()

    const routed = routeIds
      .map((id) => stops.find((s) => s.id === id))
      .filter((s): s is Stop => Boolean(s))

    if (routed.length > 1) {
      // The route line reads the active style's marker colour.
      const root = getComputedStyle(document.documentElement)
      const accent = root.getPropertyValue('--marker-fill').trim() || '#b03a10'
      // The dash pattern is a style token, so the route line matches the rest
      // of the design instead of being a fixed Leaflet default.
      const dash = root.getPropertyValue('--line').trim() || '3 8'
      L.polyline(routed.map((s) => s.coords), {
        color: accent,
        weight: 4,
        opacity: 0.9,
        dashArray: dash === '0 0' ? undefined : dash,
        lineCap: 'round',
      }).addTo(layer)
    }

    stops.forEach((stop) => {
      const idx = routeIds.indexOf(stop.id)
      // Several venues sit within a block of each other (Hani's and Librae share
      // Cooper Square), so Leaflet's latitude ordering can bury a numbered route
      // pin under a plain one. Lift routed and focused pins explicitly.
      const zIndexOffset = stop.id === focusId ? 2000 : idx >= 0 ? 1000 : 0

      const marker = L.marker(stop.coords, {
        icon: pinIcon(idx >= 0 ? idx : null, stop.status !== 'confirmed', stop.id === focusId),
        keyboard: true,
        zIndexOffset,
        riseOnHover: true,
        title: `${stop.venue} — ${stop.item}`,
        alt: `${stop.venue}, ${stop.neighborhood}`,
      })

      marker.bindPopup(
        `<strong style="font-size:14px">${stop.item}</strong><br/>
         <span style="color:var(--ink-faint);font-size:12px">${stop.venue} · ${stop.neighborhood}</span>`,
      )
      marker.on('click', () => onSelectRef.current(stop.id))
      marker.addTo(layer)
      markersRef.current.set(stop.id, marker)
    })

    // Leaflet creates the overlay pane's <svg> lazily, the first time a vector
    // is added, so this has to run after the polyline — not at map setup. The
    // route line is decorative; the same route is written out in the ticket.
    const overlay = map.getPane('overlayPane')?.querySelector('svg')
    if (overlay) overlay.setAttribute('aria-hidden', 'true')

    const pts = (routed.length > 1 ? routed : stops).map((s) => s.coords)
    if (pts.length) {
      map.fitBounds(L.latLngBounds(pts as L.LatLngExpression[]), {
        padding: [44, 44],
        maxZoom: 15,
        animate: false,
      })
    }
  }, [stops, routeIds, focusId])

  // Pan to whatever the list asked us to show.
  useEffect(() => {
    if (!focusId || !mapRef.current) return
    const marker = markersRef.current.get(focusId)
    if (!marker) return
    mapRef.current.panTo(marker.getLatLng(), { animate: true, duration: 0.4 })
    marker.openPopup()
  }, [focusId])

  return (
    <div className={styles.host}>
      <div ref={hostRef} className={styles.map} role="application" aria-label="Map of crawl stops" />
      <p className={styles.hint}>Click the map to enable scroll zoom.</p>
    </div>
  )
}

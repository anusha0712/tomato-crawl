import type { Stop, Weekday, Hours } from '@/data/stops'

export const WEEKDAY_LABEL: Record<Weekday, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
}

/** Matches JS getDay(), where Sunday is 0. Used only for date maths. */
const JS_ORDER: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

/** How a week reads to a person planning a weekend. Used only for display. */
const ORDER: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export function weekdayOf(date: Date): Weekday {
  return JS_ORDER[date.getDay()]
}

export function hoursOn(stop: Stop, day: Weekday): Hours | undefined {
  return stop.hours.find((h) => h.days.includes(day))
}

export function isOpenOn(stop: Stop, day: Weekday): boolean {
  return hoursOn(stop, day) !== undefined
}

/** "5:00pm" from "17:00". Returns undefined when the venue never stated a time. */
export function prettyTime(hhmm?: string): string | undefined {
  if (!hhmm) return undefined
  const [h, m] = hhmm.split(':').map(Number)
  if (Number.isNaN(h)) return undefined
  if (h === 0 && m === 0) return 'midnight'
  const suffix = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${hour}${suffix}` : `${hour}:${String(m).padStart(2, '0')}${suffix}`
}

/** For tight rows. Falls back to a short phrase rather than a full sentence. */
export function prettyHoursShort(h: Hours): string {
  const open = prettyTime(h.opens)
  const close = prettyTime(h.closes)
  if (open && close) return `${open}–${close}`
  return 'Hours not posted'
}

export function prettyHours(h: Hours): string {
  const open = prettyTime(h.opens)
  const close = prettyTime(h.closes)
  if (open && close) return `${open}–${close}`
  return h.note ?? 'Times not stated'
}

/** Compact day range: ['mon','tue','wed'] reads "Mon–Wed", not "Mon, Tue, Wed". */
export function prettyDays(days: Weekday[]): string {
  if (days.length === 7) return 'Daily'
  const idx = days.map((d) => ORDER.indexOf(d)).sort((a, b) => a - b)
  const runs: number[][] = []
  for (const i of idx) {
    const last = runs[runs.length - 1]
    if (last && i === last[last.length - 1] + 1) last.push(i)
    else runs.push([i])
  }
  return runs
    .map((r) =>
      r.length === 1
        ? WEEKDAY_LABEL[ORDER[r[0]]]
        : `${WEEKDAY_LABEL[ORDER[r[0]]]}–${WEEKDAY_LABEL[ORDER[r[r.length - 1]]]}`,
    )
    .join(', ')
}

/**
 * Derived, never stored. A stop is past its run only when the venue itself
 * named an end date — we do not guess that heirloom season is "over".
 */
export function hasEnded(stop: Stop, today = new Date()): boolean {
  if (!stop.endsOn) return false
  return new Date(stop.endsOn + 'T23:59:59') < today
}

export function endsSoon(stop: Stop, today = new Date(), withinDays = 7): boolean {
  if (!stop.endsOn || hasEnded(stop, today)) return false
  const ms = new Date(stop.endsOn + 'T23:59:59').getTime() - today.getTime()
  return ms <= withinDays * 86_400_000
}

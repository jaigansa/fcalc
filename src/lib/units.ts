import type { InputMode } from './types'
import { fmtDec } from './calc'

export const INCHES_PER_FOOT = 12
export const MM_PER_INCH = 25.4
export const NOOL_PER_INCH = 8

/** Convert a value from the given input mode into total inches. */
export function toInches(value: number, mode: InputMode): number {
  switch (mode) {
    case 'imperial':
      return value
    case 'metric':
      return value / MM_PER_INCH
  }
}

/** Convert a length in total inches into a value of the given input mode. */
export function fromInches(inches: number, mode: InputMode): number {
  switch (mode) {
    case 'imperial':
      return inches
    case 'metric':
      return inches * MM_PER_INCH
  }
}

export function inchesToFeet(inches: number): number {
  return inches / INCHES_PER_FOOT
}

export function inchesToMm(inches: number): number {
  return inches * MM_PER_INCH
}

export function inchesToCm(inches: number): number {
  return inchesToMm(inches) / 10
}

export function inchesToNool(inches: number): number {
  return inches * NOOL_PER_INCH
}

/** Build display text like `1 m 23 cm 4 mm` from raw meter/cm/mm field input. */
export function formatMeterCmMm(
  meter: string,
  cm: string,
  mm: string,
): string {
  const m = meter.trim()
  const c = cm.trim()
  const milli = mm.trim()
  const parts: string[] = []
  if (m !== '' && m !== '0') parts.push(`${m} m`)
  if (c !== '') parts.push(`${c} cm`)
  if (milli !== '') parts.push(`${milli} mm`)
  if (m !== '' && m !== '0' && parts.length === 1) parts.push('0 cm')
  if (parts.length === 0) parts.push('0 mm')
  return parts.join(' ')
}

/** Split a total-mm value back into meter/cm/mm field text. */
export function splitMeterCmMm(
  totalMm: number,
): { meter: string; cm: string; mm: string } {
  if (!Number.isFinite(totalMm)) return { meter: '', cm: '', mm: '' }
  const sign = totalMm < 0 ? '-' : ''
  const abs = Math.abs(totalMm)
  const m = Math.trunc(abs / 1000)
  const rest = abs - m * 1000
  const c = Math.trunc(rest / 10)
  const milli = fmtDec(rest - c * 10)
  if (m !== 0) return { meter: sign + String(m), cm: String(c), mm: milli }
  if (c !== 0) return { meter: '', cm: sign + String(c), mm: milli }
  return { meter: '', cm: '', mm: milli === '0' ? '' : sign + milli }
}

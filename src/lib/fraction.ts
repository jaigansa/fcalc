import type { FractionResult } from './types'
import { INCHES_PER_FOOT } from './units'

export function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b > 0) {
    const t = a % b
    a = b
    b = t
  }
  return a || 1
}

/**
 * Convert a decimal value in inches into feet + whole inches + a reduced
 * fraction at the given denominator precision (e.g. 16 = 1/16").
 *
 * Returns null for non-finite input.
 */
export function toFeetFraction(
  totalInches: number,
  precision: number,
): FractionResult | null {
  if (!Number.isFinite(totalInches)) return null
  if (totalInches === 0) {
    return { sign: 1, feet: 0, inches: 0, num: 0, den: precision }
  }

  const sign: 1 | -1 = totalInches < 0 ? -1 : 1
  const abs = Math.abs(totalInches)

  let feet = Math.floor(abs / INCHES_PER_FOOT)
  let inches = Math.floor(abs % INCHES_PER_FOOT)
  const fraction = abs - Math.floor(abs)

  let num = Math.round(fraction * precision)
  let den = precision

  if (num === den) {
    num = 0
    inches += 1
  } else if (num > 0) {
    const divisor = gcd(num, den)
    num /= divisor
    den /= divisor
  }

  if (inches === INCHES_PER_FOOT) {
    feet += 1
    inches = 0
  }

  return { sign, feet, inches, num, den }
}

/** Format a FractionResult as `5' 7 3/8"`, `3/4"`, `1' 0"`, `0"`, etc. */
export function formatFeetFraction(r: FractionResult): string {
  const sign = r.sign < 0 ? '-' : ''
  const parts: string[] = []
  if (r.feet !== 0) parts.push(`${r.feet}'`)
  if (r.inches !== 0) parts.push(`${r.inches}`)
  if (r.num !== 0) parts.push(`${r.num}/${r.den}`)
  if (parts.length === 0) return '0"'
  if (r.feet !== 0 && parts.length === 1) parts.push('0')
  return sign + parts.join(' ') + '"'
}

/** Build display text like `12' 10 1/4"` from feet/inches/fraction input. */
export function formatFtIn(feet: string, inch: string, frac = ''): string {
  const ft = feet.trim()
  const inc = inch.trim()
  const fr = frac.trim()
  const parts: string[] = []
  if (ft !== '' && ft !== '0') parts.push(`${ft}'`)
  const incPart = inc === '' ? '0' : inc
  if (fr !== '') {
    parts.push(`${incPart} ${fr}"`)
  } else if (inc !== '') {
    parts.push(`${inc}"`)
  }
  if (parts.length === 0) parts.push('0"')
  if (ft !== '' && ft !== '0' && parts.length === 1) parts.push('0"')
  return parts.join(' ')
}

/** Split a total-inch value back into feet/inches field text. */
export function splitFeetInch(
  totalInches: number,
  precision: number,
): { feet: string; inch: string } {
  const f = toFeetFraction(totalInches, precision)
  if (!f) return { feet: '', inch: '' }
  const sign = f.sign < 0 ? '-' : ''
  const inchParts: string[] = []
  if (f.inches !== 0) inchParts.push(String(f.inches))
  if (f.num !== 0) inchParts.push(`${f.num}/${f.den}`)
  const inch = inchParts.join(' ')
  const feet = f.feet !== 0 ? String(f.feet) : ''
  if (feet !== '') return { feet: sign + feet, inch: sign + inch }
  return { feet: '', inch: inch === '' ? '' : sign + inch }
}

export interface MixedFraction {
  negative: boolean
  whole: number
  num: number
  den: number
}

/**
 * Approximate a decimal as a mixed fraction with a denominator no larger
 * than `maxDen`, choosing the closest fit.
 */
export function toFraction(value: number, maxDen = 64): MixedFraction {
  if (!Number.isFinite(value) || value === 0) {
    return { negative: false, whole: 0, num: 0, den: 1 }
  }
  const negative = value < 0
  const abs = Math.abs(value)
  let whole = Math.floor(abs)
  const frac = abs - whole
  if (frac === 0) return { negative, whole, num: 0, den: 1 }

  let bestNum = 1
  let bestDen = maxDen
  let bestErr = Infinity
  for (let den = 1; den <= maxDen; den++) {
    const num = Math.round(frac * den)
    const err = Math.abs(frac - num / den)
    if (num > 0 && num <= den && err < bestErr) {
      bestErr = err
      bestNum = num
      bestDen = den
    }
    if (bestErr === 0) break
  }

  if (bestNum === bestDen) {
    whole += 1
    bestNum = 0
  } else {
    const g = gcd(bestNum, bestDen)
    bestNum /= g
    bestDen /= g
  }
  return { negative, whole, num: bestNum, den: bestDen }
}

export function formatMixedFraction(m: MixedFraction): string {
  const sign = m.negative ? '-' : ''
  const parts: string[] = []
  if (m.whole !== 0) parts.push(String(m.whole))
  if (m.num !== 0) parts.push(`${m.num}/${m.den}`)
  if (parts.length === 0) return '0'
  return sign + parts.join(' ')
}

/** All reduced fractions at the given denominator precision (e.g. 16ths). */
export function fractionOptions(precision: number): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (let k = 1; k < precision; k++) {
    const g = gcd(k, precision)
    const n = k / g
    const d = precision / g
    const key = `${n}/${d}`
    if (!seen.has(key)) {
      seen.add(key)
      out.push(key)
    }
  }
  return out.sort((a, b) => {
    const [an, ad] = a.split('/').map(Number)
    const [bn, bd] = b.split('/').map(Number)
    return an / ad - bn / bd
  })
}

/**
 * Split a typed inches value into a whole part and a fraction part.
 * `"10 1/4"` -> `{ whole: "10", frac: "1/4" }`, `"3/4"` -> `{ whole: "", frac: "3/4" }`.
 * Values that can't be split (decimals, negatives, odd fractions) come back whole.
 */
export function splitInchInput(inc: string): { whole: string; frac: string } {
  const t = inc.trim()
  const mixed = t.match(/^(-?\d+(?:\.\d+)?)\s+(\d+)\s*\/\s*(\d+)$/)
  if (mixed) return { whole: mixed[1], frac: `${mixed[2]}/${mixed[3]}` }
  const simple = t.match(/^(\d+)\s*\/\s*(\d+)$/)
  if (simple) return { whole: '', frac: `${simple[1]}/${simple[2]}` }
  return { whole: t, frac: '' }
}

/**
 * True when an inches string is an unfinished fraction (e.g. `"6 1/"`, `"1/"`,
 * `"6 1"`), so it should not yet be treated as invalid input.
 */
export function isPartialFraction(inc: string): boolean {
  const t = inc.trim()
  if (t === '') return false
  return (
    /^[+-]?\d+(?:\.\d+)?\s+\d+\s*\/?\s*$/.test(t) ||
    /^[+-]?\d+\s*\/\s*$/.test(t)
  )
}

/**
 * Decide what happens when the user types into the Inches field.
 * A fraction typed directly into the field is kept there and wins over the
 * dropdown; otherwise the dropdown value keeps applying.
 */
export function inchEntryParts(
  value: string,
  currentFrac: string,
): { inch: string; frac: string } {
  const { frac } = splitInchInput(value)
  if (frac !== '') return { inch: value, frac: '' }
  return { inch: value, frac: currentFrac }
}

const FRACTION_ONLY = /^([+-]?\d+)\s*\/\s*(\d+)$/
const MIXED_FRACTION = /^([+-]?\d+(?:\.\d+)?)\s+(\d+)\s*\/\s*(\d+)$/
const DECIMAL = /^([+-]?)(\d*)(?:\.(\d*))?$/

/**
 * Parse a user-typed length into a decimal number of the current unit.
 *
 * Accepts decimals (`67.375`, `.5`, `-3.25`), simple fractions (`3/4`),
 * and mixed fractions (`7 3/8`, `-2 1/2`). Returns null when unparseable.
 */
export function parseLengthInput(raw: string): number | null {
  if (raw == null) return null
  let s = raw.trim().replace(/"/g, '')
  if (!s || !/\d/.test(s)) return null

  let m = s.match(FRACTION_ONLY)
  if (m) {
    const n = parseInt(m[1], 10)
    const d = parseInt(m[2], 10)
    if (d === 0) return null
    return (n < 0 ? -1 : 1) * (Math.abs(n) / d)
  }

  m = s.match(MIXED_FRACTION)
  if (m) {
    const whole = parseFloat(m[1])
    const n = parseInt(m[2], 10)
    const d = parseInt(m[3], 10)
    if (d === 0) return null
    const sign = whole < 0 ? -1 : 1
    return sign * (Math.abs(whole) + n / d)
  }

  m = s.match(DECIMAL)
  if (m) {
    const sign = m[1] === '-' ? -1 : 1
    const whole = m[2] ? parseInt(m[2], 10) : 0
    const frac = m[3] ? parseFloat(`0.${m[3]}`) : 0
    return sign * (whole + frac)
  }

  return null
}

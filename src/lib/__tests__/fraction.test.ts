import { describe, expect, it } from 'vitest'
import {
  formatFeetFraction,
  formatFtIn,
  formatMixedFraction,
  fractionOptions,
  gcd,
  inchEntryParts,
  isPartialFraction,
  splitFeetInch,
  splitInchInput,
  toFeetFraction,
  toFraction,
} from '../fraction'
import { parseLengthInput } from '../parse'

describe('gcd', () => {
  it('computes the greatest common divisor', () => {
    expect(gcd(6, 4)).toBe(2)
    expect(gcd(3, 8)).toBe(1)
    expect(gcd(16, 16)).toBe(16)
    expect(gcd(0, 5)).toBe(5)
  })
})

describe('toFeetFraction', () => {
  it('converts 67.375" to 5ft 7 3/8"', () => {
    expect(toFeetFraction(67.375, 16)).toEqual({
      sign: 1,
      feet: 5,
      inches: 7,
      num: 3,
      den: 8,
    })
  })

  it('reduces fractions', () => {
    expect(toFeetFraction(1.25, 16)).toEqual({
      sign: 1,
      feet: 0,
      inches: 1,
      num: 1,
      den: 4,
    })
  })

  it('carries fractional overflow into whole inches', () => {
    expect(toFeetFraction(11.9375, 64)).toEqual({
      sign: 1,
      feet: 0,
      inches: 11,
      num: 15,
      den: 16,
    })
  })

  it('rounds up into the next foot', () => {
    expect(toFeetFraction(12 - 1 / 128, 64)).toEqual({
      sign: 1,
      feet: 1,
      inches: 0,
      num: 0,
      den: 64,
    })
  })

  it('handles exact values', () => {
    expect(toFeetFraction(12, 16)).toEqual({
      sign: 1,
      feet: 1,
      inches: 0,
      num: 0,
      den: 16,
    })
    expect(toFeetFraction(0, 16)).toEqual({
      sign: 1,
      feet: 0,
      inches: 0,
      num: 0,
      den: 16,
    })
  })

  it('handles negative values', () => {
    const r = toFeetFraction(-67.375, 16)
    expect(r).toEqual({
      sign: -1,
      feet: 5,
      inches: 7,
      num: 3,
      den: 8,
    })
  })

  it('returns null for non-finite input', () => {
    expect(toFeetFraction(Infinity, 16)).toBeNull()
    expect(toFeetFraction(NaN, 16)).toBeNull()
  })
})

describe('formatFeetFraction', () => {
  it('formats a full feet + inches + fraction value', () => {
    expect(
      formatFeetFraction({ sign: 1, feet: 5, inches: 7, num: 3, den: 8 }),
    ).toBe(`5' 7 3/8"`)
  })

  it('omits feet when zero', () => {
    expect(
      formatFeetFraction({ sign: 1, feet: 0, inches: 0, num: 1, den: 2 }),
    ).toBe(`1/2"`)
  })

  it('formats an exact foot', () => {
    expect(
      formatFeetFraction({ sign: 1, feet: 1, inches: 0, num: 0, den: 16 }),
    ).toBe(`1' 0"`)
  })

  it('formats negative values with a leading minus', () => {
    expect(
      formatFeetFraction({ sign: -1, feet: 5, inches: 7, num: 3, den: 8 }),
    ).toBe(`-5' 7 3/8"`)
  })

  it('formats zero', () => {
    expect(
      formatFeetFraction({ sign: 1, feet: 0, inches: 0, num: 0, den: 16 }),
    ).toBe(`0"`)
  })
})

describe('formatFtIn', () => {
  it('formats feet and inches fields', () => {
    expect(formatFtIn('12', '10 1/4')).toBe(`12' 10 1/4"`)
    expect(formatFtIn('12', '')).toBe(`12' 0"`)
    expect(formatFtIn('', '3/4')).toBe(`3/4"`)
    expect(formatFtIn('', '')).toBe(`0"`)
  })

  it('formats feet, inches, and fraction fields', () => {
    expect(formatFtIn('12', '10', '1/4')).toBe(`12' 10 1/4"`)
    expect(formatFtIn('12', '', '1/4')).toBe(`12' 0 1/4"`)
    expect(formatFtIn('', '', '1/2')).toBe(`0 1/2"`)
    expect(formatFtIn('', '10', '')).toBe(`10"`)
  })
})

describe('fractionOptions', () => {
  it('lists reduced fractions at the given precision', () => {
    expect(fractionOptions(4)).toEqual(['1/4', '1/2', '3/4'])
    expect(fractionOptions(8)).toEqual([
      '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8',
    ])
    expect(fractionOptions(16)).toHaveLength(15)
    expect(fractionOptions(16)[0]).toBe('1/16')
    expect(fractionOptions(16)).toContain('1/2')
  })
})

describe('splitInchInput', () => {
  it('splits mixed and simple fractions', () => {
    expect(splitInchInput('10 1/4')).toEqual({ whole: '10', frac: '1/4' })
    expect(splitInchInput('3/4')).toEqual({ whole: '', frac: '3/4' })
    expect(splitInchInput('-10 1/4')).toEqual({ whole: '-10', frac: '1/4' })
  })

  it('leaves whole values intact', () => {
    expect(splitInchInput('10')).toEqual({ whole: '10', frac: '' })
    expect(splitInchInput('10.5')).toEqual({ whole: '10.5', frac: '' })
    expect(splitInchInput('-3/4')).toEqual({ whole: '-3/4', frac: '' })
    expect(splitInchInput('1/7')).toEqual({ whole: '', frac: '1/7' })
    expect(splitInchInput('')).toEqual({ whole: '', frac: '' })
  })
})

describe('inchEntryParts', () => {
  it('keeps a typed fraction in the field and clears the dropdown', () => {
    expect(inchEntryParts('6 1/4', '')).toEqual({ inch: '6 1/4', frac: '' })
    expect(inchEntryParts('6 1/4', '1/2')).toEqual({ inch: '6 1/4', frac: '' })
    expect(inchEntryParts('6 1/7', '1/2')).toEqual({ inch: '6 1/7', frac: '' })
    expect(inchEntryParts('3/4', '')).toEqual({ inch: '3/4', frac: '' })
  })

  it('keeps the dropdown fraction when no fraction is typed', () => {
    expect(inchEntryParts('6', '1/2')).toEqual({ inch: '6', frac: '1/2' })
    expect(inchEntryParts('6', '')).toEqual({ inch: '6', frac: '' })
    expect(inchEntryParts('10.5', '1/4')).toEqual({
      inch: '10.5',
      frac: '1/4',
    })
  })
})

describe('isPartialFraction', () => {
  it('detects unfinished fractions', () => {
    expect(isPartialFraction('6 1/')).toBe(true)
    expect(isPartialFraction('1/')).toBe(true)
    expect(isPartialFraction('6 1')).toBe(true)
    expect(isPartialFraction('6/ ')).toBe(true)
  })

  it('passes complete values', () => {
    expect(isPartialFraction('6 1/4')).toBe(false)
    expect(isPartialFraction('1/4')).toBe(false)
    expect(isPartialFraction('6')).toBe(false)
    expect(isPartialFraction('6.5')).toBe(false)
    expect(isPartialFraction('-3/4')).toBe(false)
    expect(isPartialFraction('')).toBe(false)
  })
})

describe('splitFeetInch', () => {
  it('splits a total-inch value into field text', () => {
    expect(splitFeetInch(154.25, 16)).toEqual({ feet: '12', inch: '10 1/4' })
    expect(splitFeetInch(144, 16)).toEqual({ feet: '12', inch: '' })
    expect(splitFeetInch(7.375, 16)).toEqual({ feet: '', inch: '7 3/8' })
    expect(splitFeetInch(0, 16)).toEqual({ feet: '', inch: '' })
    expect(splitFeetInch(-12.5, 16)).toEqual({ feet: '-1', inch: '-1/2' })
  })
})

describe('feet/inches/fraction field round-trip', () => {
  function splitForFields(totalInches: number, precision: number) {
    const f = toFeetFraction(totalInches, precision)!
    const sign = f.sign < 0 ? '-' : ''
    let feet = ''
    let whole = ''
    let frac = ''
    if (f.feet !== 0) {
      feet = sign + String(f.feet)
      whole = f.inches !== 0 ? sign + String(f.inches) : ''
      frac = f.num !== 0 ? `${f.num}/${f.den}` : ''
    } else if (f.inches !== 0) {
      whole = sign + String(f.inches)
      frac = f.num !== 0 ? `${f.num}/${f.den}` : ''
    } else if (f.num !== 0) {
      whole = `${sign}0`
      frac = `${f.num}/${f.den}`
    }
    return { feet, whole, frac }
  }

  function combine(fields: { feet: string; whole: string; frac: string }) {
    const feetNum = fields.feet === '' ? 0 : Number(fields.feet)
    const inchNum = fields.whole === '' ? 0 : Number(fields.whole)
    const fracNum =
      fields.frac === '' ? 0 : (parseLengthInput(fields.frac) ?? 0)
    const sign =
      inchNum !== 0
        ? Math.sign(inchNum)
        : feetNum !== 0
          ? Math.sign(feetNum)
          : fields.whole.startsWith('-')
            ? -1
            : 1
    return feetNum * 12 + inchNum + fracNum * sign
  }

  it('round-trips positive and negative values', () => {
    const values = [
      154.25, -154.25, 12.25, -12.25, 7.375, -7.375, 0.5, -0.5, 10.75,
      -10.75, 144, -144, 0,
    ]
    for (const v of values) {
      expect(combine(splitForFields(v, 16))).toBeCloseTo(v, 9)
    }
  })
})

describe('toFraction', () => {
  it('converts a decimal to a reduced mixed fraction', () => {
    expect(toFraction(9.875, 64)).toEqual({
      negative: false,
      whole: 9,
      num: 7,
      den: 8,
    })
  })

  it('handles negatives', () => {
    expect(toFraction(-2.5, 64)).toEqual({
      negative: true,
      whole: 2,
      num: 1,
      den: 2,
    })
  })

  it('handles whole numbers', () => {
    expect(toFraction(3, 64)).toEqual({
      negative: false,
      whole: 3,
      num: 0,
      den: 1,
    })
    expect(toFraction(0, 64)).toEqual({
      negative: false,
      whole: 0,
      num: 0,
      den: 1,
    })
  })

  it('finds an exact fraction', () => {
    expect(toFraction(0.1, 64).num).toBe(1)
    expect(toFraction(0.1, 64).den).toBe(10)
    expect(toFraction(0.3333333, 64).den).toBe(3)
  })
})

describe('formatMixedFraction', () => {
  it('formats mixed fractions', () => {
    expect(formatMixedFraction({ negative: false, whole: 9, num: 7, den: 8 })).toBe(
      '9 7/8',
    )
    expect(
      formatMixedFraction({ negative: true, whole: 2, num: 1, den: 2 }),
    ).toBe('-2 1/2')
    expect(formatMixedFraction({ negative: false, whole: 3, num: 0, den: 1 })).toBe(
      '3',
    )
    expect(formatMixedFraction({ negative: false, whole: 0, num: 0, den: 1 })).toBe(
      '0',
    )
  })
})

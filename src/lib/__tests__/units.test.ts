import { describe, expect, it } from 'vitest'
import {
  formatMeterCmMm,
  fromInches,
  inchesToCm,
  inchesToFeet,
  inchesToMm,
  inchesToNool,
  splitMeterCmMm,
  toInches,
} from '../units'
import { normalizeMode } from '../types'

describe('toInches', () => {
  it('passes imperial values through', () => {
    expect(toInches(67.375, 'imperial')).toBe(67.375)
  })

  it('converts metric values', () => {
    expect(toInches(25.4, 'metric')).toBeCloseTo(1, 10)
    expect(toInches(1270, 'metric')).toBeCloseTo(50, 10)
  })
})

describe('conversions', () => {
  it('converts to feet', () => {
    expect(inchesToFeet(67.375)).toBeCloseTo(5.6146, 4)
  })

  it('converts to metric', () => {
    expect(inchesToMm(1)).toBe(25.4)
    expect(inchesToCm(1)).toBe(2.54)
  })

  it('converts to nool', () => {
    expect(inchesToNool(1)).toBe(8)
    expect(inchesToNool(67.375)).toBe(539)
  })
})

describe('mode conversion roundtrip', () => {
  it('fromInches reverses toInches for both modes', () => {
    expect(fromInches(toInches(154.25, 'imperial'), 'imperial')).toBe(154.25)
    expect(fromInches(toInches(154.25, 'metric'), 'metric')).toBeCloseTo(
      154.25,
      8,
    )
  })

  it('converts inches into each mode', () => {
    expect(fromInches(1, 'imperial')).toBe(1)
    expect(fromInches(1, 'metric')).toBe(25.4)
  })

  it('metric and imperial values round-trip through inches', () => {
    expect(fromInches(toInches(100, 'metric'), 'imperial')).toBeCloseTo(
      3.93700787,
      6,
    )
    expect(fromInches(12, 'metric')).toBeCloseTo(304.8, 8)
  })
})

describe('formatMeterCmMm', () => {
  it('formats combined values', () => {
    expect(formatMeterCmMm('1', '23', '4')).toBe('1 m 23 cm 4 mm')
    expect(formatMeterCmMm('2', '', '')).toBe('2 m 0 cm')
    expect(formatMeterCmMm('', '30', '')).toBe('30 cm')
    expect(formatMeterCmMm('', '', '5')).toBe('5 mm')
    expect(formatMeterCmMm('', '', '')).toBe('0 mm')
    expect(formatMeterCmMm('1', '5', '6.5')).toBe('1 m 5 cm 6.5 mm')
  })
})

describe('splitMeterCmMm', () => {
  it('splits a total-mm value', () => {
    expect(splitMeterCmMm(1234.56)).toEqual({
      meter: '1',
      cm: '23',
      mm: '4.56',
    })
    expect(splitMeterCmMm(152.4)).toEqual({ meter: '', cm: '15', mm: '2.4' })
    expect(splitMeterCmMm(7)).toEqual({ meter: '', cm: '', mm: '7' })
    expect(splitMeterCmMm(0)).toEqual({ meter: '', cm: '', mm: '' })
    expect(splitMeterCmMm(1230)).toEqual({ meter: '1', cm: '23', mm: '0' })
  })

  it('keeps the sign on the most significant component', () => {
    expect(splitMeterCmMm(-1234.56)).toEqual({
      meter: '-1',
      cm: '23',
      mm: '4.56',
    })
    expect(splitMeterCmMm(-15)).toEqual({ meter: '', cm: '-1', mm: '5' })
    expect(splitMeterCmMm(-7)).toEqual({ meter: '', cm: '', mm: '-7' })
  })
})

describe('normalizeMode', () => {
  it('keeps current modes as-is', () => {
    expect(normalizeMode('imperial')).toBe('imperial')
    expect(normalizeMode('metric')).toBe('metric')
  })

  it('maps legacy modes', () => {
    expect(normalizeMode('decimal_in')).toBe('imperial')
    expect(normalizeMode('decimal_ft')).toBe('imperial')
    expect(normalizeMode('nool')).toBe('imperial')
    expect(normalizeMode('mm')).toBe('metric')
  })

  it('falls back to imperial for unknown values', () => {
    expect(normalizeMode('bogus')).toBe('imperial')
    expect(normalizeMode(null)).toBe('imperial')
  })
})

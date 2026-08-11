import { describe, expect, it } from 'vitest'
import { parseLengthInput } from '../parse'

describe('parseLengthInput', () => {
  it('parses decimals', () => {
    expect(parseLengthInput('67.375')).toBe(67.375)
    expect(parseLengthInput('5')).toBe(5)
    expect(parseLengthInput('.5')).toBe(0.5)
    expect(parseLengthInput('-3.25')).toBe(-3.25)
    expect(parseLengthInput('5.')).toBe(5)
  })

  it('parses simple fractions', () => {
    expect(parseLengthInput('3/4')).toBe(0.75)
    expect(parseLengthInput('-1/2')).toBe(-0.5)
  })

  it('parses mixed fractions', () => {
    expect(parseLengthInput('7 3/8')).toBe(7.375)
    expect(parseLengthInput('-2 1/2')).toBe(-2.5)
    expect(parseLengthInput('12 5/8"')).toBe(12.625)
  })

  it('rejects garbage input', () => {
    expect(parseLengthInput('')).toBeNull()
    expect(parseLengthInput('   ')).toBeNull()
    expect(parseLengthInput('abc')).toBeNull()
    expect(parseLengthInput('5/0')).toBeNull()
    expect(parseLengthInput('-')).toBeNull()
  })
})

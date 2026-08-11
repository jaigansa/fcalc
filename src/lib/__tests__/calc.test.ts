import { describe, expect, it } from 'vitest'
import { fmtDec, initCalc, reduceCalc } from '../calc'
import type { CalcAction, Op } from '../calc'
import { formatFtIn } from '../fraction'
import { parseLengthInput } from '../parse'

function build(...actions: CalcAction[]) {
  return actions.reduce(reduceCalc, initCalc())
}

const op = (operator: Op): CalcAction => ({ type: 'op', op: operator })
const equals: CalcAction = { type: 'equals' }
const clear: CalcAction = { type: 'clear' }

function inches(ft: string, inchText: string): number {
  const feet = ft.trim() === '' ? 0 : Number(ft)
  const inc = inchText.trim() === '' ? 0 : (parseLengthInput(inchText) ?? 0)
  return feet * 12 + inc
}

function enter(ft: string, inc: string): CalcAction {
  return {
    type: 'field',
    value: inches(ft, inc),
    text: formatFtIn(ft, inc),
    ftIn: true,
  }
}

function enterMetric(value: string): CalcAction {
  return { type: 'field', value: Number(value), text: value, ftIn: false }
}

describe('basic arithmetic', () => {
  it('adds', () => {
    const s = build(enter('', '2'), op('+'), enter('', '3'), equals)
    expect(s.value).toBe(5)
    expect(s.operand).toBe('5')
  })

  it('subtracts', () => {
    expect(build(enter('', '10'), op('-'), enter('', '4'), equals).value).toBe(
      6,
    )
  })

  it('multiplies', () => {
    expect(build(enter('', '8'), op('×'), enter('', '2'), equals).value).toBe(
      16,
    )
  })

  it('divides', () => {
    expect(build(enter('', '8'), op('÷'), enter('', '2'), equals).value).toBe(4)
  })

  it('evaluates left to right across a chain', () => {
    const s = build(
      enter('', '2'),
      op('+'),
      enter('', '3'),
      op('×'),
      enter('', '4'),
      equals,
    )
    expect(s.value).toBe(20)
    expect(s.expr).toBe('2" + 3" × 4" = 20')
  })

  it('handles decimals', () => {
    const s = build(enter('', '0.1'), op('+'), enter('', '0.2'), equals)
    expect(s.value).toBeCloseTo(0.3, 10)
  })

  it('uses the result as the next operand', () => {
    const s = build(
      enter('', '2'),
      op('+'),
      enter('', '3'),
      equals,
      op('×'),
      enter('', '2'),
      equals,
    )
    expect(s.value).toBe(10)
  })

  it('reports division by zero', () => {
    const s = build(enter('', '8'), op('÷'), enter('', '0'), equals)
    expect(Number.isNaN(s.value)).toBe(true)
    expect(s.operand).toBe('Err')
  })
})

describe('field entry', () => {
  it('enters inches with a simple fraction', () => {
    const s = build(enter('', '3/4'))
    expect(s.operand).toBe('3/4"')
    expect(s.value).toBe(0.75)
    expect(s.ftIn).toBe(true)
  })

  it('enters a mixed fraction in the inches field', () => {
    const s = build(enter('', '7 3/8'))
    expect(s.operand).toBe('7 3/8"')
    expect(s.value).toBe(7.375)
  })

  it('enters feet and inches together', () => {
    const s = build(enter('12', '10 1/4'))
    expect(s.operand).toBe(`12' 10 1/4"`)
    expect(s.value).toBe(154.25)
  })

  it('enters feet only', () => {
    const s = build(enter('12', ''))
    expect(s.operand).toBe(`12' 0"`)
    expect(s.value).toBe(144)
  })

  it('adds two feet-and-inches measurements', () => {
    const s = build(enter('12', '10 1/4'), op('+'), enter('2', '3'), equals)
    expect(s.value).toBe(181.25)
    expect(s.expr).toBe(`12' 10 1/4" + 2' 3" = 181.25`)
  })

  it('multiplies a whole number by a fraction', () => {
    const s = build(enter('', '2'), op('×'), enter('', '3/4'), equals)
    expect(s.value).toBe(1.5)
  })

  it('chains an operator after a field entry', () => {
    const s = build(enter('', '5'), op('+'))
    expect(s.prev).toBe(5)
    expect(s.expr).toBe('5" + ')
  })

  it('enters metric values as mm', () => {
    const s = build(enterMetric('152.4'))
    expect(s.value).toBe(152.4)
    expect(s.ftIn).toBe(false)
  })

  it('evaluates in metric', () => {
    const s = build(enterMetric('100'), op('+'), enterMetric('50'), equals)
    expect(s.value).toBe(150)
  })

  it('starts a fresh entry after equals', () => {
    const s = build(
      enter('', '2'),
      op('+'),
      enter('', '3'),
      equals,
      enter('', '9'),
    )
    expect(s.expr).toBe('')
    expect(s.value).toBe(9)
  })

  it('shows the raw field text while the value is invalid', () => {
    const s = build({ type: 'field', value: NaN, text: '1/0"', ftIn: true })
    expect(Number.isNaN(s.value)).toBe(true)
    expect(s.operand).toBe('1/0"')
  })

  it('blocks operators while the field value is invalid', () => {
    const s = build(
      { type: 'field', value: NaN, text: '1/0"', ftIn: true },
      op('+'),
    )
    expect(s.op).toBeNull()
    expect(s.prev).toBeNull()
  })

  it('sets a value directly', () => {
    const s = build({ type: 'set', value: 5 })
    expect(s.value).toBe(5)
    expect(s.justEvaluated).toBe(true)
  })

  it('clears the calculation', () => {
    const s = build(enter('', '5'), op('+'), clear)
    expect(s.value).toBe(0)
    expect(s.prev).toBeNull()
    expect(s.expr).toBe('')
  })

  it('rounds long decimals when formatting', () => {
    expect(fmtDec(0.30000000000000004)).toBe('0.3')
    expect(fmtDec(Number.NaN)).toBe('Err')
  })
})

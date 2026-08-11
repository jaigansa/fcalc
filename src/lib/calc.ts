export type Op = '+' | '-' | '×' | '÷'

export interface CalcState {
  expr: string
  operand: string
  value: number
  prev: number | null
  op: Op | null
  justEvaluated: boolean
  ftIn: boolean
}

export type CalcAction =
  | { type: 'op'; op: Op }
  | { type: 'equals' }
  | { type: 'clear' }
  | { type: 'set'; value: number }
  | { type: 'field'; value: number; text: string; ftIn: boolean }

export type KeypadAction =
  | { type: 'digit'; digit: string }
  | { type: 'dot' }
  | { type: 'backspace' }
  | { type: 'negate' }
  | { type: 'op'; op: Op }
  | { type: 'equals' }
  | { type: 'clear' }

const SYMBOL: Record<Op, string> = {
  '+': '+',
  '-': '-',
  '×': '×',
  '÷': '÷',
}

export function fmtDec(n: number): string {
  if (!Number.isFinite(n)) return 'Err'
  return String(Number(n.toFixed(10)))
}

function compute(op: Op, a: number, b: number): number {
  switch (op) {
    case '+':
      return a + b
    case '-':
      return a - b
    case '×':
      return a * b
    case '÷':
      return b === 0 ? NaN : a / b
  }
}

export function initCalc(): CalcState {
  return {
    expr: '',
    operand: '0',
    value: 0,
    prev: null,
    op: null,
    justEvaluated: false,
    ftIn: false,
  }
}

export function reduceCalc(state: CalcState, action: CalcAction): CalcState {
  switch (action.type) {
    case 'clear':
      return initCalc()
    case 'set':
      return {
        ...initCalc(),
        operand: fmtDec(action.value),
        value: action.value,
        justEvaluated: true,
      }
    case 'field': {
      const s = state.justEvaluated ? initCalc() : state
      return {
        ...s,
        operand: action.text,
        value: action.value,
        ftIn: action.ftIn,
      }
    }
    case 'op': {
      if (!Number.isFinite(state.value)) return state
      let s = state
      if (s.justEvaluated) {
        return {
          ...initCalc(),
          prev: s.value,
          op: action.op,
          expr: `${s.operand} ${SYMBOL[action.op]} `,
        }
      }
      if (s.prev != null && s.op != null) {
        const result = compute(s.op, s.prev, s.value)
        return {
          ...s,
          prev: result,
          op: action.op,
          expr: `${s.expr}${s.operand} ${SYMBOL[action.op]} `,
          operand: '0',
          value: 0,
        }
      }
      return {
        ...s,
        prev: s.value,
        op: action.op,
        expr: `${s.operand} ${SYMBOL[action.op]} `,
        operand: '0',
        value: 0,
      }
    }
    case 'equals': {
      let s = state
      if (s.prev != null && s.op != null) {
        const result = compute(s.op, s.prev, s.value)
        const operand = fmtDec(result)
        return {
          ...initCalc(),
          operand,
          value: result,
          justEvaluated: true,
          expr: `${s.expr}${s.operand} = ${operand}`,
        }
      }
      return {
        ...s,
        justEvaluated: true,
        expr: s.expr === '' ? `${s.operand} =` : s.expr,
      }
    }
  }
}

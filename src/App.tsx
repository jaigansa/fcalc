import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  formatFeetFraction,
  formatFtIn,
  inchEntryParts,
  isPartialFraction,
  splitInchInput,
  toFeetFraction,
} from './lib/fraction'
import {
  formatMeterCmMm,
  fromInches,
  inchesToCm,
  inchesToFeet,
  inchesToMm,
  inchesToNool,
  splitMeterCmMm,
  toInches,
} from './lib/units'
import { initCalc, reduceCalc } from './lib/calc'
import type { KeypadAction, Op } from './lib/calc'
import { parseLengthInput } from './lib/parse'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { HistoryEntry, InputMode, Precision, Theme } from './lib/types'
import { normalizeMode } from './lib/types'
import ModeToggle from './components/ModeToggle'
import PrecisionSelect from './components/PrecisionSelect'
import Display from './components/Display'
import InputPanel from './components/InputPanel'
import type { Field } from './components/InputPanel'
import Numpad from './components/Numpad'
import ResultRow from './components/ResultRow'
import HistoryPanel from './components/HistoryPanel'

const HISTORY_LIMIT = 50

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return String(Number(n.toFixed(4)))
}

function newId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  }
}

export default function App() {
  const [mode, setMode] = useState<InputMode>('imperial')
  const [precision, setPrecision] = useState<Precision>(16)
  const [theme, setTheme] = useLocalStorage<Theme>('acalc:theme', 'dark')
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>(
    'acalc:history',
    [],
  )
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [calc, dispatch] = useReducer(reduceCalc, undefined, initCalc)

  const [feetText, setFeetText] = useState('')
  const [inchText, setInchText] = useState('')
  const [fracText, setFracText] = useState('')
  const [meterText, setMeterText] = useState('')
  const [cmText, setCmText] = useState('')
  const [mmText, setMmText] = useState('')
  const [numberText, setNumberText] = useState('')
  const [invalid, setInvalid] = useState<Field | null>(null)
  const [focused, setFocused] = useState<Field>('inch')
  const inputRefs = {
    feet: useRef<HTMLInputElement>(null),
    inch: useRef<HTMLInputElement>(null),
    meter: useRef<HTMLInputElement>(null),
    cm: useRef<HTMLInputElement>(null),
    mm: useRef<HTMLInputElement>(null),
    number: useRef<HTMLInputElement>(null),
  }
  const fracRef = useRef<HTMLSelectElement>(null)
  const numberRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    if (!calc.justEvaluated || !Number.isFinite(calc.value)) return
    setNumberText('')
    if (mode === 'metric') {
      setFeetText('')
      setInchText('')
      setFracText('')
      const s = splitMeterCmMm(calc.value)
      setMeterText(s.meter)
      setCmText(s.cm)
      setMmText(s.mm)
    } else {
      const f = toFeetFraction(calc.value, precision)
      if (f) {
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
        setFeetText(feet)
        setInchText(whole)
        setFracText(frac)
      } else {
        setFeetText('')
        setInchText('')
        setFracText('')
      }
      setMeterText('')
      setCmText('')
      setMmText('')
    }
    setInvalid(null)
    caretRef.current.feet = 0
    caretRef.current.inch = 0
    caretRef.current.meter = 0
    caretRef.current.cm = 0
    caretRef.current.mm = 0
    caretRef.current.number = 0
  }, [calc.justEvaluated, calc.value, mode, precision])

  const totalInches = useMemo(() => {
    if (!Number.isFinite(calc.value)) return NaN
    return calc.ftIn ? calc.value : toInches(calc.value, mode)
  }, [calc.value, mode, calc.ftIn])

  const result = useMemo(() => {
    if (!Number.isFinite(totalInches)) return null
    const frac = toFeetFraction(totalInches, precision)
    if (!frac) return null
    return {
      fraction: formatFeetFraction(frac),
      inches: `${formatNumber(totalInches)}"`,
      feet: `${formatNumber(inchesToFeet(totalInches))}'`,
      metric: `${formatNumber(inchesToMm(totalInches))} mm · ${formatNumber(
        inchesToCm(totalInches),
      )} cm`,
      nool: `${formatNumber(inchesToNool(totalInches))} Nool`,
    }
  }, [totalInches, precision])

  const clearFields = () => {
    setFeetText('')
    setInchText('')
    setFracText('')
    setMeterText('')
    setCmText('')
    setMmText('')
    setNumberText('')
    setInvalid(null)
    for (const f of Object.keys(caretRef.current) as Field[]) {
      caretRef.current[f] = 0
    }
  }

  const isScalar = calc.prev != null && (calc.op === '×' || calc.op === '÷')

  const focusField = (f: Field) => {
    inputRefs[f].current?.focus()
  }

  const resolveField = (): Field => {
    if (isScalar) return 'number'
    return mode === 'metric'
      ? focused === 'meter' || focused === 'cm' || focused === 'mm'
        ? focused
        : 'meter'
      : focused === 'meter' || focused === 'cm' || focused === 'mm'
        ? 'inch'
        : focused
  }

  const commitImperial = (ftStr: string, inStr: string, fracStr: string) => {
    const ft = ftStr.trim()
    let feetNum = 0
    let feetOk = true
    if (ft !== '') {
      feetNum = Number(ft)
      feetOk = Number.isFinite(feetNum)
    }
    let inc = inStr.trim()
    const fr = fracStr.trim()
    if (fr !== '') {
      inc = splitInchInput(inc).whole
    }
    if (isPartialFraction(inc)) {
      setInvalid(null)
      return
    }
    const inchNum = inc === '' ? 0 : (parseLengthInput(inc) ?? NaN)
    const inchOk = Number.isFinite(inchNum)
    const fracNum = fr === '' ? 0 : parseLengthInput(fr)
    const fracOk = fracNum != null
    const text = formatFtIn(ft, inc, fr)
    if (feetOk && inchOk && fracOk) {
      const sign =
        inchNum !== 0
          ? Math.sign(inchNum)
          : feetNum !== 0
            ? Math.sign(feetNum)
            : inc.startsWith('-')
              ? -1
              : 1
      dispatch({
        type: 'field',
        value: feetNum * 12 + inchNum + (fracNum ?? 0) * sign,
        text,
        ftIn: true,
      })
      setInvalid(null)
    } else {
      dispatch({ type: 'field', value: NaN, text, ftIn: true })
      setInvalid(!feetOk ? 'feet' : 'inch')
    }
  }

  const parseDecimal = (s: string): { value: number; ok: boolean } => {
    const t = s.trim()
    if (t === '') return { value: 0, ok: true }
    const n = Number(t)
    return { value: Number.isFinite(n) ? n : NaN, ok: Number.isFinite(n) }
  }

  const commitMetric = (mStr: string, cmStr: string, mmStr: string) => {
    const m = parseDecimal(mStr)
    const c = parseDecimal(cmStr)
    const milli = parseDecimal(mmStr)
    const text = formatMeterCmMm(mStr, cmStr, mmStr)
    if (m.ok && c.ok && milli.ok) {
      dispatch({
        type: 'field',
        value: m.value * 1000 + c.value * 10 + milli.value,
        text,
        ftIn: false,
      })
      setInvalid(null)
    } else {
      dispatch({ type: 'field', value: NaN, text, ftIn: false })
      setInvalid(m.ok ? (c.ok ? 'mm' : 'cm') : 'meter')
    }
  }

  const handleFeetChange = (value: string) => {
    setFeetText(value)
    commitImperial(value, inchText, fracText)
  }

  const handleInchChange = (value: string) => {
    setInchText(value)
    const { frac } = inchEntryParts(value, fracText)
    setFracText(frac)
    commitImperial(feetText, value, frac)
  }

  const handleFracChange = (value: string) => {
    setFracText(value)
    if (value !== '') {
      const { whole } = splitInchInput(inchText)
      setInchText(whole)
      commitImperial(feetText, whole, value)
    } else {
      commitImperial(feetText, inchText, '')
    }
  }

  const handleMeterChange = (value: string) => {
    setMeterText(value)
    commitMetric(value, cmText, mmText)
  }

  const handleCmChange = (value: string) => {
    setCmText(value)
    commitMetric(meterText, value, mmText)
  }

  const handleMmChange = (value: string) => {
    setMmText(value)
    commitMetric(meterText, cmText, value)
  }

  const commitNumber = (raw: string) => {
    const t = raw.trim()
    if (t === '') {
      dispatch({ type: 'field', value: 0, text: '', ftIn: false })
      setInvalid(null)
      return
    }
    const n = Number(t)
    if (Number.isFinite(n)) {
      dispatch({ type: 'field', value: n, text: t, ftIn: false })
      setInvalid(null)
    } else {
      dispatch({ type: 'field', value: NaN, text: t, ftIn: false })
      setInvalid('number')
    }
  }

  const handleNumberChange = (value: string) => {
    setNumberText(value)
    commitNumber(value)
  }

  const primaryField = (): Field =>
    isScalar ? 'number' : mode === 'metric' ? 'meter' : 'inch'

  const handleOp = (op: Op) => {
    if (!Number.isFinite(calc.value)) {
      if (invalid) focusField(invalid)
      return
    }
    clearFields()
    dispatch({ type: 'op', op })
    if (op === '×' || op === '÷') {
      setFocused('number')
      window.setTimeout(() => focusField('number'), 0)
    } else {
      focusField(primaryField())
    }
  }

  const handleEquals = () => {
    if (!Number.isFinite(calc.value)) {
      if (invalid) focusField(invalid)
      return
    }
    dispatch({ type: 'equals' })
    inputRefs[primaryField()].current?.blur()
  }

  const handleClear = () => {
    clearFields()
    dispatch({ type: 'clear' })
    focusField(primaryField())
  }

  const caretRef = useRef<Record<Field, number>>({
    feet: 0,
    inch: 0,
    meter: 0,
    cm: 0,
    mm: 0,
    number: 0,
  })

  const fieldText: Record<Field, string> = {
    feet: feetText,
    inch: inchText,
    meter: meterText,
    cm: cmText,
    mm: mmText,
    number: numberText,
  }

  const changeHandlers: Record<Field, (v: string) => void> = {
    feet: handleFeetChange,
    inch: handleInchChange,
    meter: handleMeterChange,
    cm: handleCmChange,
    mm: handleMmChange,
    number: handleNumberChange,
  }

  const onCaret = (f: Field, pos: number) => {
    caretRef.current[f] = pos
  }

  const setCaret = (f: Field, pos: number) => {
    caretRef.current[f] = pos
    window.setTimeout(() => {
      const el = inputRefs[f].current
      if (!el) return
      el.focus()
      const p = Math.min(pos, el.value.length)
      el.setSelectionRange(p, p)
    }, 0)
  }

  const insertIntoFocused = (text: string) => {
    const f = resolveField()
    const cur = fieldText[f]
    const pos = caretRef.current[f]
    const next = cur.slice(0, pos) + text + cur.slice(pos)
    changeHandlers[f](next)
    setCaret(f, pos + text.length)
  }

  const backspaceFocused = () => {
    const f = resolveField()
    const cur = fieldText[f]
    const pos = caretRef.current[f]
    const next = pos > 0 ? cur.slice(0, pos - 1) + cur.slice(pos) : cur
    changeHandlers[f](next)
    setCaret(f, Math.max(0, pos - 1))
  }

  const toggleSignFocused = () => {
    const f = resolveField()
    const cur = fieldText[f]
    if (cur === '') return
    const next = cur.startsWith('-') ? cur.slice(1) : `-${cur}`
    changeHandlers[f](next)
    setCaret(f, next.length)
  }

  const handleKeypad = (action: KeypadAction) => {
    switch (action.type) {
      case 'digit':
        insertIntoFocused(action.digit)
        break
      case 'dot':
        insertIntoFocused('.')
        break
      case 'backspace':
        backspaceFocused()
        break
      case 'negate':
        toggleSignFocused()
        break
      case 'op':
        handleOp(action.op)
        break
      case 'equals':
        handleEquals()
        break
      case 'clear':
        handleClear()
        break
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      const tag = t?.tagName
      const inInput = tag === 'INPUT' || tag === 'SELECT'
      const key = e.key
      if (inInput) {
        if (key === 'Enter' || key === '=') {
          handleEquals()
        } else if (key === 'Escape') {
          handleClear()
        } else if (key === '+') {
          handleOp('+')
        } else if (key === '*') {
          handleOp('×')
        } else if (key === '/') {
          const isFractionTarget =
            (mode === 'imperial' && t === inputRefs.inch.current) ||
            tag === 'SELECT'
          if (!isFractionTarget) {
            e.preventDefault()
            return
          }
          return
        } else {
          return
        }
        e.preventDefault()
        return
      }
      if (key === '+') handleOp('+')
      else if (key === '-') handleOp('-')
      else if (key === '*') handleOp('×')
      else if (key === '/') handleOp('÷')
      else if (key === 'Enter' || key === '=') handleEquals()
      else if (key === 'Escape' || key.toLowerCase() === 'c') handleClear()
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const handleModeChange = (m: InputMode) => {
    const prev = mode
    setMode(m)
    setFocused(m === 'metric' ? 'meter' : 'inch')
    if (m !== prev) {
      if (Number.isFinite(calc.value) && calc.prev == null) {
        const inches = calc.ftIn ? calc.value : toInches(calc.value, prev)
        dispatch({ type: 'set', value: fromInches(inches, m) })
      } else {
        clearFields()
        dispatch({ type: 'clear' })
      }
    }
  }

  const addToHistory = () => {
    if (!Number.isFinite(calc.value) || !result) return
    const entry: HistoryEntry = {
      id: newId(),
      mode,
      precision,
      expression: calc.expr || `${calc.operand} =`,
      fraction: result.fraction,
      value: calc.value,
      timestamp: Date.now(),
    }
    setHistory((prev) => {
      const top = prev[0]
      if (
        top &&
        top.expression === entry.expression &&
        top.value === entry.value &&
        top.precision === entry.precision &&
        top.mode === entry.mode
      ) {
        return prev
      }
      return [entry, ...prev].slice(0, HISTORY_LIMIT)
    })
  }

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopiedKey(key)
    window.setTimeout(() => {
      setCopiedKey((c) => (c === key ? null : c))
    }, 1500)
  }

  const restore = (entry: HistoryEntry) => {
    const m = normalizeMode(entry.mode)
    setMode(m)
    setFocused(m === 'metric' ? 'meter' : 'inch')
    setPrecision(entry.precision)
    dispatch({ type: 'set', value: entry.value })
  }

  return (
    <main className="page">
      <div className="card">
        <header className="header">
          <h1>Fraction Calculator</h1>
          <div className="header-actions">
            <button
              className="icon-btn"
              type="button"
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              aria-label="Toggle color theme"
            >
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0-7a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 16a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm11-9h-2a1 1 0 1 1 0-2h2a1 1 0 1 1 0 2ZM5 12a1 1 0 0 1-1 1H2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1Zm14.5-5.1a1 1 0 0 1 0 1.4l-1.4 1.4a1 1 0 1 1-1.4-1.4l1.4-1.4a1 1 0 0 1 1.4 0ZM5.9 18.3a1 1 0 0 1 0 1.4 1 1 0 0 1-1.4 0l-1.4-1.4a1 1 0 1 1 1.4-1.4l1.4 1.4Zm1.4-12.9a1 1 0 0 1-1.4 0l-1.4-1.4a1 1 0 0 1 1.4-1.4l1.4 1.4a1 1 0 0 1 0 1.4Zm12.9 12.9a1 1 0 0 1-1.4 1.4l-1.4-1.4a1 1 0 0 1 1.4-1.4l1.4 1.4Z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.7 15.3a1 1 0 0 0-1.2-.2 8 8 0 0 1-11.6-11.6 1 1 0 0 0-1.3-1.3 10 10 0 1 0 14.1 14.1 1 1 0 0 0 0-1Z" />
                </svg>
              )}
            </button>
            <ModeToggle value={mode} onChange={handleModeChange} />
          </div>
        </header>

        <Display
          expr={calc.expr}
          operand={calc.operand}
          value={calc.value}
          totalInches={totalInches}
        />

        <InputPanel
          mode={mode}
          precision={precision}
          scalar={isScalar}
          feet={feetText}
          inch={inchText}
          frac={fracText}
          meter={meterText}
          cm={cmText}
          mm={mmText}
          number={numberText}
          invalid={invalid}
          inputRefs={inputRefs}
          fracRef={fracRef}
          numberRef={numberRef}
          onFocus={setFocused}
          onCaret={onCaret}
          onNumberChange={handleNumberChange}
          onFeetChange={handleFeetChange}
          onInchChange={handleInchChange}
          onFracChange={handleFracChange}
          onMeterChange={handleMeterChange}
          onCmChange={handleCmChange}
          onMmChange={handleMmChange}
        />

        <PrecisionSelect value={precision} onChange={setPrecision} />

        <Numpad onAction={handleKeypad} />
        <p className="hint">
          Enter measurements in the fields (Inches accepts fractions like 10
          1/4, or pick from the Fraction dropdown). After pressing × or ÷,
          enter a plain number. Tap the display to toggle a tape view. Keypad
          keys type into the focused field. Keyboard: +, -, *, Enter to
          evaluate, Esc to clear.
        </p>

        <section className="results" aria-label="Results">
          <ResultRow
            label="Feet & Fraction"
            value={result?.fraction ?? '—'}
            highlight
            copyKey="fraction"
            copied={copiedKey === 'fraction'}
            onCopy={copy}
          />
          <ResultRow
            label="Total Inches"
            value={result?.inches ?? '—'}
            copyKey="inches"
            copied={copiedKey === 'inches'}
            onCopy={copy}
          />
          <ResultRow
            label="Total Feet"
            value={result?.feet ?? '—'}
            copyKey="feet"
            copied={copiedKey === 'feet'}
            onCopy={copy}
          />
          <ResultRow
            label="Metric"
            value={result?.metric ?? '—'}
            copyKey="metric"
            copied={copiedKey === 'metric'}
            onCopy={copy}
          />
          <ResultRow
            label="Nool"
            value={result?.nool ?? '—'}
            copyKey="nool"
            copied={copiedKey === 'nool'}
            onCopy={copy}
          />
        </section>

        <div className="save-row">
          <button
            className="save-btn"
            type="button"
            onClick={addToHistory}
            disabled={!Number.isFinite(calc.value)}
          >
            Save to History
          </button>
        </div>

        <HistoryPanel
          history={history}
          onClear={() => setHistory([])}
          onRestore={restore}
        />
      </div>
    </main>
  )
}

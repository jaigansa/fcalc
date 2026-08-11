import type { KeypadAction } from '../lib/calc'

interface Props {
  onAction: (action: KeypadAction) => void
}

interface Key {
  label: string
  aria?: string
  action: KeypadAction
  cls: 'num' | 'fn' | 'op' | 'equals'
}

const KEYS: Key[][] = [
  [
    { label: 'C', action: { type: 'clear' }, cls: 'fn' },
    { label: '⌫', aria: 'Backspace', action: { type: 'backspace' }, cls: 'fn' },
    { label: '±', aria: 'Negate', action: { type: 'negate' }, cls: 'fn' },
    { label: '÷', action: { type: 'op', op: '÷' }, cls: 'op' },
  ],
  [
    { label: '7', action: { type: 'digit', digit: '7' }, cls: 'num' },
    { label: '8', action: { type: 'digit', digit: '8' }, cls: 'num' },
    { label: '9', action: { type: 'digit', digit: '9' }, cls: 'num' },
    { label: '×', action: { type: 'op', op: '×' }, cls: 'op' },
  ],
  [
    { label: '4', action: { type: 'digit', digit: '4' }, cls: 'num' },
    { label: '5', action: { type: 'digit', digit: '5' }, cls: 'num' },
    { label: '6', action: { type: 'digit', digit: '6' }, cls: 'num' },
    { label: '-', action: { type: 'op', op: '-' }, cls: 'op' },
  ],
  [
    { label: '1', action: { type: 'digit', digit: '1' }, cls: 'num' },
    { label: '2', action: { type: 'digit', digit: '2' }, cls: 'num' },
    { label: '3', action: { type: 'digit', digit: '3' }, cls: 'num' },
    { label: '+', action: { type: 'op', op: '+' }, cls: 'op' },
  ],
  [
    { label: '0', action: { type: 'digit', digit: '0' }, cls: 'num' },
    { label: '.', action: { type: 'dot' }, cls: 'num' },
    { label: '=', action: { type: 'equals' }, cls: 'equals' },
  ],
]

export default function Numpad({ onAction }: Props) {
  return (
    <div className="numpad" role="group" aria-label="Calculator keypad">
      {KEYS.map((row, i) => (
        <div className="numpad-row" key={i}>
          {row.map((k) => (
            <button
              key={k.label}
              type="button"
              className={`num-key ${k.cls}`}
              aria-label={k.aria ?? k.label}
              onClick={() => onAction(k.action)}
            >
              {k.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

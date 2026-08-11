import { useState } from 'react'
import { formatMixedFraction, toFraction } from '../lib/fraction'
import TapeView from './TapeView'

interface Props {
  expr: string
  operand: string
  value: number
  totalInches: number
}

export default function Display({ expr, operand, value, totalInches }: Props) {
  const [showTape, setShowTape] = useState(false)
  const error = !Number.isFinite(value)
  const mf = error ? null : toFraction(value, 64)
  const fracHint = mf && mf.num !== 0 ? formatMixedFraction(mf) : ''

  const toggle = () => setShowTape((s) => !s)

  return (
    <div
      className={`display${error ? ' error' : ''}${showTape ? ' tape' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={showTape}
      aria-label="Toggle measurement tape view"
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          e.stopPropagation()
          toggle()
        }
      }}
    >
      <div className="display-top">
        <span className="display-toggle-hint">
          {showTape ? 'Value' : 'Tape'}
        </span>
        <span className="display-expr">{expr}</span>
      </div>
      {showTape ? (
        <TapeView totalInches={totalInches} />
      ) : (
        <>
          <div className="display-value">{error ? 'Error' : operand}</div>
          <div className="display-frac">
            {fracHint ? `≈ ${fracHint}` : '\u00A0'}
          </div>
        </>
      )}
    </div>
  )
}

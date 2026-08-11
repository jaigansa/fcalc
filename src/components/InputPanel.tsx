import type { RefObject } from 'react'
import type { InputMode, Precision } from '../lib/types'
import { fractionOptions } from '../lib/fraction'

export type Field = 'feet' | 'inch' | 'meter' | 'cm' | 'mm' | 'number'

interface Props {
  mode: InputMode
  precision: Precision
  scalar: boolean
  feet: string
  inch: string
  frac: string
  meter: string
  cm: string
  mm: string
  number: string
  invalid: Field | null
  inputRefs: Record<Field, RefObject<HTMLInputElement | null>>
  fracRef: RefObject<HTMLSelectElement | null>
  numberRef: RefObject<HTMLInputElement | null>
  onFocus: (field: Field) => void
  onCaret: (field: Field, pos: number) => void
  onNumberChange: (value: string) => void
  onFeetChange: (value: string) => void
  onInchChange: (value: string) => void
  onFracChange: (value: string) => void
  onMeterChange: (value: string) => void
  onCmChange: (value: string) => void
  onMmChange: (value: string) => void
}

export default function InputPanel({
  mode,
  precision,
  scalar,
  feet,
  inch,
  frac,
  meter,
  cm,
  mm,
  number,
  invalid,
  inputRefs,
  fracRef,
  numberRef,
  onFocus,
  onCaret,
  onNumberChange,
  onFeetChange,
  onInchChange,
  onFracChange,
  onMeterChange,
  onCmChange,
  onMmChange,
}: Props) {
  if (scalar) {
    return (
      <div className="input-panel">
        <div className="field-group">
          <label htmlFor="number-input">Number</label>
          <div className={`unit-input${invalid === 'number' ? ' invalid' : ''}`}>
            <input
              id="number-input"
              ref={numberRef}
              value={number}
              inputMode="decimal"
              placeholder="0"
              onChange={(e) => onNumberChange(e.target.value)}
              onFocus={() => onFocus('number')}
              onSelect={(e) =>
                onCaret('number', e.currentTarget.selectionStart ?? 0)
              }
            />
          </div>
        </div>
        {invalid === 'number' && (
          <p className="field-error">Enter a valid number</p>
        )}
      </div>
    )
  }

  if (mode === 'metric') {
    return (
      <div className="input-panel">
        <div className="mcm-fields">
          <div className="field-group">
            <label htmlFor="meter-input">Meters</label>
            <div className={`unit-input${invalid === 'meter' ? ' invalid' : ''}`}>
              <input
                id="meter-input"
                ref={inputRefs.meter}
                value={meter}
                inputMode="decimal"
                placeholder="0"
                onChange={(e) => onMeterChange(e.target.value)}
                onFocus={() => onFocus('meter')}
                onSelect={(e) =>
                  onCaret('meter', e.currentTarget.selectionStart ?? 0)
                }
              />
              <span className="unit-suffix">m</span>
            </div>
          </div>
          <div className="field-group">
            <label htmlFor="cm-input">Centimeters</label>
            <div className={`unit-input${invalid === 'cm' ? ' invalid' : ''}`}>
              <input
                id="cm-input"
                ref={inputRefs.cm}
                value={cm}
                inputMode="decimal"
                placeholder="0"
                onChange={(e) => onCmChange(e.target.value)}
                onFocus={() => onFocus('cm')}
                onSelect={(e) =>
                  onCaret('cm', e.currentTarget.selectionStart ?? 0)
                }
              />
              <span className="unit-suffix">cm</span>
            </div>
          </div>
          <div className="field-group">
            <label htmlFor="mm-input">Millimeters</label>
            <div className={`unit-input${invalid === 'mm' ? ' invalid' : ''}`}>
              <input
                id="mm-input"
                ref={inputRefs.mm}
                value={mm}
                inputMode="decimal"
                placeholder="0"
                onChange={(e) => onMmChange(e.target.value)}
                onFocus={() => onFocus('mm')}
                onSelect={(e) =>
                  onCaret('mm', e.currentTarget.selectionStart ?? 0)
                }
              />
              <span className="unit-suffix">mm</span>
            </div>
          </div>
        </div>
        {invalid === 'meter' && (
          <p className="field-error">Enter a valid number of meters</p>
        )}
        {invalid === 'cm' && (
          <p className="field-error">Enter a valid number of centimeters</p>
        )}
        {invalid === 'mm' && (
          <p className="field-error">Enter a valid number of millimeters</p>
        )}
      </div>
    )
  }

  return (
    <div className="input-panel">
      <div className="ftin-fields">
        <div className="field-group">
          <label htmlFor="feet-input">Feet</label>
          <div className={`unit-input${invalid === 'feet' ? ' invalid' : ''}`}>
            <input
              id="feet-input"
              ref={inputRefs.feet}
              value={feet}
              inputMode="decimal"
              placeholder="0"
              onChange={(e) => onFeetChange(e.target.value)}
              onFocus={() => onFocus('feet')}
              onSelect={(e) =>
                onCaret('feet', e.currentTarget.selectionStart ?? 0)
              }
            />
            <span className="unit-suffix">&prime;</span>
          </div>
        </div>
        <div className="field-group">
          <label htmlFor="inch-input">Inches</label>
          <div className={`unit-input${invalid === 'inch' ? ' invalid' : ''}`}>
            <input
              id="inch-input"
              ref={inputRefs.inch}
              value={inch}
              inputMode="text"
              placeholder="0 1/2"
              onChange={(e) => onInchChange(e.target.value)}
              onFocus={() => onFocus('inch')}
              onSelect={(e) =>
                onCaret('inch', e.currentTarget.selectionStart ?? 0)
              }
            />
            <span className="unit-suffix">&Prime;</span>
          </div>
        </div>
        <div className="field-group">
          <label htmlFor="frac-input">Fraction</label>
          <select
            id="frac-input"
            ref={fracRef}
            value={frac}
            onChange={(e) => onFracChange(e.target.value)}
          >
            <option value="">None</option>
            {fractionOptions(precision).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </div>
      {invalid === 'feet' && (
        <p className="field-error">Enter a valid number of feet</p>
      )}
      {invalid === 'inch' && (
        <p className="field-error">
          Enter a valid value, e.g. 10 1/4 or 3/4
        </p>
      )}
    </div>
  )
}

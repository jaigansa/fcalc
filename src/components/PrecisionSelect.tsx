import type { Precision } from '../lib/types'

interface Props {
  value: Precision
  onChange: (precision: Precision) => void
}

const OPTIONS: { value: Precision; label: string }[] = [
  { value: 4, label: '1/4"' },
  { value: 8, label: '1/8"' },
  { value: 16, label: '1/16"' },
  { value: 32, label: '1/32"' },
  { value: 64, label: '1/64"' },
]

export default function PrecisionSelect({ value, onChange }: Props) {
  return (
    <div className="field-group">
      <label htmlFor="precision">Fraction Precision</label>
      <select
        id="precision"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as Precision)}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

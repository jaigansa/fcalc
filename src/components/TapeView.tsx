interface Props {
  totalInches: number
}

interface Tick {
  pct: number
  level: 'ft' | 'in' | 'half' | 'quarter'
  label?: string
}

function trim(n: number): string {
  return String(Number(n.toFixed(2)))
}

function formatLabel(inches: number): string {
  const neg = inches < 0 ? '-' : ''
  const a = Math.abs(inches)
  const ft = Math.floor(a / 12)
  const rem = a - ft * 12
  const remTxt = rem === 0 ? '' : `${trim(rem)} in`
  const ftTxt = ft > 0 ? `${ft} ft` : ''
  if (ftTxt && remTxt) return `${neg}${ftTxt} ${remTxt}`
  return `${neg}${ftTxt || remTxt || '0 in'}`
}

export default function TapeView({ totalInches }: Props) {
  if (!Number.isFinite(totalInches)) {
    return <div className="tape-empty">No measurement yet</div>
  }

  const total = Math.abs(totalInches)
  const spanFeet = Math.max(1, Math.min(Math.ceil(total / 12), 12))
  const spanIn = spanFeet * 12
  const pct = Math.max(0, Math.min(1, total / spanIn)) * 100

  const ticks: Tick[] = []
  const quarterMax = spanIn * 4
  for (let q = 0; q <= quarterMax; q++) {
    const v = q / 4
    const isFt = q % 48 === 0
    const isIn = q % 4 === 0
    const isHalf = q % 2 === 0
    const show = spanFeet <= 2 ? true : spanFeet <= 6 ? isHalf : isIn
    if (!show) continue
    ticks.push({
      pct: (v / spanIn) * 100,
      level: isFt ? 'ft' : isIn ? 'in' : isHalf ? 'half' : 'quarter',
      label: isFt ? String(v / 12) : undefined,
    })
  }

  return (
    <div className="tape">
      <div className="tape-bubble">{formatLabel(totalInches)}</div>
      <div className="tape-track">
        <div className="tape-fill" style={{ width: `${pct}%` }} />
        {ticks.map((t) => (
          <div
            key={t.pct}
            className={`tape-tick tape-tick-${t.level}`}
            style={{ left: `${t.pct}%` }}
          >
            {t.label && <span className="tape-tick-label">{t.label}</span>}
          </div>
        ))}
        <div className="tape-marker" style={{ left: `${pct}%` }} />
      </div>
    </div>
  )
}

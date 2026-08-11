interface Props {
  label: string
  value: string
  highlight?: boolean
  copyKey: string
  copied: boolean
  onCopy: (key: string, text: string) => void
}

export default function ResultRow({
  label,
  value,
  highlight,
  copyKey,
  copied,
  onCopy,
}: Props) {
  return (
    <div className={`result-box${highlight ? ' highlight' : ''}`}>
      <div>
        <div className="result-label">{label}</div>
        <div className="result-val">{value}</div>
      </div>
      <button
        className={`copy-btn${copied ? ' copied' : ''}`}
        onClick={() => onCopy(copyKey, value)}
        aria-label={`Copy ${label}`}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

import type { InputMode } from '../lib/types'

interface Props {
  value: InputMode
  onChange: (mode: InputMode) => void
}

export default function ModeToggle({ value, onChange }: Props) {
  const metric = value === 'metric'
  return (
    <button
      className="icon-btn mode-btn"
      type="button"
      onClick={() => onChange(metric ? 'imperial' : 'metric')}
      title={metric ? 'Switch to Imperial' : 'Switch to Metric'}
      aria-label={metric ? 'Switch to Imperial' : 'Switch to Metric'}
      aria-pressed={metric}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
        <path d="m14.5 12.5 2-2" />
        <path d="m11.5 9.5 2-2" />
        <path d="m8.5 6.5 2-2" />
        <path d="m17.5 15.5 2-2" />
      </svg>
      <span className="mode-label">{metric ? 'mm' : 'in'}</span>
    </button>
  )
}

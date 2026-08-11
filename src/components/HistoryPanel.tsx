import type { HistoryEntry } from '../lib/types'

interface Props {
  history: HistoryEntry[]
  onClear: () => void
  onRestore: (entry: HistoryEntry) => void
}

function precisionLabel(p: number): string {
  return `1/${p}"`
}

export default function HistoryPanel({ history, onClear, onRestore }: Props) {
  return (
    <section className="history">
      <div className="history-header">
        <h2>History</h2>
        {history.length > 0 && (
          <button className="clear-btn" onClick={onClear}>
            Clear
          </button>
        )}
      </div>
      {history.length === 0 ? (
        <p className="history-empty">
          No saved calculations yet. Calculate something and press Save to
          History.
        </p>
      ) : (
        <ul className="history-list">
          {history.map((entry) => (
            <li key={entry.id}>
              <button
                className="history-item"
                onClick={() => onRestore(entry)}
                title="Restore this calculation"
              >
                <span className="history-primary">{entry.fraction}</span>
                <span className="history-meta">
                  {entry.expression} · {precisionLabel(entry.precision)} ·{' '}
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

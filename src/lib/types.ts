export type InputMode = 'imperial' | 'metric'

const LEGACY_MODES: Record<string, InputMode> = {
  decimal_in: 'imperial',
  decimal_ft: 'imperial',
  nool: 'imperial',
  mm: 'metric',
}

/** Map a stored mode value (including pre-simplification modes) to an InputMode. */
export function normalizeMode(raw: string | null | undefined): InputMode {
  if (raw === 'imperial' || raw === 'metric') return raw
  const mapped = raw ? LEGACY_MODES[raw] : undefined
  return mapped ?? 'imperial'
}

export type Precision = 4 | 8 | 16 | 32 | 64

export type Theme = 'dark' | 'light'

export interface FractionResult {
  sign: 1 | -1
  feet: number
  inches: number
  num: number
  den: number
}

export interface HistoryEntry {
  id: string
  mode: InputMode
  precision: Precision
  expression: string
  fraction: string
  value: number
  timestamp: number
}

export interface ParseResult {
  ok: boolean
  totalInches: number
}

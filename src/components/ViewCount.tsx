import { Eye } from 'lucide-react'

interface ViewCountProps {
  count: number
}

/**
 * Format compact : 1 234 → « 1.2k », 2 500 000 → « 2.5M ».
 * Pas de « .0 » inutile (1 000 → « 1k ») et pas de « 1000k » à la frontière :
 * 999 999 → « 1M ».
 */
function formatCompact(num: number): string {
  if (num >= 1_000_000) {
    return `${Math.round(num / 100_000) / 10}M`
  }
  if (num >= 1_000) {
    const thousands = Math.round(num / 100) / 10
    return thousands >= 1000 ? '1M' : `${thousands}k`
  }
  return String(num)
}

const exactFormatter = new Intl.NumberFormat('fr-FR')

export function ViewCount({ count }: ViewCountProps) {
  // Valeur défensive : null, undefined, NaN ou négatif venant de la base → 0
  const safeCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0

  const compact = formatCompact(safeCount)
  const exact = exactFormatter.format(safeCount)
  const unit = safeCount > 1 ? 'vues' : 'vue'

  return (
    <div
      title={`${exact} ${unit}`}
      aria-label={`${exact} ${unit}`}
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px] font-medium text-[var(--text-secondary)]"
    >
      <Eye size={12} aria-hidden="true" className="shrink-0" />
      <span aria-hidden="true" className="tabular-nums">
        {compact} {unit}
      </span>
    </div>
  )
}
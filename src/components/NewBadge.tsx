import { Sparkles } from 'lucide-react'

interface NewBadgeProps {
  publishedAt: string | null | undefined
  /** Durée pendant laquelle l'article est considéré comme nouveau (défaut : 24 h) */
  maxAgeHours?: number
  /** Texte affiché (défaut : "Nouveau") */
  label?: string
  className?: string
}

const HOUR_MS = 60 * 60 * 1000

export function NewBadge({
  publishedAt,
  maxAgeHours = 24,
  label = 'Nouveau',
  className = '',
}: NewBadgeProps) {
  if (!publishedAt) return null

  const publishedTime = new Date(publishedAt).getTime()

  // Date invalide : on n'affiche rien (avant, NaN laissait passer le badge)
  if (Number.isNaN(publishedTime)) return null

  const ageMs = Date.now() - publishedTime

  // Article trop ancien : pas de badge. Une date légèrement future
  // (décalage d'horloge) reste acceptée.
  if (ageMs >= maxAgeHours * HOUR_MS) return null

  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-1.5 py-px',
        'text-[10px] font-semibold leading-4 tracking-wide whitespace-nowrap',
        // Rouge plein + texte blanc : contraste identique en clair et en sombre,
        // sans dépendre de --accent ni d'une variante dark:
        'bg-red-600 text-white',
        'ring-1 ring-inset ring-white/20',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Sparkles size={9} strokeWidth={2.5} aria-hidden="true" className="shrink-0" />
      {label}
    </span>
  )
}
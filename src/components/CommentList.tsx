import { MessageSquare, User } from 'lucide-react'

interface Comment {
  id: string
  content: string
  author_name: string | null
  user_id: string | null
  created_at: string
}

interface CommentListProps {
  comments: Comment[]
  max?: number
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60_000)

  if (diffMin < 1) return "À l'instant"
  if (diffMin < 60) return `Il y a ${diffMin} min`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `Il y a ${diffHours} h`
  if (diffHours < 48) return 'Hier'

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' }),
  })
}

export function CommentList({ comments, max }: CommentListProps) {
  const limit = typeof max === 'number' && max > 0 ? max : undefined
  const displayComments = limit ? comments.slice(0, limit) : comments
  const remaining = limit ? Math.max(comments.length - limit, 0) : 0

  if (displayComments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] px-4 py-6 text-center">
        <MessageSquare
          size={16}
          className="text-[var(--text-muted)]"
          aria-hidden="true"
        />
        <p className="text-[13px] text-[var(--text-muted)]">
          Aucun commentaire pour le moment
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {displayComments.map((comment) => {
          const name = comment.author_name?.trim() || 'Anonyme'
          const isAnonymous = !comment.author_name?.trim()
          const date = new Date(comment.created_at)
          const isValidDate = !Number.isNaN(date.getTime())

          return (
            <li
              key={comment.id}
              className="flex gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2.5 sm:p-3"
            >
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[11px] font-semibold uppercase text-[var(--text-secondary)]"
                aria-hidden="true"
              >
                {isAnonymous ? (
                  <User size={12} className="text-[var(--text-muted)]" />
                ) : (
                  name.charAt(0)
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="truncate text-xs font-medium text-[var(--text-primary)]">
                    {name}
                  </span>
                  {isValidDate && (
                    <>
                      <span
                        className="text-[11px] text-[var(--text-muted)]"
                        aria-hidden="true"
                      >
                        ·
                      </span>
                      <time
                        dateTime={date.toISOString()}
                        title={date.toLocaleString('fr-FR')}
                        suppressHydrationWarning
                        className="shrink-0 text-[11px] text-[var(--text-muted)]"
                      >
                        {formatDate(comment.created_at)}
                      </time>
                    </>
                  )}
                </div>

                <p className="mt-0.5 whitespace-pre-line break-words text-[13px] leading-snug text-[var(--text-secondary)]">
                  {comment.content}
                </p>
              </div>
            </li>
          )
        })}
      </ul>

      {remaining > 0 && (
        <p className="text-center text-xs text-[var(--text-muted)]">
          +{remaining} autre{remaining > 1 ? 's' : ''} commentaire
          {remaining > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
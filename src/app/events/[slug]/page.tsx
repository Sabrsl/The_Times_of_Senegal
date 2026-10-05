import { EntityLayout } from '@/components/EntityLayout'
import { getEventBySlug, getArticlesByEvent } from '@/lib/supabase/entities'
import { notFound } from 'next/navigation'
import { Calendar } from 'lucide-react'

export const revalidate = 300

export default async function EventPage({ params }: { params: { slug: string } }) {
  const event = await getEventBySlug(params.slug)

  if (!event) {
    notFound()
  }

  const relatedArticles = await getArticlesByEvent(event.id)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  return (
    <EntityLayout
      title={event.name}
      subtitle="Événement"
      image={event.image}
      description={event.description}
      relatedArticles={relatedArticles}
    >
      {event.event_date && (
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-4" style={{ fontSize: '11px' }}>
          <Calendar size={12} />
          <span>{formatDate(event.event_date)}</span>
        </div>
      )}
    </EntityLayout>
  )
}

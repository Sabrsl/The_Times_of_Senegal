import { EntityListing } from '@/components/EntityListing'
import { getAllEvents } from '@/lib/supabase/entities'

export const revalidate = 60

export default async function EventsPage() {
  const events = await getAllEvents()

  return (
    <EntityListing
      title="Événements"
      items={events.map(event => ({
        id: event.id,
        name: event.name,
        slug: event.slug,
        description: event.description,
        image: event.image,
      }))}
      itemType="event"
    />
  )
}

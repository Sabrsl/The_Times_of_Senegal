import { EntityListing } from '@/components/EntityListing'
import { getAllPlaces } from '@/lib/supabase/entities'

export const revalidate = 60

export default async function PlacesPage() {
  const places = await getAllPlaces()

  return (
    <EntityListing
      title="Lieux"
      items={places.map(place => ({
        id: place.id,
        name: place.name,
        slug: place.slug,
        description: place.description,
        image: place.image,
      }))}
      itemType="place"
    />
  )
}

import { EntityListing } from '@/components/EntityListing'
import { getAllPeople } from '@/lib/supabase/entities'

export const revalidate = 60

export default async function PeoplePage() {
  const people = await getAllPeople()

  return (
    <EntityListing
      title="Personnes"
      items={people.map(person => ({
        id: person.id,
        name: person.name,
        slug: person.slug,
        description: person.description,
        image: person.image,
      }))}
      itemType="person"
    />
  )
}

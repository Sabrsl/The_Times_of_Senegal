import { EntityListing } from '@/components/EntityListing'
import { getAllOrganizations } from '@/lib/supabase/entities'

export const revalidate = 60

export default async function OrganizationsPage() {
  const organizations = await getAllOrganizations()

  return (
    <EntityListing
      title="Organisations"
      items={organizations.map(org => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        description: org.description,
        image: org.image,
      }))}
      itemType="organization"
    />
  )
}

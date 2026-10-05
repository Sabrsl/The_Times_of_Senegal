import { EntityListing } from '@/components/EntityListing'
import { createPublicClient } from '@/lib/supabase/public'

export const revalidate = 300

async function getDossiers() {
  const supabase = createPublicClient()
  
  const { data, error } = await supabase
    .from('dossiers')
    .select('*')
    .eq('is_visible', true)
    .order('position')

  if (error || !data) {
    return []
  }

  return data
}

export default async function DossiersPage() {
  const dossiers = await getDossiers()

  return (
    <EntityListing
      title="Dossiers thématiques"
      items={dossiers.map(dossier => ({
        id: dossier.id,
        name: dossier.title,
        slug: dossier.slug,
        description: dossier.description,
        image: dossier.featured_image,
      }))}
      itemType="dossier"
    />
  )
}

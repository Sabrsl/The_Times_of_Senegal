import { EntityListing } from '@/components/EntityListing'
import { createPublicClient } from '@/lib/supabase/public'

export const revalidate = 300

async function getTags() {
  const supabase = createPublicClient()

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name')

  if (error || !data) {
    return []
  }

  return data
}

export default async function TagsPage() {
  const tags = await getTags()

  return (
    <EntityListing
      title="Tous les thèmes"
      items={tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        color: tag.color,
      }))}
      itemType="tag"
    />
  )
}

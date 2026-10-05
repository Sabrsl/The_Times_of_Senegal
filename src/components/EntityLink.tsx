import Link from 'next/link'
import { EntityLink as EntityLinkType } from '@/types'

interface EntityLinkProps {
  entity: EntityLinkType
}

export function EntityLink({ entity }: EntityLinkProps) {
  const getHref = () => {
    switch (entity.type) {
      case 'person':
        return `/personnes/${entity.slug}`
      case 'organization':
        return `/organisations/${entity.slug}`
      case 'location':
        return `/lieux/${entity.slug}`
      case 'event':
        return `/evenements/${entity.slug}`
      case 'theme':
        return `/themes/${entity.slug}`
      default:
        return '#'
    }
  }

  return (
    <Link
      href={getHref()}
      className="text-[var(--text-primary)] border-b border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
    >
      {entity.name}
    </Link>
  )
}

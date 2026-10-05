import { getCategoryColor } from '@/lib/categoryColors'

interface CategoryBadgeProps {
  slug: string | null | undefined
  name?: string
  variant?: 'default' | 'solid' | 'outline' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
}

export function CategoryBadge({ 
  slug, 
  name, 
  variant = 'default',
  size = 'sm'
}: CategoryBadgeProps) {
  const color = getCategoryColor(slug)

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  }

  return (
    <span
      className={`inline-flex items-center font-medium uppercase tracking-wide rounded ${sizes[size]}`}
      style={{
        // Variables CSS pour le dark mode
        '--category-primary': color.primary,
        '--category-light': color.light,
        // Light mode par défaut
        backgroundColor: variant === 'default' ? color.light :
          variant === 'solid' ? color.primary :
          variant === 'gradient' ? color.primary : 'transparent',
        color: variant === 'solid' || variant === 'gradient' ? 'white' : color.primary,
        borderColor: variant === 'outline' ? color.primary : undefined,
        background: variant === 'gradient' ? color.gradient : undefined
      } as React.CSSProperties}
      data-category-variant={variant}
    >
      {name}
    </span>
  )
}

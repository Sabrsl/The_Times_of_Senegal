import { getCategoryGradient, getCategoryPrimaryColor } from '@/lib/categoryColors'
import { ReactNode } from 'react'

interface CategoryGradientProps {
  slug: string | null | undefined
  children: ReactNode
  className?: string
  intensity?: 'light' | 'medium' | 'strong'
}

export function CategoryGradient({ 
  slug, 
  children, 
  className = '',
  intensity = 'medium'
}: CategoryGradientProps) {
  const gradient = getCategoryGradient(slug)
  const primaryColor = getCategoryPrimaryColor(slug)

  const intensities = {
    light: 'opacity-80',
    medium: 'opacity-90',
    strong: 'opacity-100'
  }

  return (
    <div 
      className={`relative ${className}`}
      style={{
        background: gradient,
        opacity: intensities[intensity]
      }}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

/**
 * Composant pour une bordure colorée par catégorie
 */
interface CategoryBorderProps {
  slug: string | null | undefined
  children: ReactNode
  className?: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'all'
  size?: 'thin' | 'medium' | 'thick'
}

export function CategoryBorder({ 
  slug, 
  children, 
  className = '',
  position = 'left',
  size = 'medium'
}: CategoryBorderProps) {
  const color = getCategoryPrimaryColor(slug)

  const sizes = {
    thin: '1px',
    medium: '3px',
    thick: '4px'
  }

  const positions = {
    top: 'border-t',
    bottom: 'border-b',
    left: 'border-l',
    right: 'border-r',
    all: 'border'
  }

  return (
    <div 
      className={`${positions[position]} ${className}`}
      style={{
        borderColor: color,
        borderWidth: size === 'thin' ? '1px' : 
                     size === 'medium' ? '3px' : '4px',
        borderStyle: 'solid'
      }}
    >
      {children}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, Eye, ArrowUp, ArrowDown } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  position: number
  is_visible: boolean
}

export default function AdminCategories() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('position')

      if (error) {
        console.error('Error loading categories:', error)
      } else if (data) {
        setCategories(data as Category[])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return
    }

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)

      if (error) {
        console.error('Error deleting category:', error)
        alert('Erreur lors de la suppression de la catégorie')
      } else {
        loadCategories()
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const handleToggleVisibility = async (id: string, isVisible: boolean) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_visible: !isVisible })
        .eq('id', id)

      if (error) {
        console.error('Error updating category:', error)
      } else {
        loadCategories()
      }
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const handleMovePosition = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(c => c.id === id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= categories.length) return

    const currentCategory = categories[currentIndex]
    const targetCategory = categories[newIndex]

    try {
      await supabase
        .from('categories')
        .update({ position: targetCategory.position })
        .eq('id', currentCategory.id)

      await supabase
        .from('categories')
        .update({ position: currentCategory.position })
        .eq('id', targetCategory.id)

      loadCategories()
    } catch (error) {
      console.error('Error moving category:', error)
    }
  }

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(search.toLowerCase()) ||
      category.slug.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
            Chargement...
          </p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
              Catégories
            </h1>
            <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
              Gérer les catégories du site
            </p>
          </div>
          <Link
            href="/admin/categories/new"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors"
            style={{ fontSize: '14px' }}
          >
            <Plus size={16} />
            Nouvelle catégorie
          </Link>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <Search size={16} className="text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
            style={{ fontSize: '14px' }}
          />
        </div>

        {/* Categories list */}
        <div className="bg-[var(--surface)] border border-[var(--border)]">
          {filteredCategories.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Nom
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Slug
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Position
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Visibilité
                  </th>
                  <th className="text-right p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category, index) => (
                  <tr key={category.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-muted)]">
                    <td className="p-4">
                      <div className="text-sm font-medium text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                        {category.name}
                      </div>
                      {category.description && (
                        <div className="text-xs text-[var(--text-muted)] mt-1" style={{ fontSize: '11px' }}>
                          {category.description}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                      /{category.slug}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMovePosition(category.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-colors"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <span className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                          {category.position}
                        </span>
                        <button
                          onClick={() => handleMovePosition(category.id, 'down')}
                          disabled={index === filteredCategories.length - 1}
                          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-colors"
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleVisibility(category.id, category.is_visible)}
                        className={`px-2 py-1 text-xs rounded-sm ${
                          category.is_visible
                            ? 'bg-[var(--surface-success)] text-[var(--text-success)] border border-[var(--border-success)]'
                            : 'bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]'
                        }`}
                        style={{ fontSize: '11px' }}
                      >
                        {category.is_visible ? 'Visible' : 'Masqué'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/categories/${category.slug}`}
                          target="_blank"
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                          title="Voir"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/admin/categories/${category.id}`}
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-error)] transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <p className="text-sm text-[var(--text-muted)] mb-4" style={{ fontSize: '14px' }}>
                {search ? 'Aucune catégorie trouvée' : 'Aucune catégorie pour le moment'}
              </p>
              {!search && (
                <Link
                  href="/admin/categories/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors"
                  style={{ fontSize: '14px' }}
                >
                  <Plus size={16} />
                  Créer la première catégorie
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Eye } from 'lucide-react'

interface NavigationItem {
  id: string
  label: string
  url: string
  position: number
  parent_id: string | null
  is_visible: boolean
  open_new_tab: boolean
}

export default function AdminNavigation() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<NavigationItem[]>([])

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('navigation_items')
        .select('*')
        .order('position')

      if (error) {
        console.error('Error loading navigation items:', error)
      } else if (data) {
        setItems(data as NavigationItem[])
      }
    } catch (error) {
      console.error('Error loading navigation items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      return
    }

    try {
      const { error } = await supabase.from('navigation_items').delete().eq('id', id)

      if (error) {
        console.error('Error deleting navigation item:', error)
        alert('Erreur lors de la suppression')
      } else {
        loadItems()
      }
    } catch (error) {
      console.error('Error deleting navigation item:', error)
    }
  }

  const handleToggleVisibility = async (id: string, isVisible: boolean) => {
    try {
      const { error } = await supabase
        .from('navigation_items')
        .update({ is_visible: !isVisible })
        .eq('id', id)

      if (error) {
        console.error('Error updating navigation item:', error)
      } else {
        loadItems()
      }
    } catch (error) {
      console.error('Error updating navigation item:', error)
    }
  }

  const handleMovePosition = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = items.findIndex(i => i.id === id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= items.length) return

    const currentItem = items[currentIndex]
    const targetItem = items[newIndex]

    try {
      await supabase
        .from('navigation_items')
        .update({ position: targetItem.position })
        .eq('id', currentItem.id)

      await supabase
        .from('navigation_items')
        .update({ position: currentItem.position })
        .eq('id', targetItem.id)

      loadItems()
    } catch (error) {
      console.error('Error moving navigation item:', error)
    }
  }

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
              Navigation
            </h1>
            <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
              Gérer le menu principal du site
            </p>
          </div>
          <Link
            href="/admin/navigation/new"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors"
            style={{ fontSize: '14px' }}
          >
            <Plus size={16} />
            Nouvel élément
          </Link>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)]">
          {items.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Label
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    URL
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
                {items.map((item, index) => (
                  <tr key={item.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-muted)]">
                    <td className="p-4">
                      <div className="text-sm font-medium text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                        {item.label}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                          {item.url}
                        </span>
                        {item.open_new_tab && (
                          <span className="text-xs text-[var(--text-muted)]" style={{ fontSize: '11px' }}>
                            (nouvel onglet)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMovePosition(item.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-colors"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <span className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                          {item.position}
                        </span>
                        <button
                          onClick={() => handleMovePosition(item.id, 'down')}
                          disabled={index === items.length - 1}
                          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-colors"
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleVisibility(item.id, item.is_visible)}
                        className={`px-2 py-1 text-xs rounded-sm ${
                          item.is_visible
                            ? 'bg-[var(--surface-success)] text-[var(--text-success)] border border-[var(--border-success)]'
                            : 'bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]'
                        }`}
                        style={{ fontSize: '11px' }}
                      >
                        {item.is_visible ? 'Visible' : 'Masqué'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={item.url}
                          target="_blank"
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                          title="Voir"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/admin/navigation/${item.id}`}
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
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
                Aucun élément de navigation pour le moment
              </p>
              <Link
                href="/admin/navigation/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors"
                style={{ fontSize: '14px' }}
              >
                <Plus size={16} />
                Créer le premier élément
              </Link>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

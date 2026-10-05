'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react'

interface HomepageSection {
  id: string
  title: string
  section_type: string
  position: number
  is_visible: boolean
  configuration: any
  created_at: string
}

export default function AdminHomepage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [sections, setSections] = useState<HomepageSection[]>([])

  useEffect(() => {
    loadSections()
  }, [])

  const loadSections = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('position')

      if (error) {
        console.error('Error loading homepage sections:', error)
      } else if (data) {
        setSections(data as HomepageSection[])
      }
    } catch (error) {
      console.error('Error loading homepage sections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) {
      return
    }

    try {
      const { error } = await supabase.from('homepage_sections').delete().eq('id', id)

      if (error) {
        console.error('Error deleting section:', error)
        alert('Erreur lors de la suppression')
      } else {
        loadSections()
      }
    } catch (error) {
      console.error('Error deleting section:', error)
    }
  }

  const handleToggleVisibility = async (id: string, isVisible: boolean) => {
    try {
      const { error } = await supabase
        .from('homepage_sections')
        .update({ is_visible: !isVisible })
        .eq('id', id)

      if (error) {
        console.error('Error updating section:', error)
      } else {
        loadSections()
      }
    } catch (error) {
      console.error('Error updating section:', error)
    }
  }

  const handleMovePosition = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(s => s.id === id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= sections.length) return

    const currentSection = sections[currentIndex]
    const targetSection = sections[newIndex]

    try {
      await supabase
        .from('homepage_sections')
        .update({ position: targetSection.position })
        .eq('id', currentSection.id)

      await supabase
        .from('homepage_sections')
        .update({ position: currentSection.position })
        .eq('id', targetSection.id)

      loadSections()
    } catch (error) {
      console.error('Error moving section:', error)
    }
  }

  const getSectionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      featured: 'Article principal',
      secondary: 'Articles secondaires',
      latest: 'Dernières actualités',
      dossiers: 'Dossiers',
      categories: 'Catégories',
      custom: 'Contenu personnalisé',
    }
    return labels[type] || type
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
              Homepage
            </h1>
            <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
              Gérer les sections de la page d'accueil
            </p>
          </div>
          <Link
            href="/admin/homepage/new"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors"
            style={{ fontSize: '14px' }}
          >
            <Plus size={16} />
            Nouvelle section
          </Link>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)]">
          {sections.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Titre
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Type
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
                {sections.map((section, index) => (
                  <tr key={section.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-muted)]">
                    <td className="p-4">
                      <div className="text-sm font-medium text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                        {section.title}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                      {getSectionTypeLabel(section.section_type)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMovePosition(section.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-colors"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <span className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                          {section.position}
                        </span>
                        <button
                          onClick={() => handleMovePosition(section.id, 'down')}
                          disabled={index === sections.length - 1}
                          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-colors"
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleVisibility(section.id, section.is_visible)}
                        className={`p-1.5 rounded-sm ${
                          section.is_visible
                            ? 'bg-[var(--surface-success)] text-[var(--text-success)]'
                            : 'bg-[var(--surface-muted)] text-[var(--text-muted)]'
                        }`}
                        title={section.is_visible ? 'Masquer' : 'Afficher'}
                      >
                        {section.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/homepage/${section.id}`}
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(section.id)}
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
                Aucune section pour le moment
              </p>
              <Link
                href="/admin/homepage/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors"
                style={{ fontSize: '14px' }}
              >
                <Plus size={16} />
                Créer la première section
              </Link>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

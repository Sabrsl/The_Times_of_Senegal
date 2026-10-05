'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, ExternalLink } from 'lucide-react'

interface Source {
  id: string
  title: string
  url: string | null
  publisher: string | null
  source_type: string
  published_at: string | null
}

export default function AdminSources() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [sources, setSources] = useState<Source[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadSources()
  }, [])

  const loadSources = async () => {
    try {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading sources:', error)
      } else if (data) {
        setSources(data as Source[])
      }
    } catch (error) {
      console.error('Error loading sources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette source ?')) {
      return
    }

    try {
      const { error } = await supabase.from('sources').delete().eq('id', id)

      if (error) {
        console.error('Error deleting source:', error)
        alert('Erreur lors de la suppression')
      } else {
        loadSources()
      }
    } catch (error) {
      console.error('Error deleting source:', error)
    }
  }

  const getSourceTypeBadge = (type: string) => {
    const styles = {
      official: 'bg-[var(--surface-info)] text-[var(--text-info)] border border-[var(--border-info)]',
      media: 'bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]',
      academic: 'bg-[var(--surface-warning)] text-[var(--text-warning)] border border-[var(--border-warning)]',
      institution: 'bg-[var(--surface-success)] text-[var(--text-success)] border border-[var(--border-success)]',
      data: 'bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]',
      document: 'bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]',
      other: 'bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]',
    }

    const labels = {
      official: 'Officiel',
      media: 'Média',
      academic: 'Académique',
      institution: 'Institution',
      data: 'Données',
      document: 'Document',
      other: 'Autre',
    }

    return (
      <span className={`px-2 py-1 text-xs rounded-sm ${styles[type as keyof typeof styles] || styles.other}`} style={{ fontSize: '11px' }}>
        {labels[type as keyof typeof labels] || type}
      </span>
    )
  }

  const filteredSources = sources.filter(
    (source) =>
      source.title.toLowerCase().includes(search.toLowerCase()) ||
      (source.publisher && source.publisher.toLowerCase().includes(search.toLowerCase()))
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
              Sources
            </h1>
            <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
              Gérer les sources de référence
            </p>
          </div>
          <Link
            href="/admin/sources/new"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors"
            style={{ fontSize: '14px' }}
          >
            <Plus size={16} />
            Nouvelle source
          </Link>
        </div>

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

        <div className="bg-[var(--surface)] border border-[var(--border)]">
          {filteredSources.length > 0 ? (
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
                    Éditeur
                  </th>
                  <th className="text-right p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSources.map((source) => (
                  <tr key={source.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-muted)]">
                    <td className="p-4">
                      <div className="text-sm font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '14px' }}>
                        {source.title}
                      </div>
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                          style={{ fontSize: '11px' }}
                        >
                          <ExternalLink size={12} />
                          {source.url}
                        </a>
                      )}
                    </td>
                    <td className="p-4">{getSourceTypeBadge(source.source_type)}</td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                      {source.publisher || '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/sources/${source.id}`}
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(source.id)}
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
                {search ? 'Aucune source trouvée' : 'Aucune source pour le moment'}
              </p>
              {!search && (
                <Link
                  href="/admin/sources/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors"
                  style={{ fontSize: '14px' }}
                >
                  <Plus size={16} />
                  Créer la première source
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

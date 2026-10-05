'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'

interface Dossier {
  id: string
  title: string
  slug: string
  description: string | null
  cover_image: string | null
  status: string
  created_at: string
}

export default function AdminDossiers() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [dossiers, setDossiers] = useState<Dossier[]>([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadDossiers()
  }, [filter])

  const loadDossiers = async () => {
    try {
      let query = supabase
        .from('dossiers')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading dossiers:', error)
      } else if (data) {
        setDossiers(data as Dossier[])
      }
    } catch (error) {
      console.error('Error loading dossiers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) {
      return
    }

    try {
      const { error } = await supabase.from('dossiers').delete().eq('id', id)

      if (error) {
        console.error('Error deleting dossier:', error)
        alert('Erreur lors de la suppression du dossier')
      } else {
        loadDossiers()
      }
    } catch (error) {
      console.error('Error deleting dossier:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]',
      published: 'bg-[var(--surface-success)] text-[var(--text-success)] border border-[var(--border-success)]',
      archived: 'bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]',
    }

    const labels = {
      draft: 'Brouillon',
      published: 'Publié',
      archived: 'Archivé',
    }

    return (
      <span className={`px-2 py-1 text-xs rounded-sm ${styles[status as keyof typeof styles] || styles.draft}`} style={{ fontSize: '11px' }}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date)
  }

  const filteredDossiers = dossiers.filter(
    (dossier) =>
      dossier.title.toLowerCase().includes(search.toLowerCase()) ||
      dossier.slug.toLowerCase().includes(search.toLowerCase())
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
              Dossiers
            </h1>
            <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
              Gérer les dossiers thématiques
            </p>
          </div>
          <Link
            href="/admin/dossiers/new"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors"
            style={{ fontSize: '14px' }}
          >
            <Plus size={16} />
            Nouveau dossier
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
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

          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
              style={{ fontSize: '14px' }}
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillons</option>
              <option value="published">Publiés</option>
              <option value="archived">Archivés</option>
            </select>
          </div>
        </div>

        {/* Dossiers list */}
        <div className="bg-[var(--surface)] border border-[var(--border)]">
          {filteredDossiers.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Titre
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Statut
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Créé le
                  </th>
                  <th className="text-right p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDossiers.map((dossier) => (
                  <tr key={dossier.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-muted)]">
                    <td className="p-4">
                      <div className="text-sm font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '14px' }}>
                        {dossier.title}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]" style={{ fontSize: '11px' }}>
                        /{dossier.slug}
                      </div>
                      {dossier.description && (
                        <div className="text-xs text-[var(--text-secondary)] mt-1" style={{ fontSize: '12px' }}>
                          {dossier.description}
                        </div>
                      )}
                    </td>
                    <td className="p-4">{getStatusBadge(dossier.status)}</td>
                    <td className="p-4 text-sm text-[var(--text-muted)]" style={{ fontSize: '14px' }}>
                      {formatDate(dossier.created_at)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dossiers/${dossier.slug}`}
                          target="_blank"
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                          title="Voir"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/admin/dossiers/${dossier.id}`}
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(dossier.id)}
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
                {search ? 'Aucun dossier trouvé' : 'Aucun dossier pour le moment'}
              </p>
              {!search && (
                <Link
                  href="/admin/dossiers/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors"
                  style={{ fontSize: '14px' }}
                >
                  <Plus size={16} />
                  Créer le premier dossier
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

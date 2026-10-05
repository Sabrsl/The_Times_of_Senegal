'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { Plus, Search, Filter, Eye, Edit, Trash2, Calendar, Clock } from 'lucide-react'

interface Article {
  id: string
  title: string
  slug: string
  status: string
  published_at: string | null
  created_at: string
  updated_at: string
  category: { name: string } | null
  author: { first_name: string; last_name: string } | null
}

export default function AdminArticles() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [articles, setArticles] = useState<Article[]>([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadArticles()
  }, [filter])

  const loadArticles = async () => {
    try {
      let query = supabase
        .from('articles')
        .select(`
          *,
          category:categories(name),
          author:profiles(first_name, last_name)
        `)
        .order('updated_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading articles:', error)
      } else if (data) {
        setArticles(data as Article[])
      }
    } catch (error) {
      console.error('Error loading articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return
    }

    try {
      const { error } = await supabase.from('articles').delete().eq('id', id)

      if (error) {
        console.error('Error deleting article:', error)
        alert('Erreur lors de la suppression de l\'article')
      } else {
        loadArticles()
      }
    } catch (error) {
      console.error('Error deleting article:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]',
      review: 'bg-[var(--surface-warning)] text-[var(--text-warning)] border border-[var(--border-warning)]',
      scheduled: 'bg-[var(--surface-info)] text-[var(--text-info)] border border-[var(--border-info)]',
      published: 'bg-[var(--surface-success)] text-[var(--text-success)] border border-[var(--border-success)]',
      archived: 'bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]',
    }

    const labels = {
      draft: 'Brouillon',
      review: 'En révision',
      scheduled: 'Programmé',
      published: 'Publié',
      archived: 'Archivé',
    }

    return (
      <span className={`px-2 py-1 text-xs rounded-sm ${styles[status as keyof typeof styles] || styles.draft}`} style={{ fontSize: '11px' }}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date)
  }

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.slug.toLowerCase().includes(search.toLowerCase())
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
              Articles
            </h1>
            <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
              Gérer vos articles
            </p>
          </div>
          <Link
            href="/admin/articles/new"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors"
            style={{ fontSize: '14px' }}
          >
            <Plus size={16} />
            Nouvel article
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
            <Filter size={16} className="text-[var(--text-muted)]" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
              style={{ fontSize: '14px' }}
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillons</option>
              <option value="review">En révision</option>
              <option value="scheduled">Programmés</option>
              <option value="published">Publiés</option>
              <option value="archived">Archivés</option>
            </select>
          </div>
        </div>

        {/* Articles list */}
        <div className="bg-[var(--surface)] border border-[var(--border)]">
          {filteredArticles.length > 0 ? (
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
                    Catégorie
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Auteur
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Publié le
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Mis à jour
                  </th>
                  <th className="text-right p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-muted)]">
                    <td className="p-4">
                      <div className="text-sm font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '14px' }}>
                        {article.title}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]" style={{ fontSize: '11px' }}>
                        /{article.slug}
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(article.status)}</td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                      {article.category?.name || '-'}
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                      {article.author
                        ? `${article.author.first_name} ${article.author.last_name}`
                        : '-'}
                    </td>
                    <td className="p-4 text-sm text-[var(--text-muted)]" style={{ fontSize: '14px' }}>
                      {formatDate(article.published_at)}
                    </td>
                    <td className="p-4 text-sm text-[var(--text-muted)]" style={{ fontSize: '14px' }}>
                      {formatDate(article.updated_at)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/article/${article.slug}`}
                          target="_blank"
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                          title="Voir"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/admin/articles/${article.id}`}
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(article.id)}
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
                {search ? 'Aucun article trouvé' : 'Aucun article pour le moment'}
              </p>
              {!search && (
                <Link
                  href="/admin/articles/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors"
                  style={{ fontSize: '14px' }}
                >
                  <Plus size={16} />
                  Créer le premier article
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

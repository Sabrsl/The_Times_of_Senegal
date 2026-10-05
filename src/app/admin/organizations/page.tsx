'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'

interface Organization {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  metadata: any
}

export default function AdminOrganizations() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadOrganizations()
  }, [])

  const loadOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error loading organizations:', error)
      } else if (data) {
        setOrganizations(data as Organization[])
      }
    } catch (error) {
      console.error('Error loading organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette organisation ?')) {
      return
    }

    try {
      const { error } = await supabase.from('organizations').delete().eq('id', id)

      if (error) {
        console.error('Error deleting organization:', error)
        alert('Erreur lors de la suppression')
      } else {
        loadOrganizations()
      }
    } catch (error) {
      console.error('Error deleting organization:', error)
    }
  }

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.slug.toLowerCase().includes(search.toLowerCase())
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
              Organisations
            </h1>
            <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
              Gérer les organisations (institutions, entreprises, etc.)
            </p>
          </div>
          <Link
            href="/admin/organizations/new"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors"
            style={{ fontSize: '14px' }}
          >
            <Plus size={16} />
            Nouvelle organisation
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
          {filteredOrganizations.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Nom
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Slug
                  </th>
                  <th className="text-right p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrganizations.map((org) => (
                  <tr key={org.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-muted)]">
                    <td className="p-4">
                      <div className="text-sm font-medium text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                        {org.name}
                      </div>
                      {org.description && (
                        <div className="text-xs text-[var(--text-muted)] mt-1" style={{ fontSize: '11px' }}>
                          {org.description}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                      /{org.slug}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/organizations/${org.id}`}
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(org.id)}
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
                {search ? 'Aucune organisation trouvée' : 'Aucune organisation pour le moment'}
              </p>
              {!search && (
                <Link
                  href="/admin/organizations/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors"
                  style={{ fontSize: '14px' }}
                >
                  <Plus size={16} />
                  Créer la première organisation
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'

interface Place {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  metadata: any
}

export default function AdminPlaces() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [places, setPlaces] = useState<Place[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadPlaces()
  }, [])

  const loadPlaces = async () => {
    try {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error loading places:', error)
      } else if (data) {
        setPlaces(data as Place[])
      }
    } catch (error) {
      console.error('Error loading places:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
      return
    }

    try {
      const { error } = await supabase.from('places').delete().eq('id', id)

      if (error) {
        console.error('Error deleting place:', error)
        alert('Erreur lors de la suppression')
      } else {
        loadPlaces()
      }
    } catch (error) {
      console.error('Error deleting place:', error)
    }
  }

  const filteredPlaces = places.filter(
    (place) =>
      place.name.toLowerCase().includes(search.toLowerCase()) ||
      place.slug.toLowerCase().includes(search.toLowerCase())
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
              Lieux
            </h1>
            <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
              Gérer les lieux (villes, régions, etc.)
            </p>
          </div>
          <Link
            href="/admin/places/new"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors"
            style={{ fontSize: '14px' }}
          >
            <Plus size={16} />
            Nouveau lieu
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
          {filteredPlaces.length > 0 ? (
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
                {filteredPlaces.map((place) => (
                  <tr key={place.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-muted)]">
                    <td className="p-4">
                      <div className="text-sm font-medium text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                        {place.name}
                      </div>
                      {place.description && (
                        <div className="text-xs text-[var(--text-muted)] mt-1" style={{ fontSize: '11px' }}>
                          {place.description}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                      /{place.slug}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/places/${place.id}`}
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(place.id)}
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
                {search ? 'Aucun lieu trouvé' : 'Aucun lieu pour le moment'}
              </p>
              {!search && (
                <Link
                  href="/admin/places/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors"
                  style={{ fontSize: '14px' }}
                >
                  <Plus size={16} />
                  Créer le premier lieu
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

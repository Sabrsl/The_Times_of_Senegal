'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Save, ArrowLeft } from 'lucide-react'
import { clearEntityTypeCache } from '@/lib/classification/cache'

export default function AdminEventEdit() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const isNew = params.id === 'new'
  const eventId = isNew ? null : params.id

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    event_date: '',
    metadata: '{}',
  })

  useEffect(() => {
    loadEvent()
  }, [eventId])

  const loadEvent = async () => {
    if (!eventId) return

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error) {
        console.error('Error loading event:', error)
      } else if (data) {
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          description: data.description || '',
          image: data.image || '',
          event_date: data.event_date ? data.event_date.split('T')[0] : '',
          metadata: data.metadata ? JSON.stringify(data.metadata) : '{}',
        })
      }
    } catch (error) {
      console.error('Error loading event:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (value: string) => {
    setFormData({
      ...formData,
      name: value,
      slug: formData.slug || generateSlug(value),
    })
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      let metadata
      try {
        metadata = JSON.parse(formData.metadata)
      } catch {
        metadata = {}
      }

      const eventData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        image: formData.image,
        event_date: formData.event_date || null,
        metadata,
      }

      let error

      if (isNew) {
        const result = await supabase.from('events').insert(eventData).select()
        error = result.error
      } else {
        const result = await supabase.from('events').update(eventData).eq('id', eventId)
        error = result.error
      }

      if (error) {
        console.error('Error saving event:', error)
        alert('Erreur lors de la sauvegarde')
      } else {
        // Clear events cache to reflect changes
        clearEntityTypeCache('events')
        try {
          await fetch('/api/clear-cache', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'events', cacheSystem: 'both' }) })
        } catch (error) {
          console.error('Error clearing server cache:', error)
        }
        alert('Événement sauvegardé avec succès')
        router.push('/admin/events')
      }
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
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
          <div className="flex items-center gap-4">
            <Link
              href="/admin/events"
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
                {isNew ? 'Nouvel événement' : 'Modifier l\'événement'}
              </h1>
              <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                {isNew ? 'Créer un nouvel événement' : 'Modifier les détails'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            style={{ fontSize: '14px' }}
          >
            <Save size={16} />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>

        <div className="max-w-2xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
              Nom *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
              style={{ fontSize: '14px' }}
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
              Slug *
            </label>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
              style={{ fontSize: '14px' }}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)] resize-none"
              style={{ fontSize: '14px' }}
            />
          </div>

          <div>
            <label htmlFor="event_date" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
              Date de l'événement
            </label>
            <input
              type="date"
              id="event_date"
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
              style={{ fontSize: '14px' }}
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
              URL de l'image
            </label>
            <input
              type="text"
              id="image"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
              style={{ fontSize: '14px' }}
              placeholder="https://..."
            />
          </div>

          <div>
            <label htmlFor="metadata" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
              Métadonnées (JSON)
            </label>
            <textarea
              id="metadata"
              value={formData.metadata}
              onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)] resize-none font-mono"
              style={{ fontSize: '14px' }}
              placeholder='{"type": "", "location": ""}'
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

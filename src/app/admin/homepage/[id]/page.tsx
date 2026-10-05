'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Save, ArrowLeft } from 'lucide-react'

export default function AdminHomepageEdit() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const isNew = params.id === 'new'
  const sectionId = isNew ? null : params.id

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    section_type: 'featured',
    position: 0,
    is_visible: true,
    configuration: '{}',
  })

  useEffect(() => {
    loadSection()
  }, [sectionId])

  const loadSection = async () => {
    if (!sectionId) return

    try {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .eq('id', sectionId)
        .single()

      if (error) {
        console.error('Error loading section:', error)
      } else if (data) {
        setFormData({
          title: data.title || '',
          section_type: data.section_type || 'featured',
          position: data.position || 0,
          is_visible: data.is_visible ?? true,
          configuration: data.configuration ? JSON.stringify(data.configuration) : '{}',
        })
      }
    } catch (error) {
      console.error('Error loading section:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      let configuration
      try {
        configuration = JSON.parse(formData.configuration)
      } catch {
        configuration = {}
      }

      const sectionData = {
        title: formData.title,
        section_type: formData.section_type,
        position: formData.position,
        is_visible: formData.is_visible,
        configuration,
      }

      let error

      if (isNew) {
        const result = await supabase.from('homepage_sections').insert(sectionData).select()
        error = result.error
      } else {
        const result = await supabase.from('homepage_sections').update(sectionData).eq('id', sectionId)
        error = result.error
      }

      if (error) {
        console.error('Error saving section:', error)
        alert('Erreur lors de la sauvegarde')
      } else {
        alert('Section sauvegardée avec succès')
        router.push('/admin/homepage')
      }
    } catch (error) {
      console.error('Error saving section:', error)
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
              href="/admin/homepage"
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
                {isNew ? 'Nouvelle section' : 'Modifier la section'}
              </h1>
              <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                {isNew ? 'Créer une nouvelle section pour la homepage' : 'Modifier les détails de la section'}
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
            <label htmlFor="title" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
              Titre de la section *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
              style={{ fontSize: '14px' }}
            />
          </div>

          <div>
            <label htmlFor="section_type" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
              Type de section *
            </label>
            <select
              id="section_type"
              value={formData.section_type}
              onChange={(e) => setFormData({ ...formData, section_type: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
              style={{ fontSize: '14px' }}
            >
              <option value="featured">Article principal</option>
              <option value="secondary">Articles secondaires</option>
              <option value="latest">Dernières actualités</option>
              <option value="dossiers">Dossiers</option>
              <option value="categories">Catégories</option>
              <option value="custom">Contenu personnalisé</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="position" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                Position
              </label>
              <input
                type="number"
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                style={{ fontSize: '14px' }}
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="is_visible"
                checked={formData.is_visible}
                onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                className="rounded-sm border-[var(--border)]"
              />
              <label htmlFor="is_visible" className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                Visible
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="configuration" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
              Configuration (JSON)
            </label>
            <textarea
              id="configuration"
              value={formData.configuration}
              onChange={(e) => setFormData({ ...formData, configuration: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)] resize-none font-mono"
              style={{ fontSize: '14px' }}
              placeholder='{"limit": 5, "category_id": "..."}'
            />
            <p className="text-xs text-[var(--text-muted)] mt-1" style={{ fontSize: '11px' }}>
              Configuration spécifique au type de section (ex: nombre d'articles, filtres, etc.)
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

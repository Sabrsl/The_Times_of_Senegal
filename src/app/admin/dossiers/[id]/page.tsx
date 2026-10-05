'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Save, ArrowLeft, Plus, X } from 'lucide-react'

interface Article {
  id: string
  title: string
  slug: string
}

export default function AdminDossierEdit() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const isNew = params.id === 'new'
  const dossierId = isNew ? null : params.id

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    featured_image: '',
    is_visible: true,
    position: 0,
  })
  const [availableArticles, setAvailableArticles] = useState<Article[]>([])
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])

  useEffect(() => {
    loadInitialData()
  }, [dossierId])

  const loadInitialData = async () => {
    try {
      // Load available articles
      const { data: articlesData } = await supabase
        .from('articles')
        .select('id, title, slug')
        .eq('status', 'published')
        .order('title')

      if (articlesData) {
        setAvailableArticles(articlesData as Article[])
      }

      // Load dossier if editing
      if (dossierId) {
        const { data: dossierData, error } = await supabase
          .from('dossiers')
          .select('*')
          .eq('id', dossierId)
          .single()

        if (error) {
          console.error('Error loading dossier:', error)
        } else if (dossierData) {
          setFormData({
            title: dossierData.title || '',
            slug: dossierData.slug || '',
            description: dossierData.description || '',
            featured_image: dossierData.featured_image || '',
            is_visible: dossierData.is_visible ?? true,
            position: dossierData.position ?? 0,
          })

          // Load dossier articles
          const { data: dossierArticles } = await supabase
            .from('article_dossiers')
            .select('article_id')
            .eq('dossier_id', dossierId)
            .order('position')

          if (dossierArticles) {
            setSelectedArticles(dossierArticles.map((da: any) => da.article_id))
          }
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (value: string) => {
    setFormData({
      ...formData,
      title: value,
      slug: formData.slug || generateSlug(value),
    })
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const dossierData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        featured_image: formData.featured_image,
        is_visible: formData.is_visible,
        position: formData.position,
      }

      console.log('[Admin Dossier] Saving dossier data:', dossierData)

      let error
      let newDossierId = dossierId

      if (isNew) {
        const result = await supabase.from('dossiers').insert(dossierData).select()
        error = result.error
        console.log('[Admin Dossier] Insert result:', result)
        if (!error && result.data) {
          newDossierId = result.data[0].id
        }
      } else {
        const result = await supabase.from('dossiers').update(dossierData).eq('id', dossierId)
        error = result.error
        console.log('[Admin Dossier] Update result:', result)
      }

      if (error) {
        console.error('[Admin Dossier] Error saving dossier:', error)
        alert(`Erreur lors de la sauvegarde du dossier: ${error.message}`)
        setSaving(false)
        return
      }

      // Save article associations
      if (newDossierId) {
        console.log('[Admin Dossier] Saving article associations for dossier:', newDossierId)
        // Delete existing associations
        await supabase.from('article_dossiers').delete().eq('dossier_id', newDossierId)

        // Insert new associations
        if (selectedArticles.length > 0) {
          const associations = selectedArticles.map((articleId, index) => ({
            dossier_id: newDossierId,
            article_id: articleId,
          }))

          const result = await supabase.from('article_dossiers').insert(associations)
          if (result.error) {
            console.error('[Admin Dossier] Error saving associations:', result.error)
          }
        }
      }

      alert('Dossier sauvegardé avec succès')
      if (isNew && newDossierId) {
        router.replace(`/admin/dossiers/${newDossierId}`)
      }

      // Clear server cache after saving
      try {
        await fetch('/api/clear-cache', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cacheSystem: 'both' }) })
      } catch (error) {
        console.error('Error clearing cache:', error)
      }
    } catch (error) {
      console.error('[Admin Dossier] Unexpected error:', error)
      alert(`Erreur lors de la sauvegarde du dossier: ${error}`)
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dossiers"
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
                {isNew ? 'Nouveau dossier' : 'Modifier le dossier'}
              </h1>
              <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                {isNew ? 'Créer un nouveau dossier thématique' : 'Modifier les détails du dossier'}
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

        {/* Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
              <div>
                <label htmlFor="title" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                  Titre *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
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
            </div>

            {/* Articles */}
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                Articles du dossier
              </h3>
              <div className="space-y-2">
                {selectedArticles.map((articleId) => {
                  const article = availableArticles.find(a => a.id === articleId)
                  if (!article) return null
                  return (
                    <div key={articleId} className="flex items-center justify-between p-3 bg-[var(--background)] border border-[var(--border)]">
                      <span className="text-sm text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                        {article.title}
                      </span>
                      <button
                        onClick={() => setSelectedArticles(selectedArticles.filter(id => id !== articleId))}
                        className="p-1 text-[var(--text-error)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )
                })}
              </div>
              {selectedArticles.length === 0 && (
                <p className="text-sm text-[var(--text-muted)]" style={{ fontSize: '14px' }}>
                  Aucun article sélectionné
                </p>
              )}
              <div className="pt-2 border-t border-[var(--border)]">
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value && !selectedArticles.includes(e.target.value)) {
                      setSelectedArticles([...selectedArticles, e.target.value])
                    }
                  }}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                  style={{ fontSize: '14px' }}
                >
                  <option value="">Ajouter un article...</option>
                  {availableArticles
                    .filter(a => !selectedArticles.includes(a.id))
                    .map(article => (
                      <option key={article.id} value={article.id}>
                        {article.title}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Visibility */}
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                Publication
              </h3>
              <div>
                <label htmlFor="is_visible" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                  Visibilité
                </label>
                <select
                  id="is_visible"
                  value={formData.is_visible ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, is_visible: e.target.value === 'true' })}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                  style={{ fontSize: '14px' }}
                >
                  <option value="true">Visible</option>
                  <option value="false">Masqué</option>
                </select>
              </div>
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
            </div>

            {/* Featured Image */}
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                Image de couverture
              </h3>
              <div>
                <label htmlFor="featured_image" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                  URL de l'image
                </label>
                <input
                  type="text"
                  id="featured_image"
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                  style={{ fontSize: '14px' }}
                  placeholder="https://..."
                />
              </div>
              {formData.featured_image && (
                <div className="aspect-video bg-[var(--background)] border border-[var(--border)] overflow-hidden">
                  <img src={formData.featured_image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

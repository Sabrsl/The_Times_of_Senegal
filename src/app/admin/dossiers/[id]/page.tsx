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
    cover_image: '',
    status: 'draft',
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
            cover_image: dossierData.cover_image || '',
            status: dossierData.status || 'draft',
          })

          // Load dossier articles
          const { data: dossierArticles } = await supabase
            .from('dossier_articles')
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
        cover_image: formData.cover_image,
        status: formData.status,
      }

      let error
      let newDossierId = dossierId

      if (isNew) {
        const result = await supabase.from('dossiers').insert(dossierData).select()
        error = result.error
        if (!error && result.data) {
          newDossierId = result.data[0].id
        }
      } else {
        const result = await supabase.from('dossiers').update(dossierData).eq('id', dossierId)
        error = result.error
      }

      if (error) {
        console.error('Error saving dossier:', error)
        alert('Erreur lors de la sauvegarde du dossier')
        setSaving(false)
        return
      }

      // Save article associations
      if (newDossierId) {
        // Delete existing associations
        await supabase.from('dossier_articles').delete().eq('dossier_id', newDossierId)

        // Insert new associations
        if (selectedArticles.length > 0) {
          const associations = selectedArticles.map((articleId, index) => ({
            dossier_id: newDossierId,
            article_id: articleId,
            position: index,
          }))

          await supabase.from('dossier_articles').insert(associations)
        }
      }

      alert('Dossier sauvegardé avec succès')
      if (isNew && newDossierId) {
        router.replace(`/admin/dossiers/${newDossierId}`)
      }
    } catch (error) {
      console.error('Error saving dossier:', error)
      alert('Erreur lors de la sauvegarde du dossier')
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
            {/* Status */}
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                Publication
              </h3>
              <div>
                <label htmlFor="status" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                  Statut
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                  style={{ fontSize: '14px' }}
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
            </div>

            {/* Cover Image */}
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                Image de couverture
              </h3>
              <div>
                <label htmlFor="cover_image" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                  URL de l'image
                </label>
                <input
                  type="text"
                  id="cover_image"
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                  style={{ fontSize: '14px' }}
                  placeholder="https://..."
                />
              </div>
              {formData.cover_image && (
                <div className="aspect-video bg-[var(--background)] border border-[var(--border)] overflow-hidden">
                  <img src={formData.cover_image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

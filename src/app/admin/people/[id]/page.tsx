'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Save, ArrowLeft } from 'lucide-react'
import { clearEntityTypeCache } from '@/lib/classification/cache'

interface Article {
  id: string
  title: string
  slug: string
}

interface Dossier {
  id: string
  title: string
  slug: string
}

export default function AdminPersonEdit() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const isNew = params.id === 'new'
  const personId = isNew ? null : params.id

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    metadata: '{}',
  })
  const [availableArticles, setAvailableArticles] = useState<Article[]>([])
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])
  const [availableDossiers, setAvailableDossiers] = useState<Dossier[]>([])
  const [selectedDossiers, setSelectedDossiers] = useState<string[]>([])

  useEffect(() => {
    loadInitialData()
  }, [personId])

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

      // Load available dossiers
      const { data: dossiersData } = await supabase
        .from('dossiers')
        .select('id, title, slug')
        .eq('is_visible', true)
        .order('title')

      if (dossiersData) {
        setAvailableDossiers(dossiersData as Dossier[])
      }

      // Load person if editing
      if (personId) {
        const { data: personData, error } = await supabase
          .from('people')
          .select('*')
          .eq('id', personId)
          .single()

        if (error) {
          console.error('Error loading person:', error)
        } else if (personData) {
          setFormData({
            name: personData.name || '',
            slug: personData.slug || '',
            description: personData.description || '',
            image: personData.image || '',
            metadata: personData.metadata ? JSON.stringify(personData.metadata) : '{}',
          })

          // Load person articles
          const { data: personArticles } = await supabase
            .from('article_people')
            .select('article_id')
            .eq('person_id', personId)

          if (personArticles) {
            setSelectedArticles(personArticles.map((pa: any) => pa.article_id))
          }

          // Load person dossiers
          const { data: personDossiers } = await supabase
            .from('dossier_people')
            .select('dossier_id')
            .eq('person_id', personId)

          if (personDossiers) {
            setSelectedDossiers(personDossiers.map((pd: any) => pd.dossier_id))
          }
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPerson = async () => {
    // This function is now handled by loadInitialData
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

      const personData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        image: formData.image,
        metadata,
      }

      let error
      let newPersonId = personId

      if (isNew) {
        const result = await supabase.from('people').insert(personData).select()
        error = result.error
        if (!error && result.data) {
          newPersonId = result.data[0].id
        }
      } else {
        const result = await supabase.from('people').update(personData).eq('id', personId)
        error = result.error
      }

      if (error) {
        console.error('[Admin Person] Error saving person:', error)
        alert(`Erreur lors de la sauvegarde: ${error.message}`)
        setSaving(false)
        return
      }

      // Save article associations
      if (newPersonId) {
        await supabase.from('article_people').delete().eq('person_id', newPersonId)

        if (selectedArticles.length > 0) {
          const articleAssociations = selectedArticles.map((articleId) => ({
            person_id: newPersonId,
            article_id: articleId,
          }))
          await supabase.from('article_people').insert(articleAssociations)
        }

        // Save dossier associations
        await supabase.from('dossier_people').delete().eq('person_id', newPersonId)

        if (selectedDossiers.length > 0) {
          const dossierAssociations = selectedDossiers.map((dossierId) => ({
            person_id: newPersonId,
            dossier_id: dossierId,
          }))
          await supabase.from('dossier_people').insert(dossierAssociations)
        }
      }

      // Clear people cache to reflect changes
      clearEntityTypeCache('people')
      try {
        await fetch('/api/clear-cache', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'people', cacheSystem: 'both' }) })
      } catch (error) {
        console.error('Error clearing server cache:', error)
      }
      alert('Personne sauvegardée avec succès')
      router.push('/admin/people')
    } catch (error) {
      console.error('[Admin Person] Unexpected error:', error)
      alert(`Erreur lors de la sauvegarde: ${error}`)
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
              href="/admin/people"
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
                {isNew ? 'Nouvelle personne' : 'Modifier la personne'}
              </h1>
              <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                {isNew ? 'Créer une nouvelle personne' : 'Modifier les détails'}
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

          {/* Articles */}
          <div className="pt-6 border-t border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4" style={{ fontSize: '14px' }}>
              Articles liés
            </h3>
            <div className="space-y-2 mb-4">
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
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>
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

          {/* Dossiers */}
          <div className="pt-6 border-t border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4" style={{ fontSize: '14px' }}>
              Dossiers liés
            </h3>
            <div className="space-y-2 mb-4">
              {selectedDossiers.map((dossierId) => {
                const dossier = availableDossiers.find(d => d.id === dossierId)
                if (!dossier) return null
                return (
                  <div key={dossierId} className="flex items-center justify-between p-3 bg-[var(--background)] border border-[var(--border)]">
                    <span className="text-sm text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                      {dossier.title}
                    </span>
                    <button
                      onClick={() => setSelectedDossiers(selectedDossiers.filter(id => id !== dossierId))}
                      className="p-1 text-[var(--text-error)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value && !selectedDossiers.includes(e.target.value)) {
                  setSelectedDossiers([...selectedDossiers, e.target.value])
                }
              }}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
              style={{ fontSize: '14px' }}
            >
              <option value="">Ajouter un dossier...</option>
              {availableDossiers
                .filter(d => !selectedDossiers.includes(d.id))
                .map(dossier => (
                  <option key={dossier.id} value={dossier.id}>
                    {dossier.title}
                  </option>
                ))}
            </select>
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
              placeholder='{"role": "", "born": ""}'
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

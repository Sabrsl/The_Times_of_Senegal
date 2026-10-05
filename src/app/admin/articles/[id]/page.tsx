'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ClassificationPanel } from '@/components/admin/ClassificationPanel'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Save, Eye, ArrowLeft, Plus, X } from 'lucide-react'
import { ClassificationProposal, EntityDetection } from '@/types/classification'
import { EntityDetector, fetchExistingEntities } from '@/lib/classification/detector'
import { generateContentHash, getCachedAnalysis, setCachedAnalysis } from '@/lib/classification/cache'

interface Category {
  id: string
  name: string
}

interface Source {
  id: string
  title: string
  url: string
}

interface Person {
  id: string
  name: string
}

interface Organization {
  id: string
  name: string
}

interface Place {
  id: string
  name: string
}

export default function AdminArticleEdit() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const isNew = params.id === 'new'
  let articleId = isNew ? null : (Array.isArray(params.id) ? params.id[0] : params.id)

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category_id: '',
    status: 'draft',
    published_at: '',
    scheduled_for: '',
    meta_title: '',
    meta_description: '',
    og_image: '',
    canonical_url: '',
    no_index: false,
  })
  const [sources, setSources] = useState<Source[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [places, setPlaces] = useState<Place[]>([])
  const [classificationProposal, setClassificationProposal] = useState<ClassificationProposal | null>(null)
  const [showClassification, setShowClassification] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [articleId])

  const loadInitialData = async () => {
    try {
      // Load categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name')
        .order('position')

      if (categoriesData) {
        setCategories(categoriesData)
      }

      // Load article if editing
      if (articleId) {
        const { data: articleData, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', articleId)
          .single()

        if (error) {
          console.error('Error loading article:', error)
        } else if (articleData) {
          setFormData({
            title: articleData.title || '',
            slug: articleData.slug || '',
            excerpt: articleData.excerpt || '',
            content: articleData.content || '',
            featured_image: articleData.featured_image || '',
            category_id: articleData.category_id || '',
            status: articleData.status || 'draft',
            published_at: articleData.published_at ? articleData.published_at.split('T')[0] : '',
            scheduled_for: articleData.scheduled_for ? articleData.scheduled_for.split('T')[0] : '',
            meta_title: articleData.meta_title || '',
            meta_description: articleData.meta_description || '',
            og_image: articleData.og_image || '',
            canonical_url: articleData.canonical_url || '',
            no_index: articleData.no_index || false,
          })

          // Load article sources
          const { data: sourcesData } = await supabase
            .from('article_sources')
            .select('sources(*)')
            .eq('article_id', articleId)

          if (sourcesData) {
            setSources(sourcesData.map((s: any) => s.sources))
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

  const analyzeClassification = async () => {
    try {
      const text = `${formData.title} ${formData.excerpt} ${formData.content}`
      const contentHash = generateContentHash(formData.title, formData.excerpt, formData.content)
      const articleIdStr = articleId || 'new'

      // Step 1: Check classification cache FIRST (before any Supabase queries)
      // Key format: classification:{article_id}:{content_hash}
      const cachedProposal = getCachedAnalysis(articleIdStr, contentHash)
      if (cachedProposal) {
        setClassificationProposal(cachedProposal)
        setShowClassification(true)
        return // 0 Supabase queries on cache hit
      }

      // Step 2: Cache miss - fetch entities from Supabase (uses its own cache)
      const entities = await fetchExistingEntities(supabase)
      const detector = new EntityDetector(entities)

      // Step 3: Perform analysis
      const proposal = await detector.analyze(text)

      // Step 4: Cache the result with article_id in key
      setCachedAnalysis(articleIdStr, contentHash, proposal)

      setClassificationProposal(proposal)
      setShowClassification(true)
    } catch (error) {
      console.error('Error analyzing classification:', error)
      alert('Erreur lors de l\'analyse de classification')
    }
  }

  const handleAcceptDetections = async (detections: EntityDetection[]) => {
    if (!articleId) return

    try {
      for (const detection of detections) {
        if (!detection.existing_id) continue

        // Map detection type to junction table
        const junctionTable = {
          person: 'article_people',
          organization: 'article_organizations',
          place: 'article_places',
          event: 'article_events',
        }[detection.type]

        const column = {
          person: 'person_id',
          organization: 'organization_id',
          place: 'place_id',
          event: 'event_id',
        }[detection.type]

        if (junctionTable && column) {
          await supabase.from(junctionTable).insert({
            article_id: articleId,
            [column]: detection.existing_id,
          })
        }
      }
      
      alert('Associations enregistrées avec succès')
      setShowClassification(false)
    } catch (error) {
      console.error('Error accepting detections:', error)
      alert('Erreur lors de l\'enregistrement des associations')
    }
  }

  const handleRejectDetection = (detection: EntityDetection) => {
    // Remove from proposal
    if (classificationProposal) {
      const updated = { ...classificationProposal }
      const typeKey = `${detection.type}s` as keyof ClassificationProposal
      if (Array.isArray(updated[typeKey])) {
        updated[typeKey] = (updated[typeKey] as EntityDetection[]).filter(
          d => d.name !== detection.name
        )
      }
      setClassificationProposal(updated)
    }
  }

  const handleSave = async (status: string = formData.status) => {
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('Utilisateur non connecté')
        setSaving(false)
        return
      }

      const articleData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        featured_image: formData.featured_image,
        category_id: formData.category_id || null,
        author_id: user.id,
        status,
        published_at: status === 'published' && !formData.published_at ? new Date().toISOString() : formData.published_at || null,
        scheduled_for: formData.scheduled_for || null,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        og_image: formData.og_image,
        canonical_url: formData.canonical_url,
        no_index: formData.no_index,
      }

      let error

      if (isNew) {
        const result = await supabase.from('articles').insert(articleData).select()
        error = result.error
        if (!error && result.data) {
          articleId = result.data[0].id
        }
      } else {
        const result = await supabase.from('articles').update(articleData).eq('id', articleId)
        error = result.error
      }

      if (error) {
        console.error('Error saving article:', error)
        alert('Erreur lors de la sauvegarde de l\'article')
      } else {
        alert('Article sauvegardé avec succès')
        if (isNew && articleId) {
          router.replace(`/admin/articles/${articleId}`)
        }
      }
    } catch (error) {
      console.error('Error saving article:', error)
      alert('Erreur lors de la sauvegarde de l\'article')
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
              href="/admin/articles"
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
                {isNew ? 'Nouvel article' : 'Modifier l\'article'}
              </h1>
              <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                {isNew ? 'Créer un nouvel article' : 'Modifier les détails de l\'article'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {formData.slug && (
              <Link
                href={`/article/${formData.slug}`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] text-sm font-medium rounded-sm hover:border-[var(--border-strong)] transition-colors"
                style={{ fontSize: '14px' }}
              >
                <Eye size={16} />
                Voir
              </Link>
            )}
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] text-sm font-medium rounded-sm hover:border-[var(--border-strong)] transition-colors disabled:opacity-50"
              style={{ fontSize: '14px' }}
            >
              <Save size={16} />
              {saving ? 'Sauvegarde...' : 'Sauvegarder brouillon'}
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
              style={{ fontSize: '14px' }}
            >
              <Save size={16} />
              {saving ? 'Publication...' : 'Publier'}
            </button>
            <button
              onClick={analyzeClassification}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] text-sm font-medium rounded-sm hover:border-[var(--border-strong)] transition-colors disabled:opacity-50"
              style={{ fontSize: '14px' }}
            >
              <Plus size={16} />
              Analyser
            </button>
          </div>
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
                <label htmlFor="excerpt" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                  Extrait
                </label>
                <textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)] resize-none"
                  style={{ fontSize: '14px' }}
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                  Contenu *
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={20}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)] resize-none font-mono"
                  style={{ fontSize: '14px' }}
                />
                <p className="text-xs text-[var(--text-muted)] mt-1" style={{ fontSize: '11px' }}>
                  HTML supporté. Utilisez &lt;p&gt;, &lt;h3&gt;, etc.
                </p>
              </div>
            </div>

            {/* Sources */}
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                Sources
              </h3>
              {sources.map((source, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={source.title}
                    onChange={(e) => {
                      const newSources = [...sources]
                      newSources[index] = { ...newSources[index], title: e.target.value }
                      setSources(newSources)
                    }}
                    placeholder="Titre de la source"
                    className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                    style={{ fontSize: '14px' }}
                  />
                  <input
                    type="text"
                    value={source.url}
                    onChange={(e) => {
                      const newSources = [...sources]
                      newSources[index] = { ...newSources[index], url: e.target.value }
                      setSources(newSources)
                    }}
                    placeholder="URL"
                    className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                    style={{ fontSize: '14px' }}
                  />
                  <button
                    onClick={() => {
                      setSources(sources.filter((_, i) => i !== index))
                    }}
                    className="p-2 text-[var(--text-error)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setSources([...sources, { id: '', title: '', url: '' }])}
                className="flex items-center gap-2 text-sm text-[var(--text-primary)] border-b border-[var(--border)] hover:border-[var(--accent)] transition-colors"
                style={{ fontSize: '14px' }}
              >
                <Plus size={16} />
                Ajouter une source
              </button>
            </div>

            {/* Classification Panel */}
            {showClassification && classificationProposal && (
              <ClassificationPanel
                proposal={classificationProposal}
                onAccept={handleAcceptDetections}
                onReject={handleRejectDetection}
              />
            )}
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
                  <option value="review">En révision</option>
                  <option value="scheduled">Programmé</option>
                  <option value="published">Publié</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>

              {formData.status === 'scheduled' && (
                <div>
                  <label htmlFor="scheduled_for" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                    Date de publication
                  </label>
                  <input
                    type="datetime-local"
                    id="scheduled_for"
                    value={formData.scheduled_for}
                    onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                    style={{ fontSize: '14px' }}
                  />
                </div>
              )}
            </div>

            {/* Category */}
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                Catégorie
              </h3>
              <div>
                <label htmlFor="category" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                  Catégorie
                </label>
                <select
                  id="category"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                  style={{ fontSize: '14px' }}
                >
                  <option value="">Aucune catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                Image à la une
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

            {/* SEO */}
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                SEO
              </h3>
              <div>
                <label htmlFor="meta_title" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                  Meta title
                </label>
                <input
                  type="text"
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                  style={{ fontSize: '14px' }}
                />
              </div>
              <div>
                <label htmlFor="meta_description" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                  Meta description
                </label>
                <textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)] resize-none"
                  style={{ fontSize: '14px' }}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="no_index"
                  checked={formData.no_index}
                  onChange={(e) => setFormData({ ...formData, no_index: e.target.checked })}
                  className="rounded-sm border-[var(--border)]"
                />
                <label htmlFor="no_index" className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                  No index (empêcher l'indexation)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

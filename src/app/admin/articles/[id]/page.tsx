'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ClassificationPanel } from '@/components/admin/ClassificationPanel'
import { RichTextEditor } from '@/components/RichTextEditor'
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
  publisher: string
  source_type: string
  published_at: string
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

interface Dossier {
  id: string
  title: string
  slug: string
}

interface Tag {
  id: string
  name: string
  slug: string
}

interface Event {
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
  const [selectedPeople, setSelectedPeople] = useState<Person[]>([])
  const [selectedOrganizations, setSelectedOrganizations] = useState<Organization[]>([])
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([])
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([])
  const [availablePeople, setAvailablePeople] = useState<Person[]>([])
  const [availableOrganizations, setAvailableOrganizations] = useState<Organization[]>([])
  const [availablePlaces, setAvailablePlaces] = useState<Place[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [availableEvents, setAvailableEvents] = useState<Event[]>([])
  const [availableDossiers, setAvailableDossiers] = useState<Dossier[]>([])
  const [selectedDossiers, setSelectedDossiers] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
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

      // Load available entities
      const [peopleData, orgsData, placesData, eventsData, tagsData, dossiersData] = await Promise.all([
        supabase.from('people').select('id, name').order('name'),
        supabase.from('organizations').select('id, name').order('name'),
        supabase.from('places').select('id, name').order('name'),
        supabase.from('events').select('id, name').order('name'),
        supabase.from('tags').select('id, name, slug').order('name'),
        supabase.from('dossiers').select('id, title, slug').eq('is_visible', true).order('title'),
      ])

      if (peopleData.data) setAvailablePeople(peopleData.data)
      if (orgsData.data) setAvailableOrganizations(orgsData.data)
      if (placesData.data) setAvailablePlaces(placesData.data)
      if (eventsData.data) setAvailableEvents(eventsData.data)
      if (tagsData.data) setAvailableTags(tagsData.data)
      if (dossiersData.data) setAvailableDossiers(dossiersData.data)

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
          const { data: sourcesData, error: sourcesError } = await supabase
            .from('article_sources')
            .select('sources(*)')
            .eq('article_id', articleId)

          console.log('[Admin] Sources data:', sourcesData)
          console.log('[Admin] Sources error:', sourcesError)

          if (sourcesData) {
            setSources(sourcesData.map((s: any) => ({
              id: s.sources.id,
              title: s.sources.title,
              url: s.sources.url || '',
              publisher: s.sources.publisher || '',
              source_type: s.sources.source_type || 'other',
              published_at: s.sources.published_at ? s.sources.published_at.split('T')[0] : '',
            })))
          }

          // Load article dossiers
          const { data: dossiersData } = await supabase
            .from('article_dossiers')
            .select('dossier_id')
            .eq('article_id', articleId)

          if (dossiersData) {
            setSelectedDossiers(dossiersData.map((d: any) => d.dossier_id))
          }

          // Load article people
          const { data: peopleData } = await supabase
            .from('article_people')
            .select('people(id, name)')
            .eq('article_id', articleId)

          if (peopleData) {
            setSelectedPeople(peopleData.map((p: any) => p.people))
          }

          // Load article organizations
          const { data: orgsData } = await supabase
            .from('article_organizations')
            .select('organizations(id, name)')
            .eq('article_id', articleId)

          if (orgsData) {
            setSelectedOrganizations(orgsData.map((o: any) => o.organizations))
          }

          // Load article places
          const { data: placesData } = await supabase
            .from('article_places')
            .select('places(id, name)')
            .eq('article_id', articleId)

          if (placesData) {
            setSelectedPlaces(placesData.map((p: any) => p.places))
          }

          // Load article tags
          const { data: tagsData } = await supabase
            .from('article_tags')
            .select('tags(id, name, slug)')
            .eq('article_id', articleId)

          if (tagsData) {
            setSelectedTags(tagsData.map((t: any) => t.tags))
          }

          // Load article events
          const { data: eventsData } = await supabase
            .from('article_events')
            .select('events(id, name)')
            .eq('article_id', articleId)

          if (eventsData) {
            setSelectedEvents(eventsData.map((e: any) => e.events))
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

  const createPerson = async (name: string) => {
    const slug = generateSlug(name)
    const { data, error } = await supabase
      .from('people')
      .insert({ name, slug })
      .select()
      .single()

    if (error) {
      console.error('Error creating person:', error)
      return null
    }

    setAvailablePeople([...availablePeople, data])
    return data
  }

  const createOrganization = async (name: string) => {
    const slug = generateSlug(name)
    const { data, error } = await supabase
      .from('organizations')
      .insert({ name, slug })
      .select()
      .single()

    if (error) {
      console.error('Error creating organization:', error)
      return null
    }

    setAvailableOrganizations([...availableOrganizations, data])
    return data
  }

  const createPlace = async (name: string) => {
    const slug = generateSlug(name)
    const { data, error } = await supabase
      .from('places')
      .insert({ name, slug })
      .select()
      .single()

    if (error) {
      console.error('Error creating place:', error)
      return null
    }

    setAvailablePlaces([...availablePlaces, data])
    return data
  }

  const handleAddPerson = async (name: string) => {
    const existing = availablePeople.find(p => p.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      if (!selectedPeople.find(p => p.id === existing.id)) {
        setSelectedPeople([...selectedPeople, existing])
      }
      return
    }

    const newPerson = await createPerson(name)
    if (newPerson) {
      setSelectedPeople([...selectedPeople, newPerson])
    }
  }

  const handleAddOrganization = async (name: string) => {
    const existing = availableOrganizations.find(o => o.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      if (!selectedOrganizations.find(o => o.id === existing.id)) {
        setSelectedOrganizations([...selectedOrganizations, existing])
      }
      return
    }

    const newOrg = await createOrganization(name)
    if (newOrg) {
      setSelectedOrganizations([...selectedOrganizations, newOrg])
    }
  }

  const handleAddPlace = async (name: string) => {
    const existing = availablePlaces.find(p => p.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      if (!selectedPlaces.find(p => p.id === existing.id)) {
        setSelectedPlaces([...selectedPlaces, existing])
      }
      return
    }

    const newPlace = await createPlace(name)
    if (newPlace) {
      setSelectedPlaces([...selectedPlaces, newPlace])
    }
  }

  const createTag = async (name: string) => {
    const slug = generateSlug(name)
    const { data, error } = await supabase
      .from('tags')
      .insert({ name, slug })
      .select()
      .single()

    if (error) {
      console.error('Error creating tag:', error)
      return null
    }

    setAvailableTags([...availableTags, data])
    return data
  }

  const handleAddTag = async (name: string) => {
    const existing = availableTags.find(t => t.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      if (!selectedTags.find(t => t.id === existing.id)) {
        setSelectedTags([...selectedTags, existing])
      }
      return
    }

    const newTag = await createTag(name)
    if (newTag) {
      setSelectedTags([...selectedTags, newTag])
    }
  }

  const createEvent = async (name: string) => {
    const slug = generateSlug(name)
    const { data, error } = await supabase
      .from('events')
      .insert({ name, slug })
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      return null
    }

    setAvailableEvents([...availableEvents, data])
    return data
  }

  const handleAddEvent = async (name: string) => {
    const existing = availableEvents.find(e => e.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      if (!selectedEvents.find(e => e.id === existing.id)) {
        setSelectedEvents([...selectedEvents, existing])
      }
      return
    }

    const newEvent = await createEvent(name)
    if (newEvent) {
      setSelectedEvents([...selectedEvents, newEvent])
    }
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
        // Save sources
        // First, delete existing article_sources for this article
        if (!isNew && articleId) {
          await supabase.from('article_sources').delete().eq('article_id', articleId)
        }

        // Then insert/update sources
        for (const source of sources) {
          if (source.title) {
            // Check if source already exists
            let sourceId = source.id
            if (!sourceId) {
              // Create new source
              const { data: newSource, error: sourceError } = await supabase
                .from('sources')
                .insert({
                  title: source.title,
                  url: source.url || null,
                  publisher: source.publisher || null,
                  source_type: source.source_type || 'other',
                  published_at: source.published_at || null,
                })
                .select()
                .single()

              if (!sourceError && newSource) {
                sourceId = newSource.id
              }
            } else {
              // Update existing source
              await supabase
                .from('sources')
                .update({
                  title: source.title,
                  url: source.url || null,
                  publisher: source.publisher || null,
                  source_type: source.source_type || 'other',
                  published_at: source.published_at || null,
                })
                .eq('id', sourceId)
            }

            // Link source to article
            if (sourceId && articleId) {
              await supabase.from('article_sources').insert({
                article_id: articleId,
                source_id: sourceId,
              })
            }
          }
        }

        // Save dossier associations
        if (articleId) {
          await supabase.from('article_dossiers').delete().eq('article_id', articleId)

          if (selectedDossiers.length > 0) {
            const dossierAssociations = selectedDossiers.map((dossierId) => ({
              article_id: articleId,
              dossier_id: dossierId,
            }))
            await supabase.from('article_dossiers').insert(dossierAssociations)
          }

          // Save people associations
          await supabase.from('article_people').delete().eq('article_id', articleId)

          if (selectedPeople.length > 0) {
            const peopleAssociations = selectedPeople.map((person) => ({
              article_id: articleId,
              person_id: person.id,
            }))
            await supabase.from('article_people').insert(peopleAssociations)
          }

          // Save organizations associations
          await supabase.from('article_organizations').delete().eq('article_id', articleId)

          if (selectedOrganizations.length > 0) {
            const orgAssociations = selectedOrganizations.map((org) => ({
              article_id: articleId,
              organization_id: org.id,
            }))
            await supabase.from('article_organizations').insert(orgAssociations)
          }

          // Save places associations
          await supabase.from('article_places').delete().eq('article_id', articleId)

          if (selectedPlaces.length > 0) {
            const placeAssociations = selectedPlaces.map((place) => ({
              article_id: articleId,
              place_id: place.id,
            }))
            await supabase.from('article_places').insert(placeAssociations)
          }

          // Save tags associations
          await supabase.from('article_tags').delete().eq('article_id', articleId)

          if (selectedTags.length > 0) {
            const tagAssociations = selectedTags.map((tag) => ({
              article_id: articleId,
              tag_id: tag.id,
            }))
            await supabase.from('article_tags').insert(tagAssociations)
          }

          // Save events associations
          await supabase.from('article_events').delete().eq('article_id', articleId)

          if (selectedEvents.length > 0) {
            const eventAssociations = selectedEvents.map((event) => ({
              article_id: articleId,
              event_id: event.id,
            }))
            await supabase.from('article_events').insert(eventAssociations)
          }
        }

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
                <RichTextEditor 
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                />
                <p className="text-xs text-[var(--text-muted)] mt-1" style={{ fontSize: '11px' }}>
                  Utilisez la barre d'outils pour formater le texte (titres, gras, italique, liens, etc.)
                </p>
              </div>
            </div>

            {/* Sources */}
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                Sources
              </h3>
              {sources.map((source, index) => (
                <div key={index} className="space-y-2 border-b border-[var(--border)] pb-4 last:border-b-0 last:pb-0">
                  <div className="flex gap-2">
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
                      title="Supprimer la source"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={source.publisher}
                      onChange={(e) => {
                        const newSources = [...sources]
                        newSources[index] = { ...newSources[index], publisher: e.target.value }
                        setSources(newSources)
                      }}
                      placeholder="Éditeur (nom du média)"
                      className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                      style={{ fontSize: '14px' }}
                    />
                    <select
                      value={source.source_type || 'other'}
                      onChange={(e) => {
                        const newSources = [...sources]
                        newSources[index] = { ...newSources[index], source_type: e.target.value }
                        setSources(newSources)
                      }}
                      className="px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                      style={{ fontSize: '14px' }}
                    >
                      <option value="official">Officiel</option>
                      <option value="media">Média</option>
                      <option value="academic">Académique</option>
                      <option value="institution">Institution</option>
                      <option value="data">Données</option>
                      <option value="document">Document</option>
                      <option value="other">Autre</option>
                    </select>
                    <input
                      type="date"
                      value={source.published_at}
                      onChange={(e) => {
                        const newSources = [...sources]
                        newSources[index] = { ...newSources[index], published_at: e.target.value }
                        setSources(newSources)
                      }}
                      placeholder="Date de publication"
                      className="px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                      style={{ fontSize: '14px' }}
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() => setSources([...sources, { id: '', title: '', url: '', publisher: '', source_type: 'other', published_at: '' }])}
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
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dossiers */}
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                Dossiers
              </h3>
              <div className="space-y-2">
                {selectedDossiers.map((dossierId) => {
                  const dossier = availableDossiers.find(d => d.id === dossierId)
                  if (!dossier) return null
                  return (
                    <div key={dossierId} className="flex items-center justify-between p-2 bg-[var(--background)] border border-[var(--border)]">
                      <span className="text-sm text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                        {dossier.title}
                      </span>
                      <button
                        onClick={() => setSelectedDossiers(selectedDossiers.filter(id => id !== dossierId))}
                        className="p-1 text-[var(--text-error)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        <X size={14} />
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

            {/* People */}
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                Personnes
              </h3>
              <div className="space-y-2">
                {selectedPeople.map((person) => (
                  <div key={person.id} className="flex items-center justify-between p-2 bg-[var(--background)] border border-[var(--border)]">
                    <span className="text-sm text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                      {person.name}
                    </span>
                    <button
                      onClick={() => setSelectedPeople(selectedPeople.filter(p => p.id !== person.id))}
                      className="p-1 text-[var(--text-error)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    const person = availablePeople.find(p => p.id === e.target.value)
                    if (person && !selectedPeople.find(p => p.id === person.id)) {
                      setSelectedPeople([...selectedPeople, person])
                    }
                  }
                }}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                style={{ fontSize: '14px' }}
              >
                <option value="">Sélectionner une personne...</option>
                {availablePeople
                  .filter(p => !selectedPeople.find(sp => sp.id === p.id))
                  .map(person => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ou créer une nouvelle personne..."
                  className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                  style={{ fontSize: '14px' }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const target = e.target as HTMLInputElement
                      if (target.value.trim()) {
                        handleAddPerson(target.value.trim())
                        target.value = ''
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Organizations */}
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                Organisations
              </h3>
              <div className="space-y-2">
                {selectedOrganizations.map((org) => (
                  <div key={org.id} className="flex items-center justify-between p-2 bg-[var(--background)] border border-[var(--border)]">
                    <span className="text-sm text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                      {org.name}
                    </span>
                    <button
                      onClick={() => setSelectedOrganizations(selectedOrganizations.filter(o => o.id !== org.id))}
                      className="p-1 text-[var(--text-error)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    const org = availableOrganizations.find(o => o.id === e.target.value)
                    if (org && !selectedOrganizations.find(o => o.id === org.id)) {
                      setSelectedOrganizations([...selectedOrganizations, org])
                    }
                  }
                }}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                style={{ fontSize: '14px' }}
              >
                <option value="">Sélectionner une organisation...</option>
                {availableOrganizations
                  .filter(o => !selectedOrganizations.find(so => so.id === o.id))
                  .map(org => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ou créer une nouvelle organisation..."
                  className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                  style={{ fontSize: '14px' }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const target = e.target as HTMLInputElement
                      if (target.value.trim()) {
                        handleAddOrganization(target.value.trim())
                        target.value = ''
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Places */}
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                Lieux
              </h3>
              <div className="space-y-2">
                {selectedPlaces.map((place) => (
                  <div key={place.id} className="flex items-center justify-between p-2 bg-[var(--background)] border border-[var(--border)]">
                    <span className="text-sm text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                      {place.name}
                    </span>
                    <button
                      onClick={() => setSelectedPlaces(selectedPlaces.filter(p => p.id !== place.id))}
                      className="p-1 text-[var(--text-error)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    const place = availablePlaces.find(p => p.id === e.target.value)
                    if (place && !selectedPlaces.find(p => p.id === place.id)) {
                      setSelectedPlaces([...selectedPlaces, place])
                    }
                  }
                }}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                style={{ fontSize: '14px' }}
              >
                <option value="">Sélectionner un lieu...</option>
                {availablePlaces
                  .filter(p => !selectedPlaces.find(sp => sp.id === p.id))
                  .map(place => (
                    <option key={place.id} value={place.id}>
                      {place.name}
                    </option>
                  ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ou créer un nouveau lieu..."
                  className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                  style={{ fontSize: '14px' }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const target = e.target as HTMLInputElement
                      if (target.value.trim()) {
                        handleAddPlace(target.value.trim())
                        target.value = ''
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                Thèmes (Tags)
              </h3>
              <div className="space-y-2">
                {selectedTags.map((tag) => (
                  <div key={tag.id} className="flex items-center justify-between p-2 bg-[var(--background)] border border-[var(--border)]">
                    <span className="text-sm text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                      {tag.name}
                    </span>
                    <button
                      onClick={() => setSelectedTags(selectedTags.filter(t => t.id !== tag.id))}
                      className="p-1 text-[var(--text-error)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    const tag = availableTags.find(t => t.id === e.target.value)
                    if (tag && !selectedTags.find(t => t.id === tag.id)) {
                      setSelectedTags([...selectedTags, tag])
                    }
                  }
                }}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                style={{ fontSize: '14px' }}
              >
                <option value="">Sélectionner un thème...</option>
                {availableTags
                  .filter(t => !selectedTags.find(st => st.id === t.id))
                  .map(tag => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ou créer un nouveau thème..."
                  className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                  style={{ fontSize: '14px' }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const target = e.target as HTMLInputElement
                      if (target.value.trim()) {
                        handleAddTag(target.value.trim())
                        target.value = ''
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Events */}
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                Événements
              </h3>
              <div className="space-y-2">
                {selectedEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-2 bg-[var(--background)] border border-[var(--border)]">
                    <span className="text-sm text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                      {event.name}
                    </span>
                    <button
                      onClick={() => setSelectedEvents(selectedEvents.filter(e => e.id !== event.id))}
                      className="p-1 text-[var(--text-error)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <select
                value=""
                onChange={(evt) => {
                  if (evt.target.value) {
                    const event = availableEvents.find(ev => ev.id === evt.target.value)
                    if (event && !selectedEvents.find(se => se.id === event.id)) {
                      setSelectedEvents([...selectedEvents, event])
                    }
                  }
                }}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                style={{ fontSize: '14px' }}
              >
                <option value="">Sélectionner un événement...</option>
                {availableEvents
                  .filter(e => !selectedEvents.find(se => se.id === e.id))
                  .map(event => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ou créer un nouvel événement..."
                  className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                  style={{ fontSize: '14px' }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const target = e.target as HTMLInputElement
                      if (target.value.trim()) {
                        handleAddEvent(target.value.trim())
                        target.value = ''
                      }
                    }
                  }}
                />
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

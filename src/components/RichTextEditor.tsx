'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Undo,
  Redo,
} from 'lucide-react'
import { useState, useEffect, useRef, type ReactNode } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
}

type LinkType = 'external' | 'internal'

interface ArticleOption {
  id: string
  title: string
  slug: string
}

/**
 * Normalise et sécurise une URL de lien.
 * - chemins relatifs internes (/article/...) acceptés
 * - http(s), mailto, tel acceptés
 * - "exemple.com" devient "https://exemple.com"
 * - tout autre schéma (javascript:, data:, ...) est refusé
 */
function normalizeUrl(raw: string): string | null {
  const value = raw.trim()
  if (!value) return null

  if (value.startsWith('/') && !value.startsWith('//')) return value
  if (/^(mailto:|tel:)/i.test(value)) return value

  if (/^https?:\/\//i.test(value)) {
    try {
      new URL(value)
      return value
    } catch {
      return null
    }
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return null

  try {
    new URL(`https://${value}`)
    return `https://${value}`
  } catch {
    return null
  }
}

interface ToolbarButtonProps {
  label: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
  children: ReactNode
}

function ToolbarButton({
  label,
  onClick,
  active = false,
  disabled = false,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      // Empêche la perte de focus / sélection dans l'éditeur au clic
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-30 sm:h-9 sm:w-9 ${
        active
          ? 'bg-[var(--accent)] text-[var(--text-inverse)]'
          : 'text-[var(--text-muted)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      className="mx-1 hidden h-6 w-px bg-[var(--border)] sm:block"
    />
  )
}

const fieldClass =
  'min-h-10 w-full rounded-sm border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-base text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:min-h-9 sm:text-sm'

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkType, setLinkType] = useState<LinkType>('external')
  const [linkError, setLinkError] = useState<string | null>(null)
  const [articles, setArticles] = useState<ArticleOption[]>([])
  const [articlesError, setArticlesError] = useState(false)

  // Toujours appeler la dernière version de onChange sans recréer l'éditeur
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Récupère les articles pour les liens internes
  useEffect(() => {
    const controller = new AbortController()

    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/articles', {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data: unknown = await response.json()
        setArticles(Array.isArray(data) ? (data as ArticleOption[]) : [])
        setArticlesError(false)
      } catch (error) {
        if (controller.signal.aborted) return
        console.error('Error fetching articles:', error)
        setArticlesError(true)
      }
    }

    fetchArticles()
    return () => controller.abort()
  }, [])

  const editor = useEditor({
    // Évite les erreurs d'hydratation avec le rendu serveur de Next.js
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'underline',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChangeRef.current(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[300px] sm:min-h-[400px] px-3 py-2 text-[var(--text-primary)] ' +
          // Couleurs du plugin typography alignées sur le thème (plus de bleu/gris imposé)
          '[--tw-prose-body:var(--text-primary)] [--tw-prose-headings:var(--text-primary)] ' +
          '[--tw-prose-bold:var(--text-primary)] [--tw-prose-bullets:var(--text-muted)] ' +
          '[--tw-prose-counters:var(--text-muted)] [--tw-prose-quotes:var(--text-primary)] ' +
          // Garde-fou : titres, paragraphes et listes gardent la couleur du thème
          '[&_:is(h1,h2,h3,p,li)]:!text-[var(--text-primary)]',
      },
    },
  })

  // Synchronise l'éditeur si `content` change depuis l'extérieur
  // (ex. article chargé après le premier rendu)
  useEffect(() => {
    if (!editor) return
    if (content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const resetLinkForm = () => {
    setLinkUrl('')
    setLinkError(null)
    setShowLinkInput(false)
  }

  const addLink = () => {
    if (!editor) return

    const href = normalizeUrl(linkUrl)
    if (!href) {
      setLinkError(
        linkType === 'internal'
          ? 'Sélectionnez un article.'
          : 'URL invalide. Exemple : https://exemple.com'
      )
      return
    }

    const { empty } = editor.state.selection

    if (empty && !editor.isActive('link')) {
      // Aucun texte sélectionné : on insère le lien avec un libellé
      const label =
        linkType === 'internal'
          ? articles.find((a) => `/article/${a.slug}` === href)?.title ?? href
          : href

      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: label,
          marks: [{ type: 'link', attrs: { href } }],
        })
        .run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
    }

    resetLinkForm()
  }

  if (!editor) {
    return null
  }

  return (
    <div className="overflow-hidden rounded-sm border border-[var(--border)] bg-[var(--background)]">
      {/* Toolbar */}
      <div
        role="toolbar"
        aria-label="Mise en forme du texte"
        className="flex flex-wrap items-center gap-1 border-b border-[var(--border)] bg-[var(--surface)] p-2"
      >
        {/* Text formatting */}
        <ToolbarButton
          label="Gras"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </ToolbarButton>

        <ToolbarButton
          label="Italique"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton
          label="Titre 1"
          active={editor.isActive('heading', { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 size={16} />
        </ToolbarButton>

        <ToolbarButton
          label="Titre 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 size={16} />
        </ToolbarButton>

        <ToolbarButton
          label="Titre 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 size={16} />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          label="Liste à puces"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </ToolbarButton>

        <ToolbarButton
          label="Liste numérotée"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <ToolbarButton
          label={editor.isActive('link') ? 'Retirer le lien' : 'Lien'}
          active={editor.isActive('link') || showLinkInput}
          onClick={() => {
            if (editor.isActive('link')) {
              editor.chain().focus().extendMarkRange('link').unsetLink().run()
            } else {
              setLinkError(null)
              setShowLinkInput((prev) => !prev)
            }
          }}
        >
          <LinkIcon size={16} />
        </ToolbarButton>

        <Divider />

        {/* Undo/Redo */}
        <ToolbarButton
          label="Annuler"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo size={16} />
        </ToolbarButton>

        <ToolbarButton
          label="Rétablir"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo size={16} />
        </ToolbarButton>
      </div>

      {/* Link panel : pleine largeur sur mobile, en ligne dès sm */}
      {showLinkInput && (
        <div className="flex flex-col gap-2 border-b border-[var(--border)] bg-[var(--surface)] p-2 sm:flex-row sm:items-center">
          <select
            value={linkType}
            onChange={(e) => {
              setLinkType(e.target.value as LinkType)
              setLinkUrl('')
              setLinkError(null)
            }}
            aria-label="Type de lien"
            className={`${fieldClass} sm:w-28`}
          >
            <option value="external">Externe</option>
            <option value="internal">Interne</option>
          </select>

          {linkType === 'external' ? (
            <input
              type="text"
              inputMode="url"
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={linkUrl}
              onChange={(e) => {
                setLinkUrl(e.target.value)
                setLinkError(null)
              }}
              placeholder="https://..."
              aria-label="Adresse du lien"
              aria-invalid={linkError ? true : undefined}
              className={`${fieldClass} sm:w-56`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addLink()
                } else if (e.key === 'Escape') {
                  resetLinkForm()
                }
              }}
            />
          ) : (
            <select
              value={linkUrl}
              onChange={(e) => {
                setLinkUrl(e.target.value)
                setLinkError(null)
              }}
              aria-label="Article à lier"
              aria-invalid={linkError ? true : undefined}
              className={`${fieldClass} sm:w-64`}
            >
              <option value="">Sélectionner un article</option>
              {articles.map((article) => (
                <option key={article.id} value={`/article/${article.slug}`}>
                  {article.title}
                </option>
              ))}
            </select>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={addLink}
              className="min-h-10 flex-1 rounded-sm bg-[var(--accent)] px-3 py-1 text-sm text-[var(--text-inverse)] transition-colors hover:bg-[var(--accent-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:min-h-9 sm:flex-none"
            >
              OK
            </button>
            <button
              type="button"
              onClick={resetLinkForm}
              className="min-h-10 flex-1 rounded-sm px-3 py-1 text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--border)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:min-h-9 sm:flex-none"
            >
              Annuler
            </button>
          </div>

          {(linkError || (linkType === 'internal' && articlesError)) && (
            <p role="alert" className="text-sm text-red-400 sm:basis-full">
              {linkError ?? 'Impossible de charger la liste des articles.'}
            </p>
          )}
        </div>
      )}

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}
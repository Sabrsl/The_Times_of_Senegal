'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Download } from 'lucide-react'
import { generatePDFReference } from '@/lib/pdf-reference'

// Ré-exports conservés pour ne casser aucun import existant
export { verifyPDFReference, extractArticleIdFromReference } from '@/lib/pdf-reference'

interface DownloadPDFProps {
  articleId: string
  articleTitle: string
  articleSlug: string
  publishedAt?: string | null
}

const SITE_NAME = 'The Time of Sénégal'
const PRINT_STYLE_ID = 'download-pdf-print-styles'
const VERIFY_LINK_ID = 'pdf-verify-link'
const HEADER_TITLE_MAX = 90
const FOOTER_TITLE_MAX = 50
// Filet de sécurité si `afterprint` n'est jamais déclenché (certains navigateurs mobiles)
const CLEANUP_FALLBACK_MS = 30_000

/** Échappe une valeur pour l'insérer dans une chaîne CSS entre guillemets. */
function escapeCssString(value: string): string {
  return value
    .replace(/\p{Cc}/gu, ' ') // retours à la ligne et caractères de contrôle
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
}

/** Tronque sans couper un caractère multi-octets (emoji, accents composés). */
function truncate(value: string, max: number): string {
  const chars = Array.from(value.trim())
  return chars.length > max ? `${chars.slice(0, max - 1).join('')}…` : chars.join('')
}

/** Nom du fichier PDF proposé : "Nom du site - slug". */
function toFileName(slug: string, fallbackTitle: string): string {
  const base = (slug || fallbackTitle)
    .replace(/[\\/:*?"<>|\p{Cc}]/gu, '')
    .trim()
    .slice(0, 100)
  return base ? `${SITE_NAME} - ${base}` : SITE_NAME
}

function buildPrintCss(articleTitle: string, reference: string, verifyUrl: string): string {
  const site = escapeCssString(SITE_NAME)
  const headerTitle = escapeCssString(truncate(articleTitle, HEADER_TITLE_MAX))
  const footerTitle = escapeCssString(truncate(articleTitle, FOOTER_TITLE_MAX))
  const footerRef = escapeCssString(reference) // Juste la référence, sans "Réf:"

  return `
    @page {
      size: A4;
      margin: 20mm;

      /* Pied de page centré (Chrome / Edge) */
      @bottom-center {
        content: "${site} - ${footerTitle}  |  Page " counter(page) " / " counter(pages);
        font-size: 8pt;
        color: #000;
        text-align: center;
      }

      @bottom-left {
        content: "${footerRef}";
        font-size: 7pt;
        color: #666;
        text-align: left;
      }
    }

    @media print {
      html, body {
        background: #fff !important;
      }

      body * {
        visibility: hidden;
      }

      #contenu,
      #contenu * {
        visibility: visible;
      }

      #contenu {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        margin: 0 !important;
        padding: 0 !important;
      }

      /* En-tête centré en haut de la première page (tous navigateurs) */
      #contenu::before {
        content: "${site}" "\\A" "${headerTitle}";
        display: block;
        white-space: pre-line;
        text-align: center;
        font-size: 11pt;
        font-weight: 700;
        line-height: 1.5;
        padding-bottom: 6mm;
        margin-bottom: 8mm;
        border-bottom: 0.5pt solid #000;
      }

      /* Texte noir sur fond blanc, sans aucun fond hérité du thème */
      #contenu,
      #contenu * {
        color: #000 !important;
        background: transparent !important;
        box-shadow: none !important;
        text-shadow: none !important;
      }

      /* Mise en page : éviter les coupures disgracieuses */
      #contenu img {
        max-width: 100% !important;
        height: auto !important;
        break-inside: avoid;
      }

      #contenu h1,
      #contenu h2,
      #contenu h3 {
        break-after: avoid;
      }

      #contenu blockquote,
      #contenu pre,
      #contenu table,
      #contenu figure {
        break-inside: avoid;
      }

      /* Masquer boutons et éléments interactifs */
      button,
      form,
      .fixed,
      [role="button"],
      [data-no-print] {
        display: none !important;
      }

      /* Masquer le bloc des commentaires */
      #commentaires,
      #comments,
      #comment-section,
      [id^="comment" i],
      [class*="comment" i],
      [data-comments],
      section[aria-label*="ommentaire" i],
      section[aria-label*="comment" i] {
        display: none !important;
      }

      /* Lien de vérification à la fin du contenu */
      #${VERIFY_LINK_ID} {
        display: block !important;
        margin-top: 12mm;
        padding-top: 6mm;
        border-top: 0.5pt solid #000;
        text-align: center;
        font-size: 8pt;
        color: #0066cc !important;
        text-decoration: underline;
        break-inside: avoid;
      }
    }
  `
}

export function DownloadPDF({ articleId, articleTitle, articleSlug, publishedAt }: DownloadPDFProps) {
  const [isPrinting, setIsPrinting] = useState(false)
  const cleanupRef = useRef<(() => void) | null>(null)

  // Nettoyage si le composant est démonté pendant l'impression
  useEffect(() => {
    return () => {
      cleanupRef.current?.()
    }
  }, [])

  const handleDownload = useCallback(() => {
    if (typeof window === 'undefined' || cleanupRef.current) return

    // Référence de traçabilité et URL de vérification
    const reference = generatePDFReference(articleId, publishedAt)
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/+$/, '')
    const verifyUrl = `${baseUrl}/verify/${encodeURIComponent(reference)}`

    const previousTitle = document.title
    const style = document.createElement('style')
    style.id = PRINT_STYLE_ID
    style.textContent = buildPrintCss(articleTitle, reference, verifyUrl)

    let verifyLink: HTMLAnchorElement | null = null
    let fallbackTimer: number | undefined

    const cleanup = () => {
      window.removeEventListener('afterprint', cleanup)
      if (fallbackTimer !== undefined) window.clearTimeout(fallbackTimer)
      style.remove()
      verifyLink?.remove()
      document.title = previousTitle
      cleanupRef.current = null
      setIsPrinting(false)
    }

    cleanupRef.current = cleanup
    setIsPrinting(true)

    document.head.appendChild(style)

    // Lien de vérification ajouté à la fin du contenu (visible uniquement à l'impression)
    const content = document.getElementById('contenu')
    if (content) {
      verifyLink = document.createElement('a')
      verifyLink.id = VERIFY_LINK_ID
      verifyLink.href = verifyUrl
      verifyLink.textContent = "Vérifier l'authenticité de ce document"
      verifyLink.style.display = 'none'
      content.appendChild(verifyLink)
    }

    // Le titre du document devient le nom du fichier PDF proposé
    document.title = toFileName(articleSlug, articleTitle)

    window.addEventListener('afterprint', cleanup, { once: true })
    fallbackTimer = window.setTimeout(cleanup, CLEANUP_FALLBACK_MS)

    try {
      window.print()
    } catch {
      cleanup()
    }
  }, [articleId, articleTitle, articleSlug, publishedAt])

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isPrinting}
      aria-busy={isPrinting}
      aria-label={`Imprimer ou télécharger en PDF : ${articleTitle}`}
      title="Imprimer / Télécharger en PDF"
      data-article-id={articleId}
      className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-strong)] disabled:cursor-not-allowed disabled:opacity-60 md:min-h-0 md:px-2 md:py-1 md:text-[11px] print:hidden"
    >
      <Download size={12} aria-hidden="true" />
      PDF
    </button>
  )
}
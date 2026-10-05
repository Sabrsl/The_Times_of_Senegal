import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { verifyPDFReference, PDF_REFERENCE_PATTERN } from '@/lib/pdf-reference'
import { Shield, CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { createPublicClient } from '@/lib/supabase/public'
import { redirect } from 'next/navigation'

interface VerifyPageProps {
  // Next.js récent : params est une Promise
  params: Promise<{ reference: string }>
}

const LINK_CLASS =
  'inline-flex items-center gap-2 rounded-md bg-[var(--surface)] border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] hover:border-[var(--border-strong)] transition-colors'

// Nombre d'articles publiés examinés pour retrouver la référence
const MAX_ARTICLES_SCANNED = 1000

/** Décode la référence de l'URL sans jamais lever d'erreur. */
function normalizeReference(raw: string | undefined): string {
  if (!raw) return ''
  try {
    const decoded = decodeURIComponent(raw)
    // Nettoyer : enlever les espaces, sauts de ligne, et mettre en majuscules
    return decoded.replace(/[\s\r\n]+/g, '').trim().toUpperCase()
  } catch {
    return raw.replace(/[\s\r\n]+/g, '').trim().toUpperCase()
  }
}

/** Écran d'erreur centré (même rendu qu'avant, sans duplication). */
function MessageScreen({
  icon,
  title,
  message,
}: {
  icon: ReactNode
  title: string
  message: string
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          {icon}
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">{title}</h1>
            <p className="mt-2 text-[var(--text-secondary)]">{message}</p>
          </div>
          <Link href="/" className={LINK_CLASS}>
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}

// Récupère l'article dont la référence correspond
async function getArticleInfo(reference: string) {
  const supabase = createPublicClient()

  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, published_at, created_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(MAX_ARTICLES_SCANNED)

  if (error || !data) return null

  for (const article of data) {
    const date = article.published_at || article.created_at
    if (verifyPDFReference(reference, article.id, date)) {
      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        publishedAt: date,
      }
    }
  }

  return null
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { reference: rawReference } = await params
  const reference = normalizeReference(rawReference)

  if (!PDF_REFERENCE_PATTERN.test(reference)) {
    return (
      <MessageScreen
        icon={
          <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
            <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
        }
        title="Référence invalide"
        message="Le format de la référence de traçabilité n'est pas valide."
      />
    )
  }

  const articleInfo = await getArticleInfo(reference)

  if (!articleInfo) {
    return (
      <MessageScreen
        icon={
          <div className="rounded-full bg-yellow-100 p-4 dark:bg-yellow-900/20">
            <AlertCircle className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
          </div>
        }
        title="Article non trouvé"
        message="L'article correspondant à cette référence n'existe pas ou a été supprimé."
      />
    )
  }

  const isValid = verifyPDFReference(reference, articleInfo.id, articleInfo.publishedAt)

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-[var(--text-muted)]" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              Vérification de traçabilité
            </h1>
          </div>

          {/* Search Bar */}
          <form action="/verify" method="GET" className="flex gap-2">
            <input
              type="text"
              name="reference"
              placeholder="Collez votre référence ici..."
              className="flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)]"
              defaultValue={reference}
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--surface)] border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] hover:border-[var(--border-strong)] transition-colors"
            >
              <Search size={16} />
              Vérifier
            </button>
          </form>

          {/* Status Card */}
          <div
            className={`rounded-lg border p-6 ${
              isValid
                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10'
                : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`rounded-full p-2 ${
                  isValid ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
                }`}
              >
                {isValid ? (
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  {isValid ? 'Référence valide' : 'Référence invalide'}
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {isValid
                    ? 'Ce document PDF est authentique et provient bien de The Time of Sénégal.'
                    : 'Cette référence a été modifiée ou ne correspond pas à cet article.'}
                </p>
              </div>
            </div>
          </div>

          {/* Reference Details */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--text-primary)]">
              Détails de la référence
            </h3>
            <div className="space-y-3">
              <div className="flex flex-col gap-1 text-sm sm:flex-row sm:justify-between sm:gap-4">
                <span className="text-[var(--text-muted)]">Référence</span>
                <code className="break-all font-mono text-[var(--text-primary)]">{reference}</code>
              </div>
              <div className="flex flex-col gap-1 text-sm sm:flex-row sm:justify-between sm:gap-4">
                <span className="text-[var(--text-muted)]">ID de l&apos;article</span>
                <span className="break-all font-mono text-[var(--text-primary)]">{articleInfo.id}</span>
              </div>
              <div className="flex flex-col gap-1 text-sm sm:flex-row sm:justify-between sm:gap-4">
                <span className="text-[var(--text-muted)]">Date de publication</span>
                <span className="text-[var(--text-primary)]">
                  {new Date(articleInfo.publishedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center">
            <Link href={`/article/${articleInfo.slug}`} className={LINK_CLASS}>
              Voir l&apos;article original
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
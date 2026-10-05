import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CommentList } from '@/components/CommentList'
import { CommentForm } from '@/components/CommentForm'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowDown } from 'lucide-react'
import { Playfair_Display } from 'next/font/google'
import { cache } from 'react'
import type { Metadata } from 'next'

/** Même police de titres que la page article (voir note : à mutualiser dans un fichier commun). */
const titleFont = Playfair_Display({
  subsets: ['latin'],
  style: ['italic'],
  weight: ['600', '700'],
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
})

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * `cache` évite de requêter deux fois le même article
 * (une fois pour les métadonnées, une fois pour la page).
 */
const getArticle = cache(async (slug: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !data) {
    return null
  }

  return data
})

async function getComments(articleId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('comments')
    .select('id, content, author_name, user_id, created_at')
    .eq('article_id', articleId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[CommentsPage] Erreur lors du chargement des commentaires :', error.message)
  }

  return data || []
}

/* -------------------------------------------------------------------------- */
/*  Métadonnées                                                               */
/* -------------------------------------------------------------------------- */

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const article = await getArticle(params.slug)
  return {
    title: article ? `Commentaires – ${article.title}` : 'Commentaires',
  }
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default async function CommentsPage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug)

  if (!article) {
    notFound()
  }

  const comments = await getComments(article.id)
  const count = comments.length

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Header />

      <main id="contenu" className="mx-auto w-full max-w-2xl flex-1 px-4 py-4 sm:px-6 sm:py-6">
        {/* Navigation : retour + accès direct au formulaire (utile sur mobile) */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            href={`/article/${article.slug}`}
            className="-ml-1 inline-flex min-h-9 items-center gap-1.5 rounded px-1 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Retour à l&apos;article
          </Link>

          <a
            href="#commenter"
            className="inline-flex min-h-9 items-center gap-1.5 rounded px-1 text-sm text-[var(--accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Commenter
            <ArrowDown size={14} aria-hidden="true" />
          </a>
        </div>

        {/* Titre avec nombre de commentaires */}
        <header className="mb-4 border-b border-[var(--border)] pb-4">
          <h1
            className={`${titleFont.className} text-[28px] font-bold italic leading-[1.15] tracking-[0.01em] text-[var(--text-primary)] sm:text-[36px] sm:tracking-[0.015em]`}
          >
            {count} commentaire{count > 1 ? 's' : ''}
          </h1>
          <p className="mt-1.5 text-sm leading-snug text-[var(--text-secondary)]">
            pour l&apos;article{' '}
            <Link
              href={`/article/${article.slug}`}
              className="font-medium text-[var(--text-primary)] hover:underline"
            >
              {article.title}
            </Link>
          </p>
        </header>

        {/* Tous les commentaires */}
        <section aria-label="Commentaires" className="mb-6">
          <CommentList comments={comments} />
        </section>

        {/* Formulaire */}
        <section
          id="commenter"
          aria-label="Ajouter un commentaire"
          className="scroll-mt-20 border-t border-[var(--border)] pt-4"
        >
          <CommentForm articleId={article.id} />
        </section>
      </main>

      <Footer />
    </div>
  )
}
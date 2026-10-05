'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ArticleCard } from '@/components/ArticleCard'
import { articles } from '@/data/articles'
import { Search } from 'lucide-react'

export default function RecherchePage() {
  const [query, setQuery] = useState('')
  const [searched, setSearched] = useState(false)

  const filteredArticles = articles.filter((article) => {
    if (!query) return false
    const searchLower = query.toLowerCase()
    const categoryStr = typeof article.category === 'string' ? article.category : article.category.name
    return (
      article.title.toLowerCase().includes(searchLower) ||
      article.excerpt.toLowerCase().includes(searchLower) ||
      categoryStr.toLowerCase().includes(searchLower)
    )
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearched(true)
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <section className="mb-8 pb-6 border-b border-[var(--border)]">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4" style={{ fontSize: '32px' }}>
            Recherche
          </h1>
          
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" size={16} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher des articles, personnes, organisations..."
                className="w-full pl-10 pr-4 py-3 bg-[var(--surface-muted)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                style={{ fontSize: '14px' }}
              />
            </div>
          </form>
        </section>

        {searched && (
          <section>
            {filteredArticles.length > 0 ? (
              <>
                <p className="text-sm text-[var(--text-secondary)] mb-6" style={{ fontSize: '14px' }}>
                  {filteredArticles.length} résultat{filteredArticles.length > 1 ? 's' : ''} pour "{query}"
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </>
            ) : (
              <section className="text-center py-12">
                <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                  Aucun résultat pour "{query}"
                </p>
              </section>
            )}
          </section>
        )}

        {!searched && (
          <section className="text-center py-12">
            <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
              Entrez un terme de recherche pour trouver des articles.
            </p>
          </section>
        )}

        <section className="mt-12 p-4 bg-[var(--surface-muted)] border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] text-center" style={{ fontSize: '11px' }}>
            CONTENU DE DÉMONSTRATION
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}

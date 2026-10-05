import { Header } from './Header'
import { Footer } from './Footer'
import { ArticleCard } from './ArticleCard'

interface EntityLayoutProps {
  title: string
  subtitle?: string
  image?: string
  description?: string
  children: React.ReactNode
  relatedArticles?: any[]
}

export function EntityLayout({ title, subtitle, image, description, children, relatedArticles }: EntityLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        {/* Header */}
        <section className="mb-8 pb-6 border-b border-[var(--border)]">
          {subtitle && (
            <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2" style={{ fontSize: '11px' }}>
              {subtitle}
            </div>
          )}
          {image && (
            <img 
              src={image} 
              alt={title}
              className="w-full h-48 object-cover border border-[var(--border)] mb-4"
            />
          )}
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3" style={{ fontSize: '32px' }}>
            {title}
          </h1>
          {description && (
            <p className="text-sm text-[var(--text-primary)]" style={{ fontSize: '15px', lineHeight: '1.6' }}>
              {description}
            </p>
          )}
        </section>

        {/* Content */}
        {children}

        {/* Related Articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide mb-4" style={{ fontSize: '12px' }}>
              Actualités liées
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

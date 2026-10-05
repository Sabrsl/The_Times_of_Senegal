import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Shield, Search } from 'lucide-react'
import { redirect } from 'next/navigation'

export default function VerifyPage() {
  async function handleSubmit(formData: FormData) {
    'use server'
    const reference = formData.get('reference') as string
    if (reference) {
      const cleanRef = reference.trim().toUpperCase()
      redirect(`/verify/${encodeURIComponent(cleanRef)}`)
    }
  }

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

          {/* Search Form */}
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Référence de traçabilité
              </label>
              <input
                type="text"
                id="reference"
                name="reference"
                placeholder="Collez votre référence ici (ex: TOS-ABC12345-12345678-ABCD)"
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)]"
                required
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--surface)] border border-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] hover:border-[var(--border-strong)] transition-colors"
            >
              <Search size={16} />
              Vérifier
            </button>
          </form>

          {/* Info */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-sm text-[var(--text-secondary)]">
              <strong>Comment trouver la référence ?</strong>
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              La référence de traçabilité se trouve dans le pied de page des PDF téléchargés depuis The Time of Sénégal.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!email.trim()) {
      setMessage({ type: 'error', text: 'L\'email est requis' })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ type: 'error', text: 'Email invalide' })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setSent(true)
        setMessage({
          type: 'success',
          text: 'Un email de réinitialisation a été envoyé à votre adresse email.',
        })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Une erreur est survenue lors de l\'envoi de l\'email.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
            Mot de passe oublié
          </h1>
          <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {message && (
          <div
            className={`p-4 mb-4 border ${
              message.type === 'success'
                ? 'bg-[var(--surface-success)] border-[var(--border-success)] text-[var(--text-success)]'
                : 'bg-[var(--surface-error)] border-[var(--border-error)] text-[var(--text-error)]'
            }`}
          >
            {message.text}
          </div>
        )}

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                style={{ fontSize: '14px' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
              style={{ fontSize: '14px' }}
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-[var(--text-secondary)] mb-4" style={{ fontSize: '14px' }}>
              Vérifiez votre boîte de réception et suivez les instructions.
            </p>
            <button
              onClick={() => {
                setSent(false)
                setEmail('')
                setMessage(null)
              }}
              className="text-sm text-[var(--text-primary)] border-b border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
              style={{ fontSize: '14px' }}
            >
              Renvoyer l'email
            </button>
          </div>
        )}

        <p className="text-sm text-[var(--text-secondary)] text-center mt-6" style={{ fontSize: '14px' }}>
          <Link href="/auth/login" className="text-[var(--text-primary)] border-b border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}

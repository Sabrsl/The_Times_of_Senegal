'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide'
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({
          type: 'success',
          text: 'Compte créé avec succès. Veuillez vérifier votre email pour confirmer votre inscription.',
        })
        setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' })
        
        // Redirect to login after a delay
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Une erreur est survenue lors de l\'inscription.' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      })
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
            Créer un compte
          </h1>
          <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
            Rejoignez THE TIME OF SÉNÉGAL
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                Prénom
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-[var(--surface)] border rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)] ${
                  errors.firstName ? 'border-[var(--border-error)]' : 'border-[var(--border)]'
                }`}
                style={{ fontSize: '14px' }}
              />
              {errors.firstName && (
                <p className="text-xs text-[var(--text-error)] mt-1" style={{ fontSize: '11px' }}>
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                Nom
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-[var(--surface)] border rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)] ${
                  errors.lastName ? 'border-[var(--border-error)]' : 'border-[var(--border)]'
                }`}
                style={{ fontSize: '14px' }}
              />
              {errors.lastName && (
                <p className="text-xs text-[var(--text-error)] mt-1" style={{ fontSize: '11px' }}>
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-[var(--surface)] border rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)] ${
                errors.email ? 'border-[var(--border-error)]' : 'border-[var(--border)]'
              }`}
              style={{ fontSize: '14px' }}
            />
            {errors.email && (
              <p className="text-xs text-[var(--text-error)] mt-1" style={{ fontSize: '11px' }}>
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-[var(--surface)] border rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)] ${
                errors.password ? 'border-[var(--border-error)]' : 'border-[var(--border)]'
              }`}
              style={{ fontSize: '14px' }}
            />
            {errors.password && (
              <p className="text-xs text-[var(--text-error)] mt-1" style={{ fontSize: '11px' }}>
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-[var(--surface)] border rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)] ${
                errors.confirmPassword ? 'border-[var(--border-error)]' : 'border-[var(--border)]'
              }`}
              style={{ fontSize: '14px' }}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-[var(--text-error)] mt-1" style={{ fontSize: '11px' }}>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            style={{ fontSize: '14px' }}
          >
            {loading ? 'Création en cours...' : 'Créer un compte'}
          </button>
        </form>

        <p className="text-sm text-[var(--text-secondary)] text-center mt-6" style={{ fontSize: '14px' }}>
          Déjà un compte ?{' '}
          <Link href="/auth/login" className="text-[var(--text-primary)] border-b border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}

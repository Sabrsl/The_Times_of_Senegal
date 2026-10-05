'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useTheme } from '@/components/ThemeProvider'
import { User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const { theme, toggleTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    avatar_url: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
      } else if (profileData) {
        setProfile({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          email: profileData.email || user.email || '',
          avatar_url: profileData.avatar_url || '',
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setMessage({ type: 'error', text: 'Utilisateur non connecté' })
        setSaving(false)
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
        })
        .eq('id', user.id)

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Une erreur est survenue lors de la mise à jour du profil' })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <main className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
          <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
            Chargement...
          </p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        <section className="mb-8 pb-6 border-b border-[var(--border)]">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
            Mon profil
          </h1>
          <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
            Gérez vos informations personnelles
          </p>
        </section>

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

        <section className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-[var(--text-muted)]" />
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]" style={{ fontSize: '16px' }}>
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                {profile.email}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                  Prénom
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={profile.first_name}
                  onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                  style={{ fontSize: '14px' }}
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                  Nom
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={profile.last_name}
                  onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                  style={{ fontSize: '14px' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={profile.email}
                disabled
                className="w-full px-3 py-2 bg-[var(--surface-muted)] border border-[var(--border)] rounded-sm text-sm text-[var(--text-muted)]"
                style={{ fontSize: '14px' }}
              />
              <p className="text-xs text-[var(--text-muted)] mt-1" style={{ fontSize: '11px' }}>
                L'email ne peut pas être modifié
              </p>
            </div>

            <div>
              <label htmlFor="avatarUrl" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                URL de l'avatar
              </label>
              <input
                type="text"
                id="avatarUrl"
                value={profile.avatar_url}
                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                style={{ fontSize: '14px' }}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                Thème
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-sm text-sm hover:border-[var(--border-strong)] transition-colors"
                  style={{ fontSize: '14px' }}
                >
                  {theme === 'light' ? 'Clair' : 'Sombre'}
                </button>
                <span className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                  Thème actuel : {theme === 'light' ? 'Clair' : 'Sombre'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
              style={{ fontSize: '14px' }}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </section>

        <section className="mt-12 pt-8 border-t border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide mb-4" style={{ fontSize: '12px' }}>
            Actions
          </h2>
          <div className="space-y-2">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-sm text-[var(--text-primary)] border-b border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors py-2"
              style={{ fontSize: '14px' }}
            >
              Administration
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-[var(--text-error)] border-b border-[var(--border)] hover:border-[var(--border-error)] transition-colors py-2"
              style={{ fontSize: '14px' }}
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

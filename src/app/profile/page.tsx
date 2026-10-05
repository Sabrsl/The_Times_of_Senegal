'use client'

import { useState, useEffect, useMemo, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useTheme } from '@/components/ThemeProvider'
import { User, LogOut, Upload } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ProfileState {
  first_name: string
  last_name: string
  email: string
  avatar_url: string
  role: string
}

type FeedbackMessage = { type: 'success' | 'error'; text: string } | null

const inputClass =
  'min-h-11 w-full rounded-sm border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)] focus:outline-none sm:text-sm'

const labelClass =
  'mb-1 block text-xs font-medium text-[var(--text-primary)]'

export default function ProfilePage() {
  const router = useRouter()
  // Un seul client Supabase par instance de page (et non un par rendu)
  const supabase = useMemo(() => createClient(), [])
  const { theme, toggleTheme } = useTheme()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<FeedbackMessage>(null)
  const [profile, setProfile] = useState<ProfileState>({
    first_name: '',
    last_name: '',
    email: '',
    avatar_url: '',
    role: 'user',
  })

  useEffect(() => {
    let cancelled = false

    const loadProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (cancelled) return

        if (error) {
          console.error('Error loading profile:', error)
        } else if (profileData) {
          setProfile({
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            email: profileData.email || user.email || '',
            avatar_url: profileData.avatar_url || '',
            role: profileData.role || 'user',
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadProfile()
    return () => {
      cancelled = true
    }
  }, [supabase, router])

  // Réessaie d'afficher l'avatar quand l'URL change
  useEffect(() => {
    setAvatarFailed(false)
  }, [profile.avatar_url])

  const handleSave = async (event?: FormEvent) => {
    event?.preventDefault()
    if (saving) return

    setSaving(true)
    setMessage(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setMessage({ type: 'error', text: 'Utilisateur non connecté' })
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name.trim(),
          last_name: profile.last_name.trim(),
          avatar_url: profile.avatar_url.trim(),
        })
        .eq('id', user.id)

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès' })
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Une erreur est survenue lors de la mise à jour du profil',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      router.push('/')
      router.refresh()
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMessage(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setMessage({ type: 'error', text: 'Utilisateur non connecté' })
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        setMessage({ type: 'error', text: uploadError.message })
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Save to database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) {
        setMessage({ type: 'error', text: updateError.message })
        return
      }

      setProfile({ ...profile, avatar_url: publicUrl })
      setAvatarFailed(false)
      setMessage({ type: 'success', text: 'Photo mise à jour avec succès' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'upload de la photo' })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8 lg:px-6">
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-[var(--text-secondary)]"
          >
            Chargement...
          </p>
        </main>
        <Footer />
      </div>
    )
  }

  const fullName = `${profile.first_name} ${profile.last_name}`.trim()
  const showAvatar = Boolean(profile.avatar_url) && !avatarFailed

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8 lg:px-6">
        <section className="mb-6 border-b border-[var(--border)] pb-5 sm:mb-8 sm:pb-6">
          <h1 className="mb-2 text-[26px] font-bold leading-tight text-[var(--text-primary)] sm:text-[32px]">
            Mon profil
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Gérez vos informations personnelles
          </p>
        </section>

        {message && (
          <div
            role={message.type === 'error' ? 'alert' : 'status'}
            className={`mb-4 border p-3 text-sm sm:p-4 ${
              message.type === 'success'
                ? 'border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_10%,transparent)] text-[var(--success)]'
                : 'border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,transparent)] text-[var(--error)]'
            }`}
          >
            {message.text}
          </div>
        )}

        <section className="mb-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-[var(--border)] bg-[var(--surface-muted)] sm:h-20 sm:w-20">
              {showAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <User size={32} className="text-[var(--text-muted)]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-semibold text-[var(--text-primary)]">
                {fullName}
              </h2>
              <p className="truncate text-sm text-[var(--text-secondary)]">
                {profile.email}
              </p>
              <p className="mt-1 text-xs font-medium text-[var(--accent)]">
                Rôle : {profile.role}
              </p>
            </div>
            <div>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="hidden"
              />
              <label
                htmlFor="avatar-upload"
                className="flex cursor-pointer items-center gap-2 rounded-sm border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] disabled:opacity-50"
              >
                <Upload size={16} />
                {uploading ? 'Upload...' : 'Changer photo'}
              </label>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className={labelClass}>
                  Prénom
                </label>
                <input
                  type="text"
                  id="firstName"
                  autoComplete="given-name"
                  value={profile.first_name}
                  onChange={(e) =>
                    setProfile({ ...profile, first_name: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="lastName" className={labelClass}>
                  Nom
                </label>
                <input
                  type="text"
                  id="lastName"
                  autoComplete="family-name"
                  value={profile.last_name}
                  onChange={(e) =>
                    setProfile({ ...profile, last_name: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={profile.email}
                disabled
                aria-describedby="email-help"
                className="min-h-11 w-full rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-base text-[var(--text-muted)] sm:text-sm"
              />
              <p
                id="email-help"
                className="mt-1 text-[11px] text-[var(--text-muted)]"
              >
                L&apos;email ne peut pas être modifié
              </p>
            </div>

            <div>
              <label htmlFor="avatarUrl" className={labelClass}>
                URL de l&apos;avatar
              </label>
              <input
                type="url"
                inputMode="url"
                id="avatarUrl"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={profile.avatar_url}
                onChange={(e) =>
                  setProfile({ ...profile, avatar_url: e.target.value })
                }
                className={inputClass}
                placeholder="https://..."
              />
            </div>

            <div>
              <span className={labelClass}>Thème</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Changer de thème"
                  className="min-h-11 rounded-sm border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)]"
                >
                  {theme === 'light' ? 'Clair' : 'Sombre'}
                </button>
                <span className="text-sm text-[var(--text-secondary)]">
                  Thème actuel : {theme === 'light' ? 'Clair' : 'Sombre'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="min-h-11 w-full rounded-sm bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--text-inverse)] transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50 sm:w-auto"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </section>

        <section className="mt-10 border-t border-[var(--border)] pt-6 sm:mt-12 sm:pt-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--text-primary)]">
            Actions
          </h2>
          <div className="space-y-2">
            <Link
              href="/admin"
              className="flex min-h-11 items-center gap-2 border-b border-[var(--border)] py-2 text-sm text-[var(--text-primary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Administration
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-h-11 w-full items-center gap-2 border-b border-[var(--border)] py-2 text-left text-sm text-[var(--error)] transition-colors hover:border-[var(--error)]"
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
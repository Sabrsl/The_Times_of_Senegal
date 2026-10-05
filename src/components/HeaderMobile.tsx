'use client'

import { useState, useEffect, useMemo, type FormEvent } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from './ThemeProvider'
import { createClient } from '@/lib/supabase/client'
import { Search, Menu, X, Sun, Moon, User, LogOut, Home } from 'lucide-react'

/* -------------------------------------------------------------------------- */
/*  Configuration                                                             */
/* -------------------------------------------------------------------------- */

/** Page de résultats de recherche : ajustez si votre route est différente. */
const SEARCH_PATH = '/recherche'

const navigation = [
  { name: 'Actualités', href: '/' },
  { name: 'Politique', href: '/politique' },
  { name: 'Économie', href: '/economie' },
  { name: 'Société', href: '/societe' },
  { name: 'Culture', href: '/culture' },
  { name: 'Sport', href: '/sport' },
  { name: 'Monde', href: '/monde' },
  { name: 'Comprendre', href: '/comprendre' },
  { name: 'Vérifié', href: '/verifie' },
]

const entityNavigation = [
  { name: 'Thèmes', href: '/tags' },
  { name: 'Dossiers', href: '/dossiers' },
  { name: 'Personnes', href: '/personnes' },
  { name: 'Organisations', href: '/organisations' },
  { name: 'Lieux', href: '/lieux' },
  { name: 'Événements', href: '/events' },
]

/* -------------------------------------------------------------------------- */
/*  Styles partagés                                                           */
/* -------------------------------------------------------------------------- */

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)]'

/** Bouton icône : zone tactile de 44 × 44 px. */
const iconButton = `inline-flex h-11 w-11 items-center justify-center text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] ${focusRing}`

const itemBase = `flex min-h-11 w-full items-center gap-3 px-4 text-left text-[15px] font-medium transition-colors hover:bg-[var(--surface-muted)] active:bg-[var(--surface-muted)] ${focusRing}`

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}

/* -------------------------------------------------------------------------- */
/*  Sous-composant : lien du menu                                             */
/* -------------------------------------------------------------------------- */

function MenuLink({
  href,
  active,
  onNavigate,
  children,
}: {
  href: string
  active?: boolean
  onNavigate: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`${itemBase} ${
        active
          ? 'bg-[var(--surface-muted)] text-[var(--text-primary)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
      }`}
    >
      {children}
    </Link>
  )
}

/* -------------------------------------------------------------------------- */
/*  Composant principal                                                       */
/* -------------------------------------------------------------------------- */

export function HeaderMobile() {
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  // Client créé une seule fois : avant, il était recréé à chaque rendu,
  // ce qui relançait l'effet d'authentification en boucle.
  const supabase = useMemo(() => createClient(), [])

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [authReady, setAuthReady] = useState(false)

  const closeMenu = () => setMobileMenuOpen(false)

  /* Authentification ------------------------------------------------------- */
  useEffect(() => {
    let active = true

    const loadUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (active) setUser(user ? { email: user.email ?? '' } : null)
      } finally {
        if (active) setAuthReady(true)
      }
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email ?? '' } : null)
      setAuthReady(true)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase])

  /* Fermeture automatique à chaque changement de page --------------------- */
  useEffect(() => {
    setMobileMenuOpen(false)
    setSearchOpen(false)
  }, [pathname])

  /* Échap ferme les panneaux ---------------------------------------------- */
  useEffect(() => {
    if (!mobileMenuOpen && !searchOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
        setSearchOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileMenuOpen, searchOpen])

  /* Bloque le défilement de la page quand le menu est ouvert -------------- */
  useEffect(() => {
    if (!mobileMenuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileMenuOpen])

  /* Actions ---------------------------------------------------------------- */
  const handleLogout = async () => {
    closeMenu()
    try {
      await supabase.auth.signOut()
    } finally {
      setUser(null)
    }
  }

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    setSearchOpen(false)
    router.push(`${SEARCH_PATH}?q=${encodeURIComponent(trimmed)}`)
  }

  const toggleSearch = () => {
    setSearchOpen((open) => !open)
    setMobileMenuOpen(false)
  }

  const toggleMenu = () => {
    setMobileMenuOpen((open) => !open)
    setSearchOpen(false)
  }

  /* Rendu ------------------------------------------------------------------ */
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--background)_85%,transparent)]">
      <div className="px-4">
        {/* Barre principale */}
        <div className="flex h-14 items-center justify-between">
          <Link
            href="/"
            aria-label="The Times of Senegal – Accueil"
            className={`shrink-0 text-[13px] font-bold tracking-[0.05em] text-[var(--text-primary)] ${focusRing}`}
          >
            The Times of Senegal
          </Link>

          <div className="-mr-2 flex items-center">
            <button
              type="button"
              onClick={toggleSearch}
              className={iconButton}
              aria-label="Recherche"
              aria-expanded={searchOpen}
              aria-controls="header-search"
            >
              <Search size={18} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className={iconButton}
              aria-label="Changer de thème"
            >
              {theme === 'light' ? (
                <Moon size={18} aria-hidden="true" />
              ) : (
                <Sun size={18} aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={toggleMenu}
              className={iconButton}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? (
                <X size={22} aria-hidden="true" />
              ) : (
                <Menu size={22} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Recherche */}
        {searchOpen && (
          <form
            id="header-search"
            role="search"
            onSubmit={handleSearch}
            className="border-t border-[var(--border)] py-3"
          >
            <label htmlFor="header-search-input" className="sr-only">
              Rechercher un article
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                size={18}
                aria-hidden="true"
              />
              <input
                id="header-search-input"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher..."
                autoFocus
                autoComplete="off"
                enterKeyHint="search"
                // 16 px minimum sur mobile : évite le zoom automatique d'iOS au focus
                className="w-full rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] py-2.5 pl-10 pr-4 text-base focus:border-[var(--border-strong)] focus:outline-none sm:text-sm"
              />
            </div>
          </form>
        )}
      </div>

      {/* Navigation mobile : défile en interne si elle dépasse l'écran */}
      {mobileMenuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Navigation principale"
          className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain border-t border-[var(--border)] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2"
        >
          <ul>
            <li>
              <MenuLink href="/" active={pathname === '/'} onNavigate={closeMenu}>
                <Home size={18} aria-hidden="true" />
                Accueil
              </MenuLink>
            </li>

            {navigation.map((item) => (
              <li key={item.href}>
                <MenuLink
                  href={item.href}
                  active={isActive(pathname, item.href)}
                  onNavigate={closeMenu}
                >
                  {item.name}
                </MenuLink>
              </li>
            ))}
          </ul>

          {/* Entités */}
          <div className="mt-2 border-t border-[var(--border)] pt-2">
            <p className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Entités
            </p>
            <ul>
              {entityNavigation.map((item) => (
                <li key={item.href}>
                  <MenuLink
                    href={item.href}
                    active={isActive(pathname, item.href)}
                    onNavigate={closeMenu}
                  >
                    {item.name}
                  </MenuLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Compte (affiché une fois l'état de connexion connu : pas de flash « Connexion ») */}
          {authReady && (
            <div className="mt-2 border-t border-[var(--border)] pt-2">
              {user ? (
                <ul>
                  <li>
                    <MenuLink
                      href="/profile"
                      active={isActive(pathname, '/profile')}
                      onNavigate={closeMenu}
                    >
                      <User size={18} aria-hidden="true" />
                      Mon compte
                    </MenuLink>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className={`${itemBase} text-[var(--text-secondary)] hover:text-[var(--text-primary)]`}
                    >
                      <LogOut size={18} aria-hidden="true" />
                      Déconnexion
                    </button>
                  </li>
                </ul>
              ) : (
                <MenuLink
                  href="/auth/login"
                  active={isActive(pathname, '/auth/login')}
                  onNavigate={closeMenu}
                >
                  <User size={18} aria-hidden="true" />
                  Connexion
                </MenuLink>
              )}
            </div>
          )}
        </nav>
      )}
    </header>
  )
}
'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useTheme } from './ThemeProvider'
import { HeaderMobile } from './HeaderMobile'
import { createClient } from '@/lib/supabase/client'
import { Search, Menu, X, Sun, Moon, User, LogOut } from 'lucide-react'

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

export function Header() {
  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden">
        <HeaderMobile />
      </div>

      {/* Desktop Header */}
      <HeaderDesktop />
    </>
  )
}

function HeaderDesktop() {
  const { theme, toggleTheme } = useTheme()
  const supabase = useMemo(() => createClient(), [])
  const [searchOpen, setSearchOpen] = useState(false)
  const [entitiesOpen, setEntitiesOpen] = useState(false)
  const [user, setUser] = useState<{ email: string } | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user ? { email: user.email || '' } : null)
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email || '' } : null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <header className="hidden lg:block border-b border-[var(--border)] bg-[var(--background)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="text-lg font-bold tracking-tight" style={{ fontSize: '14px', letterSpacing: '0.05em' }}>
              The Times of Senegal
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                style={{ fontSize: '12px' }}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Entities Dropdown */}
            <div className="relative">
              <button
                onClick={() => setEntitiesOpen(!entitiesOpen)}
                className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
                style={{ fontSize: '12px' }}
              >
                Entités
              </button>
              
              {entitiesOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[var(--surface)] border border-[var(--border)] rounded-sm shadow-lg z-50">
                  {entityNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-4 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)] transition-colors"
                      style={{ fontSize: '12px' }}
                      onClick={() => setEntitiesOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Recherche"
            >
              <Search size={16} />
            </button>

            {/* Auth links */}
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="hidden sm:flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  style={{ fontSize: '12px' }}
                >
                  <User size={16} />
                  Mon compte
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label="Déconnexion"
                  title="Déconnexion"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="hidden sm:flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                style={{ fontSize: '12px' }}
              >
                <User size={16} />
                Connexion
              </Link>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Changer de thème"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="py-3 border-t border-[var(--border)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" size={16} />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 bg-[var(--surface-muted)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

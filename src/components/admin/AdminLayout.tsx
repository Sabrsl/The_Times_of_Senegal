'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Folder,
  Users,
  Building2,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Image,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Newspaper,
  Shield,
  Activity,
  Globe,
  Layers,
  FileCode,
} from 'lucide-react'

const navigation = [
  {
    section: 'Général',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    section: 'CONTENU',
    items: [
      { name: 'Articles', href: '/admin/articles', icon: FileText },
      { name: 'Brouillons', href: '/admin/articles?status=draft', icon: FileCode },
      { name: 'Catégories', href: '/admin/categories', icon: Layers },
      { name: 'Dossiers', href: '/admin/dossiers', icon: Folder },
      { name: 'Personnes', href: '/admin/people', icon: Users },
      { name: 'Organisations', href: '/admin/organizations', icon: Building2 },
      { name: 'Lieux', href: '/admin/places', icon: MapPin },
      { name: 'Événements', href: '/admin/events', icon: Calendar },
      { name: 'Sources', href: '/admin/sources', icon: LinkIcon },
    ],
  },
  {
    section: 'SITE',
    items: [
      { name: 'Homepage', href: '/admin/homepage', icon: Home },
      { name: 'Navigation', href: '/admin/navigation', icon: Globe },
      { name: 'Médias', href: '/admin/media', icon: Image },
    ],
  },
  {
    section: 'UTILISATEURS',
    items: [
      { name: 'Utilisateurs', href: '/admin/users', icon: Users },
    ],
  },
  {
    section: 'SYSTÈME',
    items: [
      { name: 'Paramètres', href: '/admin/settings', icon: Settings },
      { name: 'Journal d\'activité', href: '/admin/audit', icon: Activity },
    ],
  },
]

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<{ email: string; first_name: string; last_name: string } | null>(null)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--surface)] border-r border-[var(--border)] transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div>
              <div className="text-xs font-bold tracking-tight text-[var(--text-primary)]" style={{ fontSize: '12px', letterSpacing: '0.05em' }}>
                THE TIME OF SÉNÉGAL
              </div>
              <div className="text-xs text-[var(--text-muted)]" style={{ fontSize: '11px' }}>
                Administration
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            {navigation.map((section) => (
              <div key={section.section} className="mb-6">
                <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2" style={{ fontSize: '11px' }}>
                  {section.section}
                </div>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '?')
                    const Icon = item.icon
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-sm transition-colors ${
                            isActive
                              ? 'bg-[var(--surface-muted)] text-[var(--text-primary)] border border-[var(--border)]'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]'
                          }`}
                          style={{ fontSize: '14px' }}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Icon size={16} />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--border)]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--text-error)] hover:bg-[var(--surface-muted)] rounded-sm transition-colors"
              style={{ fontSize: '14px' }}
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-[var(--surface)] border-b border-[var(--border)] px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                target="_blank"
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-b border-[var(--border)] hover:border-[var(--accent)] transition-colors"
                style={{ fontSize: '14px' }}
              >
                Voir le site
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import {
  FileText,
  FileCode,
  Folder,
  Users,
  Building2,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react'
import Link from 'next/link'

interface Stats {
  articles: number
  published: number
  drafts: number
  scheduled: number
  dossiers: number
  people: number
  organizations: number
  places: number
  events: number
  sources: number
}

// Simple in-memory cache for dashboard stats (2 minutes TTL)
let dashboardStatsCache: Stats | null = null
let dashboardStatsCacheTime: number = 0
const DASHBOARD_CACHE_TTL = 2 * 60 * 1000 // 2 minutes

interface RecentActivity {
  id: string
  action: string
  entity_type: string
  entity_id: string
  created_at: string
  user_email?: string
}

export default function AdminDashboard() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    articles: 0,
    published: 0,
    drafts: 0,
    scheduled: 0,
    dossiers: 0,
    people: 0,
    organizations: 0,
    places: 0,
    events: 0,
    sources: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Check cache first
      const now = Date.now()
      if (dashboardStatsCache && (now - dashboardStatsCacheTime) < DASHBOARD_CACHE_TTL) {
        setStats(dashboardStatsCache)
        // Load recent activity in background
        const { data: activityData } = await supabase
          .from('audit_logs')
          .select('*, profiles(email)')
          .order('created_at', { ascending: false })
          .limit(10)

        if (activityData) {
          setRecentActivity(
            activityData.map((log: any) => ({
              id: log.id,
              action: log.action,
              entity_type: log.entity_type,
              entity_id: log.entity_id,
              created_at: log.created_at,
              user_email: log.profiles?.email,
            }))
          )
        }
        return
      }

      // Load stats
      const [
        { count: articlesCount },
        { count: publishedCount },
        { count: draftsCount },
        { count: scheduledCount },
        { count: dossiersCount },
        { count: peopleCount },
        { count: organizationsCount },
        { count: placesCount },
        { count: eventsCount },
        { count: sourcesCount },
      ] = await Promise.all([
        supabase.from('articles').select('*', { count: 'exact', head: true }),
        supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
        supabase.from('dossiers').select('*', { count: 'exact', head: true }),
        supabase.from('people').select('*', { count: 'exact', head: true }),
        supabase.from('organizations').select('*', { count: 'exact', head: true }),
        supabase.from('places').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('sources').select('*', { count: 'exact', head: true }),
      ])

      const newStats = {
        articles: articlesCount || 0,
        published: publishedCount || 0,
        drafts: draftsCount || 0,
        scheduled: scheduledCount || 0,
        dossiers: dossiersCount || 0,
        people: peopleCount || 0,
        organizations: organizationsCount || 0,
        places: placesCount || 0,
        events: eventsCount || 0,
        sources: sourcesCount || 0,
      }

      // Update cache
      dashboardStatsCache = newStats
      dashboardStatsCacheTime = now

      setStats(newStats)

      // Load recent activity
      const { data: activityData } = await supabase
        .from('audit_logs')
        .select('*, profiles(email)')
        .order('created_at', { ascending: false })
        .limit(10)

      if (activityData) {
        setRecentActivity(
          activityData.map((log: any) => ({
            id: log.id,
            action: log.action,
            entity_type: log.entity_type,
            entity_id: log.entity_id,
            created_at: log.created_at,
            user_email: log.profiles?.email,
          }))
        )
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const quickActions = [
    { name: 'Nouvel article', href: '/admin/articles/new', icon: FileText },
    { name: 'Nouveau dossier', href: '/admin/dossiers/new', icon: Folder },
    { name: 'Nouvelle personne', href: '/admin/people/new', icon: Users },
    { name: 'Nouvelle organisation', href: '/admin/organizations/new', icon: Building2 },
    { name: 'Nouveau lieu', href: '/admin/places/new', icon: MapPin },
    { name: 'Nouvel événement', href: '/admin/events/new', icon: Calendar },
    { name: 'Nouvelle source', href: '/admin/sources/new', icon: LinkIcon },
  ]

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
            Chargement...
          </p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
            Dashboard
          </h1>
          <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
            Vue d'ensemble de votre site
          </p>
        </div>

        {/* Quick Actions */}
        <section>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide mb-4" style={{ fontSize: '12px' }}>
            Actions rapides
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.name}
                  href={action.href}
                  className="flex flex-col items-center gap-2 p-4 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors rounded-sm"
                >
                  <Icon size={20} className="text-[var(--accent)]" />
                  <span className="text-xs text-[var(--text-primary)] text-center" style={{ fontSize: '12px' }}>
                    {action.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Stats */}
        <section>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide mb-4" style={{ fontSize: '12px' }}>
            Statistiques
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 bg-[var(--surface)] border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)]" style={{ fontSize: '12px' }}>
                  Articles
                </span>
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontSize: '24px' }}>
                {stats.articles}
              </div>
            </div>

            <div className="p-4 bg-[var(--surface)] border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-[var(--text-success)]" />
                <span className="text-xs text-[var(--text-muted)]" style={{ fontSize: '12px' }}>
                  Publiés
                </span>
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontSize: '24px' }}>
                {stats.published}
              </div>
            </div>

            <div className="p-4 bg-[var(--surface)] border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-2">
                <FileCode size={16} className="text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)]" style={{ fontSize: '12px' }}>
                  Brouillons
                </span>
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontSize: '24px' }}>
                {stats.drafts}
              </div>
            </div>

            <div className="p-4 bg-[var(--surface)] border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)]" style={{ fontSize: '12px' }}>
                  Programmés
                </span>
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontSize: '24px' }}>
                {stats.scheduled}
              </div>
            </div>

            <div className="p-4 bg-[var(--surface)] border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-2">
                <Folder size={16} className="text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)]" style={{ fontSize: '12px' }}>
                  Dossiers
                </span>
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontSize: '24px' }}>
                {stats.dossiers}
              </div>
            </div>

            <div className="p-4 bg-[var(--surface)] border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)]" style={{ fontSize: '12px' }}>
                  Personnes
                </span>
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontSize: '24px' }}>
                {stats.people}
              </div>
            </div>

            <div className="p-4 bg-[var(--surface)] border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={16} className="text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)]" style={{ fontSize: '12px' }}>
                  Organisations
                </span>
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontSize: '24px' }}>
                {stats.organizations}
              </div>
            </div>

            <div className="p-4 bg-[var(--surface)] border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)]" style={{ fontSize: '12px' }}>
                  Lieux
                </span>
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontSize: '24px' }}>
                {stats.places}
              </div>
            </div>

            <div className="p-4 bg-[var(--surface)] border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)]" style={{ fontSize: '12px' }}>
                  Événements
                </span>
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontSize: '24px' }}>
                {stats.events}
              </div>
            </div>

            <div className="p-4 bg-[var(--surface)] border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon size={16} className="text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)]" style={{ fontSize: '12px' }}>
                  Sources
                </span>
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontSize: '24px' }}>
                {stats.sources}
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide mb-4" style={{ fontSize: '12px' }}>
            Activité récente
          </h2>
          <div className="bg-[var(--surface)] border border-[var(--border)]">
            {recentActivity.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                      Action
                    </th>
                    <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                      Entité
                    </th>
                    <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                      Utilisateur
                    </th>
                    <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((activity) => (
                    <tr key={activity.id} className="border-b border-[var(--border)] last:border-b-0">
                      <td className="p-3 text-sm text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                        {activity.action}
                      </td>
                      <td className="p-3 text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                        {activity.entity_type}
                      </td>
                      <td className="p-3 text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                        {activity.user_email || '-'}
                      </td>
                      <td className="p-3 text-sm text-[var(--text-muted)]" style={{ fontSize: '14px' }}>
                        {formatDate(activity.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-[var(--text-muted)]" style={{ fontSize: '14px' }}>
                  Aucune activité récente
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}

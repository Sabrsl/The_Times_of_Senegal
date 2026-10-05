'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Search, Filter } from 'lucide-react'

interface AuditLog {
  id: string
  user_id: string
  action: string
  table_name: string | null
  record_id: string | null
  old_values: any
  new_values: any
  created_at: string
  profile?: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function AdminAudit() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')

  useEffect(() => {
    loadLogs()
  }, [actionFilter])

  const loadLogs = async () => {
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          profile:profiles(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading audit logs:', error)
      } else if (data) {
        setLogs(data as AuditLog[])
      }
    } catch (error) {
      console.error('Error loading audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (action: string) => {
    const styles = {
      insert: 'bg-[var(--surface-success)] text-[var(--text-success)] border border-[var(--border-success)]',
      update: 'bg-[var(--surface-warning)] text-[var(--text-warning)] border border-[var(--border-warning)]',
      delete: 'bg-[var(--surface-error)] text-[var(--text-error)] border border-[var(--border-error)]',
    }

    const labels = {
      insert: 'Création',
      update: 'Modification',
      delete: 'Suppression',
    }

    return (
      <span className={`px-2 py-1 text-xs rounded-sm ${styles[action as keyof typeof styles] || styles.update}`} style={{ fontSize: '11px' }}>
        {labels[action as keyof typeof labels] || action}
      </span>
    )
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.table_name && log.table_name.toLowerCase().includes(search.toLowerCase())) ||
      (log.profile && log.profile.email.toLowerCase().includes(search.toLowerCase()))
  )

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
              Journal d'audit
            </h1>
            <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
              Historique des actions sur le site
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
              style={{ fontSize: '14px' }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[var(--text-muted)]" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
              style={{ fontSize: '14px' }}
            >
              <option value="all">Toutes les actions</option>
              <option value="insert">Créations</option>
              <option value="update">Modifications</option>
              <option value="delete">Suppressions</option>
            </select>
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)]">
          {filteredLogs.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Action
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Table
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Utilisateur
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Date
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Détails
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-muted)]">
                   <td className="p-4">{getActionBadge(log.action)}</td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                      {log.table_name || '-'}
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                      {log.profile ? (
                        <div>
                          <div className="font-medium text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                            {log.profile.first_name} {log.profile.last_name}
                          </div>
                          <div className="text-xs text-[var(--text-muted)]" style={{ fontSize: '11px' }}>
                            {log.profile.email}
                          </div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-4 text-sm text-[var(--text-muted)]" style={{ fontSize: '14px' }}>
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="p-4">
                      <details className="text-xs">
                        <summary className="cursor-pointer text-[var(--accent)] hover:underline" style={{ fontSize: '11px' }}>
                          Voir les changements
                        </summary>
                        <div className="mt-2 p-2 bg-[var(--background)] border border-[var(--border)] rounded-sm">
                          {log.old_values && Object.keys(log.old_values).length > 0 && (
                            <div className="mb-2">
                              <div className="font-medium text-[var(--text-error)] mb-1" style={{ fontSize: '11px' }}>
                                Avant:
                              </div>
                              <pre className="text-[var(--text-muted)] overflow-x-auto" style={{ fontSize: '10px' }}>
                                {JSON.stringify(log.old_values, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.new_values && Object.keys(log.new_values).length > 0 && (
                            <div>
                              <div className="font-medium text-[var(--text-success)] mb-1" style={{ fontSize: '11px' }}>
                                Après:
                              </div>
                              <pre className="text-[var(--text-muted)] overflow-x-auto" style={{ fontSize: '10px' }}>
                                {JSON.stringify(log.new_values, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <p className="text-sm text-[var(--text-muted)] mb-4" style={{ fontSize: '14px' }}>
                {search || actionFilter !== 'all' ? 'Aucun log trouvé' : 'Aucun log d\'audit pour le moment'}
              </p>
              {!search && actionFilter === 'all' && (
                <p className="text-xs text-[var(--text-muted)]" style={{ fontSize: '11px' }}>
                  Les actions sur le site seront enregistrées ici
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Search, Shield, User as UserIcon, Plus, Trash2, X } from 'lucide-react'
import { createUser, deleteUser, updateUserRole } from '@/app/actions/users'

interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  avatar_url: string | null
  created_at: string
}

export default function AdminUsers() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [currentUserRole, setCurrentUserRole] = useState<string>('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [addingUser, setAddingUser] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'user',
    password: '',
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      // Get current user role
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        if (profile) {
          setCurrentUserRole(profile.role)
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading users:', error)
      } else if (data) {
        setUsers(data as Profile[])
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    // Only super_admin can change roles
    if (currentUserRole !== 'super_admin') {
      alert('Seul un super_admin peut modifier les rôles')
      return
    }

    if (!confirm(`Êtes-vous sûr de vouloir changer le rôle de cet utilisateur en ${newRole} ?`)) {
      return
    }

    try {
      const result = await updateUserRole(userId, newRole)

      if (!result.success) {
        alert('Erreur lors de la modification du rôle: ' + result.error)
      } else {
        loadUsers()
      }
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.first_name || !newUser.last_name) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    setAddingUser(true)

    try {
      const result = await createUser(newUser)

      if (!result.success) {
        alert('Erreur lors de la création de l\'utilisateur: ' + result.error)
      } else {
        alert('Utilisateur créé avec succès')
        setShowAddModal(false)
        setNewUser({
          email: '',
          first_name: '',
          last_name: '',
          role: 'user',
          password: '',
        })
        loadUsers()
      }
    } catch (error) {
      console.error('Error adding user:', error)
      alert('Erreur lors de l\'ajout de l\'utilisateur')
    } finally {
      setAddingUser(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (currentUserRole !== 'super_admin') {
      alert('Seul un super_admin peut supprimer des utilisateurs')
      return
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      return
    }

    try {
      const result = await deleteUser(userId)

      if (!result.success) {
        alert('Erreur lors de la suppression: ' + result.error)
      } else {
        alert('Utilisateur supprimé avec succès')
        loadUsers()
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      user: 'bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]',
      editor: 'bg-[var(--surface-info)] text-[var(--text-info)] border border-[var(--border-info)]',
      admin: 'bg-[var(--surface-warning)] text-[var(--text-warning)] border border-[var(--border-warning)]',
      super_admin: 'bg-[var(--surface-error)] text-[var(--text-error)] border border-[var(--border-error)]',
    }

    const labels = {
      user: 'Utilisateur',
      editor: 'Éditeur',
      admin: 'Admin',
      super_admin: 'Super Admin',
    }

    return (
      <span className={`px-2 py-1 text-xs rounded-sm ${styles[role as keyof typeof styles] || styles.user}`} style={{ fontSize: '11px' }}>
        {labels[role as keyof typeof labels] || role}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date)
  }

  const filteredUsers = users.filter(
    (user) =>
      user.first_name.toLowerCase().includes(search.toLowerCase()) ||
      user.last_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
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
              Utilisateurs
            </h1>
            <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
              Gérer les utilisateurs et leurs rôles
            </p>
          </div>
          {currentUserRole === 'super_admin' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors"
              style={{ fontSize: '14px' }}
            >
              <Plus size={16} />
              Ajouter un utilisateur
            </button>
          )}
        </div>

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

        <div className="bg-[var(--surface)] border border-[var(--border)]">
          {filteredUsers.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Utilisateur
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Email
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Rôle
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Inscrit le
                  </th>
                  <th className="text-right p-4 text-xs font-semibold text-[var(--text-muted)] uppercase" style={{ fontSize: '11px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-muted)]">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={`${user.first_name} ${user.last_name}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[var(--surface-muted)] flex items-center justify-center">
                            <UserIcon size={20} className="text-[var(--text-muted)]" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                      {user.email}
                    </td>
                    <td className="p-4">{getRoleBadge(user.role)}</td>
                    <td className="p-4 text-sm text-[var(--text-muted)]" style={{ fontSize: '14px' }}>
                      {formatDate(user.created_at)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {currentUserRole === 'super_admin' && user.role !== 'super_admin' && (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="px-2 py-1 bg-[var(--background)] border border-[var(--border)] rounded-sm text-xs focus:outline-none focus:border-[var(--border-strong)]"
                            style={{ fontSize: '11px' }}
                          >
                            <option value="user">Utilisateur</option>
                            <option value="editor">Éditeur</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        )}
                        {currentUserRole === 'super_admin' && user.role !== 'super_admin' && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1 text-[var(--text-error)] hover:text-[var(--text-primary)] transition-colors"
                            title="Supprimer l'utilisateur"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        {currentUserRole !== 'super_admin' && (
                          <span className="text-xs text-[var(--text-muted)]" style={{ fontSize: '11px' }}>
                            Modification non autorisée
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <p className="text-sm text-[var(--text-muted)] mb-4" style={{ fontSize: '14px' }}>
                {search ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur pour le moment'}
              </p>
              {!search && (
                <p className="text-xs text-[var(--text-muted)]" style={{ fontSize: '11px' }}>
                  Les utilisateurs s\'inscrivent via le formulaire d\'inscription
                </p>
              )}
            </div>
          )}
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
                  Ajouter un utilisateur
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                    style={{ fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                    style={{ fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                    style={{ fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                    style={{ fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                    Rôle *
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                    style={{ fontSize: '14px' }}
                  >
                    <option value="user">Utilisateur</option>
                    <option value="editor">Éditeur</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] text-sm font-medium rounded-sm hover:bg-[var(--surface-muted)] transition-colors"
                  style={{ fontSize: '14px' }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddUser}
                  disabled={addingUser}
                  className="flex-1 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
                  style={{ fontSize: '14px' }}
                >
                  {addingUser ? 'Création...' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

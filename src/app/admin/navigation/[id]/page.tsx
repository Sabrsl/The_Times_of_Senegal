'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Save, ArrowLeft } from 'lucide-react'

export default function AdminNavigationEdit() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const isNew = params.id === 'new'
  const itemId = isNew ? null : params.id

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    label: '',
    url: '',
    position: 0,
    parent_id: '',
    is_visible: true,
    open_new_tab: false,
  })

  useEffect(() => {
    loadItem()
  }, [itemId])

  const loadItem = async () => {
    if (!itemId) return

    try {
      const { data, error } = await supabase
        .from('navigation_items')
        .select('*')
        .eq('id', itemId)
        .single()

      if (error) {
        console.error('Error loading navigation item:', error)
      } else if (data) {
        setFormData({
          label: data.label || '',
          url: data.url || '',
          position: data.position || 0,
          parent_id: data.parent_id || '',
          is_visible: data.is_visible ?? true,
          open_new_tab: data.open_new_tab ?? false,
        })
      }
    } catch (error) {
      console.error('Error loading navigation item:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const itemData = {
        label: formData.label,
        url: formData.url,
        position: formData.position,
        parent_id: formData.parent_id || null,
        is_visible: formData.is_visible,
        open_new_tab: formData.open_new_tab,
      }

      let error

      if (isNew) {
        const result = await supabase.from('navigation_items').insert(itemData).select()
        error = result.error
      } else {
        const result = await supabase.from('navigation_items').update(itemData).eq('id', itemId)
        error = result.error
      }

      if (error) {
        console.error('Error saving navigation item:', error)
        alert('Erreur lors de la sauvegarde')
      } else {
        alert('Élément sauvegardé avec succès')
        router.push('/admin/navigation')
      }
    } catch (error) {
      console.error('Error saving navigation item:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

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
          <div className="flex items-center gap-4">
            <Link
              href="/admin/navigation"
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
                {isNew ? 'Nouvel élément' : 'Modifier l\'élément'}
              </h1>
              <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                {isNew ? 'Créer un nouvel élément de navigation' : 'Modifier les détails'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            style={{ fontSize: '14px' }}
          >
            <Save size={16} />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>

        <div className="max-w-2xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-6">
          <div>
            <label htmlFor="label" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
              Label *
            </label>
            <input
              type="text"
              id="label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
              style={{ fontSize: '14px' }}
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
              URL *
            </label>
            <input
              type="text"
              id="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
              style={{ fontSize: '14px' }}
              placeholder="/page"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="position" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                Position
              </label>
              <input
                type="number"
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                style={{ fontSize: '14px' }}
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="is_visible"
                checked={formData.is_visible}
                onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                className="rounded-sm border-[var(--border)]"
              />
              <label htmlFor="is_visible" className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                Visible
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="open_new_tab"
              checked={formData.open_new_tab}
              onChange={(e) => setFormData({ ...formData, open_new_tab: e.target.checked })}
              className="rounded-sm border-[var(--border)]"
            />
            <label htmlFor="open_new_tab" className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
              Ouvrir dans un nouvel onglet
            </label>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

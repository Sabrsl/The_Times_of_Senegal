'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Save } from 'lucide-react'

interface Setting {
  key: string
  value: string
  description: string
}

export default function AdminSettings() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<Record<string, { value: string; description: string }>>({})

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')

      if (error) {
        console.error('Error loading settings:', error)
      } else if (data) {
        const settingsMap: Record<string, { value: string; description: string }> = {}
        data.forEach((setting: Setting) => {
          settingsMap[setting.key] = {
            value: setting.value,
            description: setting.description,
          }
        })
        setSettings(settingsMap)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const updates = Object.entries(settings).map(([key, data]) => ({
        key,
        value: data.value,
      }))

      // Delete all existing settings
      await supabase.from('site_settings').delete().neq('key', '')

      // Insert all settings
      const { error } = await supabase.from('site_settings').insert(updates)

      if (error) {
        console.error('Error saving settings:', error)
        alert('Erreur lors de la sauvegarde')
      } else {
        alert('Paramètres sauvegardés avec succès')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: string, value: string) => {
    setSettings({
      ...settings,
      [key]: {
        ...settings[key],
        value,
      },
    })
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
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
              Paramètres du site
            </h1>
            <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
              Configurer les informations générales du site
            </p>
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
            <label htmlFor="site_name" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
              Nom du site
            </label>
            <input
              type="text"
              id="site_name"
              value={settings.site_name?.value || ''}
              onChange={(e) => updateSetting('site_name', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
              style={{ fontSize: '14px' }}
            />
            {settings.site_name?.description && (
              <p className="text-xs text-[var(--text-muted)] mt-1" style={{ fontSize: '11px' }}>
                {settings.site_name.description}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="site_slogan" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
              Slogan
            </label>
            <input
              type="text"
              id="site_slogan"
              value={settings.site_slogan?.value || ''}
              onChange={(e) => updateSetting('site_slogan', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
              style={{ fontSize: '14px' }}
            />
            {settings.site_slogan?.description && (
              <p className="text-xs text-[var(--text-muted)] mt-1" style={{ fontSize: '11px' }}>
                {settings.site_slogan.description}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="site_description" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
              Description
            </label>
            <textarea
              id="site_description"
              value={settings.site_description?.value || ''}
              onChange={(e) => updateSetting('site_description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)] resize-none"
              style={{ fontSize: '14px' }}
            />
            {settings.site_description?.description && (
              <p className="text-xs text-[var(--text-muted)] mt-1" style={{ fontSize: '11px' }}>
                {settings.site_description.description}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="contact_email" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
              Email de contact
            </label>
            <input
              type="email"
              id="contact_email"
              value={settings.contact_email?.value || ''}
              onChange={(e) => updateSetting('contact_email', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
              style={{ fontSize: '14px' }}
            />
            {settings.contact_email?.description && (
              <p className="text-xs text-[var(--text-muted)] mt-1" style={{ fontSize: '11px' }}>
                {settings.contact_email.description}
              </p>
            )}
          </div>

          <div className="pt-6 border-t border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4" style={{ fontSize: '14px' }}>
              Réseaux sociaux
            </h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="twitter_handle" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                  Twitter (handle)
                </label>
                <input
                  type="text"
                  id="twitter_handle"
                  value={settings.twitter_handle?.value || ''}
                  onChange={(e) => updateSetting('twitter_handle', e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                  style={{ fontSize: '14px' }}
                  placeholder="@username"
                />
              </div>

              <div>
                <label htmlFor="facebook_page" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                  Facebook (page)
                </label>
                <input
                  type="text"
                  id="facebook_page"
                  value={settings.facebook_page?.value || ''}
                  onChange={(e) => updateSetting('facebook_page', e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                  style={{ fontSize: '14px' }}
                  placeholder="pagename"
                />
              </div>

              <div>
                <label htmlFor="instagram_handle" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                  Instagram (handle)
                </label>
                <input
                  type="text"
                  id="instagram_handle"
                  value={settings.instagram_handle?.value || ''}
                  onChange={(e) => updateSetting('instagram_handle', e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                  style={{ fontSize: '14px' }}
                  placeholder="@username"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

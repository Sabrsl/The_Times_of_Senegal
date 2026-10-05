'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Upload, Search, Trash2, Copy, Image as ImageIcon, File } from 'lucide-react'

interface MediaFile {
  name: string
  id: string
  updated_at: string
  metadata: any
}

export default function AdminMedia() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [files, setFiles] = useState<MediaFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const { data, error } = await supabase
        .storage
        .from('media')
        .list('', { limit: 100, offset: 0 })

      if (error) {
        console.error('Error loading files:', error)
        // If bucket doesn't exist, show empty state
        setFiles([])
      } else if (data) {
        setFiles(data as MediaFile[])
      }
    } catch (error) {
      console.error('Error loading files:', error)
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error uploading file:', uploadError)
        alert('Erreur lors de l\'upload du fichier')
      } else {
        await loadFiles()
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Erreur lors de l\'upload du fichier')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (fileName: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      return
    }

    try {
      const { error } = await supabase.storage
        .from('media')
        .remove([fileName])

      if (error) {
        console.error('Error deleting file:', error)
        alert('Erreur lors de la suppression')
      } else {
        await loadFiles()
      }
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from('media')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      alert('URL copiée dans le presse-papier')
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const isImage = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')
  }

  const filteredFiles = files.filter(
    (file) =>
      file.name.toLowerCase().includes(search.toLowerCase())
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
              Médias
            </h1>
            <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
              Gérer les images et fichiers
            </p>
          </div>
          <label className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors cursor-pointer" style={{ fontSize: '14px' }}>
            <Upload size={16} />
            {uploading ? 'Upload en cours...' : 'Uploader un fichier'}
            <input
              type="file"
              onChange={handleUpload}
              disabled={uploading}
              accept="image/*"
              className="hidden"
            />
          </label>
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
          {filteredFiles.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4">
              {filteredFiles.map((file) => (
                <div key={file.id} className="group relative">
                  <div className="aspect-square bg-[var(--background)] border border-[var(--border)] overflow-hidden">
                    {isImage(file.name) ? (
                      <img
                        src={getPublicUrl(file.name)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <File size={32} className="text-[var(--text-muted)]" />
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-[var(--text-primary)] truncate" style={{ fontSize: '11px' }}>
                      {file.name}
                    </p>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => copyToClipboard(getPublicUrl(file.name))}
                      className="p-1.5 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-sm"
                      title="Copier l'URL"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(file.name)}
                      className="p-1.5 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-error)] transition-colors rounded-sm"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <ImageIcon size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
              <p className="text-sm text-[var(--text-muted)] mb-4" style={{ fontSize: '14px' }}>
                {search ? 'Aucun fichier trouvé' : 'Aucun média pour le moment'}
              </p>
              {!search && (
                <p className="text-xs text-[var(--text-muted)]" style={{ fontSize: '11px' }}>
                  Uploadez votre premier fichier pour commencer
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

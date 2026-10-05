'use client'

import { useState } from 'react'
import { ClassificationProposal, EntityDetection } from '@/types/classification'
import { Check, X, Plus, AlertCircle } from 'lucide-react'

interface ClassificationPanelProps {
  proposal: ClassificationProposal
  onAccept: (detections: EntityDetection[]) => void
  onReject: ( detection: EntityDetection) => void
  onCreateNew?: (detection: EntityDetection) => void
}

export function ClassificationPanel({
  proposal,
  onAccept,
  onReject,
  onCreateNew,
}: ClassificationPanelProps) {
  const [selectedDetections, setSelectedDetections] = useState<EntityDetection[]>([])

  const toggleDetection = (detection: EntityDetection) => {
    setSelectedDetections(prev =>
      prev.find(d => d.name === detection.name)
        ? prev.filter(d => d.name !== detection.name)
        : [...prev, detection]
    )
  }

  const handleAcceptSelected = () => {
    onAccept(selectedDetections)
    setSelectedDetections([])
  }

  const EntitySection = ({
    title,
    detections,
    type,
  }: {
    title: string
    detections: EntityDetection[]
    type: EntityDetection['type']
  }) => {
    if (detections.length === 0) return null

    return (
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wide mb-2" style={{ fontSize: '11px' }}>
          {title}
        </h4>
        <div className="space-y-2">
          {detections.map((detection, idx) => (
            <div
              key={`${type}-${idx}`}
              className={`flex items-center justify-between p-3 border rounded-sm transition-colors ${
                selectedDetections.find(d => d.name === detection.name)
                  ? 'border-[var(--accent)] bg-[var(--surface-muted)]'
                  : 'border-[var(--border)] bg-[var(--surface)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleDetection(detection)}
                  className={`p-1 rounded-sm transition-colors ${
                    selectedDetections.find(d => d.name === detection.name)
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--border-strong)]'
                  }`}
                >
                  <Check size={14} />
                </button>
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                    {detection.name}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]" style={{ fontSize: '11px' }}>
                    Score: {Math.round(detection.score.final_score * 100)}%
                    {detection.state && ` • ${detection.state}`}
                    {detection.existing_id && ' • Entité existante'}
                    {detection.is_fallback && ' • Fallback'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!detection.existing_id && onCreateNew && (
                  <button
                    onClick={() => onCreateNew(detection)}
                    className="p-1.5 text-[var(--accent)] hover:bg-[var(--surface-muted)] rounded-sm transition-colors"
                    title="Créer nouvelle entité"
                  >
                    <Plus size={14} />
                  </button>
                )}
                <button
                  onClick={() => onReject(detection)}
                  className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors"
                  title="Rejeter"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const hasDetections = Object.values(proposal).some(arr => arr.length > 0)

  if (!hasDetections) {
    return (
      <div className="p-4 bg-[var(--surface-muted)] border border-[var(--border)] rounded-sm">
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]" style={{ fontSize: '14px' }}>
          <AlertCircle size={16} />
          <span>Aucune entité détectée dans cet article</span>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-[var(--border)] bg-[var(--surface)] rounded-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
          Entités détectées
        </h3>
        {selectedDetections.length > 0 && (
          <button
            onClick={handleAcceptSelected}
            className="px-3 py-1.5 bg-[var(--accent)] text-white text-xs font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors"
            style={{ fontSize: '12px' }}
          >
            Accepter ({selectedDetections.length})
          </button>
        )}
      </div>

      <EntitySection title="Personnes" detections={proposal.people} type="person" />
      <EntitySection title="Organisations" detections={proposal.organizations} type="organization" />
      <EntitySection title="Lieux" detections={proposal.places} type="place" />
      <EntitySection title="Événements" detections={proposal.events} type="event" />
      <EntitySection title="Tags" detections={proposal.tags} type="person" />
      <EntitySection title="Dossiers" detections={proposal.dossiers} type="person" />
    </div>
  )
}

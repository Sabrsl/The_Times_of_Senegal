'use client'

import { useState, useEffect } from 'react'

export function DateTimeDisplay() {
  const [date, setDate] = useState('')

  useEffect(() => {
    const updateDate = () => {
      const now = new Date()

      // Format de la date en français
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Africa/Dakar'
      }

      const dateStr = now.toLocaleDateString('fr-FR', dateOptions)
      setDate(dateStr.charAt(0).toUpperCase() + dateStr.slice(1))
    }

    updateDate()
    const interval = setInterval(updateDate, 60000) // Mise à jour chaque minute

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center gap-2 text-xs text-[var(--text-muted)]" style={{ fontSize: '11px' }}>
      <span>{date}</span>
      <span className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-center" style={{ fontSize: 'clamp(24px, 8vw, 48px)', letterSpacing: '0.1em', lineHeight: '1' }}>
        THE TIMES OF SENEGAL
      </span>
    </div>
  )
}

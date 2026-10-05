'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export function ScrollToTop() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className="inline-flex items-center justify-center p-2 bg-[var(--surface)] border border-[var(--border)] rounded-md hover:bg-[var(--surface-muted)] hover:border-[var(--border-strong)] transition-all duration-200"
      title="Remonter en haut"
      aria-label="Remonter en haut de la page"
    >
      <ArrowUp size={16} className="text-[var(--text-primary)]" />
    </button>
  )
}

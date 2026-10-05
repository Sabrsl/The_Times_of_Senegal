'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Mail, MapPin, Phone } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    // In a real application, this would send the form data to a server
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        <section className="mb-8 pb-6 border-b border-[var(--border)]">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
            Contact
          </h1>
          <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
            Une question, une suggestion ou une information à nous transmettre ?
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Contact Information */}
          <section>
            <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide mb-4" style={{ fontSize: '12px' }}>
              Coordonnées
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-[var(--text-muted)] flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                    Email
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                    contact@timeofsenegal.sn
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[var(--text-muted)] flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                    Adresse
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                    Dakar, Senegal
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={16} className="text-[var(--text-muted)] flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                    Téléphone
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
                    +221 33 XXX XX XX
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Form */}
          <section>
            <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide mb-4" style={{ fontSize: '12px' }}>
              Envoyer un message
            </h2>

            {submitted ? (
              <div className="p-4 bg-[var(--surface-muted)] border border-[var(--border)]">
                <p className="text-sm text-[var(--text-primary)]" style={{ fontSize: '14px' }}>
                  Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                    Nom
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                    style={{ fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                    style={{ fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                    Sujet
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)]"
                    style={{ fontSize: '14px' }}
                  >
                    <option value="">Sélectionner un sujet</option>
                    <option value="info">Demande d'information</option>
                    <option value="correction">Signaler une erreur</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="partnership">Partenariat</option>
                    <option value="press">Presse</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-medium text-[var(--text-primary)] mb-1" style={{ fontSize: '12px' }}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-sm text-sm focus:outline-none focus:border-[var(--border-strong)] resize-none"
                    style={{ fontSize: '14px' }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-[var(--accent)] text-[var(--text-inverse)] text-sm font-medium rounded-sm hover:bg-[var(--accent-hover)] transition-colors"
                  style={{ fontSize: '14px' }}
                >
                  Envoyer
                </button>
              </form>
            )}
          </section>
        </div>

        <section className="mt-12 p-4 bg-[var(--surface-muted)] border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] text-center" style={{ fontSize: '11px' }}>
            CONTENU DE DÉMONSTRATION - Ce formulaire est une démonstration et n'envoie pas de message réel.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}

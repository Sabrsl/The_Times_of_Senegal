import Link from 'next/link'

const footerLinks = {
  categories: [
    { name: 'Politique', href: '/politique' },
    { name: 'Économie', href: '/economie' },
    { name: 'Société', href: '/societe' },
    { name: 'Culture', href: '/culture' },
    { name: 'Sport', href: '/sport' },
    { name: 'Monde', href: '/monde' },
  ],
  focus: [
    { name: 'Comprendre', href: '/comprendre' },
    { name: 'Vérifié', href: '/verifie' },
  ],
  entities: [
    { name: 'Thèmes', href: '/tags' },
    { name: 'Dossiers', href: '/dossiers' },
    { name: 'Personnes', href: '/personnes' },
    { name: 'Organisations', href: '/organisations' },
    { name: 'Lieux', href: '/lieux' },
    { name: 'Événements', href: '/events' },
  ],
  about: [
    { name: 'À propos', href: '/a-propos' },
    { name: 'Contact', href: '/contact' },
    { name: 'Équipe', href: '/equipe' },
  ],
  legal: [
    { name: 'Charte éditoriale', href: '/charte-editoriale' },
    { name: 'Politique de correction', href: '/politique-correction' },
    { name: 'Politique de confidentialité', href: '/confidentialite' },
    { name: 'Mentions légales', href: '/mentions-legales' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)] mt-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="text-sm font-bold tracking-tight mb-2" style={{ fontSize: '14px', letterSpacing: '0.05em' }}>
              THE TIMES OF SENEGAL
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-4" style={{ fontSize: '12px' }}>
              L'information. Le contexte. Les sources.
            </p>
          </div>

          {/* Catégories */}
          <div>
            <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-3 uppercase tracking-wide" style={{ fontSize: '12px' }}>
              Rubriques
            </h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    style={{ fontSize: '12px' }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Entités */}
          <div>
            <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-3 uppercase tracking-wide" style={{ fontSize: '12px' }}>
              Entités
            </h3>
            <ul className="space-y-2">
              {footerLinks.entities.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    style={{ fontSize: '12px' }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Focus */}
          <div>
            <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-3 uppercase tracking-wide" style={{ fontSize: '12px' }}>
              Focus
            </h3>
            <ul className="space-y-2">
              {footerLinks.focus.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    style={{ fontSize: '12px' }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* À propos & Légal */}
          <div>
            <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-3 uppercase tracking-wide" style={{ fontSize: '12px' }}>
              Le média
            </h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    style={{ fontSize: '12px' }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    style={{ fontSize: '12px' }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] text-center" style={{ fontSize: '11px' }}>
            © 2026 THE TIMES OF SENEGAL. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}

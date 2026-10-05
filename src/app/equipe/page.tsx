import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

const team = [
  {
    name: 'Amadou Diallo',
    role: 'Rédacteur en chef',
    specialization: 'Politique',
    slug: 'amadou-diallo',
  },
  {
    name: 'Fatou Sow',
    role: 'Journaliste économique',
    specialization: 'Économie',
    slug: 'fatou-sow',
  },
  {
    name: 'Moussa Ndiaye',
    role: 'Journaliste',
    specialization: 'Société',
    slug: 'moussa-ndiaye',
  },
  {
    name: 'Aïcha Ba',
    role: 'Journaliste culture',
    specialization: 'Culture',
    slug: 'aicha-ba',
  },
  {
    name: 'Ibrahima Fall',
    role: 'Journaliste sport',
    specialization: 'Sport',
    slug: 'ibrahima-fall',
  },
  {
    name: 'Cheikh Tidiane Diop',
    role: 'Journaliste international',
    specialization: 'Relations internationales',
    slug: 'cheikh-tidiane-diop',
  },
  {
    name: 'Mame Diarra',
    role: 'Journaliste',
    specialization: 'Comprendre',
    slug: 'mame-diarra',
  },
  {
    name: 'Équipe Vérification',
    role: 'Fact-checkers',
    specialization: 'Vérification',
    slug: 'equipe-verification',
  },
]

export default function EquipePage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <section className="mb-8 pb-6 border-b border-[var(--border)]">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
            Équipe
          </h1>
          <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
            Les journalistes et professionnels qui font THE TIME OF SENEGAL
          </p>
        </section>

        <section className="mb-8">
          <div className="prose prose-sm max-w-none" style={{ fontSize: '15px', lineHeight: '1.6' }}>
            <div className="text-[var(--text-primary)] space-y-4">
              <p>
                Notre équipe est composée de journalistes expérimentés, spécialisés dans différents domaines de l'actualité sénégalaise. Chaque membre apporte son expertise et son engagement pour une information de qualité.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {team.map((member) => (
            <Link
              key={member.slug}
              href={`/personnes/${member.slug}`}
              className="block border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] transition-colors p-4"
            >
              {/* Avatar placeholder */}
              <div className="w-16 h-16 bg-[var(--surface-muted)] border border-[var(--border)] mb-3 flex items-center justify-center text-[var(--text-muted)] text-xs">
                Photo
              </div>
              
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1" style={{ fontSize: '16px' }}>
                {member.name}
              </h3>
              
              <p className="text-sm text-[var(--text-secondary)] mb-2" style={{ fontSize: '14px' }}>
                {member.role}
              </p>
              
              <p className="text-xs text-[var(--text-muted)]" style={{ fontSize: '11px' }}>
                {member.specialization}
              </p>
            </Link>
          ))}
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide mb-4" style={{ fontSize: '12px' }}>
            Nous rejoindre
          </h2>
          <div className="prose prose-sm max-w-none" style={{ fontSize: '15px', lineHeight: '1.6' }}>
            <div className="text-[var(--text-primary)] space-y-4">
              <p>
                THE TIME OF SENEGAL recrute régulièrement des journalistes passionnés par l'information de qualité. Si vous souhaitez rejoindre notre équipe, consultez nos offres d'emploi ou envoyez-nous une candidature spontanée.
              </p>
              <p>
                <Link href="/contact" className="text-[var(--text-primary)] border-b border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">
                  Contactez-nous
                </Link> pour en savoir plus.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 p-4 bg-[var(--surface-muted)] border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] text-center" style={{ fontSize: '11px' }}>
            CONTENU DE DÉMONSTRATION - Les membres de l'équipe présentés sont fictifs.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}

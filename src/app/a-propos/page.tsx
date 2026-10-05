import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        <section className="mb-8 pb-6 border-b border-[var(--border)]">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
            À propos
          </h1>
          <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
            Notre mission et notre engagement envers l'information de qualité
          </p>
        </section>

        <section className="prose prose-sm max-w-none mb-8" style={{ fontSize: '15px', lineHeight: '1.6' }}>
          <div className="text-[var(--text-primary)] space-y-4">
            <p>
              THE TIME OF SENEGAL est un média numérique sénégalais fondé avec une mission claire : fournir une information fiable, contextualisée et sourcée sur les actualités du Sénégal.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              Notre mission
            </h3>
            <p>
              Nous croyons que l'information de qualité est essentielle au bon fonctionnement de la démocratie et au développement de notre société. Notre objectif est de permettre aux citoyens sénégalais d'accéder à une information précise, vérifiée et mise en contexte.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              Notre approche
            </h3>
            <p>
              Contrairement à beaucoup de médias traditionnels, nous ne nous contentons pas de relayer des communiqués ou des déclarations. Nous cherchons systématiquement à :
            </p>
            <ul>
              <li>Vérifier les informations avant de les publier</li>
              <li>Contextualiser chaque actualité</li>
              <li>Citer nos sources de manière transparente</li>
              <li>Relier les informations entre elles pour créer une base de connaissances</li>
            </ul>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              Nos valeurs
            </h3>
            <p>
              Notre travail repose sur quatre valeurs fondamentales :
            </p>
            <ul>
              <li><strong>Indépendance</strong> : Nous ne sommes liés à aucun parti politique, groupe économique ou intérêt particulier.</li>
              <li><strong>Rigueur</strong> : Chaque information est vérifiée et sourcée avant publication.</li>
              <li><strong>Transparence</strong> : Nous indiquons clairement nos sources et nos méthodes.</li>
              <li><strong>Correction</strong> : En cas d'erreur, nous la corrigeons rapidement et de manière visible.</li>
            </ul>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              Notre projet
            </h3>
            <p>
              THE TIME OF SENEGAL s'inscrit dans une vision à long terme : construire une véritable base de connaissances journalistique sur le Sénégal. Au-delà de l'actualité quotidienne, nous structurons l'information autour de personnes, organisations, lieux, événements et dossiers thématiques.
            </p>
            <p>
              Cette approche permet à nos lecteurs de comprendre non seulement ce qui se passe, mais aussi pourquoi cela se passe, dans quel contexte, et quels sont les acteurs impliqués.
            </p>
          </div>
        </section>

        <section className="mt-12 p-4 bg-[var(--surface-muted)] border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] text-center" style={{ fontSize: '11px' }}>
            CONTENU DE DÉMONSTRATION
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}

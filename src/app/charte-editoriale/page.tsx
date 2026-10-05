import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function CharteEditorialePage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        <section className="mb-8 pb-6 border-b border-[var(--border)]">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
            Charte éditoriale
          </h1>
          <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
            Nos principes et nos engagements envers nos lecteurs
          </p>
        </section>

        <section className="prose prose-sm max-w-none mb-8" style={{ fontSize: '15px', lineHeight: '1.6' }}>
          <div className="text-[var(--text-primary)] space-y-4">
            <p>
              Cette charte éditoriale définit les principes qui guident le travail journalistique de THE TIME OF SÉNÉGAL. Elle s'applique à l'ensemble de notre équipe et à tous les contenus que nous publions.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              1. Indépendance
            </h3>
            <p>
              THE TIME OF SÉNÉGAL est indépendant de tout pouvoir politique, économique ou religieux. Nous ne publions aucun contenu sous la contrainte ou en échange d'avantages. Nos décisions éditoriales sont prises uniquement sur la base de l'intérêt public et de la pertinence journalistique.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              2. Vérification des faits
            </h3>
            <p>
              Toute information publiée fait l'objet d'une vérification rigoureuse. Nous consultons plusieurs sources, confrontons les versions et vérifions les faits avant publication. En cas de doute, nous ne publions pas.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              3. Transparence des sources
            </h3>
            <p>
              Nous indiquons systématiquement nos sources lorsque cela est possible. Lorsque nous utilisons des sources anonymes, nous expliquons les raisons de cette anonymat et nous nous assurons de la fiabilité de l'information. Nos lecteurs doivent pouvoir comprendre d'où vient l'information.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              4. Distinction entre faits et opinions
            </h3>
            <p>
              Nous distinguons clairement les faits vérifiables des opinions et analyses. Les articles d'opinion sont identifiés comme tels et n'engagent que leurs auteurs. Les reportages et informations factuelles sont présentés de manière neutre et objective.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              5. Respect des personnes
            </h3>
            <p>
              Nous respectons la dignité des personnes mentionnées dans nos articles. Nous évitons les atteintes injustifiées à la vie privée et nous nous abstenons de tout propos diffamatoire ou discriminatoire. Le droit à la présomption d'innocence est toujours respecté.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              6. Correction des erreurs
            </h3>
            <p>
              En cas d'erreur avérée, nous nous engageons à la corriger rapidement et de manière visible. Les corrections sont clairement identifiées et expliquées aux lecteurs. Notre politique de correction détaillée est disponible sur cette page.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              7. Protection des sources
            </h3>
            <p>
              Nous protégeons nos sources d'information, en particulier celles qui s'expriment sous couvert d'anonymat. Nous ne révélons aucune information permettant de les identifier sans leur consentement explicite.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              8. Rejet de toute forme de corruption
            </h3>
            <p>
              Nous n'acceptons aucun paiement, cadeau ou avantage en échange de la publication ou de la suppression d'informations. Tout membre de notre équipe enfreignant ce principe s'expose à des sanctions disciplinaires.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              9. Contextualisation
            </h3>
            <p>
              Nous nous efforçons de fournir le contexte nécessaire à la compréhension des informations que nous publions. Une information isolée peut être trompeuse ; nous cherchons toujours à replacer les faits dans leur contexte historique, politique, économique ou social.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              10. Écoute des lecteurs
            </h3>
            <p>
              Nous sommes ouverts aux remarques, critiques et suggestions de nos lecteurs. Nous prenons en compte les retours pour améliorer notre travail et nous engageons à répondre aux questions légitimes sur notre pratique journalistique.
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

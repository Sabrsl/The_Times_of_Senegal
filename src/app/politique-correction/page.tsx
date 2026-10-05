import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function PolitiqueCorrectionPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        <section className="mb-8 pb-6 border-b border-[var(--border)]">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
            Politique de correction
          </h1>
          <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
            Notre engagement envers la transparence et la rectification des erreurs
          </p>
        </section>

        <section className="prose prose-sm max-w-none mb-8" style={{ fontSize: '15px', lineHeight: '1.6' }}>
          <div className="text-[var(--text-primary)] space-y-4">
            <p>
              THE TIME OF SÉNÉGAL s'engage à corriger rapidement et de manière transparente toute erreur avérée dans ses contenus. Cette politique de correction définit nos procédures et nos engagements envers nos lecteurs.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              1. Signalement d'une erreur
            </h3>
            <p>
              Les lecteurs peuvent signaler une erreur potentielle en nous contactant via notre formulaire de contact ou par email à corrections@timeofsenegal.sn. Nous demandons aux personnes qui signalent une erreur de préciser :
            </p>
            <ul>
              <li>L'article concerné (titre et lien)</li>
              <li>La nature de l'erreur (fait inexact, erreur de contexte, faute d'orthographe, etc.)</li>
              <li>Les éléments permettant de vérifier la correction proposée</li>
            </ul>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              2. Vérification de l'erreur
            </h3>
            <p>
              Dès réception d'un signalement, notre équipe vérifie l'information signalée en consultant nos sources initiales et, si nécessaire, des sources supplémentaires. Cette vérification est effectuée dans les plus brefs délais, généralement dans un délai de 24 à 48 heures ouvrées.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              3. Types de corrections
            </h3>
            <p>
              Nous distinguons plusieurs types de corrections selon la gravité de l'erreur :
            </p>
            <ul>
              <li><strong>Correction mineure</strong> : Faute d'orthographe, erreur de ponctuation, erreur mineure sans impact sur le sens de l'article. La correction est effectuée sans mention spécifique.</li>
              <li><strong>Correction significative</strong> : Erreur factuelle, erreur de contexte, information incorrecte pouvant affecter la compréhension. Une note de correction est ajoutée en bas de l'article.</li>
              <li><strong>Rétractation</strong> : Article fondé sur une information fausse ou trompeuse. L'article est retiré et remplacé par une note expliquant les raisons de la rétractation.</li>
            </ul>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              4. Mise en œuvre des corrections
            </h3>
            <p>
              Lorsqu'une erreur est confirmée :
            </p>
            <ul>
              <li>L'erreur est corrigée dans le corps de l'article</li>
              <li>Pour les corrections significatives, une note explicative est ajoutée en bas de l'article, indiquant la nature de l'erreur et la date de la correction</li>
              <li>La date de mise à jour de l'article est modifiée</li>
              <li>Si l'erreur a été largement partagée sur les réseaux sociaux, nous publions également une correction sur ces plateformes</li>
            </ul>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              5. Réponse aux lecteurs
            </h3>
            <p>
              Nous répondons systématiquement aux personnes qui signalent une erreur, que nous acceptions ou non la correction proposée. En cas de refus de correction, nous expliquons les raisons de notre décision.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              6. Corrections à l'initiative de la rédaction
            </h3>
            <p>
              Nous corrigeons également toute erreur que nous découvrons nous-mêmes, sans attendre un signalement externe. Les mêmes procédures de transparence s'appliquent.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              7. Historique des corrections
            </h3>
            <p>
              Nous conservons un historique interne de toutes les corrections apportées à nos articles. Cet historique nous permet d'améliorer nos processus et de former notre équipe.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              8. Engagement de transparence
            </h3>
            <p>
              THE TIME OF SÉNÉGAL considère que la transparence sur les erreurs est un élément essentiel de la confiance avec ses lecteurs. Nous ne cachons pas nos erreurs et nous les corrigeons de manière visible et honnête.
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

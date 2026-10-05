import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        <section className="mb-8 pb-6 border-b border-[var(--border)]">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
            Politique de confidentialité
          </h1>
          <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
            Comment nous collectons, utilisons et protégeons vos données personnelles
          </p>
        </section>

        <section className="prose prose-sm max-w-none mb-8" style={{ fontSize: '15px', lineHeight: '1.6' }}>
          <div className="text-[var(--text-primary)] space-y-4">
            <p>
              THE TIME OF SÉNÉGAL s'engage à protéger la vie privée de ses lecteurs et utilisateurs. Cette politique de confidentialité explique quelles données personnelles nous collectons, comment nous les utilisons et quels sont vos droits.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              1. Données collectées
            </h3>
            <p>
              Nous collectons uniquement les données nécessaires au bon fonctionnement de nos services :
            </p>
            <ul>
              <li><strong>Données de navigation</strong> : Adresse IP, type de navigateur, système d'exploitation, pages visitées, durée de visite. Ces données sont collectées de manière anonyme à des fins statistiques.</li>
              <li><strong>Données de contact</strong> : Si vous nous contactez via notre formulaire, nous collectons votre nom, email et le contenu de votre message. Ces données ne sont utilisées que pour répondre à votre demande.</li>
              <li><strong>Données de compte</strong> : Si vous créez un compte (fonctionnalité à venir), nous collecterons les informations nécessaires à la création et à la gestion de votre compte.</li>
            </ul>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              2. Utilisation des données
            </h3>
            <p>
              Vos données personnelles sont utilisées pour :
            </p>
            <ul>
              <li>Fournir les services demandés (réponse aux contacts, accès au contenu)</li>
              <li>Améliorer la qualité de notre site et de nos contenus</li>
              <li>Établir des statistiques d'utilisation anonymes</li>
              <li>Assurer la sécurité du site et prévenir les abus</li>
            </ul>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              3. Partage des données
            </h3>
            <p>
              Nous ne vendons pas vos données personnelles à des tiers. Nous ne partageons vos données que dans les cas suivants :
            </p>
            <ul>
              <li>Avec votre consentement explicite</li>
              <li>Pour se conformer à une obligation légale ou une décision judiciaire</li>
              <li>Avec nos prestataires de services techniques strictement nécessaires au fonctionnement du site (hébergement, analytics)</li>
            </ul>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              4. Conservation des données
            </h3>
            <p>
              Nous ne conservons vos données que le temps nécessaire aux finalités pour lesquelles elles ont été collectées :
            </p>
            <ul>
              <li>Données de contact : conservées le temps nécessaire pour répondre à votre demande, puis supprimées ou archivées</li>
              <li>Données de navigation : conservées sous forme anonymisée pendant une durée maximale de 13 mois</li>
              <li>Données de compte : conservées tant que votre compte est actif, puis supprimées sur demande</li>
            </ul>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              5. Cookies
            </h3>
            <p>
              Nous utilisons des cookies pour améliorer votre expérience de navigation :
            </p>
            <ul>
              <li><strong>Cookies techniques</strong> : Nécessaires au bon fonctionnement du site</li>
              <li><strong>Cookies de préférences</strong> : Mémorisent vos choix (thème clair/sombre)</li>
              <li><strong>Cookies d'analyse</strong> : Nous permettent de comprendre comment le site est utilisé</li>
            </ul>
            <p>
              Vous pouvez gérer vos préférences en matière de cookies via les paramètres de votre navigateur.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              6. Vos droits
            </h3>
            <p>
              Conformément à la loi sénégalaise sur la protection des données personnelles, vous disposez des droits suivants :
            </p>
            <ul>
              <li><strong>Droit d'accès</strong> : Demander une copie de vos données personnelles</li>
              <li><strong>Droit de rectification</strong> : Demander la correction de données inexactes</li>
              <li><strong>Droit de suppression</strong> : Demander la suppression de vos données</li>
              <li><strong>Droit d'opposition</strong> : Vous opposer au traitement de vos données</li>
              <li><strong>Droit à la portabilité</strong> : Recevoir vos données dans un format structuré</li>
            </ul>
            <p>
              Pour exercer ces droits, contactez-nous à confidentialite@timeofsenegal.sn.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              7. Sécurité des données
            </h3>
            <p>
              Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre l'accès non autorisé, la modification, la destruction ou la divulgation. Ces mesures incluent le chiffrement, les pare-feu et les protocoles sécurisés.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              8. Modifications de cette politique
            </h3>
            <p>
              Nous nous réservons le droit de modifier cette politique de confidentialité. Les modifications seront publiées sur cette page avec la date de mise à jour. Nous vous encourageons à consulter régulièrement cette politique.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              9. Contact
            </h3>
            <p>
              Pour toute question concernant cette politique de confidentialité ou le traitement de vos données personnelles, contactez-nous à :
            </p>
            <p>
              Email : confidentialite@timeofsenegal.sn<br />
              Adresse : Dakar, Sénégal
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

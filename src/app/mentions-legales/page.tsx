import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        <section className="mb-8 pb-6 border-b border-[var(--border)]">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontSize: '32px' }}>
            Mentions légales
          </h1>
          <p className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '14px' }}>
            Informations légales relatives au site THE TIME OF SÉNÉGAL
          </p>
        </section>

        <section className="prose prose-sm max-w-none mb-8" style={{ fontSize: '15px', lineHeight: '1.6' }}>
          <div className="text-[var(--text-primary)] space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              1. Éditeur du site
            </h3>
            <p>
              Le site THE TIME OF SÉNÉGAL est édité par :
            </p>
            <p>
              <strong>THE TIME OF SÉNÉGAL</strong><br />
              Forme juridique : Société à responsabilité limitée (SARL)<br />
              Capital social : 10 000 000 FCFA<br />
              Siège social : Dakar, Sénégal<br />
              Numéro d'identification fiscale : À déterminer<br />
              Email : contact@timeofsenegal.sn
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              2. Directeur de la publication
            </h3>
            <p>
              Le directeur de la publication du site THE TIME OF SÉNÉGAL est :
            </p>
            <p>
              Amadou Diallo<br />
              Rédacteur en chef<br />
              Email : redaction@timeofsenegal.sn
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              3. Hébergement
            </h3>
            <p>
              Le site est hébergé par :
            </p>
            <p>
              [Nom de l'hébergeur]<br />
              [Adresse de l'hébergeur]<br />
              [Coordonnées de l'hébergeur]
            </p>
            <p>
              <em>Informations à compléter lors de la mise en production.</em>
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              4. Propriété intellectuelle
            </h3>
            <p>
              L'ensemble du contenu de ce site (textes, images, vidéos, graphismes, logos, etc.) est protégé par le droit d'auteur et les lois sur la propriété intellectuelle.
            </p>
            <p>
              Toute reproduction, même partielle, du contenu de ce site est interdite sans l'autorisation préalable de THE TIME OF SÉNÉGAL, à l'exception des cas prévus par la loi (copie privée, citation courte à des fins d'information, etc.).
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              5. Données personnelles
            </h3>
            <p>
              La collecte et le traitement de vos données personnelles sont régis par notre politique de confidentialité, disponible à l'adresse : /confidentialite
            </p>
            <p>
              Conformément à la loi n°2008-12 du 25 janvier 2008 relative à la protection des données personnelles au Sénégal, vous disposez d'un droit d'accès, de rectification et d'opposition aux données vous concernant.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              6. Cookies
            </h3>
            <p>
              Ce site utilise des cookies pour améliorer votre expérience de navigation. Vous pouvez gérer vos préférences en matière de cookies via les paramètres de votre navigateur.
            </p>
            <p>
              Pour plus d'informations, consultez notre politique de confidentialité.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              7. Liens hypertextes
            </h3>
            <p>
              Ce site peut contenir des liens vers des sites tiers. THE TIME OF SÉNÉGAL ne peut être tenu responsable du contenu de ces sites externes. L'accès à ces sites se fait sous l'entière responsabilité de l'utilisateur.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              8. Limitation de responsabilité
            </h3>
            <p>
              THE TIME OF SÉNÉGAL s'efforce de fournir des informations exactes et à jour sur ce site. Cependant, nous ne pouvons garantir l'exactitude, la complétude ou l'actualité des informations diffusées.
            </p>
            <p>
              THE TIME OF SÉNÉGAL ne peut être tenu responsable de toute conséquence directe ou indirecte résultant de l'utilisation de ce site ou de l'impossibilité d'y accéder.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              9. Loi applicable et juridiction
            </h3>
            <p>
              Le présent site est régi par la loi sénégalaise. Tout litige relatif à l'utilisation du site sera soumis aux juridictions compétentes du Sénégal.
            </p>

            <h3 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontSize: '18px' }}>
              10. Contact
            </h3>
            <p>
              Pour toute question relative aux mentions légales ou au fonctionnement du site, vous pouvez nous contacter à :
            </p>
            <p>
              Email : contact@timeofsenegal.sn<br />
              Adresse : Dakar, Sénégal
            </p>
          </div>
        </section>

        <section className="mt-12 p-4 bg-[var(--surface-muted)] border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] text-center" style={{ fontSize: '11px' }}>
            CONTENU DE DÉMONSTRATION - Les informations légales présentées sont fictives et doivent être complétées avant la mise en production.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}

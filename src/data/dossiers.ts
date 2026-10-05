import { Dossier } from '@/types'

export const dossiers: Dossier[] = [
  {
    id: 'd1',
    slug: 'economie-senegalaise',
    title: 'Économie sénégalaise',
    description: 'Suivi de l\'économie sénégalaise : croissance, investissements, politiques économiques et défis structurels.',
    articles: ['1', '2', '7'],
    createdAt: '2026-01-01',
    updatedAt: '2026-10-03',
  },
  {
    id: 'd2',
    slug: 'education',
    title: 'Éducation',
    description: 'Actualités et analyses sur le système éducatif sénégalais : réformes, défis et innovations.',
    articles: ['3'],
    createdAt: '2026-01-01',
    updatedAt: '2026-10-02',
  },
  {
    id: 'd3',
    slug: 'elections',
    title: 'Élections',
    description: 'Couverture des élections sénégalaises : présidentielles, législatives et locales.',
    articles: [],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'd4',
    slug: 'agriculture',
    title: 'Agriculture',
    description: 'Le secteur agricole sénégalais : politiques, investissements et enjeux de sécurité alimentaire.',
    articles: ['1'],
    createdAt: '2026-01-01',
    updatedAt: '2026-10-03',
  },
  {
    id: 'd5',
    slug: 'energie',
    title: 'Énergie',
    description: 'Transition énergétique, hydrocarbures et énergies renouvelables au Sénégal.',
    articles: [],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'd6',
    slug: 'infrastructures',
    title: 'Infrastructures',
    description: 'Développement des infrastructures : transports, urbanisme et équipements publics.',
    articles: [],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'd7',
    slug: 'societe',
    title: 'Société',
    description: 'Questions sociétales au Sénégal : éducation, santé, emploi et cohésion sociale.',
    articles: ['3'],
    createdAt: '2026-01-01',
    updatedAt: '2026-10-02',
  },
  {
    id: 'd8',
    slug: 'relations-internationales',
    title: 'Relations internationales',
    description: 'La diplomatie sénégalaise et les partenariats internationaux.',
    articles: ['6'],
    createdAt: '2026-01-01',
    updatedAt: '2026-10-01',
  },
]

export const getDossierBySlug = (slug: string): Dossier | undefined => {
  return dossiers.find((dossier) => dossier.slug === slug)
}

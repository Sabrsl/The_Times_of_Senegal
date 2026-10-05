import { Person, Organization, Location } from '@/types'

export const persons: Person[] = [
  {
    id: 'p1',
    slug: 'amadou-diallo',
    name: 'Amadou Diallo',
    role: 'Journaliste politique',
    biography: 'Amadou Diallo est journaliste politique depuis 15 ans. Il couvre les questions de gouvernance et de politiques publiques au Sénégal.',
    relatedArticles: ['1', '6'],
    sources: [
      {
        id: 'sp1',
        name: 'THE TIME OF SÉNÉGAL',
        type: 'media',
        description: 'Fiche collaborateur',
      },
    ],
  },
  {
    id: 'p2',
    slug: 'fatou-sow',
    name: 'Fatou Sow',
    role: 'Journaliste économique',
    biography: 'Fatou Sow spécialise dans l\'économie et les questions de développement. Elle analyse les indicateurs économiques et les politiques budgétaires.',
    relatedArticles: ['2'],
    sources: [
      {
        id: 'sp2',
        name: 'THE TIME OF SÉNÉGAL',
        type: 'media',
        description: 'Fiche collaborateur',
      },
    ],
  },
]

export const organizations: Organization[] = [
  {
    id: 'o1',
    slug: 'gouvernement-du-senegal',
    name: 'Gouvernement du Sénégal',
    type: 'government',
    description: 'Le pouvoir exécutif de la République du Sénégal, dirigé par le Président de la République et le Premier ministre.',
    relatedArticles: ['1', '8'],
    leaders: ['premier-ministre'],
    relatedEvents: ['e1'],
    sources: [
      {
        id: 'so1',
        name: 'Constitution du Sénégal',
        type: 'official',
        description: 'Article relatif au pouvoir exécutif',
      },
    ],
  },
  {
    id: 'o2',
    slug: 'ansd',
    name: 'Agence nationale de la statistique et de la démographie',
    type: 'institution',
    description: 'Organisme public chargé de la production et de la coordination des statistiques officielles au Sénégal.',
    relatedArticles: ['1', '2'],
    sources: [
      {
        id: 'so2',
        name: 'Décret n°2015-1234',
        type: 'official',
        description: 'Création de l\'ANSD',
      },
    ],
  },
]

export const locations: Location[] = [
  {
    id: 'l1',
    slug: 'dakar',
    name: 'Dakar',
    location: 'Cap-Vert, Sénégal',
    description: 'Capitale politique et économique du Sénégal, située sur la presqu\'île du Cap-Vert.',
    relatedArticles: ['4'],
  },
  {
    id: 'l2',
    slug: 'saint-louis',
    name: 'Saint-Louis',
    location: 'Fleuve Sénégal',
    description: 'Ancienne capitale du Sénégal et de l\'Afrique occidentale française, située à l\'embouchure du fleuve Sénégal.',
    relatedArticles: [],
  },
]

export const getPersonBySlug = (slug: string): Person | undefined => {
  return persons.find((person) => person.slug === slug)
}

export const getOrganizationBySlug = (slug: string): Organization | undefined => {
  return organizations.find((org) => org.slug === slug)
}

export const getLocationBySlug = (slug: string): Location | undefined => {
  return locations.find((location) => location.slug === slug)
}

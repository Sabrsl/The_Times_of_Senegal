export interface Article {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: {
    name: string
    slug: string
  } | string
  author?: {
    name: string
    slug: string
  }
  publishedAt: string
  updatedAt?: string
  image?: string
  sources: Source[]
  relatedArticles?: string[]
  entities?: EntityLink[]
}

export interface Source {
  id: string
  name: string
  type: 'government' | 'organization' | 'media' | 'official' | 'statistical' | 'other'
  url?: string
  description: string
  publishedAt?: string
}

export interface EntityLink {
  type: 'person' | 'organization' | 'location' | 'event' | 'theme'
  name: string
  slug: string
}

export interface Person {
  id: string
  slug: string
  name: string
  role?: string
  photo?: string
  biography: string
  relatedArticles: string[]
  statements?: Statement[]
  timeline?: TimelineEvent[]
  sources: Source[]
}

export interface Organization {
  id: string
  slug: string
  name: string
  type: 'government' | 'company' | 'ngo' | 'institution' | 'political_party' | 'other'
  description: string
  relatedArticles: string[]
  leaders?: string[]
  relatedEvents?: string[]
  sources: Source[]
}

export interface Location {
  id: string
  slug: string
  name: string
  location: string
  description: string
  relatedArticles: string[]
}

export interface Dossier {
  id: string
  slug: string
  title: string
  description: string
  articles: string[]
  createdAt: string
  updatedAt: string
}

export interface Verification {
  id: string
  slug: string
  claim: string
  verifiedInfo: string
  sourceEvidence: string
  context: string
  conclusion: string
  sources: Source[]
  publishedAt: string
  updatedAt?: string
}

export interface Statement {
  id: string
  content: string
  date: string
  context: string
  source: Source
}

export interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
  source?: Source
}

export interface SearchResult {
  type: 'article' | 'person' | 'organization' | 'location' | 'dossier' | 'event'
  id: string
  slug: string
  title: string
  description?: string
  category?: string
}

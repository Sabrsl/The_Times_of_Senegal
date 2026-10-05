export interface Tag {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  created_at: string
  updated_at: string
}

export interface Dossier {
  id: string
  title: string
  slug: string
  description?: string
  featured_image?: string
  is_visible: boolean
  position: number
  created_at: string
  updated_at: string
}

export interface ArticleTag {
  article_id: string
  tag_id: string
}

export interface ArticleDossier {
  article_id: string
  dossier_id: string
}

export type DecisionState = 'MATCHED' | 'PROPOSED' | 'AMBIGUOUS' | 'NEW_ENTITY' | 'REJECTED'

export interface EntityScore {
  name_similarity: number
  extraction_confidence: number  // Confidence from keyword/LLM extraction (NOT real semantic analysis)
  context_score: number
  type_score: number
  final_score: number
}

export interface EntityDetection {
  type: 'person' | 'organization' | 'place' | 'event'
  name: string
  existing_id?: string
  mention: string
  context: string
  score: EntityScore
  state: DecisionState
  is_fallback: boolean
}

export interface ClassificationProposal {
  tags: EntityDetection[]
  people: EntityDetection[]
  organizations: EntityDetection[]
  places: EntityDetection[]
  events: EntityDetection[]
  dossiers: EntityDetection[]
}

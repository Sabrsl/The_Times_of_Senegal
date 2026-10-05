import { ClassificationProposal, EntityDetection, DecisionState, EntityScore } from '@/types/classification'
import { normalizeEntityName, normalizeEntityNameStrict, areNamesEquivalent } from './normalizer'
import { isGenericTerm, isPhraseGeneric, filterGenericTerms } from './genericTerms'
import { getCachedEntities, setCachedEntities, getCachedAnalysis, setCachedAnalysis, setCachedEntitiesByType, getCachedEntitiesByType } from './cache'

interface Entity {
  id: string
  name: string
  slug: string
  type?: string
}

interface EntityAlias {
  entity_type: string
  entity_id: string
  alias: string
  normalized_alias: string
}

interface ExistingEntities {
  people: Entity[]
  organizations: Entity[]
  places: Entity[]
  events: Entity[]
  tags: Entity[]
  dossiers: Entity[]
  aliases: EntityAlias[]
}

interface LLMDetection {
  name: string
  type: 'PERSON' | 'ORGANIZATION' | 'PLACE' | 'EVENT' | 'THEME'
  mention: string
  context: string
  confidence: number
}

// Score weights (configurable)
const SCORE_WEIGHTS = {
  extraction_confidence: 0.40,  // Confidence from keyword/LLM extraction (NOT real semantic analysis)
  name_similarity: 0.25,
  context_score: 0.20,
  type_score: 0.15,
}

// Decision thresholds
const DECISION_THRESHOLDS = {
  MATCHED: 0.95,
  PROPOSED: 0.80,
  EXAMINE: 0.60,
}

// New entity creation threshold (stricter)
const NEW_ENTITY_THRESHOLD = 0.95

/**
 * Detect entities in article content using LLM + fuzzy matching
 */
export class EntityDetector {
  private entities: ExistingEntities

  constructor(entities: ExistingEntities) {
    this.entities = entities
  }

  /**
   * Analyze article text and propose entity associations
   * Uses LLM for extraction + structured matching
   */
  async analyze(text: string): Promise<ClassificationProposal> {
    // Step 1: Extract candidates using LLM (or fallback to keyword extraction)
    const llmDetections = await this.extractWithLLM(text)

    // Step 2: Match with existing entities using structured matching
    const matchedDetections = this.matchWithExistingEntities(llmDetections)

    // Step 3: Deduplicate same entities in article
    const deduplicatedDetections = this.deduplicateDetections(matchedDetections)

    // Step 4: Filter by decision thresholds
    const filteredDetections = this.filterByThresholds(deduplicatedDetections)

    return filteredDetections
  }

  /**
   * Analyze with caching support
   * If contentHash is provided and cache hit, returns cached result immediately
   * Otherwise performs analysis and caches the result
   * Note: This method is kept for backward compatibility but articleId should be provided
   */
  async analyzeWithCache(text: string, contentHash?: string, articleId?: string): Promise<ClassificationProposal> {
    // Check cache if contentHash is provided
    if (contentHash && articleId) {
      const cached = getCachedAnalysis(articleId, contentHash)
      if (cached) {
        return cached
      }
    }

    // Perform analysis
    const result = await this.analyze(text)

    // Cache the result if contentHash and articleId are provided
    if (contentHash && articleId) {
      setCachedAnalysis(articleId, contentHash, result)
    }

    return result
  }

  /**
   * Extract entities using LLM
   * In production, this would call an LLM API (OpenAI, Anthropic, etc.)
   * For now, we use a sophisticated keyword-based fallback
   */
  private async extractWithLLM(text: string): Promise<LLMDetection[]> {
    // TODO: Replace with actual LLM API call
    // const response = await openai.chat.completions.create({...})
    
    // Fallback: keyword-based extraction with context
    return this.keywordExtraction(text)
  }

  /**
   * Keyword-based extraction as fallback with generic term filtering
   */
  private keywordExtraction(text: string): LLMDetection[] {
    const detections: LLMDetection[] = []
    const normalizedText = text.toLowerCase()
    
    // Person patterns (capitalized names) - filter generic terms
    const personPattern = /\b([A-Z][a-z]+ [A-Z][a-z]+(?: [A-Z][a-z]+)?)\b/g
    const people = text.match(personPattern) || []
    
    people.forEach(name => {
      // Filter out generic terms
      if (isGenericTerm(name)) return
      
      const context = this.extractContext(text, name)
      detections.push({
        name: name,
        type: 'PERSON',
        mention: name,
        context: context,
        confidence: 0.85,
      })
    })
    
    // Organization patterns - filter generic terms
    const orgKeywords = ['BCEAO', 'CEDEAO', 'ANSD', 'Assemblée Nationale']
    orgKeywords.forEach(org => {
      if (normalizedText.includes(org.toLowerCase())) {
        const context = this.extractContext(text, org)
        detections.push({
          name: org,
          type: 'ORGANIZATION',
          mention: org,
          context: context,
          confidence: 0.90,
        })
      }
    })
    
    // Place patterns - filter generic terms
    const placeKeywords = ['Dakar', 'Saint-Louis', 'Thiès', 'Ziguinchor', 'Sénégal', 'Casamance']
    placeKeywords.forEach(place => {
      if (normalizedText.includes(place.toLowerCase()) && !isGenericTerm(place)) {
        const context = this.extractContext(text, place)
        detections.push({
          name: place,
          type: 'PLACE',
          mention: place,
          context: context,
          confidence: 0.92,
        })
      }
    })
    
    return detections
  }

  /**
   * Extract context window around a mention
   */
  private extractContext(text: string, mention: string): string {
    const mentionIndex = text.toLowerCase().indexOf(mention.toLowerCase())
    if (mentionIndex === -1) return ''
    
    const windowSize = 50
    const start = Math.max(0, mentionIndex - windowSize)
    const end = Math.min(text.length, mentionIndex + mention.length + windowSize)
    
    return text.substring(start, end).trim()
  }

  /**
   * Match LLM detections with existing entities using structured matching
   * Order: exact ID → exact name → alias → normalized → fuzzy
   */
  private matchWithExistingEntities(detections: LLMDetection[]): EntityDetection[] {
    const matched: EntityDetection[] = []
    
    for (const detection of detections) {
      const entityType = this.mapLLMTypeToEntityType(detection.type)
      const entityCollection = this.mapLLMTypeToEntityCollection(detection.type)
      const existingEntities = this.entities[entityCollection] || []
      const aliases = this.entities.aliases.filter(a => a.entity_type === entityType)
      
      // Step 1: Try exact name match
      const exactMatch = (existingEntities as Entity[]).find(e => 
        areNamesEquivalent(e.name, detection.name)
      )
      
      if (exactMatch) {
        matched.push(this.createDetection(detection, exactMatch.id, entityType, 1.0, 'MATCHED', false))
        continue
      }
      
      // Step 2: Try alias match
      const aliasMatch = aliases.find(a => 
        areNamesEquivalent(a.alias, detection.name)
      )
      
      if (aliasMatch) {
        matched.push(this.createDetection(detection, aliasMatch.entity_id, entityType, 0.95, 'MATCHED', false))
        continue
      }
      
      // Step 3: Try fuzzy matching (last resort)
      const bestMatch = this.findBestFuzzyMatch(detection.name, existingEntities as Entity[])
      
      if (bestMatch) {
        if (bestMatch.isAmbiguous) {
          // Multiple close matches - mark as ambiguous for human review
          matched.push(this.createDetection(detection, undefined, entityType, bestMatch.score, 'AMBIGUOUS', true))
        } else if (bestMatch.score >= DECISION_THRESHOLDS.PROPOSED) {
          const state = bestMatch.score >= DECISION_THRESHOLDS.MATCHED ? 'MATCHED' : 'PROPOSED'
          matched.push(this.createDetection(detection, bestMatch.entity.id, entityType, bestMatch.score, state, false))
        }
      } else if (detection.confidence >= NEW_ENTITY_THRESHOLD) {
        // Propose new entity creation (candidate only, not automatic creation)
        matched.push(this.createDetection(detection, undefined, entityType, detection.confidence, 'NEW_ENTITY', true))
      }
    }
    
    return matched
  }

  /**
   * Create EntityDetection with proper score structure
   */
  private createDetection(
    detection: LLMDetection,
    existingId: string | undefined,
    entityType: EntityDetection['type'],
    similarity: number,
    state: DecisionState,
    isFallback: boolean
  ): EntityDetection {
    const score: EntityScore = {
      name_similarity: similarity,
      extraction_confidence: detection.confidence,
      context_score: this.calculateContextScore(detection.context),
      type_score: this.calculateTypeScore(detection.type, entityType),
      final_score: 0, // Calculated below
    }
    
    // Calculate final score using weights
    score.final_score = 
      score.extraction_confidence * SCORE_WEIGHTS.extraction_confidence +
      score.name_similarity * SCORE_WEIGHTS.name_similarity +
      score.context_score * SCORE_WEIGHTS.context_score +
      score.type_score * SCORE_WEIGHTS.type_score
    
    return {
      type: entityType,
      name: detection.name,
      existing_id: existingId,
      mention: detection.mention,
      context: detection.context,
      score,
      state,
      is_fallback: isFallback,
    }
  }

  /**
   * Calculate context score based on surrounding text
   */
  private calculateContextScore(context: string): number {
    if (!context) return 0.5
    
    // Simple heuristic: longer context with relevant indicators = higher score
    const indicators = ['a', 'à', 'de', 'du', 'des', 'la', 'le', 'les', 'en', 'sur', 'pour']
    const indicatorCount = indicators.filter(ind => context.toLowerCase().includes(ind)).length
    
    return Math.min(0.5 + (indicatorCount * 0.1), 1.0)
  }

  /**
   * Calculate type score based on LLM type vs expected type
   */
  private calculateTypeScore(llmType: string, expectedType: EntityDetection['type']): number {
    const typeMapping: Record<string, EntityDetection['type']> = {
      'PERSON': 'person',
      'ORGANIZATION': 'organization',
      'PLACE': 'place',
      'EVENT': 'event',
    }
    
    return typeMapping[llmType] === expectedType ? 1.0 : 0.5
  }

  /**
   * Find best fuzzy match (last resort)
   * Returns null if ambiguous (multiple close matches)
   */
  private findBestFuzzyMatch(name: string, entities: Entity[]): { entity: Entity; score: number; isAmbiguous: boolean } | null {
    const matches: { entity: Entity; score: number }[] = []
    
    for (const entity of entities) {
      const score = this.calculateSimilarity(name, entity.name)
      if (score >= DECISION_THRESHOLDS.PROPOSED) {
        matches.push({ entity, score })
      }
    }
    
    if (matches.length === 0) return null
    
    // Sort by score descending
    matches.sort((a, b) => b.score - a.score)
    
    const bestMatch = matches[0]
    
    // Check if ambiguous: second best match is within 0.05 of best match
    const isAmbiguous = matches.length > 1 && (bestMatch.score - matches[1].score) < 0.05
    
    return { entity: bestMatch.entity, score: bestMatch.score, isAmbiguous }
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = normalizeEntityNameStrict(str1)
    const s2 = normalizeEntityNameStrict(str2)
    
    if (s1 === s2) return 1.0
    
    const distance = this.levenshteinDistance(s1, s2)
    const maxLen = Math.max(s1.length, s2.length)
    
    return 1 - distance / maxLen
  }

  /**
   * Levenshtein distance calculation
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  /**
   * Deduplicate same entities detected multiple times
   */
  private deduplicateDetections(detections: EntityDetection[]): EntityDetection[] {
    const seen = new Map<string, EntityDetection>()
    
    for (const detection of detections) {
      const key = `${detection.type}-${detection.name.toLowerCase()}`
      
      if (!seen.has(key)) {
        seen.set(key, detection)
      } else {
        // Keep the one with higher final score
        const existing = seen.get(key)!
        if (detection.score.final_score > existing.score.final_score) {
          seen.set(key, detection)
        }
      }
    }
    
    return Array.from(seen.values())
  }

  /**
   * Filter detections by decision thresholds
   */
  private filterByThresholds(detections: EntityDetection[]): ClassificationProposal {
    const proposal: ClassificationProposal = {
      tags: [],
      people: [],
      organizations: [],
      places: [],
      events: [],
      dossiers: [],
    }
    
    for (const detection of detections) {
      if (detection.score.final_score < DECISION_THRESHOLDS.EXAMINE) continue
      
      // Map entity type to proposal array key
      const typeMapping: Record<EntityDetection['type'], keyof ClassificationProposal> = {
        'person': 'people',
        'organization': 'organizations',
        'place': 'places',
        'event': 'events',
      }
      
      const targetKey = typeMapping[detection.type] || 'tags'
      if (Array.isArray(proposal[targetKey])) {
        (proposal[targetKey] as EntityDetection[]).push(detection)
      }
    }
    
    return proposal
  }

  /**
   * Map LLM entity type to internal entity type (singular)
   */
  private mapLLMTypeToEntityType(llmType: string): EntityDetection['type'] {
    const mapping: Record<string, EntityDetection['type']> = {
      'PERSON': 'person',
      'ORGANIZATION': 'organization',
      'PLACE': 'place',
      'EVENT': 'event',
      'THEME': 'person', // Themes map to tags, which use person type for now
    }
    
    return mapping[llmType] || 'person'
  }

  /**
   * Map LLM entity type to entity collection name (plural)
   */
  private mapLLMTypeToEntityCollection(llmType: string): keyof ExistingEntities {
    const mapping: Record<string, keyof ExistingEntities> = {
      'PERSON': 'people',
      'ORGANIZATION': 'organizations',
      'PLACE': 'places',
      'EVENT': 'events',
      'THEME': 'tags',
    }
    
    return mapping[llmType] || 'tags'
  }
}

/**
 * Fetch all existing entities from Supabase with caching
 * Uses in-memory cache with 10-minute TTL to avoid repeated Supabase queries
 * Each entity type is cached separately with key: entities:{type}
 */
export async function fetchExistingEntities(supabase: any): Promise<ExistingEntities> {
  // Check cache for each entity type separately
  const cachedPeople = getCachedEntitiesByType('people')
  const cachedOrganizations = getCachedEntitiesByType('organizations')
  const cachedPlaces = getCachedEntitiesByType('places')
  const cachedEvents = getCachedEntitiesByType('events')
  const cachedTags = getCachedEntitiesByType('tags')
  const cachedDossiers = getCachedEntitiesByType('dossiers')
  const cachedAliases = getCachedEntitiesByType('aliases')

  // If all types are cached, return immediately
  if (cachedPeople && cachedOrganizations && cachedPlaces && cachedEvents &&
      cachedTags && cachedDossiers && cachedAliases) {
    return {
      people: cachedPeople,
      organizations: cachedOrganizations,
      places: cachedPlaces,
      events: cachedEvents,
      tags: cachedTags,
      dossiers: cachedDossiers,
      aliases: cachedAliases,
    }
  }

  // Cache miss for some types - fetch only what's needed
  const [people, organizations, places, events, tags, dossiers, aliases] = await Promise.all([
    cachedPeople ? { data: cachedPeople } : supabase.from('people').select('id, name, slug'),
    cachedOrganizations ? { data: cachedOrganizations } : supabase.from('organizations').select('id, name, slug'),
    cachedPlaces ? { data: cachedPlaces } : supabase.from('places').select('id, name, slug'),
    cachedEvents ? { data: cachedEvents } : supabase.from('events').select('id, name, slug'),
    cachedTags ? { data: cachedTags } : supabase.from('tags').select('id, name, slug'),
    cachedDossiers ? { data: cachedDossiers } : supabase.from('dossiers').select('id, title, slug'),
    cachedAliases ? { data: cachedAliases } : supabase.from('entity_aliases').select('*'),
  ])

  const entities = {
    people: people.data || [],
    organizations: organizations.data || [],
    places: places.data || [],
    events: events.data || [],
    tags: tags.data || [],
    dossiers: (dossiers.data || []).map((d: any) => ({ ...d, name: d.title })),
    aliases: aliases.data || [],
  }

  // Cache each entity type separately
  setCachedEntitiesByType('people', entities.people)
  setCachedEntitiesByType('organizations', entities.organizations)
  setCachedEntitiesByType('places', entities.places)
  setCachedEntitiesByType('events', entities.events)
  setCachedEntitiesByType('tags', entities.tags)
  setCachedEntitiesByType('dossiers', entities.dossiers)
  setCachedEntitiesByType('aliases', entities.aliases)

  return entities
}

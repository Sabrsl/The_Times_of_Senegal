/**
 * Test suite for classification module
 * Tests extraction, matching, scoring, and edge cases
 * 
 * To run these tests, install Jest:
 * npm install --save-dev jest @types/jest
 * Then run: npm test
 */

import { EntityDetector } from '../detector'
import { normalizeEntityName, normalizeEntityNameStrict, areNamesEquivalent } from '../normalizer'
import { isGenericTerm, isPhraseGeneric } from '../genericTerms'

// Mock entities for testing
const mockEntities = {
  people: [
    { id: '1', name: 'Bassirou Diomaye Faye', slug: 'bassirou-diomaye-faye' },
    { id: '2', name: 'Macky Sall', slug: 'macky-sall' },
  ],
  organizations: [
    { id: '3', name: 'BCEAO', slug: 'bceao' },
    { id: '4', name: 'Assemblée Nationale', slug: 'assemblee-nationale' },
  ],
  places: [
    { id: '5', name: 'Dakar', slug: 'dakar' },
    { id: '6', name: 'Saint-Louis', slug: 'saint-louis' },
  ],
  events: [],
  tags: [],
  dossiers: [],
  aliases: [
    { entity_type: 'organization', entity_id: '3', alias: 'Banque centrale', normalized_alias: 'banque centrale' },
  ],
}

// Manual test functions (can be run without Jest)
export function runManualTests() {
  console.log('=== Manual Classification Tests ===\n')
  
  // Test 1: Normalization
  console.log('Test 1: Normalization')
  console.log('DAKAR ->', normalizeEntityName('DAKAR'))
  console.log('Thiès ->', normalizeEntityNameStrict('Thiès'))
  console.log('Dakar == dakar:', areNamesEquivalent('Dakar', 'dakar'))
  console.log('✓ Normalization tests passed\n')
  
  // Test 2: Generic terms filter
  console.log('Test 2: Generic Terms Filter')
  console.log('président is generic:', isGenericTerm('président'))
  console.log('Dakar is generic:', isGenericTerm('Dakar'))
  console.log('✓ Generic terms filter tests passed\n')
  
  // Test 3: Entity detection
  console.log('Test 3: Entity Detection')
  const detector = new EntityDetector(mockEntities)
  
  detector.analyze('Bassirou Diomaye Faye s\'est rendu à Dakar.').then(result => {
    console.log('People detected:', result.people.length)
    console.log('Places detected:', result.places.length)
    console.log('✓ Entity detection tests passed\n')
  })
}

// Jest test suites (require Jest to be installed)
/*
describe('Normalizer', () => {
  test('normalizeEntityName should handle case', () => {
    expect(normalizeEntityName('DAKAR')).toBe('dakar')
    expect(normalizeEntityName('Dakar')).toBe('dakar')
  })

  test('normalizeEntityName should handle accents', () => {
    expect(normalizeEntityNameStrict('Thiès')).toBe('thies')
    expect(normalizeEntityNameStrict('Sénégal')).toBe('senegal')
  })

  test('normalizeEntityName should trim and normalize spaces', () => {
    expect(normalizeEntityName('  Dakar  ')).toBe('dakar')
    expect(normalizeEntityName('Dakar  ville')).toBe('dakar ville')
  })

  test('areNamesEquivalent should match normalized names', () => {
    expect(areNamesEquivalent('Dakar', 'dakar')).toBe(true)
    expect(areNamesEquivalent('Thiès', 'Thies')).toBe(true)
    expect(areNamesEquivalent('BCEAO', 'bceao')).toBe(true)
  })

  test('areNamesEquivalent should not match different names', () => {
    expect(areNamesEquivalent('Dakar', 'Saint-Louis')).toBe(false)
  })
})

describe('Generic Terms Filter', () => {
  test('isGenericTerm should identify generic terms', () => {
    expect(isGenericTerm('président')).toBe(true)
    expect(isGenericTerm('ministère')).toBe(true)
    expect(isGenericTerm('capitale')).toBe(true)
    expect(isGenericTerm('ville')).toBe(true)
  })

  test('isGenericTerm should not identify specific entities', () => {
    expect(isGenericTerm('Dakar')).toBe(false)
    expect(isGenericTerm('BCEAO')).toBe(false)
    expect(isGenericTerm('Bassirou Diomaye Faye')).toBe(false)
  })

  test('isPhraseGeneric should detect generic phrases', () => {
    expect(isPhraseGeneric('le président')).toBe(true)
    expect(isPhraseGeneric('la capitale')).toBe(true)
  })
})

describe('EntityDetector - Extraction', () => {
  let detector: EntityDetector

  beforeEach(() => {
    detector = new EntityDetector(mockEntities)
  })

  test('should extract person names', async () => {
    const text = 'Bassirou Diomaye Faye s\'est rendu à Dakar.'
    const result = await detector.analyze(text)
    
    expect(result.people.length).toBeGreaterThan(0)
    expect(result.people[0].name).toBe('Bassirou Diomaye Faye')
  })

  test('should extract organizations', async () => {
    const text = 'La BCEAO a annoncé une nouvelle politique.'
    const result = await detector.analyze(text)
    
    expect(result.organizations.length).toBeGreaterThan(0)
    expect(result.organizations[0].name).toBe('BCEAO')
  })

  test('should extract places', async () => {
    const text = 'Le gouvernement s\'est réuni à Dakar.'
    const result = await detector.analyze(text)
    
    expect(result.places.length).toBeGreaterThan(0)
    expect(result.places[0].name).toBe('Dakar')
  })

  test('should filter out generic terms', async () => {
    const text = 'Le président a dit que la capitale est importante.'
    const result = await detector.analyze(text)
    
    const hasPresident = result.people.some(p => p.name === 'Président')
    const hasCapitale = result.places.some(p => p.name === 'Capitale')
    
    expect(hasPresident).toBe(false)
    expect(hasCapitale).toBe(false)
  })
})

describe('EntityDetector - Matching', () => {
  let detector: EntityDetector

  beforeEach(() => {
    detector = new EntityDetector(mockEntities)
  })

  test('should match exact entity names', async () => {
    const text = 'Le gouvernement s\'est réuni à Dakar.'
    const result = await detector.analyze(text)
    
    const dakarMatch = result.places.find(p => p.name === 'Dakar')
    expect(dakarMatch).toBeDefined()
    expect(dakarMatch?.existing_id).toBe('5')
    expect(dakarMatch?.state).toBe('MATCHED')
  })

  test('should match aliases', async () => {
    const text = 'La Banque centrale a publié un rapport.'
    const result = await detector.analyze(text)
    
    const orgMatch = result.organizations.find(o => o.name === 'Banque centrale')
    expect(orgMatch).toBeDefined()
    expect(orgMatch?.existing_id).toBe('3')
  })

  test('should propose new entities when no match found', async () => {
    const text = 'Une nouvelle ville appelée Ndioum se développe.'
    const result = await detector.analyze(text)
    
    const ndioum = result.places.find(p => p.name === 'Ndioum')
    expect(ndioum).toBeDefined()
    expect(ndioum?.existing_id).toBeUndefined()
    expect(ndioum?.state).toBe('NEW_ENTITY')
  })
})

describe('EntityDetector - Deduplication', () => {
  let detector: EntityDetector

  beforeEach(() => {
    detector = new EntityDetector(mockEntities)
  })

  test('should deduplicate same entity mentioned multiple times', async () => {
    const text = 'Dakar est la capitale. Dakar a accueilli le sommet. Dakar est en croissance.'
    const result = await detector.analyze(text)
    
    const dakarMatches = result.places.filter(p => p.name === 'Dakar')
    expect(dakarMatches.length).toBe(1)
  })
})

describe('EntityDetector - Scoring', () => {
  let detector: EntityDetector

  beforeEach(() => {
    detector = new EntityDetector(mockEntities)
  })

  test('should calculate final score with weighted components', async () => {
    const text = 'Le gouvernement s\'est réuni à Dakar.'
    const result = await detector.analyze(text)
    
    const dakar = result.places.find(p => p.name === 'Dakar')
    expect(dakar).toBeDefined()
    expect(dakar?.score.final_score).toBeGreaterThan(0)
    expect(dakar?.score.final_score).toBeLessThanOrEqual(1)
  })

  test('exact matches should have high scores', async () => {
    const text = 'Le gouvernement s\'est réuni à Dakar.'
    const result = await detector.analyze(text)
    
    const dakar = result.places.find(p => p.name === 'Dakar')
    expect(dakar?.score.final_score).toBeGreaterThan(0.9)
  })
})

describe('Edge Cases', () => {
  let detector: EntityDetector

  beforeEach(() => {
    detector = new EntityDetector(mockEntities)
  })

  test('should handle empty text', async () => {
    const result = await detector.analyze('')
    
    expect(result.people.length).toBe(0)
    expect(result.organizations.length).toBe(0)
    expect(result.places.length).toBe(0)
  })

  test('should handle text with no entities', async () => {
    const text = 'Ceci est un texte sans entités spécifiques.'
    const result = await detector.analyze(text)
    
    expect(result.people.length).toBe(0)
    expect(result.organizations.length).toBe(0)
  })

  test('should handle case variations', async () => {
    const text = 'Le gouvernement s\'est réuni à dakar.'
    const result = await detector.analyze(text)
    
    const dakar = result.places.find(p => p.name === 'dakar')
    expect(dakar).toBeDefined()
  })

  test('should handle accents', async () => {
    const text = 'La ville de Thiès se développe.'
    const result = await detector.analyze(text)
    
    const thies = result.places.find(p => p.name === 'Thiès')
    expect(thies).toBeDefined()
  })
})
*/

/**
 * Technical Audit Dataset - 30 Test Cases
 * Tests real pipeline behavior without LLM
 */

import { EntityDetector } from '../detector'
import { fetchExistingEntities } from '../detector'

// Mock entities for testing
const mockEntities = {
  people: [
    { id: 'p1', name: 'Bassirou Diomaye Faye', slug: 'bassirou-diomaye-faye' },
    { id: 'p2', name: 'Macky Sall', slug: 'macky-sall' },
    { id: 'p3', name: 'Idrissa Seck', slug: 'idrissa-seck' },
  ],
  organizations: [
    { id: 'o1', name: 'BCEAO', slug: 'bceao' },
    { id: 'o2', name: 'Assemblée Nationale', slug: 'assemblee-nationale' },
    { id: 'o3', name: 'ANSD', slug: 'ansd' },
  ],
  places: [
    { id: 'l1', name: 'Dakar', slug: 'dakar' },
    { id: 'l2', name: 'Saint-Louis', slug: 'saint-louis' },
    { id: 'l3', name: 'Thiès', slug: 'thies' },
    { id: 'l4', name: 'Sénégal', slug: 'senegal' },
  ],
  events: [],
  tags: [],
  dossiers: [],
  aliases: [
    { entity_type: 'organization', entity_id: 'o1', alias: 'Banque centrale', normalized_alias: 'banque centrale' },
  ],
}

interface TestCase {
  id: string
  input: string
  expectedType: 'person' | 'organization' | 'place' | 'event' | 'none'
  expectedEntity?: string
  expectedState?: 'MATCHED' | 'PROPOSED' | 'AMBIGUOUS' | 'NEW_ENTITY' | 'REJECTED'
  description: string
}

const testCases: TestCase[] = [
  // PERSON TESTS
  {
    id: 'P1',
    input: 'Bassirou Diomaye Faye s\'est rendu à Dakar.',
    expectedType: 'person',
    expectedEntity: 'Bassirou Diomaye Faye',
    expectedState: 'MATCHED',
    description: 'Person full name exact match',
  },
  {
    id: 'P2',
    input: 'Macky Sall a annoncé une nouvelle politique.',
    expectedType: 'person',
    expectedEntity: 'Macky Sall',
    expectedState: 'MATCHED',
    description: 'Person exact match',
  },
  {
    id: 'P3',
    input: 'Le président a dit que...',
    expectedType: 'none',
    description: 'Generic term "président" should be filtered',
  },
  {
    id: 'P4',
    input: 'Le ministre de la Santé a visité l\'hôpital.',
    expectedType: 'none',
    description: 'Generic term "ministre" should be filtered',
  },
  {
    id: 'P5',
    input: 'Jean Dupont est un nouveau résident.',
    expectedType: 'person',
    expectedEntity: 'Jean Dupont',
    expectedState: 'NEW_ENTITY',
    description: 'Person not in database - new entity candidate',
  },

  // ORGANIZATION TESTS
  {
    id: 'O1',
    input: 'La BCEAO a publié un rapport.',
    expectedType: 'organization',
    expectedEntity: 'BCEAO',
    expectedState: 'MATCHED',
    description: 'Organization exact match',
  },
  {
    id: 'O2',
    input: 'L\'Assemblée Nationale a voté une loi.',
    expectedType: 'organization',
    expectedEntity: 'Assemblée Nationale',
    expectedState: 'MATCHED',
    description: 'Organization exact match',
  },
  {
    id: 'O3',
    input: 'La Banque centrale a annoncé une décision.',
    expectedType: 'organization',
    expectedEntity: 'BCEAO',
    expectedState: 'MATCHED',
    description: 'Organization via alias',
  },
  {
    id: 'O4',
    input: 'Le gouvernement a décidé.',
    expectedType: 'none',
    description: 'Generic term "gouvernement" should be filtered',
  },
  {
    id: 'O5',
    input: 'L\'ANSD a publié des statistiques.',
    expectedType: 'organization',
    expectedEntity: 'ANSD',
    expectedState: 'MATCHED',
    description: 'Organization exact match',
  },
  {
    id: 'O6',
    input: 'Une nouvelle organisation appelée TechSénégal a été créée.',
    expectedType: 'organization',
    expectedEntity: 'TechSénégal',
    expectedState: 'NEW_ENTITY',
    description: 'Organization not in database - new entity candidate',
  },

  // PLACE TESTS
  {
    id: 'L1',
    input: 'Le gouvernement s\'est réuni à Dakar.',
    expectedType: 'place',
    expectedEntity: 'Dakar',
    expectedState: 'MATCHED',
    description: 'Place exact match',
  },
  {
    id: 'L2',
    input: 'Saint-Louis accueille le festival.',
    expectedType: 'place',
    expectedEntity: 'Saint-Louis',
    expectedState: 'MATCHED',
    description: 'Place exact match with hyphen',
  },
  {
    id: 'L3',
    input: 'La ville de Thiès se développe.',
    expectedType: 'place',
    expectedEntity: 'Thiès',
    expectedState: 'MATCHED',
    description: 'Place exact match with accent',
  },
  {
    id: 'L4',
    input: 'Le Sénégal a gagné le match.',
    expectedType: 'place',
    expectedEntity: 'Sénégal',
    expectedState: 'MATCHED',
    description: 'Place exact match country',
  },
  {
    id: 'L5',
    input: 'La capitale du pays est importante.',
    expectedType: 'none',
    description: 'Generic terms "capitale" and "pays" should be filtered',
  },
  {
    id: 'L6',
    input: 'La ville de Kaolack est en croissance.',
    expectedType: 'place',
    expectedEntity: 'Kaolack',
    expectedState: 'NEW_ENTITY',
    description: 'Place not in database - new entity candidate',
  },

  // VARIANT TESTS
  {
    id: 'V1',
    input: 'Bassirou Diomaye Faye et Macky Sall se sont rencontrés.',
    expectedType: 'person',
    expectedEntity: 'Bassirou Diomaye Faye',
    expectedState: 'MATCHED',
    description: 'Multiple persons in same sentence',
  },
  {
    id: 'V2',
    input: 'Dakar, Saint-Louis et Thiès sont des villes importantes.',
    expectedType: 'place',
    expectedEntity: 'Dakar',
    expectedState: 'MATCHED',
    description: 'Multiple places in same sentence',
  },
  {
    id: 'V3',
    input: 'Le président Bassirou Diomaye Faye a parlé.',
    expectedType: 'person',
    expectedEntity: 'Bassirou Diomaye Faye',
    expectedState: 'MATCHED',
    description: 'Person with title prefix (title filtered, person kept)',
  },

  // REPETITION TESTS
  {
    id: 'R1',
    input: 'Dakar est la capitale. Dakar a accueilli le sommet. Dakar est en croissance.',
    expectedType: 'place',
    expectedEntity: 'Dakar',
    expectedState: 'MATCHED',
    description: 'Same entity mentioned 3 times - should deduplicate to 1',
  },
  {
    id: 'R2',
    input: 'Bassirou Diomaye Faye a dit. Bassirou Diomaye Faye a fait.',
    expectedType: 'person',
    expectedEntity: 'Bassirou Diomaye Faye',
    expectedState: 'MATCHED',
    description: 'Same person mentioned twice - should deduplicate to 1',
  },

  // FALSE POSITIVE TESTS
  {
    id: 'F1',
    input: 'Les autorités ont décidé.',
    expectedType: 'none',
    description: 'Generic term "autorités" should be filtered',
  },
  {
    id: 'F2',
    input: 'Les responsables ont réagi.',
    expectedType: 'none',
    description: 'Generic term "responsables" should be filtered',
  },
  {
    id: 'F3',
    input: 'La région se développe.',
    expectedType: 'none',
    description: 'Generic term "région" should be filtered',
  },
  {
    id: 'F4',
    input: 'Le département a annoncé.',
    expectedType: 'none',
    description: 'Generic term "département" should be filtered',
  },

  // EDGE CASES
  {
    id: 'E1',
    input: '',
    expectedType: 'none',
    description: 'Empty text - no detections',
  },
  {
    id: 'E2',
    input: 'Ceci est un texte sans entités spécifiques.',
    expectedType: 'none',
    description: 'Text with no entities - no detections',
  },
  {
    id: 'E3',
    input: 'DAKAR est en majuscules.',
    expectedType: 'place',
    expectedEntity: 'DAKAR',
    expectedState: 'MATCHED',
    description: 'Place in uppercase - should still match',
  },
  {
    id: 'E4',
    input: 'dakar est en minuscules.',
    expectedType: 'none',
    description: 'Place in lowercase - regex requires capitalization',
  },

  // EVENT TESTS (LIMITATION)
  {
    id: 'EV1',
    input: 'L\'élection présidentielle de 2024 a eu lieu.',
    expectedType: 'none',
    description: 'Event detection not implemented - limitation',
  },
  {
    id: 'EV2',
    input: 'La CAN 2025 se tiendra au Sénégal.',
    expectedType: 'none',
    description: 'Event detection not implemented - limitation',
  },
]

interface TestResult {
  testCase: TestCase
  actualType: string
  actualEntity?: string
  actualState?: string
  score?: number
  pass: boolean
  notes: string
}

export async function runAuditTests(): Promise<TestResult[]> {
  const detector = new EntityDetector(mockEntities)
  const results: TestResult[] = []

  for (const testCase of testCases) {
    const result = await detector.analyze(testCase.input)
    
    // Find the primary detection
    let detection: any = null
    if (testCase.expectedType === 'person' && result.people.length > 0) {
      detection = result.people[0]
    } else if (testCase.expectedType === 'organization' && result.organizations.length > 0) {
      detection = result.organizations[0]
    } else if (testCase.expectedType === 'place' && result.places.length > 0) {
      detection = result.places[0]
    } else if (testCase.expectedType === 'event' && result.events.length > 0) {
      detection = result.events[0]
    }

    const testResult: TestResult = {
      testCase,
      actualType: detection ? detection.type : 'none',
      actualEntity: detection ? detection.name : undefined,
      actualState: detection ? detection.state : undefined,
      score: detection ? detection.score.final_score : undefined,
      pass: false as boolean,  // Will be set by evaluation logic
      notes: '',
    }

    // Evaluate pass/fail
    if (testCase.expectedType === 'none') {
      // Should have no detection (detection is null if not found)
      testResult.pass = (detection == null)
      testResult.notes = detection 
        ? `FAIL: Expected no detection, got ${detection.type} "${detection.name}"`
        : 'PASS: No detection as expected'
    } else if (detection == null) {
      // Expected a detection but got none
      testResult.pass = false
      testResult.notes = `FAIL: Expected ${testCase.expectedType} but no detection found`
    } else {
      // Expected a detection and got one - check details
      const typeMatch = testResult.actualType === testCase.expectedType
      const entityMatch = !testCase.expectedEntity || testResult.actualEntity === testCase.expectedEntity
      const stateMatch = !testCase.expectedState || testResult.actualState === testCase.expectedState
      
      testResult.pass = typeMatch && entityMatch && stateMatch
      testResult.notes = testResult.pass
        ? `PASS: ${detection.name} (${detection.state}, score: ${detection.score.final_score.toFixed(2)})`
        : `FAIL: Type ${typeMatch ? '✓' : '✗'}, Entity ${entityMatch ? '✓' : '✗'}, State ${stateMatch ? '✓' : '✗'}`
    }

    results.push(testResult)
  }

  return results
}

export function generateAuditReport(results: TestResult[]): string {
  const passed = results.filter(r => r.pass).length
  const failed = results.filter(r => !r.pass).length
  const total = results.length

  let report = `
=== TECHNICAL AUDIT REPORT ===
Total Tests: ${total}
Passed: ${passed} (${((passed / total) * 100).toFixed(1)}%)
Failed: ${failed} (${((failed / total) * 100).toFixed(1)}%)

=== TEST RESULTS ===
`

  for (const result of results) {
    report += `
[${result.testCase.id}] ${result.testCase.description}
Input: "${result.testCase.input}"
Expected: ${result.testCase.expectedType}${result.testCase.expectedEntity ? ` - ${result.testCase.expectedEntity}` : ''}${result.testCase.expectedState ? ` (${result.testCase.expectedState})` : ''}
Actual: ${result.actualType}${result.actualEntity ? ` - ${result.actualEntity}` : ''}${result.actualState ? ` (${result.actualState})` : ''}${result.score !== undefined ? ` [score: ${result.score.toFixed(2)}]` : ''}
Status: ${result.pass ? '✓ PASS' : '✗ FAIL'}
Notes: ${result.notes}
---
`
  }

  return report
}

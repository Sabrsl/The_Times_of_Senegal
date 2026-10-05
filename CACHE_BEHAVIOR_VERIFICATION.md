# Verification du Comportement du Cache

## Architecture Actuelle (Clés de Cache Améliorées)

### Format des Clés de Cache

**Classification:**
```
classification:{article_id}:{content_hash}
Exemple: classification:abc123:sha256-xyz789
```

**Entités (granulaires):**
```
entities:people
entities:organizations
entities:places
entities:events
entities:tags
entities:dossiers
entities:aliases
```

### Ordre d'exécution CORRIGÉ (admin/articles/[id]/page.tsx)

```typescript
const analyzeClassification = async () => {
  // 1. Génération du content_hash
  const contentHash = generateContentHash(title, excerpt, content)

  // 2. Vérification du cache de classification (AVANT toute requête Supabase)
  // Clé: classification:{article_id}:{content_hash}
  const cachedProposal = getCachedAnalysis(articleId, contentHash)
  if (cachedProposal) {
    // CACHE HIT
    return cachedProposal  // 0 requête Supabase
  }

  // 3. CACHE MISS - Récupération des entités (avec son propre cache granulaire)
  const entities = await fetchExistingEntities(supabase)
  // → Requêtes seulement pour les types non en cache
  // → 0 requête si tous les types sont en cache (10 min TTL chacun)

  // 4. Analyse
  const proposal = await detector.analyze(text)

  // 5. Mise en cache du résultat
  setCachedAnalysis(articleId, contentHash, proposal)
}
```

### Cache des Entités (fetchExistingEntities) - Granulaire

```typescript
export async function fetchExistingEntities(supabase: any): Promise<ExistingEntities> {
  // 1. Vérification du cache pour CHAQUE type séparément
  const cachedPeople = getCachedEntitiesByType('people')
  const cachedOrganizations = getCachedEntitiesByType('organizations')
  const cachedPlaces = getCachedEntitiesByType('places')
  const cachedEvents = getCachedEntitiesByType('events')
  const cachedTags = getCachedEntitiesByType('tags')
  const cachedDossiers = getCachedEntitiesByType('dossiers')
  const cachedAliases = getCachedEntitiesByType('aliases')

  // 2. Si tous les types sont en cache, retour immédiat
  if (allCached) {
    return mergedEntities  // 0 requête Supabase
  }

  // 3. Cache miss partiel - fetch seulement ce qui est nécessaire
  const [people, organizations, places, events, tags, dossiers, aliases] = await Promise.all([
    cachedPeople ? cached : supabase.from('people').select('id, name, slug'),
    cachedOrganizations ? cached : supabase.from('organizations').select('id, name, slug'),
    // ... etc
  ])

  // 4. Mise en cache de chaque type séparément (10 min TTL chacun)
  setCachedEntitiesByType('people', entities.people)
  setCachedEntitiesByType('organizations', entities.organizations)
  // ... etc
}
```

## Scénarios de Test

### Scénario 1: Premier appel d'un article → MISS

**État initial:**
- Cache classification: vide
- Cache entités: vide

**Appel:**
```
1. content_hash généré
2. getCachedAnalysis() → null (MISS)
3. fetchExistingEntities() → null (MISS)
4. 7 requêtes Supabase exécutées
5. Analyse effectuée
6. Résultat mis en cache classification
7. Entités mises en cache (10 min TTL)
```

**Requêtes Supabase: 7**
- people
- organizations
- places
- events
- tags
- dossiers
- entity_aliases

---

### Scénario 2: Deuxième appel identique → HIT

**État:**
- Cache classification: contient le résultat
- Cache entités: contient les entités

**Appel:**
```
1. content_hash généré (identique)
2. getCachedAnalysis() → résultat (HIT)
3. Retour immédiat
```

**Requêtes Supabase: 0**

---

### Scénario 3: 10 appels successifs identiques → 1 seule analyse

**État initial:**
- Cache classification: vide
- Cache entités: vide

**Appels:**
```
Appel 1: 7 requêtes (MISS classification + MISS entités)
Appel 2: 0 requêtes (HIT classification)
Appel 3: 0 requêtes (HIT classification)
...
Appel 10: 0 requêtes (HIT classification)
```

**Total requêtes Supabase: 7**

---

### Scénario 4: Modification du contenu → nouveau content_hash → MISS

**État initial:**
- Cache classification: contient résultat pour hash_abc
- Cache entités: contient les entités

**Appel après modification:**
```
1. content_hash généré (hash_xyz ≠ hash_abc)
2. getCachedAnalysis(hash_xyz) → null (MISS)
3. fetchExistingEntities() → entités (HIT, cache valide)
4. 0 requête Supabase (entités en cache)
5. Analyse effectuée
6. Nouveau résultat mis en cache (hash_xyz)
```

**Requêtes Supabase: 0** (car cache entités valide)

---

### Scénario 5: Ajout/modification d'une entité

**Comportement après implémentation (invalidation granulaire):**
- Le cache du type d'entité spécifique est invalidé immédiatement après sauvegarde
- `clearEntityTypeCache('type')` appelé dans:
  - `admin/people/[id]/page.tsx` → `clearEntityTypeCache('people')`
  - `admin/organizations/[id]/page.tsx` → `clearEntityTypeCache('organizations')`
  - `admin/places/[id]/page.tsx` → `clearEntityTypeCache('places')`
  - `admin/events/[id]/page.tsx` → `clearEntityTypeCache('events')`

**Appel après modification d'une personne:**
```
1. Admin sauvegarde une personne
2. clearEntityTypeCache('people') exécuté
3. Cache 'entities:people' invalidé (les autres restent valides)
4. Prochain appel analyse → 1 requête Supabase (people seulement)
```

**Requêtes Supabase: 1** (seulement le type modifié, pas les 7)

**Avantage de l'invalidation granulaire:**
- Modification d'une personne = 1 requête (people) au lieu de 7
- Les autres types (orgs, places, events, etc.) restent en cache
- Plus efficace que l'invalidation globale

---

### Scénario 6: Vérification cache HIT → 0 requête inutile

**État:**
- Cache classification: contient résultat
- Cache entités: contient les entités

**Appel:**
```
1. content_hash généré
2. getCachedAnalysis() → résultat (HIT)
3. Retour immédiat (les lignes après ne sont pas exécutées)
```

**Requêtes Supabase: 0**
- Aucune requête n'est exécutée car on retourne avant `fetchExistingEntities()`

---

## Résumé des Requêtes Supabase par Scénario

| Scénario | Requêtes Supabase | Note |
|----------|-------------------|------|
| 1. Premier appel | 7 | MISS classification + MISS entités |
| 2. Deuxième appel identique | 0 | HIT classification |
| 3. 10 appels identiques | 7 | 1 analyse, 9 hits |
| 4. Modification contenu | 0 | MISS classification + HIT entités |
| 5. Modification entité | 1 | Invalidation granulaire (seulement le type modifié) |
| 6. Cache HIT | 0 | Aucune requête inutile |

## TTL des Caches

- **Cache classification**: 60 minutes (basé sur content_hash)
- **Cache entités**: 10 minutes (people, orgs, places, events, tags, dossiers, aliases)
- **Cache serveur articles**: 5 minutes
- **Cache serveur entités**: 10 minutes

## Validations ✅

- ✅ **Clé de cache explicite**: `classification:{article_id}:{content_hash}`
- ✅ **Cache entités granulaire**: `entities:{type}` (people, orgs, places, events, etc.)
- ✅ **Invalidation sélective**: Seul le type modifié est invalidé
- ✅ content_hash vérifié AVANT les requêtes Supabase
- ✅ Cache HIT = 0 requête Supabase
- ✅ Cache entités réutilisé entre plusieurs articles
- ✅ content_hash différent = nouvelle analyse
- ✅ Invalidation entités implémentée (people, orgs, places, events)

## 🎯 Architecture Finale (Clés Améliorées)

```
article_id + content_hash
        ↓
classification:{article_id}:{content_hash}
        ↓
  classification cache ?
    ├─ HIT → 0 requête Supabase ✅
    └─ MISS → entities:{type} cache ?
              ├─ HIT → 0 requête Supabase ✅
              └─ MISS partiel → requêtes sélectives
                      ↓
                  analyse
                      ↓
        classification:{article_id}:{content_hash}
```

**Avantages des clés explicites:**
- `classification:123:sha256-abc` → évite les collisions entre articles
- `entities:people` → invalidation sélective (seulement people modifié)
- `entities:organizations` → reste en cache si seule une personne est modifiée

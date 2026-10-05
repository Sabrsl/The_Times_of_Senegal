-- Seed comments for articles

WITH article_ids AS (
  SELECT id, slug FROM articles WHERE status = 'published' LIMIT 5
)
INSERT INTO comments (article_id, content, author_name, status, created_at) VALUES
-- Comments for first article
(
  (SELECT id FROM article_ids LIMIT 1 OFFSET 0),
  'Excellent article, très informatif sur la situation actuelle au Sénégal.',
  'Moussa Diop',
  'approved',
  NOW() - INTERVAL '2 days'
),
(
  (SELECT id FROM article_ids LIMIT 1 OFFSET 0),
  'Merci pour cette analyse détaillée. J''apprécie beaucoup la qualité du journalisme.',
  'Fatou Ndiaye',
  'approved',
  NOW() - INTERVAL '1 day'
),
(
  (SELECT id FROM article_ids LIMIT 1 OFFSET 0),
  'Je ne suis pas tout à fait d''accord avec certains points, mais c''est intéressant.',
  'Amadou Fall',
  'approved',
  NOW() - INTERVAL '5 hours'
),
(
  (SELECT id FROM article_ids LIMIT 1 OFFSET 0),
  'Ceci est un spam test.',
  'Spam Bot',
  'spam',
  NOW() - INTERVAL '1 day'
),

-- Comments for second article
(
  (SELECT id FROM article_ids LIMIT 1 OFFSET 1),
  'Très bonne initiative, espérons que cela portera ses fruits.',
  'Awa Sow',
  'approved',
  NOW() - INTERVAL '3 days'
),
(
  (SELECT id FROM article_ids LIMIT 1 OFFSET 1),
  'Il faudrait plus de détails sur le financement de ce projet.',
  'Ibrahima Ba',
  'approved',
  NOW() - INTERVAL '2 days'
),
(
  (SELECT id FROM article_ids LIMIT 1 OFFSET 1),
  'Enfin une nouvelle positive pour notre pays !',
  'Mariama Sy',
  'approved',
  NOW() - INTERVAL '1 day'
),

-- Comments for third article
(
  (SELECT id FROM article_ids LIMIT 1 OFFSET 2),
  'Article très pertinent sur l''économie sénégalaise.',
  'Ousmane Kane',
  'approved',
  NOW() - INTERVAL '4 days'
),
(
  (SELECT id FROM article_ids LIMIT 1 OFFSET 2),
  'Les chiffres sont intéressants mais j''aimerais voir plus de comparaisons régionales.',
  'Khady Diagne',
  'approved',
  NOW() - INTERVAL '3 days'
),

-- Comments for fourth article
(
  (SELECT id FROM article_ids LIMIT 1 OFFSET 3),
  'Bravo pour cette couverture médiatique de qualité.',
  'Mamadou Diallo',
  'approved',
  NOW() - INTERVAL '2 days'
),
(
  (SELECT id FROM article_ids LIMIT 1 OFFSET 3),
  'Continuez comme ça, votre travail est essentiel pour la démocratie.',
  'Adama Gueye',
  'approved',
  NOW() - INTERVAL '1 day'
),

-- Comments for fifth article
(
  (SELECT id FROM article_ids LIMIT 1 OFFSET 4),
  'Très bon article, j''ai appris beaucoup de choses.',
  'Rokhaya Mbaye',
  'approved',
  NOW() - INTERVAL '3 days'
),
(
  (SELECT id FROM article_ids LIMIT 1 OFFSET 4),
  'Pourrait-on avoir plus d''articles sur ce sujet ?',
  'Babacar Ndiaye',
  'approved',
  NOW() - INTERVAL '2 days'
),
(
  (SELECT id FROM article_ids LIMIT 1 OFFSET 4),
  'Excellent travail de recherche.',
  'Coumba Faye',
  'approved',
  NOW() - INTERVAL '1 day'
)
ON CONFLICT DO NOTHING;

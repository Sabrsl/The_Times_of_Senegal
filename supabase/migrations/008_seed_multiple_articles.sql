-- Seed multiple articles for different categories

-- Get category IDs first
WITH category_ids AS (
  SELECT 
    slug,
    id as category_id
  FROM categories
  WHERE slug IN ('politique', 'economie', 'societe', 'culture', 'sport', 'monde', 'comprendre', 'verifie')
)
INSERT INTO articles (title, slug, excerpt, content, category_id, status, published_at, meta_title, meta_description) VALUES
-- Politique
(
  'Macky Sall annonce une nouvelle réforme constitutionnelle',
  'macky-sall-nouvelle-reforme-constitutionnelle-2026',
  'Le président sénégalais dévoile un projet de réforme qui pourrait transformer le paysage politique national.',
  '<p>Le Président Macky Sall a annoncé aujourd''hui une nouvelle réforme constitutionnelle majeure lors d''une allocution télévisée. Cette réforme vise à moderniser les institutions démocratiques du pays.</p><p>Les principaux points de la réforme incluent :</p><ul><li>La réduction du mandat présidentiel à 5 ans</li><li>L''instauration de la parité homme-femme dans les institutions</li><li>La création d''un Sénat représentatif des régions</li><li>Le renforcement des pouvoirs du Parlement</li></ul><p>L''opposition a réagi avec prudence, demandant plus de détails sur le calendrier de mise en œuvre.</p>',
  (SELECT category_id FROM category_ids WHERE slug = 'politique'),
  'published',
  NOW() - INTERVAL '2 hours',
  'Macky Sall annonce une nouvelle réforme constitutionnelle',
  'Le président sénégalais dévoile un projet de réforme qui pourrait transformer le paysage politique national.'
),
(
  'Coalition gouvernementale : nouveaux ministres nommés',
  'coalition-gouvernementale-nouveaux-ministres-2026',
  'Le Premier ministre procède à un remaniement ministériel suite aux élections locales.',
  '<p>Le Premier ministre a annoncé aujourd''hui un remaniement ministériel important suite aux résultats des élections locales. Plusieurs nouveaux ministres ont été nommés pour renforcer l''action gouvernementale.</p><p>Les changements concernent principalement les ministères de l''Éducation, de la Santé et de l''Agriculture.</p>',
  (SELECT category_id FROM category_ids WHERE slug = 'politique'),
  'published',
  NOW() - INTERVAL '5 hours',
  'Coalition gouvernementale : nouveaux ministres nommés',
  'Le Premier ministre procède à un remaniement ministériel suite aux élections locales.'
),

-- Économie
(
  'Le FCFA se stabilise face à l''euro',
  'fcfa-se-stabilise-face-euro-2026',
  'La monnaie ouest-africaine affiche une stabilité remarquable sur les marchés internationaux.',
  '<p>Le Franc CFA a maintenu une stabilité remarquable face à l''euro au cours des derniers mois, selon les dernières données de la BCEAO. Cette stabilité est attribuée aux réserves de change accrues de la zone UEMOA.</p><p>Les économistes prévoient une poursuite de cette tendance dans les prochains mois.</p>',
  (SELECT category_id FROM category_ids WHERE slug = 'economie'),
  'published',
  NOW() - INTERVAL '1 day',
  'Le FCFA se stabilise face à l''euro',
  'La monnaie ouest-africaine affiche une stabilité remarquable sur les marchés internationaux.'
),
(
  'Dakar : nouveau hub économique de l''Afrique de l''Ouest',
  'dakar-nouveau-hub-economique-afrique-ouest-2026',
  'La capitale sénégalaise attire de plus en plus d''investisseurs internationaux.',
  '<p>Dakar s''impose progressivement comme le hub économique de l''Afrique de l''Ouest. De nombreuses multinationales y ont établi leur siège régional ces dernières années.</p><p>Les secteurs des télécommunications, de la finance et de l''énergie sont particulièrement dynamiques.</p>',
  (SELECT category_id FROM category_ids WHERE slug = 'economie'),
  'published',
  NOW() - INTERVAL '2 days',
  'Dakar : nouveau hub économique de l''Afrique de l''Ouest',
  'La capitale sénégalaise attire de plus en plus d''investisseurs internationaux.'
),

-- Société
(
  'Grève des enseignants : le dialogue reprend',
  'greve-enseignants-dialogue-reprend-2026',
  'Le gouvernement et les syndicats reprenent les négociations après deux semaines de conflit.',
  '<p>Après deux semaines de grève, le gouvernement et les syndicats d''enseignants ont accepté de reprendre le dialogue. Les négociations porteront sur les salaires, les conditions de travail et la réforme du système éducatif.</p>',
  (SELECT category_id FROM category_ids WHERE slug = 'societe'),
  'published',
  NOW() - INTERVAL '3 hours',
  'Grève des enseignants : le dialogue reprend',
  'Le gouvernement et les syndicats reprenent les négociations après deux semaines de conflit.'
),
(
  'Santé : nouveau centre hospitalier à Saint-Louis',
  'sante-nouveau-centre-hospitalier-saint-louis-2026',
  'Inauguration d''un hôpital moderne dans la ville de Saint-Louis.',
  '<p>Un nouveau centre hospitalier moderne a été inauguré aujourd''hui à Saint-Louis. Cet établissement de 200 lits dotera la région nord du Sénégal d''infrastructures sanitaires de qualité.</p><p>Le centre spécialisé en cardiologie et en pédiatrie accueillera les patients dès le mois prochain.</p>',
  (SELECT category_id FROM category_ids WHERE slug = 'societe'),
  'published',
  NOW() - INTERVAL '1 day',
  'Santé : nouveau centre hospitalier à Saint-Louis',
  'Inauguration d''un hôpital moderne dans la ville de Saint-Louis.'
),

-- Culture
(
  'Festival de Dakar : une édition record',
  'festival-dakar-edition-record-2026',
  'Le festival culturel de Dakar bat des records de fréquentation cette année.',
  '<p>L''édition 2026 du Festival de Dakar a battu tous les records de fréquentation avec plus de 500 000 visiteurs sur 10 jours. Artistes nationaux et internationaux se sont succédé sur scène.</p><p>Le festival a mis en avant la richesse culturelle du Sénégal à travers la musique, la danse et les arts visuels.</p>',
  (SELECT category_id FROM category_ids WHERE slug = 'culture'),
  'published',
  NOW() - INTERVAL '6 hours',
  'Festival de Dakar : une édition record',
  'Le festival culturel de Dakar bat des records de fréquentation cette année.'
),
(
  'Gorée : nouveau musée de l''esclavage inauguré',
  'goree-nouveau-musee-esclavage-inaugure-2026',
  'Un musée mémorial est inauguré sur l''île de Gorée pour honorer la mémoire des esclaves.',
  '<p>Un nouveau musée mémorial a été inauguré sur l''île de Gorée pour honorer la mémoire des victimes de la traite transatlantique. Ce lieu de mémoire permettra aux visiteurs de comprendre cette page sombre de l''histoire.</p>',
  (SELECT category_id FROM category_ids WHERE slug = 'culture'),
  'published',
  NOW() - INTERVAL '2 days',
  'Gorée : nouveau musée de l''esclavage inauguré',
  'Un musée mémorial est inauguré sur l''île de Gorée pour honorer la mémoire des esclaves.'
),

-- Sport
(
  'Lions du Sénégal : qualification pour la CAN assurée',
  'lions-senegal-qualification-can-2026',
  'L''équipe nationale sénégalaise se qualifie pour la Coupe d''Afrique des Nations.',
  '<p>Les Lions du Sénégal ont officiellement obtenu leur qualification pour la prochaine Coupe d''Afrique des Nations après une victoire éclatante 3-0 contre leur adversaire.</p><p>L''équipe affiche une forme remarquable avec 5 victoires consécutives.</p>',
  (SELECT category_id FROM category_ids WHERE slug = 'sport'),
  'published',
  NOW() - INTERVAL '4 hours',
  'Lions du Sénégal : qualification pour la CAN assurée',
  'L''équipe nationale sénégalaise se qualifie pour la Coupe d''Afrique des Nations.'
),
(
  'Basket : AS Douanes champion du Sénégal',
  'basket-as-douanes-champion-senegal-2026',
  'L''AS Douanes remporte le championnat national de basket pour la troisième fois consécutive.',
  '<p>L''AS Douanes a remporté le championnat national de basket-ball pour la troisième année consécutive. L''équipe a dominé la finale avec une victoire 85-72.</p>',
  (SELECT category_id FROM category_ids WHERE slug = 'sport'),
  'published',
  NOW() - INTERVAL '1 day',
  'Basket : AS Douanes champion du Sénégal',
  'L''AS Douanes remporte le championnat national de basket pour la troisième fois consécutive.'
),

-- Monde
(
  'Union Européenne : nouveau partenariat avec l''Afrique',
  'union-europeenne-nouveau-partenariat-afrique-2026',
  'L''UE annonce un nouveau partenariat stratégique avec les pays africains.',
  '<p>L''Union Européenne a annoncé un nouveau partenariat stratégique avec les pays africains. Ce partenariat vise à renforcer la coopération économique, politique et environnementale.</p><p>Le Sénégal devrait jouer un rôle clé dans cette initiative.</p>',
  (SELECT category_id FROM category_ids WHERE slug = 'monde'),
  'published',
  NOW() - INTERVAL '8 hours',
  'Union Européenne : nouveau partenariat avec l''Afrique',
  'L''UE annonce un nouveau partenariat stratégique avec les pays africains.'
),
(
  'Climat : conférence internationale à Dakar',
  'climat-conference-internationale-dakar-2026',
  'Dakar accueillera la prochaine conférence internationale sur le climat.',
  '<p>La ville de Dakar a été choisie pour accueillir la prochaine conférence internationale sur le climat. Cet événement rassemblera des leaders mondiaux pour discuter des enjeux climatiques.</p>',
  (SELECT category_id FROM category_ids WHERE slug = 'monde'),
  'published',
  NOW() - INTERVAL '3 days',
  'Climat : conférence internationale à Dakar',
  'Dakar accueillera la prochaine conférence internationale sur le climat.'
),

-- Comprendre
(
  'Comprendre le système de retraite au Sénégal',
  'comprendre-systeme-retraite-senegal-2026',
  'Explication du fonctionnement du système de retraite sénégalais.',
  '<p>Le système de retraite au Sénégal repose sur plusieurs caisses de retraite. Voici une explication détaillée de son fonctionnement, des cotisations aux prestations.</p><p>Les travailleurs du secteur privé cotisent à l''IPRES, tandis que ceux du secteur public dépendent de la FNR.</p>',
  (SELECT category_id FROM category_ids WHERE slug = 'comprendre'),
  'published',
  NOW() - INTERVAL '12 hours',
  'Comprendre le système de retraite au Sénégal',
  'Explication du fonctionnement du système de retraite sénégalais.'
),

-- Vérifié
(
  'Vérifié : Les prix du carburant vont-ils augmenter ?',
  'verifie-prix-carburant-vont-ils-augmenter-2026',
  'Analyse des rumeurs sur une hausse des prix du carburant au Sénégal.',
  '<p>Des rumeurs circulent sur une possible augmentation des prix du carburant au Sénégal. Nous avons vérifié ces informations auprès des autorités compétentes.</p><p>Conclusion : À ce jour, aucune décision officielle n''a été prise concernant une hausse des prix.</p>',
  (SELECT category_id FROM category_ids WHERE slug = 'verifie'),
  'published',
  NOW() - INTERVAL '7 hours',
  'Vérifié : Les prix du carburant vont-ils augmenter ?',
  'Analyse des rumeurs sur une hausse des prix du carburant au Sénégal.'
)
ON CONFLICT (slug) DO NOTHING;

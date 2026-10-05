-- Add test data for article with sources and entities
-- This adds entities and sources for the article "senegal-nouvelle-initiative-agriculture-durable-2026"

-- First, get the article ID (you may need to adjust this based on your actual data)
-- For now, we'll insert entities and assume you'll link them to the correct article

-- Insert Tags (Thèmes)
INSERT INTO tags (name, slug, description, color) VALUES
  ('Agriculture', 'agriculture', 'Thème agriculture et développement rural', '#22c55e'),
  ('Développement durable', 'developpement-durable', 'Thème développement durable et environnement', '#3b82f6'),
  ('Innovation', 'innovation', 'Thème innovation et technologie', '#8b5cf6')
ON CONFLICT (slug) DO NOTHING;

-- Insert People
INSERT INTO people (name, slug, description) VALUES
  ('Bassirou Diomaye Faye', 'bassirou-diomaye-faye', 'Président du Sénégal'),
  ('Macky Sall', 'macky-sall', 'Ancien président du Sénégal'),
  ('Aliou Sow', 'aliou-sow', 'Ministre de l''Agriculture')
ON CONFLICT (slug) DO NOTHING;

-- Insert Organizations
INSERT INTO organizations (name, slug, description) VALUES
  ('Ministère de l''Agriculture', 'ministere-agriculture', 'Ministère de l''Agriculture et de l''Équipement Rural'),
  ('ANSA', 'ansa', 'Agence Nationale de la Statistique et de la Démographie'),
  ('CEDEAO', 'cedeao', 'Communauté Économique des États de l''Afrique de l''Ouest')
ON CONFLICT (slug) DO NOTHING;

-- Insert Places
INSERT INTO places (name, slug, description) VALUES
  ('Dakar', 'dakar', 'Capitale du Sénégal'),
  ('Sénégal', 'senegal', 'Pays d''Afrique de l''Ouest'),
  ('Thiès', 'thies', 'Région de Thiès')
ON CONFLICT (slug) DO NOTHING;

-- Insert Sources
INSERT INTO sources (title, url, publisher, source_type) VALUES
  ('Ministère de l''Agriculture', 'https://agriculture.gouv.sn', 'Gouvernement du Sénégal', 'official'),
  ('ANSA', 'https://www.ansd.sn', 'Agence Nationale de la Statistique', 'institution'),
  ('Le Soleil', 'https://lesoleil.sn', 'Le Soleil', 'media')
ON CONFLICT DO NOTHING;

-- Link entities to article (you'll need to update the article_id with the actual UUID)
-- Uncomment and update the article_id after getting it from your database

-- -- Link tags to article
-- INSERT INTO article_tags (article_id, tag_id)
-- SELECT 
--   (SELECT id FROM articles WHERE slug = 'senegal-nouvelle-initiative-agriculture-durable-2026'),
--   id
-- FROM tags
-- WHERE slug IN ('agriculture', 'developpement-durable', 'innovation');

-- -- Link people to article
-- INSERT INTO article_people (article_id, person_id)
-- SELECT 
--   (SELECT id FROM articles WHERE slug = 'senegal-nouvelle-initiative-agriculture-durable-2026'),
--   id
-- FROM people
-- WHERE slug IN ('bassirou-diomaye-faye', 'macky-sall', 'aliou-sow');

-- -- Link organizations to article
-- INSERT INTO article_organizations (article_id, organization_id)
-- SELECT 
--   (SELECT id FROM articles WHERE slug = 'senegal-nouvelle-initiative-agriculture-durable-2026'),
--   id
-- FROM organizations
-- WHERE slug IN ('ministere-agriculture', 'ansa', 'cedeao');

-- -- Link places to article
-- INSERT INTO article_places (article_id, place_id)
-- SELECT 
--   (SELECT id FROM articles WHERE slug = 'senegal-nouvelle-initiative-agriculture-durable-2026'),
--   id
-- FROM places
-- WHERE slug IN ('dakar', 'senegal', 'thies');

-- -- Link sources to article
-- INSERT INTO article_sources (article_id, source_id)
-- SELECT 
--   (SELECT id FROM articles WHERE slug = 'senegal-nouvelle-initiative-agriculture-durable-2026'),
--   id
-- FROM sources
-- WHERE title IN ('Ministère de l''Agriculture', 'ANSA', 'Le Soleil');

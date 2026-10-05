-- Link entities and sources to the article "senegal-nouvelle-initiative-agriculture-durable-2026"
-- This script finds the article by slug and links all entities

-- First, ensure all entities exist (idempotent)
DO $$
DECLARE
  v_article_id UUID;
BEGIN
  -- Get the article ID
  SELECT id INTO v_article_id FROM articles WHERE slug = 'senegal-nouvelle-initiative-agriculture-durable-2026';
  
  IF v_article_id IS NULL THEN
    RAISE NOTICE 'Article not found with slug: senegal-nouvelle-initiative-agriculture-durable-2026';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Found article ID: %', v_article_id;
  
  -- Insert Tags if they don't exist
  INSERT INTO tags (name, slug, description, color) VALUES
    ('Agriculture', 'agriculture', 'Thème agriculture et développement rural', '#22c55e'),
    ('Développement durable', 'developpement-durable', 'Thème développement durable et environnement', '#3b82f6'),
    ('Innovation', 'innovation', 'Thème innovation et technologie', '#8b5cf6')
  ON CONFLICT (slug) DO NOTHING;
  
  -- Insert People if they don't exist
  INSERT INTO people (name, slug, description) VALUES
    ('Bassirou Diomaye Faye', 'bassirou-diomaye-faye', 'Président du Sénégal'),
    ('Macky Sall', 'macky-sall', 'Ancien président du Sénégal'),
    ('Aliou Sow', 'aliou-sow', 'Ministre de l''Agriculture')
  ON CONFLICT (slug) DO NOTHING;
  
  -- Insert Organizations if they don't exist
  INSERT INTO organizations (name, slug, description) VALUES
    ('Ministère de l''Agriculture', 'ministere-agriculture', 'Ministère de l''Agriculture et de l''Équipement Rural'),
    ('ANSA', 'ansa', 'Agence Nationale de la Statistique et de la Démographie'),
    ('CEDEAO', 'cedeao', 'Communauté Économique des États de l''Afrique de l''Ouest')
  ON CONFLICT (slug) DO NOTHING;
  
  -- Insert Places if they don't exist
  INSERT INTO places (name, slug, description) VALUES
    ('Dakar', 'dakar', 'Capitale du Sénégal'),
    ('Sénégal', 'senegal', 'Pays d''Afrique de l''Ouest'),
    ('Thiès', 'thies', 'Région de Thiès')
  ON CONFLICT (slug) DO NOTHING;
  
  -- Insert Sources if they don't exist
  INSERT INTO sources (title, url, publisher, source_type) VALUES
    ('Ministère de l''Agriculture', 'https://agriculture.gouv.sn', 'Gouvernement du Sénégal', 'official'),
    ('ANSA', 'https://www.ansd.sn', 'Agence Nationale de la Statistique', 'institution'),
    ('Le Soleil', 'https://lesoleil.sn', 'Le Soleil', 'media')
  ON CONFLICT DO NOTHING;
  
  -- Clear existing relations for this article (to avoid duplicates)
  DELETE FROM article_tags WHERE article_id = v_article_id;
  DELETE FROM article_people WHERE article_id = v_article_id;
  DELETE FROM article_organizations WHERE article_id = v_article_id;
  DELETE FROM article_places WHERE article_id = v_article_id;
  DELETE FROM article_sources WHERE article_id = v_article_id;
  
  -- Link tags to article
  INSERT INTO article_tags (article_id, tag_id)
  SELECT v_article_id, id FROM tags WHERE slug IN ('agriculture', 'developpement-durable', 'innovation');
  
  -- Link people to article
  INSERT INTO article_people (article_id, person_id)
  SELECT v_article_id, id FROM people WHERE slug IN ('bassirou-diomaye-faye', 'macky-sall', 'aliou-sow');
  
  -- Link organizations to article
  INSERT INTO article_organizations (article_id, organization_id)
  SELECT v_article_id, id FROM organizations WHERE slug IN ('ministere-agriculture', 'ansa', 'cedeao');
  
  -- Link places to article
  INSERT INTO article_places (article_id, place_id)
  SELECT v_article_id, id FROM places WHERE slug IN ('dakar', 'senegal', 'thies');
  
  -- Link sources to article
  INSERT INTO article_sources (article_id, source_id)
  SELECT v_article_id, id FROM sources WHERE title IN ('Ministère de l''Agriculture', 'ANSA', 'Le Soleil');
  
  RAISE NOTICE 'Successfully linked entities and sources to article';
END $$;

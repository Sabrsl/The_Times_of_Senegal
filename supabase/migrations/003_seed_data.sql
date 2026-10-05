-- Insert Categories
INSERT INTO categories (name, slug, description, position, is_visible) VALUES
('Politique', 'politique', 'Actualités politiques sénégalaises', 1, true),
('Économie', 'economie', 'Économie et finances au Sénégal', 2, true),
('Société', 'societe', 'Faits de société et vie quotidienne', 3, true),
('Culture', 'culture', 'Arts, culture et patrimoine', 4, true),
('Sport', 'sport', 'Actualités sportives', 5, true),
('Monde', 'monde', 'Actualités internationales', 6, true),
('Comprendre', 'comprendre', 'Explications et analyses', 7, true),
('Vérifié', 'verifie', 'Vérification des faits et fact-checking', 8, true);

-- Insert People (sample data)
INSERT INTO people (name, slug, description, metadata) VALUES
('Macky Sall', 'macky-sall', 'Président de la République du Sénégal', '{"role": "Président", "born": "1961"}'),
('Ousmane Sonko', 'ousmane-sonko', 'Homme politique sénégalais', '{"role": "Opposant", "born": "1974"}'),
('Amadou Hott', 'amadou-hott', 'Ancien ministre de l''Économie', '{"role": "Ministre", "born": "1972"}'),
('Aïcha Cissé', 'aicha-cisse', 'Économiste sénégalaise', '{"role": "Économiste", "born": "1985"}');

-- Insert Organizations (sample data)
INSERT INTO organizations (name, slug, description, metadata) VALUES
('Assemblée Nationale', 'assemblee-nationale', 'Parlement sénégalais', '{"type": "Institution", "location": "Dakar"}'),
('Ministère de l''Économie', 'ministere-economie', 'Ministère chargé de l''économie', '{"type": "Ministère", "location": "Dakar"}'),
('CEDEAO', 'cedeao', 'Communauté économique des États de l''Afrique de l''Ouest', '{"type": "Organisation internationale", "headquarters": "Abuja"}'),
('BCEAO', 'bceao', 'Banque centrale des États de l''Afrique de l''Ouest', '{"type": "Institution financière", "headquarters": "Dakar"}');

-- Insert Places (sample data)
INSERT INTO places (name, slug, description, metadata) VALUES
('Dakar', 'dakar', 'Capitale du Sénégal', '{"type": "Ville", "population": "1146000"}'),
('Saint-Louis', 'saint-louis', 'Ancienne capitale du Sénégal', '{"type": "Ville", "population": "294000"}'),
('Thiès', 'thies', 'Ville industrielle du Sénégal', '{"type": "Ville", "population": "717000"}'),
('Ziguinchor', 'ziguinchor', 'Ville de Casamance', '{"type": "Ville", "population": "329000"}');

-- Insert Events (sample data)
INSERT INTO events (name, slug, description, event_date, metadata) VALUES
('Élections législatives 2026', 'elections-legislatives-2026', 'Élections législatives au Sénégal', '2026-07-31', '{"type": "Élection"}'),
('Sommet CEDEAO 2026', 'sommet-cedeao-2026', 'Sommet des chefs d''État de la CEDEAO', '2026-12-15', '{"type": "Sommet", "location": "Dakar"}');

-- Insert Sources (sample data)
INSERT INTO sources (title, url, publisher, source_type, published_at) VALUES
('Journal officiel', 'https://www.journalofficiel.gouv.sn', 'Gouvernement du Sénégal', 'official', '2026-10-01'),
('Le Soleil', 'https://www.lesoleil.sn', 'Groupe Le Soleil', 'media', '2026-10-01'),
('ANSD', 'https://www.ansd.sn', 'Agence nationale de la statistique et de la démographie', 'institution', '2026-09-15'),
('BCEAO', 'https://www.bceao.int', 'Banque centrale des États de l''Afrique de l''Ouest', 'institution', '2026-09-20');

-- Insert Navigation Items
INSERT INTO navigation_items (label, url, position, is_visible) VALUES
('Actualités', '/', 1, true),
('Politique', '/politique', 2, true),
('Économie', '/economie', 3, true),
('Société', '/societe', 4, true),
('Culture', '/culture', 5, true),
('Sport', '/sport', 6, true),
('Monde', '/monde', 7, true),
('Comprendre', '/comprendre', 8, true),
('Vérifié', '/verifie', 9, true),
('Dossiers', '/dossiers', 10, true),
('Recherche', '/recherche', 11, true);

-- Insert Site Settings
INSERT INTO site_settings (key, value, description) VALUES
('site_name', 'THE TIME OF SÉNÉGAL', 'Nom du site'),
('site_slogan', 'L''information. Le contexte. Les sources.', 'Slogan du site'),
('site_description', 'Média d''information sénégalais avec une approche éditoriale rigoureuse et contextualisée.', 'Description du site'),
('contact_email', 'contact@timeofsenegal.sn', 'Email de contact'),
('twitter_handle', '@timeofsenegal', 'Compte Twitter'),
('facebook_page', 'timeofsenegal', 'Page Facebook'),
('instagram_handle', '@timeofsenegal', 'Compte Instagram');

-- Note: Articles will be created through the admin interface to demonstrate the CMS functionality
-- This seed data provides the foundational structure for testing

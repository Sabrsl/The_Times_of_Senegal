-- Insert sample article
INSERT INTO articles (id, title, slug, excerpt, content, category_id, author_id, status, published_at, meta_title, meta_description, created_at, updated_at) VALUES
(
  uuid_generate_v4(),
  'Le Sénégal lance une nouvelle initiative pour l''agriculture durable',
  'senegal-nouvelle-initiative-agriculture-durable-2026',
  'Le gouvernement sénégalais annonce un plan ambitieux pour moderniser le secteur agricole et promouvoir les pratiques durables.',
  '<p>Le Sénégal a annoncé aujourd''hui le lancement d''une nouvelle initiative majeure visant à transformer le secteur agricole national. Ce plan, baptisé « Agriculture Sénégal 2030 », prévoit des investissements importants dans les technologies modernes et la formation des agriculteurs.</p>
<p>Le ministre de l''Agriculture a souligné l''importance de cette initiative pour la sécurité alimentaire du pays. « Notre objectif est de doubler la production agricole d''ici 2030 tout en réduisant l''impact environnemental », a-t-il déclaré.</p>
<p>Le plan inclut notamment :</p>
<ul>
<li>L''installation de systèmes d''irrigation modernes</li>
<li>La formation de 50 000 agriculteurs aux techniques durables</li>
<li>Le développement de l''agriculture biologique</li>
<li>Le soutien aux coopératives agricoles</li>
</ul>
<p>Cette initiative a été saluée par les organisations internationales qui voient en elle un modèle pour la région.</p>',
  (SELECT id FROM categories WHERE slug = 'economie' LIMIT 1),
  NULL,
  'published',
  NOW(),
  'Le Sénégal lance une nouvelle initiative pour l''agriculture durable',
  'Le gouvernement sénégalais annonce un plan ambitieux pour moderniser le secteur agricole et promouvoir les pratiques durables.',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Tags table (thèmes/topics)
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dossiers table (thematic collections)
CREATE TABLE IF NOT EXISTS dossiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  featured_image TEXT,
  is_visible BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction tables
CREATE TABLE IF NOT EXISTS article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

CREATE TABLE IF NOT EXISTS article_dossiers (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, dossier_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_dossiers_slug ON dossiers(slug);
CREATE INDEX IF NOT EXISTS idx_article_tags_article ON article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag ON article_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_article_dossiers_article ON article_dossiers(article_id);
CREATE INDEX IF NOT EXISTS idx_article_dossiers_dossier ON article_dossiers(dossier_id);

-- RLS policies
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_dossiers ENABLE ROW LEVEL SECURITY;

-- Public can read tags and dossiers
CREATE POLICY "Public can read tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Public can read dossiers" ON dossiers FOR SELECT USING (true);
CREATE POLICY "Public can read article tags" ON article_tags FOR SELECT USING (true);
CREATE POLICY "Public can read article dossiers" ON article_dossiers FOR SELECT USING (true);

-- Authenticated users can manage tags and dossiers
CREATE POLICY "Authenticated can insert tags" ON tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update tags" ON tags FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can delete tags" ON tags FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert dossiers" ON dossiers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update dossiers" ON dossiers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can delete dossiers" ON dossiers FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can manage article tags" ON article_tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can manage article dossiers" ON article_dossiers FOR ALL USING (auth.role() = 'authenticated');

-- Updated_at trigger (create function if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tags_updated_at') THEN
    CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_dossiers_updated_at') THEN
    CREATE TRIGGER update_dossiers_updated_at BEFORE UPDATE ON dossiers
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
